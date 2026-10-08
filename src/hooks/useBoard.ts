"use client";

import { useEffect, useRef, useState } from "react";

export class BoardRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}

export async function boardRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    credentials: "same-origin",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new BoardRequestError(
      payload.error || "게시판 정보를 처리하지 못했습니다.",
      response.status,
      payload.code || "BOARD_ERROR",
    );
  }
  return payload as T;
}

export function boardErrorMessage(error: unknown) {
  return error instanceof BoardRequestError
    ? error.message
    : "게시판에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function useBoard<T>(url: string | null, identity: string) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    data?: T;
    error?: string;
  } | null>(null);
  const sequence = useRef(0);
  const key = (url ?? "") + "|" + identity + "|" + revision;

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    async function load() {
      const requestNumber = ++sequence.current;
      try {
        const data = await boardRequest<T>(url!, { signal: controller.signal });
        if (!controller.signal.aborted && requestNumber === sequence.current) {
          setState({ key, data });
        }
      } catch (error) {
        if (!controller.signal.aborted && requestNumber === sequence.current) {
          setState((previous) => ({
            key,
            data: previous?.key === key ? previous.data : undefined,
            error: boardErrorMessage(error),
          }));
        }
      }
    }
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void load();
    }
    void load();
    const timer = window.setInterval(refreshWhenVisible, 20_000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [url, key]);

  const current = url && state?.key === key ? state : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: Boolean(url && !current),
    reload: () => setRevision((value) => value + 1),
  };
}

export function useBoardSearch(value: string) {
  const [query, setQuery] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(value.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [value]);
  return query;
}
