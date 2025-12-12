import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  uid: String,       // optional but helpful
  email: String,
  password: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationCodeExpires: Date,
  isadmin: { type: Boolean, default: false }, // Admin flag
});

const User = mongoose.model("User", userSchema);
export default User;
