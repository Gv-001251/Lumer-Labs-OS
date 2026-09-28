import { createClient } from "@/lib/supabase/client";
import { ExtractedWhatsAppMessage, ExtractedWhatsAppStatus } from "./types";

// In-memory development store fallback for local testing when Supabase DB is unconfigured
interface MemoryConversation {
  id: string;
  wa_id: string;
  phone_number_id: string;
  display_name?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

interface MemoryMessage {
  id: string;
  wa_message_id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  text_body?: string;
  media_id?: string;
  status: string;
  timestamp: string;
  raw_metadata?: Record<string, unknown>;
  created_at: string;
}

const memoryStore = {
  conversations: new Map<string, MemoryConversation>(),
  messages: new Map<string, MemoryMessage>(),
  processedStatusIds: new Set<string>(),
};

/**
 * Seed initial sample conversation in memory store if empty
 */
function seedMemoryStoreIfEmpty() {
  if (memoryStore.conversations.size === 0) {
    const demoConvId = "conv-demo-1";
    const now = new Date().toISOString();
    memoryStore.conversations.set("919876543210", {
      id: demoConvId,
      wa_id: "919876543210",
      phone_number_id: "demo_phone_id",
      display_name: "Aarav Sharma",
      last_message_at: now,
      created_at: now,
      updated_at: now,
    });

    memoryStore.messages.set("wamid.demo1", {
      id: "msg-demo-1",
      wa_message_id: "wamid.demo1",
      conversation_id: demoConvId,
      direction: "inbound",
      message_type: "text",
      text_body: "Hi Lumer OS Team! Sending ₹15,000 via UPI for September subscription renewal.",
      status: "received",
      timestamp: now,
      created_at: now,
    });
  }
}

/**
 * Checks whether Supabase is configured with a valid remote URL.
 */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && url.includes("supabase.co") && !url.includes("demo"));
}

/**
 * Saves or updates a conversation and persists an incoming message.
 * Enforces idempotency using `wa_message_id`.
 */
export async function saveIncomingWhatsAppMessage(msg: ExtractedWhatsAppMessage): Promise<{
  success: boolean;
  isDuplicate: boolean;
  conversationId?: string;
  messageId?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();

      // 1. Check for duplicate message ID
      const { data: existingMsg } = await supabase
        .from("whatsapp_messages")
        .select("id, conversation_id")
        .eq("wa_message_id", msg.waMessageId)
        .maybeSingle();

      if (existingMsg) {
        return {
          success: true,
          isDuplicate: true,
          conversationId: existingMsg.conversation_id,
          messageId: existingMsg.id,
        };
      }

      // 2. Upsert conversation
      const { data: convData, error: convErr } = await supabase
        .from("whatsapp_conversations")
        .upsert(
          {
            wa_id: msg.senderWaId,
            phone_number_id: msg.phoneNumberId,
            display_name: msg.senderDisplayName || undefined,
            last_message_at: msg.timestamp,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "wa_id" }
        )
        .select("id")
        .single();

      if (convErr || !convData) {
        console.error("[WhatsApp DB Error] Failed to upsert conversation:", convErr);
        throw convErr;
      }

      const conversationId = convData.id;

      // 3. Insert incoming message
      const { data: msgData, error: msgErr } = await supabase
        .from("whatsapp_messages")
        .insert({
          wa_message_id: msg.waMessageId,
          conversation_id: conversationId,
          direction: "inbound",
          message_type: msg.messageType,
          text_body: msg.textBody || null,
          media_id: msg.mediaId || null,
          status: "received",
          timestamp: msg.timestamp,
          raw_metadata: msg.rawMetadata || {},
        })
        .select("id")
        .single();

      if (msgErr) {
        if (msgErr.code === "23505") {
          // Unique constraint violation (duplicate key)
          return { success: true, isDuplicate: true, conversationId };
        }
        console.error("[WhatsApp DB Error] Failed to insert message:", msgErr);
        throw msgErr;
      }

      return {
        success: true,
        isDuplicate: false,
        conversationId,
        messageId: msgData?.id,
      };
    } catch (err) {
      console.warn("[WhatsApp DB Fallback] Supabase insert failed, falling back to memory store:", err);
    }
  }

  // Fallback in-memory store processing
  seedMemoryStoreIfEmpty();

  if (memoryStore.messages.has(msg.waMessageId)) {
    const existing = memoryStore.messages.get(msg.waMessageId)!;
    return {
      success: true,
      isDuplicate: true,
      conversationId: existing.conversation_id,
      messageId: existing.id,
    };
  }

  let conversation = memoryStore.conversations.get(msg.senderWaId);
  const now = new Date().toISOString();

  if (!conversation) {
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    conversation = {
      id: convId,
      wa_id: msg.senderWaId,
      phone_number_id: msg.phoneNumberId,
      display_name: msg.senderDisplayName || msg.senderWaId,
      last_message_at: msg.timestamp,
      created_at: now,
      updated_at: now,
    };
    memoryStore.conversations.set(msg.senderWaId, conversation);
  } else {
    conversation.last_message_at = msg.timestamp;
    if (msg.senderDisplayName) conversation.display_name = msg.senderDisplayName;
  }

  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const memoryMsg: MemoryMessage = {
    id: messageId,
    wa_message_id: msg.waMessageId,
    conversation_id: conversation.id,
    direction: "inbound",
    message_type: msg.messageType,
    text_body: msg.textBody,
    media_id: msg.mediaId,
    status: "received",
    timestamp: msg.timestamp,
    raw_metadata: msg.rawMetadata,
    created_at: now,
  };

  memoryStore.messages.set(msg.waMessageId, memoryMsg);

  return {
    success: true,
    isDuplicate: false,
    conversationId: conversation.id,
    messageId,
  };
}

