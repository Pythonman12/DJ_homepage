// Shared types and formatting only. The authentication key stays in neis-server.ts.
export const SCHOOL_NAME = "대진전자통신고등학교";
export const NEIS_PORTAL =
  "https://open.neis.go.kr/portal/data/dataset/searchDatasetPage.do";

export interface SchoolInfo {
  name: string;
  englishName: string;
  office: string;
  region: string;
  kind: string;
  establishment: string;
  highSchoolType: string;
  coeducation: string;
  course: string;
  address: string;
  postcode: string;
  phone: string;
  fax: string;
  website: string;
  founded: string;
  anniversary: string;
}

export interface Meal {
  date: string;
  code: string;
  name: string;
  dishes: string[];
  calories: string;
  nutrition: string[];
  origins: string[];
}

export interface Lesson {
  date: string;
  period: number;
  subject: string;
  department: string;
  grade: string;
  className: string;
  classroom: string;
}

export interface SchoolEvent {
  date: string;
  title: string;
  description: string;
  type: "EXAM" | "EVENT" | "HOLIDAY";
  target: string;
  dayType: string;
}

export interface SchoolClass {
  year: string;
  grade: string;
  className: string;
  department: string;
  course: string;
}

export interface Department {
  name: string;
  affiliation: string;
  course: string;
}

export interface NeisData {
  school: SchoolInfo | null;
  meals: Meal[];
  timetable: Lesson[];
  schedule: SchoolEvent[];
  classes: SchoolClass[];
  departments: Department[];
}

export type NeisDataset = keyof NeisData;
export interface NeisMeta {
  source: "NEIS";
  mode: "public" | "api";
  partial: boolean;
  totalCount: number;
  returnedCount: number;
  fetchedAt: string;
  updatedAt: string;
}
export interface NeisResponse<K extends NeisDataset> {
  data: NeisData[K];
  meta: NeisMeta;
}

// Date-only arithmetic uses UTC so that the browser's timezone cannot move a day.
export function koreaToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function addDays(date: string, count: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
}

export function weekDates(date: string): string[] {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  const monday = addDays(date, -((day + 6) % 7));
  return Array.from({ length: 5 }, (_, index) => addDays(monday, index));
}

export function academicYear(date: string): string {
  const year = Number(date.slice(0, 4));
  return String(Number(date.slice(5, 7)) < 3 ? year - 1 : year);
}

export function displayDate(date: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function daysUntil(date: string, today: string): number {
  return Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86400000,
  );
}

export function withoutAllergyNumbers(dish: string): string {
  return dish.replace(/\s*\(\d+(?:\.\d+)*\.?\)/g, "").trim();
}
