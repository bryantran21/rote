/**
 * build-catalog.ts — OFFLINE, MANUAL catalog builder for Problem of the Day.
 *
 *   npm run build-catalog
 *
 * METADATA ONLY. This script writes content/problems.json from the curated
 * seed below (title, difficulty, tags, list membership, canonical URL). It
 * NEVER fetches, stores, or renders problem statements, examples, or test
 * cases — those are LeetCode's copyrighted content. The running app links out;
 * it never scrapes.
 *
 * Refreshing: run occasionally by hand. An optional enrichment path can pull
 * *metadata only* via the `leetcode-query` package when it is installed and
 * `--fetch` is passed (see enrichFromLeetCode). If the package is unavailable
 * or blocked, the build falls back to the committed seed and the app stays
 * fully functional from content/problems.json with zero runtime LeetCode
 * dependency.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { Problem, ProblemDifficulty, Topic } from "../lib/types";
import { tagsToTopics } from "../content/topic-map";

interface Seed {
  id: number; // frontendId
  slug: string;
  title: string;
  diff: ProblemDifficulty;
  topics: Topic[]; // curated app-topic grouping (wins over tag derivation)
  tags: string[]; // raw LC tag slugs
  lists: string[]; // neetcode150 | blind75 | grind75
  paid?: boolean;
}

// Curated NeetCode-roadmap catalog. Grouped by Rote topic so appTopics is
// accurate. Metadata only.
const SEED: Seed[] = [
  // Arrays & Hashing
  s(1, "two-sum", "Two Sum", "Easy", ["Arrays & Hashing"], ["array", "hash-table"], ["neetcode150", "blind75", "grind75"]),
  s(217, "contains-duplicate", "Contains Duplicate", "Easy", ["Arrays & Hashing"], ["array", "hash-table", "sorting"], ["neetcode150", "grind75"]),
  s(242, "valid-anagram", "Valid Anagram", "Easy", ["Arrays & Hashing"], ["hash-table", "string", "sorting"], ["neetcode150", "grind75"]),
  s(49, "group-anagrams", "Group Anagrams", "Medium", ["Arrays & Hashing"], ["array", "hash-table", "string", "sorting"], ["neetcode150", "blind75", "grind75"]),
  s(347, "top-k-frequent-elements", "Top K Frequent Elements", "Medium", ["Arrays & Hashing", "Heap / Priority Queue"], ["array", "hash-table", "sorting", "heap-priority-queue", "counting"], ["neetcode150", "blind75", "grind75"]),
  s(238, "product-of-array-except-self", "Product of Array Except Self", "Medium", ["Arrays & Hashing"], ["array", "prefix-sum"], ["neetcode150", "blind75"]),
  s(271, "encode-and-decode-strings", "Encode and Decode Strings", "Medium", ["Arrays & Hashing"], ["array", "string"], ["neetcode150"], true),
  s(128, "longest-consecutive-sequence", "Longest Consecutive Sequence", "Medium", ["Arrays & Hashing"], ["array", "hash-table", "union-find"], ["neetcode150", "blind75"]),
  s(36, "valid-sudoku", "Valid Sudoku", "Medium", ["Arrays & Hashing"], ["array", "hash-table", "matrix"], ["neetcode150"]),

  // Two Pointers
  s(125, "valid-palindrome", "Valid Palindrome", "Easy", ["Two Pointers"], ["two-pointers", "string"], ["neetcode150", "grind75"]),
  s(167, "two-sum-ii-input-array-is-sorted", "Two Sum II", "Medium", ["Two Pointers"], ["array", "two-pointers", "binary-search"], ["neetcode150"]),
  s(15, "3sum", "3Sum", "Medium", ["Two Pointers"], ["array", "two-pointers", "sorting"], ["neetcode150", "blind75", "grind75"]),
  s(11, "container-with-most-water", "Container With Most Water", "Medium", ["Two Pointers"], ["array", "two-pointers", "greedy"], ["neetcode150", "blind75"]),
  s(42, "trapping-rain-water", "Trapping Rain Water", "Hard", ["Two Pointers"], ["array", "two-pointers", "stack", "dynamic-programming"], ["neetcode150", "blind75"]),

  // Sliding Window
  s(121, "best-time-to-buy-and-sell-stock", "Best Time to Buy and Sell Stock", "Easy", ["Sliding Window"], ["array", "dynamic-programming"], ["neetcode150", "blind75", "grind75"]),
  s(3, "longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "Medium", ["Sliding Window"], ["hash-table", "string", "sliding-window"], ["neetcode150", "blind75", "grind75"]),
  s(424, "longest-repeating-character-replacement", "Longest Repeating Character Replacement", "Medium", ["Sliding Window"], ["hash-table", "string", "sliding-window"], ["neetcode150"]),
  s(567, "permutation-in-string", "Permutation in String", "Medium", ["Sliding Window"], ["hash-table", "two-pointers", "string", "sliding-window"], ["neetcode150"]),
  s(76, "minimum-window-substring", "Minimum Window Substring", "Hard", ["Sliding Window"], ["hash-table", "string", "sliding-window"], ["neetcode150", "blind75"]),
  s(239, "sliding-window-maximum", "Sliding Window Maximum", "Hard", ["Sliding Window"], ["array", "sliding-window", "monotonic-stack", "heap-priority-queue"], ["neetcode150", "blind75"]),

  // Stack
  s(20, "valid-parentheses", "Valid Parentheses", "Easy", ["Stack"], ["string", "stack"], ["neetcode150", "blind75", "grind75"]),
  s(155, "min-stack", "Min Stack", "Medium", ["Stack"], ["stack", "design"], ["neetcode150", "grind75"]),
  s(150, "evaluate-reverse-polish-notation", "Evaluate Reverse Polish Notation", "Medium", ["Stack"], ["array", "math", "stack"], ["neetcode150"]),
  s(22, "generate-parentheses", "Generate Parentheses", "Medium", ["Stack", "Backtracking"], ["string", "dynamic-programming", "backtracking"], ["neetcode150", "grind75"]),
  s(739, "daily-temperatures", "Daily Temperatures", "Medium", ["Stack"], ["array", "stack", "monotonic-stack"], ["neetcode150"]),
  s(853, "car-fleet", "Car Fleet", "Medium", ["Stack"], ["array", "stack", "sorting", "monotonic-stack"], ["neetcode150"]),
  s(84, "largest-rectangle-in-histogram", "Largest Rectangle in Histogram", "Hard", ["Stack"], ["array", "stack", "monotonic-stack"], ["neetcode150"]),

  // Binary Search
  s(704, "binary-search", "Binary Search", "Easy", ["Binary Search"], ["array", "binary-search"], ["neetcode150", "grind75"]),
  s(74, "search-a-2d-matrix", "Search a 2D Matrix", "Medium", ["Binary Search"], ["array", "binary-search", "matrix"], ["neetcode150"]),
  s(875, "koko-eating-bananas", "Koko Eating Bananas", "Medium", ["Binary Search"], ["array", "binary-search"], ["neetcode150"]),
  s(153, "find-minimum-in-rotated-sorted-array", "Find Minimum in Rotated Sorted Array", "Medium", ["Binary Search"], ["array", "binary-search"], ["neetcode150", "blind75"]),
  s(33, "search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "Medium", ["Binary Search"], ["array", "binary-search"], ["neetcode150", "blind75", "grind75"]),
  s(981, "time-based-key-value-store", "Time Based Key-Value Store", "Medium", ["Binary Search"], ["hash-table", "string", "binary-search", "design"], ["neetcode150"]),
  s(4, "median-of-two-sorted-arrays", "Median of Two Sorted Arrays", "Hard", ["Binary Search"], ["array", "binary-search", "divide-and-conquer"], ["neetcode150", "blind75"]),

  // Linked List
  s(206, "reverse-linked-list", "Reverse Linked List", "Easy", ["Linked List"], ["linked-list", "recursion"], ["neetcode150", "blind75", "grind75"]),
  s(21, "merge-two-sorted-lists", "Merge Two Sorted Lists", "Easy", ["Linked List"], ["linked-list", "recursion"], ["neetcode150", "blind75", "grind75"]),
  s(141, "linked-list-cycle", "Linked List Cycle", "Easy", ["Linked List"], ["hash-table", "linked-list", "two-pointers"], ["neetcode150", "blind75", "grind75"]),
  s(143, "reorder-list", "Reorder List", "Medium", ["Linked List"], ["linked-list", "two-pointers", "stack"], ["neetcode150"]),
  s(19, "remove-nth-node-from-end-of-list", "Remove Nth Node From End of List", "Medium", ["Linked List"], ["linked-list", "two-pointers"], ["neetcode150", "grind75"]),
  s(138, "copy-list-with-random-pointer", "Copy List with Random Pointer", "Medium", ["Linked List"], ["hash-table", "linked-list"], ["neetcode150"]),
  s(2, "add-two-numbers", "Add Two Numbers", "Medium", ["Linked List"], ["linked-list", "math", "recursion"], ["neetcode150", "grind75"]),
  s(146, "lru-cache", "LRU Cache", "Medium", ["Linked List"], ["hash-table", "linked-list", "design", "doubly-linked-list"], ["neetcode150", "blind75", "grind75"]),
  s(23, "merge-k-sorted-lists", "Merge k Sorted Lists", "Hard", ["Linked List", "Heap / Priority Queue"], ["linked-list", "heap-priority-queue", "divide-and-conquer"], ["neetcode150", "blind75", "grind75"]),

  // Trees
  s(226, "invert-binary-tree", "Invert Binary Tree", "Easy", ["Trees"], ["tree", "depth-first-search", "breadth-first-search", "binary-tree"], ["neetcode150", "blind75", "grind75"]),
  s(104, "maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", "Easy", ["Trees"], ["tree", "depth-first-search", "breadth-first-search", "binary-tree"], ["neetcode150", "blind75", "grind75"]),
  s(543, "diameter-of-binary-tree", "Diameter of Binary Tree", "Easy", ["Trees"], ["tree", "depth-first-search", "binary-tree"], ["neetcode150", "grind75"]),
  s(110, "balanced-binary-tree", "Balanced Binary Tree", "Easy", ["Trees"], ["tree", "depth-first-search", "binary-tree"], ["neetcode150", "grind75"]),
  s(100, "same-tree", "Same Tree", "Easy", ["Trees"], ["tree", "depth-first-search", "breadth-first-search", "binary-tree"], ["neetcode150", "grind75"]),
  s(572, "subtree-of-another-tree", "Subtree of Another Tree", "Easy", ["Trees"], ["tree", "depth-first-search", "binary-tree"], ["neetcode150"]),
  s(235, "lowest-common-ancestor-of-a-binary-search-tree", "Lowest Common Ancestor of a BST", "Medium", ["Trees"], ["tree", "depth-first-search", "binary-search-tree", "binary-tree"], ["neetcode150", "grind75"]),
  s(102, "binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "Medium", ["Trees"], ["tree", "breadth-first-search", "binary-tree"], ["neetcode150", "blind75", "grind75"]),
  s(98, "validate-binary-search-tree", "Validate Binary Search Tree", "Medium", ["Trees"], ["tree", "depth-first-search", "binary-search-tree", "binary-tree"], ["neetcode150", "blind75", "grind75"]),
  s(230, "kth-smallest-element-in-a-bst", "Kth Smallest Element in a BST", "Medium", ["Trees"], ["tree", "depth-first-search", "binary-search-tree", "binary-tree"], ["neetcode150"]),
  s(105, "construct-binary-tree-from-preorder-and-inorder-traversal", "Construct Binary Tree from Preorder and Inorder Traversal", "Medium", ["Trees"], ["array", "hash-table", "divide-and-conquer", "tree", "binary-tree"], ["neetcode150", "blind75"]),
  s(124, "binary-tree-maximum-path-sum", "Binary Tree Maximum Path Sum", "Hard", ["Trees"], ["dynamic-programming", "tree", "depth-first-search", "binary-tree"], ["neetcode150", "blind75"]),
  s(297, "serialize-and-deserialize-binary-tree", "Serialize and Deserialize Binary Tree", "Hard", ["Trees"], ["string", "tree", "depth-first-search", "breadth-first-search", "design", "binary-tree"], ["neetcode150", "blind75"]),

  // Tries
  s(208, "implement-trie-prefix-tree", "Implement Trie (Prefix Tree)", "Medium", ["Tries"], ["hash-table", "string", "design", "trie"], ["neetcode150", "grind75"]),
  s(211, "design-add-and-search-words-data-structure", "Design Add and Search Words Data Structure", "Medium", ["Tries"], ["string", "depth-first-search", "design", "trie"], ["neetcode150"]),
  s(212, "word-search-ii", "Word Search II", "Hard", ["Tries"], ["array", "string", "backtracking", "trie", "matrix"], ["neetcode150"]),

  // Heap / Priority Queue
  s(703, "kth-largest-element-in-a-stream", "Kth Largest Element in a Stream", "Easy", ["Heap / Priority Queue"], ["tree", "design", "binary-search-tree", "heap-priority-queue"], ["neetcode150"]),
  s(1046, "last-stone-weight", "Last Stone Weight", "Easy", ["Heap / Priority Queue"], ["array", "heap-priority-queue"], ["neetcode150"]),
  s(973, "k-closest-points-to-origin", "K Closest Points to Origin", "Medium", ["Heap / Priority Queue"], ["array", "math", "geometry", "sorting", "heap-priority-queue"], ["neetcode150"]),
  s(215, "kth-largest-element-in-an-array", "Kth Largest Element in an Array", "Medium", ["Heap / Priority Queue"], ["array", "sorting", "heap-priority-queue", "divide-and-conquer"], ["neetcode150", "grind75"]),
  s(621, "task-scheduler", "Task Scheduler", "Medium", ["Heap / Priority Queue"], ["array", "hash-table", "greedy", "sorting", "heap-priority-queue", "counting"], ["neetcode150"]),
  s(355, "design-twitter", "Design Twitter", "Medium", ["Heap / Priority Queue"], ["hash-table", "linked-list", "design", "heap-priority-queue"], ["neetcode150"]),
  s(295, "find-median-from-data-stream", "Find Median from Data Stream", "Hard", ["Heap / Priority Queue"], ["two-pointers", "design", "sorting", "heap-priority-queue"], ["neetcode150", "blind75"]),

  // Backtracking
  s(78, "subsets", "Subsets", "Medium", ["Backtracking"], ["array", "backtracking", "bit-manipulation"], ["neetcode150", "grind75"]),
  s(39, "combination-sum", "Combination Sum", "Medium", ["Backtracking"], ["array", "backtracking"], ["neetcode150", "grind75"]),
  s(46, "permutations", "Permutations", "Medium", ["Backtracking"], ["array", "backtracking"], ["neetcode150", "grind75"]),
  s(90, "subsets-ii", "Subsets II", "Medium", ["Backtracking"], ["array", "backtracking", "bit-manipulation"], ["neetcode150"]),
  s(40, "combination-sum-ii", "Combination Sum II", "Medium", ["Backtracking"], ["array", "backtracking"], ["neetcode150"]),
  s(79, "word-search", "Word Search", "Medium", ["Backtracking"], ["array", "string", "backtracking", "matrix"], ["neetcode150", "grind75"]),
  s(131, "palindrome-partitioning", "Palindrome Partitioning", "Medium", ["Backtracking"], ["string", "dynamic-programming", "backtracking"], ["neetcode150"]),
  s(17, "letter-combinations-of-a-phone-number", "Letter Combinations of a Phone Number", "Medium", ["Backtracking"], ["hash-table", "string", "backtracking"], ["neetcode150", "grind75"]),
  s(51, "n-queens", "N-Queens", "Hard", ["Backtracking"], ["array", "backtracking"], ["neetcode150"]),

  // Graphs
  s(200, "number-of-islands", "Number of Islands", "Medium", ["Graphs"], ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"], ["neetcode150", "blind75", "grind75"]),
  s(133, "clone-graph", "Clone Graph", "Medium", ["Graphs"], ["hash-table", "depth-first-search", "breadth-first-search", "graph"], ["neetcode150", "blind75", "grind75"]),
  s(695, "max-area-of-island", "Max Area of Island", "Medium", ["Graphs"], ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"], ["neetcode150"]),
  s(417, "pacific-atlantic-water-flow", "Pacific Atlantic Water Flow", "Medium", ["Graphs"], ["array", "depth-first-search", "breadth-first-search", "matrix"], ["neetcode150", "blind75"]),
  s(207, "course-schedule", "Course Schedule", "Medium", ["Graphs"], ["depth-first-search", "breadth-first-search", "graph", "topological-sort"], ["neetcode150", "blind75", "grind75"]),
  s(210, "course-schedule-ii", "Course Schedule II", "Medium", ["Graphs"], ["depth-first-search", "breadth-first-search", "graph", "topological-sort"], ["neetcode150"]),
  s(994, "rotting-oranges", "Rotting Oranges", "Medium", ["Graphs"], ["array", "breadth-first-search", "matrix"], ["neetcode150", "grind75"]),
  s(130, "surrounded-regions", "Surrounded Regions", "Medium", ["Graphs"], ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"], ["neetcode150"]),
  s(684, "redundant-connection", "Redundant Connection", "Medium", ["Graphs"], ["depth-first-search", "breadth-first-search", "union-find", "graph"], ["neetcode150"]),
  s(127, "word-ladder", "Word Ladder", "Hard", ["Graphs"], ["hash-table", "string", "breadth-first-search"], ["neetcode150", "blind75"]),

  // Advanced Graphs
  s(743, "network-delay-time", "Network Delay Time", "Medium", ["Advanced Graphs"], ["depth-first-search", "breadth-first-search", "graph", "heap-priority-queue", "shortest-path"], ["neetcode150"]),
  s(332, "reconstruct-itinerary", "Reconstruct Itinerary", "Hard", ["Advanced Graphs"], ["depth-first-search", "graph"], ["neetcode150"]),
  s(1584, "min-cost-to-connect-all-points", "Min Cost to Connect All Points", "Medium", ["Advanced Graphs"], ["array", "union-find", "graph", "minimum-spanning-tree"], ["neetcode150"]),
  s(778, "swim-in-rising-water", "Swim in Rising Water", "Hard", ["Advanced Graphs"], ["array", "binary-search", "depth-first-search", "breadth-first-search", "union-find", "heap-priority-queue", "matrix"], ["neetcode150"]),
  s(269, "alien-dictionary", "Alien Dictionary", "Hard", ["Advanced Graphs"], ["array", "string", "depth-first-search", "breadth-first-search", "graph", "topological-sort"], ["neetcode150"], true),
  s(787, "cheapest-flights-within-k-stops", "Cheapest Flights Within K Stops", "Medium", ["Advanced Graphs"], ["dynamic-programming", "depth-first-search", "breadth-first-search", "graph", "heap-priority-queue", "shortest-path"], ["neetcode150"]),

  // 1-D DP
  s(70, "climbing-stairs", "Climbing Stairs", "Easy", ["1-D DP"], ["math", "dynamic-programming", "memoization"], ["neetcode150", "blind75", "grind75"]),
  s(746, "min-cost-climbing-stairs", "Min Cost Climbing Stairs", "Easy", ["1-D DP"], ["array", "dynamic-programming"], ["neetcode150"]),
  s(198, "house-robber", "House Robber", "Medium", ["1-D DP"], ["array", "dynamic-programming"], ["neetcode150", "blind75", "grind75"]),
  s(213, "house-robber-ii", "House Robber II", "Medium", ["1-D DP"], ["array", "dynamic-programming"], ["neetcode150"]),
  s(5, "longest-palindromic-substring", "Longest Palindromic Substring", "Medium", ["1-D DP"], ["two-pointers", "string", "dynamic-programming"], ["neetcode150", "blind75", "grind75"]),
  s(647, "palindromic-substrings", "Palindromic Substrings", "Medium", ["1-D DP"], ["two-pointers", "string", "dynamic-programming"], ["neetcode150"]),
  s(91, "decode-ways", "Decode Ways", "Medium", ["1-D DP"], ["string", "dynamic-programming"], ["neetcode150", "blind75"]),
  s(322, "coin-change", "Coin Change", "Medium", ["1-D DP"], ["array", "dynamic-programming", "breadth-first-search"], ["neetcode150", "blind75", "grind75"]),
  s(152, "maximum-product-subarray", "Maximum Product Subarray", "Medium", ["1-D DP"], ["array", "dynamic-programming"], ["neetcode150", "blind75"]),
  s(139, "word-break", "Word Break", "Medium", ["1-D DP"], ["array", "hash-table", "string", "dynamic-programming", "trie", "memoization"], ["neetcode150", "blind75", "grind75"]),
  s(300, "longest-increasing-subsequence", "Longest Increasing Subsequence", "Medium", ["1-D DP"], ["array", "binary-search", "dynamic-programming"], ["neetcode150", "blind75", "grind75"]),

  // 2-D DP
  s(62, "unique-paths", "Unique Paths", "Medium", ["2-D DP"], ["math", "dynamic-programming", "combinatorics"], ["neetcode150", "grind75"]),
  s(1143, "longest-common-subsequence", "Longest Common Subsequence", "Medium", ["2-D DP"], ["string", "dynamic-programming"], ["neetcode150", "grind75"]),
  s(309, "best-time-to-buy-and-sell-stock-with-cooldown", "Best Time to Buy and Sell Stock with Cooldown", "Medium", ["2-D DP"], ["array", "dynamic-programming"], ["neetcode150"]),
  s(518, "coin-change-ii", "Coin Change II", "Medium", ["2-D DP"], ["array", "dynamic-programming"], ["neetcode150"]),
  s(494, "target-sum", "Target Sum", "Medium", ["2-D DP"], ["array", "dynamic-programming", "backtracking"], ["neetcode150"]),
  s(72, "edit-distance", "Edit Distance", "Medium", ["2-D DP"], ["string", "dynamic-programming"], ["neetcode150", "blind75"]),
  s(10, "regular-expression-matching", "Regular Expression Matching", "Hard", ["2-D DP"], ["string", "dynamic-programming", "recursion"], ["neetcode150"]),
  s(115, "distinct-subsequences", "Distinct Subsequences", "Hard", ["2-D DP"], ["string", "dynamic-programming"], ["neetcode150"]),

  // Greedy
  s(53, "maximum-subarray", "Maximum Subarray", "Medium", ["Greedy"], ["array", "divide-and-conquer", "dynamic-programming", "greedy"], ["neetcode150", "blind75", "grind75"]),
  s(55, "jump-game", "Jump Game", "Medium", ["Greedy"], ["array", "dynamic-programming", "greedy"], ["neetcode150", "blind75", "grind75"]),
  s(45, "jump-game-ii", "Jump Game II", "Medium", ["Greedy"], ["array", "dynamic-programming", "greedy"], ["neetcode150"]),
  s(134, "gas-station", "Gas Station", "Medium", ["Greedy"], ["array", "greedy"], ["neetcode150", "grind75"]),
  s(846, "hand-of-straights", "Hand of Straights", "Medium", ["Greedy"], ["array", "hash-table", "greedy", "sorting"], ["neetcode150"]),
  s(678, "valid-parenthesis-string", "Valid Parenthesis String", "Medium", ["Greedy"], ["string", "dynamic-programming", "stack", "greedy"], ["neetcode150"]),

  // Intervals
  s(57, "insert-interval", "Insert Interval", "Medium", ["Intervals"], ["array", "interval"], ["neetcode150", "blind75", "grind75"]),
  s(56, "merge-intervals", "Merge Intervals", "Medium", ["Intervals"], ["array", "sorting", "interval"], ["neetcode150", "blind75", "grind75"]),
  s(435, "non-overlapping-intervals", "Non-overlapping Intervals", "Medium", ["Intervals"], ["array", "dynamic-programming", "greedy", "sorting", "interval"], ["neetcode150", "blind75"]),
  s(252, "meeting-rooms", "Meeting Rooms", "Easy", ["Intervals"], ["array", "sorting", "interval"], ["neetcode150", "grind75"], true),
  s(253, "meeting-rooms-ii", "Meeting Rooms II", "Medium", ["Intervals"], ["array", "two-pointers", "greedy", "sorting", "heap-priority-queue", "interval"], ["neetcode150", "grind75"], true),
  s(1851, "minimum-interval-to-include-each-query", "Minimum Interval to Include Each Query", "Hard", ["Intervals"], ["array", "binary-search", "sorting", "heap-priority-queue", "interval", "line-sweep"], ["neetcode150"]),

  // Math & Geometry
  s(48, "rotate-image", "Rotate Image", "Medium", ["Math & Geometry"], ["array", "math", "matrix"], ["neetcode150", "grind75"]),
  s(54, "spiral-matrix", "Spiral Matrix", "Medium", ["Math & Geometry"], ["array", "matrix", "simulation"], ["neetcode150", "grind75"]),
  s(73, "set-matrix-zeroes", "Set Matrix Zeroes", "Medium", ["Math & Geometry"], ["array", "hash-table", "matrix"], ["neetcode150"]),
  s(202, "happy-number", "Happy Number", "Easy", ["Math & Geometry"], ["hash-table", "math", "two-pointers"], ["neetcode150", "grind75"]),
  s(66, "plus-one", "Plus One", "Easy", ["Math & Geometry"], ["array", "math"], ["neetcode150", "grind75"]),
  s(50, "powx-n", "Pow(x, n)", "Medium", ["Math & Geometry"], ["math", "recursion"], ["neetcode150"]),
  s(43, "multiply-strings", "Multiply Strings", "Medium", ["Math & Geometry"], ["math", "string", "simulation"], ["neetcode150"]),

  // Bit Manipulation
  s(136, "single-number", "Single Number", "Easy", ["Bit Manipulation"], ["array", "bit-manipulation"], ["neetcode150", "grind75"]),
  s(191, "number-of-1-bits", "Number of 1 Bits", "Easy", ["Bit Manipulation"], ["divide-and-conquer", "bit-manipulation"], ["neetcode150", "grind75"]),
  s(338, "counting-bits", "Counting Bits", "Easy", ["Bit Manipulation"], ["dynamic-programming", "bit-manipulation"], ["neetcode150", "blind75", "grind75"]),
  s(190, "reverse-bits", "Reverse Bits", "Easy", ["Bit Manipulation"], ["divide-and-conquer", "bit-manipulation"], ["neetcode150", "blind75"]),
  s(268, "missing-number", "Missing Number", "Easy", ["Bit Manipulation"], ["array", "hash-table", "math", "bit-manipulation", "sorting"], ["neetcode150", "blind75", "grind75"]),
  s(371, "sum-of-two-integers", "Sum of Two Integers", "Medium", ["Bit Manipulation"], ["math", "bit-manipulation"], ["neetcode150"]),
  s(7, "reverse-integer", "Reverse Integer", "Medium", ["Bit Manipulation", "Math & Geometry"], ["math"], ["neetcode150"]),
];

function s(
  id: number,
  slug: string,
  title: string,
  diff: ProblemDifficulty,
  topics: Topic[],
  tags: string[],
  lists: string[],
  paid = false,
): Seed {
  return { id, slug, title, diff, topics, tags, lists, paid };
}

/**
 * Optional metadata-only enrichment via leetcode-query. Only runs with --fetch
 * AND the package installed. Fills acRate/paidOnly from the public problem
 * list. NEVER touches problem statements. Silently skipped otherwise.
 */
