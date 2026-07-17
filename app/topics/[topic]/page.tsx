import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS, topicBySlug } from "@/content/topics";
import { CARDS } from "@/content/cards";
import { getLesson } from "@/lib/lessons";
import { Markdown } from "@/components/Markdown";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const meta = topicBySlug(topic);
  return { title: meta ? `${meta.name} — Rote` : "Topic — Rote" };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const meta = topicBySlug(topic);
  if (!meta) notFound();

  const lesson = await getLesson(topic);
  const cardCount = CARDS.filter((c) => c.topic === meta.name).length;

  return (
    <div className="mx-auto max-w-prose px-6 py-8">
      <Link
        href="/topics"
        className="text-xs text-fg-muted hover:text-fg"
      >
        ← All topics
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            {meta.name}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{meta.blurb}</p>
        </div>
        <Link
          href={`/drill?topic=${encodeURIComponent(meta.name)}`}
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          Drill this topic
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-bg-elevated p-5 sm:p-6">
        {lesson ? (
          <Markdown copyable>{lesson}</Markdown>
        ) : (
          <p className="text-sm text-fg-subtle">
            No lesson written for this topic yet.
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-fg-subtle">
        {cardCount > 0
          ? `${cardCount} drill card${cardCount === 1 ? "" : "s"} in this topic`
          : "No drill cards in this topic yet"}
      </p>
    </div>
  );
}
