/**
 * server.js — Express app entry point
 * Connects to MongoDB, registers routes, starts listening
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

console.log(
  "DEBUG: STRIPE_SECRET_KEY is",
  process.env.STRIPE_SECRET_KEY ? "DEFINED" : "MISSING",
);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ─── Route imports ────────────────────────────────────────
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");

const app = express();

// ─── Middleware ───────────────────────────────────────────
// Stripe webhooks need raw body — register BEFORE express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// ─── Health check ─────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// ─── Global error handler ─────────────────────────────────


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ─── Database + Server start ──────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