async function enrichFromLeetCode(
  problems: Problem[],
): Promise<void> {
  if (!process.argv.includes("--fetch")) return;
  try {
    // Dynamic import via a variable specifier so the build (and typecheck)
    // work without the optional dependency installed.
    const pkg = "leetcode-query";
    const mod: any = await import(pkg).catch(() => null);
    if (!mod?.LeetCode) {
      console.log("• leetcode-query not installed — using seed metadata only.");
      return;
    }
    const lc = new mod.LeetCode();
    const bySlug = new Map(problems.map((p) => [p.slug, p]));
    let offset = 0;
    const limit = 100;
    // Page through the public list; metadata fields only.
    for (;;) {
      const page = await lc.problems({ limit, offset });
      const qs = page?.questions ?? [];
      if (qs.length === 0) break;
      for (const q of qs) {
        const p = bySlug.get(q.titleSlug);
        if (p) {
          p.acRate = typeof q.acRate === "number" ? q.acRate / 100 : p.acRate;
          p.paidOnly = Boolean(q.paidOnly);
        }
      }
      offset += limit;
      if (offset >= (page?.total ?? offset)) break;
      await new Promise((r) => setTimeout(r, 400)); // be polite to the rate limiter
    }
    console.log("• Enriched acRate/paidOnly from leetcode-query (metadata only).");
  } catch (e) {
    console.log("• Enrichment failed — falling back to seed metadata.", e);
  }
}

