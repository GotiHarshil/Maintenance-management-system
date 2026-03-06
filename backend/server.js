require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");

// Import SLA cron job
require("./jobs/slaChecker");

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Initialize WebSocket
initSocket(server);

// Global Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "SOMMS API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/estimates", require("./routes/estimateRoutes"));
app.use("/api/work-logs", require("./routes/workLogRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/api/assets", require("./routes/assetRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SOMMS API running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

module.exports = app;
