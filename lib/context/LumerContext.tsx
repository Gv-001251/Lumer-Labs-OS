"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Client,
  Project,
  Transaction,
  TeamMember,
  WagePayment,
  SocialAccount,
  AIInboxItem,
  AppNotification,
  DateRangePeriod,
  ProjectStatus,
} from "@/types";
import {
  initialClients,
  initialProjects,
  initialTransactions,
  initialTeamMembers,
  initialWagePayments,
  initialSocialAccounts,
  initialAIInboxItems,
  initialNotifications,
} from "@/lib/mockData";
import { fetchClientsFromDb, createClientInDb } from "@/lib/services/clients";
import { fetchTransactionsFromDb, createTransactionInDb } from "@/lib/services/finance";
import { fetchProjectsFromDb } from "@/lib/services/projects";
import { fetchAIInboxFromDb } from "@/lib/services/aiInbox";

interface LumerContextType {
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
  teamMembers: TeamMember[];
  wagePayments: WagePayment[];
  socialAccounts: SocialAccount[];
  aiInboxItems: AIInboxItem[];
  notifications: AppNotification[];
  dateRange: DateRangePeriod;
  setDateRange: (range: DateRangePeriod) => void;

  // Dynamic Calculated Financial Metrics
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  mrr: number;
  pendingClientPayments: number;
  activeClientsCount: number;
  onboardingClientsCount: number;
  closedClientsCount: number;

  // Helper functions
  addClient: (client: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProject: (project: Omit<Project, "id">) => void;
  updateProjectStatus: (id: string, status: ProjectStatus, progress?: number) => void;
  deleteProject: (id: string) => void;

  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;

  recordWagePayment: (payment: Omit<WagePayment, "id">) => void;

  approveAIInboxItem: (id: string) => void;
  rejectAIInboxItem: (id: string) => void;
  editAndApproveAIInboxItem: (id: string, updatedData: AIInboxItem["extractedData"]) => void;

  markNotificationRead: (id: string) => void;
}

const LumerContext = createContext<LumerContextType | undefined>(undefined);

export function LumerProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [wagePayments, setWagePayments] = useState<WagePayment[]>(initialWagePayments);
  const [socialAccounts] = useState<SocialAccount[]>(initialSocialAccounts);
  const [aiInboxItems, setAiInboxItems] = useState<AIInboxItem[]>(initialAIInboxItems);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [dateRange, setDateRange] = useState<DateRangePeriod>("This Month");

  // Attempt database synchronization on mount
  useEffect(() => {
    async function syncDatabase() {
      try {
        const dbClients = await fetchClientsFromDb();
        if (dbClients && dbClients.length > 0) setClients(dbClients);

        const dbTx = await fetchTransactionsFromDb();
        if (dbTx && dbTx.length > 0) setTransactions(dbTx);

        const dbProj = await fetchProjectsFromDb();
        if (dbProj && dbProj.length > 0) setProjects(dbProj);

        const dbAi = await fetchAIInboxFromDb();
        if (dbAi && dbAi.length > 0) setAiInboxItems(dbAi);
      } catch (err) {
        console.warn("Using local fallback seed dataset:", err);
      }
    }
    syncDatabase();
  }, []);

