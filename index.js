import express from "express";
import mongoose from "mongoose";
import ticketRoutes from "./routes/ticketRoutes.js";
import dotenv from "dotenv";
import mailerCron from "./cron/cron.js"; // <-- Add this import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

app.use(express.json());

// Ticket routes
app.use("/api/tickets", ticketRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(err.err && { errors: err.err }),
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    mailerCron(); // <-- Start the cron job here
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
