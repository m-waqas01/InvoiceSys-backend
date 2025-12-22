// src/utils/sendInvoiceMail.js
const createTransporter = require("../config/mailer");

const sendInvoiceMail = async ({ to, subject, text, attachments = [] }) => {
  const transporter = createTransporter();
  const from =
    process.env.MAIL_FROM || `"Invoice System" <noreply@example.com>`;

  const mailOptions = {
    from,
    to,
    subject,
    text,
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendInvoiceMail;
