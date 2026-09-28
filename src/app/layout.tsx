import React from "react";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumer OS — Premium Business Operating System | Lumer Labs",
  description: "Centralized business management platform for Lumer Labs. Managing clients, video shoots, finances, team wages, and social analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/30 text-slate-900 min-h-screen antialiased selection:bg-zinc-900 selection:text-white p-2 sm:p-4 md:p-6">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}


