# 대진전자통신고등학교 학생 포털

기존 Next.js 사이트에 NEIS 교육정보를 연결했습니다. 인증키 없이 학교 기본 정보, 등록 학과, 급식, 학급 시간표, 학사일정과 대시보드를 조회할 수 있습니다.

## 실행

Node.js **22 이상**에서 `pro` 폴더를 열고 실행하세요. Supabase SDK의 지원 버전에 맞춘 요구 사항입니다.

```bash
npm ci
npm run dev
```

브라우저에서 http://localhost:3000 에 접속하세요. 압축 파일에서 `node_modules`, `.next` 등 재생성 가능한 파일은 제외했습니다.

## GitHub 로그인

Supabase Auth를 통한 실제 GitHub 로그인·자동 가입·세션 유지·로그아웃을 연결했습니다. **[AUTH_SETUP.md](AUTH_SETUP.md)**의 안내에 따라 본인의 Supabase Project URL·publishable key와 GitHub Provider를 설정하세요. 환경변수 예시는 `.env.example`에 있습니다.

시간표 메뉴와 대시보드의 오늘 시간표는 **로그인 없이 조회**합니다. 로그인 전 기본 학급은 1학년 4반이며 시간표 메뉴에서 다른 학급을 선택할 수 있습니다. 로그인 후 마이페이지에서 저장한 학급은 Supabase 계정에 보관하고 다음 로그인에도 적용합니다.

Supabase 설정이 없어도 공개 NEIS 조회는 사용할 수 있습니다. 이전 브라우저 예시 계정 로그인은 Supabase 인증으로 교체했습니다. 실제 OAuth 연결은 본인 프로젝트 설정 후 확인해야 합니다.

## 게시판 공유 저장

자유게시판과 질문게시판의 글·댓글·답변·좋아요·답변 채택을 Supabase에 저장하도록 변경했습니다. 로그인 없이 공유 글을 읽고, GitHub 로그인 후 작성할 수 있습니다. 본인의 글·댓글만 삭제할 수 있고 답변 채택은 질문 작성자에게만 허용합니다. 목록은 다른 사람의 새 글을 20초마다 갱신합니다.

**[BOARD_SETUP.md](BOARD_SETUP.md)**의 순서대로 공개 키를 환경변수에 입력하고 **`supabase/board.sql`을 Supabase SQL Editor에서 한 번 실행**하세요. 현재 소스에 프로젝트 주소는 입력되어 있지만 공개 키는 비어 있습니다. 실제 데이터베이스 생성은 본인의 프로젝트에서 SQL을 실행한 뒤 완료됩니다.

## 인증키 없이 사용

NEIS 정보 조회는 별도 설정 없이 위 실행 명령만 사용하면 됩니다. NEIS 인증키를 발급받을 필요가 없습니다. GitHub 로그인·게시판 저장에는 앞서 안내한 Supabase 설정이 필요합니다. 서버가 NEIS 포털의 **공개 SHEET 조회**를 이용하며, 시험 조회의 5건 제한을 적용하지 않습니다. 학교·학과·학급, 급식, 시간표, 학사일정 모두 같은 방식으로 조회합니다.

공개 조회는 100건씩 페이지를 가져오며 포털의 공개 화면 한도인 최대 10,000건까지 처리합니다. 기간 조회는 한 번에 최대 63일이며, 제공되는 실제 데이터가 없으면 빈 결과를 표시합니다.

## 선택 사항: Open API 인증키

이미 발급받은 인증키가 있다면 공식 Open API를 선택해서 사용할 수도 있습니다.

