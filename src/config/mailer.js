// src/config/mailer.js
const nodemailer = require("nodemailer");

const createTransporter = () => {
  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    console.warn("Mailer not fully configured in env; emails may fail");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

module.exports = createTransporter;
