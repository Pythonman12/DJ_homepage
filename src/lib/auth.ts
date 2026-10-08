import type { User } from "@supabase/supabase-js";

export interface StudentProfile {
  department: string;
  grade: string;
  classNum: string;
  studentNum: string;
}

export interface StudentUser extends StudentProfile {
  id?: string;
  githubUsername?: string;
  profileComplete?: boolean;
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  department: "",
  grade: "1",
  classNum: "4",
  studentNum: "",
};

export const PORTAL_TABS = [
  "main",
  "school",
  "meal",
  "timetable",
  "schedule",
  "career",
  "free",
  "qna",
  "freshman",
  "mypage",
] as const;

export function portalTab(value: string | null | undefined): string {
  return PORTAL_TABS.includes(value as (typeof PORTAL_TABS)[number])
    ? value!
    : "main";
}

export function validateStudentProfile(
  profile: StudentProfile,
): StudentProfile {
  const department = profile.department.trim();
  const grade = profile.grade.trim();
  const classNum = profile.classNum.trim();
  const studentNum = profile.studentNum.trim();
  if (!department || department.length > 60)
    throw new Error("학과를 선택해 주세요.");
  if (!/^[123]$/.test(grade))
    throw new Error("학년은 1~3학년 중에서 선택해 주세요.");
  if (
    !/^\d{1,2}$/.test(classNum) ||
    Number(classNum) < 1 ||
    Number(classNum) > 30
  ) {
    throw new Error("반 번호는 1~30 사이로 입력해 주세요.");
  }
  if (
    studentNum &&
    (!/^\d{1,2}$/.test(studentNum) ||
      Number(studentNum) < 1 ||
      Number(studentNum) > 99)
  ) {
    throw new Error("번호는 1~99 사이로 입력하거나 비워 두세요.");
  }
  return {
    department,
    grade,
    classNum: String(Number(classNum)),
    studentNum: studentNum ? String(Number(studentNum)) : "",
  };
}

export function studentFromUser(user: User): StudentUser {
  const saved: unknown = user.user_metadata.student_profile;
  let profile = DEFAULT_STUDENT_PROFILE;
  let profileComplete = false;
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    const fields = saved as Record<string, unknown>;
    try {
      profile = validateStudentProfile({
        department:
          typeof fields.department === "string" ? fields.department : "",
        grade: typeof fields.grade === "string" ? fields.grade : "",
        classNum: typeof fields.classNum === "string" ? fields.classNum : "",
        studentNum:
          typeof fields.studentNum === "string" ? fields.studentNum : "",
      });
      profileComplete = true;
    } catch {
      // Profile metadata is a user's preference, never proof of enrollment.
    }
  }
  const username: unknown =
    user.user_metadata.user_name ?? user.user_metadata.preferred_username;
  return {
    ...profile,
    id: user.id,
    githubUsername:
      typeof username === "string" ? username.slice(0, 100) : "GitHub 사용자",
    profileComplete,
  };
}
