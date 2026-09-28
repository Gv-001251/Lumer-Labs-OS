"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Plus,
  User,
  ExternalLink,
  Sparkles,
  Wallet,
  Building2,
  FolderPlus,
} from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { CommandMenu } from "@/components/layout/CommandMenu";
import Link from "next/link";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenActionModal?: (actionType: "client" | "income" | "expense" | "project") => void;
}

export function Header({ onOpenMobileSidebar, onOpenActionModal }: HeaderProps) {
  const pathname = usePathname();
  const { notifications, markNotificationRead } = useLumer();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 lg:px-8 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/70">
        {/* Left Mobile Sidebar Trigger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
              L
            </div>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight hidden sm:inline">
              Lumer OS
            </span>
          </div>
        </div>

        {/* Center Pill Quick Navigation Bar (Reference-Inspired floating dark pill) */}
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-zinc-900 text-white shadow-lg border border-zinc-800 text-xs">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-zinc-950 font-bold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Dashboard</span>
          </Link>

          <button
            onClick={() => onOpenActionModal?.("client")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-zinc-800 transition-all font-medium"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Add Client</span>
          </button>

          <button
            onClick={() => onOpenActionModal?.("expense")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-zinc-800 transition-all font-medium"
          >
            <Wallet className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Add Expense</span>
          </button>

          <button
            onClick={() => onOpenActionModal?.("project")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-zinc-800 transition-all font-medium"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Create Project</span>
          </button>
        </div>

        {/* Right Search, Notification & Avatar */}
        <div className="flex items-center gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center gap-2 shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-xs"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-600 animate-ping" />
              )}
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-600" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-3 rounded-2xl bg-white border border-slate-200 shadow-xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-violet-600" /> Notifications
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {unreadNotifs.length} unread
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto my-2 space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        n.read
                          ? "bg-slate-50/50 border-slate-100 text-slate-500"
                          : "bg-violet-50/50 border-violet-100 text-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.message}</p>
                      {n.link && (
                        <Link
                          href={n.link}
                          className="inline-flex items-center gap-1 text-[10px] text-violet-600 hover:underline mt-1.5 font-semibold"
                          onClick={() => setIsNotifOpen(false)}
                        >
                          View Details <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar (NavaGeevithan) */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white">
              NG
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Menu */}
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}

