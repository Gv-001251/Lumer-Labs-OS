"use client";

import React, { useState } from "react";
import {
  Instagram,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Sparkles,
  FileSpreadsheet,
  X,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLumer } from "@/lib/context/LumerContext";

export default function SocialAnalyticsPage() {
  const { socialAccounts } = useLumer();
  const [selectedAccountId, setSelectedAccountId] = useState(socialAccounts[0]?.id || "");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const selectedAccount =
    socialAccounts.find((a) => a.id === selectedAccountId) || socialAccounts[0];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Client Social Media Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Instagram performance dashboard, reach metrics, top reels, and AI content insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Account Selector Dropdown */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3.5 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none shadow-xs cursor-pointer"
          >
            {socialAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.clientName} ({acc.handle})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Generate Client Report
          </button>
        </div>
      </div>

      {/* Account Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-50 via-slate-50 to-purple-50 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-md">
            <Instagram className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">{selectedAccount.handle}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
                {selectedAccount.clientName}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {selectedAccount.followers.toLocaleString()} Total Followers (+{selectedAccount.followerGrowth}% this month)
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-xs">
          Sample Demo Data Layer
        </span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Reach
          </span>
          <span className="text-lg font-black text-slate-900 block">
            {selectedAccount.reach.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">+22.8%</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Impressions
          </span>
          <span className="text-lg font-black text-slate-900 block">
            {selectedAccount.impressions.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">+18.5%</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Likes
          </span>
          <span className="text-lg font-black text-slate-900 block flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            {selectedAccount.likes.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Comments
          </span>
          <span className="text-lg font-black text-slate-900 block flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 text-sky-500" />
            {selectedAccount.comments.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Shares
          </span>
          <span className="text-lg font-black text-slate-900 block flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5 text-violet-500" />
            {selectedAccount.shares.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Saves
          </span>
          <span className="text-lg font-black text-slate-900 block flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            {selectedAccount.saves.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Engagement Rate
          </span>
          <span className="text-lg font-black text-pink-600 block">
            {selectedAccount.engagementRate}%
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Above industry avg</span>
        </div>
      </div>

      {/* Charts & AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Follower Growth Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Follower Growth Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly follower velocity & audience expansion</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedAccount.history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#followerGradient)"
                  name="Followers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Content Insights Panel */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-violet-600 border border-purple-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">AI Content Insights</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">Automated campaign intelligence for {selectedAccount.clientName}</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="font-bold text-violet-700 block">⚡ High Reel Virality</span>
              <p className="text-slate-600 leading-snug font-medium">
                4K macro video timelapses generate <strong>3.4x more saves</strong> than standard static posts.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="font-bold text-pink-700 block">📈 Peak Engagement Hours</span>
              <p className="text-slate-600 leading-snug font-medium">
                Posting reels between <strong>6:30 PM - 8:00 PM IST</strong> yields 41% higher initial reach.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium text-center">
            Updated based on September 2026 performance algorithms
          </div>
        </div>
      </div>

      {/* Top Performing Content Showcase */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900">Top-Performing Reels & Content</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedAccount.topPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4 items-start"
            >
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 leading-snug">{post.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold shrink-0">
                    {post.type}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200/60 font-medium">
                  <div>
                    <span className="block text-slate-400 text-[10px]">Views</span>
                    <strong className="text-slate-900">{post.views.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">Likes</span>
                    <strong className="text-rose-600">{post.likes.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">Saves</span>
                    <strong className="text-amber-600">{post.saves.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Report Modal Preview */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Social Performance Report</h3>
                <p className="text-xs text-slate-500 font-medium">Generated for {selectedAccount.clientName} ({selectedAccount.handle})</p>
              </div>
              <span className="text-xs text-violet-600 font-bold">September 2026</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-400 text-[10px] font-medium block">Followers</span>
                  <strong className="text-slate-900 text-sm">{selectedAccount.followers.toLocaleString()}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-400 text-[10px] font-medium block">Reach</span>
                  <strong className="text-slate-900 text-sm">{selectedAccount.reach.toLocaleString()}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-400 text-[10px] font-medium block">Engagement Rate</span>
                  <strong className="text-pink-600 text-sm">{selectedAccount.engagementRate}%</strong>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Executive Summary</span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  During September 2026, {selectedAccount.clientName} demonstrated a {selectedAccount.followerGrowth}% net increase in audience size, reaching over {selectedAccount.reach.toLocaleString()} unique Instagram accounts with top video reels.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Prepared by Lumer Labs OS</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => alert("Report downloaded as PDF placeholder!")}
                  className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
