import { parseIndianCurrency } from "./indianCurrency";

export type ParserIntent =
  | "NEW_CLIENT"
  | "CLIENT_UPDATE"
  | "PROJECT_CREATE"
  | "PROJECT_UPDATE"
  | "PAYMENT_RECEIVED"
  | "EXPENSE"
  | "TEAM_PAYMENT"
  | "EXTERNAL_PAYMENT"
  | "RECURRING_SERVICE"
  | "PAYMENT_CORRECTION"
  | "CLIENT_STATUS_UPDATE"
  | "GENERAL_QUERY"
  | "UNKNOWN";

export interface ExtractedBusinessData {
  intent: ParserIntent;
  clientCode?: string;
  clientName?: string;
  projectName?: string;
  projectValue?: number;
  monthlyAmount?: number;
  paymentAmount?: number;
  statedPendingAmount?: number;
  expenseAmount?: number;
  recipient?: string;
  status?: string;
  paymentDate?: string;
  description?: string;
  confidence: number; // 0.0 to 1.0
  notes?: string;
  rawJson?: Record<string, unknown>;
}

/**
 * Parses incoming natural-language or structured WhatsApp messages into business data.
 */
export function parseWhatsAppMessage(messageText: string): ExtractedBusinessData {
  if (!messageText || typeof messageText !== "string") {
    return {
      intent: "UNKNOWN",
      confidence: 0.0,
      notes: "Empty message text",
    };
  }

  const cleanedText = messageText.trim();

  // ----------------------------------------------------
  // 1. Check Multi-Line Key-Value Format
  // ----------------------------------------------------
  if (cleanedText.includes("\n") || (cleanedText.includes(" - ") && /monthly|paid|pending|web|project|client/i.test(cleanedText))) {
    const multiLineResult = parseStructuredLines(cleanedText);
    if (multiLineResult && multiLineResult.confidence >= 0.7) {
      return multiLineResult;
    }
  }

  // ----------------------------------------------------
  // 2. Check Single-Line Natural Language Statements
  // ----------------------------------------------------
  return parseNaturalLanguageStatement(cleanedText);
}

/**
 * Helper to parse structured key-value line messages (e.g., Client - LL-001 - Name)
 */
