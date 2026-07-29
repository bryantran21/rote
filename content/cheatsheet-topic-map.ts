// Best-effort map from a cheat-sheet section slug (see CheatsheetView's
// slugify) to a Rote topic name, so each section can offer a "Drill this →"
// link. Sections that span many topics (Templates) or none in particular
// (Gotchas) are intentionally omitted — no link beats a misleading one.

export const CHEATSHEET_SECTION_TOPIC: Record<string, string> = {
  lists: "Arrays & Hashing",
  strings: "Arrays & Hashing",
  dicts: "Arrays & Hashing",
  sets: "Arrays & Hashing",
  collections: "Arrays & Hashing",
  heapq: "Heap / Priority Queue",
  "sorting-and-keys": "Arrays & Hashing",
  comprehensions: "Arrays & Hashing",
  "iteration-helpers": "Arrays & Hashing",
  "numbers-and-math": "Math & Geometry",
  "bit-manipulation": "Bit Manipulation",
  // templates, gotchas: intentionally unmapped.
};
