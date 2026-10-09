import { createClient } from "@/lib/supabase/client";
import { parseWhatsAppMessage, ExtractedBusinessData } from "./aiParser";
import { matchClientInMemory, generateNextClientCode, MatchedClientResult } from "./clientMatcher";
import { validateFinancials, ValidationResult } from "./financialValidator";
import { processWhatsAppImageMessage } from "./visionParser";
import { logAuditTrail } from "./auditLogger";
import { getWhatsAppClient } from "./client";
import { formatIndianCurrency } from "./indianCurrency";
import { ExtractedWhatsAppMessage, WhatsAppMetaErrorDetails } from "./types";

export interface PipelineExecutionResult {
  success: boolean;
  isDuplicate: boolean;
  intent: string;
  processedAutomatically: boolean;
  requiresReview: boolean;
  clientId?: string;
  clientCode?: string;
  clientName?: string;
  transactionId?: string;
  aiInboxId?: string;
  whatsappResponseSent: boolean;
  whatsappMessageText?: string;
  whatsappSendError?: string;
  whatsappSendErrorDetails?: WhatsAppMetaErrorDetails;
  discrepancyFlag?: string;
  notes?: string;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && url.includes("supabase.co") && !url.includes("demo"));
}

/**
 * Main WhatsApp -> AI -> Database -> Lumer OS Automation Pipeline Orchestrator.
 */
