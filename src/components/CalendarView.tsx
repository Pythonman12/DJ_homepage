"use client";

import React, { useState } from "react";

export default function CalendarView() {
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            나만의 일정표
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filter Group */}
          <div className="flex border border-gray-200 dark:border-zinc-700 rounded overflow-hidden">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 font-medium ${
                filter === "all"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("school")}
              className={`px-3 py-1.5 font-medium ${
                filter === "school"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              학교 일정
            </button>
            <button
              onClick={() => setFilter("personal")}
              className={`px-3 py-1.5 font-medium ${
                filter === "personal"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              개인 일정
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-semibold"
          >
            + 새 일정 추가
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar (Left 2 cols) + Sidebar (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Monthly Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4 text-xs font-semibold">
            <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
              2026. 10
            </span>
            <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-600"></span> 학교 공식</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-600"></span> 자격증/시험</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-600"></span> 과제/개인</span>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div className="text-red-500">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="text-blue-500">토</div>
          </div>

          {/* Month Cells Wireframe */}
          <div className="grid grid-cols-7 gap-1 mt-2 text-xs">
            {/* Blanks */}
            <div className="h-20 p-1.5 rounded bg-gray-50/50 dark:bg-zinc-800/20 opacity-40">27</div>
            <div className="h-20 p-1.5 rounded bg-gray-50/50 dark:bg-zinc-800/20 opacity-40">28</div>
            <div className="h-20 p-1.5 rounded bg-gray-50/50 dark:bg-zinc-800/20 opacity-40">29</div>
            <div className="h-20 p-1.5 rounded bg-gray-50/50 dark:bg-zinc-800/20 opacity-40">30</div>

            {/* October 1 to 31 */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isToday = day === 7;
              return (
                <div
                  key={day}
                  className={`h-20 p-1.5 rounded border flex flex-col justify-between ${
                    isToday
                      ? "border-gray-900 dark:border-white bg-gray-50/80 dark:bg-zinc-800/50"
                      : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <span className={`font-mono text-[11px] font-bold ${isToday ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                    {day}
                  </span>

                  {/* Sample Event Slot placeholder */}
                  {day === 7 && (
                    <div className="text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono truncate">
                      [오늘] 실습
                    </div>
                  )}
                  {day === 18 && (
                    <div className="text-[9px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono truncate">
                      자격증 실기
                    </div>
                  )}
                  {day === 9 && (
                    <div className="text-[9px] px-1 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-mono truncate">
                      공휴일
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Checklist & D-Day Wireframe */}
        <div className="space-y-6">
          {/* Checklist */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-3 text-xs">
              <span className="font-bold text-gray-900 dark:text-white">
                오늘의 할 일 목록
              </span>
            </div>

            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-2.5 rounded border border-gray-100 dark:border-zinc-800 flex items-center gap-2.5 text-xs text-gray-700 dark:text-zinc-300"
                >
                  <input type="checkbox" className="rounded border-gray-300 dark:border-zinc-700" defaultChecked={i === 1} />
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>

          {/* D-Day */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
            <div className="pb-3 border-b border-gray-100 dark:border-zinc-800 mb-3 text-xs font-bold text-gray-900 dark:text-white">
              D-Day 목표 일정
            </div>

            <div className="space-y-2">
              {[
                { title: "목표 자격증 실기 시험", dday: "D-12" },
                { title: "2학기 2차 고사 (기말)", dday: "D-38" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs"
                >
                  <span className="text-gray-700 dark:text-zinc-300">{item.title}</span>
                  <span className="font-bold font-mono text-gray-900 dark:text-white">{item.dday}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg w-full max-w-md p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <span className="font-bold text-sm text-gray-900 dark:text-white">새 일정 등록</span>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 text-xs">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">일정명</label>
                <div className="h-8 rounded border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800"></div>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">카테고리</label>
                <div className="h-8 rounded border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800"></div>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">일시</label>
                <div className="h-8 rounded border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800"></div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400"
              >
                닫기
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-semibold"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
