import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmailWithCode = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"NanoSemic" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification Code",
    html: `<p>Your verification code is: <b>${code}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmailWithCode;
