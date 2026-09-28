import { SendWhatsAppTextMessageOptions, SendWhatsAppMessageResponse } from "./types";

/**
 * Server-only Meta WhatsApp Cloud API Client
 * Official Graph API endpoint: https://graph.facebook.com/${version}/${phoneNumberId}/messages
 */
export class WhatsAppCloudClient {
  private accessToken: string;
  private phoneNumberId: string;
  private apiVersion: string;

  constructor(config?: { accessToken?: string; phoneNumberId?: string; apiVersion?: string }) {
    // Strictly read server environment variables
    this.accessToken = config?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    
    // Explicitly fallback to documented v22.0 default if WHATSAPP_API_VERSION is empty
    const rawVersion = config?.apiVersion || process.env.WHATSAPP_API_VERSION;
    this.apiVersion = rawVersion && rawVersion.trim().length > 0 ? rawVersion.trim() : "v22.0";
  }

  /**
   * Safe JSON representation preventing secret tokens from leaking if serialized
   */
  public toJSON() {
    return {
      phoneNumberId: this.phoneNumberId,
      apiVersion: this.apiVersion,
      isConfigured: this.isConfigured().valid,
    };
  }

  /**
   * Validates required server-side credentials
   */
  public isConfigured(): { valid: boolean; missing: string[] } {

    const missing: string[] = [];
    if (!this.accessToken) missing.push("WHATSAPP_ACCESS_TOKEN");
    if (!this.phoneNumberId) missing.push("WHATSAPP_PHONE_NUMBER_ID");
    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Sends a basic text message via WhatsApp Cloud API
   */
  public async sendTextMessage(options: SendWhatsAppTextMessageOptions): Promise<SendWhatsAppMessageResponse> {
    const configCheck = this.isConfigured();
    if (!configCheck.valid) {
      console.error(`[WhatsApp API Client Error] Missing configuration: ${configCheck.missing.join(", ")}`);
      return {
        success: false,
        error: `WhatsApp API not configured. Missing environment variables: ${configCheck.missing.join(", ")}`,
        errorCategory: "CONFIG_ERROR",
      };
    }

    if (!options.to || !options.to.trim()) {
      return {
        success: false,
        error: "Recipient phone number (to) is required.",
        errorCategory: "API_ERROR",
      };
    }

    if (!options.text || !options.text.trim()) {
      return {
        success: false,
        error: "Message text content is required.",
        errorCategory: "API_ERROR",
      };
    }

    // Format recipient phone number by stripping '+' and spaces
    const cleanTo = options.to.replace(/[^0-9]/g, "");

    const endpoint = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const requestPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanTo,
      type: "text",
      text: {
        preview_url: options.previewUrl ?? false,
        body: options.text,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg = responseData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        console.error(`[WhatsApp API Error] Status: ${response.status}, Code: ${responseData?.error?.code}`);
        return {
          success: false,
          error: `Meta Graph API Error: ${errorMsg}`,
          errorCategory: "API_ERROR",
        };
      }

      const waMessageId = responseData?.messages?.[0]?.id;

      return {
        success: true,
        waMessageId,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown network error";
      console.error("[WhatsApp API Network Failure]", errorMessage);
      return {
        success: false,
        error: `Failed to connect to Meta WhatsApp API: ${errorMessage}`,
        errorCategory: "NETWORK_ERROR",
      };
    }
  }
}

/**
 * Singleton helper for server-side WhatsApp API calls
 */
export const getWhatsAppClient = () => new WhatsAppCloudClient();