export async function processWhatsAppMessagePipeline(
  incomingMsg: ExtractedWhatsAppMessage
): Promise<PipelineExecutionResult> {
  console.log(`[WhatsApp Pipeline] Starting processing for Message ID: ${incomingMsg.waMessageId}`);

  // ----------------------------------------------------
  // 1. Fetch Existing Clients from Database / Fallback
  // ----------------------------------------------------
  let existingClients: Array<{
    id: string;
    clientCode: string;
    businessName: string;
    status: string;
    monthlyHandling?: number;
    amountDue?: number;
    agreedPackage?: number;
  }> = [
    {
      id: "cli-001",
      clientCode: "LL-001",
      businessName: "Elite Squad Karate Academy",
      status: "active",
      monthlyHandling: 4000,
      amountDue: 2000,
    },
    {
      id: "cli-002",
      clientCode: "LL-002",
      businessName: "Breeze Techniques",
      status: "active",
      monthlyHandling: 10000,
      amountDue: 100000,
    },
  ];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("id, client_code, business_name, status, monthly_handling, amount_due");
      if (!error && data && data.length > 0) {
        existingClients = data.map((c) => ({
          id: c.id,
          clientCode: c.client_code,
          businessName: c.business_name,
          status: c.status,
          monthlyHandling: Number(c.monthly_handling || 0),
          amountDue: Number(c.amount_due || 0),
        }));
      }
    } catch (err) {
      console.warn("[WhatsApp Pipeline DB Fetch Warning]", err);
    }
  }

  // ----------------------------------------------------
  // 2. Parse Incoming Message (Text or Image)
  // ----------------------------------------------------
  let extracted: ExtractedBusinessData;

  if (incomingMsg.messageType === "image" && incomingMsg.mediaId) {
    const visionRes = await processWhatsAppImageMessage(incomingMsg.mediaId, incomingMsg.textBody);
    extracted = {
      intent: "PAYMENT_RECEIVED",
      clientName: visionRes.clientNameHint,
      paymentAmount: visionRes.amount,
      confidence: visionRes.confidence,
      description: visionRes.extractedText || "Image Receipt Payment",
      rawJson: {
        referenceNumber: visionRes.referenceNumber,
        paymentMethod: visionRes.paymentMethod,
        source: "WhatsApp Screenshot",
      },
    };
  } else {
    extracted = parseWhatsAppMessage(incomingMsg.textBody || "");
  }

  console.log(`[WhatsApp Pipeline Extracted] Intent: ${extracted.intent}, Confidence: ${extracted.confidence}`);

  // ----------------------------------------------------
  // 3. Match Client or Prepare New Code
  // ----------------------------------------------------
  let matchResult: MatchedClientResult = matchClientInMemory(
    extracted.clientCode,
    extracted.clientName,
    existingClients
  );

  let targetClient = matchResult.client;

  // ----------------------------------------------------
  // 4. Perform Financial Validation & Discrepancy Check
  // ----------------------------------------------------
  let financialCheck: ValidationResult = {
    isValid: true,
    hasDiscrepancy: false,
    calculatedPending: 0,
  };

  if (extracted.intent === "PAYMENT_RECEIVED" || extracted.intent === "PROJECT_CREATE") {
    const projectVal = extracted.projectValue || targetClient?.monthlyHandling || 0;
    const payment = extracted.paymentAmount || 0;
    const priorPaid = targetClient ? (projectVal > 0 ? Math.max(0, projectVal - (targetClient.amountDue || 0)) : 0) : 0;
    const totalPaidNow = priorPaid + payment;

    financialCheck = validateFinancials({
      totalExpectedAmount: projectVal || 200000, // example project fallback if applicable
      totalPaidSoFar: totalPaidNow,
      statedPendingAmount: extracted.statedPendingAmount,
    });
  }

  // ----------------------------------------------------
  // 5. Determine Processing Route (Auto vs AI Inbox)
  // ----------------------------------------------------
  const isHighConfidence = extracted.confidence >= 0.8;
  const requiresReview =
    !isHighConfidence ||
    matchResult.isAmbiguous ||
    financialCheck.hasDiscrepancy ||
    (extracted.intent === "PAYMENT_RECEIVED" && !matchResult.matched && !extracted.clientName);

  if (requiresReview) {
    // Save to AI Inbox for manual verification
    const aiInboxId = `ai-${Date.now()}`;
    const notes = financialCheck.hasDiscrepancy
      ? financialCheck.discrepancyMessage
      : matchResult.isAmbiguous
      ? "Ambiguous client match detected"
      : "Low confidence extraction - review required";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("ai_inbox").insert({
          message_text: incomingMsg.textBody || "WhatsApp Message",
          attachment_path: incomingMsg.mediaId || null,
          extracted_data: {
            clientName: extracted.clientName || targetClient?.businessName || "Unknown Client",
            matchedClientId: targetClient?.id,
            amount: extracted.paymentAmount || extracted.expenseAmount || 0,
            transactionType: extracted.intent === "EXPENSE" || extracted.intent === "TEAM_PAYMENT" ? "Expense" : "Income",
            category: extracted.intent === "EXPENSE" ? "Other Expenses" : "Monthly Subscription",
            paymentMethod: "UPI",
            date: new Date().toISOString().split("T")[0],
            notes,
          },
          processing_status: "needs_review",
          confidence: Math.round(extracted.confidence * 100),
          matched_client_id: targetClient?.id || null,
        });
      } catch (err) {
        console.warn("[WhatsApp Pipeline AI Inbox DB Save Warning]", err);
      }
    }

    // Optional WhatsApp Reply for Clarification
    let replyMsgText = `⚠️ I found a payment of ${formatIndianCurrency(
      extracted.paymentAmount || 0
    )} but couldn't confidently identify the client. Please specify the client.`;

    if (financialCheck.hasDiscrepancy) {
      replyMsgText = `⚠️ ${financialCheck.discrepancyMessage}. Pushed to Lumer OS AI Inbox for team review.`;
    }

    const replyResult = await sendWhatsAppReplyIfConfigured(incomingMsg.senderWaId, replyMsgText);

    return {
      success: true,
      isDuplicate: false,
      intent: extracted.intent,
      processedAutomatically: false,
      requiresReview: true,
      aiInboxId,
      discrepancyFlag: financialCheck.hasDiscrepancy ? financialCheck.discrepancyMessage : undefined,
      whatsappResponseSent: replyResult.sent,
      whatsappMessageText: replyMsgText,
      whatsappSendError: replyResult.error,
      whatsappSendErrorDetails: replyResult.errorDetails,
      notes,
    };
  }

  // ----------------------------------------------------
  // 6. Execute Automatic DB Modifications & Transactions
  // ----------------------------------------------------
  let createdOrUpdatedClientId = targetClient?.id;
  let finalClientCode = targetClient?.clientCode;
  let finalClientName = targetClient?.businessName || extracted.clientName;
  let transactionId: string | undefined;

  // Case A: NEW CLIENT
  if (extracted.intent === "NEW_CLIENT" || (!targetClient && (extracted.intent === "CLIENT_UPDATE" || extracted.intent === "PROJECT_CREATE"))) {
    finalClientCode = extracted.clientCode || (await generateNextClientCode(existingClients));
    finalClientName = extracted.clientName || "New Client";
    const monthlyPkg = extracted.monthlyAmount || 0;
    const initialPaid = extracted.paymentAmount || 0;
    const pendingDue = extracted.statedPendingAmount !== undefined ? extracted.statedPendingAmount : Math.max(0, monthlyPkg - initialPaid);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: newClientData } = await supabase
          .from("clients")
          .insert({
            client_code: finalClientCode,
            business_name: finalClientName,
            contact_person: finalClientName,
            email: `${finalClientCode.toLowerCase()}@client.lumer.os`,
            phone: incomingMsg.senderWaId,
            industry: "Agency Client",
            status: "active",
            monthly_handling: monthlyPkg,
            amount_due: pendingDue,
          })
          .select("id")
          .single();

        if (newClientData) {
          createdOrUpdatedClientId = newClientData.id;
        }
      } catch (err) {
        console.warn("[WhatsApp Pipeline DB Create Client Error]", err);
      }
    }

    if (!createdOrUpdatedClientId) {
      createdOrUpdatedClientId = `cli-${Date.now()}`;
    }

    // Log Audit Trail
    await logAuditTrail({
      action: "CREATE_CLIENT",
      entityType: "client",
      entityId: createdOrUpdatedClientId,
      newData: {
        clientCode: finalClientCode,
        businessName: finalClientName,
        monthlyHandling: monthlyPkg,
        amountDue: pendingDue,
      },
      source: "WhatsApp",
      whatsappMessageId: incomingMsg.waMessageId,
    });
  }

  // Case B: PROJECT CREATE / UPDATE
  if (extracted.intent === "PROJECT_CREATE" && createdOrUpdatedClientId) {
    const projBudget = extracted.projectValue || 200000;
    const projName = extracted.projectName || "Web Development";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("projects").insert({
          client_id: createdOrUpdatedClientId,
          title: projName,
          service_type: projName,
          budget: projBudget,
          status: "in_progress",
          due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        });
      } catch (err) {
        console.warn("[WhatsApp Pipeline DB Create Project Warning]", err);
      }
    }

    await logAuditTrail({
      action: "CREATE_PROJECT",
      entityType: "project",
      entityId: `proj-${Date.now()}`,
      newData: { clientId: createdOrUpdatedClientId, title: projName, budget: projBudget },
      source: "WhatsApp",
      whatsappMessageId: incomingMsg.waMessageId,
    });
  }

  // Case C: PAYMENT RECEIVED
  if ((extracted.intent === "PAYMENT_RECEIVED" || extracted.paymentAmount) && extracted.paymentAmount) {
    transactionId = `tx-${Date.now()}`;
    const amount = extracted.paymentAmount;
    const calculatedPending = Math.max(0, (targetClient?.amountDue || 0) - amount);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: txData } = await supabase
          .from("transactions")
          .insert({
            transaction_code: `TX-${Date.now().toString().slice(-6)}`,
            transaction_type: "income",
            category: "monthly_subscription",
            amount,
            transaction_date: extracted.paymentDate === "today" ? new Date().toISOString().split("T")[0] : extracted.paymentDate || new Date().toISOString().split("T")[0],
            description: `WhatsApp Payment from ${finalClientName}`,
            client_id: createdOrUpdatedClientId || null,
            payment_method: "UPI",
            status: "approved",
            source: "ai_inbox",
            whatsapp_message_id: incomingMsg.waMessageId,
          })
          .select("id")
          .single();

        if (txData) transactionId = txData.id;

        // Update Client Amount Due
        if (createdOrUpdatedClientId) {
          await supabase
            .from("clients")
            .update({ amount_due: calculatedPending, updated_at: new Date().toISOString() })
            .eq("id", createdOrUpdatedClientId);
        }
      } catch (err) {
        console.warn("[WhatsApp Pipeline DB Payment Insert Error]", err);
      }
    }

    await logAuditTrail({
      action: "CREATE_PAYMENT",
      entityType: "transaction",
      entityId: transactionId,
      newData: {
        amount,
        clientId: createdOrUpdatedClientId,
        clientName: finalClientName,
        remainingPending: calculatedPending,
      },
      source: "WhatsApp",
      whatsappMessageId: incomingMsg.waMessageId,
    });
  }

  // Case D: EXPENSE / TEAM PAYOUT / EXTERNAL PAYMENT
  if (
    (extracted.intent === "EXPENSE" || extracted.intent === "TEAM_PAYMENT" || extracted.intent === "EXTERNAL_PAYMENT") &&
    extracted.expenseAmount
  ) {
    transactionId = `tx-exp-${Date.now()}`;
    const expenseAmt = extracted.expenseAmount;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("transactions").insert({
          transaction_code: `TX-${Date.now().toString().slice(-6)}`,
          transaction_type: "expense",
          category: extracted.intent === "TEAM_PAYMENT" ? "team_wage" : "external_payment",
          amount: expenseAmt,
          transaction_date: new Date().toISOString().split("T")[0],
          description: extracted.description || `Expense payout to ${extracted.recipient || "External Vendor"}`,
          payment_method: "UPI",
          status: "approved",
          source: "ai_inbox",
          whatsapp_message_id: incomingMsg.waMessageId,
        });
      } catch (err) {
        console.warn("[WhatsApp Pipeline DB Expense Insert Error]", err);
      }
    }

    await logAuditTrail({
      action: "CREATE_EXPENSE",
      entityType: "transaction",
      entityId: transactionId,
      newData: { amount: expenseAmt, recipient: extracted.recipient, description: extracted.description },
      source: "WhatsApp",
      whatsappMessageId: incomingMsg.waMessageId,
    });
  }

  // ----------------------------------------------------
  // 7. Formulate Confirmation Reply Back via WhatsApp
  // ----------------------------------------------------
  let confirmationText = "";
  if (extracted.intent === "NEW_CLIENT") {
    confirmationText = `✅ Client created\n\n${finalClientCode} — ${finalClientName}\nMonthly handling: ${formatIndianCurrency(
      extracted.monthlyAmount || 0
    )}\nInitial payment: ${formatIndianCurrency(extracted.paymentAmount || 0)}\nPending: ${formatIndianCurrency(
      extracted.statedPendingAmount || 0
    )}`;
  } else if (extracted.intent === "PAYMENT_RECEIVED" || extracted.paymentAmount) {
    const updatedPending = Math.max(0, (targetClient?.amountDue || 0) - (extracted.paymentAmount || 0));
    confirmationText = `✅ Updated Lumer OS\n\nClient: ${finalClientCode || "CLI"} — ${finalClientName}\nPayment received: ${formatIndianCurrency(
      extracted.paymentAmount || 0
    )}\nTotal pending: ${formatIndianCurrency(updatedPending)}\n\nDashboard updated.`;
  } else {
    confirmationText = `✅ Updated Lumer OS\n\nRecorded ${extracted.intent} successfully.\nDashboard updated.`;
  }

  const replyResult = await sendWhatsAppReplyIfConfigured(incomingMsg.senderWaId, confirmationText);

  return {
    success: true,
    isDuplicate: false,
    intent: extracted.intent,
    processedAutomatically: true,
    requiresReview: false,
    clientId: createdOrUpdatedClientId,
    clientCode: finalClientCode,
    clientName: finalClientName,
    transactionId,
    whatsappResponseSent: replyResult.sent,
    whatsappMessageText: confirmationText,
    whatsappSendError: replyResult.error,
    whatsappSendErrorDetails: replyResult.errorDetails,
  };
}

