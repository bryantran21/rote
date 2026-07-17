import { readFile } from "node:fs/promises";
import path from "node:path";

// Server-only: reads a topic lesson markdown file at request/build time.
// Lessons live in content/lessons/<slug>.md.

export async function getLesson(slug: string): Promise<string | null> {
  try {
    const file = path.join(process.cwd(), "content", "lessons", `${slug}.md`);
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}
