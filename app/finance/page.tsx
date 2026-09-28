"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
} from "lucide-react";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useLumer } from "@/lib/context/LumerContext";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ActionModals } from "@/components/modals/ActionModals";

export default function FinancePage() {
  const {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    transactions,
    deleteTransaction,
    dateRange,
  } = useLumer();

  const [activeModal, setActiveModal] = useState<"income" | "expense" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Income" | "Expense">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Filtering
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.clientName && tx.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.referenceNo && tx.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "All" || tx.type === typeFilter;
    const matchesCat = categoryFilter === "All" || tx.category === categoryFilter;
    return matchesSearch && matchesType && matchesCat;
  });

  // Income Category Breakdown
  const incomeCategoryData = [
    { name: "Monthly Subscription", value: 140000, color: "#10b981" },
    { name: "Video Shoot", value: 150000, color: "#8b5cf6" },
    { name: "Social Media", value: 55000, color: "#3b82f6" },
    { name: "Website Dev", value: 120000, color: "#06b6d4" },
  ];

  // Expense Category Breakdown
  const expenseCategoryData = [
    { name: "Team Wages", value: 215000, color: "#ef4444" },
    { name: "Equipment", value: 24000, color: "#f59e0b" },
    { name: "Software", value: 14500, color: "#ec4899" },
    { name: "External", value: 18000, color: "#a855f7" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Financial Ledger & P&L
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time income, expenses, cash flow analysis, and transaction receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal("income")}
            className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" /> Record Income
          </button>
          <button
            onClick={() => setActiveModal("expense")}
            className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowDownRight className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Income ({dateRange})
          </span>
          <span className="text-2xl lg:text-3xl font-black text-emerald-600 block">
            +{formatCurrency(totalRevenue)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">From verified client retainers & shoots</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Operating Expenses
          </span>
          <span className="text-2xl lg:text-3xl font-black text-rose-600 block">
            -{formatCurrency(totalExpenses)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">Payroll, camera gear rentals & software</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Net Profit / Loss
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              {profitMargin}% margin
            </span>
          </div>
          <span
            className={`text-2xl lg:text-3xl font-black block ${
              netProfit >= 0 ? "text-slate-900" : "text-rose-600"
            }`}
          >
            {formatCurrency(netProfit)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">Net operating margin after expenses</span>
        </div>
      </div>

      {/* Category Breakdown Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Income Category Breakdown</span>
            <span className="text-emerald-600 font-black">{formatCurrency(totalRevenue)}</span>
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {incomeCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "10px",
                    fontSize: "11px",
                    color: "#fff",
                  }}
                  formatter={(val: number) => formatCurrency(val)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Expense Category Breakdown</span>
            <span className="text-rose-600 font-black">{formatCurrency(totalExpenses)}</span>
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "10px",
                    fontSize: "11px",
                    color: "#fff",
                  }}
                  formatter={(val: number) => formatCurrency(val)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description, ref #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {/* Type Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 text-xs">
              {(["All", "Income", "Expense"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3.5 py-1 rounded-full font-bold transition-all ${
                    typeFilter === t ? "bg-zinc-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-medium">{formatDate(tx.date)}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        tx.type === "Income"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-rose-100 text-rose-700 border-rose-200"
                      }`}
                    >
                      {tx.type === "Income" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{tx.category}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate font-medium">
                    {tx.clientName ? `${tx.clientName} — ${tx.description}` : tx.description}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">{tx.referenceNo || "—"}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{tx.paymentMethod}</td>
                  <td
                    className={`py-3.5 px-4 text-right font-extrabold whitespace-nowrap ${
                      tx.type === "Income" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {tx.type === "Income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl border ${
                  selectedTx.type === "Income"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-rose-50 text-rose-600 border-rose-200"
                }`}
              >
                {selectedTx.type === "Income" ? (
                  <ArrowUpRight className="w-6 h-6" />
                ) : (
                  <ArrowDownRight className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Transaction Detail</h3>
                <span className="text-xs text-slate-500 font-medium">{selectedTx.category}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Amount</span>
                <span className="font-extrabold text-slate-900 text-base">{formatCurrency(selectedTx.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Date</span>
                <span className="text-slate-800 font-bold">{formatDate(selectedTx.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Payment Method</span>
                <span className="text-slate-800 font-bold">{selectedTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Reference No</span>
                <span className="text-slate-700 font-mono text-[11px]">{selectedTx.referenceNo || "N/A"}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-medium block mb-1">Description</span>
                <p className="text-slate-700 leading-relaxed font-medium">{selectedTx.description}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  deleteTransaction(selectedTx.id);
                  setSelectedTx(null);
                }}
                className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100"
              >
                Delete Record
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income / Expense Modals */}
      <ActionModals modalType={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}
