"use client";

import React, { useState } from "react";

export default function CareerView() {
  const [activeTab, setActiveTab] = useState<"EMPLOYMENT" | "COLLEGE">("EMPLOYMENT");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            취업·진학 안내
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            대진전자통신고등학교 맞춤형 취업 지원, 병역특례 및 대학 진학 로드맵
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex border border-gray-200 dark:border-zinc-700 rounded overflow-hidden text-xs">
          <button
            onClick={() => setActiveTab("EMPLOYMENT")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              activeTab === "EMPLOYMENT"
                ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
                : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
            }`}
          >
            취업 지원
          </button>
          <button
            onClick={() => setActiveTab("COLLEGE")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              activeTab === "COLLEGE"
                ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
                : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
            }`}
          >
            대학 진학
          </button>
        </div>
      </div>

      {/* Section 1: 취업 지원 */}
      {activeTab === "EMPLOYMENT" && (
        <div className="space-y-6">
          {/* Core Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Card 1: 산학일체형 도제학교 */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  산학일체형 도제학교
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-gray-600 dark:text-zinc-300">
                  조기 취업
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                학교와 협약 기업을 오가며 현장 직무 훈련(OJT)과 학교 교육을 병행하여 3학년 재학 중 조기 취업을 확정 짓는 고용노동부 주관 프로그램입니다.
              </p>
              <ul className="text-xs text-gray-500 dark:text-zinc-400 space-y-1 pt-1">
                <li>• 훈련 수당 및 장학금 지급</li>
                <li>• 기업 맞춤형 실무 기술 습득</li>
                <li>• 졸업과 동시에 정규직 전환 연계</li>
              </ul>
            </div>

            {/* Card 2: 병역특례 (산업기능요원) */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  병역특례 (산업기능요원)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-gray-600 dark:text-zinc-300">
                  군 대체복무
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                특성화고 졸업생은 병역지정업체에 취업하여 정규 급여를 받으며 군 복무를 산업체 근무로 대체할 수 있는 우대 혜택을 받습니다.
              </p>
              <ul className="text-xs text-gray-500 dark:text-zinc-400 space-y-1 pt-1">
                <li>• 군 복무 중단 없는 연속적인 경력 개발</li>
                <li>• 일반 사원과 동일한 정규 급여 및 수당</li>
                <li>• 복무 만료 후 핵심 기술 인력으로 정착</li>
              </ul>
            </div>

            {/* Card 3: 공채 및 자격증 대비반 */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  공채 및 기능사 자격증
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-gray-600 dark:text-zinc-300">
                  역량 강화
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                대기업, 공기업 고졸 공채(NCS 직업기초능력) 및 학과별 국가기술자격증 필기/실기 집중 취득 방과후 클래스를 운영합니다.
              </p>
              <ul className="text-xs text-gray-500 dark:text-zinc-400 space-y-1 pt-1">
                <li>• NCS 직무시험 및 전공 필기 지도</li>
                <li>• 모의 면접, 자기소개서 1:1 클리닉</li>
                <li>• 1인 2개 이상 전공 국가기술자격증 취득</li>
              </ul>
            </div>

          </div>

          {/* Department Certificate Roadmap for the 4 Departments */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-zinc-800">
              학과별 취업 및 자격증 로드맵
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20 space-y-1">
                <span className="font-bold text-gray-900 dark:text-white">AI소프트웨어과</span>
                <p className="text-gray-500">정보처리기능사, SQLD, 리눅스마스터</p>
                <p className="text-gray-400 text-[11px]">취업처: IT 솔루션, 웹/앱 개발사</p>
              </div>
              <div className="p-3 rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20 space-y-1">
                <span className="font-bold text-gray-900 dark:text-white">로봇전자과</span>
                <p className="text-gray-500">전자캐드기능사, 생산자동화기능사</p>
                <p className="text-gray-400 text-[11px]">취업처: 로봇 제조, 스마트 팩토리</p>
              </div>
              <div className="p-3 rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20 space-y-1">
                <span className="font-bold text-gray-900 dark:text-white">전기전자과</span>
                <p className="text-gray-500">전기기능사, 전자기기기능사, 무선설비</p>
                <p className="text-gray-400 text-[11px]">취업처: 전력 공기업, 설비 엔지니어링</p>
              </div>
              <div className="p-3 rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20 space-y-1">
                <span className="font-bold text-gray-900 dark:text-white">산업디자인과</span>
                <p className="text-gray-500">컴퓨터그래픽스운용기능사, 제품디자인</p>
                <p className="text-gray-400 text-[11px]">취업처: 산업/제품 디자인, UI/UX</p>
              </div>
            </div>
          </div>

          {/* Consultation Box */}
          <div className="p-4 rounded border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 text-xs text-gray-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-gray-900 dark:text-white">교내 취업진로지원부 안내:</span> 본관 4층 진로상담실
            </div>
            <button className="px-3 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold whitespace-nowrap self-start sm:self-auto">
              1:1 취업 상담 신청
            </button>
          </div>
        </div>
      )}

      {/* Section 2: 대학 진학 */}
      {activeTab === "COLLEGE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* College Card 1: 재직자 특별전형 */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  재직자 특별전형 (선취업 후진학)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-gray-600 dark:text-zinc-300">
                  선취업 후진학
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                특성화고 졸업 후 산업체에서 3년 이상 재직 시, 수능 성적 없이 재직 경력과 서류/면접만으로 주요 4년제 대학교 야간/주말 학위 과정에 진학할 수 있는 국가 지원 전형입니다.
              </p>
              <div className="p-3 rounded bg-gray-50 dark:bg-zinc-800/40 text-xs text-gray-600 dark:text-zinc-300 space-y-1">
                <div className="font-semibold text-gray-900 dark:text-white">진학 가능 주요 대학 예시</div>
                <p>• 수도권: 중앙대, 한양대, 건국대, 동국대, 숭실대 등</p>
                <p>• 영남권: 부산대, 부경대, 동아대 등 국립 및 사립 주요대</p>
                <p>• 등록금 국비 지원 (희망사다리 장학금 최대 100% 지원)</p>
              </div>
            </div>

            {/* College Card 2: 특성화고교 특별전형 */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  특성화고 졸업자 정원 외 특별전형
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-gray-600 dark:text-zinc-300">
                  수시 지원
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                고등학교에서 이수한 전공과 동일계열 학과로 대학교에 진학하고자 할 때, 일반고 학생들과 경쟁하지 않고 특성화고 학생들끼리 정원 외로 경쟁하여 수시 입학하는 전형입니다.
              </p>
              <div className="p-3 rounded bg-gray-50 dark:bg-zinc-800/40 text-xs text-gray-600 dark:text-zinc-300 space-y-1">
                <div className="font-semibold text-gray-900 dark:text-white">전형 특징 및 유의사항</div>
                <p>• 학교생활기록부 교과(내신) 성적 중심 선발</p>
                <p>• 고등학교 전공 학과와 대학 학과의 동일계열 기준 확인 필요</p>
                <p>• 전공 관련 자격증 가산점 및 실기 우대 반영</p>
              </div>
            </div>

          </div>

          {/* High-skilled P-TECH Program */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-zinc-800">
              P-TECH (고숙련 일학습병행 학위 연계)
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
              도제학교를 이수한 학생이 취업한 기업에 계속 재직하면서 연계된 전문대학에 진학하여 전액 국비 장학금으로 전문학사 학위를 취득할 수 있는 고용노동부 주관 고숙련 기술 인재 육성 제도입니다.
            </p>
          </div>

          {/* Consultation Box */}
          <div className="p-4 rounded border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 text-xs text-gray-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-gray-900 dark:text-white">교내 진학상담실 안내:</span> 본관 4층 진로상담실
            </div>
            <button className="px-3 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold whitespace-nowrap self-start sm:self-auto">
              1:1 진학 상담 신청
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
