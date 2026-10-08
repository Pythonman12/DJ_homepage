"use client";

import BoardView, { type BoardViewProps } from "@/components/BoardView";

export default function QnABoardView(props: BoardViewProps) {
  return <BoardView board="qna" {...props} />;
}
