import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmailWithCode = async (email, code) => {
  console.log("Preparing to send email to:", email);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // <-- More reliable than service: "gmail"
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // MUST be App Password
    },
    connectionTimeout: 600000, // 15 seconds
    greetingTimeout: 600000,
    socketTimeout: 600000,
  });

  console.log("Transporter options:", transporter.options);

  try {
    console.log("⏳ Verifying SMTP connection...");
    await transporter.verify();
    console.log("SMTP connection verified");

    const mailOptions = {
      from: `"Shopify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification Code",
      html: `<p>Your verification code is: <b>${code}</b></p>`,
    };

    console.log("Sending email...");

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return info;
  } catch (err) {
    console.error("Email send failed:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    throw err; // Re-throw so your API knows send failed
  }
};

export default sendEmailWithCode;
