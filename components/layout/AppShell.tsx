"use client";

import React, { useState } from "react";
import { LumerProvider } from "@/lib/context/LumerContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ActionModals } from "@/components/modals/ActionModals";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"client" | "income" | "expense" | "project" | null>(null);

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
          <footer className="py-4 px-6 border-t border-slate-200/70 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
            <span>© 2026 Lumer Labs. All rights reserved.</span>
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
