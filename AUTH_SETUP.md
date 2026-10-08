# Supabase + GitHub 로그인 설정

학교 정보·급식·시간표·학사일정은 로그인이나 Supabase 설정 없이 이용할 수 있습니다. 아래 환경변수는 GitHub 로그인과 게시판 공유 저장에 필요합니다. 게시판 테이블 설정은 [BOARD_SETUP.md](BOARD_SETUP.md)를 함께 따라 주세요.

## 1. Supabase 프로젝트와 환경변수

1. [Supabase](https://supabase.com/dashboard)에서 본인의 프로젝트를 생성하거나 기존 프로젝트를 엽니다.
2. 프로젝트의 **Connect** 또는 **Settings → API Keys**에서 Project URL과 **publishable key**를 복사합니다.
3. `pro/.env.example`을 복사해 `pro/.env.local`을 만들고 두 값을 입력합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://iyvkgsqsilgeewcdvjqc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_본인키

# NEIS 인증키는 없어도 됩니다.
NEIS_API_KEY=
```

전달받은 프로젝트 주소는 `.env.example`에 반영했습니다. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 아직 전달받지 않아 비워 두었습니다. Supabase의 **Settings → API Keys → Publishable key**에서 복사한 값을 넣어 주세요.

현재 GitHub OAuth App의 Client ID는 `Ov23lizCb6CgG6NAM6Vb`이며, 이 값과 Client Secret은 Supabase의 GitHub Provider 설정 화면에 등록합니다. GitHub Client Secret은 사이트 환경변수나 압축 파일에 넣지 않습니다.

기존 프로젝트의 `anon` 키도 사용할 수 있습니다. 이 경우 `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 넣고 publishable key는 비워 둡니다. **`secret` 키, `service_role` 키, GitHub Client Secret을 `NEXT_PUBLIC_` 변수에 넣지 마세요.** GitHub Client Secret은 아래 Supabase 설정 화면에만 넣습니다.

## 2. GitHub OAuth App

1. Supabase의 **Authentication → Sign In / Providers → GitHub**에서 Callback URL을 복사합니다.
2. [GitHub OAuth Apps](https://github.com/settings/developers)에서 **New OAuth App**을 만듭니다.
3. 아래처럼 입력합니다.

| 항목                       | 개발 환경의 값                                                               |
| -------------------------- | ---------------------------------------------------------------------------- |
| Application name           | 대진전자통신고 학생 포털                                                     |
| Homepage URL               | `http://localhost:3000`                                                      |
| Authorization callback URL | `https://iyvkgsqsilgeewcdvjqc.supabase.co/auth/v1/callback` |

GitHub의 Authorization callback URL은 사이트의 `/auth/callback`이 아니라 **Supabase의 `/auth/v1/callback`**입니다.

4. 앱을 등록하고 **Client ID**와 **Client Secret**을 복사합니다.
5. Supabase의 GitHub Provider를 활성화하고 Client ID / Client Secret을 입력한 뒤 저장합니다.

## 3. Supabase URL Configuration

Supabase의 **Authentication → URL Configuration**에서 아래처럼 설정합니다.

| 항목          | 개발 환경의 값                          |
| ------------- | --------------------------------------- |
| Site URL      | `http://localhost:3000`                 |
| Redirect URLs | `http://localhost:3000/auth/callback**` |

`**`는 로그인 전 보고 있던 메뉴를 복원하는 `?tab=timetable` 등의 쿼리도 허용하기 위해 필요합니다. 서버를 3001 포트로 실행하거나 `127.0.0.1`로 접속한다면 그 주소의 `/auth/callback**`도 별도로 추가해야 합니다. 로그인 시작과 완료에는 같은 브라우저와 주소를 사용하세요.

배포할 때는 Site URL을 실제 HTTPS 도메인으로 바꾸고 `https://본인도메인/auth/callback**`을 Redirect URLs에 추가합니다. GitHub OAuth App의 Homepage URL도 실제 사이트 주소로 바꿉니다. **GitHub Authorization callback URL은 계속 Supabase Callback URL을 사용합니다.**

배포 서비스에도 두 `NEXT_PUBLIC_SUPABASE_*` 환경변수를 등록한 뒤 다시 빌드·배포해야 합니다. 공개 환경변수는 빌드할 때 브라우저 코드에 포함됩니다.

## 4. 실행

Node.js **22 이상**에서 실행합니다.

```bash
npm ci
npm run dev
```

환경변수를 변경했다면 개발 서버를 다시 시작하세요. 오른쪽 위의 **GitHub 로그인** 버튼으로 로그인합니다. 처음 로그인하면 Supabase Auth가 계정을 자동으로 생성합니다. 별도 가입 폼이나 비밀번호 설정은 필요하지 않습니다.

## 구현된 동작

- 로그인 전에도 대시보드에서 기본 학급(1학년 4반)의 오늘 시간표를 표시합니다. 시간표 메뉴에서 학과·학년·반과 조회 주를 자유롭게 선택할 수 있습니다.
- GitHub 로그인 완료 후 로그인 전 보고 있던 메뉴로 돌아옵니다.
- 새로고침 후 Supabase 세션을 복원하고 토큰을 갱신합니다. 다른 탭의 로그인 상태 변화도 반영합니다.
- 마이페이지에서 학과·학년·반·선택적인 번호를 저장하면 Supabase Auth의 본인 `user_metadata.student_profile`에 저장됩니다. 다른 기기나 다음 로그인에서도 사용할 수 있습니다.
- 저장한 학급은 대시보드와 시간표 메뉴에 적용됩니다. 시간표의 **내 학급 보기**로 다시 선택할 수 있습니다.
- 로그아웃은 현재 브라우저의 세션을 종료합니다. 로그아웃 후에도 시간표 조회가 가능합니다.
- 로그인 취소, 만료된 요청, 연결 오류는 안내 메시지로 표시합니다. Supabase 설정이 없으면 로그인 버튼에 준비 중 안내를 표시합니다.

이 로그인·학급 저장 기능에는 별도의 테이블, SQL, 서비스 권한 키가 필요하지 않습니다. 학급은 사용자가 입력하는 개인 설정이며 재학 여부나 관리자 권한을 증명하지 않습니다. 이전 브라우저 예시 계정과 `dj_student_user` 로컬 저장 값은 로그인 근거로 사용하지 않습니다.

자유게시판과 질문게시판은 Supabase 데이터베이스에 저장합니다. **[BOARD_SETUP.md](BOARD_SETUP.md)**에 따라 `supabase/board.sql`을 SQL Editor에서 한 번 실행하면 로그인 없이 공유 글을 읽고 로그인 후 글·댓글·답변을 작성할 수 있습니다. 개인 일정·알레르기 기능은 기존 저장 방식을 사용합니다.

## 확인할 항목

실제 GitHub OAuth 로그인은 본인 Supabase 프로젝트를 설정한 뒤 확인해 주세요.

1. 설정하지 않은 상태에서 대시보드 시간표와 시간표 메뉴가 조회되는지 확인합니다.
2. GitHub로 로그인하고 새로고침했을 때 로그인 상태가 유지되는지 확인합니다.
3. 마이페이지에서 학급을 저장하고 다음 로그인·시간표에 적용되는지 확인합니다.
4. 로그인 취소, 로그아웃 후에도 공개 시간표를 이용할 수 있는지 확인합니다.

실패한다면 우선 GitHub Provider 활성화 여부, 두 Callback URL의 구분, Supabase Redirect URLs와 현재 접속 주소를 확인하세요.

공식 문서: [GitHub 로그인](https://supabase.com/docs/guides/auth/social-login/auth-github) · [Next.js 서버 인증](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs) · [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) · [사용자 정보 저장](https://supabase.com/docs/reference/javascript/auth-updateuser)
