import mongoose from "mongoose";

const ticketNotificationSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    recepientEmails: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["SUCCESS", "PENDING", "FAILED"],
        message: "invalid ticket status",
      },
      default: "PENDING",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("TicketNotification", ticketNotificationSchema);
