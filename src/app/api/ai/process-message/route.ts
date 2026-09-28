import { NextRequest, NextResponse } from "next/server";
import { processWhatsAppMessagePipeline } from "@/lib/whatsapp/pipeline";

/**
 * POST /api/ai/process-message
 * Manually triggers the WhatsApp -> AI -> Database -> Lumer OS automation pipeline
 * Request Body: { text: string, senderWaId?: string, waMessageId?: string, mediaId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, senderWaId, waMessageId, mediaId } = body;

    if (!text && !mediaId) {
      return NextResponse.json(
        { error: "Either message text or mediaId is required" },
        { status: 400 }
      );
    }

    const testMsg = {
      waMessageId: waMessageId || `wamid.test.${Date.now()}`,
      senderWaId: senderWaId || "919876543210",
      senderDisplayName: "Test Client",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "phone_id_test",
      messageType: mediaId ? ("image" as const) : ("text" as const),
      textBody: text || "",
      mediaId,
      timestamp: new Date().toISOString(),
      rawMetadata: {},
    };

    const pipelineResult = await processWhatsAppMessagePipeline(testMsg);

    return NextResponse.json({ success: true, result: pipelineResult }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API /api/ai/process-message Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
