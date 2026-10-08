import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BoardKind, BoardFilter, PostDraft } from "@/lib/board";

export class BoardError extends Error {
  constructor(message: string, public status = 502, public code = "BOARD_ERROR") { super(message); }
}
const headers = { "Cache-Control": "private, no-store", "Expires": "0", "Pragma": "no-cache" };

export async function boardResponse(action: () => Promise<unknown>, status = 200) {
  try { return NextResponse.json(await action(), { status, headers }); }
  catch (error) {
    const failure = error instanceof BoardError ? error : new BoardError("게시판에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return NextResponse.json({ error: failure.message, code: failure.code }, { status: failure.status, headers });
  }
}

export function boardKind(value: string): BoardKind {
  if (value !== "free" && value !== "qna") throw new BoardError("게시판을 찾을 수 없습니다.", 404, "NOT_FOUND");
  return value;
}
export function boardId(value: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new BoardError("게시글을 찾을 수 없습니다.", 404, "NOT_FOUND");
  return value;
}
export function boardPage(value: string | null): number {
  if (value === null) return 1;
  if (!/^\d{1,6}$/.test(value) || Number(value) < 1) throw new BoardError("페이지를 확인해 주세요.", 400, "INVALID_INPUT");
  return Number(value);
}
export function boardFilter(value: string | null): BoardFilter {
  if (!value) return "ALL";
  if (!["ALL", "WAITING", "SOLVED"].includes(value)) throw new BoardError("조회 조건을 확인해 주세요.", 400, "INVALID_INPUT");
  return value as BoardFilter;
}
export function field(value: unknown, name: string, max: number, required = false): string {
  if (value === undefined && !required) return "";
  if (typeof value !== "string" || value.includes("\0") || value.trim().length > max || (required && !value.trim())) {
    throw new BoardError(`${name}을 확인해 주세요. 최대 ${max}자까지 입력할 수 있습니다.`, 400, "INVALID_INPUT");
  }
  return value.trim();
}
export async function readBoardBody(request: NextRequest): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new BoardError("입력 형식을 확인해 주세요.", 400, "INVALID_INPUT");
  const content = await request.text();
  if (content.length > 140000) throw new BoardError("입력 내용이 너무 깁니다.", 413, "INPUT_TOO_LARGE");
  try {
    const value: unknown = JSON.parse(content);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new BoardError("입력 내용을 확인해 주세요.", 400, "INVALID_INPUT"); }
}
export function postDraft(body: Record<string, unknown>, board: BoardKind): PostDraft {
  const tags = body.tags ?? [];
  if (!Array.isArray(tags) || tags.length > 8) throw new BoardError("태그는 최대 8개까지 입력해 주세요.", 400, "INVALID_INPUT");
  return {
    category: field(body.category, "말머리", 30) || (board === "free" ? "자유" : "일반 질문"),
    title: field(body.title, "제목", 150, true),
    content: field(body.content, "내용", 10000, true),
    codeSnippet: field(body.codeSnippet, "코드", 10000),
    tags: [...new Set(tags.map((tag) => field(tag, "태그", 30, true)))],
  };
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  // Next.js can build nextUrl with an internal hostname behind a proxy.
  // Use the external request host while retaining its original protocol.
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    || request.headers.get("host")
    || request.nextUrl.host;
  try {
    return new URL(origin).origin === new URL(request.nextUrl.protocol + "//" + host).origin;
  } catch { return false; }
}

export async function boardClient(request: NextRequest, write = false) {
  if (write && !isSameOrigin(request)) throw new BoardError("요청을 확인할 수 없습니다. 사이트에서 다시 시도해 주세요.", 403, "INVALID_ORIGIN");
  const client = await createClient();
  if (!client) throw new BoardError("게시판 연결을 준비 중입니다. 잠시 후 다시 조회해 주세요.", 503, "NOT_CONFIGURED");
  if (write) {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw new BoardError("GitHub 로그인 후 이용해 주세요.", 401, "AUTH_REQUIRED");
  }
  return client;
}
export async function boardRpc(client: NonNullable<Awaited<ReturnType<typeof createClient>>>, name: string, params: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, params);
  if (error) {
    if (["PGRST202", "PGRST205", "42P01", "42883"].includes(error.code)) throw new BoardError("게시판 연결을 준비 중입니다. 잠시 후 다시 조회해 주세요.", 503, "NOT_CONFIGURED");
    if (error.code === "42501") throw new BoardError("이 작업을 할 권한이 없습니다.", 403, "FORBIDDEN");
    if (error.code === "P0002" || error.code === "23503") throw new BoardError("게시글이나 댓글을 찾을 수 없습니다. 새로고침해 주세요.", 404, "NOT_FOUND");
    if (["22023", "23514", "22001"].includes(error.code)) throw new BoardError("입력 내용을 확인해 주세요.", 400, "INVALID_INPUT");
    throw new BoardError("게시판 정보를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  return data;
}
