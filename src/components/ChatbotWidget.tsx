"use client";

import React, { useState } from "react";

interface ChatMessage {
  id: number;
  sender: "bot" | "user";
  text: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      text: "안녕하세요! 대진 AI 챗봇 D_Bot입니다. 급식, 시간표, 학사일정 등에 대해 질문해 보세요.",
    },
  ]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text,
    };

    let reply = "D_Bot이 확인 중입니다. 상단 메뉴의 [급식], [시간표], [학사일정] 탭에서도 실시간 확인이 가능합니다.";

    if (text.includes("급식")) {
      reply = "급식 식단 정보는 나이스(NEIS) 오픈 API 연동 후 실시간으로 제공됩니다. 상단 [급식] 메뉴를 확인해 주세요.";
    } else if (text.includes("시간표") || text.includes("교시")) {
      reply = "시간표 정보는 나이스(NEIS) 고교시간표 API 연동 후 학과 및 학급별로 실시간 제공됩니다. 상단 [시간표] 메뉴를 확인해 주세요.";
    } else if (text.includes("시험") || text.includes("D-Day") || text.includes("중간고사")) {
      reply = "2학기 1차 지필평가(중간고사)는 10월 14일(수)부터 시작됩니다. D-8 남았습니다!";
    } else if (text.includes("자격증")) {
      reply = "국가기술자격증 실기시험은 10월 18일 예정입니다. [학사일정] 탭을 확인해 보세요.";
    } else if (text.includes("학과")) {
      reply = "대진전자통신고등학교에는 AI소프트웨어과, 로봇전자과, 전기전자과, 산업디자인과 4개 학과가 개설되어 있습니다.";
    }

    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: reply,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText("");
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-11 px-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-lg hover:bg-gray-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-2 border border-gray-300 dark:border-zinc-700 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{isOpen ? "닫기" : "챗봇상담"}</span>
        </button>
      </div>

      {/* Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-84 max-w-[calc(100vw-3rem)] h-96 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden text-xs">
          {/* Header */}
          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-gray-900 dark:text-white">
                D_Bot
              </span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                대진 AI 도우미
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 mb-0.5 ml-1 font-mono">
                    D_Bot
                  </span>
                )}
                <div
                  className={`p-2.5 rounded max-w-[85%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-zinc-900"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Chips */}
          <div className="p-2 border-t border-gray-100 dark:border-zinc-800 flex gap-1 overflow-x-auto text-[11px] bg-gray-50/50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={() => handleSendMessage("오늘 급식 알려줘")}
              className="px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-900 dark:hover:border-white whitespace-nowrap cursor-pointer"
            >
              오늘 급식
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("다음 교시 뭐야?")}
              className="px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-900 dark:hover:border-white whitespace-nowrap cursor-pointer"
            >
              다음 교시
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("중간고사 시험 D-Day")}
              className="px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-900 dark:hover:border-white whitespace-nowrap cursor-pointer"
            >
              시험 D-Day
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("학과 안내해줘")}
              className="px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-900 dark:hover:border-white whitespace-nowrap cursor-pointer"
            >
              학과 안내
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex gap-1.5"
          >
            <input
              type="text"
              placeholder="D_Bot에게 질문하세요..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded border border-gray-200 dark:border-zinc-700 text-xs bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs cursor-pointer"
            >
              전송
            </button>
          </form>
        </div>
      )}
    </>
  );
}
