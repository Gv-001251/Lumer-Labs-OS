export type WhatsAppMessageType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "sticker"
  | "location"
  | "contacts"
  | "interactive"
  | "unknown";

export type WhatsAppMessageStatusType = "sent" | "delivered" | "read" | "failed" | "received";

export interface WhatsAppProfile {
  name?: string;
}

export interface WhatsAppContact {
  profile?: WhatsAppProfile;
  wa_id: string;
}

export interface WhatsAppTextMessage {
  body: string;
}

export interface WhatsAppMediaMessage {
  id?: string;
  mime_type?: string;
  sha256?: string;
  caption?: string;
  filename?: string;
}

export interface WhatsAppLocationMessage {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface WhatsAppContactMessage {
  addresses?: Array<{ city?: string; country?: string; state?: string; street?: string; zip?: string }>;
  emails?: Array<{ email?: string; type?: string }>;
  name?: { formatted_name: string; first_name?: string; last_name?: string };
  org?: { company?: string };
  phones?: Array<{ phone?: string; wa_id?: string; type?: string }>;
}

export interface WhatsAppInteractiveMessage {
  type: string;
  button_reply?: { id: string; title: string };
  list_reply?: { id: string; title: string; description?: string };
}

export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: WhatsAppMessageType;
  text?: WhatsAppTextMessage;
  image?: WhatsAppMediaMessage;
  audio?: WhatsAppMediaMessage;
  video?: WhatsAppMediaMessage;
  document?: WhatsAppMediaMessage;
  sticker?: WhatsAppMediaMessage;
  location?: WhatsAppLocationMessage;
  contacts?: WhatsAppContactMessage[];
  interactive?: WhatsAppInteractiveMessage;
  errors?: Array<{ code: number; title: string; message?: string }>;
}

export interface WhatsAppStatusError {
  code: number;
  title: string;
  message?: string;
  error_data?: { details?: string };
}

export interface WhatsAppIncomingStatus {
  id: string;
  status: WhatsAppMessageStatusType;
  timestamp: string;
  recipient_id: string;
  conversation?: { id: string; expiration_timestamp?: string; origin?: { type: string } };
  pricing?: { billable: boolean; pricing_model: string; category: string };
  errors?: WhatsAppStatusError[];
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppValue {
  messaging_product: "whatsapp" | string;
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppIncomingMessage[];
  statuses?: WhatsAppIncomingStatus[];
  errors?: Array<{ code: number; title: string; message?: string }>;
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppWebhookPayload {
  object: "whatsapp_business_account" | string;
  entry?: WhatsAppEntry[];
}

// Extracted normalized message representation for internal consumption
export interface ExtractedWhatsAppMessage {
  waMessageId: string;
  senderWaId: string;
  senderDisplayName?: string;
  phoneNumberId: string;
  messageType: WhatsAppMessageType;
  textBody?: string;
  mediaId?: string;
  timestamp: string;
  rawMetadata: Record<string, unknown>;
}

// Extracted normalized status representation
export interface ExtractedWhatsAppStatus {
  waStatusId: string;
  waMessageId: string;
  recipientId: string;
  status: WhatsAppMessageStatusType;
  timestamp: string;
  errors?: WhatsAppStatusError[];
}

// Direct Messaging API interfaces
export interface SendWhatsAppTextMessageOptions {
  to: string; // Recipient WhatsApp ID / Phone number with country code
  text: string;
  previewUrl?: boolean;
}

export interface WhatsAppMetaErrorDetails {
  message?: string;
  type?: string;
  code?: number;
  errorSubcode?: number;
  fbtraceId?: string;
  httpStatus?: number;
}

export interface SendWhatsAppMessageResponse {
  success: boolean;
  waMessageId?: string;
  error?: string;
  errorCategory?: "CONFIG_ERROR" | "NETWORK_ERROR" | "API_ERROR" | "RECIPIENT_ERROR" | "DISABLED";
  errorDetails?: WhatsAppMetaErrorDetails;
}
