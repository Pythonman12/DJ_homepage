"use client";

import { useState } from "react";
import { useNeis } from "@/hooks/useNeis";
import {
  addDays,
  daysUntil,
  displayDate,
  koreaToday,
  type SchoolEvent,
} from "@/lib/neis";
import NeisStatus from "@/components/NeisStatus";

type EventFilter = "ALL" | SchoolEvent["type"];
const labels: Record<EventFilter, string> = {
  ALL: "전체",
  EXAM: "시험/평가",
  EVENT: "학교행사",
  HOLIDAY: "공휴일/휴업",
};
const colors: Record<SchoolEvent["type"], string> = {
  EXAM: "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300",
  EVENT: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
  HOLIDAY: "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300",
};

export default function ScheduleView() {
  const [month, setMonth] = useState(() => koreaToday().slice(0, 7));
  const [filterType, setFilterType] = useState<EventFilter>("ALL");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = koreaToday();
  const start = `${month}-01`;
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstDayIndex = new Date(`${start}T00:00:00Z`).getUTCDay();
  const schedule = useNeis("schedule", {
    start,
    end: addDays(start, daysInMonth - 1),
  });
  const allEvents = schedule.data ?? [];
  const filtered = allEvents.filter(
    (event) => filterType === "ALL" || event.type === filterType,
  );
  const selected = selectedDate?.startsWith(month) ? selectedDate : null;
  const listedEvents = selected
    ? filtered.filter((event) => event.date === selected)
    : filtered;
  const upcoming = allEvents.filter((event) => event.date >= today).slice(0, 3);
  const card =
    "rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5";
  const control =
    "rounded border border-gray-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800";
  const shiftMonth = (direction: number) => {
    const value = new Date(Date.UTC(year, monthNumber - 1 + direction, 1));
    setMonth(value.toISOString().slice(0, 7));
  };

  return (
    <div className="space-y-6">
      <div
        className={`${card} flex flex-wrap items-center justify-between gap-4`}
      >
        <div>
          <h2 className="text-xl font-bold">학사일정</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            대진전자통신고등학교의 NEIS 등록 일정 · 날짜를 눌러 상세 내용을
            확인하세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(labels) as EventFilter[]).map((type) => (
            <button
              key={type}
              aria-pressed={filterType === type}
              onClick={() => setFilterType(type)}
              className={`rounded px-3 py-1.5 text-xs cursor-pointer ${filterType === type ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-semibold" : "border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400"}`}
            >
              {labels[type]}
            </button>
          ))}
          <button onClick={schedule.reload} className={control}>
            새로고침
          </button>
        </div>
      </div>
      <NeisStatus {...schedule} onRetry={schedule.reload} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className={`${card} lg:col-span-2`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
            <h3 className="font-bold">
              {year}년 {monthNumber}월
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => shiftMonth(-1)}
                aria-label="이전 달"
                className={control}
              >
                ‹
              </button>
              <button
                onClick={() => {
                  setMonth(today.slice(0, 7));
                  setSelectedDate(null);
                }}
                className={control}
              >
                이번 달
              </button>
              <button
                onClick={() => shiftMonth(1)}
                aria-label="다음 달"
                className={control}
              >
                ›
              </button>
              <input
                aria-label="조회 월"
                type="month"
                value={month}
                onChange={(event) => {
                  if (event.target.value) setMonth(event.target.value);
                }}
                className={`${control} bg-white dark:bg-zinc-900 max-w-[155px]`}
              />
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-2">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
              <span
                key={day}
                className={
                  index === 0
                    ? "text-red-500"
                    : index === 6
                      ? "text-blue-500"
                      : ""
                }
              >
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from(
              { length: Math.ceil((firstDayIndex + daysInMonth) / 7) * 7 },
              (_, index) => {
                const day = index - firstDayIndex + 1;
                if (day < 1 || day > daysInMonth)
                  return (
                    <div
                      key={index}
                      aria-hidden="true"
                      className="min-h-24 rounded bg-gray-50/50 dark:bg-zinc-800/20"
                    />
                  );
                const iso = `${month}-${String(day).padStart(2, "0")}`;
                const values = filtered.filter((event) => event.date === iso);
                return (
                  <button
                    key={index}
                    aria-label={`${monthNumber}월 ${day}일 일정 보기`}
                    aria-pressed={selected === iso}
                    onClick={() =>
                      setSelectedDate(selected === iso ? null : iso)
                    }
                    className={`min-w-0 min-h-24 rounded border p-1.5 flex flex-col text-left cursor-pointer ${selected === iso ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/30" : iso === today ? "border-gray-900 dark:border-white" : "border-gray-100 dark:border-zinc-800"}`}
                  >
                    <span
                      className={`text-[11px] font-semibold ${index % 7 === 0 ? "text-red-500" : index % 7 === 6 ? "text-blue-500" : "text-gray-600 dark:text-zinc-400"}`}
                    >
                      {day}
                      {iso === today && (
                        <span className="ml-1 text-[9px] text-gray-500">
                          오늘
                        </span>
                      )}
                    </span>
                    <div className="mt-1 space-y-0.5 w-full">
                      {values.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          title={event.title}
                          className={`truncate rounded p-0.5 text-[9px] ${colors[event.type]}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {values.length > 2 && (
                        <span className="text-[9px] text-gray-400">
                          +{values.length - 2}건
                        </span>
                      )}
                    </div>
                  </button>
                );
              },
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-4">
            분류는 NEIS 행사명과 수업공제일을 기준으로 표시합니다.
          </p>
        </section>

        <div className="space-y-6">
          <section className={card}>
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold">
                {selected ? displayDate(selected) : `${monthNumber}월 일정`}
              </h3>
              {selected ? (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer"
                >
                  월 전체 보기
                </button>
              ) : (
                <span className="text-[11px] text-gray-400">
                  {listedEvents.length}건 표시
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {listedEvents.map((event, index) => (
                <article
                  key={index}
                  className="rounded border border-gray-100 dark:border-zinc-800 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                      {displayDate(event.date)}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${colors[event.type]}`}
                    >
                      {labels[event.type]}
                    </span>
                  </div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-gray-500 dark:text-zinc-400">
                    대상: {event.target}
                  </p>
                  {event.description && (
                    <p className="whitespace-pre-line text-gray-500 dark:text-zinc-400">
                      {event.description}
                    </p>
                  )}
                </article>
              ))}
              {schedule.loading && (
                <p className="py-6 text-xs text-gray-400">
                  일정을 불러오는 중입니다…
                </p>
              )}
              {!schedule.loading && listedEvents.length === 0 && (
                <p className="py-6 text-xs text-gray-400">
                  {schedule.error
                    ? "일정을 조회하지 못했습니다."
                    : schedule.meta?.partial
                      ? "현재 조회 결과에 해당하는 일정이 없습니다. 일부 데이터만 제공되고 있습니다."
                      : "해당하는 등록 일정이 없습니다."}
                </p>
              )}
            </div>
          </section>
          <section className={card}>
            <h3 className="text-sm font-bold border-b border-gray-100 dark:border-zinc-800 pb-3 mb-3">
              이달의 다가오는 일정
            </h3>
            <div className="space-y-3">
              {upcoming.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span>
                    {event.title}
                    <span className="block text-[11px] text-gray-400 mt-1">
                      {displayDate(event.date)}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold">
                    {daysUntil(event.date, today) === 0
                      ? "D-Day"
                      : `D-${daysUntil(event.date, today)}`}
                  </span>
                </div>
              ))}
              {!upcoming.length && (
                <p className="text-xs text-gray-400">
                  현재 조회 결과에 다가오는 일정이 없습니다.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