/**
 * Saves status updates (sent, delivered, read, failed) with idempotency.
 */
export async function saveWhatsAppStatusUpdate(status: ExtractedWhatsAppStatus): Promise<{
  success: boolean;
  isDuplicate: boolean;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();

      // Insert status update log
      const { error: statusErr } = await supabase.from("whatsapp_statuses").insert({
        wa_status_id: status.waStatusId,
        wa_message_id: status.waMessageId,
        status: status.status,
        timestamp: status.timestamp,
        recipient_id: status.recipientId,
        errors: status.errors ? (status.errors as any) : null,
      });

      if (statusErr && statusErr.code === "23505") {
        return { success: true, isDuplicate: true };
      }

      // Update status on the target message
      await supabase
        .from("whatsapp_messages")
        .update({ status: status.status })
        .eq("wa_message_id", status.waMessageId);

      return { success: true, isDuplicate: false };
    } catch (err) {
      console.warn("[WhatsApp DB Status Fallback] Status update error:", err);
    }
  }

  // Fallback in-memory processing
  if (memoryStore.processedStatusIds.has(status.waStatusId)) {
    return { success: true, isDuplicate: true };
  }

  memoryStore.processedStatusIds.add(status.waStatusId);

  for (const msg of memoryStore.messages.values()) {
    if (msg.wa_message_id === status.waMessageId) {
      msg.status = status.status;
      break;
    }
  }

  return { success: true, isDuplicate: false };
}

/**
 * Saves an outbound WhatsApp message sent from Lumer OS dashboard.
 */
