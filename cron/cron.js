import nodeCron from "node-cron";
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
      const mailData = {
        from: "mba@support.com",
        to: notification.recepientEmails,
        subject: notification.subject,
        text: notification.content,
      };
      mailerInstance.sendMail(mailData, async (err, data) => {
        console.log("Attempting to send mail to:", mailData.to);
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