function parseStructuredLines(text: string): ExtractedBusinessData | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let clientCode: string | undefined;
  let clientName: string | undefined;
  let projectName: string | undefined;
  let projectValue: number | undefined;
  let monthlyAmount: number | undefined;
  let paymentAmount: number | undefined;
  let statedPendingAmount: number | undefined;
  let intent: ParserIntent = "NEW_CLIENT";

  for (const line of lines) {
    // Extract Client Code first via explicit regex match (prevents LL-001 being broken by dash splits)
    const codeMatch = line.match(/\b(LL-\d+|CLI-\d+)\b/i);
    if (codeMatch) {
      clientCode = codeMatch[1].toUpperCase();
    }

    // Client line: "Client - LL-001 - ELITE SQUAD KARATE ACADEMY" or "Client: LL-002 - Breeze Techniques"
    if (/^client/i.test(line)) {
      // Remove 'Client', remove code match if present, remaining text is business name
      let remaining = line.replace(/^client/i, "").trim();
      if (clientCode) {
        remaining = remaining.replace(new RegExp(clientCode, "gi"), "").trim();
      }
      remaining = remaining.replace(/^[\s\-:]+/, "").replace(/[\s\-:]+$/, "").trim();
      if (remaining.length > 0) {
        clientName = remaining;
      }
    }

    // Monthly Handling line: "Monthly Handling - 4,000/-"
    if (/monthly\s*(handling|retainer|package|recurring)/i.test(line)) {
      const valStr = line.split(/[-:]/).slice(1).join("-").trim();
      const num = parseIndianCurrency(valStr || line);
      if (num !== null) monthlyAmount = num;
    }

    // Paid / Initial Paid line: "Initial Amount Paid - 2,000/-" or "Paid - 1,10,000/-"
    if (/(initial\s*amount\s*)?paid|advance/i.test(line)) {
      const valStr = line.split(/[-:]/).slice(1).join("-").trim();
      const num = parseIndianCurrency(valStr || line);
      if (num !== null) paymentAmount = num;
    }

    // Pending line: "Pending - 2,000/-" or "Pending - 1,00,000"
    if (/pending|due|balance/i.test(line)) {
      const valStr = line.split(/[-:]/).slice(1).join("-").trim();
      const num = parseIndianCurrency(valStr || line);
      if (num !== null) statedPendingAmount = num;
    }

    // Project line: "Web Development - 2,00,000/-" or "Website - 50000"
    if (/(web|website|shoot|video|branding|app|editing|development|design)/i.test(line) && !/^client/i.test(line)) {
      const parts = line.split(/[-:]/).map((p) => p.trim());
      if (parts.length >= 2) {
        projectName = parts[0];
        const num = parseIndianCurrency(parts[1]);
        if (num !== null) projectValue = num;
      }
    }
  }

  if (clientName || clientCode) {
    if (projectValue !== undefined) {
      intent = "PROJECT_CREATE";
    } else if (monthlyAmount !== undefined || paymentAmount !== undefined) {
      intent = clientCode ? "NEW_CLIENT" : "NEW_CLIENT";
    }

    return {
      intent,
      clientCode,
      clientName,
      projectName,
      projectValue,
      monthlyAmount,
      paymentAmount,
      statedPendingAmount,
      confidence: clientName || clientCode ? 0.95 : 0.7,
      description: text,
      rawJson: {
        intent,
        client: { client_code: clientCode, name: clientName },
        project: projectName ? { name: projectName, project_value: projectValue } : undefined,
        recurring_service: monthlyAmount ? { monthly_amount: monthlyAmount } : undefined,
        payment: paymentAmount ? { amount: paymentAmount } : undefined,
        pending_amount: statedPendingAmount,
      },
    };
  }

  return null;
}

/**
 * Helper to parse natural language text strings
 */