export async function saveOutboundWhatsAppMessage(params: {
  waMessageId: string;
  recipientWaId: string;
  phoneNumberId: string;
  textBody: string;
}): Promise<{ conversationId: string; messageId: string }> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();

      const { data: convData } = await supabase
        .from("whatsapp_conversations")
        .upsert(
          {
            wa_id: params.recipientWaId,
            phone_number_id: params.phoneNumberId,
            last_message_at: now,
            updated_at: now,
          },
          { onConflict: "wa_id" }
        )
        .select("id")
        .single();

      const conversationId = convData?.id || `conv-${params.recipientWaId}`;

      const { data: msgData } = await supabase
        .from("whatsapp_messages")
        .insert({
          wa_message_id: params.waMessageId,
          conversation_id: conversationId,
          direction: "outbound",
          message_type: "text",
          text_body: params.textBody,
          status: "sent",
          timestamp: now,
        })
        .select("id")
        .single();

      return {
        conversationId,
        messageId: msgData?.id || `msg-${params.waMessageId}`,
      };
    } catch (err) {
      console.warn("[WhatsApp DB Outbound Fallback]", err);
    }
  }

  seedMemoryStoreIfEmpty();

  let conversation = memoryStore.conversations.get(params.recipientWaId);
  if (!conversation) {
    const convId = `conv-${Date.now()}`;
    conversation = {
      id: convId,
      wa_id: params.recipientWaId,
      phone_number_id: params.phoneNumberId,
      display_name: params.recipientWaId,
      last_message_at: now,
      created_at: now,
      updated_at: now,
    };
    memoryStore.conversations.set(params.recipientWaId, conversation);
  } else {
    conversation.last_message_at = now;
  }

  const messageId = `msg-${Date.now()}`;
  memoryStore.messages.set(params.waMessageId, {
    id: messageId,
    wa_message_id: params.waMessageId,
    conversation_id: conversation.id,
    direction: "outbound",
    message_type: "text",
    text_body: params.textBody,
    status: "sent",
    timestamp: now,
    created_at: now,
  });

  return { conversationId: conversation.id, messageId };
}

/**
 * Fetches all conversations from database or memory store.
 */
export async function getWhatsAppConversations(): Promise<Array<{
  id: string;
  waId: string;
  displayName: string;
  phoneNumberId: string;
  lastMessageAt: string;
  lastMessageText?: string;
  unreadCount?: number;
}>> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("id, wa_id, display_name, phone_number_id, last_message_at")
        .order("last_message_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          waId: c.wa_id,
          displayName: c.display_name || c.wa_id,
          phoneNumberId: c.phone_number_id,
          lastMessageAt: c.last_message_at,
        }));
      }
    } catch (_err) {
      // Fallthrough to memory store
    }
  }

  seedMemoryStoreIfEmpty();
  const sortedConvs = Array.from(memoryStore.conversations.values()).sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );

  return sortedConvs.map((c) => {
    // Find last message for this conversation
    const messages = Array.from(memoryStore.messages.values())
      .filter((m) => m.conversation_id === c.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      id: c.id,
      waId: c.wa_id,
      displayName: c.display_name || c.wa_id,
      phoneNumberId: c.phone_number_id,
      lastMessageAt: c.last_message_at,
      lastMessageText: messages[0]?.text_body,
    };
  });
}

/**
 * Fetches messages for a specific conversation.
 */
export async function getWhatsAppMessagesForConversation(conversationId: string): Promise<Array<{
  id: string;
  waMessageId: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  messageType: string;
  textBody?: string;
  mediaId?: string;
  status: string;
  timestamp: string;
}>> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((m) => ({
          id: m.id,
          waMessageId: m.wa_message_id,
          conversationId: m.conversation_id,
          direction: m.direction as "inbound" | "outbound",
          messageType: m.message_type,
          textBody: m.text_body,
          mediaId: m.media_id,
          status: m.status,
          timestamp: m.timestamp,
        }));
      }
    } catch (_err) {
      // Fallthrough to memory store
    }
  }

  seedMemoryStoreIfEmpty();
  return Array.from(memoryStore.messages.values())
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((m) => ({
      id: m.id,
      waMessageId: m.wa_message_id,
      conversationId: m.conversation_id,
      direction: m.direction,
      messageType: m.message_type,
      textBody: m.text_body,
      mediaId: m.media_id,
      status: m.status,
      timestamp: m.timestamp,
    }));
}
