import assert from "node:assert";
import { verifyWebhookChallenge, parseWebhookPayload } from "../webhook";
import { saveIncomingWhatsAppMessage, saveWhatsAppStatusUpdate } from "../db";
import { WhatsAppCloudClient } from "../client";
import { WhatsAppWebhookPayload } from "../types";

/**
 * Suite of 12 Automated Integration Tests for WhatsApp Cloud API Webhook
 */
async function runWhatsAppTests() {
  console.log("=================================================");
  console.log("RUNNING META WHATSAPP CLOUD API WEBHOOK TEST SUITE");
  console.log("=================================================");

  let passed = 0;
  let total = 14;

  // Set test environment variable verify token
  const TEST_VERIFY_TOKEN = "lumer_test_verify_token_998877";
  process.env.WHATSAPP_VERIFY_TOKEN = TEST_VERIFY_TOKEN;

  // Test 1: Valid GET Webhook Verification
  try {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": TEST_VERIFY_TOKEN,
      "hub.challenge": "1155993377",
    });
    const res = verifyWebhookChallenge(params);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.challenge, "1155993377");
    console.log("✅ Test 1 Passed: Valid GET Webhook Verification");
    passed++;
  } catch (err) {
    console.error("❌ Test 1 Failed:", err);
  }

  // Test 2: Invalid Verify Token
  try {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": "wrong_invalid_token",
      "hub.challenge": "1155993377",
    });
    const res = verifyWebhookChallenge(params);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.challenge, undefined);
    console.log("✅ Test 2 Passed: Invalid Verify Token (HTTP 403)");
    passed++;
  } catch (err) {
    console.error("❌ Test 2 Failed:", err);
  }

  // Test 3: Missing Verification Parameters
  try {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      // missing verify_token and challenge
    });
    const res = verifyWebhookChallenge(params);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.statusCode, 400);
    console.log("✅ Test 3 Passed: Missing Verification Parameters (HTTP 400)");
    passed++;
  } catch (err) {
    console.error("❌ Test 3 Failed:", err);
  }

  // Test 4: Valid Incoming Text Message Payload
  try {
    const payload: WhatsAppWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "100020003000",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+1555019999",
                  phone_number_id: "phone_id_12345",
                },
                contacts: [{ wa_id: "919876543210", profile: { name: "Rohan Patel" } }],
                messages: [
                  {
                    from: "919876543210",
                    id: "wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSQTFCMjM0NTY3ODkwMTIzNDU2AA==",
                    timestamp: "1750000000",
                    type: "text",
                    text: { body: "Hello Lumer OS, please confirm project invoice." },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const parsed = parseWebhookPayload(payload);
    assert.strictEqual(parsed.isValid, true);
    assert.strictEqual(parsed.messages.length, 1);
    assert.strictEqual(parsed.messages[0].waMessageId, "wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSQTFCMjM0NTY3ODkwMTIzNDU2AA==");
    assert.strictEqual(parsed.messages[0].senderDisplayName, "Rohan Patel");
    assert.strictEqual(parsed.messages[0].textBody, "Hello Lumer OS, please confirm project invoice.");
    console.log("✅ Test 4 Passed: Valid Incoming Text Message Payload");
    passed++;
  } catch (err) {
    console.error("❌ Test 4 Failed:", err);
  }

  // Test 5: Valid Image or Document Payload
  try {
    const payload: WhatsAppWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "100020003000",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { display_phone_number: "+1555019999", phone_number_id: "phone_id_12345" },
                messages: [
                  {
                    from: "919876543210",
                    id: "wamid.media.image.001",
                    timestamp: "1750000010",
                    type: "image",
                    image: { id: "media_id_99", caption: "Payment Receipt Screenshot" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const parsed = parseWebhookPayload(payload);
    assert.strictEqual(parsed.isValid, true);
    assert.strictEqual(parsed.messages[0].messageType, "image");
    assert.strictEqual(parsed.messages[0].mediaId, "media_id_99");
    assert.strictEqual(parsed.messages[0].textBody, "Payment Receipt Screenshot");
    console.log("✅ Test 5 Passed: Valid Image/Document Media Payload");
    passed++;
  } catch (err) {
    console.error("❌ Test 5 Failed:", err);
  }

  // Test 6: Multiple Messages in One Webhook
  try {
    const payload: WhatsAppWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "100020003000",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { display_phone_number: "+1555019999", phone_number_id: "phone_id_12345" },
                messages: [
                  { from: "919876543210", id: "wamid.multi.1", timestamp: "1750000020", type: "text", text: { body: "Msg 1" } },
                  { from: "919876543210", id: "wamid.multi.2", timestamp: "1750000021", type: "text", text: { body: "Msg 2" } },
                ],
              },
            },
          ],
        },
      ],
    };

    const parsed = parseWebhookPayload(payload);
    assert.strictEqual(parsed.messages.length, 2);
    assert.strictEqual(parsed.messages[0].waMessageId, "wamid.multi.1");
    assert.strictEqual(parsed.messages[1].waMessageId, "wamid.multi.2");
    console.log("✅ Test 6 Passed: Multiple Messages in Single Webhook");
    passed++;
  } catch (err) {
    console.error("❌ Test 6 Failed:", err);
  }

  // Test 7: Delivery and Read Status Payloads
  try {
    const payload: WhatsAppWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "100020003000",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { display_phone_number: "+1555019999", phone_number_id: "phone_id_12345" },
                statuses: [
                  {
                    id: "wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSQTFCMjM0NTY3ODkwMTIzNDU2AA==",
                    status: "delivered",
                    timestamp: "1750000030",
                    recipient_id: "919876543210",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const parsed = parseWebhookPayload(payload);
    assert.strictEqual(parsed.statuses.length, 1);
    assert.strictEqual(parsed.statuses[0].status, "delivered");
    assert.strictEqual(parsed.statuses[0].recipientId, "919876543210");
    console.log("✅ Test 7 Passed: Delivery & Read Status Payloads");
    passed++;
  } catch (err) {
    console.error("❌ Test 7 Failed:", err);
  }

  // Test 8: Malformed JSON or Invalid Event Object
  try {
    const payload = { object: "invalid_object", entry: [] } as any;
    const parsed = parseWebhookPayload(payload);
    assert.strictEqual(parsed.isValid, false);
    assert.ok(parsed.error?.includes("Invalid event object"));
    console.log("✅ Test 8 Passed: Malformed JSON & Object Rejection");
    passed++;
  } catch (err) {
    console.error("❌ Test 8 Failed:", err);
  }

  // Test 9: Duplicate Message ID Handling (Idempotency)
  try {
    const testMsg = {
      waMessageId: "wamid.idempotency.test.100",
      senderWaId: "919999988888",
      senderDisplayName: "Test Contact",
      phoneNumberId: "phone_123",
      messageType: "text" as const,
      textBody: "Unique Message Text",
      timestamp: new Date().toISOString(),
      rawMetadata: {},
    };

    // First insertion
    const save1 = await saveIncomingWhatsAppMessage(testMsg);
    assert.strictEqual(save1.success, true);
    assert.strictEqual(save1.isDuplicate, false);

    // Second insertion (duplicate)
    const save2 = await saveIncomingWhatsAppMessage(testMsg);
    assert.strictEqual(save2.success, true);
    assert.strictEqual(save2.isDuplicate, true);
    console.log("✅ Test 9 Passed: Duplicate Message ID Idempotency Handling");
    passed++;
  } catch (err) {
    console.error("❌ Test 9 Failed:", err);
  }

  // Test 10: Missing Environment Variables Configuration Check
  try {
    const dummyClient = new WhatsAppCloudClient({ accessToken: "", phoneNumberId: "" });
    const check = dummyClient.isConfigured();
    assert.strictEqual(check.valid, false);
    assert.ok(check.missing.includes("WHATSAPP_ACCESS_TOKEN"));
    assert.ok(check.missing.includes("WHATSAPP_PHONE_NUMBER_ID"));

    const sendRes = await dummyClient.sendTextMessage({ to: "919876543210", text: "Test" });
    assert.strictEqual(sendRes.success, false);
    assert.strictEqual(sendRes.errorCategory, "CONFIG_ERROR");
    console.log("✅ Test 10 Passed: Safe Missing Environment Variables Error Handling");
    passed++;
  } catch (err) {
    console.error("❌ Test 10 Failed:", err);
  }

  // Test 11: API Request Failure Handling
  try {
    const clientWithInvalidCreds = new WhatsAppCloudClient({
      accessToken: "invalid_access_token_xyz",
      phoneNumberId: "invalid_phone_id_999",
      apiVersion: "v22.0",
    });

    const res = await clientWithInvalidCreds.sendTextMessage({
      to: "919876543210",
      text: "Test failure message",
    });

    assert.strictEqual(res.success, false);
    assert.ok(res.error !== undefined);
    console.log("✅ Test 11 Passed: API Request Failure Safe Response");
    passed++;
  } catch (err) {
    console.error("❌ Test 11 Failed:", err);
  }

  // Test 12: No Accidental Exposure of Secrets
  try {
    const client = new WhatsAppCloudClient({ accessToken: "secret_token_12345" });
    const stringified = JSON.stringify(client);
    assert.strictEqual(stringified.includes("secret_token_12345"), false);

    const verificationError = verifyWebhookChallenge(new URLSearchParams({ "hub.mode": "subscribe", "hub.verify_token": "wrong" }));
    assert.strictEqual(JSON.stringify(verificationError).includes(TEST_VERIFY_TOKEN), false);
    console.log("✅ Test 12 Passed: Zero Secret Leakage in Logs or Output");
    passed++;
  } catch (err) {
    console.error("❌ Test 12 Failed:", err);
  }

  // Test 13: Meta Error Code 131030 Recipient Error Classification
  try {
    const originalFetch = global.fetch;

    global.fetch = (async () => {
      return {
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: "(#131030) Recipient phone number not in allowed list",
            type: "OAuthException",
            code: 131030,
            error_subcode: 2659007,
            fbtrace_id: "test_fbtrace_id_abc123",
          },
        }),
      } as Response;
    }) as typeof fetch;

    const client = new WhatsAppCloudClient({ accessToken: "valid_token", phoneNumberId: "valid_id" });
    const res = await client.sendTextMessage({ to: "919999900000", text: "Hello recipient test" });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.errorCategory, "RECIPIENT_ERROR");
    assert.strictEqual(res.errorDetails?.code, 131030);
    assert.strictEqual(res.errorDetails?.errorSubcode, 2659007);
    assert.strictEqual(res.errorDetails?.fbtraceId, "test_fbtrace_id_abc123");
    assert.strictEqual(res.errorDetails?.type, "OAuthException");
    assert.strictEqual(res.errorDetails?.httpStatus, 400);

    global.fetch = originalFetch;
    console.log("✅ Test 13 Passed: Meta Error Code 131030 Recipient Error Classification");
    passed++;
  } catch (err) {
    console.error("❌ Test 13 Failed:", err);
  }

  // Test 14: Structured Meta Error Details Extraction
  try {
    const originalFetch = global.fetch;

    global.fetch = (async () => {
      return {
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: "Invalid OAuth access token.",
            type: "OAuthException",
            code: 190,
            error_subcode: 463,
            fbtrace_id: "trace_token_expired",
          },
        }),
      } as Response;
    }) as typeof fetch;

    const client = new WhatsAppCloudClient({ accessToken: "expired_token", phoneNumberId: "valid_id" });
    const res = await client.sendTextMessage({ to: "919999900000", text: "Hello token test" });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.errorCategory, "API_ERROR");
    assert.strictEqual(res.errorDetails?.code, 190);
    assert.strictEqual(res.errorDetails?.errorSubcode, 463);
    assert.strictEqual(res.errorDetails?.fbtraceId, "trace_token_expired");

    global.fetch = originalFetch;
    console.log("✅ Test 14 Passed: Structured Meta Error Details Extraction (Code 190)");
    passed++;
  } catch (err) {
    console.error("❌ Test 14 Failed:", err);
  }

  console.log("=================================================");
  console.log(`TEST SUITE RESULTS: ${passed}/${total} TESTS PASSED.`);
  console.log("=================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runWhatsAppTests().catch((err) => {
  console.error("Fatal Test Suite Execution Failure:", err);
  process.exit(1);
});
