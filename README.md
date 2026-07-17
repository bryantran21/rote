# Rote

A spaced-repetition web app that drills **Python syntax** for coding interviews.

Rote is for the developer who can reason out the solution but stalls on the
syntax while typing it. It's rep-heavy and low-pressure by design: one card at a
time, immediate feedback, no countdown timers.

Everything runs locally — no accounts, no backend, no network calls. Progress
lives in IndexedDB.

## Features

- **Drill loop** — multiple-choice and fill-in-the-blank cards, keyboard-first
  (`1`–`4` to choose, `Enter` to submit, `Enter`/`Space` to advance). The correct
  answer and a one-line explanation always appear after you answer.
- **Leitner spaced repetition** — 5 boxes. Correct promotes, wrong resets to box
  1. Box intervals default to `[0, 1, 3, 7, 16]` days and are configurable.
- **Dashboard** — streak, today's goal ring, month activity heatmap, per-topic
  mastery bars.
- **Topics** — the NeetCode-style roadmap (18 topics), each with a short concept
  lesson and a "drill this topic" shortcut.
- **Cheat sheet** — a searchable single-page Python reference with collapsible
  sections and copy-code buttons.
- **Problem of the Day** — one real LeetCode problem per day, weighted toward
  your weakest topics based on your actual drill data, deep-linked out to
  LeetCode.
- **Your data** — export/import progress as JSON.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Dexie (IndexedDB) · Zustand ·
Framer Motion · react-markdown

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```

## Project layout

```
app/                 routes: dashboard, drill, topics, cheatsheet, settings
components/          hand-rolled UI (no component library)
content/             cards, topics, lessons, cheat sheet, problem catalog
lib/                 datastore seam, scheduler, picker, hooks, utils
scripts/             offline catalog builder + curated seed lists
```

### Architecture notes

- **`lib/datastore.ts` is the only seam to persistence.** No component or store
  touches Dexie directly, and every method is async — so a network-backed
  implementation can drop in without changing any UI.
- **Design tokens live in `app/globals.css`** as CSS variables and are surfaced
  as Tailwind tokens. Change a value once and the whole app re-themes.
- **Content is plain data** (`content/cards.ts`), so cards can later be
  generated or imported without touching the UI.

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

## Theming

Near-monochrome, dark by default, one violet accent (`#6D28D9` light /
`#A78BFA` dark). No glow, no glassmorphism, no decorative gradients.
