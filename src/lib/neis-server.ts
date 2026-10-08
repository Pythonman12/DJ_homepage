import {
  academicYear,
  addDays,
  isIsoDate,
  koreaToday,
  SCHOOL_NAME,
  weekDates,
  type NeisData,
  type NeisDataset,
  type NeisResponse,
  type SchoolEvent,
} from "@/lib/neis";

// Verified against NEIS schoolInfo on 2026-10-08. These routes serve only this school.
const OFFICE_CODE = "C10";
const SCHOOL_CODE = "7150597";
const BASE_URL = "https://open.neis.go.kr/hub/";
const PUBLIC_URL =
  "https://open.neis.go.kr/portal/data/sheet/searchSheetData.do";
const SERVICES: Record<NeisDataset, string> = {
  school: "schoolInfo",
  meals: "mealServiceDietInfo",
  timetable: "hisTimetable",
  schedule: "SchoolSchedule",
  classes: "classInfo",
  departments: "schoolMajorinfo",
};
// The portal's public SHEET search is available without an API key. Include
// every search field, including empty fields, as the public form does.
const SHEETS: Record<NeisDataset, { id: string; fields: string[] }> = {
  school: {
    id: "OPEN17020190531110010104913",
    fields: ["SCHUL_KND_SC_NM", "LCTN_SC_NM", "FOND_SC_NM"],
  },
  meals: {
    id: "OPEN17320190722180924242823",
    fields: ["MMEAL_SC_NM", "MLSV_YMD"],
  },
  timetable: {
    id: "OPEN18620200826103326268120",
    fields: [
      "AY",
      "SEM",
      "ALL_TI_YMD",
      "DGHT_CRSE_SC_NM",
      "ORD_SC_NM",
      "DDDEP_NM",
      "GRADE",
      "CLRM_NM",
      "CLASS_NM",
      "PERIO",
    ],
  },
  schedule: {
    id: "OPEN17220190722175038389180",
    fields: ["DGHT_CRSE_SC_NM", "SCHUL_CRSE_SC_NM", "AA_YMD"],
  },
  classes: {
    id: "OPEN15320190408174919197546",
    fields: [
      "AY",
      "GRADE",
      "DGHT_CRSE_SC_NM",
      "SCHUL_CRSE_SC_NM",
      "ORD_SC_NM",
      "DDDEP_NM",
    ],
  },
  departments: {
    id: "OPEN14020190311111456561190",
    fields: ["DGHT_CRSE_SC_NM", "ORD_SC_NM"],
  },
};
type RawRow = Record<string, string | number | null>;
type RawObject = Record<string, unknown>;

export class NeisError extends Error {
  constructor(
    message: string,
    public status = 502,
    public code = "NEIS_ERROR",
  ) {
    super(message);
    this.name = "NeisError";
  }
}

function object(value: unknown): RawObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as RawObject)
    : {};
}

