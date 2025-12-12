import User from "../models/usermodel.js";
import Order from "../models/ordermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Contact from "../models/contactmodel.js";
import sendEmailWithCode from "../utils/sendEmail.js";
import Otp from "../models/otpmodel.js";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret";

const generateAccessToken = (User) =>
  jwt.sign({ id: User.id }, ACCESS_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (User) =>
  jwt.sign({ id: User.id }, REFRESH_SECRET, { expiresIn: "7d" });

const isProd = process.env.NODE_ENV === "production";
const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 15 * 60 * 1000,
  path: "/",
};
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

// ========================= SIGNUP - SEND OTP =========================
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      verified: false,
    });

    await sendEmailWithCode(email, otpCode);
    

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup error" });
  }
};

// ========================= VERIFY EMAIL & CREATE USER =========================
const verifyEmail = async (req, res) => {
  const { email, username, code, password } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) return res.status(400).json({ message: "OTP expired" });
    if (otpRecord.otp !== code) return res.status(400).json({ message: "Invalid OTP" });

    await Otp.deleteMany({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isUser: false,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie("access_token", accessToken, accessCookieOptions);
    res.cookie("refresh_token", refreshToken, refreshCookieOptions);

    return res.json({
      message: "Signup successful",
      username: newUser.username,
      email: newUser.email,
      isUser: newUser.isUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// ========================= LOGIN =========================
const login = async (req, res) => {
  const { email, password } = req.body;

  const found = await User.findOne({ email });
  if (!found) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, found.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(found);
  const refreshToken = generateRefreshToken(found);

  res.cookie("access_token", accessToken, accessCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshCookieOptions);

  res.json({
    message: "Logged in",
    username: found.username,
    email: found.email,
    isUser: found.isUser,
  });
};

// ========================= GOOGLE LOGIN =========================
const google = async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });

    if (existing) {
      const accessToken = generateAccessToken(existing);
      const refreshToken = generateRefreshToken(existing);

      res.cookie("access_token", accessToken, accessCookieOptions);
      res.cookie("refresh_token", refreshToken, refreshCookieOptions);

      return res.json({
        username: existing.username,
        email: existing.email,
        isUser: existing.isUser,
      });
    }

    const randomPass =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    const hashed = bcrypt.hashSync(randomPass, 10);

    const newUser = await User.create({
      username:
        req.body.name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-4),
      email: req.body.email,
      password: hashed,
      isUser: false,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie("access_token", accessToken, accessCookieOptions);
    res.cookie("refresh_token", refreshToken, refreshCookieOptions);

    res.json({
      username: newUser.username,
      email: newUser.email,
      isUser: newUser.isUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google login failed" });
  }
};

// ========================= LOGOUT =========================
const logOut = async (req, res) => {
  res.clearCookie("access_token", { ...accessCookieOptions, maxAge: 0 });
  res.clearCookie("refresh_token", { ...refreshCookieOptions, maxAge: 0 });

  res.json({ message: "Logged out" });
};

// ========================= REFRESH ACCESS TOKEN =========================
const refreshAccessToken = (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token)
    return res.status(403).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const newAccessToken = generateAccessToken({ id: decoded.id });

    res.cookie("access_token", newAccessToken, accessCookieOptions);
    res.json({ message: "Token refreshed" });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// ========================= PROFILE =========================
const profile = async (req, res) => {
  const user = await User.findById(req.user);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    username: user.username,
    email: user.email,
    isUser: user.isUser,
  });
};

// ========================= OTHER FUNCTIONS =========================
const getOrders = async (req, res) => {
  const o = await Order.find().sort({ createdAt: -1 });
  res.json(o);
};

const updateOrderStatus = async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ msg: "Status updated" });
};

const getOrderStats = async (req, res) => {
  const stats = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  res.json(stats);
};

const saveContact = async (req, res) => {
  try {
    await Contact.create(req.body);
    res.status(201).json("Contact saved successfully");
  } catch (err) {
    console.error(err);
    res.status(400).json("Saving failed");
  }
};

const listAllUsers = async (req, res) => {
  const users = await User.find({}, "username email isUser");
  res.json(users);
};

// ========================= EXPORTS =========================
export default {
  signup,
  verifyEmail,
  login,
  google,
  logOut,
  refreshAccessToken,
  profile,
  getOrders,
  updateOrderStatus,
  getOrderStats,
  saveContact,
  listAllUsers,
};
