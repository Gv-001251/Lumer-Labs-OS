"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  UserCheck,
  BarChart3,
  Bot,
  FileSpreadsheet,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  MoreVertical,
  Layers,
} from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { aiInboxItems } = useLumer();
  const [collapsed, setCollapsed] = useState(false);

  const pendingAiCount = aiInboxItems.filter((i) => i.status === "Pending Verification").length;

  const mainNav = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Projects", href: "/projects", icon: Briefcase },
    { name: "Finance", href: "/finance", icon: Wallet },
    { name: "Team", href: "/team", icon: UserCheck },
    { name: "Social Analytics", href: "/social", icon: BarChart3 },
    {
      name: "AI Inbox",
      href: "/ai-inbox",
      icon: Bot,
      badge: pendingAiCount > 0 ? pendingAiCount : null,
    },
    { name: "Reports", href: "/reports", icon: FileSpreadsheet },
  ];

  const secondaryNav = [
    { name: "Calendar", href: "/projects#calendar", icon: Calendar },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0d0f14] text-slate-300 border-r border-slate-800/80 transition-all duration-300 ease-in-out shadow-xl",
          collapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 overflow-hidden" onClick={onCloseMobile}>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white text-zinc-950 font-black text-lg shadow-md shrink-0">
              L
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-white text-base leading-none">
                  Lumer <span className="text-violet-400 font-medium">OS</span>
                </span>
                <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase mt-0.5">
                  Lumer Labs
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-violet-400 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="font-bold text-white text-xs">Lumer Labs Workspace</span>
                <span className="text-[10px] text-slate-400">Enterprise Operating System</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Links */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Core Systems
              </p>
            )}
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all relative group",
                    isActive
                      ? "bg-zinc-800/90 text-white font-semibold shadow-xs border border-slate-700/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />

                  {!collapsed && <span className="truncate">{item.name}</span>}

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={cn(
                        "ml-auto flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                        item.name === "AI Inbox"
                          ? "bg-violet-500 text-white shadow-xs shadow-violet-500/50 animate-pulse"
                          : "bg-slate-800 text-slate-300"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary Links */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Preferences
              </p>
            )}
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                    isActive
                      ? "bg-zinc-800 text-white font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-200" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Profile Section (NavaGeevithan) */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
              NG
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate min-w-0 flex-1">
                <span className="text-xs font-bold text-white truncate leading-snug">NavaGeevithan</span>
                <span className="text-[10px] text-slate-400 truncate">President, Lumer Labs</span>
              </div>
            )}
            {!collapsed && (
              <button className="text-slate-400 hover:text-white p-1 rounded-lg">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse Button (Desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-md"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  );
}

