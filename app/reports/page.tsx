"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  DollarSign,
  Users,
  Video,
  BarChart3,
  CheckCircle2,
  X,
  Building2,
  FileText,
} from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { clients, totalRevenue, totalExpenses, netProfit, dateRange } = useLumer();
  const [selectedReport, setSelectedReport] = useState<string>("profit_loss");
  const [selectedClientId, setSelectedClientId] = useState<string>("All");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const reportTypes = [
    { id: "profit_loss", title: "Monthly Profit & Loss Statement", desc: "Full revenue, operating expenses, and net profit audit", icon: DollarSign },
    { id: "client_revenue", title: "Client Revenue Breakdown", desc: "Monthly retainers and project billings by client", icon: Building2 },
    { id: "client_profitability", title: "Client Profitability Audit", desc: "Margin breakdown per client contract", icon: FileText },
    { id: "team_wages", title: "Team Wage & Payroll Audit", desc: "Base salary payouts, shoot bonuses, and freelancer costs", icon: Users },
    { id: "shoot_cost", title: "Shoot & Production Cost Analysis", desc: "Equipment rental fees, travel, and location expenses", icon: Video },
    { id: "social_overview", title: "Social Media Performance Audit", desc: "Growth, reach, and engagement across managed accounts", icon: BarChart3 },
  ];

  const handleExport = (type: "PDF" | "CSV") => {
    setToastMessage(`Report exported successfully as ${type}!`);
    setTimeout(() => setToastMessage(null), 2500);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Business Reports & Financial Audits
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Generate and export financial statements, client profitability matrix & production reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("CSV")}
            className="px-3.5 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-400" /> Export CSV
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> Download PDF Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-4 h-4 text-violet-600" /> Client Filter:
          </span>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none cursor-pointer"
          >
            <option value="All">All Clients (Portfolio Wide)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500">
          Period Scope: <strong className="text-slate-900">{dateRange}</strong>
        </span>
      </div>

      {/* Report Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;

          return (
            <div
              key={rep.id}
              onClick={() => {
                setSelectedReport(rep.id);
                setIsPreviewOpen(true);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs card-hover space-y-3 ${
                isSelected
                  ? "bg-slate-900 text-white border-zinc-900 shadow-md"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    isSelected
                      ? "bg-zinc-800 text-white border-zinc-700"
                      : "bg-purple-50 text-violet-600 border-purple-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-extrabold leading-snug ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {rep.title}
                </h3>
              </div>
              <p className={`text-xs leading-relaxed font-medium ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                {rep.desc}
              </p>
              <div
                className={`pt-2 flex items-center justify-between text-[11px] font-bold border-t ${
                  isSelected ? "border-zinc-800 text-violet-300" : "border-slate-100 text-violet-600"
                }`}
              >
                <span>View Full Audit →</span>
                <span className={isSelected ? "text-slate-400 font-medium" : "text-slate-400 font-medium"}>
                  PDF / Print Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Report Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Document Header */}
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-violet-600 tracking-widest uppercase block">
                  LUMER LABS OS — FINANCIAL REPORT
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {reportTypes.find((r) => r.id === selectedReport)?.title}
                </h3>
              </div>
              <div className="text-right text-xs text-slate-500 font-medium">
                <span>Reporting Period: <strong className="text-slate-900">{dateRange}</strong></span>
                <span className="block text-[10px] text-slate-400">Generated on {new Date().toISOString().split("T")[0]}</span>
              </div>
            </div>

            {/* Audit Content View */}
            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-4 text-xs">
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-400 text-[10px] font-medium block">Gross Revenue</span>
                  <strong className="text-emerald-600 text-base font-black">{formatCurrency(totalRevenue)}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-400 text-[10px] font-medium block">Operating Expenses</span>
                  <strong className="text-rose-600 text-base font-black">{formatCurrency(totalExpenses)}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-400 text-[10px] font-medium block">Net Operating Profit</span>
                  <strong className="text-slate-900 text-base font-black">{formatCurrency(netProfit)}</strong>
                </div>
              </div>

              {/* Detail Table */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Audit Breakdown</span>
                <table className="w-full text-left text-xs text-slate-700 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Item / Client</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {clients.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">Monthly Package</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600">
                          {formatCurrency(c.monthlyPackage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Confidential — Lumer Labs Internal Audit</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleExport("PDF")}
                  className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
