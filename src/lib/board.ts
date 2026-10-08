export type BoardKind = "free" | "qna";
export type BoardFilter = "ALL" | "WAITING" | "SOLVED";

export interface BoardPost {
  id: string;
  board: BoardKind;
  category: string;
  title: string;
  content: string;
  codeSnippet: string;
  tags: string[];
  author: string;
  createdAt: string;
  status: "WAITING" | "SOLVED";
  likes: number;
  liked: boolean;
  commentCount: number;
  isOwner: boolean;
}
export interface BoardComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isOwner: boolean;
  isPostAuthor: boolean;
  isAccepted: boolean;
}
export interface BoardList {
  posts: BoardPost[];
  total: number;
  page: number;
  pageSize: number;
}
export interface BoardDetail {
  post: BoardPost;
  comments: BoardComment[];
  commentPage: number;
  commentPages: number;
}
export interface PostDraft {
  category: string;
  title: string;
  content: string;
  codeSnippet: string;
  tags: string[];
}

export function boardDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date);
}
