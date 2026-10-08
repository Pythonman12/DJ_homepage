"use client";

import { useState } from "react";
import { DEFAULT_STUDENT_PROFILE, type StudentUser } from "@/lib/auth";
import { useNeis } from "@/hooks/useNeis";
import { academicYear, displayDate, koreaToday, weekDates } from "@/lib/neis";
import NeisStatus from "@/components/NeisStatus";
import WeekNavigation from "@/components/WeekNavigation";

interface TimetableViewProps {
  userData?: StudentUser;
  isLoggedIn?: boolean;
}

export default function TimetableView(props: TimetableViewProps) {
  const identity =
    props.isLoggedIn && props.userData?.profileComplete
      ? `${props.userData.department}-${props.userData.grade}-${props.userData.classNum}`
      : "guest";
  return <ClassTimetable key={identity} {...props} />;
}

function ClassTimetable({ userData, isLoggedIn }: TimetableViewProps) {
  const profile =
    isLoggedIn && userData?.profileComplete
      ? userData
      : DEFAULT_STUDENT_PROFILE;
  const [selectedDate, setSelectedDate] = useState(koreaToday);
  const [department, setDepartment] = useState(profile.department);
  const [grade, setGrade] = useState(profile.grade);
  const [className, setClassName] = useState(profile.classNum);
  const days = weekDates(selectedDate);
  const classes = useNeis("classes", {
    year: academicYear(selectedDate),
    grade,
    department,
  });
  const classNames = [
    ...new Set(classes.data?.map((value) => value.className) ?? []),
  ]
    .filter((value) => /^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 30)
    .sort((a, b) => Number(a) - Number(b));
  const selectedClass = classNames.includes(className)
    ? className
    : (classNames[0] ?? "");
  const timetable = useNeis(
    "timetable",
    { start: days[0], end: days[4], grade, class: selectedClass, department },
    Boolean(selectedClass),
  );
  const departments = useNeis("departments");
  const departmentNames = [
    ...new Set(
      [
        ...(departments.data?.map((value) => value.name) ?? []),
        ...(classes.data?.map((value) => value.department) ?? []),
        department,
      ].filter(Boolean),
    ),
  ];
  const lessons = timetable.data ?? [];
  const periodCount = Math.max(7, ...lessons.map((lesson) => lesson.period));
  const isMyClass =
    isLoggedIn &&
    userData?.profileComplete &&
    grade === userData.grade &&
    selectedClass === userData.classNum &&
    department === userData.department;
  const control =
    "rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs";
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">시간표</h2>
            {isMyClass && (
              <span className="rounded bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] text-blue-700 dark:text-blue-300">
                내 학급
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            {academicYear(selectedDate)}학년도 · {department || "전체 학과"} ·{" "}
            {grade}학년 {selectedClass || "—"}반
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isLoggedIn && userData?.profileComplete && (
            <button
              onClick={() => {
                setDepartment(userData.department);
                setGrade(userData.grade);
                setClassName(userData.classNum);
              }}
              className={control}
            >
              내 학급 보기
            </button>
          )}
          <select
            aria-label="학과"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className={`${control} max-w-[180px]`}
          >
            <option value="">전체 학과</option>
            {departmentNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="학년"
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className={control}
          >
            {["1", "2", "3"].map((value) => (
              <option key={value} value={value}>
                {value}학년
              </option>
            ))}
          </select>
          <select
            aria-label="반"
            value={selectedClass}
            disabled={classes.loading || classNames.length === 0}
            onChange={(event) => setClassName(event.target.value)}
            className={`${control} disabled:opacity-50`}
          >
            {!selectedClass && (
              <option value="">
                {classes.loading ? "반 목록 불러오는 중…" : classes.error ? "반 목록 조회 실패" : "등록된 반 없음"}
              </option>
            )}
            {classNames.map((value) => (
              <option key={value} value={value}>{value}반</option>
            ))}
          </select>
          <button
            onClick={() => { classes.reload(); timetable.reload(); }}
            disabled={classes.loading}
            className={`${control} cursor-pointer`}
          >
            새로고침
          </button>
        </div>
      </div>
      <WeekNavigation date={selectedDate} onChange={setSelectedDate} />
      {classes.loading && (
        <p role="status" className="text-xs text-gray-500 dark:text-zinc-400">
          선택한 학과·학년의 반 목록을 불러오는 중입니다…
        </p>
      )}
      {classes.data && !classNames.length && (
        <p role="status" className="text-xs text-gray-500 dark:text-zinc-400">
          선택한 학과·학년에 등록된 반이 없습니다. 학과와 학년을 다시 선택해 주세요.
        </p>
      )}
      <NeisStatus {...timetable} onRetry={timetable.reload} />
      {departments.error && (
        <NeisStatus {...departments} onRetry={departments.reload} />
      )}
      {classes.error && <NeisStatus {...classes} onRetry={classes.reload} />}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
        <table className="w-full min-w-[660px] text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
              <th scope="col" className="p-3 w-20">
                교시
              </th>
              {days.map((day) => (
                <th
                  scope="col"
                  key={day}
                  className={`p-3 text-left ${day === koreaToday() ? "text-blue-700 dark:text-blue-300" : ""}`}
                >
                  {displayDate(day)}
                  {day === koreaToday() && " · 오늘"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {Array.from({ length: periodCount }, (_, index) => index + 1).map(
              (period) => (
                <tr key={period}>
                  <th
                    scope="row"
                    className="p-3 font-medium text-gray-500 dark:text-zinc-400 border-r border-gray-100 dark:border-zinc-800"
                  >
                    {period}교시
                  </th>
                  {days.map((day) => {
                    const values = lessons.filter(
                      (lesson) =>
                        lesson.date === day && lesson.period === period,
                    );
                    return (
                      <td key={day} className="p-2.5 align-top w-[18%]">
                        <div className="rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-800/20 p-3 min-h-16">
                          {timetable.loading || classes.loading ? (
                            <div className="h-3 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                          ) : values.length ? (
                            values.map((lesson, index) => (
                              <div key={index} className="space-y-1">
                                <p className="font-semibold">
                                  {lesson.subject || "수업명 미제공"}
                                </p>
                                {lesson.department && (
                                  <p className="text-[10px] text-gray-400">
                                    {lesson.department}
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-400">
                              {!selectedClass
                                ? "반을 선택하세요"
                                : timetable.error
                                  ? "조회 실패"
                                  : timetable.meta?.partial
                                    ? "이번 조회에서 미제공"
                                    : "등록 정보 없음"}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-zinc-400">
        로그인 없이 학과·학년·반을 선택하여 조회할 수 있습니다. 학과와 반
        선택 목록은 NEIS 등록 정보를 사용합니다. 선택한 주의 수업이 등록되지
        않았다면 빈 결과가 표시됩니다.
      </p>
    </div>
  );
}