/**
 * Detects sample, simulated, or known test sender IDs that should not receive outbound Meta API calls.
 */
export function isSampleOrSimulatedSenderId(waId: string): boolean {
  if (!waId) return true;
  const cleanId = waId.trim().replace(/[^a-zA-Z0-9]/g, "");

  const knownSampleIds = new Set([
    "16315551181",
    "1555019999",
    "15550123456",
    "919876543210",
    "0000000000",
    "1234567890",
  ]);

  if (knownSampleIds.has(cleanId)) return true;

  if (/^1?55501\d{4}$/.test(cleanId)) return true;

  const lower = waId.toLowerCase();
  if (
    lower.includes("test") ||
    lower.includes("sample") ||
    lower.includes("dummy") ||
    lower.includes("simulated")
  ) {
    return true;
  }

  return false;
}

/**
 * Verifies whether outbound WhatsApp replies are explicitly enabled in environment settings
 * and whether the recipient is eligible (i.e. not a test/sample sender ID).
 */
export function checkOutboundReplyEligibility(recipientWaId: string): {
  allowed: boolean;
  reason?: string;
} {
  const isEnabled = process.env.WHATSAPP_ENABLE_OUTBOUND_REPLIES === "true";
  if (!isEnabled) {
    return {
      allowed: false,
      reason: "Outbound replies disabled via environment setting WHATSAPP_ENABLE_OUTBOUND_REPLIES (must be 'true').",
    };
  }

  if (isSampleOrSimulatedSenderId(recipientWaId)) {
    return {
      allowed: false,
      reason: `Skipped sending outbound reply to sample/simulated sender ID (${recipientWaId}).`,
    };
  }

  return { allowed: true };
}

