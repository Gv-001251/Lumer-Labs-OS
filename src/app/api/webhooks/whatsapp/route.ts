import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookChallenge, parseWebhookPayload } from "@/lib/whatsapp/webhook";
import { saveIncomingWhatsAppMessage, saveWhatsAppStatusUpdate } from "@/lib/whatsapp/db";
import { processWhatsAppMessagePipeline } from "@/lib/whatsapp/pipeline";

/**
 * GET /api/webhooks/whatsapp
 * Meta WhatsApp Cloud API Webhook Verification Endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const verification = verifyWebhookChallenge(searchParams);

    if (!verification.isValid || !verification.challenge) {
      return new NextResponse(verification.reason || "Webhook verification failed", {
        status: verification.statusCode || 403,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Return exact hub.challenge as plain text HTTP 200 response
    return new NextResponse(verification.challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err: unknown) {
    console.error("[WhatsApp Webhook GET Exception]", err instanceof Error ? err.message : err);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

/**
 * POST /api/webhooks/whatsapp
 * Meta WhatsApp Cloud API Incoming Messages & Status Updates Endpoint
 */
export async function POST(request: NextRequest) {
  try {
    let payload: any;
    try {
      payload = await request.json();
    } catch (_err) {
      console.warn("[WhatsApp Webhook POST] Received malformed non-JSON request body.");
      return NextResponse.json({ error: "Malformed request payload. JSON expected." }, { status: 400 });
    }

    const parseResult = parseWebhookPayload(payload);

    if (!parseResult.isValid) {
      console.warn(`[WhatsApp Webhook POST] Rejected invalid payload structure: ${parseResult.error}`);
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const { messages, statuses } = parseResult;

    console.log(
      `[WhatsApp Webhook Received] Found ${messages.length} incoming message(s) and ${statuses.length} status update(s).`
    );

    // Process incoming messages asynchronously
    for (const msg of messages) {
      console.log(
        `[WhatsApp Event] Message ID: ${msg.waMessageId}, Type: ${msg.messageType}, Sender WA ID: ${msg.senderWaId}`
      );
      
      // Save message to database with idempotency check
      const saveRes = await saveIncomingWhatsAppMessage(msg);

      // If message is new (not duplicate), execute real-time AI automation pipeline
      if (saveRes.success && !saveRes.isDuplicate) {
        try {
          const pipelineRes = await processWhatsAppMessagePipeline(msg);
          console.log(
            `[WhatsApp Automation Pipeline Completed] Intent: ${pipelineRes.intent}, AutoProcessed: ${pipelineRes.processedAutomatically}, ReviewRequired: ${pipelineRes.requiresReview}`
          );
        } catch (pipelineErr) {
          console.error("[WhatsApp Automation Pipeline Error]", pipelineErr);
        }
      } else {
        console.log(`[WhatsApp Event] Message ${msg.waMessageId} skipped (duplicate key).`);
      }
    }

    // Process status updates (sent, delivered, read, failed)
    for (const statusObj of statuses) {
      console.log(
        `[WhatsApp Event Status] Message ID: ${statusObj.waMessageId}, Status: ${statusObj.status}`
      );
      
      await saveWhatsAppStatusUpdate(statusObj);
    }

    // Fast 200 OK acknowledgment to Meta
    return NextResponse.json({ success: true, received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("[WhatsApp Webhook POST Exception]", err instanceof Error ? err.message : err);
    // Even on error, return 200 OK after logging to prevent Meta from retrying endlessly if internal storage fails
    return NextResponse.json({ success: true, processedWithError: true }, { status: 200 });
  }
}
