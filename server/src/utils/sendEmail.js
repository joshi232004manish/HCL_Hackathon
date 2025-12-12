import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmailWithCode = async (email, code) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use APP PASSWORD
    },
  });

  const mailOptions = {
    from: `"Verification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification Code",
    html: `<p>Your verification code is: <b>${code}</b></p>`,
  };

  return await transporter.sendMail(mailOptions);
};

export default sendEmailWithCode;
