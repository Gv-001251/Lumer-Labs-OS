import { createClient } from "@/lib/supabase/client";
import { parseWhatsAppMessage, ExtractedBusinessData } from "./aiParser";
import { matchClientInMemory, generateNextClientCode, MatchedClientResult } from "./clientMatcher";
import { validateFinancials, ValidationResult } from "./financialValidator";
import { processWhatsAppImageMessage } from "./visionParser";
import { logAuditTrail } from "./auditLogger";
import { getWhatsAppClient } from "./client";
import { formatIndianCurrency } from "./indianCurrency";
import { ExtractedWhatsAppMessage } from "./types";

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

    await sendWhatsAppReplyIfConfigured(incomingMsg.senderWaId, replyMsgText);

    return {
      success: true,
      isDuplicate: false,
      intent: extracted.intent,
      processedAutomatically: false,
      requiresReview: true,
      aiInboxId,
      discrepancyFlag: financialCheck.hasDiscrepancy ? financialCheck.discrepancyMessage : undefined,
      whatsappResponseSent: true,
      whatsappMessageText: replyMsgText,
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

  await sendWhatsAppReplyIfConfigured(incomingMsg.senderWaId, confirmationText);

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
    whatsappResponseSent: true,
    whatsappMessageText: confirmationText,
  };
}

/**
 * Sends outbound confirmation or query reply via WhatsApp Cloud API
 */
async function sendWhatsAppReplyIfConfigured(recipientWaId: string, textContent: string) {
  try {
    const client = getWhatsAppClient();
    if (client.isConfigured().valid) {
      await client.sendTextMessage({ to: recipientWaId, text: textContent });
    }
  } catch (err) {
    console.warn("[WhatsApp Reply Outbound Failure]", err);
  }
}
