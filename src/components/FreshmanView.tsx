"use client";

import React, { useState } from "react";

interface FreshmanViewProps {
  onNavigate?: (tab: string) => void;
}

export default function FreshmanView({ onNavigate }: FreshmanViewProps) {
  const [activeSection, setActiveSection] = useState<"DEPARTMENTS" | "TRAFFIC">("DEPARTMENTS");

  const sections = [
    { id: "DEPARTMENTS" as const, label: "4개 학과 안내" },
    { id: "TRAFFIC" as const, label: "교통편 안내" },
  ];

  const departments = [
    {
      name: "AI소프트웨어과",
      desc: "인공지능 알고리즘, C언어, Python, 웹/모바일 앱 개발 및 데이터베이스 프로그래밍 실무 교육",
      certs: "정보처리기능사, 네트워크관리사, SQLD",
    },
    {
      name: "로봇전자과",
      desc: "로봇 기구 제어, 아두이노/라즈베리파이 마이크로컨트롤러, 임베디드 시스템 및 스마트 팩토리 자동화",
      certs: "전자캐드기능사, 전자기기기능사, 생산자동화기능사",
    },
    {
      name: "전기전자과",
      desc: "전기 회로 제어, 전력 설비, 시퀀스 제어, 반도체 기초 및 디지털 전자 하드웨어 실습",
      certs: "전기기능사, 전자기기기능사, 전자캐드기능사",
    },
    {
      name: "산업디자인과",
      desc: "제품 디자인, 3D 모델링, 시각 디자인, UI/UX 인터페이스 설계 및 디지털 미디어 콘텐츠 제작 실무",
      certs: "컴퓨터그래픽스운용기능사, 제품디자인, 웹디자인기능사",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
            대진전자통신고등학교
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            신입생 정보
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            4대 개설 학과 소개 및 학교 위치 교통편 안내
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 text-xs">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeSection === sec.id
                  ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900"
                  : "border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section: Departments */}
      {activeSection === "DEPARTMENTS" && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-gray-900 dark:text-white">
            개설 4개 학과 소개
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1.5">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                    {dept.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>주요 자격증: {dept.certs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section: Traffic */}
      {activeSection === "TRAFFIC" && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-4 text-xs">
          <div className="font-bold text-sm text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-zinc-800">
            학교 위치 및 교통편
          </div>
          <div className="space-y-2.5 text-gray-600 dark:text-zinc-400 leading-relaxed">
            <p>• <strong>지하철:</strong> 부산도시철도 1호선 장전역 1번/3번 출구 (도보 약 10분)</p>
            <p>• <strong>시내버스:</strong> 대진전자통신고교 정류장 및 장전초등학교 정류장 하차</p>
            <p>• <strong>주소:</strong> 부산광역시 금정구 장전로 92 (장전동 302-3)</p>
            <p>• <strong>대표전화:</strong> 051-510-1200</p>
          </div>
        </div>
      )}

      {/* Question Board Guidance Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            다른 궁금한 사항이 있으신가요?
          </h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
            입학 전형, 전공 과목, 통학, 실습, 자격증 준비 등 더 궁금한 점은 질문게시판에 남겨주시면 재학생 선배들과 선생님들이 자세히 답변해 드립니다.
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate("qna")}
            className="px-4 py-2 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold whitespace-nowrap self-start sm:self-auto hover:bg-gray-800 dark:hover:bg-zinc-100 transition-colors"
          >
            질문게시판에 물어보기 &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
