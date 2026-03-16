// VERIFY TOKEN (must match Meta dashboard)
const VERIFY_TOKEN = "my_secret_token_123";


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


// STEP 2 — Receive Events
export const receiveWebhook = async (req, res) => {

  const body = req.body;

  console.log("Webhook Event:", JSON.stringify(body, null, 2));

  if (body.object !== "instagram") {
    return res.sendStatus(404);
  }

  try {

    for (const entry of body.entry || []) {

      const instagramBusinessId = entry.id;

      /*
      =========================
      EVENTS INSIDE "changes"
      =========================
      */

      if (entry.changes) {

        for (const change of entry.changes) {

          // COMMENT EVENTS
          if (change.field === "comments") {

            const comment = change.value;

            console.log("📢 New Instagram Comment");
            console.log("Comment:", comment.text);

          }

          // DM MESSAGE EVENTS
          if (change.field === "messages") {

            const msg = change.value;

            const senderId = msg.sender?.id;
            const messageText = msg.message?.text;

            console.log("💬 New DM Received");
            console.log("Sender:", senderId);
            console.log("Message:", messageText);

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