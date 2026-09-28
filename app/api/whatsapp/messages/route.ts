import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppMessagesForConversation, saveOutboundWhatsAppMessage } from "@/lib/whatsapp/db";
import { getWhatsAppClient } from "@/lib/whatsapp/client";

/**
 * GET /api/whatsapp/messages?conversationId=...
 * Returns message history for a conversation thread
 */
export async function GET(request: NextRequest) {
  try {
    const conversationId = request.nextUrl.searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ error: "Missing required conversationId parameter" }, { status: 400 });
    }

    const messages = await getWhatsAppMessagesForConversation(conversationId);
    return NextResponse.json({ messages }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API /api/whatsapp/messages GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch conversation messages" }, { status: 500 });
  }
}

/**
 * POST /api/whatsapp/messages
 * Sends an outbound WhatsApp text message via Meta Cloud API service
 * Request Body: { to: string, text: string, conversationId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, text } = body;

    if (!to || !text) {
      return NextResponse.json(
        { error: "Recipient phone number (to) and message text content are required." },
        { status: 400 }
      );
    }

    const client = getWhatsAppClient();
    const sendResult = await client.sendTextMessage({ to, text });

    if (!sendResult.success) {
      return NextResponse.json(
        {
          error: sendResult.error,
          errorCategory: sendResult.errorCategory,
        },
        { status: 400 }
      );
    }

    const waMessageId = sendResult.waMessageId || `wamid.out.${Date.now()}`;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "default_phone_id";

    // Store outbound message in database / state
    const saved = await saveOutboundWhatsAppMessage({
      waMessageId,
      recipientWaId: to.replace(/[^0-9]/g, ""),
      phoneNumberId,
      textBody: text,
    });

    return NextResponse.json(
      {
        success: true,
        waMessageId,
        conversationId: saved.conversationId,
        messageId: saved.messageId,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[API /api/whatsapp/messages POST Exception]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
