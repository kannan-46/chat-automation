import axios from "axios";
import { VERIFY_TOKEN } from "../config/config.js";
import { getTokens } from "../config/tokenStore.js";
import { TRIGGER_WORDS, COMMENT_REPLY, DM_MESSAGE } from "../config/automation.js";

// STEP 1 — Webhook Verification
export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

// Check if comment text contains any trigger word
const containsTriggerWord = (text) => {
  const lowerText = text.toLowerCase();
  return TRIGGER_WORDS.some((word) => lowerText.includes(word.toLowerCase()));
};

// Reply to a comment on Instagram
const replyToComment = async (commentId, message, accessToken) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${commentId}/replies`,
      { message },
      { params: { access_token: accessToken } }
    );
    console.log(`COMMENT REPLY SUCCESS — Comment ${commentId}`);
  } catch (error) {
    console.error("COMMENT REPLY FAILED:", error.response?.data || error.message);
  }
};

// Send a DM to a user via Instagram
const sendDM = async (recipientId, message, accessToken, igUserId) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/messages`,
      {
        recipient: { id: recipientId },
        message: { text: message },
      },
      { params: { access_token: accessToken } }
    );
    console.log(`DM SENT SUCCESS — To ${recipientId}`);
  } catch (error) {
    console.error("DM SEND FAILED:", error.response?.data || error.message);
  }
};

// STEP 2 — Receive Events
export const receiveWebhook = async (req, res) => {
  const body = req.body;

  console.log("Webhook Event:", JSON.stringify(body, null, 2));

  if (body.object !== "instagram") {
    return res.sendStatus(404);
  }

  const { pageAccessToken, igUserId } = getTokens();

  if (!pageAccessToken) {
    console.error("No access token stored. Please login first at /auth/login");
    return res.status(200).send("EVENT_RECEIVED");
  }

  try {
    for (const entry of body.entry || []) {

      /*
        ================================
        HANDLE "changes" (comments, etc.)
        ================================
      */
      if (entry.changes) {
        for (const change of entry.changes) {

          // COMMENT EVENTS
          if (change.field === "comments") {
            const comment = change.value;
            const commentId = comment.id;
            const commentText = comment.text;
            const commenterId = comment.from?.id;

            console.log("\n===== INCOMING COMMENT =====");
            console.log(`Time:        ${new Date().toLocaleString()}`);
            console.log(`Comment ID:  ${commentId}`);
            console.log(`From User:   ${comment.from?.username || commenterId}`);
            console.log(`Text:        "${commentText}"`);
            console.log(`Media ID:    ${comment.media?.id || "N/A"}`);
            console.log("============================\n");

            // Check if comment contains a trigger word
            if (containsTriggerWord(commentText)) {
              const matchedWord = TRIGGER_WORDS.find((w) => commentText.toLowerCase().includes(w.toLowerCase()));
              console.log(`TRIGGER MATCHED: "${matchedWord}" found in comment`);

              // 1. Reply to the comment
              console.log("\n--- Sending Comment Reply ---");
              console.log(`Reply To:    Comment ${commentId}`);
              console.log(`Reply Text:  "${COMMENT_REPLY}"`);
              await replyToComment(commentId, COMMENT_REPLY, pageAccessToken);

              // 2. Send DM with product link to the commenter
              if (commenterId) {
                console.log("\n--- Sending DM ---");
                console.log(`DM To:       ${comment.from?.username || commenterId}`);
                console.log(`DM Text:     "${DM_MESSAGE}"`);
                await sendDM(commenterId, DM_MESSAGE, pageAccessToken, igUserId);
              }
            } else {
              console.log("No trigger word found — skipping automation");
            }
          }
        }
      }

      /*
        ================================
        HANDLE "messaging" (DMs, reads)
        ================================
      */
      if (entry.messaging) {
        for (const event of entry.messaging) {

          // MESSAGE RECEIVED
          if (event.message) {
            // Skip echo messages (messages sent BY your page, e.g. from Earnly)
            if (event.message.is_echo) {
              console.log("\n===== ECHO MESSAGE (sent by your page) =====");
              console.log(`Time:        ${new Date().toLocaleString()}`);
              console.log(`To:          ${event.recipient?.id}`);
              console.log(`Type:        ${event.message.attachments?.[0]?.type || "text"}`);
              console.log("=============================================\n");
              continue;
            }

            const senderId = event.sender?.id;
            const messageText = event.message?.text;
            const messageId = event.message?.mid;
            const attachments = event.message?.attachments;

            console.log("\n===== INCOMING DM =====");
            console.log(`Time:        ${new Date().toLocaleString()}`);
            console.log(`From:        ${senderId}`);
            console.log(`Message:     "${messageText || "(attachment)"}"`);
            if (attachments) {
              console.log(`Attachments: ${attachments.map(a => a.type).join(", ")}`);
            }
            console.log(`Message ID:  ${messageId}`);
            console.log("=======================\n");
          }

          // MESSAGE READ RECEIPT
          if (event.read) {
            console.log("\n===== MESSAGE READ =====");
            console.log(`Time:        ${new Date().toLocaleString()}`);
            console.log(`Read by:     ${event.sender?.id || "unknown"}`);
            console.log("========================\n");
          }
        }
      }

    }

    return res.status(200).send("EVENT_RECEIVED");

  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return res.sendStatus(500);
  }
};
