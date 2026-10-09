"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LumerProvider } from "@/lib/context/LumerContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ActionModals } from "@/components/modals/ActionModals";
import { Lock, ShieldCheck, FileText } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"client" | "income" | "expense" | "project" | null>(null);

  const isPublicLegalPage = pathname === "/privacy" || pathname === "/terms";
  const isLoginPage = pathname === "/login";

  // Public Legal Layout for /privacy and /terms
  if (isPublicLegalPage) {
    return (
      <LumerProvider>
        <div className="relative min-h-[calc(100vh-2rem)] bg-slate-50/90 backdrop-blur-md rounded-[24px] md:rounded-[36px] border border-slate-200/80 shadow-2xl shadow-indigo-100/50 flex flex-col overflow-hidden max-w-6xl mx-auto">
          {/* Public Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-20 px-4 sm:px-8 bg-slate-900 text-white border-b border-slate-800">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white text-zinc-950 font-black text-base sm:text-lg shadow-md shrink-0">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-white text-sm sm:text-base leading-none">
                  Lumer <span className="text-violet-400 font-medium">OS</span>
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-wider text-slate-400 font-semibold uppercase mt-0.5">
                  Lumer Labs Public Legal Portal
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
              <Link
                href="/privacy"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  pathname === "/privacy"
                    ? "bg-violet-600 text-white font-bold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  pathname === "/terms"
                    ? "bg-violet-600 text-white font-bold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                Terms of Service
              </Link>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-bold border border-white/10"
              >
                <Lock className="w-3.5 h-3.5 text-violet-400" />
                <span>CRM Login</span>
              </Link>
            </div>
          </header>

          {/* Main Legal Content */}
          <main className="flex-1 p-4 sm:p-8 lg:p-10 w-full max-w-5xl mx-auto space-y-8">
            {children}
          </main>

          {/* Public Footer */}
          <footer className="py-5 px-6 border-t border-slate-200/80 bg-white/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Lumer Labs</span>
              <span>© 2026. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-medium">
              <Link href="/privacy" className="hover:text-slate-900 hover:underline">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-slate-900 hover:underline">
                Terms of Service
              </Link>
              <span>•</span>
              <span className="font-semibold text-slate-700">THINK BETTER. THINK LUMER.</span>
            </div>
          </footer>
        </div>
      </LumerProvider>
    );
  }

  // Login Page Shell
  if (isLoginPage) {
    return (
      <LumerProvider>
        {children}
      </LumerProvider>
    );
  }

  // Standard Protected CRM Workspace Shell
  return (
    <LumerProvider>
      {/* Main Application Workspace Shell (Reference-inspired rounded container) */}
      <div className="relative min-h-[calc(100vh-2rem)] bg-slate-50/90 backdrop-blur-md rounded-[28px] md:rounded-[36px] border border-slate-200/80 shadow-2xl shadow-indigo-100/50 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Application Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          <Header
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenActionModal={(type) => setActiveModal(type)}
          />

          <main className="flex-1 p-4 lg:p-7 max-w-[1600px] w-full mx-auto space-y-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="py-4 px-6 border-t border-slate-200/70 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[1600px] mx-auto w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span>© 2026 Lumer Labs. All rights reserved.</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <Link href="/privacy" className="hover:text-slate-600 transition-colors underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/terms" className="hover:text-slate-600 transition-colors underline-offset-2 hover:underline">
                Terms of Service
              </Link>
            </div>
            <span className="font-semibold text-slate-500">
              THINK BETTER. THINK LUMER.
            </span>
          </footer>
        </div>
      </div>

      {/* Quick Action Modals */}
      <ActionModals modalType={activeModal} onClose={() => setActiveModal(null)} />
    </LumerProvider>
  );
}
