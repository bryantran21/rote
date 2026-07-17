import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Rote — Python syntax trainer",
  description:
    "Spaced-repetition drills for Python interview syntax. Rep-heavy, low-pressure, offline-first.",
  manifest: "/manifest.webmanifest",
  applicationName: "Rote",
  appleWebApp: { capable: true, title: "Rote", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Set theme before paint to avoid a flash. Dark is the default.
const themeInit = `(function(){try{var t=localStorage.getItem('rote-theme');var d=t?t==='dark':true;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
