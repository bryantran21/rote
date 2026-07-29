import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS, topicBySlug } from "@/content/topics";
import { CARDS } from "@/content/cards";
import { getLesson } from "@/lib/lessons";
import { TopicTabs } from "@/components/TopicTabs";

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
  const topicCards = CARDS.filter((c) => c.topic === meta.name);
  const primitives = [...new Set(topicCards.map((c) => c.primitive))];

  return (
    <div className="mx-auto max-w-prose px-6 py-8">
      <Link href="/topics" className="text-xs text-fg-muted hover:text-fg">
        ← All topics
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {meta.name}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">{meta.blurb}</p>
      </div>

      <TopicTabs
        topicName={meta.name}
        lesson={lesson}
        cardCount={topicCards.length}
        primitives={primitives}
      />
    </div>
  );
}
