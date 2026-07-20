"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Dashboard", icon: "◧" },
  { href: "/drill", label: "Drill", icon: "▤" },
  { href: "/problems", label: "Problems", icon: "◇" },
  { href: "/topics", label: "Topics", icon: "◈" },
  { href: "/cheatsheet", label: "Cheat sheet", icon: "❯" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-bg-subtle px-3 py-4 md:flex">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <span className="grid h-7 w-7 place-items-center rounded bg-accent text-sm font-bold text-accent-fg">
          R
        </span>
        <span className="text-base font-semibold tracking-tight">Rote</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
              isActive(item.href)
                ? "bg-accent-subtle text-fg font-medium"
                : "text-fg-muted hover:bg-bg-elevated hover:text-fg"
            }`}
          >
            <span
              className={`w-4 text-center text-xs ${
                isActive(item.href) ? "text-accent" : "text-fg-subtle"
              }`}
              aria-hidden
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex items-center justify-between border-t border-border px-2 pt-3">
        <span className="text-xs text-fg-subtle">Phase 1</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
