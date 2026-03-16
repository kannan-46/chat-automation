import axios from "axios";
import { APP_ID, APP_SECRET, REDIRECT_URI } from "../config/config.js";
import { setTokens } from "../config/tokenStore.js";

export const handleAuthCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No authorization code received");

  try {
    // STEP 1 — Exchange code for short-lived token
    const shortTokenRes = await axios.get(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        params: {
          client_id: APP_ID,
          client_secret: APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        },
      }
    );

    // STEP 2 — Convert to long-lived user token
    const longTokenRes = await axios.get(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: APP_ID,
          client_secret: APP_SECRET,
          fb_exchange_token: shortTokenRes.data.access_token,
        },
      }
    );

    const userToken = longTokenRes.data.access_token;

    // STEP 3 — Fetch Facebook pages linked to the user
    const fields = "name,access_token,instagram_business_account{id,username}";
    let pages = [];

    const pageRes = await axios.get(
      "https://graph.facebook.com/v18.0/me/accounts",
      {
        params: { access_token: userToken, fields },
      }
    );

    pages = pageRes.data.data || [];

    if (pages.length === 0) {
      const assignedRes = await axios.get(
        "https://graph.facebook.com/v18.0/me/assigned_pages",
        {
          params: { access_token: userToken, fields },
        }
      );

      pages = assignedRes.data.data || [];
    }

    const linkedPage = pages.find((p) => p.instagram_business_account);

    if (!linkedPage) {
      return res
        .status(404)
        .send("No Instagram Business account connected to a Facebook Page.");
    }

    const pageId = linkedPage.id;
    const pageAccessToken = linkedPage.access_token;
    const igId = linkedPage.instagram_business_account.id;
    const igUsername = linkedPage.instagram_business_account.username;

    // Save tokens so webhook controller can use them
    setTokens({ pageAccessToken, pageId, igUserId: igId, igUsername });



    // STEP 4 — Subscribe page to webhook events
      const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/subscribed_apps`,
      {},
      {
        params: {
            subscribed_fields: "messages,message_reactions,messaging_postbacks,feed",
          access_token: pageAccessToken
        }
      }
    );

    console.log(`Connected Instagram: @${igUsername}`);

    res.send(`
      <h2>Instagram Connected</h2>
      <p>Username: @${igUsername}</p>
      <p>Instagram ID: ${igId}</p>
    `);
  } catch (error) {
    console.error("OAuth error:", error.response?.data || error.message);
    res.status(500).send("Instagram connection failed");
  }
};


