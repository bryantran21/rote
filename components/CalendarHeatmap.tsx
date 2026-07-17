"use client";

// Month calendar heatmap of activity — NeetCode's per-day calendar in the Rote
// palette. Intensity is a violet tint scaled by cards done that day.

import { useState } from "react";
import type { DailyLog } from "@/lib/types";
import { monthGrid, monthLabel, WEEKDAYS, todayISO } from "@/lib/date";

export function CalendarHeatmap({ logs }: { logs: DailyLog[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());

  const byDate = new Map(logs.map((l) => [l.date, l]));
  const goalish = 20; // reference max for intensity scaling
  const weeks = monthGrid(year, month0);
  const today = todayISO();

  const shift = (delta: number) => {
    const d = new Date(year, month0 + delta, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  };

  const isCurrentMonth =
    year === now.getFullYear() && month0 === now.getMonth();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-fg">
          {monthLabel(year, month0)}
        </span>
        <div className="flex items-center gap-1">
          <NavBtn label="Previous month" onClick={() => shift(-1)}>
            ‹
          </NavBtn>
          <NavBtn
            label="Next month"
            onClick={() => shift(1)}
            disabled={isCurrentMonth}
          >
            ›
          </NavBtn>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-1 text-center text-[0.625rem] font-medium uppercase tracking-wide text-fg-subtle"
          >
            {w[0]}
          </div>
        ))}
        {weeks.flat().map((date, i) => {
          if (!date) return <div key={i} />;
          const log = byDate.get(date);
          const count = log?.cardsDone ?? 0;
          const intensity = count === 0 ? 0 : Math.min(1, count / goalish);
          const isToday = date === today;
          const day = Number(date.slice(-2));
          return (
            <div
              key={i}
              title={`${date}: ${count} card${count === 1 ? "" : "s"}`}
              className={`grid aspect-square place-items-center rounded text-[0.625rem] tabular-nums ${
                isToday ? "ring-1 ring-accent" : ""
              }`}
              style={{
                backgroundColor:
                  count === 0
                    ? "rgb(var(--bg-subtle))"
                    : `rgb(var(--accent) / ${0.18 + intensity * 0.82})`,
                color:
                  intensity > 0.45
                    ? "rgb(var(--accent-fg))"
                    : "rgb(var(--fg-subtle))",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-6 w-6 place-items-center rounded text-fg-muted transition-colors hover:bg-bg-elevated hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
