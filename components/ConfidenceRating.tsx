"use client";

// 1–5 confidence dots. Clicking a dot rates the problem, which drives the SRS
// review schedule (5 = graduated). Keyboard accessible.

export function ConfidenceRating({
  value,
  onRate,
  size = "sm",
}: {
  value?: number;
  onRate: (confidence: number) => void;
  size?: "sm" | "md";
}) {
  const dot = size === "md" ? "h-4 w-4" : "h-3 w-3";
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Confidence">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (value ?? 0) >= n;
        const graduated = value === 5;
        return (
          <button
            key={n}
            onClick={(e) => {
              e.stopPropagation();
              onRate(n);
            }}
            aria-label={`Confidence ${n}`}
            aria-pressed={value === n}
            title={`Confidence ${n}${n === 5 ? " (graduates out of review)" : ""}`}
            className={`${dot} rounded-full border transition-colors ${
              filled
                ? graduated
                  ? "border-success bg-success"
                  : "border-accent bg-accent"
                : "border-border-strong bg-transparent hover:border-accent"
            }`}
          />
        );
      })}
    </div>
  );
}
