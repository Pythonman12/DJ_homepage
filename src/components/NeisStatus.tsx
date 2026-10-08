import { NEIS_PORTAL, type NeisMeta } from "@/lib/neis";

export default function NeisStatus({
  loading,
  error,
  meta,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  meta: NeisMeta | null;
  onRetry: () => void;
}) {
  if (loading)
    return (
      <p
        role="status"
        className="text-xs text-gray-500 dark:text-zinc-400 py-2"
      >
        NEIS 정보를 불러오는 중입니다…
      </p>
    );
  if (error)
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300"
      >
        <span>{error}</span>
        <button
          onClick={onRetry}
          className="underline cursor-pointer font-semibold"
        >
          다시 조회
        </button>
      </div>
    );
  if (!meta) return null;
  return (
    <div className="space-y-2 text-[11px] text-gray-500 dark:text-zinc-400">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href={NEIS_PORTAL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          출처: 나이스 교육정보 개방 포털
          {meta.mode === "public" ? " · 공개 조회" : " · Open API"}
        </a>
        <span>
          {meta.updatedAt ? `자료 갱신 ${meta.updatedAt} · ` : ""}
          {meta.returnedCount}건 표시
          {meta.partial ? ` / 전체 ${meta.totalCount}건` : ""}
        </span>
      </div>
      {meta.partial && (
        <p className="text-amber-700 dark:text-amber-300">
          일부 결과만 표시됩니다. 조회 기간이나 조건을 좁혀 다시 조회해 주세요.
        </p>
      )}
    </div>
  );
}
