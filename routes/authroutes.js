import express from "express";
import { APP_ID, REDIRECT_URI } from '../config/config.js';
import { handleAuthCallback } from "../controllers/authController.js";

const router = express.Router();
const CONFIG_ID = "893503463674282";
router.get("/login", (req, res) => {
    // The "Old Way" requires these Facebook-centric scopes
    const scopes = [
"public_profile",
"pages_show_list",
"pages_read_engagement",
"pages_manage_metadata",
"instagram_basic",
"instagram_manage_messages",
"instagram_manage_comments",
"business_management"
].join(",");

    // NOTE: We use facebook.com/v18.0/dialog/oauth
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth` +
        `?client_id=${APP_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=${scopes}` +
       
        `&auth_type=rerequest`; // Forces Meta to ask for missing permissions

    console.log("🔗 Redirecting via Facebook Login Flow...");
    res.redirect(authUrl);
});

router.get("/callback", handleAuthCallback);

export default router;