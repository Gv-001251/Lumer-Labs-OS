import { NextResponse } from "next/server";
import { getWhatsAppConversations } from "@/lib/whatsapp/db";

/**
 * GET /api/whatsapp/conversations
 * Returns active WhatsApp conversations for Lumer OS Dashboard
 */
export async function GET() {
  try {
    const conversations = await getWhatsAppConversations();
    return NextResponse.json({ conversations }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API /api/whatsapp/conversations Error]", err);
    return NextResponse.json({ error: "Failed to fetch WhatsApp conversations" }, { status: 500 });
  }
}
