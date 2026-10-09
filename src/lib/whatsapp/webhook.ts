import crypto from "crypto";
import {
  WhatsAppWebhookPayload,
  ExtractedWhatsAppMessage,
  ExtractedWhatsAppStatus,
  WhatsAppMessageType,
} from "./types";

/**
 * Timing-safe string comparison to prevent timing side-channel attacks.
 */
function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Perform dummy timing safe compare to keep constant time execution
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies GET webhook challenge from Meta WhatsApp Cloud API.
 * Query Parameters sent by Meta:
 * - hub.mode ('subscribe')
 * - hub.verify_token
 * - hub.challenge
 */
export function verifyWebhookChallenge(searchParams: URLSearchParams): {
  isValid: boolean;
  challenge?: string;
  statusCode: number;
  reason?: string;
} {
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();

  if (!mode || !token || !challenge) {
    return {
      isValid: false,
      statusCode: 400,
      reason: "Missing required query parameters (hub.mode, hub.verify_token, or hub.challenge).",
    };
  }

  if (mode !== "subscribe") {
    return {
      isValid: false,
      statusCode: 403,
      reason: `Invalid hub.mode parameter. Expected 'subscribe', received '${mode}'.`,
    };
  }

  if (!expectedVerifyToken) {
    console.error("[WhatsApp Webhook] WHATSAPP_VERIFY_TOKEN is not configured in server environment.");
    return {
      isValid: false,
      statusCode: 403,
      reason: "Server verify token not configured.",
    };
  }

  const isTokenValid = timingSafeEqualStrings(token, expectedVerifyToken);

  if (!isTokenValid) {
    console.warn("[WhatsApp Webhook] Verification failed: Invalid hub.verify_token.");
    return {
      isValid: false,
      statusCode: 403,
      reason: "Verification token mismatch.",
    };
  }

  return {
    isValid: true,
    challenge,
    statusCode: 200,
  };
}

/**
 * Normalizes message type from Meta incoming message payload.
 */
function normalizeMessageType(type: string): WhatsAppMessageType {
  const validTypes: WhatsAppMessageType[] = [
    "text",
    "image",
    "audio",
    "video",
    "document",
    "sticker",
    "location",
    "contacts",
    "interactive",
  ];
  return validTypes.includes(type as WhatsAppMessageType)
    ? (type as WhatsAppMessageType)
    : "unknown";
}

/**
 * Extracts text body representation from various message types.
 */
function extractTextContent(msg: Record<string, any>, messageType: WhatsAppMessageType): string | undefined {
  switch (messageType) {
    case "text":
      return msg.text?.body;
    case "image":
      return msg.image?.caption || "[Image Attachment]";
    case "video":
      return msg.video?.caption || "[Video Attachment]";
    case "audio":
      return "[Audio Recording]";
    case "document":
      return msg.document?.caption || msg.document?.filename || "[Document Attachment]";
    case "sticker":
      return "[Sticker]";
    case "location":
      return msg.location?.name || msg.location?.address 
        ? `Location: ${msg.location?.name || ""} ${msg.location?.address || ""} (${msg.location?.latitude}, ${msg.location?.longitude})`.trim()
        : `Location: (${msg.location?.latitude}, ${msg.location?.longitude})`;
    case "contacts":
      const contactName = msg.contacts?.[0]?.name?.formatted_name || "Contact";
      return `[Shared Contact: ${contactName}]`;
    case "interactive":
      return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || "[Interactive Selection]";
    default:
      return "[Unsupported Message Format]";
  }
}

/**
 * Extracts media ID if present in message payload.
 */
function extractMediaId(msg: Record<string, any>, messageType: WhatsAppMessageType): string | undefined {
  switch (messageType) {
    case "image":
      return msg.image?.id;
    case "video":
      return msg.video?.id;
    case "audio":
      return msg.audio?.id;
    case "document":
      return msg.document?.id;
    case "sticker":
      return msg.sticker?.id;
    default:
      return undefined;
  }
}

/**
 * Parses incoming Meta WhatsApp Cloud API POST webhook payload.
 * Safely extracts normalized messages and status updates across multiple entries/changes.
 */
export function parseWebhookPayload(payload: WhatsAppWebhookPayload): {
  isValid: boolean;
  messages: ExtractedWhatsAppMessage[];
  statuses: ExtractedWhatsAppStatus[];
  error?: string;
} {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, messages: [], statuses: [], error: "Payload must be a JSON object." };
  }

  if (payload.object !== "whatsapp_business_account") {
    return {
      isValid: false,
      messages: [],
      statuses: [],
      error: `Invalid event object. Expected 'whatsapp_business_account', received '${payload.object}'.`,
    };
  }

  const extractedMessages: ExtractedWhatsAppMessage[] = [];
  const extractedStatuses: ExtractedWhatsAppStatus[] = [];

  const entries = payload.entry || [];

  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field !== "messages") continue;

      const value = change.value;
      if (!value) continue;

      const metadata = value.metadata || { display_phone_number: "", phone_number_id: "" };

      // Map contact profiles by WA ID for sender display name lookup
      const contactProfileMap = new Map<string, string>();
      if (Array.isArray(value.contacts)) {
        for (const contact of value.contacts) {
          if (contact.wa_id && contact.profile?.name) {
            contactProfileMap.set(contact.wa_id, contact.profile.name);
          }
        }
      }

      // Process incoming messages
      if (Array.isArray(value.messages)) {
        for (const msg of value.messages) {
          if (!msg.id || !msg.from) continue;

          const msgType = normalizeMessageType(msg.type);
          const textBody = extractTextContent(msg, msgType);
          const mediaId = extractMediaId(msg, msgType);
          const senderDisplayName = contactProfileMap.get(msg.from);

          // Convert unix timestamp string to ISO timestamp
          const timestampIso = msg.timestamp
            ? new Date(Number(msg.timestamp) * 1000).toISOString()
            : new Date().toISOString();

          extractedMessages.push({
            waMessageId: msg.id,
            senderWaId: msg.from,
            senderDisplayName,
            phoneNumberId: metadata.phone_number_id,
            messageType: msgType,
            textBody,
            mediaId,
            timestamp: timestampIso,
            rawMetadata: {
              displayPhoneNumber: metadata.display_phone_number,
              context: (msg as any).context || null,
            },
          });
        }
      }

      // Process status updates (sent, delivered, read, failed)
      if (Array.isArray(value.statuses)) {
        for (const statusObj of value.statuses) {
          if (!statusObj.id || !statusObj.status) continue;

          const statusTimestampIso = statusObj.timestamp
            ? new Date(Number(statusObj.timestamp) * 1000).toISOString()
            : new Date().toISOString();

          extractedStatuses.push({
            waStatusId: `${statusObj.id}_${statusObj.status}_${statusObj.timestamp || Date.now()}`,
            waMessageId: statusObj.id,
            recipientId: statusObj.recipient_id || "",
            status: statusObj.status,
            timestamp: statusTimestampIso,
            errors: statusObj.errors,
          });
        }
      }
    }
  }

  return {
    isValid: true,
    messages: extractedMessages,
    statuses: extractedStatuses,
  };
}
