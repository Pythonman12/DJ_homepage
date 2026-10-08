import type { NextRequest } from "next/server";
import { boardResponse, boardKind, boardClient, boardRpc, boardPage, boardFilter, field, readBoardBody, postDraft } from "@/lib/board-server";

type Context = { params: Promise<{ board: string }> };
export async function GET(request: NextRequest, context: Context) {
  return boardResponse(async () => {
    const board = boardKind((await context.params).board);
    const page = boardPage(request.nextUrl.searchParams.get("page"));
    const search = field(request.nextUrl.searchParams.get("search") ?? "", "검색어", 100);
    const status = boardFilter(request.nextUrl.searchParams.get("status"));
    return boardRpc(await boardClient(request), "portal_list_posts", { p_board: board, p_page: page, p_search: search, p_status: status });
  });
}
export async function POST(request: NextRequest, context: Context) {
  return boardResponse(async () => {
    const board = boardKind((await context.params).board);
    const client = await boardClient(request, true);
    const draft = postDraft(await readBoardBody(request), board);
    return boardRpc(client, "portal_create_post", { p_board: board, p_category: draft.category, p_title: draft.title, p_content: draft.content, p_code: draft.codeSnippet, p_tags: draft.tags });
  }, 201);
}
