import createHttpError from "http-errors";

const verifyTicketNotificationCreateRequest = async (req, res, next) => {
  if (!req.body.subject) {
    return next(createHttpError(400, "No subject given for the email"));
  }
  if (!req.body.content) {
    return next(createHttpError(400, "No content given for the email"));
  }
  if (
    !req.body.recepientEmails ||
    !Array.isArray(req.body.recepientEmails) ||
    req.body.recepientEmails.length <= 0
  ) {
    return next(createHttpError(400, "No recepitent emails given"));
  }
  next();
};

export default verifyTicketNotificationCreateRequest;
