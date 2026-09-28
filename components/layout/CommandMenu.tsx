"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Briefcase,
  Wallet,
  UserCheck,
  BarChart3,
  Bot,
  FileSpreadsheet,
  Settings,
  X,
  ArrowRight,
} from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { formatCurrency } from "@/lib/utils";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const { clients, projects, transactions } = useLumer();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          setQuery("");
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const pages = [
    { name: "Overview", href: "/", icon: Search },
    { name: "Clients Management", href: "/clients", icon: Users },
    { name: "Projects & Video Shoots", href: "/projects", icon: Briefcase },
    { name: "Financial Ledger", href: "/finance", icon: Wallet },
    { name: "Team & Wage Payroll", href: "/team", icon: UserCheck },
    { name: "Social Media Analytics", href: "/social", icon: BarChart3 },
    { name: "AI Automation Inbox", href: "/ai-inbox", icon: Bot },
    { name: "Reports & Audits", href: "/reports", icon: FileSpreadsheet },
    { name: "Workspace Settings", href: "/settings", icon: Settings },
  ];

  const filteredPages = pages.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.industry.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.clientName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f141c] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/40">
          <Search className="w-5 h-5 text-violet-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search clients, projects, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Pages Navigation */}
          {filteredPages.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Pages & Navigation
              </p>
              <div className="space-y-1">
                {filteredPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.href}
                      onClick={() => navigateTo(page.href)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-violet-600/20 hover:text-white transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-violet-400 group-hover:text-violet-300" />
                        <span>{page.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Client Matches */}
          {query.trim() && filteredClients.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Clients ({filteredClients.length})
              </p>
              <div className="space-y-1">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => navigateTo("/clients")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800/80 transition-colors"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-zinc-100">{client.name}</span>
                      <span className="text-[10px] text-zinc-500">{client.industry}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold text-xs">
                      {formatCurrency(client.monthlyPackage)}/mo
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Project Matches */}
          {query.trim() && filteredProjects.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Projects ({filteredProjects.length})
              </p>
              <div className="space-y-1">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigateTo("/projects")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800/80 transition-colors"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-zinc-100">{project.title}</span>
                      <span className="text-[10px] text-zinc-500">{project.clientName}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-950/60 text-violet-300 border border-violet-800/50">
                      {project.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() &&
            filteredPages.length === 0 &&
            filteredClients.length === 0 &&
            filteredProjects.length === 0 && (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No matching results found for "{query}".
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-zinc-950/60 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            Use <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">↓</kbd> to navigate
          </span>
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