/*
 * ⚠️ PARETO 50 — APPROXIMATE, NEEDS VERIFICATION.
 *
 * We do NOT have a reliable copy of NeetCode's official "Pareto" list, so the
 * set below is a high-confidence CORE subset: problems that appear on virtually
 * every "if you only do N problems" short list (the Blind-75 fundamentals). It
 * is intentionally PARTIAL — ~26 of a nominal 50 — rather than guessed.
 *
 * TODO(owner): replace/extend with the official Pareto-50 slugs. Any slug added
 * here that also exists in SEED gets `pareto50` in its `lists`. Slugs listed
 * that are NOT yet in SEED are flagged at build time (see the warning below).
 */
const PARETO50_SLUGS: string[] = [
  "two-sum",
  "valid-anagram",
  "contains-duplicate",
  "group-anagrams",
  "top-k-frequent-elements",
  "product-of-array-except-self",
  "valid-palindrome",
  "3sum",
  "container-with-most-water",
  "best-time-to-buy-and-sell-stock",
  "longest-substring-without-repeating-characters",
  "valid-parentheses",
  "binary-search",
  "reverse-linked-list",
  "merge-two-sorted-lists",
  "linked-list-cycle",
  "invert-binary-tree",
  "maximum-depth-of-binary-tree",
  "same-tree",
  "binary-tree-level-order-traversal",
  "number-of-islands",
  "climbing-stairs",
  "coin-change",
  "maximum-subarray",
  "merge-intervals",
  "single-number",
];

