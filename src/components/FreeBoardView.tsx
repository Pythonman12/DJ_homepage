"use client";

import BoardView, { type BoardViewProps } from "@/components/BoardView";

export default function FreeBoardView(props: BoardViewProps) {
  return <BoardView board="free" {...props} />;
}
