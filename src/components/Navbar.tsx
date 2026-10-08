"use client";

import React from "react";
import type { StudentUser } from "@/lib/auth";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLoggedIn: boolean;
  authLoading?: boolean;
  signingOut?: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  userData?: StudentUser;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  isLoggedIn,
  authLoading = false,
  signingOut = false,
  onOpenLogin,
  onLogout,
  userData,
}: NavbarProps) {
  const navItems = [
    { id: "main", label: "메인" },
    { id: "school", label: "학교 정보" },
    { id: "meal", label: "급식" },
    { id: "timetable", label: "시간표" },
    { id: "schedule", label: "학사일정" },
    { id: "career", label: "취업·진학" },
    { id: "free", label: "자유게시판" },
    { id: "qna", label: "질문게시판" },
    { id: "freshman", label: "신입생 정보" },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Format department shorthand
  const getDeptShort = (dept?: string) => {
    if (!dept) return "";
    if (dept.includes("AI")) return "AI";
    if (dept.includes("로봇")) return "로봇";
    if (dept.includes("전기")) return "전기";
    if (dept.includes("디자인")) return "디자인";
    return dept.slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("main")}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm tracking-tight">
              DJ
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight">
                대진전자통신고
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Dark Mode Toggle & Login / Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Switch */}
          <button
            onClick={toggleDarkMode}
            className="px-2.5 py-1 text-xs font-medium rounded border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {isDarkMode ? "라이트모드" : "다크모드"}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {/* Personal account and saved class */}
              <button
                onClick={() => setActiveTab("mypage")}
                title="마이페이지로 이동"
                className={`px-3 py-1.5 rounded border text-left cursor-pointer transition-colors flex items-center gap-2 ${
                  activeTab === "mypage"
                    ? "border-gray-900 dark:border-white bg-gray-100 dark:bg-zinc-800"
                    : "border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center">
                  MY
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                    내 계정
                  </span>
                  {userData?.profileComplete && (
                    <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                      {getDeptShort(userData.department)} {userData.grade}-
                      {userData.classNum}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={onLogout}
                disabled={signingOut}
                className="px-2.5 py-1 text-xs rounded border border-gray-200 dark:border-zinc-700 text-gray-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer"
              >
                {signingOut ? "로그아웃 중…" : "로그아웃"}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              disabled={authLoading}
              className="px-3.5 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-gray-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer shadow-xs"
            >
              {authLoading ? "로그인 확인 중…" : "GitHub 로그인"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Scrollbar */}
      <div className="xl:hidden flex items-center gap-1 px-4 py-2 border-t border-gray-100 dark:border-zinc-800 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800/60"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
