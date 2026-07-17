import { getCheatsheet } from "@/lib/cheatsheet";
import { CheatsheetView } from "@/components/CheatsheetView";

export const metadata = { title: "Cheat sheet — Rote" };

// Server component reads the markdown at build time; the interactive view
// (search / collapse / copy) is a client component fed the parsed data.
export default async function CheatsheetPage() {
  const data = await getCheatsheet();
  return <CheatsheetView data={data} />;
}
