import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const sendEmail = async (options: {
  email: any;
  subject: any;
  message: any;
}) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as SMTPTransport.Options);

  // Define email otions

  const mailOptions = {
    from: "Odizee <odizeeplatform@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.message,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
