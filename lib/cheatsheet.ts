import { readFile } from "node:fs/promises";
import path from "node:path";

// Server-only reader for the cheat sheet markdown, plus a parser that splits it
// into ## sections so the page can render a nav, search, and collapse per
// section. Content is used verbatim.

export interface CheatSection {
  title: string;
  slug: string;
  body: string; // markdown for this section (excluding its ## heading)
}

export interface Cheatsheet {
  intro: string; // everything before the first ## (title + preamble)
  sections: CheatSection[];
}

export async function getCheatsheet(): Promise<Cheatsheet> {
  const file = path.join(process.cwd(), "content", "cheatsheet.md");
  const raw = await readFile(file, "utf8");
  return parseCheatsheet(raw);
}

export function parseCheatsheet(raw: string): Cheatsheet {
  const lines = raw.split("\n");
  const sections: CheatSection[] = [];
  let intro: string[] = [];
  let current: { title: string; body: string[] } | null = null;

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      if (current) {
        sections.push(finalize(current));
      }
      current = { title: m[1], body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      intro.push(line);
    }
  }
  if (current) sections.push(finalize(current));

  return { intro: intro.join("\n").trim(), sections };
}

function finalize(s: { title: string; body: string[] }): CheatSection {
  return {
    title: s.title,
    slug: slugify(s.title),
    body: s.body.join("\n").trim(),
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
