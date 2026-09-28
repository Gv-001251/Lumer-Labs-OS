"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Calendar as CalendarIcon,
  ChevronDown,
  MoreVertical,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CircleAlert,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Banknote,
  CheckCircle2,
  Film,
  Building2,
  Download,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { useLumer } from "@/lib/context/LumerContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ActionModals } from "@/components/modals/ActionModals";
import { DateRangePeriod } from "@/types";

export default function DashboardPage() {
  const {
    totalRevenue,
    totalExpenses,
    netProfit,
    pendingClientPayments,
    activeClientsCount,
    clients,
    dateRange,
    setDateRange,
  } = useLumer();

  const [activeModal, setActiveModal] = useState<"client" | "income" | "expense" | "project" | null>(null);
  const [activeTab, setActiveTab] = useState<"Overview" | "Revenue" | "Expenses" | "Clients" | "Projects" | "Team" | "Social">("Overview");

  // Recharts Revenue Overview Bar Chart Data (Jan to Dec)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(8); // September selected by default

  const monthlyBarData = [
    { month: "Jan", val: 42, fullRevenue: 180000 },
    { month: "Feb", val: 36, fullRevenue: 195000 },
    { month: "Mar", val: 61, fullRevenue: 220000 },
    { month: "Apr", val: 84, fullRevenue: 250000 },
    { month: "May", val: 39, fullRevenue: 210000 },
    { month: "Jun", val: 63, fullRevenue: 275000 },
    { month: "Jul", val: 32, fullRevenue: 230000 },
    { month: "Aug", val: 42, fullRevenue: 260000 },
    { month: "Sep", val: 89, fullRevenue: totalRevenue || 245000 }, // Active highlight
    { month: "Oct", val: 61, fullRevenue: 280000 },
    { month: "Nov", val: 39, fullRevenue: 240000 },
    { month: "Dec", val: 75, fullRevenue: 310000 },
  ];

  // Demo Transactions for Recent Activity panel (Reference "Tickets Type" style)
  const recentDemoTransactions = [
    {
      id: "demo-tx-1",
      title: "Client Payment Received",
      subtitle: "GMK 3D Creations",
      amount: 15000,
      isIncome: true,
      category: "Retainer Income",
      bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: ArrowUpRight,
    },
    {
      id: "demo-tx-2",
      title: "Client Payment Received",
      subtitle: "Elite Squad Karate Academy",
      amount: 15000,
      isIncome: true,
      category: "Social Media",
      bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: ArrowUpRight,
    },
    {
      id: "demo-tx-3",
      title: "Editing Payment",
      subtitle: "External Editor",
      amount: 3000,
      isIncome: false,
      category: "Production Expense",
      bgColor: "bg-rose-50 text-rose-600 border-rose-100",
      icon: ArrowDownRight,
    },
    {
      id: "demo-tx-4",
      title: "Video Shoot Payment",
      subtitle: "GTK Karate Association",
      amount: 25000,
      isIncome: true,
      category: "Commercial Shoot",
      bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: ArrowUpRight,
    },
    {
      id: "demo-tx-5",
      title: "Instagram Boosting",
      subtitle: "Marketing Expense",
      amount: 17000,
      isIncome: false,
      category: "Ad Spend",
      bgColor: "bg-rose-50 text-rose-600 border-rose-100",
      icon: ArrowDownRight,
    },
  ];

  // Demo Table Data for "Recent Clients / Projects"
  const initialTableRows = [
    {
      id: "row-1",
      clientName: "GMK 3D Creations",
      contactPerson: "Ganesan Kumar",
      serviceType: "E-commerce Website",
      status: "Active",
      startDate: "15 Jan 2026",
      nextDueDate: "05 Sep 2026",
      amount: 85000,
    },
    {
      id: "row-2",
      clientName: "Elite Squad Karate Academy",
      contactPerson: "Sensei Vikram Sharma",
      serviceType: "Social Media Management",
      status: "Onboarding",
      startDate: "10 Feb 2026",
      nextDueDate: "02 Oct 2026",
      amount: 55000,
    },
    {
      id: "row-3",
      clientName: "Breeze Techniques",
      contactPerson: "Ananya Roy",
      serviceType: "Branding & Content",
      status: "Paused",
      startDate: "01 Mar 2026",
      nextDueDate: "01 Sep 2026",
      amount: 120000,
    },
    {
      id: "row-4",
      clientName: "RK Clinic",
      contactPerson: "Dr. Rajesh K",
      serviceType: "Management Software",
      status: "Onboarding",
      startDate: "20 Aug 2026",
      nextDueDate: "15 Sep 2026",
      amount: 45000,
    },
    {
      id: "row-5",
      clientName: "GTK Karate Association",
      contactPerson: "Master Thangavelu",
      serviceType: "Video Production",
      status: "Active",
      startDate: "05 Aug 2026",
      nextDueDate: "25 Sep 2026",
      amount: 65000,
    },
  ];

  // Table State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const periods: DateRangePeriod[] = ["This Month", "Last Month", "Q3 2026", "YTD 2026", "All Time"];

  // Filter Table Data
  const filteredRows = useMemo(() => {
    return initialTableRows.filter((row) => {
      const matchesSearch =
        row.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200/80";
      case "Onboarding":
        return "bg-amber-100 text-amber-700 border-amber-200/80";
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
      {/* 1. Dashboard Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">
            Welcome back, <span className="font-bold text-slate-800">NavaGeevithan</span> 👋
          </p>
        </div>

        {/* Right Date Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs transition-all"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isDatePickerOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Period
              </div>
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setDateRange(p);
                    setIsDatePickerOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between font-medium transition-colors ${
                    dateRange === p
                      ? "bg-slate-100 text-zinc-950 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{p}</span>
                  {dateRange === p && <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Reference-inspired compact pill bar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/60 pt-1">
        {(["Overview", "Revenue", "Expenses", "Clients", "Projects", "Team", "Social"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. Summary Metric Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalRevenue || 245000)}
            </div>
            <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> +16.4% from last month
            </div>
          </div>
          <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalExpenses || 118500)}
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Operations & gear payouts
            </div>
          </div>
          <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Net Profit */}
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Profit
            </span>
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(netProfit || 126500)}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                +14.2%
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Clear profit margin
            </div>
          </div>
          <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Active Clients */}
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Clients
            </span>
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              {activeClientsCount || 12}
            </div>
            <div className="text-[11px] font-medium text-blue-600">
              Active monthly retainers
            </div>
          </div>
          <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 5: Pending Payments */}
        <div className="p-4 lg:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs card-hover relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Payments
            </span>
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl lg:text-2xl font-black text-rose-600 tracking-tight">
              {formatCurrency(pendingClientPayments || 75000)}
            </div>
            <div className="text-[11px] font-medium text-rose-500">
              Awaiting client clearance
            </div>
          </div>
          <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Analytics Section (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Revenue Overview (Recharts Bar Chart) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Revenue Overview</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly income performance</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Highlighted Month:</span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold">
                {monthlyBarData[selectedMonthIndex].month} ({formatCurrency(monthlyBarData[selectedMonthIndex].fullRevenue)})
              </span>
            </div>
          </div>

          {/* Vertical Bar Chart matching Reference image style */}
          <div className="h-72 w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyBarData}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                onClick={(e) => {
                  if (e && e.activeTooltipIndex !== undefined) {
                    setSelectedMonthIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                  formatter={(val: number, name: string, item: any) => [
                    formatCurrency(item.payload.fullRevenue),
                    "Revenue",
                  ]}
                />
                <Bar dataKey="val" radius={[8, 8, 0, 0]} barSize={34}>
                  <LabelList
                    dataKey="val"
                    position="top"
                    style={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  />
                  {monthlyBarData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === selectedMonthIndex ? "#18181b" : "#f1f5f9"}
                      className="cursor-pointer transition-colors duration-200 hover:opacity-90"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Recent Transactions Panel (Reference "Tickets Type" style) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Recent Transactions</h3>
              <Link href="/finance" className="text-xs text-violet-600 font-bold hover:underline">
                View All →
              </Link>
            </div>
            <p className="text-xs text-slate-500 font-medium">Latest incoming & outgoing payments</p>
          </div>

          <div className="space-y-2.5 my-2">
            {recentDemoTransactions.map((tx) => {
              const IconComp = tx.icon;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/90 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border ${tx.bgColor}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {tx.title}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{tx.subtitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold ${
                        tx.isIncome ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {tx.isIncome ? "+" : "−"}
                      {formatCurrency(tx.amount)}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              Connected to Lumer OS Centralized Ledger
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Data Table Section ("Recent Clients / Projects") */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent Clients / Projects</h3>
            <p className="text-xs text-slate-500 font-medium">
              Client portfolios, onboarding status, and payment schedules
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-36 sm:w-48"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-7"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Paused">Paused</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Rows Per Page Indicator */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-xs">
              <span>{rowsPerPage} items</span>
            </div>

            {/* Add Client Action */}
            <button
              onClick={() => setActiveModal("client")}
              className="p-1.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs"
              title="Add Client"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service / Project</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Next Payment / Due Date</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div>
                        <span className="block text-slate-900 font-extrabold">{row.clientName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{row.contactPerson}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {row.serviceType}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{row.startDate}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{row.nextDueDate}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button className="text-slate-400 hover:text-slate-700 p-1">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No matching client records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls (Reference `< 01 / 08 >` style) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {filteredRows.length} results
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2">
              0{currentPage} / 0{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <ActionModals modalType={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}
