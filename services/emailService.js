import nodemailer from "nodemailer";

export const mailer = (userId, password, mailData) => {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: userId,
      pass: password,
    },
  });
};