export function text(value: unknown): string {
  return String(value ?? "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .trim();
}
function lines(value: unknown): string[] {
  return text(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
function date(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (isIsoDate(raw)) return raw;
  if (!/^\d{8}$/.test(raw)) return "";
  const iso = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  return isIsoDate(iso) ? iso : "";
}
function website(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}

export function parseNeisPage(payload: unknown, service: string) {
  const body = object(payload);
  const blocks = Array.isArray(body[service])
    ? (body[service] as unknown[])
    : [];
  const head = blocks.flatMap((block) => {
    const value = object(block).head;
    return Array.isArray(value) ? value : [];
  });
  const result = object(
    body.RESULT ?? head.map((entry) => object(entry).RESULT).find(Boolean),
  );
  const code = String(result.CODE ?? "");
  if (code === "INFO-200") return { rows: [] as RawRow[], totalCount: 0 };
  if (code !== "INFO-000") {
    if (["ERROR-290", "INFO-300"].includes(code)) {
      throw new NeisError("NEIS 인증 설정을 확인해 주세요.", 502, code);
    }
    if (code === "ERROR-337") {
      throw new NeisError(
        "NEIS의 오늘 조회 한도를 초과했습니다. 내일 다시 조회해 주세요.",
        503,
        code,
      );
    }
    throw new NeisError(
      "NEIS에서 데이터를 받지 못했습니다. 잠시 후 다시 시도해 주세요.",
      502,
      code || "INVALID_RESPONSE",
    );
  }
  const rows = blocks.flatMap((block) => {
    const values = object(block).row;
    return Array.isArray(values)
      ? values.map((value) => object(value) as RawRow)
      : [];
  });
  const reported = head
    .map((entry) => object(entry).list_total_count)
    .find((value) => value !== undefined);
  const totalCount = Number(reported ?? rows.length);
  if (!Number.isSafeInteger(totalCount) || totalCount < rows.length) {
    throw new NeisError(
      "NEIS 응답 형식을 확인할 수 없습니다.",
      502,
      "INVALID_RESPONSE",
    );
  }
  return { rows, totalCount };
}

export function parseNeisSheetPage(payload: unknown) {
  const body = object(payload);
  if (body.error) {
    throw new NeisError(
      "NEIS 공개 조회에서 데이터를 받지 못했습니다. 잠시 후 다시 조회해 주세요.",
      502,
      "PUBLIC_QUERY_ERROR",
    );
  }
  const totalCount = Number(body.total);
  if (
    !Array.isArray(body.data) ||
    !Number.isSafeInteger(totalCount) ||
    totalCount < body.data.length ||
    totalCount < 0 ||
    body.data.some(
      (row) => !object(row).SD_SCHUL_CODE || !object(row).ATPT_OFCDC_SC_CODE,
    )
  ) {
    throw new NeisError(
      "NEIS 공개 조회 응답 형식을 확인할 수 없습니다.",
      502,
      "INVALID_RESPONSE",
    );
  }
  return { rows: body.data.map((row) => object(row) as RawRow), totalCount };
}

function sheetParams(dataset: NeisDataset, params: Record<string, string>) {
  const sheet = SHEETS[dataset];
  const result = new URLSearchParams({
    infId: sheet.id,
    infSeq: "1",
    rows: "100",
    downloadType: "",
    ATPT_OFCDC_SC_CODE: OFFICE_CODE,
    SCHUL_NM: SCHOOL_NAME,
  });
  const ranges: Record<string, string> = {
    MLSV_YMD: "MLSV",
    ALL_TI_YMD: "TI",
    AA_YMD: "AA",
  };
  for (const field of sheet.fields) {
    const prefix = ranges[field];
    if (prefix) {
      // Both date inputs on the public form share the same name. Sending
      // *_FROM or *_TO here instead makes the portal reject the request.
      result.append(field, params[`${prefix}_FROM_YMD`]);
      result.append(field, params[`${prefix}_TO_YMD`]);
    } else if (field === "MMEAL_SC_NM") {
      result.set(
        field,
        ({ "1": "조식", "2": "중식", "3": "석식" } as Record<string, string>)[
          params.MMEAL_SC_CODE
        ],
      );
    } else {
      result.set(field, params[field] ?? "");
    }
  }
  return result;
}

function matchesQuery(
  row: RawRow,
  dataset: NeisDataset,
  params: Record<string, string>,
) {
  if (
    text(row.ATPT_OFCDC_SC_CODE) !== OFFICE_CODE ||
    text(row.SD_SCHUL_CODE) !== SCHOOL_CODE
  )
    return false;
  for (const field of [
    "AY",
    "GRADE",
    "CLASS_NM",
    "DDDEP_NM",
    "MMEAL_SC_CODE",
  ]) {
    if (params[field] && text(row[field]) !== params[field]) return false;
  }
  const ranges: Partial<Record<NeisDataset, [string, string]>> = {
    meals: ["MLSV_YMD", "MLSV"],
    timetable: ["ALL_TI_YMD", "TI"],
    schedule: ["AA_YMD", "AA"],
  };
  const range = ranges[dataset];
  if (range) {
    const [field, prefix] = range;
    const day = date(row[field]).replaceAll("-", "");
    if (
      !day ||
      day < params[`${prefix}_FROM_YMD`] ||
      day > params[`${prefix}_TO_YMD`]
    )
      return false;
  }
  return true;
}

export function makeNeisParams(
  dataset: NeisDataset,
  query: URLSearchParams,
): Record<string, string> {
  const params: Record<string, string> = {
    ATPT_OFCDC_SC_CODE: OFFICE_CODE,
    SD_SCHUL_CODE: SCHOOL_CODE,
  };
  if (["meals", "timetable", "schedule"].includes(dataset)) {
    const days = weekDates(koreaToday());
    const start = query.get("start") ?? days[0];
    const end =
      query.get("end") ??
      (dataset === "schedule" ? addDays(start, 30) : days[4]);
    if (
      !isIsoDate(start) ||
      !isIsoDate(end) ||
      end < start ||
      (Date.parse(end) - Date.parse(start)) / 86400000 > 62
    ) {
      throw new NeisError(
        "올바른 날짜 범위를 선택해 주세요. 한 번에 최대 63일을 조회할 수 있습니다.",
        400,
        "INVALID_RANGE",
      );
    }
    const prefix =
      dataset === "meals" ? "MLSV" : dataset === "timetable" ? "TI" : "AA";
    params[`${prefix}_FROM_YMD`] = start.replaceAll("-", "");
    params[`${prefix}_TO_YMD`] = end.replaceAll("-", "");
    // The exact date range is sufficient; an AY filter would lose lessons in a
    // week spanning the March 1 academic-year boundary.
  }
  if (dataset === "classes") {
    const year = query.get("year") ?? academicYear(koreaToday());
    if (!/^(20\d{2}|2100)$/.test(year)) {
      throw new NeisError(
        "올바른 학년도를 선택해 주세요.",
        400,
        "INVALID_YEAR",
      );
    }
    params.AY = year;
  }
  if (dataset === "timetable" || dataset === "classes") {
    const grade = query.get("grade") ?? "1";
    if (!/^[123]$/.test(grade))
      throw new NeisError(
        "학년은 1~3학년 중에서 선택해 주세요.",
        400,
        "INVALID_GRADE",
      );
    params.GRADE = grade;
    const department = query.get("department")?.trim();
    if (department && department.length > 60)
      throw new NeisError("학과명을 확인해 주세요.", 400, "INVALID_DEPARTMENT");
    if (department) params.DDDEP_NM = department;
  }
  if (dataset === "timetable") {
    const className = query.get("class")?.trim() ?? "4";
    if (
      !/^\d{1,2}$/.test(className) ||
      Number(className) < 1 ||
      Number(className) > 30
    ) {
      throw new NeisError(
        "올바른 반 번호를 입력해 주세요.",
        400,
        "INVALID_CLASS",
      );
    }
    params.CLASS_NM = className;
  }
  if (dataset === "meals") {
    const code = query.get("meal") ?? "2";
    if (!["1", "2", "3"].includes(code))
      throw new NeisError("급식 종류를 확인해 주세요.", 400, "INVALID_MEAL");
    params.MMEAL_SC_CODE = code;
  }
  return params;
}

function normalize(
  dataset: NeisDataset,
  rows: RawRow[],
): NeisData[NeisDataset] {
  if (dataset === "school") {
    const row = rows[0];
    return row
      ? {
          name: text(row.SCHUL_NM),
          englishName: text(row.ENG_SCHUL_NM),
          office: text(row.ATPT_OFCDC_SC_NM),
          region: text(row.LCTN_SC_NM),
          kind: text(row.SCHUL_KND_SC_NM),
          establishment: text(row.FOND_SC_NM),
          highSchoolType: text(row.HS_SC_NM),
          coeducation: text(row.COEDU_SC_NM),
          course: text(row.DGHT_SC_NM),
          address: [text(row.ORG_RDNMA), text(row.ORG_RDNDA)]
            .filter(Boolean)
            .join(" "),
          postcode: text(row.ORG_RDNZC),
          phone: text(row.ORG_TELNO),
          fax: text(row.ORG_FAXNO),
          website: website(row.HMPG_ADRES),
          founded: date(row.FOND_YMD),
          anniversary: date(row.FOAS_MEMRD),
        }
      : null;
  }
  if (dataset === "meals")
    return rows
      .map((row) => ({
        date: date(row.MLSV_YMD),
        code: text(row.MMEAL_SC_CODE),
        name: text(row.MMEAL_SC_NM),
        dishes: lines(row.DDISH_NM),
        calories: text(row.CAL_INFO),
        nutrition: lines(row.NTR_INFO),
        origins: lines(row.ORPLC_INFO),
      }))
      .filter((meal) => meal.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  if (dataset === "timetable")
    return rows
      .map((row) => ({
        date: date(row.ALL_TI_YMD),
        period: Number(row.PERIO),
        subject: text(row.ITRT_CNTNT),
        department: text(row.DDDEP_NM),
        grade: text(row.GRADE),
        className: text(row.CLASS_NM),
        classroom: text(row.CLRM_NM),
      }))
      .filter(
        (lesson) =>
          lesson.date && Number.isInteger(lesson.period) && lesson.period > 0,
      )
      .sort((a, b) => a.date.localeCompare(b.date) || a.period - b.period);
  if (dataset === "schedule")
    return rows
      .map((row): SchoolEvent => {
        const title = text(row.EVENT_NM);
        const dayType = text(row.SBTR_DD_SC_NM);
        const grades = [
          row.ONE_GRADE_EVENT_YN,
          row.TW_GRADE_EVENT_YN,
          row.THREE_GRADE_EVENT_YN,
        ].flatMap((value, index) => (value === "Y" ? [String(index + 1)] : []));
        return {
          date: date(row.AA_YMD),
          title,
          description: text(row.EVENT_CNTNT),
          dayType,
          type: /공휴일|휴업|휴일/.test(dayType + title)
            ? "HOLIDAY"
            : /평가|고사|시험/.test(title)
              ? "EXAM"
              : "EVENT",
          target:
            grades.length === 3
              ? "전학년"
              : grades.length
                ? `${grades.join(", ")}학년`
                : "대상 미제공",
        };
      })
      .filter((event) => event.date && event.title)
      .sort((a, b) => a.date.localeCompare(b.date));
  if (dataset === "classes")
    return rows
      .map((row) => ({
        year: text(row.AY),
        grade: text(row.GRADE),
        className: text(row.CLASS_NM),
        department: text(row.DDDEP_NM),
        course: text(row.DGHT_CRSE_SC_NM),
      }))
      .sort(
        (a, b) =>
          Number(a.grade) - Number(b.grade) ||
          Number(a.className) - Number(b.className),
      );
  return rows
    .map((row) => ({
      name: text(row.DDDEP_NM),
      affiliation: text(row.ORD_SC_NM),
      course: text(row.DGHT_CRSE_SC_NM),
    }))
    .filter((department) => department.name);
}

export async function getNeisData<K extends NeisDataset>(
  dataset: K,
  query = new URLSearchParams(),
): Promise<NeisResponse<K>> {
  const params = makeNeisParams(dataset, query);
  const key = process.env.NEIS_API_KEY?.trim();
  const mode = key && key.toLowerCase() !== "sample" ? "api" : "public";
  const service = SERVICES[dataset];
  const rows: RawRow[] = [];
  let totalCount = 0;
  const search =
    mode === "public"
      ? sheetParams(dataset, params)
      : new URLSearchParams({
          ...params,
          Type: "json",
          pSize: "1000",
          KEY: key!,
        });
  // Respect the public SHEET's 10,000-row limit and normal 100-row pages.
  for (let page = 1; page <= (mode === "public" ? 100 : 10); page++) {
    const url =
      mode === "public" ? new URL(PUBLIC_URL) : new URL(service, BASE_URL);
    search.set(mode === "public" ? "page" : "pIndex", String(page));
    url.search = search.toString();
    let payload: unknown;
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(12000),
        next: {
          revalidate: ["school", "departments", "classes"].includes(dataset)
            ? 3600
            : 300,
        },
      });
      if (!response.ok)
        throw new NeisError(
          "NEIS 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          502,
          "UPSTREAM_HTTP",
        );
      payload = await response.json();
    } catch (error) {
      if (error instanceof NeisError) throw error;
      // Never return fetch errors: their URL can contain the authentication key.
      throw new NeisError(
        "NEIS 연결이 지연되고 있습니다. 잠시 후 다시 조회해 주세요.",
        503,
        "UPSTREAM_UNAVAILABLE",
      );
    }
    const result =
      mode === "public"
        ? parseNeisSheetPage(payload)
        : parseNeisPage(payload, service);
    if (page === 1) totalCount = result.totalCount;
    rows.push(...result.rows);
    if (rows.length >= totalCount || result.rows.length === 0) break;
  }
  const partial = rows.length < totalCount;
  // Public text filters can return broader matches; enforce the exact school
  // and selected class/grade/department again before returning data.
  const selectedRows =
    mode === "public"
      ? rows.filter((row) => matchesQuery(row, dataset, params))
      : rows;
  if (!partial) totalCount = selectedRows.length;
  const updatedAt =
    selectedRows
      .map((row) =>
        date(
          String(row.LOAD_DTM ?? "")
            .replace(/\D/g, "")
            .slice(0, 8),
        ),
      )
      .filter(Boolean)
      .sort()
      .at(-1) ?? "";
  return {
    data: normalize(dataset, selectedRows) as NeisData[K],
    meta: {
      source: "NEIS",
      mode,
      partial,
      totalCount,
      returnedCount: selectedRows.length,
      fetchedAt: new Date().toISOString(),
      updatedAt,
    },
  };
}
