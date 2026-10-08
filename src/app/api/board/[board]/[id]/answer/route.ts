import type { NextRequest } from "next/server";
import { boardResponse, boardKind, boardId, boardClient, boardRpc, readBoardBody, BoardError } from "@/lib/board-server";
export async function POST(request: NextRequest, context: { params: Promise<{ board: string; id: string }> }) {
  return boardResponse(async () => {
    const params = await context.params;
    if (boardKind(params.board) !== "qna") throw new BoardError("질문게시판에서만 답변을 채택할 수 있습니다.", 400, "INVALID_INPUT");
    const client = await boardClient(request, true);
    const body = await readBoardBody(request);
    if (body.commentId !== null && typeof body.commentId !== "string") throw new BoardError("답변을 확인해 주세요.", 400, "INVALID_INPUT");
    return boardRpc(client, "portal_accept_answer", { p_id: boardId(params.id), p_comment_id: body.commentId === null ? null : boardId(body.commentId as string) });
  });
}
