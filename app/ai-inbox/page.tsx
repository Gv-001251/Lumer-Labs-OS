"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  Upload,
  CheckCircle2,
  XCircle,
  Edit3,
  AlertTriangle,
  ShieldCheck,
  X,
  Send,
  RefreshCw,
  User,
  PhoneCall,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";
import { useLumer } from "@/lib/context/LumerContext";
import { AIInboxItem, TransactionType, IncomeCategory, ExpenseCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ConversationItem {
  id: string;
  waId: string;
  displayName: string;
  phoneNumberId: string;
  lastMessageAt: string;
  lastMessageText?: string;
}

interface MessageItem {
  id: string;
  waMessageId: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  messageType: string;
  textBody?: string;
  status: string;
  timestamp: string;
}

export default function AIInboxPage() {
  const [activeTab, setActiveTab] = useState<"whatsapp_chat" | "ai_receipts">("whatsapp_chat");
  const { aiInboxItems, approveAIInboxItem, rejectAIInboxItem, editAndApproveAIInboxItem } = useLumer();

  // AI Receipt Edit State
  const [selectedItemId, setSelectedItemId] = useState(aiInboxItems[0]?.id || "");
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AIInboxItem | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editType, setEditType] = useState<TransactionType>("Income");
  const [editCategory, setEditCategory] = useState<IncomeCategory | ExpenseCategory>("Monthly Subscription");
  const [editRefNo, setEditRefNo] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Live WhatsApp Chat State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConvs, setIsLoadingConvs] = useState(false);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    setIsLoadingConvs(true);
    try {
      const res = await fetch("/api/whatsapp/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations && data.conversations.length > 0 && !selectedConvId) {
          setSelectedConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load WhatsApp conversations:", err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (convId: string) => {
    if (!convId) return;
    setIsLoadingMsgs(true);
    try {
      const res = await fetch(`/api/whatsapp/messages?conversationId=${encodeURIComponent(convId)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoadingMsgs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    }
  }, [selectedConvId]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv || isSending) return;

    setIsSending(true);
    setSendError(null);

    try {
      const res = await fetch("/api/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: activeConv.waId,
          text: replyText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendError(data.error || "Failed to send WhatsApp message");
      } else {
        setReplyText("");
        // Reload messages & conversations
        await fetchMessages(activeConv.id);
        await fetchConversations();
      }
    } catch (err: any) {
      setSendError(err?.message || "Network error sending message");
    } finally {
      setIsSending(false);
    }
  };

  // AI Receipt Handlers
  const activeItem = aiInboxItems.find((i) => i.id === selectedItemId) || aiInboxItems[0];

  const handleOpenEdit = (item: AIInboxItem) => {
    setEditingItem(item);
    setEditClientName(item.extractedData.clientName);
    setEditAmount(item.extractedData.amount);
    setEditType(item.extractedData.transactionType);
    setEditCategory(item.extractedData.category);
    setEditRefNo(item.extractedData.referenceNumber || "");
    setEditNotes(item.extractedData.notes);
    setIsEditingModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    editAndApproveAIInboxItem(editingItem.id, {
      clientName: editClientName,
      amount: editAmount,
      transactionType: editType,
      category: editCategory,
      paymentMethod: "UPI",
      referenceNumber: editRefNo,
      date: new Date().toISOString().split("T")[0],
      notes: editNotes,
    });
    setIsEditingModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            WhatsApp Communications & AI Inbox
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage live Meta WhatsApp Cloud API conversations and review AI payment receipt extractions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab("whatsapp_chat")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === "whatsapp_chat"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Live Chat
          </button>
          <button
            onClick={() => setActiveTab("ai_receipts")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === "ai_receipts"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Receipt Ledger ({aiInboxItems.length})
          </button>
        </div>
      </div>

      {/* TAB 1: WhatsApp Live Direct Messaging Chat */}
      {activeTab === "whatsapp_chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[580px]">
          {/* Left Column: Conversation Sidebar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Active Conversations
                </span>
                <button
                  onClick={fetchConversations}
                  disabled={isLoadingConvs}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Refresh Conversations"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingConvs ? "animate-spin text-emerald-600" : ""}`} />
                </button>
              </div>

              {isLoadingConvs && conversations.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading conversations...</div>
              )}

              {!isLoadingConvs && conversations.length === 0 && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-extrabold text-slate-700">No Webhook Messages Received Yet</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-normal">
                    When customers message your Meta WhatsApp Business number, conversations will appear here automatically.
                  </p>
                </div>
              )}

              <div className="space-y-2 overflow-y-auto max-h-[460px]">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      selectedConvId === conv.id
                        ? "bg-emerald-50/60 border-emerald-300 shadow-xs"
                        : "bg-white border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xs">
                          {conv.displayName ? conv.displayName.charAt(0).toUpperCase() : "W"}
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 truncate">
                          {conv.displayName || conv.waId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {conv.lastMessageText && (
                      <p className="text-[11px] text-slate-600 line-clamp-1 font-medium pl-9">
                        {conv.lastMessageText}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 pl-9 font-mono">+{conv.waId}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 font-medium">
              Connected via Meta Cloud API v22.0
            </div>
          </div>

          {/* Right Column: Chat Timeline & Outbound Reply Box */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-between shadow-xs overflow-hidden">
            {activeConv ? (
              <>
                {/* Chat Top Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                      {activeConv.displayName ? activeConv.displayName.charAt(0).toUpperCase() : "W"}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{activeConv.displayName || activeConv.waId}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span>+{activeConv.waId}</span>
                        <span>•</span>
                        <span>Phone ID: {activeConv.phoneNumberId}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchMessages(activeConv.id)}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMsgs ? "animate-spin text-emerald-600" : ""}`} /> Refresh
                  </button>
                </div>

                {/* Messages Timeline */}
                <div className="p-5 overflow-y-auto space-y-3 flex-1 min-h-[360px] bg-slate-50/30">
                  {isLoadingMsgs && messages.length === 0 && (
                    <div className="text-center py-12 text-xs text-slate-400 font-medium">
                      Loading message history...
                    </div>
                  )}

                  {!isLoadingMsgs && messages.length === 0 && (
                    <div className="text-center py-12 text-xs text-slate-400 font-medium">
                      No messages in this conversation yet. Send a message below!
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isInbound = msg.direction === "inbound";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isInbound ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                            isInbound
                              ? "bg-white border border-slate-200/80 text-slate-900 shadow-xs"
                              : "bg-emerald-600 text-white shadow-xs"
                          }`}
                        >
                          <p className="font-medium whitespace-pre-wrap">{msg.textBody || `[${msg.messageType}]`}</p>
                          <div
                            className={`flex items-center justify-end gap-1.5 text-[9px] font-medium pt-0.5 ${
                              isInbound ? "text-slate-400" : "text-emerald-100"
                            }`}
                          >
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {!isInbound && (
                              <span>
                                {msg.status === "read" ? (
                                  <CheckCheck className="w-3 h-3 text-cyan-200 inline" />
                                ) : msg.status === "delivered" ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-200 inline" />
                                ) : (
                                  <Check className="w-3 h-3 text-emerald-200 inline" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Send Reply Error Alert */}
                {sendError && (
                  <div className="mx-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
                    <span>{sendError}</span>
                    <button onClick={() => setSendError(null)} className="text-rose-500 hover:text-rose-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Outbound Reply Box */}
                <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to +${activeConv.waId}...`}
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 font-medium my-auto">
                Select or receive a WhatsApp conversation to view chat thread.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI Payment Receipt Verification (Existing Ledger Parsing) */}
      {activeTab === "ai_receipts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Inbox Feed & Drag-and-Drop Uploader */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-dashed border-slate-300 hover:border-slate-400 transition-colors text-center space-y-2 cursor-pointer group shadow-xs">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Upload Payment Screenshot</span>
                  <span className="text-[10px] text-slate-500 font-medium">Drag WhatsApp receipt screenshot or click to browse</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Incoming Message Stream
                </span>

                <div className="space-y-2">
                  {aiInboxItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        selectedItemId === item.id
                          ? "bg-slate-50 border-slate-300 shadow-xs"
                          : "bg-white border-slate-200/80 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 truncate">{item.senderName}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            item.status === "Approved"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : item.status === "Rejected"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-purple-100 text-purple-700 border border-purple-200 animate-pulse"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        "{item.rawText}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                        <span>{item.source} • {item.receivedAt}</span>
                        <span className="text-violet-600 font-bold">{item.confidenceScore}% AI Confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Extracted Transaction Verification Panel */}
            {activeItem && (
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-purple-50 text-violet-600 border border-purple-100">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">AI Extraction Preview</h3>
                      <span className="text-xs text-slate-500 font-medium">
                        Received via {activeItem.source} on {activeItem.receivedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {activeItem.confidenceScore}% Confidence Score
                    </span>
                  </div>
                </div>

                {activeItem.isPotentialDuplicate && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs font-medium">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Potential Duplicate Warning:</strong> A transaction with similar reference ID exists in the ledger.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 block">Original Attachment / Message</span>
                    {activeItem.screenshotUrl ? (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        <img
                          src={activeItem.screenshotUrl}
                          alt="Receipt Screenshot"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
                        "{activeItem.rawText}"
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs">
                    <span className="font-bold text-slate-900 block pb-1 border-b border-slate-200/60">
                      Extracted Ledger Fields
                    </span>

                    <div className="space-y-2 font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Detected Client</span>
                        <strong className="text-slate-900">{activeItem.extractedData.clientName}</strong>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Extracted Amount</span>
                        <strong className="text-emerald-600 text-sm font-black">
                          {formatCurrency(activeItem.extractedData.amount)}
                        </strong>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Transaction Type</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                          {activeItem.extractedData.transactionType}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Category</span>
                        <span className="text-slate-800 font-bold">{activeItem.extractedData.category}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Reference No</span>
                        <span className="font-mono text-slate-700">{activeItem.extractedData.referenceNumber}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-slate-400 block mb-1">Extracted Notes</span>
                        <p className="text-slate-700 leading-snug">{activeItem.extractedData.notes}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => rejectAIInboxItem(activeItem.id)}
                    disabled={activeItem.status === "Rejected"}
                    className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject Message
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(activeItem)}
                      className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-violet-600" /> Edit Before Saving
                    </button>

                    <button
                      onClick={() => approveAIInboxItem(activeItem.id)}
                      disabled={activeItem.status === "Approved"}
                      className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {activeItem.status === "Approved" ? "Saved to Ledger" : "Approve & Save to Ledger"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal Before Saving */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setIsEditingModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900">Edit AI Extracted Fields</h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Client Name</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ref No</label>
                  <input
                    type="text"
                    value={editRefNo}
                    onChange={(e) => setEditRefNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-zinc-900 text-white font-bold shadow-xs"
                >
                  Save & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