async function main() {
  const pareto = new Set(PARETO50_SLUGS);
  const seedSlugs = new Set(SEED.map((s) => s.slug));

  // Flag any Pareto slug we couldn't attach because it's missing from SEED.
  const orphanPareto = PARETO50_SLUGS.filter((s) => !seedSlugs.has(s));
  if (orphanPareto.length) {
    console.log(
      "⚠ pareto50 slugs not present in SEED (add them to SEED to include):",
      orphanPareto,
    );
  }

  const problems: Problem[] = SEED.map((seed) => {
    // Curated grouping wins; fall back to tag derivation if none given.
    const appTopics =
      seed.topics.length > 0 ? seed.topics : tagsToTopics(seed.tags);
    const lists = pareto.has(seed.slug)
      ? [...seed.lists, "pareto50"]
      : seed.lists;
    return {
      id: String(seed.id),
      frontendId: seed.id,
      slug: seed.slug,
      title: seed.title,
      difficulty: seed.diff,
      leetcodeTags: seed.tags,
      appTopics,
      paidOnly: Boolean(seed.paid),
      lists,
      url: `https://leetcode.com/problems/${seed.slug}/`,
    };
  });

  await enrichFromLeetCode(problems);

  problems.sort((a, b) => a.frontendId - b.frontendId);

  const outPath = path.join(process.cwd(), "content", "problems.json");
  await writeFile(outPath, JSON.stringify(problems, null, 2) + "\n", "utf8");

  // Summary
  const byDiff: Record<string, number> = {};
  const byTopic: Record<string, number> = {};
  const byList: Record<string, number> = {};
  for (const p of problems) {
    byDiff[p.difficulty] = (byDiff[p.difficulty] ?? 0) + 1;
    for (const t of p.appTopics) byTopic[t] = (byTopic[t] ?? 0) + 1;
    for (const l of p.lists) byList[l] = (byList[l] ?? 0) + 1;
  }
  console.log(`\n✓ Wrote ${problems.length} problems to content/problems.json`);
  console.log("  by difficulty:", byDiff);
  console.log("  by list:", byList);
  console.log("  by app topic:", byTopic);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
