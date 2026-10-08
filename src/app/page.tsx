import Portal from "@/components/Portal";
import { portalTab } from "@/lib/auth";

const AUTH_ERRORS: Record<string, string> = {
  cancelled:
    "GitHub 로그인을 취소했습니다. 시간표는 로그인 없이 이용할 수 있습니다.",
  oauth_failed: "GitHub 로그인에 실패했습니다. 다시 시도해 주세요.",
  missing_code:
    "로그인 요청을 확인할 수 없습니다. 로그인 버튼을 다시 눌러 주세요.",
  not_configured:
    "GitHub 로그인 준비 중입니다. 사이트 운영자에게 문의해 주세요.",
  exchange_failed:
    "로그인 요청이 만료되었거나 확인되지 않았습니다. 로그인한 브라우저에서 다시 시도해 주세요.",
  connection_failed:
    "로그인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const tab = typeof query.tab === "string" ? query.tab : undefined;
  const error =
    typeof query.auth_error === "string" ? query.auth_error : undefined;
  return (
    <Portal
      initialTab={portalTab(tab)}
      initialAuthError={
        error
          ? Object.hasOwn(AUTH_ERRORS, error)
            ? AUTH_ERRORS[error]
            : AUTH_ERRORS.oauth_failed
          : null
      }
    />
  );
}
