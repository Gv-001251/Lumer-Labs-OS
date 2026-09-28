"use client";

import React, { useState } from "react";
import {
  Building2,
  DollarSign,
  Bell,
  Bot,
  CheckCircle2,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "financial" | "ai" | "notifications">("workspace");

  // Form states
  const [companyName, setCompanyName] = useState("Lumer Labs");
  const [tagline, setTagline] = useState("THINK BETTER. THINK LUMER.");
  const [currency, setCurrency] = useState("INR (₹)");
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(85);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("Settings updated successfully!");
    setTimeout(() => setToastMessage(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure Lumer OS preferences, currency standards, AI automation rules & security.
        </p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          {[
            { id: "workspace", label: "Workspace Profile", icon: Building2 },
            { id: "financial", label: "Financial & Currency", icon: DollarSign },
            { id: "ai", label: "AI Automation Rules", icon: Bot },
            { id: "notifications", label: "Notifications & Alerts", icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === "workspace" && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Company & Branding Information
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tagline</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Workspace ID</label>
                    <input
                      type="text"
                      disabled
                      value="lumer-labs-prod-01"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "financial" && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Currency & Billing Preferences
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Primary Operating Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
                    >
                      <option value="INR (₹)">INR — Indian Rupee (₹)</option>
                      <option value="USD ($)">USD — US Dollar ($)</option>
                      <option value="EUR (€)">EUR — Euro (€)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                    All financial ledger cards, MRR totals, team wage payouts, and report statements default to Indian Rupee (₹ INR).
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  AI Assistant & Verification Rules
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Minimum AI Confidence Threshold for Auto-Suggestion: {aiConfidenceThreshold}%
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={99}
                      value={aiConfidenceThreshold}
                      onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
                      className="w-full accent-zinc-900 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                    <span className="font-extrabold text-violet-900 block">Strict Human-in-the-Loop Safeguard</span>
                    <p className="text-slate-600 leading-snug font-medium">
                      Extracted financial data from WhatsApp payment screenshots or emails will NEVER be saved automatically without your explicit approval click in the AI Inbox.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Notification Alerts
                </h3>

                <div className="space-y-3 text-xs">
                  {[
                    { label: "Alert on incoming AI transaction extraction", default: true },
                    { label: "Remind 48h before upcoming video shoots", default: true },
                    { label: "Flag client invoices overdue by 5+ days", default: true },
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                      <input type="checkbox" defaultChecked={item.default} className="w-4 h-4 accent-zinc-900 rounded" />
                      <span className="text-slate-800 font-bold">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