  // Filter transactions based on dateRange
  const filteredTransactions = useMemo(() => {
    if (dateRange === "All Time") return transactions;

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const month = txDate.getMonth(); // 0-indexed (8 = Sept)
      const year = txDate.getFullYear();

      if (dateRange === "This Month") {
        return month === 8 && year === 2026; // Sept 2026
      }
      if (dateRange === "Last Month") {
        return month === 7 && year === 2026; // Aug 2026
      }
      if (dateRange === "Q3 2026") {
        return month >= 6 && month <= 8 && year === 2026; // Jul-Sept 2026
      }
      if (dateRange === "YTD 2026") {
        return year === 2026;
      }
      return true;
    });
  }, [transactions, dateRange]);

  // Derived financial metrics calculated strictly from recognized transactions
  const totalRevenue = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "Income" && t.status === "Completed")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "Expense" && t.status === "Completed")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netProfit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

  const profitMargin = useMemo(() => {
    if (totalRevenue === 0) return 0;
    return Math.round((netProfit / totalRevenue) * 100);
  }, [netProfit, totalRevenue]);

  const mrr = useMemo(() => {
    return clients
      .filter((c) => c.accountStatus === "Active")
      .reduce((sum, c) => sum + c.monthlyPackage, 0);
  }, [clients]);

  const pendingClientPayments = useMemo(() => {
    return clients.reduce((sum, c) => sum + c.amountDue, 0);
  }, [clients]);

  const activeClientsCount = useMemo(
    () => clients.filter((c) => c.accountStatus === "Active").length,
    [clients]
  );
  const onboardingClientsCount = useMemo(
    () => clients.filter((c) => c.accountStatus === "Onboarding").length,
    [clients]
  );
  const closedClientsCount = useMemo(
    () => clients.filter((c) => c.accountStatus === "Closed").length,
    [clients]
  );

  // Actions
  const addClient = async (clientData: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setClients((prev) => [newClient, ...prev]);
    await createClientInDb(clientData);
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...clientData } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const addProject = (projectData: Omit<Project, "id">) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const updateProjectStatus = (id: string, status: ProjectStatus, progress?: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              progress: progress !== undefined ? progress : status === "Completed" ? 100 : p.progress,
            }
          : p
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const addTransaction = async (txData: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    await createTransactionInDb(txData);

    // If transaction is income for a client with amount due, update balance
    if (newTx.type === "Income" && newTx.clientId) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === newTx.clientId) {
            const updatedDue = Math.max(0, c.amountDue - newTx.amount);
            return {
              ...c,
              amountDue: updatedDue,
              lastPaymentDate: newTx.date,
            };
          }
          return c;
        })
      );
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const recordWagePayment = (paymentData: Omit<WagePayment, "id">) => {
    const newWage: WagePayment = {
      ...paymentData,
      id: `wp-${Date.now()}`,
    };
    setWagePayments((prev) => [newWage, ...prev]);

    // Automatically record corresponding expense transaction in ledger
    if (newWage.status === "Paid") {
      addTransaction({
        type: "Expense",
        amount: newWage.amount,
        category: "Team Wages",
        date: newWage.paymentDate,
        description: `Wage payout for ${newWage.teamMemberName} (${newWage.type})`,
        paymentMethod: "Bank Transfer",
        status: "Completed",
        referenceNo: `WP-${Date.now().toString().slice(-6)}`,
      });
    }
  };

  const approveAIInboxItem = (id: string) => {
    const item = aiInboxItems.find((i) => i.id === id);
    if (!item) return;

    // Create verified transaction in ledger
    addTransaction({
      type: item.extractedData.transactionType,
      amount: item.extractedData.amount,
      category: item.extractedData.category,
      date: item.extractedData.date,
      clientId: item.extractedData.matchedClientId,
      clientName: item.extractedData.clientName,
      description: item.extractedData.notes,
      paymentMethod: item.extractedData.paymentMethod,
      status: "Completed",
      referenceNo: item.extractedData.referenceNumber,
    });

    // Update AI inbox status
    setAiInboxItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Approved" } : i))
    );

    // Push notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "AI Transaction Approved",
        message: `₹${item.extractedData.amount.toLocaleString()} ${item.extractedData.transactionType} logged for ${item.extractedData.clientName}.`,
        timestamp: "Just now",
        type: "ai",
        read: false,
        link: "/finance",
      },
      ...prev,
    ]);
  };

  const rejectAIInboxItem = (id: string) => {
    setAiInboxItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Rejected" } : i))
    );
  };

  const editAndApproveAIInboxItem = (id: string, updatedData: AIInboxItem["extractedData"]) => {
    const item = aiInboxItems.find((i) => i.id === id);
    if (!item) return;

    // Create transaction with updated fields
    addTransaction({
      type: updatedData.transactionType,
      amount: updatedData.amount,
      category: updatedData.category,
      date: updatedData.date,
      clientId: updatedData.matchedClientId,
      clientName: updatedData.clientName,
      description: updatedData.notes,
      paymentMethod: updatedData.paymentMethod,
      status: "Completed",
      referenceNo: updatedData.referenceNumber,
    });

    setAiInboxItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, extractedData: updatedData, status: "Approved" } : i
      )
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <LumerContext.Provider
      value={{
        clients,
        projects,
        transactions: filteredTransactions,
        teamMembers,
        wagePayments,
        socialAccounts,
        aiInboxItems,
        notifications,
        dateRange,
        setDateRange,
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        mrr,
        pendingClientPayments,
        activeClientsCount,
        onboardingClientsCount,
        closedClientsCount,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProjectStatus,
        deleteProject,
        addTransaction,
        deleteTransaction,
        recordWagePayment,
        approveAIInboxItem,
        rejectAIInboxItem,
        editAndApproveAIInboxItem,
        markNotificationRead,
      }}
    >
      {children}
    </LumerContext.Provider>
  );
}

export function useLumer() {
  const context = useContext(LumerContext);
  if (!context) {
    throw new Error("useLumer must be used within a LumerProvider");
  }
  return context;
}
