import type { NextRequest } from "next/server";
import { boardResponse, boardKind, boardId, boardClient, boardRpc, boardPage } from "@/lib/board-server";
type Context = { params: Promise<{ board: string; id: string }> };
export async function GET(request: NextRequest, context: Context) {
  return boardResponse(async () => {
    const params = await context.params;
    return boardRpc(await boardClient(request), "portal_get_post", { p_board: boardKind(params.board), p_id: boardId(params.id), p_comment_page: boardPage(request.nextUrl.searchParams.get("comments")) });
  });
}
export async function DELETE(request: NextRequest, context: Context) {
  return boardResponse(async () => {
    const params = await context.params;
    return boardRpc(await boardClient(request, true), "portal_delete_post", { p_board: boardKind(params.board), p_id: boardId(params.id) });
  });
}
