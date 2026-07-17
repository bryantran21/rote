"use client";

import Link from "next/link";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Ring } from "@/components/Ring";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { MasteryBars } from "@/components/MasteryBars";
import { Panel } from "@/components/Panel";
import { ProblemOfDay } from "@/components/ProblemOfDay";

export default function DashboardPage() {
  const d = useDashboard();
  const dueTotal = d.counts.due + d.counts.fresh;

  return (
    <div className="mx-auto max-w-content px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {d.loading
              ? "Loading your reps…"
              : dueTotal > 0
                ? `${dueTotal} card${dueTotal === 1 ? "" : "s"} waiting${
                    d.counts.due ? ` · ${d.counts.due} due` : ""
                  }.`
                : "You're all caught up for today."}
          </p>
        </div>
        <Link
          href="/drill"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Start today&rsquo;s reps
        </Link>
      </div>

      {/* Problem of the Day */}
      <div className="mb-5">
        <ProblemOfDay />
      </div>

      {/* Top row: streak + ring + calendar */}
      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Streak">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums text-fg">
              {d.streak}
            </span>
            <span className="text-sm text-fg-muted">
              day{d.streak === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
            <span className="text-fg-subtle">Accuracy today</span>
            <span className="tabular-nums text-fg-muted">
              {d.today.cardsDone
                ? `${Math.round(d.today.accuracy * 100)}%`
                : "—"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-fg-subtle">Total reps</span>
            <span className="tabular-nums text-fg-muted">{d.totalReps}</span>
          </div>
        </Panel>

        <Panel title="Today">
          <div className="flex justify-center py-1">
            <Ring value={d.today.cardsDone} goal={d.settings.dailyGoal} />
          </div>
        </Panel>

        <Panel title="Activity" className="lg:col-span-1">
          <CalendarHeatmap logs={d.logs} />
        </Panel>
      </div>

      {/* Mastery */}
      <Panel
        title="Topic mastery"
        action={
          <Link
            href="/topics"
            className="text-xs text-fg-muted hover:text-fg"
          >
            All topics →
          </Link>
        }
      >
        <MasteryBars mastery={d.mastery} />
      </Panel>
    </div>
  );
}
