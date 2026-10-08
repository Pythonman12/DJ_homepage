import { addDays, displayDate, koreaToday, weekDates } from "@/lib/neis";

export default function WeekNavigation({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  const days = weekDates(date);
  const button =
    "rounded border border-gray-200 dark:border-zinc-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
      <span className="font-semibold">
        {days[0].slice(0, 4)}년 {displayDate(days[0])} ~ {displayDate(days[4])}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={button}
          onClick={() => onChange(addDays(date, -7))}
          aria-label="이전 주"
        >
          이전 주
        </button>
        <button className={button} onClick={() => onChange(koreaToday())}>
          이번 주
        </button>
        <button
          className={button}
          onClick={() => onChange(addDays(date, 7))}
          aria-label="다음 주"
        >
          다음 주
        </button>
        <input
          aria-label="조회 날짜"
          type="date"
          value={date}
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value);
          }}
          className={`${button} bg-white dark:bg-zinc-900 max-w-[150px]`}
        />
      </div>
    </div>
  );
}
