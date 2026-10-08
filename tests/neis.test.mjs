import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const loadDependency = createRequire(import.meta.url);

// Exercise the actual server module with isolated env/fetch, without network or keys.
function loadTs(relative, extra = {}) {
  const filename = path.join(testDirectory, "..", relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(
    compiled,
    {
      module: loaded,
      exports: loaded.exports,
      require: loadDependency,
      URL,
      URLSearchParams,
      AbortSignal,
      Response,
      console,
      process: { env: {} },
      ...extra,
    },
    { filename },
  );
  return loaded.exports;
}
const shared = loadTs("src/lib/neis.ts");
function server(
  fetch = async () => {
    throw new Error("Unexpected network call");
  },
  env = { NEIS_API_KEY: "test-private-key" },
) {
  return loadTs("src/lib/neis-server.ts", {
    fetch,
    process: { env },
    require: (id) => (id === "@/lib/neis" ? shared : loadDependency(id)),
  });
}
function page(service, rows, total = rows.length) {
  return {
    [service]: [
      { head: [{ list_total_count: total }, { RESULT: { CODE: "INFO-000" } }] },
      { row: rows },
    ],
  };
}
function response(payload) {
  return { ok: true, json: async () => payload };
}
const range = () => new URLSearchParams("start=2026-10-05&end=2026-10-09");

// Critical date behavior: Korea midnight, weekend weeks, school-year boundary.
test("Korea dates remain correct across UTC midnight", () => {
  assert.equal(
    shared.koreaToday(new Date("2026-10-07T15:01:00Z")),
    "2026-10-08",
  );
  assert.equal(
    shared.koreaToday(new Date("2026-10-07T14:59:00Z")),
    "2026-10-07",
  );
});
test("Sunday uses the preceding Monday and week arithmetic crosses years", () => {
  assert.equal(shared.weekDates("2026-10-11")[0], "2026-10-05");
  assert.equal(shared.weekDates("2027-01-01")[0], "2026-12-28");
  assert.equal(shared.addDays("2026-12-31", 1), "2027-01-01");
});
test("January and February use the previous academic year", () => {
  assert.equal(shared.academicYear("2027-02-28"), "2026");
  assert.equal(shared.academicYear("2027-03-01"), "2027");
});
test("Rejects impossible dates, inverted ranges and overlong requests before fetching", async () => {
  for (const query of [
    "start=2026-02-30&end=2026-03-01",
    "start=2026-10-09&end=2026-10-05",
    "start=2026-01-01&end=2026-12-31",
  ]) {
    await assert.rejects(
      server().getNeisData("meals", new URLSearchParams(query)),
      { code: "INVALID_RANGE", status: 400 },
    );
  }
});
test("Rejects invalid class, grade and meal selection", () => {
  const api = server();
  for (const value of ["0", "31", "abc"]) {
    assert.throws(
      () =>
        api.makeNeisParams("timetable", new URLSearchParams(`class=${value}`)),
      { code: "INVALID_CLASS" },
    );
  }
  assert.throws(
    () => api.makeNeisParams("classes", new URLSearchParams("grade=4")),
    { code: "INVALID_GRADE" },
  );
  assert.throws(
    () => api.makeNeisParams("meals", new URLSearchParams("meal=0")),
    { code: "INVALID_MEAL" },
  );
});
test("Only the verified school is queried; caller cannot override codes or key", () => {
  const params = server().makeNeisParams(
    "school",
    new URLSearchParams(
      "SD_SCHUL_CODE=other&ATPT_OFCDC_SC_CODE=other&KEY=other",
    ),
  );
  assert.equal(params.SD_SCHUL_CODE, "7150597");
  assert.equal(params.ATPT_OFCDC_SC_CODE, "C10");
  assert.equal(params.KEY, undefined);
});
test("Week spanning March 1 is not restricted to one academic year", () => {
  const params = server().makeNeisParams(
    "timetable",
    new URLSearchParams("start=2027-02-22&end=2027-03-02"),
  );
  assert.equal(params.AY, undefined);
  assert.equal(params.TI_FROM_YMD, "20270222");
});
test("INFO-200 means empty data, while malformed results are errors", () => {
  assert.equal(
    server().parseNeisPage({ RESULT: { CODE: "INFO-200" } }, "schoolInfo").rows
      .length,
    0,
  );
  assert.throws(
    () => server().parseNeisPage("<html>maintenance</html>", "schoolInfo"),
    { code: "INVALID_RESPONSE" },
  );
});
test("Authentication and traffic errors are not presented as no data", () => {
  for (const code of ["ERROR-290", "INFO-300", "ERROR-337"]) {
    assert.throws(
      () => server().parseNeisPage({ RESULT: { CODE: code } }, "schoolInfo"),
      { code },
    );
  }
});
test("Query without a key uses public SHEET and returns more than five lessons", async () => {
  const calls = [];
  const rows = Array.from({ length: 32 }, (_, index) => ({
    ATPT_OFCDC_SC_CODE: "C10",
    SD_SCHUL_CODE: "7150597",
    GRADE: "1",
    CLASS_NM: "4",
    ALL_TI_YMD: "20261005",
    PERIO: String(index + 1),
    ITRT_CNTNT: "수업",
  }));
  const api = server(async (url) => {
    calls.push(url);
    return response({
      data: rows,
      total: 32,
      count: 32,
      page: 1,
      rows: 100,
      pages: 1,
    });
  }, {});
  const result = await api.getNeisData("timetable", range());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].searchParams.has("KEY"), false);
  assert.equal(calls[0].pathname, "/portal/data/sheet/searchSheetData.do");
  assert.equal(calls[0].searchParams.get("SCHUL_NM"), "대진전자통신고등학교");
  assert.deepEqual(calls[0].searchParams.getAll("ALL_TI_YMD"), [
    "20261005",
    "20261009",
  ]);
  assert.equal(result.meta.mode, "public");
  assert.equal(result.meta.partial, false);
  assert.equal(result.meta.totalCount, 32);
  assert.equal(result.data.length, 32);
});
test("Authenticated responses paginate and do not return the authentication key", async () => {
  const calls = [];
  const first = Array.from({ length: 1000 }, (_, index) => ({
    AY: "2026",
    GRADE: "1",
    CLASS_NM: String(index + 1),
  }));
  const api = server(
    async (url) => {
      calls.push(url);
      return response(
        page(
          "classInfo",
          calls.length === 1
            ? first
            : [{ AY: "2026", GRADE: "1", CLASS_NM: "1001" }],
          1001,
        ),
      );
    },
    { NEIS_API_KEY: "test-private-key" },
  );
  const result = await api.getNeisData("classes");
  assert.equal(calls.length, 2);
  assert.equal(calls[1].searchParams.get("pIndex"), "2");
  assert.equal(calls[0].searchParams.get("KEY"), "test-private-key");
  assert.equal(result.data.length, 1001);
  assert.equal(result.meta.partial, false);
  assert.equal(result.meta.mode, "api");
  assert.equal(JSON.stringify(result).includes("test-private-key"), false);
});
test("Failed fetch does not leak a key from the URL in its error", async () => {
  const api = server(
    async (url) => {
      throw new Error(`Request failed: ${url}`);
    },
    { NEIS_API_KEY: "test-secret" },
  );
  await assert.rejects(
    api.getNeisData("school"),
    (error) =>
      error.code === "UPSTREAM_UNAVAILABLE" &&
      !error.message.includes("test-secret"),
  );
});
test("Menus, calories and school links are normalized from NEIS fields", async () => {
  const mealApi = server(async () =>
    response(
      page("mealServiceDietInfo", [
        {
          MLSV_YMD: "20261008",
          DDISH_NM: "밥<br/>국 (1.2.5)",
          CAL_INFO: "700 Kcal",
          NTR_INFO: "단백질 : 20<br/>지방 : 10",
          LOAD_DTM: "20261008",
        },
      ]),
    ),
  );
  const meals = await mealApi.getNeisData("meals", range());
  assert.equal(meals.data[0].dishes.length, 2);
  assert.equal(meals.data[0].calories, "700 Kcal");
  assert.equal(meals.meta.updatedAt, "2026-10-08");
  assert.equal(shared.withoutAllergyNumbers(meals.data[0].dishes[1]), "국");
  const schoolApi = server(async () =>
    response(
      page("schoolInfo", [
        {
          SCHUL_NM: "대진전자통신고등학교",
          HMPG_ADRES: "www.pdj.hs.kr",
          FOND_YMD: "19951030",
        },
      ]),
    ),
  );
  const school = await schoolApi.getNeisData("school");
  assert.equal(school.data.website, "https://www.pdj.hs.kr/");
  assert.equal(school.data.founded, "1995-10-30");
});
test("School events retain target grades and distinguish holidays from exams", async () => {
  const api = server(async () =>
    response(
      page("SchoolSchedule", [
        {
          AA_YMD: "20261009",
          EVENT_NM: "한글날",
          SBTR_DD_SC_NM: "공휴일",
          ONE_GRADE_EVENT_YN: "Y",
          TW_GRADE_EVENT_YN: "Y",
          THREE_GRADE_EVENT_YN: "Y",
        },
        { AA_YMD: "20261015", EVENT_NM: "지필평가", ONE_GRADE_EVENT_YN: "Y" },
      ]),
    ),
  );
  const result = await api.getNeisData(
    "schedule",
    new URLSearchParams("start=2026-10-01&end=2026-10-31"),
  );
  assert.equal(result.data[0].type, "HOLIDAY");
  assert.equal(result.data[0].target, "전학년");
  assert.equal(result.data[1].type, "EXAM");
  assert.equal(result.data[1].target, "1학년");
});
test("Department query uses the actual NEIS schoolMajorinfo endpoint", async () => {
  let requested;
  const api = server(async (url) => {
    requested = url;
    return response(
      page("schoolMajorinfo", [
        { DDDEP_NM: "AI소프트웨어과", ORD_SC_NM: "공업계" },
      ]),
    );
  });
  const result = await api.getNeisData("departments");
  assert.equal(requested.pathname, "/hub/schoolMajorinfo");
  assert.equal(result.data[0].name, "AI소프트웨어과");
});
test("Site route returns a clear 404 and preserves 400 validation errors", async () => {
  const api = server();
  const route = loadTs("src/app/api/neis/[dataset]/route.ts", {
    require: (id) => (id === "@/lib/neis-server" ? api : loadDependency(id)),
  });
  const invalid = await route.GET(
    new Request("http://localhost/api/neis/unknown"),
    { params: Promise.resolve({ dataset: "unknown" }) },
  );
  assert.equal(invalid.status, 404);
  const rangeError = await route.GET(
    new Request("http://localhost/api/neis/meals?start=invalid"),
    { params: Promise.resolve({ dataset: "meals" }) },
  );
  assert.equal(rangeError.status, 400);
  assert.equal((await rangeError.json()).code, "INVALID_RANGE");
});
