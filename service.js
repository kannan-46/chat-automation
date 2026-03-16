import express from "express";
import bodyParser from "body-parser";
import webhookRoutes from "./routes/webhookRoutes.js";
import authRoutes from "./routes/authroutes.js";

const app = express();
app.use(bodyParser.json());

app.use("/webhook", webhookRoutes);
app.use("/auth", authRoutes);

app.get("/privacy", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Privacy Policy</title></head><body><h1>Privacy Policy</h1><p>This app accesses Instagram data solely for comment and message automation. No personal data is stored or shared with third parties.</p><h2>Data Deletion</h2><p>Contact abishekincrix@gmail.com to request data deletion.</p></body></html>`);
});

app.get("/deletion", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Data Deletion</title></head><body><h1>Data Deletion</h1><p>To request deletion of your data, contact abishekincrix@gmail.com. All data will be removed within 30 days.</p></body></html>`);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});