import type { NextRequest } from "next/server";
import { boardResponse, boardKind, boardId, boardClient, boardRpc } from "@/lib/board-server";
export async function DELETE(request: NextRequest, context: { params: Promise<{ board: string; id: string; commentId: string }> }) {
  return boardResponse(async () => {
    const params = await context.params;
    return boardRpc(await boardClient(request, true), "portal_delete_comment", { p_board: boardKind(params.board), p_id: boardId(params.id), p_comment_id: boardId(params.commentId) });
  });
}
