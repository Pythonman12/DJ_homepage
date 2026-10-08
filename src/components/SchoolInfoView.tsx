"use client";

import { useNeis } from "@/hooks/useNeis";
import { SCHOOL_NAME } from "@/lib/neis";
import NeisStatus from "@/components/NeisStatus";

export default function SchoolInfoView() {
  const school = useNeis("school");
  const departments = useNeis("departments");
  const info = school.data;
  const card =
    "rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5";
  const fields = info
    ? [
        ["학교명", info.name],
        ["영문명", info.englishName],
        ["관할 교육청", info.office],
        [
          "학교 유형",
          [info.establishment, info.highSchoolType, info.kind]
            .filter(Boolean)
            .join(" · "),
        ],
        ["남녀 구분", info.coeducation],
        ["운영 과정", info.course],
        ["설립일", info.founded],
        ["개교기념일", info.anniversary],
      ]
    : [];
  return (
    <div className="space-y-6">
      <div
        className={`${card} flex flex-wrap items-center justify-between gap-3`}
      >
        <div>
          <h2 className="text-xl font-bold">학교 정보</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            {SCHOOL_NAME}의 NEIS 등록 정보를 확인하세요.
          </p>
        </div>
        <button
          onClick={() => {
            school.reload();
            departments.reload();
          }}
          className="rounded border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
        >
          새로고침
        </button>
      </div>
      <NeisStatus {...school} onRetry={school.reload} />
      {info && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className={`${card} lg:col-span-2`}>
            <h3 className="font-bold text-sm pb-3 border-b border-gray-100 dark:border-zinc-800">
              학교 기본 정보
            </h3>
            <dl className="divide-y divide-gray-100 dark:divide-zinc-800">
              {fields.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[100px_1fr] gap-3 py-3 text-xs"
                >
                  <dt className="text-gray-500 dark:text-zinc-400">{label}</dt>
                  <dd className="break-words">{value || "NEIS 미제공"}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className={`${card} space-y-4`}>
            <h3 className="font-bold text-sm pb-3 border-b border-gray-100 dark:border-zinc-800">
              연락처 · 위치
            </h3>
            <div className="text-xs space-y-1">
              <p className="text-gray-500 dark:text-zinc-400">주소</p>
              <p>{info.address || "NEIS 미제공"}</p>
              {info.postcode && (
                <p className="text-gray-400">우편번호 {info.postcode}</p>
              )}
            </div>
            <div className="text-xs space-y-1">
              <p className="text-gray-500 dark:text-zinc-400">대표 전화</p>
              {info.phone ? (
                <a
                  href={`tel:${info.phone}`}
                  className="font-semibold hover:underline"
                >
                  {info.phone}
                </a>
              ) : (
                "NEIS 미제공"
              )}
            </div>
            <div className="text-xs space-y-1">
              <p className="text-gray-500 dark:text-zinc-400">팩스</p>
              <p>{info.fax || "NEIS 미제공"}</p>
            </div>
            {info.website && (
              <a
                href={info.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded bg-gray-900 dark:bg-white py-2 text-center text-xs font-semibold text-white dark:text-zinc-900"
              >
                학교 홈페이지 ↗
              </a>
            )}
            {info.address && (
              <a
                href={`https://map.naver.com/p/search/${encodeURIComponent(info.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded border border-gray-200 dark:border-zinc-700 py-2 text-center text-xs"
              >
                지도에서 위치 보기 ↗
              </a>
            )}
          </section>
        </div>
      )}
      {!school.loading && !school.error && !info && (
        <p className={`${card} text-xs text-gray-500`}>
          NEIS에 등록된 학교 정보를 찾지 못했습니다.
        </p>
      )}
      <section className={card}>
        <h3 className="font-bold text-sm mb-4">NEIS 등록 학과</h3>
        <NeisStatus {...departments} onRetry={departments.reload} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {departments.data?.map((department, index) => (
            <div
              key={`${department.name}-${index}`}
              className="rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 p-4"
            >
              <p className="font-semibold text-sm">{department.name}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {[department.affiliation, department.course]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
        {!departments.loading &&
          !departments.error &&
          departments.data?.length === 0 && (
            <p className="text-xs text-gray-500 mt-3">
              등록된 학과 정보가 없습니다.
            </p>
          )}
      </section>
    </div>
  );
}
