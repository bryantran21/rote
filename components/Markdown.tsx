"use client";

import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Shared markdown renderer for lessons and the cheat sheet. Styled to the Rote
// palette (no external prose plugin — keeps the bundle lean). Code blocks get
// an optional copy button.

export function Markdown({
  children,
  copyable = false,
}: {
  children: string;
  copyable?: boolean;
}) {
  return (
    <div className="text-sm leading-relaxed text-fg-muted">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-6 text-xl font-semibold text-fg first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-6 text-base font-semibold text-fg">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-sm font-semibold text-fg">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-3 flex list-disc flex-col gap-1.5 pl-5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 flex list-decimal flex-col gap-1.5 pl-5">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-accent underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-fg">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-accent pl-4 text-fg-subtle">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-border" />,
          code: ({ children, className }) => {
            // Block code carries a language- className; inline code doesn't.
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return <code className="font-mono">{children}</code>;
            }
            return (
              <code className="rounded bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.8125rem] text-fg">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <CodeBlock copyable={copyable}>{children}</CodeBlock>,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border-strong px-3 py-2 font-medium text-fg">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border px-3 py-2 align-top">
              {children}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({
  children,
  copyable,
}: {
  children: ReactNode;
  copyable: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent<HTMLButtonElement>) => {
    const pre = e.currentTarget.parentElement?.querySelector("code");
    const text = pre?.textContent ?? "";
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className="group relative my-4">
      <pre className="overflow-x-auto rounded-md border border-border bg-bg-subtle p-3.5 font-mono text-[0.8125rem] leading-relaxed text-fg">
        {children}
      </pre>
      {copyable && (
        <button
          onClick={copy}
          className="absolute right-2 top-2 rounded border border-border bg-bg-elevated px-2 py-1 text-xs text-fg-subtle opacity-0 transition-opacity hover:text-fg group-hover:opacity-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}
