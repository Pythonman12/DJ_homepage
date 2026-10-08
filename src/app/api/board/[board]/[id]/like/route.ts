import type { NextRequest } from "next/server";
import { boardResponse, boardKind, boardId, boardClient, boardRpc, readBoardBody, BoardError } from "@/lib/board-server";
export async function POST(request: NextRequest, context: { params: Promise<{ board: string; id: string }> }) {
  return boardResponse(async () => {
    const params = await context.params;
    const client = await boardClient(request, true);
    const body = await readBoardBody(request);
    if (typeof body.liked !== "boolean") throw new BoardError("추천 상태를 확인해 주세요.", 400, "INVALID_INPUT");
    return boardRpc(client, "portal_set_like", { p_board: boardKind(params.board), p_id: boardId(params.id), p_liked: body.liked });
  });
}
