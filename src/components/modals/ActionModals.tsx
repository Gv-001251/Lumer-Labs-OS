"use client";

import React, { useState } from "react";
import { X, UserPlus, ArrowUpRight, ArrowDownRight, Video, CheckCircle2 } from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { IncomeCategory, ExpenseCategory, ClientStatus } from "@/types";

interface ActionModalsProps {
  modalType: "client" | "income" | "expense" | "project" | null;
  onClose: () => void;
}

export function ActionModals({ modalType, onClose }: ActionModalsProps) {
  const { clients, addClient, addTransaction, addProject } = useLumer();
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Client Form State
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyPackage, setMonthlyPackage] = useState(75000);
  const [accountStatus, setAccountStatus] = useState<ClientStatus>("Active");

  // Income / Expense Form State
  const [amount, setAmount] = useState(50000);
  const [incomeCat, setIncomeCat] = useState<IncomeCategory>("Monthly Subscription");
  const [expenseCat, setExpenseCat] = useState<ExpenseCategory>("Team Wages");
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [txDescription, setTxDescription] = useState("");

  // Project Form State
  const [projectTitle, setProjectTitle] = useState("");
  const [serviceType, setServiceType] = useState<any>("Video Shoot");
  const [budget, setBudget] = useState(100000);
  const [dueDate, setDueDate] = useState("2026-10-15");

  if (!modalType) return null;

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      name: clientName || "New Client",
      industry: industry || "Business Services",
      contactPerson: contactPerson || "Contact Person",
      email: email || "contact@client.com",
      phone: phone || "+91 98000 00000",
      services: ["Social Media", "Video Production"],
      monthlyPackage,
      amountDue: 0,
      lastPaymentDate: new Date().toISOString().split("T")[0],
      nextBillingDate: "2026-10-01",
      accountStatus,
    });
    setSuccessToast(`Client "${clientName || "New Client"}" successfully added!`);
    setTimeout(onClose, 1000);
  };

  const handleRecordIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId);
    addTransaction({
      type: "Income",
      amount,
      category: incomeCat,
      date: new Date().toISOString().split("T")[0],
      clientId: selectedClientId,
      clientName: client?.name || "Client",
      description: txDescription || `Income for ${incomeCat}`,
      paymentMethod: "UPI",
      status: "Completed",
      referenceNo: `UPI/${Math.floor(Math.random() * 9000000 + 1000000)}`,
    });
    setSuccessToast(`Income record of ₹${amount.toLocaleString()} created!`);
    setTimeout(onClose, 1000);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      type: "Expense",
      amount,
      category: expenseCat,
      date: new Date().toISOString().split("T")[0],
      description: txDescription || `Expense for ${expenseCat}`,
      paymentMethod: "Bank Transfer",
      status: "Completed",
      referenceNo: `TX/EXP/${Math.floor(Math.random() * 9000000 + 1000000)}`,
    });
    setSuccessToast(`Expense record of ₹${amount.toLocaleString()} logged!`);
    setTimeout(onClose, 1000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId);
    addProject({
      clientId: selectedClientId || clients[0]?.id || "cli-1",
      clientName: client?.name || clients[0]?.name || "Client",
      title: projectTitle || "New Video Shoot Project",
      serviceType,
      startDate: new Date().toISOString().split("T")[0],
      dueDate,
      budget,
      actualCost: Math.round(budget * 0.35),
      assignedTeamIds: ["tm-1", "tm-2"],
      status: "Planned",
      progress: 10,
    });
    setSuccessToast(`Project "${projectTitle || "New Project"}" created!`);
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successToast ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h3 className="text-lg font-extrabold text-slate-900">{successToast}</h3>
            <p className="text-xs text-slate-500 font-medium">Ledger & Overview metrics have been updated.</p>
          </div>
        ) : (
          <>
            {/* Modal Titles */}
            {modalType === "client" && (
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-50 text-violet-600 border border-purple-100">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Add New Client</h2>
                  <p className="text-xs text-slate-500 font-medium">Create a new client profile & billing retainer.</p>
                </div>
              </div>
            )}

            {modalType === "income" && (
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Record Income Transaction</h2>
                  <p className="text-xs text-slate-500 font-medium">Log incoming client retainer or project payment.</p>
                </div>
              </div>
            )}

            {modalType === "expense" && (
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Log Expense Transaction</h2>
                  <p className="text-xs text-slate-500 font-medium">Record equipment, travel, or external cost.</p>
                </div>
              </div>
            )}

            {modalType === "project" && (
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-50 text-violet-600 border border-purple-100">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Create New Project / Shoot</h2>
                  <p className="text-xs text-slate-500 font-medium">Add a video shoot or design project to the pipeline.</p>
                </div>
              </div>
            )}

            {/* Forms */}
            {modalType === "client" && (
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Tech Solutions"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
                    <input
                      type="text"
                      placeholder="e.g. Additive Manufacturing"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="client@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98000 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Package (₹)</label>
                    <input
                      type="number"
                      value={monthlyPackage}
                      onChange={(e) => setMonthlyPackage(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={accountStatus}
                      onChange={(e) => setAccountStatus(e.target.value as ClientStatus)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Lead">Lead</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs"
                  >
                    Save Client
                  </button>
                </div>
              </form>
            )}

            {modalType === "income" && (
              <form onSubmit={handleRecordIncome} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Client</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Income Category</label>
                    <select
                      value={incomeCat}
                      onChange={(e) => setIncomeCat(e.target.value as IncomeCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none"
                    >
                      <option value="Monthly Subscription">Monthly Subscription</option>
                      <option value="Website Development">Website Development</option>
                      <option value="Social Media Management">Social Media Management</option>
                      <option value="Video Shoot">Video Shoot</option>
                      <option value="Editing">Editing</option>
                      <option value="Other Income">Other Income</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. September monthly retainer invoice payment"
                    value={txDescription}
                    onChange={(e) => setTxDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                  >
                    Record Income
                  </button>
                </div>
              </form>
            )}

            {modalType === "expense" && (
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expense Category</label>
                    <select
                      value={expenseCat}
                      onChange={(e) => setExpenseCat(e.target.value as ExpenseCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none"
                    >
                      <option value="Team Wages">Team Wages</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Travel">Travel</option>
                      <option value="Advertising">Advertising</option>
                      <option value="Software">Software</option>
                      <option value="External Payments">External Payments</option>
                      <option value="Other Expenses">Other Expenses</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony FX6 lens rental for outdoor shoot"
                    value={txDescription}
                    onChange={(e) => setTxDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            )}

            {modalType === "project" && (
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brand Commercial Shoot Phase 2"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Client</label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Service Type</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none"
                    >
                      <option value="Video Shoot">Video Shoot</option>
                      <option value="Social Media Management">Social Media Management</option>
                      <option value="Website Development">Website Development</option>
                      <option value="Branding">Branding</option>
                      <option value="Editing">Editing</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Budget (₹)</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
