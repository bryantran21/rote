// SVG progress ring — today's cards-done vs daily goal. NeetCode's "solved
// ring" rendered in the Rote palette.

export function Ring({
  value,
  goal,
  size = 132,
  stroke = 10,
}: {
  value: number;
  goal: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const done = pct >= 1;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--border))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 500ms ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold tabular-nums text-fg">
          {value}
          <span className="text-fg-subtle">/{goal}</span>
        </span>
        <span className="text-xs uppercase tracking-wide text-fg-subtle">
          {done ? "goal met" : "today"}
        </span>
      </div>
    </div>
  );
}
