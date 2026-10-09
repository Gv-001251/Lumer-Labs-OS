import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  MessageSquare,
  Building2,
  FileText,
  AlertTriangle,
  Server,
  UserCheck,
  Clock,
  Eye,
  Trash2,
  Mail,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Lumer OS | Lumer Labs",
  description:
    "Official Privacy Policy for Lumer OS, an internal business operating system operated by Lumer Labs in India. Explaining Meta WhatsApp Cloud API integration and business data processing.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Official Governance Document</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              This document outlines how <span className="text-white font-semibold">Lumer Labs</span> processes business data and messaging information within <span className="text-white font-semibold">Lumer OS</span>, including our Meta WhatsApp Cloud API integration.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 border-t border-slate-800">
            <span><strong className="text-slate-200">Product:</strong> Lumer OS</span>
            <span>•</span>
            <span><strong className="text-slate-200">Company:</strong> Lumer Labs (India)</span>
            <span>•</span>
            <span><strong className="text-slate-200">Effective Date:</strong> October 9, 2026</span>
          </div>
        </div>
      </div>

      {/* Mandatory Legal Review Banner */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Notice: Document Pending Formal Legal Review</span>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
          This Privacy Policy has been prepared specifically for the internal operating environment of Lumer OS by Lumer Labs. It must be formally reviewed and ratified by qualified legal counsel in India prior to official adoption.
        </p>
      </div>

      {/* Quick Navigation Pills */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Table of Contents
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "scope", label: "1. Scope & System Purpose" },
            { id: "collection", label: "2. Data We Process" },
            { id: "whatsapp", label: "3. WhatsApp Cloud API" },
            { id: "access", label: "4. Access Restrictions" },
            { id: "third-parties", label: "5. Third-Party Services" },
            { id: "security", label: "6. Security & AI Safeguards" },
            { id: "retention", label: "7. Retention Policy" },
            { id: "rights", label: "8. Data Subject Rights" },
            { id: "governing-law", label: "9. Jurisdiction & Law" },
            { id: "contact", label: "10. Contact & Requests" },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Policy Sections */}
      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section id="scope" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              1. Scope & System Purpose
            </h2>
          </div>
          <p>
            <strong>Lumer OS</strong> is an internal, proprietary Customer Relationship Management (CRM) and business operating system operated by <strong>Lumer Labs</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). It is designed exclusively for authorized internal use by the founder and designated team members of Lumer Labs.
          </p>
          <p>
            Lumer OS is <strong>not a public SaaS application or consumer service</strong>. Public user creation or self-registration is disabled. The system is maintained to aggregate client contacts, project schedules (such as video production shoots), financial ledgers (income and expenses), team wage payouts, and business communication received through integrated messaging channels.
          </p>
        </section>

        {/* Section 2 */}
        <section id="collection" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              2. Data We Process
            </h2>
          </div>
          <p>
            In operating Lumer OS for internal business workflow management, authorized users process the following categories of information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-600" /> WhatsApp Communication Data
              </h3>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Sender WhatsApp ID (<code className="font-mono text-[11px] bg-slate-200 px-1 rounded">wa_id</code>) & phone number</li>
                <li>WhatsApp profile name and display metadata</li>
                <li>Inbound and outbound message text bodies</li>
                <li>Attached transaction receipts, media, images, and documents</li>
                <li>Message timestamps and delivery status flags</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> Operational Business Records
              </h3>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Client contact profiles, company names, and billing details</li>
                <li>Payment ledger entries, transaction IDs, and currency amounts</li>
                <li>Business expense itemization and vendor records</li>
                <li>Video shoot schedules, project timelines, and deliverable status</li>
                <li>Internal team wage payouts and allocation notes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="whatsapp" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              3. WhatsApp Cloud API Processing & Purpose
            </h2>
          </div>
          <p>
            Lumer OS integrates with the official <strong>Meta WhatsApp Cloud API</strong>. This integration enables Lumer Labs to receive business messaging, communicate with prospective or active clients, and log operational business details automatically.
          </p>
          <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 space-y-2 text-slate-800">
            <h3 className="font-bold text-violet-950">Purposes of WhatsApp Data Processing:</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
              <li><strong>Client Communication:</strong> Receiving client inquiries, video production briefs, project updates, and payment notifications.</li>
              <li><strong>AI Inbox Parsing:</strong> Converting incoming business communications and media attachments into draft CRM records (such as new client profiles, expense logs, or payment entries).</li>
              <li><strong>Record Management:</strong> Maintaining accurate, audit-ready operational and financial ledgers for Lumer Labs.</li>
            </ol>
          </div>
          <p className="text-slate-600">
            <strong>No Data Monetization:</strong> Personal data or WhatsApp message contents are never sold, rented, leased, or disclosed to third parties for commercial advertising or marketing purposes.
          </p>
        </section>

        {/* Section 4 */}
        <section id="access" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              4. Access Restrictions & Authorization
            </h2>
          </div>
          <p>
            Lumer OS strictly enforces access control measures to prevent unauthorized disclosure of business records:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600">
            <li><strong>Internal Use Only:</strong> Access is limited to authenticated Lumer Labs founders, employees, and authorized contractors.</li>
            <li><strong>No Public Registration:</strong> The system does not offer public account creation or self-service sign-ups.</li>
            <li><strong>Authenticated Sessions:</strong> Protected CRM dashboard routes require authenticated sessions verified through secure token management.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="third-parties" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              5. Third-Party Service Infrastructure
            </h2>
          </div>
          <p>
            To deliver CRM functionality, secure data hosting, and messaging capabilities, Lumer OS relies on trusted third-party infrastructure providers:
          </p>
          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shrink-0">Meta</div>
              <div>
                <h4 className="font-bold text-slate-900">Meta Platforms, Inc. (WhatsApp Cloud API)</h4>
                <p className="text-slate-600 text-xs">Transmits and receives WhatsApp messages. Subject to Meta’s Business Terms and WhatsApp Privacy Policy.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shrink-0">Supabase</div>
              <div>
                <h4 className="font-bold text-slate-900">Supabase, Inc.</h4>
                <p className="text-slate-600 text-xs">Provides PostgreSQL database storage, row-level security (RLS) policies, and user authentication management.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shrink-0">Vercel</div>
              <div>
                <h4 className="font-bold text-slate-900">Vercel, Inc.</h4>
                <p className="text-slate-600 text-xs">Provides cloud web hosting, domain routing, and serverless application execution.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="security" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              6. Security Controls & AI Verification Safeguards
            </h2>
          </div>
          <p>
            We implement administrative and technical controls to safeguard data processed within Lumer OS:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600">
            <li><strong>Transport Security:</strong> Data in transit between clients, Vercel edge servers, and third-party APIs is encrypted using standard HTTPS/TLS protocols.</li>
            <li><strong>Token & Credential Isolation:</strong> API access tokens, webhook verify tokens, and database secrets are stored in secure environment variables and never exposed to the client.</li>
            <li><strong>Strict Human-in-the-Loop Safeguard:</strong> Extracted financial items or client records generated by AI message parsing in the AI Inbox are held in draft state and require explicit human review and approval by an authorized user before updating primary CRM databases.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section id="retention" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              7. Data Retention Policy
            </h2>
          </div>
          <p>
            Business data and messaging logs are retained strictly in accordance with active business requirements, client engagement durations, and statutory accounting or record-keeping obligations under applicable Indian laws.
          </p>
          <p>
            Data that is no longer required for legitimate operational, client service, or legal purposes is sanitized or purged from active CRM stores.
          </p>
        </section>

        {/* Section 8 */}
        <section id="rights" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              8. Data Subject Rights & Request Procedure
            </h2>
          </div>
          <p>
            In alignment with Indian data protection regulations (including the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Information Technology Act, 2000</strong>), individuals whose personal data or messaging details have been received by Lumer Labs hold the following rights:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-violet-600" /> Right to Access
              </div>
              <p className="text-slate-600 text-xs">Request confirmation of personal data processing and copy of recorded details.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Right to Rectification
              </div>
              <p className="text-slate-600 text-xs">Request correction or updating of inaccurate or incomplete information.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Right to Erasure
              </div>
              <p className="text-slate-600 text-xs">Request deletion of personal data where statutory retention grounds do not apply.</p>
            </div>
          </div>
        </section>

        {/* Section 9 */}
        <section id="governing-law" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              9. Governing Law & Jurisdiction
            </h2>
          </div>
          <p>
            This Privacy Policy and any data processing activities conducted thereunder shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. Any claims or legal proceedings regarding data privacy shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>

        {/* Section 10 */}
        <section id="contact" className="p-6 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              10. Privacy Contact & Data Requests
            </h2>
          </div>
          <p className="text-slate-300">
            If you have questions regarding this Privacy Policy, wish to exercise your data subject rights, or submit a data deletion request, please submit your request to our designated privacy contact:
          </p>

          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Privacy Contact Email:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                VERIFIED OFFICIAL CONTACT
              </span>
            </div>
            <a href="mailto:lumerlabs@gmail.com" className="text-base font-bold font-mono text-emerald-400 hover:underline block select-all">
              lumerlabs@gmail.com
            </a>
            <p className="text-[11px] text-slate-400">
              For privacy inquiries, data subject access requests, or deletion requests, contact Lumer Labs at <code className="font-mono text-slate-300">lumerlabs@gmail.com</code>.
            </p>
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Company: Lumer Labs</span>
            <span>Application: Lumer OS</span>
          </div>
        </section>
      </div>

      {/* Bottom Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-violet-600" />
          <span>Return to Lumer OS Workspace</span>
        </Link>
        <Link
          href="/terms"
          className="inline-flex items-center gap-1.5 font-bold text-violet-600 hover:text-violet-800 transition-colors"
        >
          <span>View Terms of Service</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
