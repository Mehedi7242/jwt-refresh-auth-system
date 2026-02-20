import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "jimmie.wiza29@ethereal.email",
    pass: "4weHx4nCHFvextF75A",
  },
});

// Send an email using async/await
export const sendEmail = async () => {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: "mehedi2hasan7@gmail.com, mehedi2hasan7@gmail.com",
    subject: "Hello ✔",
    text: "Hello world?", // Plain-text version of the message
    html: "<b>Hello world?</b>", // HTML version of the message
  });

  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

}