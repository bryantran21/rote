# Rote

A spaced-repetition web app that drills **Python syntax** for coding interviews — and tracks your way through the curated LeetCode lists.

### ▶ Try it live: **[rote.bhtran.com](https://rote.bhtran.com)**

No sign-up, nothing to install — it runs entirely in your browser.

Rote is for the developer who can reason out the solution but stalls on the
syntax while typing it. It's rep-heavy and low-pressure by design: one card at a
time, immediate feedback, no countdown timers. Everything is local-first — no
accounts, no backend — and your progress lives in your browser (IndexedDB).

## What you can do

**Drill syntax**
- **Session setup** — before each session, pick the **format** (mixed,
  multiple-choice, or fill-in-the-blank), a **topic**, the **length**, and
  whether to use **hard mode**.
- **Hard mode** — hides the topic and concept while you answer (so the label
  doesn't give it away), then reveals them with the explanation.
- **Keyboard-first** — `1`–`4` to choose, `Enter` to submit. After answering,
  rate your **confidence 1–5**; the rating drives when you'll see the card again.
- **Leitner spaced repetition** — 5 boxes, due dates default to
  `[0, 1, 3, 7, 16]` days and are configurable.

**Track the lists**
- **`/problems`** — work through **NeetCode 150, Blind 75, Grind 75, and
  Pareto 50** with per-list progress bars ("Blind 75: 12/51"). Filter by list,
  difficulty, topic, and status.
- **Confidence-driven review** — rate a problem after solving; low confidence
  schedules it for review, a 5 graduates it out. A "Due for review" view surfaces
  what's ready.
- **Per-problem notes** and slug-based **import/export** so you can seed your
  existing progress.

**Learn ↔ test**
- **Topic pages** pair a **Learn** tab (concept lesson) with a **Test** tab
  (drill that topic). Miss a card and "Learn this →" routes you to its lesson.
- **Cheat sheet** — a searchable single-page Python reference with collapsible
  sections, copy-code buttons, and "Drill this →" links.

**See your progress**
- **Dashboard** — streak, today's goal ring, a month activity heatmap, and
  per-topic mastery bars.
- **Problem of the Day** — one real LeetCode problem, weighted toward your
  weakest topics, deep-linked out to LeetCode.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Dexie (IndexedDB) · Zustand ·
Framer Motion · react-markdown

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```

Or just use the hosted version: **[rote.bhtran.com](https://rote.bhtran.com)**.

## Project layout

```
app/                 routes: dashboard, drill, problems, topics, cheatsheet, settings
components/          hand-rolled UI (no component library)
content/             cards, topics, lessons, cheat sheet, problem catalog
lib/                 datastore seam, scheduler, review logic, hooks, utils
scripts/             offline catalog builder + curated seed lists
```

### Architecture notes

- **`lib/datastore.ts` is the only seam to persistence.** No component or store
  touches Dexie directly, and every method is async — so a network-backed
  implementation can drop in without changing any UI.
- **One SRS mapping.** Syntax cards and problem review share the same Leitner
  boxes (`confidenceToBox` + `dueDateForBox` in `lib/scheduler.ts`).
- **Design tokens live in `app/globals.css`** as CSS variables surfaced as
  Tailwind tokens. Change a value once and the whole app re-themes.
- **Content is plain data** (`content/cards.ts`, `content/problems.json`), so it
  can be regenerated or imported without touching the UI.

## Problem catalog

`content/problems.json` is **metadata only** — title, difficulty, topic tags,
list membership, and the canonical LeetCode URL. Problem statements, examples,
and test cases are never fetched, stored, or rendered; the app links out rather
than mirroring LeetCode's content.

The catalog is generated **offline and manually** — the running app never
scrapes LeetCode:

```bash
npm run build-catalog
```

It builds from the curated seed in `scripts/build-catalog.ts`. An optional
metadata-only enrichment path exists behind a flag if you install the package:

```bash
npm i -D leetcode-query
npm run build-catalog -- --fetch
```

> **Note:** the Pareto 50 list is an approximate high-confidence subset pending
> the official list — see the flag in `scripts/build-catalog.ts`.

## Theming

Near-monochrome, dark by default, one violet accent (`#6D28D9` light /
`#A78BFA` dark). No glow, no glassmorphism, no decorative gradients.
