import type { Problem } from "@/lib/types";
import raw from "./problems.json";

// The committed, metadata-only LeetCode catalog. Generated offline by
// scripts/build-catalog.ts (see Part A). The running app never scrapes.
export const PROBLEMS: Problem[] = raw as Problem[];

const BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]));
export function problemById(id: string): Problem | undefined {
  return BY_ID.get(id);
}
