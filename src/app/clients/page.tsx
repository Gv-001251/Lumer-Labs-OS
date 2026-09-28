"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  X,
  Instagram,
  CheckCircle2,
  Calendar,
  Wallet,
} from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { Client, ClientStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ActionModals } from "@/components/modals/ActionModals";

export default function ClientsPage() {
  const { clients, deleteClient, transactions, projects, socialAccounts } = useLumer();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "All">("All");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview" | "billing" | "projects" | "social">("overview");

  // Filtering logic
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || client.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200/80";
      case "Onboarding":
        return "bg-amber-100 text-amber-700 border-amber-200/80";
      case "Lead":
        return "bg-blue-100 text-blue-700 border-blue-200/80";
      case "Paused":
        return "bg-purple-100 text-purple-700 border-purple-200/80";
      case "Closed":
        return "bg-slate-100 text-slate-600 border-slate-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200/80";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Client Portfolios
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage Lumer Labs clients, recurring subscription packages & receivables.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {(["All", "Active", "Onboarding", "Lead", "Paused", "Closed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer shadow-xs card-hover space-y-4 relative group"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-violet-600 transition-colors">
                    {client.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">{client.industry}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                  client.accountStatus
                )}`}
              >
                {client.accountStatus}
              </span>
            </div>

            {/* Services tags */}
            <div className="flex flex-wrap gap-1.5">
              {client.services.map((svc) => (
                <span
                  key={svc}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60"
                >
                  {svc}
                </span>
              ))}
            </div>

            {/* Financial & Billing Stats */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Monthly Package</span>
                <span className="font-bold text-slate-900">{formatCurrency(client.monthlyPackage)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-medium block">Amount Due</span>
                <span
                  className={`font-bold ${client.amountDue > 0 ? "text-rose-600" : "text-emerald-600"}`}
                >
                  {client.amountDue > 0 ? formatCurrency(client.amountDue) : "Clear"}
                </span>
              </div>
            </div>

            {/* Bottom info bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
              <span>Contact: {client.contactPerson}</span>
              <span className="text-violet-600 font-bold group-hover:underline">View Details →</span>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="py-16 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200/80">
          <p className="text-sm font-medium">No clients match your filter criteria.</p>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                {selectedClient.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                  {selectedClient.name}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      selectedClient.accountStatus
                    )}`}
                  >
                    {selectedClient.accountStatus}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">{selectedClient.industry}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedClient.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedClient.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              {(["overview", "billing", "projects", "social"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                    detailTab === tab
                      ? "bg-zinc-900 text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {detailTab === "overview" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 font-medium block">Monthly Package</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatCurrency(selectedClient.monthlyPackage)}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 font-medium block">Amount Due</span>
                      <span
                        className={`text-base font-extrabold ${
                          selectedClient.amountDue > 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {selectedClient.amountDue > 0
                          ? formatCurrency(selectedClient.amountDue)
                          : "Clear"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 font-medium block">Last Payment</span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatDate(selectedClient.lastPaymentDate)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Notes & Activity Log</span>
                    <p className="text-slate-600 leading-relaxed font-medium">{selectedClient.notes || "No additional notes."}</p>
                  </div>
                </div>
              )}

              {detailTab === "billing" && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">Transaction History</span>
                  {transactions
                    .filter((t) => t.clientId === selectedClient.id)
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{tx.description}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{formatDate(tx.date)} — {tx.paymentMethod}</span>
                        </div>
                        <span className="font-extrabold text-emerald-600">+{formatCurrency(tx.amount)}</span>
                      </div>
                    ))}
                </div>
              )}

              {detailTab === "projects" && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">Active & Delivered Projects</span>
                  {projects
                    .filter((p) => p.clientId === selectedClient.id)
                    .map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{proj.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{proj.serviceType}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                          {proj.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {detailTab === "social" && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">Connected Social Media Accounts</span>
                  {socialAccounts
                    .filter((s) => s.clientId === selectedClient.id)
                    .map((soc) => (
                      <div
                        key={soc.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Instagram className="w-6 h-6 text-pink-500" />
                          <div>
                            <span className="font-bold text-slate-900 block">{soc.handle}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {soc.followers.toLocaleString()} Followers ({soc.followerGrowth}% growth)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-600 font-bold block">{soc.engagementRate}% Rate</span>
                          <span className="text-[10px] text-slate-400 font-medium">{soc.reach.toLocaleString()} Reach</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  deleteClient(selectedClient.id);
                  setSelectedClient(null);
                }}
                className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100"
              >
                Delete Client
              </button>
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Action Modal */}
      <ActionModals modalType={isAddModalOpen ? "client" : null} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
