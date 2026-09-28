"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Send,
  X,
  CheckCircle2,
} from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { TeamMember, WagePayment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TeamPage() {
  const { teamMembers, wagePayments, recordWagePayment } = useLumer();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form State for Record Payment Modal
  const [payoutMemberId, setPayoutMemberId] = useState(teamMembers[0]?.id || "");
  const [payoutAmount, setPayoutAmount] = useState(65000);
  const [payoutType, setPayoutType] = useState<WagePayment["type"]>("Monthly Salary");
  const [payoutPeriod, setPayoutPeriod] = useState("September 2026");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalMonthlyPayroll = teamMembers.reduce((sum, m) => sum + m.monthlySalary, 0);
  const paidWagesThisMonth = wagePayments
    .filter((w) => w.status === "Paid")
    .reduce((sum, w) => sum + w.amount, 0);
  const pendingWagesCount = wagePayments.filter((w) => w.status === "Pending").length;

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = teamMembers.find((m) => m.id === payoutMemberId);
    recordWagePayment({
      teamMemberId: payoutMemberId,
      teamMemberName: member?.name || "Team Member",
      amount: payoutAmount,
      period: payoutPeriod,
      type: payoutType,
      paymentDate: new Date().toISOString().split("T")[0],
      status: "Paid",
      notes: payoutNotes || `Wage payout for ${payoutType}`,
    });

    setToastMessage(`Wage payout of ₹${payoutAmount.toLocaleString()} logged & posted to Finance Ledger!`);
    setTimeout(() => {
      setToastMessage(null);
      setIsRecordModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Team & Wages Payroll
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage Lumer Labs crew, director payouts, video editor rates & freelancer wages.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" /> Record Wage Payment
        </button>
      </div>

      {/* Wage Payroll Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Base Monthly Payroll
          </span>
          <span className="text-2xl font-black text-slate-900 block">
            {formatCurrency(totalMonthlyPayroll)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">5 active staff + 1 contractor</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Paid Wages (This Month)
          </span>
          <span className="text-2xl font-black text-emerald-600 block">
            {formatCurrency(paidWagesThisMonth)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">Logged payouts in Finance ledger</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pending Scheduled Payouts
          </span>
          <span className="text-2xl font-black text-amber-600 block">
            {pendingWagesCount} Payments
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">Scheduled for month-end release</span>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer shadow-xs card-hover space-y-4 relative group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-violet-600 transition-colors">
                    {member.name}
                  </h3>
                  <span className="text-[11px] text-violet-600 font-bold">{member.role}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  member.status === "Active"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                }`}
              >
                {member.status}
              </span>
            </div>

            {/* Compensation Specs */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Monthly Salary</span>
                <span className="font-extrabold text-slate-900">
                  {member.monthlySalary > 0 ? formatCurrency(member.monthlySalary) : "Freelance"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Shoot / Edit Rate</span>
                <span className="font-bold text-slate-700">
                  {member.shootRate > 0 ? `₹${member.shootRate}/shoot` : `₹${member.editingRate}/proj`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
              <span>{member.activeProjectsCount} Active Projects</span>
              <span className="text-violet-600 font-bold group-hover:underline">View Payout History →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Wage Payout History Ledger */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900">Recent Wage Payout Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Team Member</th>
                <th className="py-3 px-4">Payout Type</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {wagePayments.map((wp) => (
                <tr key={wp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{formatDate(wp.paymentDate)}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">{wp.teamMemberName}</td>
                  <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{wp.type}</td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{wp.period}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        wp.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}
                    >
                      {wp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-rose-600 whitespace-nowrap">
                    -{formatCurrency(wp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {toastMessage ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-base font-extrabold text-slate-900">{toastMessage}</h3>
              </div>
            ) : (
              <form onSubmit={handleRecordSubmit} className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">Record Wage Payout</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Team Member</label>
                  <select
                    value={payoutMemberId}
                    onChange={(e) => setPayoutMemberId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payout Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payout Type</label>
                    <select
                      value={payoutType}
                      onChange={(e) => setPayoutType(e.target.value as WagePayment["type"])}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                    >
                      <option value="Monthly Salary">Monthly Salary</option>
                      <option value="Shoot Payout">Shoot Payout</option>
                      <option value="Editing Bonus">Editing Bonus</option>
                      <option value="Freelance Payment">Freelance Payment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Period</label>
                  <input
                    type="text"
                    value={payoutPeriod}
                    onChange={(e) => setPayoutPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs"
                  >
                    Save & Record Expense
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
