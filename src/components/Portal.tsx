"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DEFAULT_STUDENT_PROFILE } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import DashboardView from "@/components/DashboardView";
import MealView from "@/components/MealView";
import TimetableView from "@/components/TimetableView";
import ScheduleView from "@/components/ScheduleView";
import CareerView from "@/components/CareerView";
import FreeBoardView from "@/components/FreeBoardView";
import QnABoardView from "@/components/QnABoardView";
import FreshmanView from "@/components/FreshmanView";
import MyPageView from "@/components/MyPageView";
import ChatbotWidget from "@/components/ChatbotWidget";
import LoginModal from "@/components/LoginModal";
import SchoolInfoView from "@/components/SchoolInfoView";

export default function Portal({
  initialTab,
  initialAuthError,
}: {
  initialTab: string;
  initialAuthError: string | null;
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const auth = useAuth();
  const isLoggedIn = Boolean(auth.user);
  const studentUser = auth.studentUser ?? DEFAULT_STUDENT_PROFILE;
  const [callbackError, setCallbackError] = useState(initialAuthError);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const openLogin = useCallback(() => setShowLoginModal(true), []);
  const closeLogin = useCallback(() => setShowLoginModal(false), []);

  // Toggle dark class on html document element
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  useEffect(() => {
    // Default light mode
    document.documentElement.classList.remove("dark");
  }, []);
  const handleLogout = () => {
    void auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090B] text-gray-900 dark:text-zinc-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isLoggedIn={isLoggedIn}
        authLoading={auth.loading}
        signingOut={auth.signingOut}
        onOpenLogin={openLogin}
        onLogout={handleLogout}
        userData={isLoggedIn ? studentUser : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {(callbackError || auth.error) && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 flex items-center justify-between gap-3 text-xs text-red-700 dark:text-red-300"
          >
            <span>{callbackError || auth.error}</span>
            <button
              onClick={() => {
                setCallbackError(null);
                auth.clearError();
                const url = new URL(window.location.href);
                url.searchParams.delete("auth_error");
                window.history.replaceState(null, "", url);
              }}
              className="shrink-0 underline cursor-pointer"
              aria-label="로그인 안내 닫기"
            >
              닫기
            </button>
          </div>
        )}
        {activeTab === "main" && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            isLoggedIn={isLoggedIn}
            studentUser={studentUser}
            onOpenLogin={openLogin}
          />
        )}
        {activeTab === "meal" && <MealView />}
        {activeTab === "school" && <SchoolInfoView />}
        {activeTab === "timetable" && (
          <TimetableView userData={studentUser} isLoggedIn={isLoggedIn} />
        )}
        {activeTab === "schedule" && <ScheduleView />}
        {activeTab === "career" && <CareerView />}
        {activeTab === "free" && (
          <FreeBoardView
            isLoggedIn={isLoggedIn}
            userId={auth.user?.id}
            onOpenLogin={openLogin}
          />
        )}
        {activeTab === "qna" && (
          <QnABoardView
            isLoggedIn={isLoggedIn}
            userId={auth.user?.id}
            onOpenLogin={openLogin}
          />
        )}
        {activeTab === "freshman" && (
          <FreshmanView onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === "mypage" && auth.loading && (
          <p role="status" className="py-12 text-center text-sm text-gray-500">
            로그인 상태를 확인하는 중입니다…
          </p>
        )}
        {activeTab === "mypage" && !auth.loading && (
          <MyPageView
            key={auth.user?.id ?? "guest"}
            isLoggedIn={isLoggedIn}
            onOpenLogin={openLogin}
            onLogout={handleLogout}
            signingOut={auth.signingOut}
            userData={studentUser}
            onUpdateUserData={auth.updateProfile}
          />
        )}
      </main>

      {/* Student Authentication Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen
          configured={auth.configured}
          onClose={closeLogin}
          onSignIn={() => auth.signInWithGitHub(activeTab)}
        />
      )}

      {/* AI Chatbot Floating Skeleton Widget */}
      <ChatbotWidget />

      {/* Clean Minimalist Footer */}
      <footer className="mt-auto border-t border-gray-100 dark:border-zinc-800 py-6 px-4 text-center text-xs text-gray-400 dark:text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>대진전자통신고등학교 학생 포털</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("schedule")}
              className="hover:text-gray-900 dark:hover:text-zinc-300 transition-colors"
            >
              학사일정
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab("career")}
              className="hover:text-gray-900 dark:hover:text-zinc-300 transition-colors"
            >
              취업·진학
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab("freshman")}
              className="hover:text-gray-900 dark:hover:text-zinc-300 transition-colors"
            >
              신입생 안내
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab("mypage")}
              className="hover:text-gray-900 dark:hover:text-zinc-300 transition-colors"
            >
              마이페이지
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
