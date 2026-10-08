"use client";

import { useEffect, useRef, useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  configured: boolean;
  onClose: () => void;
  onSignIn: () => Promise<void>;
}

export default function LoginModal({
  isOpen,
  configured,
  onClose,
  onSignIn,
}: LoginModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      );
      if (!buttons?.length) return;
      const first = buttons[0],
        last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const login = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await onSignIn();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "로그인을 다시 시도해 주세요.",
      );
      setPending(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        aria-describedby="login-description"
        className="w-full max-w-md rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-5"
      >
        <div className="flex justify-between items-center gap-3">
          <h2 id="login-title" className="text-lg font-bold">
            GitHub로 로그인
          </h2>
          <button
            ref={closeButton}
            onClick={onClose}
            aria-label="로그인 창 닫기"
            className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <p
          id="login-description"
          className="text-sm leading-relaxed text-gray-500 dark:text-zinc-400"
        >
          GitHub 계정으로 로그인하고 내 학급을 저장하세요. 처음 로그인하면
          계정이 자동으로 만들어집니다.
        </p>
        {!configured && (
          <p
            role="status"
            className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300"
          >
            GitHub 로그인 준비 중입니다. 학교 정보와 시간표는 로그인 없이 이용할
            수 있습니다.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300"
          >
            {error}
          </p>
        )}
        <button
          onClick={() => void login()}
          disabled={!configured || pending}
          className="w-full rounded-lg bg-[#24292f] text-white py-3 px-4 flex items-center justify-center gap-3 text-sm font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#32383f] transition-colors"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-current"
          >
            <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.33-3.8-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.71.08-.7.08-.7 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.64 1.23 3.29.94.1-.73.4-1.23.72-1.51-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.15 3.1-1.15.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.26-5.15 5.54.4.35.77 1.04.77 2.1v3.1c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75Z" />
          </svg>
          {pending ? "GitHub로 이동 중…" : "GitHub로 계속하기"}
        </button>
        <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-2 text-xs text-gray-500 dark:text-zinc-400">
          <p>학교 정보·급식·시간표·학사일정은 로그인 없이 볼 수 있습니다.</p>
          <button
            onClick={onClose}
            className="font-semibold text-gray-900 dark:text-white hover:underline cursor-pointer"
          >
            로그인 없이 계속 보기 →
          </button>
        </div>
      </section>
    </div>
  );
}
