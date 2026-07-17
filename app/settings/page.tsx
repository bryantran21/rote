"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { store, type ExportBundle } from "@/lib/datastore";
import type { Settings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

type Status = { kind: "idle" | "saved" | "error"; msg?: string };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    store()
      .getSettings()
      .then(setSettings);
  }, []);

  if (!settings) {
    return (
      <div className="mx-auto max-w-content px-6 py-8">
        <PageHeader title="Settings" />
        <p className="text-sm text-fg-subtle">Loading…</p>
      </div>
    );
  }

  const patch = async (p: Partial<Settings>) => {
    const next = await store().saveSettings(p);
    setSettings(next);
    flash({ kind: "saved", msg: "Saved" });
  };

  const flash = (s: Status) => {
    setStatus(s);
    if (s.kind !== "idle") setTimeout(() => setStatus({ kind: "idle" }), 1500);
  };

  const setInterval = (idx: number, value: number) => {
    const boxIntervals = [...settings.boxIntervals];
    boxIntervals[idx] = Math.max(0, value);
    patch({ boxIntervals });
  };

  const exportJson = async () => {
    const bundle = await store().exportData();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rote-progress-${bundle.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const bundle = JSON.parse(text) as ExportBundle;
      await store().importData(bundle);
      const next = await store().getSettings();
      setSettings(next);
      flash({ kind: "saved", msg: "Imported" });
    } catch (e) {
      flash({
        kind: "error",
        msg: e instanceof Error ? e.message : "Import failed",
      });
    }
  };

  const resetAll = async () => {
    if (
      !confirm(
        "Reset ALL progress? This clears every card's box, your streak, daily logs, and problem history. This cannot be undone.",
      )
    )
      return;
    await store().resetProgress();
    flash({ kind: "saved", msg: "Progress reset" });
  };

  return (
    <div className="mx-auto max-w-prose px-6 py-8">
      <PageHeader
        title="Settings"
        subtitle="Goals, scheduling, and your data."
        action={
          status.kind !== "idle" ? (
            <span
              className={`text-xs ${
                status.kind === "error" ? "text-danger" : "text-success"
              }`}
            >
              {status.msg}
            </span>
          ) : null
        }
      />

      <div className="flex flex-col gap-5">
        {/* Daily goal */}
        <Panel title="Daily goal">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-fg-muted">
              How many cards make a complete day.
            </p>
            <input
              type="number"
              min={1}
              max={200}
              value={settings.dailyGoal}
              onChange={(e) =>
                patch({ dailyGoal: Math.max(1, Number(e.target.value)) })
              }
              className="w-20 rounded-md border border-border bg-bg px-3 py-2 text-right text-sm tabular-nums outline-none focus:border-accent"
            />
          </div>
        </Panel>

        {/* Box intervals */}
        <Panel title="Leitner box intervals">
          <p className="mb-4 text-sm text-fg-muted">
            Days until a card is due again after a correct answer, per box.
            Wrong answers always reset to box 1.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {settings.boxIntervals.map((v, i) => (
              <label key={i} className="flex flex-col gap-1">
                <span className="text-center text-xs text-fg-subtle">
                  Box {i + 1}
                </span>
                <input
                  type="number"
                  min={0}
                  value={v}
                  onChange={(e) => setInterval(i, Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-bg px-2 py-2 text-center text-sm tabular-nums outline-none focus:border-accent"
                />
              </label>
            ))}
          </div>
          <button
            onClick={() =>
              patch({ boxIntervals: [...DEFAULT_SETTINGS.boxIntervals] })
            }
            className="mt-3 text-xs text-fg-muted hover:text-fg"
          >
            Reset to defaults ({DEFAULT_SETTINGS.boxIntervals.join(", ")})
          </button>
        </Panel>

        {/* Problem of the Day */}
        <Panel title="Problem of the Day">
          <div className="flex flex-col gap-4">
            <Row label="Mode" hint="How the daily problem is chosen.">
              <select
                value={settings.dailyProblemMode}
                onChange={(e) =>
                  patch({
                    dailyProblemMode: e.target
                      .value as Settings["dailyProblemMode"],
                  })
                }
                className="rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="personalized">Personalized (weak topics)</option>
                <option value="random">Random</option>
                <option value="official">Official daily (Phase 3)</option>
              </select>
            </Row>
            <Row
              label="Difficulty ceiling"
              hint="Don't serve problems harder than this."
            >
              <select
                value={settings.problemDifficultyCeiling}
                onChange={(e) =>
                  patch({
                    problemDifficultyCeiling: e.target
                      .value as Settings["problemDifficultyCeiling"],
                  })
                }
                className="rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </Row>
            <Row
              label="Include paid-only"
              hint="Show LeetCode Premium problems."
            >
              <Toggle
                on={settings.includePaid}
                onChange={(v) => patch({ includePaid: v })}
              />
            </Row>
          </div>
        </Panel>

        {/* Data */}
        <Panel title="Your data">
          <p className="mb-4 text-sm text-fg-muted">
            Everything is stored locally in your browser. Export a backup or move
            it to another device.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportJson}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-bg-elevated"
            >
              Export JSON
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-bg-elevated"
            >
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.target.value = "";
              }}
            />
          </div>
        </Panel>

        {/* Danger zone */}
        <Panel title="Reset" className="border-danger/30">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-fg-muted">
              Clear all progress, streak, and history. Cards and lessons stay.
            </p>
            <button
              onClick={resetAll}
              className="shrink-0 rounded-md border border-danger/40 px-4 py-2 text-sm font-medium text-danger hover:bg-danger-subtle"
            >
              Reset all progress
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-fg">{label}</p>
        {hint && <p className="text-xs text-fg-subtle">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-accent" : "bg-border-strong"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
