import type { Topic } from "@/lib/types";

// Maps raw LeetCode topic-tag slugs -> Rote's app topic taxonomy (the same
// strings the drill cards and the picker use, from content/topics.ts).
//
// Used by scripts/build-catalog.ts to derive Problem.appTopics from a problem's
// leetcodeTags. A tag may map to one topic here; a problem's appTopics is the
// unique union across its tags. When a curated seed entry already specifies
// appTopics, that grouping wins (see the build script).

export const TAG_TO_TOPIC: Record<string, Topic> = {
  // Arrays & Hashing
  array: "Arrays & Hashing",
  "hash-table": "Arrays & Hashing",
  string: "Arrays & Hashing",
  counting: "Arrays & Hashing",
  sorting: "Arrays & Hashing",
  matrix: "Arrays & Hashing",
  "prefix-sum": "Arrays & Hashing",

  // Two Pointers
  "two-pointers": "Two Pointers",

  // Sliding Window
  "sliding-window": "Sliding Window",

  // Stack
  stack: "Stack",
  "monotonic-stack": "Stack",

  // Binary Search
  "binary-search": "Binary Search",

  // Linked List
  "linked-list": "Linked List",

  // Trees
  tree: "Trees",
  "binary-tree": "Trees",
  "binary-search-tree": "Trees",
  "depth-first-search": "Trees",

  // Tries
  trie: "Tries",

  // Heap / Priority Queue
  "heap-priority-queue": "Heap / Priority Queue",

  // Backtracking
  backtracking: "Backtracking",

  // Graphs
  graph: "Graphs",
  "breadth-first-search": "Graphs",
  "union-find": "Graphs",

  // Advanced Graphs
  "topological-sort": "Advanced Graphs",
  "shortest-path": "Advanced Graphs",
  "minimum-spanning-tree": "Advanced Graphs",
  "strongly-connected-component": "Advanced Graphs",

  // DP
  "dynamic-programming": "1-D DP",
  "memoization": "1-D DP",

  // Greedy
  greedy: "Greedy",

  // Intervals
  interval: "Intervals",
  "line-sweep": "Intervals",

  // Math & Geometry
  math: "Math & Geometry",
  geometry: "Math & Geometry",
  "number-theory": "Math & Geometry",

  // Bit Manipulation
  "bit-manipulation": "Bit Manipulation",
  bitmask: "Bit Manipulation",
};

/** Derive app topics from raw LC tags. Falls back to empty if none map. */
export function tagsToTopics(tags: string[]): Topic[] {
  const out = new Set<Topic>();
  for (const t of tags) {
    const topic = TAG_TO_TOPIC[t];
    if (topic) out.add(topic);
  }
  return [...out];
}
