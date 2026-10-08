"use client";

import { useState } from "react";
import { useNeis } from "@/hooks/useNeis";
import {
  displayDate,
  koreaToday,
  weekDates,
  withoutAllergyNumbers,
} from "@/lib/neis";
import NeisStatus from "@/components/NeisStatus";
import WeekNavigation from "@/components/WeekNavigation";

export default function MealView() {
  const [selectedDate, setSelectedDate] = useState(koreaToday);
  const [showAllergy, setShowAllergy] = useState(true);
  const [mealCode, setMealCode] = useState("2");
  const days = weekDates(selectedDate);
  const meals = useNeis("meals", {
    start: days[0],
    end: days[4],
    meal: mealCode,
  });
  const today = koreaToday();
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">급식 식단표</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            NEIS에 등록된 주간 식단 · 열량 · 영양 · 원산지 정보
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            aria-label="급식 종류"
            value={mealCode}
            onChange={(event) => setMealCode(event.target.value)}
            className="rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5"
          >
            <option value="1">조식</option>
            <option value="2">중식</option>
            <option value="3">석식</option>
          </select>
          <button
            onClick={() => setShowAllergy(!showAllergy)}
            aria-pressed={showAllergy}
            className="rounded border border-gray-200 dark:border-zinc-700 px-3 py-1.5 cursor-pointer"
          >
            알레르기 번호: {showAllergy ? "ON" : "OFF"}
          </button>
          <button
            onClick={meals.reload}
            className="rounded border border-gray-200 dark:border-zinc-700 px-3 py-1.5 cursor-pointer"
          >
            새로고침
          </button>
        </div>
      </div>
      <WeekNavigation date={selectedDate} onChange={setSelectedDate} />
      <NeisStatus {...meals} onRetry={meals.reload} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {days.map((day) => {
          const records = meals.data?.filter((meal) => meal.date === day) ?? [];
          return (
            <article
              key={day}
              className={`rounded-lg border bg-white dark:bg-zinc-900 p-4 ${day === today ? "border-gray-900 dark:border-white ring-1 ring-gray-900 dark:ring-white" : "border-gray-200 dark:border-zinc-800"}`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                <h3 className="font-bold text-sm">{displayDate(day)}</h3>
                {day === today && (
                  <span className="rounded bg-gray-900 dark:bg-white px-1.5 py-0.5 text-[10px] text-white dark:text-zinc-900">
                    오늘
                  </span>
                )}
              </div>
              {meals.loading ? (
                <div className="animate-pulse space-y-3" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className="h-3 rounded bg-gray-100 dark:bg-zinc-800"
                    />
                  ))}
                </div>
              ) : records.length ? (
                records.map((meal, index) => (
                  <div key={index} className="space-y-4 text-xs">
                    <ul className="space-y-2.5">
                      {meal.dishes.map((dish, dishIndex) => (
                        <li
                          key={dishIndex}
                          className="leading-relaxed break-words"
                        >
                          {showAllergy ? dish : withoutAllergyNumbers(dish)}
                        </li>
                      ))}
                    </ul>
                    <p className="border-t border-gray-100 dark:border-zinc-800 pt-3 text-gray-500 dark:text-zinc-400">
                      열량:{" "}
                      <span className="font-semibold">
                        {meal.calories || "미제공"}
                      </span>
                    </p>
                    {meal.nutrition.length > 0 && (
                      <details>
                        <summary className="cursor-pointer text-gray-500 dark:text-zinc-400">
                          영양 정보
                        </summary>
                        <ul className="mt-2 space-y-1 text-[11px]">
                          {meal.nutrition.map((value, item) => (
                            <li key={item}>{value}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                    {meal.origins.length > 0 && (
                      <details>
                        <summary className="cursor-pointer text-gray-500 dark:text-zinc-400">
                          원산지 정보
                        </summary>
                        <ul className="mt-2 space-y-1 text-[11px]">
                          {meal.origins.map((value, item) => (
                            <li key={item}>{value}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-gray-400">
                  {meals.error
                    ? "조회하지 못했습니다."
                    : meals.meta?.partial
                      ? "이번 조회에서 제공되지 않은 식단입니다."
                      : "등록된 식단이 없습니다."}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-500 dark:text-zinc-400">
        괄호 안 숫자는 NEIS에서 제공하는 알레르기 번호입니다. 식단은 학교 사정에
        따라 변경될 수 있습니다.
      </p>
    </div>
  );
}
