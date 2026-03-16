import 'dotenv/config';

export const PORT = process.env.PORT || 3000;
export const APP_ID = process.env.FACEBOOK_APP_ID;
export const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
export const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Use your current ngrok URL. 
// Note: This must match exactly what you put in the Meta Dashboard "Valid OAuth Redirect URIs"
export const REDIRECT_URI = process.env.REDIRECT_URI;

export const META_GRAPH_URL = process.env.META_GRAPH_URL;

console.log("APP_ID:", APP_ID);
console.log("APP_SECRET:", APP_SECRET);