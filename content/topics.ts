// The NeetCode-style roadmap. This exact ordered list is the single source of
// truth for Rote's topic taxonomy — Card.topic, Problem.appTopics, mastery bars,
// and the problem picker all key off these strings.

export interface TopicMeta {
  name: string;
  slug: string;
  blurb: string;
}

export const TOPICS: TopicMeta[] = [
  { name: "Arrays & Hashing", slug: "arrays-hashing", blurb: "Lists, dicts, sets, and counting patterns." },
  { name: "Two Pointers", slug: "two-pointers", blurb: "Converging/parallel index scans." },
  { name: "Stack", slug: "stack", blurb: "LIFO patterns and monotonic stacks." },
  { name: "Binary Search", slug: "binary-search", blurb: "Search over sorted data and answer spaces." },
  { name: "Sliding Window", slug: "sliding-window", blurb: "Contiguous subarray/substring windows." },
  { name: "Linked List", slug: "linked-list", blurb: "Pointer manipulation and dummy heads." },
  { name: "Trees", slug: "trees", blurb: "Traversals, recursion, BST invariants." },
  { name: "Tries", slug: "tries", blurb: "Prefix trees for word lookups." },
  { name: "Heap / Priority Queue", slug: "heap-priority-queue", blurb: "heapq, top-k, and streaming medians." },
  { name: "Backtracking", slug: "backtracking", blurb: "Choose / explore / un-choose recursion." },
  { name: "Graphs", slug: "graphs", blurb: "BFS, DFS, and union-find on grids/adjacency." },
  { name: "Advanced Graphs", slug: "advanced-graphs", blurb: "Dijkstra, MST, topological sort." },
  { name: "1-D DP", slug: "1-d-dp", blurb: "Linear dynamic programming." },
  { name: "2-D DP", slug: "2-d-dp", blurb: "Grid and interval dynamic programming." },
  { name: "Greedy", slug: "greedy", blurb: "Locally optimal choices." },
  { name: "Intervals", slug: "intervals", blurb: "Merging, inserting, and scheduling ranges." },
  { name: "Math & Geometry", slug: "math-geometry", blurb: "Number theory and coordinate tricks." },
  { name: "Bit Manipulation", slug: "bit-manipulation", blurb: "Masks, shifts, and XOR tricks." },
];

export const TOPIC_NAMES: string[] = TOPICS.map((t) => t.name);

const BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));
const BY_NAME = new Map(TOPICS.map((t) => [t.name, t]));

export function topicBySlug(slug: string): TopicMeta | undefined {
  return BY_SLUG.get(slug);
}

export function topicByName(name: string): TopicMeta | undefined {
  return BY_NAME.get(name);
}

export function topicSlug(name: string): string {
  return BY_NAME.get(name)?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
