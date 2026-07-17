"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Card } from "@/lib/types";
import { gradeCard } from "@/lib/grading";

export interface DrillCardResult {
  correct: boolean;
  response: string;
}

interface DrillCardProps {
  card: Card;
  /** Called once the user submits, with the grade. */
  onGraded: (result: DrillCardResult) => void;
  /** Called when the user advances past the feedback panel. */
  onNext: () => void;
  /** 1-based position for the progress caption. */
  index?: number;
  total?: number;
}

const DIFF_LABEL: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

export function DrillCard({
  card,
  onGraded,
  onNext,
  index,
  total,
}: DrillCardProps) {
  const [selected, setSelected] = useState<string>(""); // mcq option id
  const [fill, setFill] = useState<string>(""); // fill text
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when the card changes.
  useEffect(() => {
    setSelected("");
    setFill("");
    setSubmitted(false);
    setCorrect(false);
    if (card.type === "fill") {
      // focus the blank on mount
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [card.id, card.type]);

  const response = card.type === "mcq" ? selected : fill;
  const canSubmit = card.type === "mcq" ? selected !== "" : fill.trim() !== "";

  const submit = useCallback(() => {
    if (submitted || !canSubmit) return;
    const isCorrect = gradeCard(card, response);
    setCorrect(isCorrect);
    setSubmitted(true);
    onGraded({ correct: isCorrect, response });
  }, [submitted, canSubmit, card, response, onGraded]);

  const advance = useCallback(() => {
    if (!submitted) return;
    onNext();
  }, [submitted, onNext]);

  // Keyboard-first: 1–4 select MCQ, Enter submits, Space/Enter advances.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (submitted) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advance();
        }
        return;
      }
      if (card.type === "mcq" && card.options) {
        const n = Number(e.key);
        if (n >= 1 && n <= card.options.length) {
          e.preventDefault();
          setSelected(card.options[n - 1].id);
          return;
        }
      }
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, submitted, submit, advance]);

  // For fill cards, split the code snippet around the ___ blank.
  const codeParts = useMemo(() => {
    if (!card.code) return null;
    if (card.type !== "fill") return { before: card.code, after: "" };
    const idx = card.code.indexOf("___");
    if (idx === -1) return { before: card.code, after: "" };
    return {
      before: card.code.slice(0, idx),
      after: card.code.slice(idx + 3),
    };
  }, [card.code, card.type]);

  return (
    <div className="mx-auto w-full max-w-prose">
      {/* meta row */}
      <div className="mb-3 flex items-center justify-between text-xs text-fg-subtle">
        <div className="flex items-center gap-2">
          <span className="rounded bg-accent-subtle px-1.5 py-0.5 font-medium text-accent">
            {card.topic}
          </span>
          <span className="text-fg-subtle">{card.primitive}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{DIFF_LABEL[card.difficulty]}</span>
          {index && total ? (
            <span className="tabular-nums">
              {index} / {total}
            </span>
          ) : null}
        </div>
      </div>

      <motion.div
        key={card.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="rounded-lg border border-border bg-bg-elevated p-5 sm:p-6"
      >
        <h2 className="text-lg font-medium leading-snug text-fg">{card.prompt}</h2>

        {/* Code snippet */}
        {codeParts && (
          <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-bg-subtle p-3.5 font-mono text-sm leading-relaxed text-fg-muted">
            <code>
              {codeParts.before}
              {card.type === "fill" && (
                <span className="text-accent">
                  {submitted ? card.answer : "___"}
                </span>
              )}
              {codeParts.after}
            </code>
          </pre>
        )}

        {/* MCQ options */}
        {card.type === "mcq" && card.options && (
          <ul className="mt-4 flex flex-col gap-2">
            {card.options.map((opt, i) => {
              const isChosen = selected === opt.id;
              const isAnswer = card.answer === opt.id;
              const state = !submitted
                ? isChosen
                  ? "chosen"
                  : "idle"
                : isAnswer
                  ? "correct"
                  : isChosen
                    ? "wrong"
                    : "idle";
              const cls =
                {
                  idle: "border-border bg-bg hover:border-border-strong",
                  chosen: "border-accent bg-accent-subtle",
                  correct: "border-success bg-success-subtle",
                  wrong: "border-danger bg-danger-subtle",
                }[state] ?? "";
              return (
                <li key={opt.id}>
                  <button
                    disabled={submitted}
                    onClick={() => setSelected(opt.id)}
                    className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border text-xs tabular-nums ${
                        state === "correct"
                          ? "border-success text-success"
                          : state === "wrong"
                            ? "border-danger text-danger"
                            : state === "chosen"
                              ? "border-accent text-accent"
                              : "border-border-strong text-fg-subtle"
                      }`}
                    >
                      {state === "correct" ? "✓" : state === "wrong" ? "✕" : i + 1}
                    </span>
                    <span className="font-mono text-fg">{opt.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Fill input */}
        {card.type === "fill" && (
          <div className="mt-4">
            <input
              ref={inputRef}
              value={fill}
              disabled={submitted}
              onChange={(e) => setFill(e.target.value)}
              placeholder="Type the missing code…"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className={`w-full rounded-md border bg-bg px-3 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-fg-subtle disabled:opacity-70 ${
                submitted
                  ? correct
                    ? "border-success bg-success-subtle"
                    : "border-danger bg-danger-subtle"
                  : "border-border focus:border-accent"
              }`}
            />
          </div>
        )}
      </motion.div>

      {/* Feedback panel */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className={`mt-3 rounded-lg border p-4 ${
            correct
              ? "border-success/40 bg-success-subtle"
              : "border-danger/40 bg-danger-subtle"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className={correct ? "text-success" : "text-danger"}>
              {correct ? "Correct" : "Not quite"}
            </span>
            {!correct && (
              <span className="text-fg-muted">
                Answer:{" "}
                <code className="rounded bg-bg px-1 py-0.5 font-mono text-fg">
                  {card.type === "mcq"
                    ? card.options?.find((o) => o.id === card.answer)?.text
                    : card.answer}
                </code>
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
            {card.explanation}
          </p>
        </motion.div>
      )}

      {/* Action bar */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-fg-subtle">
          {submitted ? (
            <>
              Press <Kbd>Enter</Kbd> to continue
            </>
          ) : card.type === "mcq" ? (
            <>
              <Kbd>1</Kbd>–<Kbd>{String(card.options?.length ?? 4)}</Kbd> to
              choose · <Kbd>Enter</Kbd> to submit
            </>
          ) : (
            <>
              <Kbd>Enter</Kbd> to submit
            </>
          )}
        </p>
        {submitted ? (
          <button
            onClick={advance}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border-strong bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.6875rem] text-fg-muted">
      {children}
    </kbd>
  );
}
