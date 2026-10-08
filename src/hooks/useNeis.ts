"use client";

import { useEffect, useState } from "react";
import type { NeisDataset, NeisResponse } from "@/lib/neis";

export function useNeis<K extends NeisDataset>(
  dataset: K,
  params: Record<string, string> = {},
  enabled = true,
) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    result?: NeisResponse<K>;
    error?: string;
  } | null>(null);
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== "")
      .sort(([a], [b]) => a.localeCompare(b)),
  ).toString();
  const url = `/api/neis/${dataset}${query ? `?${query}` : ""}`;
  const key = `${url}#${revision}`;

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "정보를 불러오지 못했습니다.");
        if (!controller.signal.aborted)
          setState({ key, result: payload as NeisResponse<K> });
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            key,
            error:
              error instanceof Error
                ? error.message
                : "연결을 확인하고 다시 시도해 주세요.",
          });
      }
    }
    void load();
    return () => controller.abort();
  }, [url, key, enabled]);

  const current = enabled && state?.key === key ? state : null;
  return {
    data: current?.result?.data ?? null,
    meta: current?.result?.meta ?? null,
    loading: enabled && current === null,
    error: current?.error ?? null,
    reload: () => setRevision((value) => value + 1),
  };
}
