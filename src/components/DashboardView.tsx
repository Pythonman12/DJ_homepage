"use client";

import { useState } from "react";
import { DEFAULT_STUDENT_PROFILE, type StudentUser } from "@/lib/auth";
import { useNeis } from "@/hooks/useNeis";
import {
  addDays,
  daysUntil,
  displayDate,
  koreaToday,
  withoutAllergyNumbers,
} from "@/lib/neis";
import NeisStatus from "@/components/NeisStatus";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  isLoggedIn?: boolean;
  studentUser?: StudentUser;
  onOpenLogin?: () => void;
}

export default function DashboardView({
  onNavigate,
  isLoggedIn,
  studentUser,
  onOpenLogin,
}: DashboardViewProps) {
  const [today] = useState(koreaToday);
  const hasMyClass = Boolean(isLoggedIn && studentUser?.profileComplete);
  const profile =
    hasMyClass && studentUser ? studentUser : DEFAULT_STUDENT_PROFILE;
  const school = useNeis("school");
  const meals = useNeis("meals", { start: today, end: today });
  const timetable = useNeis("timetable", {
    start: today,
    end: today,
    grade: profile.grade,
    class: profile.classNum,
    department: profile.department,
  });
  const events = useNeis("schedule", { start: today, end: addDays(today, 42) });
  const card =
    "rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5";
  const action =
    "rounded border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800";
  const meal = meals.data?.[0];
  const upcoming = events.data?.slice(0, 4) ?? [];

  return (
    <div className="space-y-6">
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">대시보드</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              {today} ·{" "}
              {hasMyClass && studentUser
                ? `${studentUser.department} ${studentUser.grade}학년 ${studentUser.classNum}반 맞춤 정보`
                : "대진전자통신고등학교의 오늘과 다가오는 일정"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isLoggedIn && onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                GitHub 로그인
              </button>
            )}
            <button onClick={() => onNavigate("school")} className={action}>
              학교 정보
            </button>
            <button onClick={() => onNavigate("schedule")} className={action}>
              학사일정
            </button>
          </div>
        </div>
        {school.data && (
          <div className="mt-4 border-t border-gray-100 dark:border-zinc-800 pt-3 flex flex-wrap justify-between gap-2 text-xs text-gray-500 dark:text-zinc-400">
            <span>
              {school.data.establishment} · {school.data.highSchoolType} ·{" "}
              {school.data.address}
            </span>
            {school.data.phone && (
              <a href={`tel:${school.data.phone}`} className="hover:underline">
                대표 전화 {school.data.phone}
              </a>
            )}
          </div>
        )}
        {school.error && (
          <div className="mt-3">
            <NeisStatus {...school} onRetry={school.reload} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className={`${card} flex flex-col justify-between gap-5`}>
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
              <h3 className="font-bold text-sm">오늘의 급식</h3>
              <span className="text-xs text-gray-400">중식</span>
            </div>
            {meal && (
              <>
                <ul className="space-y-2 text-xs">
                  {meal.dishes.map((dish, index) => (
                    <li
                      key={index}
                      className="rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 p-2.5"
                    >
                      {withoutAllergyNumbers(dish)}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] text-gray-500 dark:text-zinc-400">
                  열량: {meal.calories || "미제공"}
                </p>
              </>
            )}
            {!meals.loading && !meals.error && !meal && (
              <p className="py-6 text-xs text-gray-400">
                오늘 등록된 중식 식단이 없습니다.
              </p>
            )}
          </div>
          <div className="space-y-3">
            <NeisStatus {...meals} onRetry={meals.reload} />
            <button
              onClick={() => onNavigate("meal")}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              주간 식단표 →
            </button>
          </div>
        </section>

        <section className={`${card} flex flex-col justify-between gap-5`}>
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
              <h3 className="font-bold text-sm">오늘의 시간표</h3>
              <span className="text-xs text-gray-400">
                {profile.grade}학년 {profile.classNum}반
                {!hasMyClass && " · 기본 학급"}
              </span>
            </div>
            <>
              <div className="space-y-2">
                {timetable.data?.map((lesson, index) => (
                  <div
                    key={index}
                    className="rounded border border-gray-100 dark:border-zinc-800 p-2.5 text-xs flex gap-3"
                  >
                    <span className="shrink-0 text-gray-500 dark:text-zinc-400">
                      {lesson.period}교시
                    </span>
                    <span className="font-medium">
                      {lesson.subject || "수업명 미제공"}
                    </span>
                  </div>
                ))}
              </div>
              {!timetable.loading &&
                !timetable.error &&
                timetable.data?.length === 0 && (
                  <p className="py-6 text-xs text-gray-400">
                    오늘 등록된 수업 정보가 없습니다.
                  </p>
                )}
            </>
          </div>
          <div className="space-y-3">
            <NeisStatus {...timetable} onRetry={timetable.reload} />
            <button
              onClick={() => onNavigate("timetable")}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              학급 선택·주간 시간표 →
            </button>
          </div>
        </section>

        <section className={`${card} flex flex-col justify-between gap-5`}>
          <div>
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
              <h3 className="font-bold text-sm">다가오는 학교 일정</h3>
            </div>
            <div className="space-y-3">
              {upcoming.map((event, index) => {
                const count = daysUntil(event.date, today);
                return (
                  <div
                    key={index}
                    className="rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 p-3 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {displayDate(event.date)} · {event.target}
                      </p>
                    </div>
                    <span className="shrink-0 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 px-2 py-1 text-[11px] font-semibold">
                      {count === 0 ? "D-Day" : `D-${count}`}
                    </span>
                  </div>
                );
              })}
            </div>
            {!events.loading && !events.error && upcoming.length === 0 && (
              <p className="py-6 text-xs text-gray-400">
                앞으로 6주 동안 등록된 일정이 없습니다.
              </p>
            )}
          </div>
          <div className="space-y-3">
            <NeisStatus {...events} onRetry={events.reload} />
            <button
              onClick={() => onNavigate("schedule")}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              월별 학사일정 →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
