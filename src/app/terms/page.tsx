import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Lock,
  Building2,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  Scale,
  Cpu,
  HelpCircle,
  Mail,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Lumer OS | Lumer Labs",
  description:
    "Official Terms of Service for Lumer OS, an internal business operating system operated by Lumer Labs in India. Outlining internal use rules and service terms.",
};

export default function TermsOfServicePage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Internal Agreement</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              These Terms of Service govern access to and internal usage of <span className="text-white font-semibold">Lumer OS</span>, a proprietary internal operating platform maintained by <span className="text-white font-semibold">Lumer Labs</span>.
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
          These Terms of Service are framed for the internal operating framework of Lumer OS by Lumer Labs. This document must be formally reviewed and finalized by qualified legal counsel in India prior to official adoption.
        </p>
      </div>

      {/* Quick Navigation Pills */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Table of Contents
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "acceptance", label: "1. Acceptance & Internal Scope" },
            { id: "authorized-access", label: "2. Authorized Access" },
            { id: "acceptable-use", label: "3. Acceptable Use" },
            { id: "whatsapp-terms", label: "4. WhatsApp API Integration" },
            { id: "ai-disclaimer", label: "5. AI Verification Safeguards" },
            { id: "intellectual-property", label: "6. Proprietary Rights" },
            { id: "limitations", label: "7. Service Limitations" },
            { id: "liability", label: "8. Limitation of Liability" },
            { id: "governing-law", label: "9. Governing Law" },
            { id: "contact", label: "10. Contact Information" },
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
        <section id="acceptance" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              1. Acceptance & Internal Use Scope
            </h2>
          </div>
          <p>
            Welcome to <strong>Lumer OS</strong>. By accessing or utilizing this application, authorized users agree to be bound by these Terms of Service.
          </p>
          <p>
            Lumer OS is a <strong>proprietary internal business operating system</strong> owned and operated by <strong>Lumer Labs</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;). It is configured solely for internal CRM functions, financial ledger tracking, video shoot scheduling, and communication management. It is not offered as a commercial SaaS product or public service.
          </p>
        </section>

        {/* Section 2 */}
        <section id="authorized-access" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              2. Authorized Access & Account Security
            </h2>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600">
            <li><strong>Internal Provisioning Only:</strong> Access credentials are explicitly assigned to authorized Lumer Labs personnel (founders, employees, and approved team contractors).</li>
            <li><strong>No Public Registration:</strong> Self-registration, public user creation, or unapproved third-party account provisioning is strictly prohibited.</li>
            <li><strong>Credential Confidentiality:</strong> Authorized users must maintain the security of their login credentials and promptly report any unauthorized access or security anomaly to company administrators.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="acceptable-use" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              3. Acceptable Use & Conduct Restrictions
            </h2>
          </div>
          <p>Authorized users agree to use Lumer OS strictly for legitimate Lumer Labs business workflows. You agree NOT to:</p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Export, leak, or disclose confidential client details, financial ledgers, or payment records to unauthorized parties.</li>
              <li>Attempt to reverse-engineer, decompile, or breach security features, authentication tokens, or row-level policies.</li>
              <li>Use messaging channels or integrated APIs to transmit spam, unsolicited marketing messages, or unlawful material.</li>
              <li>Circumvent internal verification procedures in the AI Inbox for financial transactions.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section id="whatsapp-terms" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              4. Meta WhatsApp Cloud API Integration Terms
            </h2>
          </div>
          <p>
            Lumer OS integrates with Meta Platforms, Inc.’s <strong>WhatsApp Cloud API</strong> to send and receive operational business communications.
          </p>
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 space-y-2 text-slate-800">
            <h3 className="font-bold text-teal-950">Integration Standards & Compliance:</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>All WhatsApp communications must comply with Meta’s Business Terms, WhatsApp Commerce Policy, and Technical Guidelines.</li>
              <li>Messages received via WhatsApp are processed solely for business record-keeping, client relationship management, expense verification, and project coordination.</li>
              <li>Webhook endpoints are secured using verification tokens and HTTPS transport encryption.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section id="ai-disclaimer" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              5. AI Automation & Human Verification Disclaimer
            </h2>
          </div>
          <p>
            Lumer OS incorporates artificial intelligence tools to assist in parsing incoming WhatsApp messages and extracting draft transaction details (such as payment receipts or expense items).
          </p>
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-2 text-slate-800">
            <h3 className="font-bold text-violet-950">Human-in-the-Loop Safeguard:</h3>
            <p className="text-slate-700 text-xs leading-relaxed">
              AI parsing is strictly assistive. All extracted transactions and new client details generated by AI remain in draft status within the AI Inbox until an authorized user manually verifies and approves them. Lumer Labs accepts no liability for unverified draft data prior to human confirmation.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section id="intellectual-property" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              6. Intellectual Property & Proprietary Rights
            </h2>
          </div>
          <p>
            All rights, title, and interest in and to <strong>Lumer OS</strong> — including source code, UI designs, brand marks, logos, workflows, database schemas, and documentation — are and shall remain the exclusive intellectual property of <strong>Lumer Labs</strong>. Unauthorized copying, distribution, or external deployment is strictly prohibited.
          </p>
        </section>

        {/* Section 7 */}
        <section id="limitations" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              7. Service Availability & Disclaimer of Warranties
            </h2>
          </div>
          <p>
            Lumer OS is provided on an <strong>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis</strong> for internal operational management. Lumer Labs does not warrant that the system will be 100% uninterrupted, completely error-free, or exempt from temporary maintenance downtime.
          </p>
        </section>

        {/* Section 8 */}
        <section id="liability" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              8. Limitation of Liability
            </h2>
          </div>
          <p>
            To the maximum extent permitted under applicable law in India, Lumer Labs and its founder shall not be held liable for any indirect, incidental, special, consequential, or punitive damages resulting from system downtime, network connectivity failures with third-party APIs (such as Meta or Supabase), or data entry errors.
          </p>
        </section>

        {/* Section 9 */}
        <section id="governing-law" className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              9. Governing Law & Jurisdiction
            </h2>
          </div>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. Any legal action or proceeding arising under these Terms shall be instituted exclusively in courts of competent jurisdiction located in India.
          </p>
        </section>

        {/* Section 10 */}
        <section id="contact" className="p-6 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              10. Contact & Support Enquiries
            </h2>
          </div>
          <p className="text-slate-300">
            For questions or inquiries regarding these Terms of Service or system authorization, please reach out to:
          </p>

          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Official Contact Email:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                VERIFIED OFFICIAL CONTACT
              </span>
            </div>
            <a href="mailto:lumerlabs@gmail.com" className="text-base font-bold font-mono text-emerald-400 hover:underline block select-all">
              lumerlabs@gmail.com
            </a>
            <p className="text-[11px] text-slate-400">
              For questions or inquiries regarding these Terms of Service or system authorization, contact Lumer Labs at <code className="font-mono text-slate-300">lumerlabs@gmail.com</code>.
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
          href="/privacy"
          className="inline-flex items-center gap-1.5 font-bold text-violet-600 hover:text-violet-800 transition-colors"
        >
          <span>View Privacy Policy</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
