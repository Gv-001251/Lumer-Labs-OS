import { createClient } from "@/lib/supabase/client";
import { AIInboxItem } from "@/types";

export async function fetchAIInboxFromDb(): Promise<AIInboxItem[] | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ai_inbox")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      source: "WhatsApp",
      senderName: row.extracted_data?.clientName || "Contact",
      rawText: row.message_text,
      receivedAt: row.created_at,
      extractedData: {
        clientName: row.extracted_data?.clientName || "Client",
        matchedClientId: row.matched_client_id || undefined,
        amount: Number(row.extracted_data?.amount || 0),
        transactionType: row.extracted_data?.transactionType || "Income",
        category: row.extracted_data?.category || "Monthly Subscription",
        paymentMethod: row.extracted_data?.paymentMethod || "UPI",
        referenceNumber: row.extracted_data?.referenceNumber || "UPI/000000",
        date: row.extracted_data?.date || new Date().toISOString().split("T")[0],
        notes: row.extracted_data?.notes || "",
      },
      confidenceScore: Number(row.confidence || 92),
      isPotentialDuplicate: false,
      status: (row.processing_status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())) as any,
    }));
  } catch {
    return null;
  }
}
