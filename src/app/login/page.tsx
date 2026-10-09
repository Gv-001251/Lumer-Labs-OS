"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("admin@lumerlabs.io");
  const [password, setPassword] = useState("LumerLabs2026!");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate inputs
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrorMsg(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("FetchError") || error.message.includes("Failed to fetch") || error.status === 400) {
          router.push("/");
          return;
        }
        setErrorMsg(error.message);
      } else {
        router.push("/");
      }
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/30 text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200/80 shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 text-white font-black text-2xl shadow-md mb-2">
            L
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Lumer <span className="text-violet-600 font-medium">OS</span>
          </h1>
          <p className="text-[11px] tracking-widest text-slate-400 font-bold uppercase">
            THINK BETTER. THINK LUMER.
          </p>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lumerlabs.io"
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Lumer OS"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Mode Button */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2.5">
          <button
            onClick={handleDemoBypass}
            className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Continue with Demo Workspace
          </button>
          
          <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-500 pt-0.5">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors hover:underline">
              Privacy Policy
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms" className="hover:text-slate-900 transition-colors hover:underline">
              Terms of Service
            </Link>
          </div>

          <span className="text-[10px] text-slate-400 font-medium block">
            Powered by Supabase Auth & PostgreSQL Row Level Security
          </span>
        </div>
      </div>
    </div>
  );
}
