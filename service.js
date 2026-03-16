import express from "express";
import bodyParser from "body-parser";
import webhookRoutes from "./routes/webhookRoutes.js";
import authRoutes from "./routes/authroutes.js";

const app = express();
app.use(bodyParser.json());

app.use("/webhook", webhookRoutes);
app.use("/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 3000");
});