function parseNaturalLanguageStatement(text: string): ExtractedBusinessData {
  const lower = text.toLowerCase();

  // 1. Status Update: "Client LL-003 closed" or "LL-001 paused"
  const statusMatch = text.match(/(?:client\s+)?\b(LL-\d+|CLI-\d+|[\w\s]+?)\s+(closed|active|paused|onboarding)\b/i);
  if (statusMatch && /closed|paused|active|onboarding/i.test(statusMatch[2])) {
    const rawTarget = statusMatch[1].trim();
    const isCode = /^(LL|CLI)-\d+$/i.test(rawTarget);
    return {
      intent: "CLIENT_STATUS_UPDATE",
      clientCode: isCode ? rawTarget.toUpperCase() : undefined,
      clientName: !isCode ? rawTarget : undefined,
      status: statusMatch[2].toLowerCase(),
      confidence: 0.9,
      description: text,
    };
  }

  // 2. Correction: "Correction: Breeze project is 250000"
  if (/correction/i.test(text)) {
    const amount = parseIndianCurrency(text);
    const clientMatch = text.match(/correction:\s*([\w\s]+?)\s+(project|payment|amount)/i);
    return {
      intent: "PAYMENT_CORRECTION",
      clientName: clientMatch ? clientMatch[1].trim() : undefined,
      projectValue: amount || undefined,
      confidence: amount ? 0.85 : 0.6,
      description: text,
      notes: "Correction statement",
    };
  }

  // 3. External / Team Payment: "Paid Athulya 1500 for shoot" or "Paid external editor 3000 for Breeze reel"
  if (/^paid\s+/i.test(text) && !/paid\s+another|paid\s+me|paid\s+advance/i.test(lower)) {
    const amount = parseIndianCurrency(text);
    if (amount) {
      if (/external\s+editor|external|freelancer/i.test(lower)) {
        const clientMatch = text.match(/for\s+([\w\s]+?)\s+(reel|shoot|video|project)/i);
        return {
          intent: "EXTERNAL_PAYMENT",
          recipient: "External Editor",
          expenseAmount: amount,
          clientName: clientMatch ? clientMatch[1].trim() : undefined,
          confidence: 0.9,
          description: text,
        };
      } else {
        // Team payment: "Paid Athulya 1500 for shoot"
        const nameMatch = text.match(/^paid\s+([A-Za-z]+)\s+([\d\.,k]+)/i);
        return {
          intent: "TEAM_PAYMENT",
          recipient: nameMatch ? nameMatch[1] : undefined,
          expenseAmount: amount,
          confidence: nameMatch ? 0.9 : 0.75,
          description: text,
        };
      }
    }
  }

  // 4. Recurring update: "Elite Squad monthly handling is now 5000"
  if (/monthly\s*(handling|package|retainer)\s*is\s*now/i.test(lower)) {
    const amount = parseIndianCurrency(text);
    const clientMatch = text.match(/^([\w\s]+?)\s+monthly/i);
    return {
      intent: "RECURRING_SERVICE",
      clientName: clientMatch ? clientMatch[1].trim() : undefined,
      monthlyAmount: amount || undefined,
      confidence: amount ? 0.9 : 0.6,
      description: text,
    };
  }

  // 5. General Expense: "Paid 1500 for petrol/equipment"
  if (/\b(expense|spent|bought|paid)\b/i.test(lower) && !/paid\s+\d+k?\s+today/i.test(lower)) {
    const amount = parseIndianCurrency(text);
    if (amount && /equipment|travel|petrol|software|rent|wages|ads/i.test(lower)) {
      return {
        intent: "EXPENSE",
        expenseAmount: amount,
        confidence: 0.85,
        description: text,
      };
    }
  }

  // 6. New Client Natural Language:
  // "Add new client XYZ Gym monthly handling 12000"
  // "New client ABC. Website 50000. Advance 20000"
  if (/new\ client|add\ client/i.test(lower)) {
    const nameMatch = text.match(/(new\s+client|add\s+client)\s+([A-Za-z0-9\s]+?)\s+(monthly|website|handling|package|\.|$)/i);
    const clientName = nameMatch ? nameMatch[2].trim() : undefined;
    const monthly = parseIndianCurrency(text.match(/monthly\s*(handling|package)?\s*([\d\.,k]+)/i)?.[2] || "");
    const budget = parseIndianCurrency(text.match(/(website|development|project|shoot)\s*([\d\.,k]+)/i)?.[2] || "");
    const advance = parseIndianCurrency(text.match(/(advance|paid|initial)\s*([\d\.,k]+)/i)?.[2] || "");

    return {
      intent: "NEW_CLIENT",
      clientName,
      monthlyAmount: monthly || undefined,
      projectValue: budget || undefined,
      paymentAmount: advance || undefined,
      confidence: clientName ? 0.9 : 0.65,
      description: text,
    };
  }

  // 7. Payment Received Natural Language:
  // "Breeze paid 25k today" or "Elite Squad Karate Academy paid another 2,000 today"
  const paymentMatch = text.match(/^([\w\s]+?)\s+paid\s+(another\s+)?([\d\.,k\/-]+)(\s+today)?/i);
  if (paymentMatch) {
    const rawClient = paymentMatch[1].trim();
    const amount = parseIndianCurrency(paymentMatch[3]);
    return {
      intent: "PAYMENT_RECEIVED",
      clientName: rawClient,
      paymentAmount: amount || undefined,
      paymentDate: paymentMatch[4] ? "today" : new Date().toISOString().split("T")[0],
      confidence: amount && rawClient ? 0.9 : 0.6,
      description: text,
    };
  }

  // Fallback check if any numeric amount and client name can be isolated
  const fallbackAmount = parseIndianCurrency(text);
  if (fallbackAmount) {
    return {
      intent: "PAYMENT_RECEIVED",
      paymentAmount: fallbackAmount,
      confidence: 0.5,
      notes: "Ambiguous transaction - requires clarification",
      description: text,
    };
  }

  return {
    intent: "UNKNOWN",
    confidence: 0.2,
    notes: "Could not classify message intent",
    description: text,
  };
}
