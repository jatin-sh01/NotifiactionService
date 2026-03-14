import express from "express";
import {
  createTicket,
  getTicket,
  getAllTicket,
} from "../controller/ticketController.js";
import verifyTicketNotificationCreateRequest from "../middleware/ticket.middlewares.js";

const router = express.Router();

// Create a new ticket with validation middleware
router.post("/", verifyTicketNotificationCreateRequest, createTicket);

// Get a ticket by ID
router.get("/:id", getTicket);

// Get all tickets
router.get("/", getAllTicket);

export default router;
