"use client";

import React, { useState } from "react";
import type { StudentUser, StudentProfile } from "@/lib/auth";
import { useNeis } from "@/hooks/useNeis";

interface MyPageViewProps {
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  signingOut?: boolean;
  userData?: StudentUser;
  onUpdateUserData?: (updated: StudentProfile) => Promise<void>;
}

export default function MyPageView({
  isLoggedIn = false,
  onOpenLogin,
  onLogout,
  signingOut = false,
  userData,
  onUpdateUserData,
}: MyPageViewProps) {
  const [subTab, setSubTab] = useState<"SCHEDULE" | "PROFILE" | "ALLERGY">(
    userData?.profileComplete ? "SCHEDULE" : "PROFILE",
  );
  const [showAddModal, setShowAddModal] = useState(false);

  // Profile Form state
  const [department, setDepartment] = useState(userData?.department || "");
  const [grade, setGrade] = useState(userData?.grade || "1");
  const [classNum, setClassNum] = useState(userData?.classNum || "4");
  const [studentNum, setStudentNum] = useState(userData?.studentNum || "");
  const departments = useNeis("departments", {}, isLoggedIn);
  const departmentNames = [
    ...new Set(
      [
        ...(departments.data?.map((item) => item.name) ?? []),
        department,
      ].filter(Boolean),
    ),
  ];

  // Allergy Checkbox list
  const allergyList = [
    "난류(달걀)",
    "우유",
    "메밀",
    "대두",
    "땅콩",
    "밀",
    "고등어",
    "게",
    "새우",
    "돼지고기",
    "복숭아",
    "토마토",
    "아황산류",
    "호두",
    "닭고기",
    "쇠고기",
    "오징어",
    "조개류",
    "잣",
  ];
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([
    "난류(달걀)",
    "우유",
  ]);

  const toggleAllergy = (item: string) => {
    if (selectedAllergies.includes(item)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== item));
    } else {
      setSelectedAllergies([...selectedAllergies, item]);
    }
  };

  // Todo Items
  const [todos, setTodos] = useState([
    {
      id: 1,
      text: "정보처리기능사 실기 1과목 기출문제 50제 풀기",
      category: "자격증",
      done: true,
    },
    {
      id: 2,
      text: "디지털 논리 회로 브레드보드 회로도 정리하기",
      category: "수행평가",
      done: false,
    },
    {
      id: 3,
      text: "공통수학2 교과서 삼각함수 연습문제 복습",
      category: "시험공부",
      done: false,
    },
  ]);
  const [newTodoInput, setNewTodoInput] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodoInput.trim(),
        category: "할일",
        done: false,
      },
    ]);
    setNewTodoInput("");
  };

  const handleDeleteTodo = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTodos(todos.filter((t) => t.id !== id));
  };

  const handleSaveProfile = async () => {
    if (profileSaving) return;
    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError(null);
    try {
      if (!onUpdateUserData)
        throw new Error("학급 저장 기능을 연결하지 못했습니다.");
      await onUpdateUserData({ department, grade, classNum, studentNum });
      setProfileSaved(true);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "저장하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Calendar month state
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(10);

  // Dynamic personal events
  interface PersonalEvent {
    id: number;
    year: number;
    month: number;
    day: number;
    text: string;
    category: "school" | "cert" | "task";
  }

  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([
    { id: 1, year: 2026, month: 10, day: 7, text: "실습", category: "school" },
    { id: 2, year: 2026, month: 10, day: 18, text: "자격증", category: "cert" },
    {
      id: 3,
      year: 2026,
      month: 10,
      day: 23,
      text: "과제제출",
      category: "task",
    },
    {
      id: 4,
      year: 2026,
      month: 11,
      day: 12,
      text: "기능검정",
      category: "cert",
    },
    {
      id: 5,
      year: 2026,
      month: 12,
      day: 15,
      text: "기말고사",
      category: "school",
    },
    {
      id: 6,
      year: 2027,
      month: 1,
      day: 11,
      text: "동계특강",
      category: "school",
    },
    { id: 7, year: 2027, month: 2, day: 9, text: "졸업식", category: "school" },
  ]);

  // Modal form states
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDay, setNewEventDay] = useState(1);
  const [newEventCategory, setNewEventCategory] = useState<
    "school" | "cert" | "task"
  >("school");

  const prevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarYear((y) => y - 1);
      setCalendarMonth(12);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarYear((y) => y + 1);
      setCalendarMonth(1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const resetToday = () => {
    setCalendarYear(2026);
    setCalendarMonth(10);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  // Dynamic Calendar Computation
  const firstDayIndex = new Date(calendarYear, calendarMonth - 1, 1).getDay();
  const daysInCurrentMonth = new Date(calendarYear, calendarMonth, 0).getDate();
  const daysInPrevMonth = new Date(
    calendarYear,
    calendarMonth - 1,
    0,
  ).getDate();

  const prevMonthTailDays: number[] = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthTailDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => i + 1,
  );
  const totalGridSlots =
    Math.ceil((prevMonthTailDays.length + currentMonthDays.length) / 7) * 7;
  const nextMonthHeadCount =
    totalGridSlots - (prevMonthTailDays.length + currentMonthDays.length);
  const nextMonthHeadDays = Array.from(
    { length: nextMonthHeadCount },
    (_, i) => i + 1,
  );

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      alert("일정명을 입력해 주세요.");
      return;
    }
    const newEv: PersonalEvent = {
      id: Date.now(),
      year: calendarYear,
      month: calendarMonth,
      day: Number(newEventDay) || 1,
      text: newEventTitle.trim(),
      category: newEventCategory,
    };
    setPersonalEvents((prev) => [...prev, newEv]);
    setNewEventTitle("");
    setShowAddModal(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-8 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-zinc-700 mx-auto flex items-center justify-center font-bold text-gray-800 dark:text-zinc-200 text-sm">
            MY
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              내 계정으로 로그인해 주세요
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              나만의 개인 일정표, 알레르기 식단 알림, 소속 학급 정보 관리를
              이용하시려면 로그인해 주세요.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-gray-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              GitHub로 로그인 / 가입하기
            </button>
          </div>
          <div className="text-[11px] text-gray-400 dark:text-zinc-500 pt-3 border-t border-gray-100 dark:border-zinc-800">
            시간표와 학교 정보는 로그인 없이 볼 수 있습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            마이페이지
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            GitHub · {userData?.githubUsername || "내 계정"}
            {userData?.profileComplete
              ? ` · ${userData.department} ${userData.grade}학년 ${userData.classNum}반`
              : " · 내 학급을 설정해 주세요"}
          </p>
        </div>

        {/* Sub Navigation Tabs & Logout Button */}
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 dark:border-zinc-700 rounded overflow-hidden text-xs">
            <button
              onClick={() => setSubTab("SCHEDULE")}
              className={`px-3 py-1.5 font-medium transition-colors ${
                subTab === "SCHEDULE"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              나만의 일정표
            </button>
            <button
              onClick={() => setSubTab("PROFILE")}
              className={`px-3 py-1.5 font-medium transition-colors ${
                subTab === "PROFILE"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              소속/학급 설정
            </button>
            <button
              onClick={() => setSubTab("ALLERGY")}
              className={`px-3 py-1.5 font-medium transition-colors ${
                subTab === "ALLERGY"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              알레르기 설정
            </button>
          </div>

          <button
            onClick={onLogout}
            disabled={signingOut}
            className="px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 text-xs text-gray-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer"
          >
            {signingOut ? "로그아웃 중…" : "로그아웃"}
          </button>
        </div>
      </div>

      {/* Section 1: 나만의 일정표 */}
      {subTab === "SCHEDULE" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              나만의 일정표
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-semibold cursor-pointer"
            >
              + 새 일정 추가
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Calendar Grid */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                    {calendarYear}.{" "}
                    {calendarMonth < 10 ? `0${calendarMonth}` : calendarMonth}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevMonth}
                      className="px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 font-mono cursor-pointer"
                      title="이전 달"
                    >
                      &lt;
                    </button>
                    <button
                      onClick={resetToday}
                      className="px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[11px] cursor-pointer"
                    >
                      오늘
                    </button>
                    <button
                      onClick={nextMonth}
                      className="px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 font-mono cursor-pointer"
                      title="다음 달"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-blue-600"></span> 학교
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-purple-600"></span>{" "}
                    자격증
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-amber-600"></span> 과제
                  </span>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 pb-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="text-red-500">일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div className="text-blue-500">토</div>
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1 mt-2 text-xs">
                {/* 1. Leading days from prev month */}
                {prevMonthTailDays.map((tailDay, idx) => (
                  <div
                    key={`prev-${idx}`}
                    className="h-20 p-1.5 rounded bg-gray-50/40 dark:bg-zinc-800/10 text-gray-300 dark:text-zinc-700 font-mono text-[11px]"
                  >
                    {tailDay}
                  </div>
                ))}

                {/* 2. Current Month Dynamic Days */}
                {currentMonthDays.map((day) => {
                  const isToday =
                    calendarYear === 2026 && calendarMonth === 10 && day === 6;
                  const dayOfWeek = (firstDayIndex + (day - 1)) % 7;
                  const isSunday = dayOfWeek === 0;
                  const isSaturday = dayOfWeek === 6;

                  const dayEvents = personalEvents.filter(
                    (ev) =>
                      ev.year === calendarYear &&
                      ev.month === calendarMonth &&
                      ev.day === day,
                  );

                  return (
                    <div
                      key={day}
                      className={`h-20 p-1.5 rounded border flex flex-col justify-between transition-colors ${
                        isToday
                          ? "border-gray-900 dark:border-white bg-gray-50/80 dark:bg-zinc-800/50"
                          : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            isToday
                              ? "text-gray-900 dark:text-white"
                              : isSunday
                                ? "text-red-500"
                                : isSaturday
                                  ? "text-blue-500"
                                  : "text-gray-500 dark:text-zinc-400"
                          }`}
                        >
                          {day}
                        </span>
                        {isToday && (
                          <span className="text-[9px] px-1 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-bold font-mono">
                            오늘
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[9px] px-1 py-0.5 rounded font-medium truncate ${
                              ev.category === "school"
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                                : ev.category === "cert"
                                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {ev.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* 3. Trailing days from next month */}
                {nextMonthHeadDays.map((headDay, idx) => (
                  <div
                    key={`next-${idx}`}
                    className="h-20 p-1.5 rounded bg-gray-50/40 dark:bg-zinc-800/10 text-gray-300 dark:text-zinc-700 font-mono text-[11px]"
                  >
                    {headDay}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
                <div className="pb-3 border-b border-gray-100 dark:border-zinc-800 mb-3 text-xs font-bold text-gray-900 dark:text-white flex justify-between items-center">
                  <span>오늘의 할 일</span>
                  <span className="font-mono text-gray-400 font-normal">
                    {todos.filter((t) => t.done).length}/{todos.length} 완료
                  </span>
                </div>

                {/* Add Todo input */}
                <form onSubmit={handleAddTodo} className="flex gap-1.5 mb-3">
                  <input
                    type="text"
                    placeholder="새 할 일 추가..."
                    value={newTodoInput}
                    onChange={(e) => setNewTodoInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-white"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer shrink-0"
                  >
                    추가
                  </button>
                </form>

                <div className="space-y-2 text-xs">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      onClick={() => toggleTodo(todo.id)}
                      className={`p-2.5 rounded border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        todo.done
                          ? "border-gray-100 dark:border-zinc-800/60 bg-gray-50/50 dark:bg-zinc-800/20 text-gray-400 line-through"
                          : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-gray-800 dark:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 truncate">
                        <input
                          type="checkbox"
                          checked={todo.done}
                          onChange={() => {}}
                          className="rounded border-gray-300 dark:border-zinc-700 cursor-pointer"
                        />
                        <span className="truncate">{todo.text}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteTodo(todo.id, e)}
                        className="text-gray-400 hover:text-red-500 text-xs px-1 cursor-pointer shrink-0"
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
                <div className="pb-3 border-b border-gray-100 dark:border-zinc-800 mb-3 text-xs font-bold text-gray-900 dark:text-white">
                  D-Day
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded border border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                    <span>정보처리기능사 실기</span>
                    <span className="font-bold font-mono text-gray-900 dark:text-white">
                      D-12
                    </span>
                  </div>
                  <div className="p-2.5 rounded border border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                    <span>기말고사</span>
                    <span className="font-bold font-mono text-gray-900 dark:text-white">
                      D-38
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: 소속 및 학급 설정 */}
      {subTab === "PROFILE" && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              소속 및 학급 설정
            </span>
            <button
              onClick={() => void handleSaveProfile()}
              disabled={profileSaving}
              className="px-3 py-1 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer"
            >
              {profileSaving ? "저장 중…" : "저장"}
            </button>
          </div>

          {profileSaved && (
            <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
              내 계정에 학급 설정을 저장했습니다. 다음 로그인에도 같은 학급이
              표시됩니다.
            </div>
          )}
          {profileError && (
            <p
              role="alert"
              className="rounded bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300"
            >
              {profileError}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            저장한 학급은 대시보드와 시간표의 기본 학급으로 사용됩니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-gray-500 mb-1">소속 학과</label>
              <input
                list="profile-departments"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setProfileSaved(false);
                }}
                disabled={profileSaving}
                maxLength={60}
                placeholder="학과 선택 또는 직접 입력"
                aria-label="소속 학과"
                className="w-full px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              />
              <datalist id="profile-departments">
                {departmentNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">학년</label>
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setProfileSaved(false);
                }}
                disabled={profileSaving}
                className="w-full px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              >
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">반</label>
              <select
                value={classNum}
                onChange={(e) => {
                  setClassNum(e.target.value);
                  setProfileSaved(false);
                }}
                disabled={profileSaving}
                className="w-full px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              >
                {Array.from({ length: 30 }, (_, index) => index + 1).map(
                  (n) => (
                    <option key={n} value={n.toString()}>
                      {n}반
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">번호 (선택)</label>
              <input
                type="number"
                min={1}
                max={99}
                value={studentNum}
                onChange={(e) => {
                  setStudentNum(e.target.value);
                  setProfileSaved(false);
                }}
                disabled={profileSaving}
                placeholder="생략 가능"
                className="w-full px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 3: 알레르기 설정 */}
      {subTab === "ALLERGY" && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              알레르기 설정
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              선택한 성분은 급식 식단표에서 하이라이트로 표시됩니다.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            {allergyList.map((item) => {
              const isChecked = selectedAllergies.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAllergy(item)}
                  className={`p-2 rounded border text-left flex justify-between items-center transition-colors ${
                    isChecked
                      ? "border-gray-900 dark:border-white bg-gray-100 dark:bg-zinc-800 font-semibold text-gray-900 dark:text-white"
                      : "border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  <span>{item}</span>
                  <span className="font-mono text-[11px]">
                    {isChecked ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddEvent}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg w-full max-w-md p-5 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                새 일정 등록 ({calendarYear}년 {calendarMonth}월)
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">일정명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 수행평가 보고서 제출, 기능사 필기"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:border-gray-900 dark:focus:border-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1">일자 (일)</label>
                  <select
                    value={newEventDay}
                    onChange={(e) => setNewEventDay(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  >
                    {currentMonthDays.map((d) => (
                      <option key={d} value={d}>
                        {d}일
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">카테고리</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) =>
                      setNewEventCategory(
                        e.target.value as "school" | "cert" | "task",
                      )
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  >
                    <option value="school">학교</option>
                    <option value="cert">자격증</option>
                    <option value="task">과제</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 cursor-pointer"
              >
                닫기
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-semibold cursor-pointer"
              >
                등록
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
