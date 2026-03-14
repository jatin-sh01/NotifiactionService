import ticketNotification from "../models/ticketNotification.js";
import createHttpError from "http-errors";

const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketNotification.create(req.body);
    if (!ticket) {
      return next(createHttpError(404, "No ticket found with this id "));
    }
    res.status(200).json({
      success: true,
      message: "ticket created successfuly",
      data: ticket,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      let errObj = {};
      Object.keys(error.errors).forEach((key) => {
        errObj[key] = error.errors[key].message;
      });
      return next(createHttpError(400, "Validation Error", { err: errObj }));
    }
    return next(createHttpError(500, "Error while creating ticket"));
  }
};

const getTicket = async (req, res, next) => {
  try {
    const ticket = await ticketNotification.findById(req.params.id);
    if (!ticket) {
      return next(createHttpError(404, "Ticket not found with this id"));
    }
    res.status(200).json({
      success: true,
      message: "ticket found succsesfully",
      data: ticket,
    });
  } catch (error) {
    console.error("ticket not found", error);
    return next(createHttpError(500, "error while getting ticket"));
  }
};
const getAllTicket = async (req, res, next) => {
  try {
    const ticket = await ticketNotification.find();
    if (ticket.length === 0) {
      return next(createHttpError(404, "No tickets found"));
    }
    res.status(200).json({
      success: true,
      message: "Tickets found successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error while getting tickets", error);
    return next(createHttpError(500, "Error while getting tickets"));
  }
};
export { createTicket, getTicket, getAllTicket };
