"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { boardErrorMessage, boardRequest, useBoard, useBoardSearch } from "@/hooks/useBoard";
import { boardDate, type BoardDetail, type BoardFilter, type BoardKind, type BoardList, type BoardPost, type PostDraft } from "@/lib/board";

export interface BoardViewProps {
  isLoggedIn?: boolean;
  userId?: string;
  onOpenLogin?: () => void;
}
const card = "rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900";
const button = "rounded border border-gray-200 dark:border-zinc-700 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed";
const primary = "rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed";
const input = "w-full rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

export default function BoardView({ board, isLoggedIn = false, userId, onOpenLogin }: BoardViewProps & { board: BoardKind }) {
  const isQna = board === "qna";
  const [search, setSearch] = useState("");
  const query = useBoardSearch(search);
  const [status, setStatus] = useState<BoardFilter>("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [commentPage, setCommentPage] = useState(1);
  const [writing, setWriting] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const mutation = useRef(false);
  const identity = isLoggedIn ? (userId ?? "signed-in") : "guest";
  const base = "/api/board/" + board;
  const params = new URLSearchParams({ page: String(page), search: query, status });
  const list = useBoard<BoardList>(base + "?" + params, identity);
  const detail = useBoard<BoardDetail>(
    selectedId ? base + "/" + selectedId + "?comments=" + commentPage : null,
    identity,
  );
  const post = detail.data?.post;
  const closeWriter = useCallback(() => setWriting(false), []);

  function requireLogin() {
    if (isLoggedIn) return true;
    onOpenLogin?.();
    return false;
  }
  async function write<T>(url: string, method: "POST" | "DELETE", body?: unknown) {
    if (mutation.current) throw new Error("A request is already in progress.");
    mutation.current = true;
    setBusy(true);
    setActionError(null);
    try {
      const data = await boardRequest<T>(url, {
        method,
        ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
      });
      list.reload();
      detail.reload();
      return data;
    } catch (error) {
      setActionError(boardErrorMessage(error));
      throw error;
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  async function savePost(draft: PostDraft) {
    if (!requireLogin()) throw new Error("Sign in required.");
    const saved = await write<BoardPost>(base, "POST", draft);
    setWriting(false);
    setPage(1);
    setCommentPage(1);
    setComment("");
    setSelectedId(saved.id);
  }
  async function addComment(event: FormEvent) {
    event.preventDefault();
    if (!requireLogin() || !selectedId || busy || !comment.trim()) return;
    try {
      await write(base + "/" + selectedId + "/comments", "POST", { content: comment });
      setComment("");
      setCommentPage(1);
    } catch { /* The message is displayed above the board. */ }
  }
  async function deletePost() {
    if (!post?.isOwner || busy || !window.confirm("이 글과 댓글을 삭제할까요?")) return;
    try {
      await write(base + "/" + post.id, "DELETE");
      setSelectedId(null);
    } catch { /* Keep the post visible if deletion failed. */ }
  }
  async function deleteComment(id: string) {
    if (!post || busy || !window.confirm("이 댓글을 삭제할까요?")) return;
    try { await write(base + "/" + post.id + "/comments/" + id, "DELETE"); }
    catch { /* The message is displayed above the board. */ }
  }
  async function toggleLike() {
    if (!requireLogin() || !post || busy) return;
    try { await write(base + "/" + post.id + "/like", "POST", { liked: !post.liked }); }
    catch { /* The server remains the source of truth. */ }
  }
  async function acceptAnswer(commentId: string | null) {
    if (!post?.isOwner || busy) return;
    try { await write(base + "/" + post.id + "/answer", "POST", { commentId }); }
    catch { /* The message is displayed above the board. */ }
  }
  function openPost(id: string) {
    setSelectedId(id);
    setCommentPage(1);
    setComment("");
    setActionError(null);
  }
  const currentPage = list.data?.page ?? page;
  const pageCount = list.data ? Math.max(1, Math.ceil(list.data.total / list.data.pageSize)) : 1;

  return (
    <div className="space-y-5">
      <div className={card + " flex flex-wrap items-center justify-between gap-3 p-5"}>
        <div>
          <h2 className="text-xl font-bold">{isQna ? "질문게시판" : "자유게시판"}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            {isQna ? "궁금한 것을 질문하고 답변을 나누세요." : "학교생활과 일상을 자유롭게 나누세요."}
            {" "}글은 모두에게 익명으로 표시됩니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button className={button} onClick={() => { list.reload(); detail.reload(); }}>새로고침</button>
          <button className={primary} onClick={() => { if (requireLogin()) setWriting(true); }}>
            {isQna ? "질문하기" : "글쓰기"}
          </button>
        </div>
      </div>
      {!isLoggedIn && (
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          로그인 없이 글을 읽을 수 있습니다. 글과 {isQna ? "답변" : "댓글"} 작성은{" "}
          <button onClick={onOpenLogin} className="font-semibold text-blue-600 dark:text-blue-400 underline">GitHub 로그인</button>
          {" "}후 이용해 주세요.
        </p>
      )}
      {actionError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <span>{actionError}</span><button onClick={() => setActionError(null)} aria-label="오류 안내 닫기">닫기</button>
        </div>
      )}
      {selectedId ? (
        <>
          <button className={button} onClick={() => { setSelectedId(null); setActionError(null); }}>← 목록으로</button>
          {detail.loading && <BoardNotice message="글을 불러오는 중입니다…" />}
          {detail.error && <BoardNotice message={detail.error} onRetry={detail.reload} error />}
          {post && (
            <>
              <article className={card + " space-y-5 p-5 sm:p-6"}>
                <div className="space-y-3 border-b border-gray-100 pb-4 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-gray-100 px-2 py-1 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">{post.category}</span>
                    {isQna && <StatusBadge status={post.status} />}
                    {post.isOwner && <span className="text-blue-600 dark:text-blue-400">내 글</span>}
                  </div>
                  <h3 className="break-words text-lg font-bold">{post.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{post.author} · {boardDate(post.createdAt)}</p>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-7">{post.content}</p>
                {post.codeSnippet && <pre className="overflow-x-auto rounded bg-zinc-950 p-4 text-xs leading-6 text-zinc-100"><code>{post.codeSnippet}</code></pre>}
                <div className="flex flex-wrap gap-2 text-xs text-blue-600 dark:text-blue-400">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {!isQna && <button className={button + (post.liked ? " text-blue-600 dark:text-blue-400" : "")} aria-pressed={post.liked} disabled={busy} onClick={toggleLike}>좋아요 {post.likes}</button>}
                  <span className="text-xs text-gray-500 dark:text-zinc-400">{isQna ? "답변" : "댓글"} {post.commentCount}</span>
                  {post.isOwner && <button className={button + " text-red-600 dark:text-red-400"} disabled={busy} onClick={deletePost}>글 삭제</button>}
                </div>
              </article>
              <section className={card + " space-y-4 p-5"}>
                <h3 className="text-sm font-bold">{isQna ? "답변" : "댓글"} {post.commentCount}</h3>
                {!detail.data?.comments.length && <p className="text-xs text-gray-500 dark:text-zinc-400">아직 {isQna ? "답변이" : "댓글이"} 없습니다.</p>}
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {detail.data?.comments.map((item) => (
                    <div key={item.id} className={"space-y-2 py-4 " + (item.isAccepted ? "rounded bg-green-50 px-3 dark:bg-green-950/30" : "")}>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={"font-semibold " + (item.isPostAuthor ? "text-blue-600 dark:text-blue-400" : "")}>{item.author}</span>
                          <time className="text-gray-400" dateTime={item.createdAt}>{boardDate(item.createdAt)}</time>
                          {item.isAccepted && <span className="font-semibold text-green-700 dark:text-green-300">채택된 답변</span>}
                        </div>
                        <div className="flex gap-2">
                          {isQna && post.isOwner && <button className="text-blue-600 dark:text-blue-400 disabled:opacity-50" disabled={busy} onClick={() => acceptAnswer(item.isAccepted ? null : item.id)}>{item.isAccepted ? "채택 취소" : "답변 채택"}</button>}
                          {item.isOwner && <button className="text-red-600 dark:text-red-400 disabled:opacity-50" disabled={busy} onClick={() => deleteComment(item.id)}>삭제</button>}
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.content}</p>
                    </div>
                  ))}
                </div>
                {detail.data && detail.data.commentPages > 1 && (
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <button className={button} disabled={detail.data.commentPage <= 1} onClick={() => setCommentPage(detail.data!.commentPage - 1)}>더 최근 {isQna ? "답변" : "댓글"}</button>
                    <span>{detail.data.commentPage} / {detail.data.commentPages}</span>
                    <button className={button} disabled={detail.data.commentPage >= detail.data.commentPages} onClick={() => setCommentPage(detail.data!.commentPage + 1)}>이전 {isQna ? "답변" : "댓글"}</button>
                  </div>
                )}
                <form onSubmit={addComment} className="space-y-2 border-t border-gray-100 pt-4 dark:border-zinc-800">
                  <textarea aria-label={isQna ? "답변 내용" : "댓글 내용"} className={input + " min-h-24 resize-y"} value={comment} maxLength={3000} disabled={!isLoggedIn || busy} placeholder={isLoggedIn ? (isQna ? "도움이 될 답변을 적어 주세요." : "댓글을 적어 주세요.") : "GitHub 로그인 후 작성할 수 있습니다."} onChange={(event) => setComment(event.target.value)} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400">{comment.length} / 3,000</span>
                    {isLoggedIn ? <button type="submit" className={primary} disabled={busy || !comment.trim()}>{busy ? "저장 중…" : (isQna ? "답변 등록" : "댓글 등록")}</button> : <button type="button" className={primary} onClick={onOpenLogin}>로그인하고 작성</button>}
                  </div>
                </form>
              </section>
            </>
          )}
        </>
      ) : (
        <>
          <div className={card + " flex flex-wrap items-center gap-3 p-4"}>
            <input className={input + " min-w-0 flex-1"} aria-label="게시글 검색" type="search" maxLength={100} placeholder="제목·내용·말머리 검색" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
            {isQna && <div className="flex gap-1">{(["ALL", "WAITING", "SOLVED"] as const).map((value) => <button key={value} aria-pressed={status === value} className={status === value ? primary : button} onClick={() => { setStatus(value); setPage(1); }}>{value === "ALL" ? "전체" : value === "WAITING" ? "미해결" : "해결"}</button>)}</div>}
          </div>
          {list.loading && <BoardNotice message="게시글을 불러오는 중입니다…" />}
          {list.error && <BoardNotice message={list.error} onRetry={list.reload} error />}
          {list.data && (
            <>
              <p className="text-xs text-gray-500 dark:text-zinc-400">총 {list.data.total}개 · 새 글은 20초마다 갱신됩니다.</p>
              {!list.data.posts.length ? <BoardNotice message={query || status !== "ALL" ? "조건에 맞는 글이 없습니다." : "아직 글이 없습니다. 첫 글을 남겨 주세요."} /> : (
                <div className={card + " divide-y divide-gray-100 overflow-hidden dark:divide-zinc-800"}>
                  {list.data.posts.map((item) => (
                    <button key={item.id} onClick={() => openPost(item.id)} className="block w-full space-y-2 p-5 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-500 dark:text-zinc-400">{item.category}</span>
                        {isQna && <StatusBadge status={item.status} />}
                        {item.isOwner && <span className="text-blue-600 dark:text-blue-400">내 글</span>}
                      </div>
                      <h3 className="break-words text-sm font-semibold">{item.title}</h3>
                      <p className="line-clamp-2 break-words text-xs leading-5 text-gray-500 dark:text-zinc-400">{item.content}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                        <span>{item.author} · {boardDate(item.createdAt)}</span>
                        <span>{!isQna && "좋아요 " + item.likes + " · "}{isQna ? "답변" : "댓글"} {item.commentCount}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-center gap-4 text-xs">
                <button className={button} disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>이전</button>
                <span>{currentPage} / {pageCount}</span>
                <button className={button} disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>다음</button>
              </div>
            </>
          )}
        </>
      )}
      {writing && <BoardWriter board={board} onClose={closeWriter} onSave={savePost} />}
    </div>
  );
}

function StatusBadge({ status }: { status: BoardPost["status"] }) {
  return <span className={"rounded px-2 py-1 text-[10px] font-semibold " + (status === "SOLVED" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300")}>{status === "SOLVED" ? "해결" : "미해결"}</span>;
}

function BoardNotice({ message, onRetry, error = false }: { message: string; onRetry?: () => void; error?: boolean }) {
  return <div className={card + " flex flex-wrap items-center justify-between gap-3 p-5 text-xs text-gray-500 dark:text-zinc-400"} role={error ? "alert" : "status"}><span>{message}</span>{onRetry && <button className={button} onClick={onRetry}>다시 시도</button>}</div>;
}

function BoardWriter({ board, onClose, onSave }: { board: BoardKind; onClose: () => void; onSave: (draft: PostDraft) => Promise<void> }) {
  const isQna = board === "qna";
  const [category, setCategory] = useState(isQna ? "일반 질문" : "자유");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [tags, setTags] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const dialog = useRef<HTMLDivElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleInput.current?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pendingRef.current) { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), textarea:not(:disabled)");
      if (!elements?.length) { event.preventDefault(); return; }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pendingRef.current) return;
    const parsed = [...new Set(tags.split(/[\s,]+/).map((tag) => tag.replace(/^#+/, "")).filter(Boolean).map((tag) => "#" + tag))];
    if (parsed.length > 8 || parsed.some((tag) => tag.length > 30)) { setError("태그는 최대 8개, 각 30자까지 입력해 주세요."); return; }
    if (!title.trim() || !content.trim()) { setError("제목과 내용을 입력해 주세요."); return; }
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try { await onSave({ category, title, content, codeSnippet, tags: parsed }); }
    catch (failure) { setError(boardErrorMessage(failure)); }
    finally { pendingRef.current = false; setPending(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3" onClick={() => { if (!pending) onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={"board-writer-" + board} className={card + " max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-xl"} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-zinc-800">
          <h3 id={"board-writer-" + board} className="font-bold">{isQna ? "질문 작성" : "글 작성"}</h3>
          <button className={button} onClick={onClose} disabled={pending} aria-label="작성 창 닫기">닫기</button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <fieldset disabled={pending} className="space-y-4">
            <label className="block space-y-1 text-xs font-medium"><span>말머리</span><input className={input} maxLength={30} value={category} onChange={(event) => setCategory(event.target.value)} /></label>
            <label className="block space-y-1 text-xs font-medium"><span>제목</span><input ref={titleInput} className={input} required maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력해 주세요." /></label>
            <label className="block space-y-1 text-xs font-medium"><span>내용</span><textarea className={input + " min-h-48 resize-y"} required maxLength={10000} value={content} onChange={(event) => setContent(event.target.value)} placeholder={isQna ? "궁금한 내용을 자세히 적어 주세요." : "함께 나눌 이야기를 적어 주세요."} /></label>
            {isQna && <label className="block space-y-1 text-xs font-medium"><span>코드 (선택)</span><textarea className={input + " min-h-24 resize-y font-mono"} maxLength={10000} value={codeSnippet} onChange={(event) => setCodeSnippet(event.target.value)} spellCheck={false} placeholder="질문에 필요한 코드를 붙여 넣으세요." /></label>}
            <label className="block space-y-1 text-xs font-medium"><span>태그 (선택 · 최대 8개)</span><input className={input} maxLength={255} value={tags} onChange={(event) => setTags(event.target.value)} placeholder="#학교생활 #동아리" /></label>
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-zinc-800">
            <p className="text-xs text-gray-500 dark:text-zinc-400">등록하면 다른 사람도 볼 수 있습니다.</p>
            <div className="flex gap-2"><button type="button" className={button} disabled={pending} onClick={onClose}>취소</button><button type="submit" className={primary} disabled={pending}>{pending ? "저장 중…" : "등록"}</button></div>
          </div>
        </form>
      </div>
    </div>
  );
}
