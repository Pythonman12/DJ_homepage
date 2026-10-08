import type { Metadata } from "next";
import "./globals.css";

// Render current Korea dates on each request, rather than freezing them at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "대진전자통신고등학교 학생 포털",
  description: "대진전자통신고등학교 통합 학생 포털 (급식, 시간표, 학사일정, 취업·진학, 익명 커뮤니티)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
