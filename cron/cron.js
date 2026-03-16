import nodeCron from "node-cron";
import path from "node:path";
import ticketNotification from "../models/ticketNotification.js";
import { mailer } from "../services/emailService.js";

const mailerCron = () => {
  const mailerInstance = mailer(process.env.EMAIL, process.env.EMAIL_PASS);
  nodeCron.schedule("*/2 * * * *", async () => {
    console.log("Executing cron Again");
    const notificationToBeSent = await ticketNotification.find({
      status: "PENDING",
    });
    notificationToBeSent.forEach((notification) => {
      const logoPath = (process.env.MAIL_LOGO_PATH || "").trim();
      const inlineLogoAttachments = logoPath
        ? [
            {
              filename: path.basename(logoPath),
              path: logoPath,
              cid: "cinexa-logo@cinexa.mail",
              contentDisposition: "inline",
              contentType: "image/png",
            },
          ]
        : [];

      const logoSrcMatch = notification.html?.match(/<img[^>]+src=\"([^\"]+)\"/i);
      const logoSrc = logoSrcMatch?.[1] || null;

      const mailData = {
        from: "mba@support.com",
        to: notification.recepientEmails,
        subject: notification.subject,
        text: notification.content,
        html: notification.html || undefined,
        attachments: inlineLogoAttachments,
      };
      mailerInstance.sendMail(mailData, async (err, data) => {
        console.log("Attempting to send mail to:", mailData.to);
        console.log("Mail subject:", mailData.subject);
        console.log("Using HTML template:", Boolean(mailData.html));
        console.log("Using inline logo attachment:", inlineLogoAttachments.length > 0);
        console.log("Logo src in html:", logoSrc);
        if (err) {
          console.log("Error sending mail:", err);
        } else {
          console.log("Mail sent successfully:", data);
          const savedNotification = await ticketNotification.findOne({
            _id: notification._id,
          });
          if (savedNotification) {
            savedNotification.status = "SUCCESS";
            await savedNotification.save();
          } else {
            console.log("Notification not found:", notification._id);
          }
        }
      });
    });
  });
};

export default mailerCron;