/**
 * Sends outbound confirmation or query reply via WhatsApp Cloud API if enabled and configured.
 */
export async function sendWhatsAppReplyIfConfigured(
  recipientWaId: string,
  textContent: string
): Promise<{
  sent: boolean;
  error?: string;
  errorDetails?: WhatsAppMetaErrorDetails;
}> {
  const eligibility = checkOutboundReplyEligibility(recipientWaId);
  if (!eligibility.allowed) {
    console.log(`[WhatsApp Reply Skipped] ${eligibility.reason}`);
    return {
      sent: false,
      error: eligibility.reason,
    };
  }

  try {
    const client = getWhatsAppClient();
    const configCheck = client.isConfigured();
    if (!configCheck.valid) {
      const missingMsg = `WhatsApp API client not configured. Missing: ${configCheck.missing.join(", ")}`;
      console.warn(`[WhatsApp Reply Skipped] ${missingMsg}`);
      return {
        sent: false,
        error: missingMsg,
      };
    }

    const res = await client.sendTextMessage({ to: recipientWaId, text: textContent });
    if (res.success) {
      console.log(`[WhatsApp Outbound Reply Sent] Message ID: ${res.waMessageId} to ${recipientWaId}`);
      return { sent: true };
    } else {
      console.warn(`[WhatsApp Outbound Reply Failed] Recipient: ${recipientWaId}, Error: ${res.error}`);
      return {
        sent: false,
        error: res.error,
        errorDetails: res.errorDetails,
      };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown outbound reply failure";
    console.warn("[WhatsApp Reply Outbound Failure]", errorMsg);
    return {
      sent: false,
      error: `Failed to send WhatsApp reply: ${errorMsg}`,
    };
  }
}
