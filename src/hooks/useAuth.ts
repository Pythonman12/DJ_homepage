"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  portalTab,
  studentFromUser,
  validateStudentProfile,
  type StudentProfile,
} from "@/lib/auth";

export function useAuth() {
  const configured = Boolean(getSupabaseConfig());
  const [state, setState] = useState<{
    user: User | null;
    loading: boolean;
    error: string | null;
  }>({ user: null, loading: configured, error: null });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const client = createClient();
    if (!client) return;
    let alive = true;
    let version = 0;
    const startVersion = version;
    // Keep this callback synchronous: calling other Auth methods inside it
    // can deadlock Supabase's session lock.
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      version++;
      if (alive)
        setState({ user: session?.user ?? null, loading: false, error: null });
    });
    void client.auth
      .getUser()
      .then(({ data, error }) => {
        if (!alive || version !== startVersion) return;
        setState({
          user: data.user,
          loading: false,
          error:
            error && error.name !== "AuthSessionMissingError"
              ? "로그인 상태를 확인하지 못했습니다. 다시 로그인해 주세요."
              : null,
        });
      })
      .catch(() => {
        if (alive && version === startVersion)
          setState({
            user: null,
            loading: false,
            error: "로그인 서버 연결을 확인하고 다시 시도해 주세요.",
          });
      });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const studentUser = useMemo(
    () => (state.user ? studentFromUser(state.user) : undefined),
    [state.user],
  );

  async function signInWithGitHub(tab: string) {
    const client = createClient();
    if (!client)
      throw new Error(
        "아직 GitHub 로그인이 준비되지 않았습니다. 사이트 운영자에게 문의해 주세요.",
      );
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("tab", portalTab(tab));
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: callback.href, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw new Error();
      window.location.assign(data.url);
    } catch {
      throw new Error(
        "GitHub 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  }

  async function signOut() {
    const client = createClient();
    if (!client || signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      setState({ user: null, loading: false, error: null });
    } catch {
      setState((current) => ({
        ...current,
        error: "로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      }));
    } finally {
      setSigningOut(false);
    }
  }

  async function updateProfile(profile: StudentProfile) {
    const client = createClient();
    if (!client || !state.user)
      throw new Error("먼저 GitHub로 로그인해 주세요.");
    const validated = validateStudentProfile(profile);
    try {
      const { data, error } = await client.auth.updateUser({
        data: { student_profile: validated },
      });
      if (error || !data.user) throw new Error();
      setState((current) =>
        current.user?.id === data.user!.id
          ? { ...current, user: data.user, error: null }
          : current,
      );
    } catch {
      throw new Error(
        "학급 정보를 저장하지 못했습니다. 연결을 확인하고 다시 시도해 주세요.",
      );
    }
  }

  return {
    ...state,
    configured,
    studentUser,
    signingOut,
    signInWithGitHub,
    signOut,
    updateProfile,
    clearError: () => setState((current) => ({ ...current, error: null })),
  };
}
