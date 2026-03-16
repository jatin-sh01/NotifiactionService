import nodeCron from "node-cron";
import path from "node:path";
import ticketNotification from "../models/ticketNotification.js";
import { mailer } from "../services/emailService.js";

const BRAND_NAME = process.env.MAIL_BRAND_NAME || "CINEXA";
const BRAND_PRIMARY_COLOR = process.env.MAIL_PRIMARY_COLOR || "#e11d48";
const BRAND_BG_COLOR = process.env.MAIL_BG_COLOR || "#f8fafc";
const BRAND_LOGO_SRC =
  process.env.MAIL_LOGO_URL ||
  process.env.MAIL_LOGO_CID ||
  "cid:cinexa-logo@cinexa.mail";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textToHtmlParagraphs(text = "") {
  return String(text)
    .split("\n")
    .filter(Boolean)
    .map((line) => `<p style=\"margin:0 0 12px 0;\">${escapeHtml(line)}</p>`)
    .join("");
}

function buildFallbackHtml(notification) {
  const subject = escapeHtml(notification.subject || "Notification");
  const bodyHtml = textToHtmlParagraphs(notification.content || "");

  return `
  <html>
    <body style=\"margin:0;padding:0;background:${BRAND_BG_COLOR};font-family:Segoe UI,Arial,sans-serif;color:#111827;\">
      <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding:20px 12px;\">
        <tr>
          <td align=\"center\">
            <table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;\">
              <tr>
                <td style=\"padding:20px 24px;border-bottom:1px solid #e5e7eb;\">
                  <img src=\"${escapeHtml(BRAND_LOGO_SRC)}\" alt=\"${escapeHtml(BRAND_NAME)}\" style=\"height:36px;display:block;\" />
                </td>
              </tr>
              <tr>
                <td style=\"padding:24px;\">
                  <h1 style=\"margin:0 0 12px 0;font-size:20px;line-height:1.3;\">${subject}</h1>
                  <div style=\"font-size:14px;line-height:1.6;color:#374151;\">${bodyHtml}</div>
                </td>
              </tr>
              <tr>
                <td style=\"padding:18px 24px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:1.5;\">
                  Need help? Contact support@cinexa.com
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

const mailerCron = () => {
  const mailerInstance = mailer(process.env.EMAIL, process.env.EMAIL_PASS);
  nodeCron.schedule("*/2 * * * *", async () => {
    console.log("Executing cron Again");
    const notificationToBeSent = await ticketNotification.find({
      status: "PENDING",
    });
    notificationToBeSent.forEach((notification) => {
      const logoPath = (process.env.MAIL_LOGO_PATH || "").trim();
      const htmlBody = notification.html || buildFallbackHtml(notification);
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
      const logoSrc = logoSrcMatch?.[1] || BRAND_LOGO_SRC;

      const mailData = {
        from: "mba@support.com",
        to: notification.recepientEmails,
        subject: notification.subject,
        text: notification.content,
        html: htmlBody,
        attachments: inlineLogoAttachments,
      };
      mailerInstance.sendMail(mailData, async (err, data) => {
        console.log("Attempting to send mail to:", mailData.to);
        console.log("Mail subject:", mailData.subject);
        console.log("Using HTML template:", Boolean(mailData.html));
        console.log("Using fallback html:", !notification.html);
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