1. [NEIS 개발자 가이드](https://open.neis.go.kr/portal/guide/apiGuidePage.do)의 안내에 따라 로그인하고 활용가이드 → 인증키 신청에서 키를 발급받으세요.
2. `.env.example`을 복사하여 프로젝트 최상위에 `.env.local`을 만드세요.
3. 아래처럼 발급받은 키를 입력하고 개발 서버를 다시 시작하세요.

```dotenv
NEIS_API_KEY=본인이_발급받은_인증키
```

인증키는 서버에서만 읽습니다. `NEXT_PUBLIC_NEIS_API_KEY`로 설정하지 마세요. `NEIS_API_KEY`가 비어 있거나 `sample`이면 공개 조회를 사용합니다. 배포 시에도 인증키는 필수가 아닙니다. 실제 키는 압축 파일에 포함하지 않습니다.

## 추가·변경된 화면

- **학교 정보**: NEIS 등록 학교명, 영문명, 교육청, 학교 유형, 설립일, 주소, 전화·팩스, 홈페이지, 학과.
- **급식**: 주간 날짜 이동, 날짜 선택, 조식·중식·석식 선택, 메뉴와 알레르기 번호 표시, 열량, 영양, 원산지.
- **시간표**: 주간 날짜 이동, 학과·학년 선택, NEIS에 등록된 반을 드롭다운으로 선택, 로그인된 학생의 내 학급 보기. 선택한 조건에 없는 반은 자동으로 등록된 반으로 바뀝니다.
- **학사일정**: 월 이동, 월 선택, 날짜별 상세 일정, 시험·행사·휴업 필터, 실제 일정 기준 D-Day. 기존 예시 일정과 고정된 마일스톤을 NEIS 데이터로 교체했습니다.
- **대시보드**: 오늘 중식, 로그인 없이 기본 학급의 오늘 시간표, 로그인 후 저장한 내 학급 시간표, 앞으로 6주 일정, 학교 연락처.
- **GitHub 로그인·마이페이지**: Supabase 로그인·자동 가입·세션 복원·로그아웃, 계정별 학과·학년·반 저장.
- **자유게시판·질문게시판**: Supabase 공유 저장, 공개 읽기·검색, 로그인한 계정의 글·댓글·답변 작성·삭제, 좋아요, 질문 작성자의 답변 채택.

모든 NEIS 연동 화면에는 출처·자료 갱신일과 조회 상태를 표시합니다. 공개 조회에서는 “공개 조회”, 인증키를 사용하는 경우에는 “Open API”로 출처를 표시합니다. 조회 한도 때문에 일부만 제공된 경우에는 누락 가능성을 안내합니다.

날짜의 기준은 한국 시간(Asia/Seoul)입니다. 학급 조회에서 1~2월은 전년도 학년도를 사용합니다. 시간표 날짜 범위가 3월 1일을 걸치는 경우에도 조회할 수 있도록 시간표에는 별도 학년도 제한을 적용하지 않습니다.

## API 구성

대상 학교 코드는 NEIS 실제 응답에서 확인한 **부산광역시교육청 `C10` / 학교 `7150597`**입니다.

아래 NEIS 서비스 이름은 인증키를 사용할 때의 Open API 이름입니다. 기본 공개 조회는 같은 데이터셋의 SHEET 서비스(`/portal/data/sheet/searchSheetData.do`)를 이용합니다.

| 사이트 API              | NEIS 서비스           | 조회 내용                    |
| ----------------------- | --------------------- | ---------------------------- |
| `/api/neis/school`      | `schoolInfo`          | 학교 기본 정보               |
| `/api/neis/departments` | `schoolMajorinfo`     | 학교 학과 정보               |
| `/api/neis/classes`     | `classInfo`           | 해당 학년도·학년의 학급 정보 |
| `/api/neis/meals`       | `mealServiceDietInfo` | 기간·급식 종류별 식단        |
| `/api/neis/timetable`   | `hisTimetable`        | 기간·학년·반·학과별 시간표   |
| `/api/neis/schedule`    | `SchoolSchedule`      | 기간별 학사일정              |

API 예시:

```text
/api/neis/meals?start=2026-10-05&end=2026-10-09&meal=2
/api/neis/timetable?start=2026-10-05&end=2026-10-09&grade=1&class=4
/api/neis/classes?year=2026&grade=1
/api/neis/schedule?start=2026-10-01&end=2026-10-31
```

서버는 사용자 입력을 검증하며, 해당 학교만 조회합니다. 공개 조회는 학교명으로 검색한 뒤 교육청·학교 코드와 선택한 조건을 다시 확인하여 다른 학교나 학급의 결과를 제외합니다. 인증 조회는 최대 1,000건씩 페이지를 가져오고 일부 결과만 가져온 경우 이를 표시합니다. 학교·학과·학급은 최대 1시간, 식단·시간표·학사일정은 최대 5분 캐시합니다. 따라서 새로고침 후에도 캐시 유효기간 안에는 같은 결과가 보일 수 있습니다. 빈 결과와 공개 조회 오류, 인증 오류·조회 한도·서버 오류를 구분합니다.

학교가 아직 데이터를 등록하지 않은 날짜에는 실제 응답이 빈 결과일 수 있습니다. GitHub 인증은 Supabase Auth로 처리하고 게시판은 Supabase 데이터베이스에 저장합니다. 개인 일정, 알레르기, 취업·진학 및 신입생 안내는 NEIS가 제공하지 않는 별도 기능입니다.

## 직접 검증할 때

```bash
npm test
npm run build
```

테스트는 공개 조회·NEIS 응답·빈 결과·오류·인증키 보호·페이지 처리·날짜 검증을 확인합니다. 인증키를 발급받거나 실제 인증키를 테스트에 넣을 필요가 없습니다. 이번 인증키 없는 조회 변경의 화면 기능 검증은 별도로 실행하지 않았습니다.

전체 소스의 lint는 아래 명령으로 확인할 수 있습니다.

```bash
npm run lint
```

## 주요 파일

- `AUTH_SETUP.md`: Supabase·GitHub 설정, 개발·배포 주소, 직접 확인할 항목.
- `BOARD_SETUP.md`, `supabase/board.sql`: 게시판 테이블·접근 권한·저장 API와 최초 연결 안내.
- `src/components/BoardView.tsx`, `src/hooks/useBoard.ts`: 자유게시판·질문게시판의 저장 화면, 검색·페이지 이동·갱신.
- `src/app/api/board/`, `src/lib/board-server.ts`: 게시판 조회·작성·댓글·좋아요·채택·삭제와 서버 권한 확인.
- `src/components/Portal.tsx`, `src/hooks/useAuth.ts`: 포털 상태와 Supabase 로그인·프로필 저장.
- `src/lib/supabase/`, `src/proxy.ts`: 쿠키 기반 Supabase 클라이언트와 세션 갱신.
- `src/app/auth/callback/route.ts`: GitHub 로그인 완료 처리와 메뉴 복원.
- `src/lib/neis-server.ts`: 서버의 공개 SHEET 조회·선택적 Open API 요청, 응답 변환, 오류 처리.
- `src/lib/neis.ts`: 공유 데이터 타입과 날짜 계산.
- `src/app/api/neis/[dataset]/route.ts`: 사이트 API.
- `src/hooks/useNeis.ts`: 화면 조회와 요청 취소, 오류·재조회 상태.
- `src/components/SchoolInfoView.tsx`: 새 학교 정보 화면.
- `src/components/NeisStatus.tsx`, `WeekNavigation.tsx`: 공통 조회 상태·주간 이동.

[NEIS 데이터셋 목록](https://open.neis.go.kr/portal/data/dataset/searchDatasetPage.do) · [학교 학과 명세](https://open.neis.go.kr/portal/data/service/selectServicePage.do?infId=OPEN14020190311111456561190&infSeq=2) · [고등학교 시간표 명세](https://open.neis.go.kr/portal/data/service/selectServicePage.do?infId=OPEN18620200826103326268120&infSeq=2)
