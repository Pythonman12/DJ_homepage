# 게시판 공유 저장 설정

자유게시판과 질문게시판의 글·댓글·답변·좋아요·답변 채택을 Supabase 데이터베이스에 저장하도록 구현했습니다. 연결을 완료하면 새로고침하거나 다른 기기로 접속해도 같은 글을 읽을 수 있습니다.

소스 파일은 연결할 준비가 되어 있습니다. 현재 Supabase 공개 키가 비어 있고 데이터베이스에 아래 SQL을 실행하지 않았으므로, 먼저 다음 설정을 완료하세요.

## 1. Supabase 환경변수

[Supabase 프로젝트](https://supabase.com/dashboard/project/iyvkgsqsilgeewcdvjqc)에서 **Settings → API Keys → Publishable key**를 복사하세요.

프로젝트 폴더의 `.env.example`을 복사해 `.env.local`을 만들고 공개 키를 넣습니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://iyvkgsqsilgeewcdvjqc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_복사한키
NEIS_API_KEY=
```

GitHub Client ID·Client Secret은 이 공개 키와 다른 값입니다. Client Secret은 Supabase의 GitHub Provider 설정에만 등록하세요. 로그인 설정은 [AUTH_SETUP.md](AUTH_SETUP.md)를 따르면 됩니다.

## 2. 게시판 테이블과 API 만들기

1. 같은 Supabase 프로젝트의 **SQL Editor**를 엽니다.
2. **New query**를 선택합니다.
3. 동봉한 **[supabase/board.sql](supabase/board.sql)** 파일의 내용을 처음부터 끝까지 복사합니다.
4. SQL Editor에 붙여 넣고 **Run**을 누릅니다.
5. 오류 없이 완료되면 개발 서버를 다시 시작합니다.

```bash
npm ci
npm run dev
```

SQL은 글·댓글·좋아요 테이블과 사이트가 호출하는 함수를 함께 생성합니다. 같은 파일을 다시 실행해도 이미 저장한 글은 삭제하지 않습니다. 배포 서비스에도 두 Supabase 환경변수를 넣고 다시 빌드·배포하세요.

게시판 자료는 `daejin_board` 스키마에 저장합니다. 관리자가 Table Editor에서 이 스키마를 선택해 확인할 수 있습니다. **Data API의 Exposed schemas에는 `daejin_board`를 추가하지 마세요.** 사이트는 `public` 스키마의 정해진 함수로만 자료를 읽고 저장합니다. 프로젝트에서 기본 `public` 스키마의 Data API 접근은 활성화되어 있어야 합니다.

## 이용 방식

| 기능 | 이용 조건 |
| --- | --- |
| 목록·검색·글·댓글·답변 읽기 | 로그인 없이 가능 |
| 글·댓글·답변 작성, 좋아요 | GitHub 로그인 필요 |
| 글·댓글 삭제 | 본인이 작성한 내용만 가능 |
| 답변 채택·취소 | 질문 작성자만 가능 |

글의 표시 이름은 익명입니다. 댓글에서는 글 작성자를 “작성자”로 표시하고 다른 계정에는 해당 글 안에서 익명 번호를 붙입니다. 공개 게시판 응답에는 작성자의 계정 ID·이메일·GitHub 이름을 넣지 않습니다.

저장은 Supabase에서 성공 응답을 받은 뒤 완료됩니다. 연결이나 권한 문제로 실패하면 안내를 표시하고 작성 창의 내용을 유지합니다. 목록은 한 페이지에 20개, 댓글은 최근 내용부터 한 페이지에 50개씩 읽습니다. 화면이 열려 있을 때 20초마다 자료를 갱신하며 새로고침 버튼으로 바로 다시 읽을 수도 있습니다.

SQL은 비공개 테이블에 RLS를 켜고 직접 접근을 막습니다. 저장 함수는 로그인 계정과 작성자 권한을 데이터베이스에서 확인합니다. 사이트에 `service_role` 키를 넣을 필요가 없습니다.

## 직접 확인할 항목

- 계정 A로 글과 댓글을 작성하고 새로고침해도 내용이 남는지 확인합니다.
- 다른 브라우저 또는 다른 기기에서 로그인 없이 같은 글을 읽는지 확인합니다.
- 계정 B로 로그인해 댓글을 남기고 A의 글·댓글을 삭제할 수 없는지 확인합니다.
- 질문 작성자가 답변을 채택하거나 취소했을 때 다른 사람 화면에도 반영되는지 확인합니다.
- 시간표에서 학과·학년을 바꾸면 해당 조건에 등록된 반 목록이 바뀌고 선택한 반의 시간표를 조회하는지 확인합니다.

게시판 연결을 준비 중이라는 안내가 나오면 환경변수, 개발 서버 재시작 여부, SQL 전체 실행 여부, 두 설정이 같은 Supabase 프로젝트를 가리키는지 확인하세요. 기존 화면에만 잠시 표시했던 글은 서버에 저장되어 있지 않아 옮길 수 없습니다. 연결 후 새로 작성한 글부터 저장합니다.

개인 일정·알레르기 기능의 저장 방식은 기존 구현을 사용합니다. 이번 데이터베이스 저장 변경은 자유게시판과 질문게시판에 적용합니다.

공식 문서: [API 키](https://supabase.com/docs/guides/api/api-keys) · [데이터베이스 함수](https://supabase.com/docs/guides/database/functions) · [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
