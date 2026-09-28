import { createClient } from "@/lib/supabase/client";

export interface AuditLogPayload {
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  source?: string;
  whatsappMessageId?: string;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && url.includes("supabase.co") && !url.includes("demo"));
}

const memoryAuditLogs: Array<AuditLogPayload & { id: string; created_at: string }> = [];

/**
 * Creates an audit log record for every automated database action.
 */
export async function logAuditTrail(payload: AuditLogPayload): Promise<boolean> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("audit_logs").insert({
        action: payload.action,
        entity_type: payload.entityType,
        entity_id: payload.entityId || null,
        old_data: payload.oldData ? (payload.oldData as any) : null,
        new_data: payload.newData ? (payload.newData as any) : null,
        source: payload.source || "WhatsApp",
        whatsapp_message_id: payload.whatsappMessageId || null,
        created_at: now,
      });

      if (!error) return true;
      console.warn("[Audit Log DB Warning]", error);
    } catch (err) {
      console.warn("[Audit Log Fallback Error]", err);
    }
  }

  // Memory fallback log
  memoryAuditLogs.unshift({
    ...payload,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: now,
  });

  return true;
}

export function getMemoryAuditLogs() {
  return memoryAuditLogs;
}
