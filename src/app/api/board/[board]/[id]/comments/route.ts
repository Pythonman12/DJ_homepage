import type { NextRequest } from "next/server";
import { boardResponse, boardKind, boardId, boardClient, boardRpc, readBoardBody, field } from "@/lib/board-server";
export async function POST(request: NextRequest, context: { params: Promise<{ board: string; id: string }> }) {
  return boardResponse(async () => {
    const params = await context.params;
    const client = await boardClient(request, true);
    const body = await readBoardBody(request);
    return boardRpc(client, "portal_add_comment", { p_board: boardKind(params.board), p_id: boardId(params.id), p_content: field(body.content, "댓글", 3000, true) });
  }, 201);
}
