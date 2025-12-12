import Admin from "../models/usermodel.js";
import Order from "../models/ordermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Contact from "../models/contactmodel.js";
import sendEmailWithCode from "../utils/sendEmail.js";
import Otp from "../models/otpmodel.js";
import redisClient from "../../config/redisClient.js";
import { randomUUID } from "crypto";


const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret";

const generateAccessToken = (admin) =>
  jwt.sign({ id: admin.id }, ACCESS_SECRET, { expiresIn: "15m" });
4
const generateRefreshToken = (admin) =>
  jwt.sign({ id: admin.id }, REFRESH_SECRET, { expiresIn: "7d" });

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

const REFRESH_TTL = 7 * 24 * 60 * 60;
const tokenSetKey = (userId) => `userTokens:${userId}`;
const tokenKey = (userId, tokenId) => `refresh:${userId}:${tokenId}`;
const otpKey = (email) => `otp:${email}`;

const addRefreshToken = async (userId, token) => {
  const id = randomUUID();
  await redisClient.sadd(tokenSetKey(userId), id);
  await redisClient.expire(tokenSetKey(userId), REFRESH_TTL);
  await redisClient.set(tokenKey(userId, id), token, { EX: REFRESH_TTL });
  return id;
};


const removeRefreshToken = async (userId, tokenId) => {
  await redisClient.srem(tokenSetKey(userId), tokenId);
  await redisClient.del(tokenKey(userId, tokenId));
};

const hasRefreshToken = async (userId, token, tokenId) => {
  const isMember = await redisClient.sismember(tokenSetKey(userId), tokenId);
  if (!(isMember === 1 || isMember === true)) return false;
  const val = await redisClient.get(tokenKey(userId, tokenId));
  return val === token;
};


const blacklistToken = async (token, id) => {
  if (!token) return;
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return;

  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redisClient.set(`blacklist:${token}`, "true", { EX: ttl }); // 7 days
  }
};



// ========================= SIGNUP (OTP Step 1) =========================
const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const otpRecord = new Otp({
      email,
      otp: verificationCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      verified: false,
    });

    await otpRecord.save();
    // await redisClient.set(otpKey(email), verificationCode, { EX: 10 * 60 });
    await sendEmailWithCode(email, verificationCode);
    return res
      .status(200)
      .json({ message: "Verification code sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup." });
  }
};

// ========================= VERIFY EMAIL & CREATE ADMIN (OTP Step 2) =========================
const verifyEmail = async (req, res) => {
  const { email, username, code, password } = req.body;
  try {
    if (!email || !username || !code || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const storedCode = await redisClient.get(otpKey(email));
    if (!storedCode)
      return res.status(400).json({ message: "No OTP found for this email." });
    if (storedCode !== code)
      return res.status(400).json({ message: "Invalid OTP." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Admin({
      username,
      email,
      password: hashedPassword,
      isadmin: false,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    const refreshId = await addRefreshToken(newUser.id, refreshToken);
    await redisClient.del(otpKey(email));

    res.cookie("access_token", accessToken, accessCookieOptions);
    res.cookie("refresh_token", refreshToken, refreshCookieOptions);
    res.cookie("refresh_id", refreshId, refreshCookieOptions);

    res.json({
      message: "Signup successful",
      username: newUser.username,
      email: newUser.email,
      isadmin: newUser.isadmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying email." });
  }
};

// ========================= LOGIN =========================
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
  console.log("Admin logged in:", admin.id);
  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  const refreshId = await addRefreshToken(admin.id, refreshToken);

  res.cookie("access_token", accessToken, accessCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshCookieOptions);
  res.cookie("refresh_id", refreshId, refreshCookieOptions);

  res.json({
    message: "Logged in",
    username: admin.username,
    email: admin.email,
    isadmin: admin.isadmin,
  });
};

// ========================= GOOGLE LOGIN =========================
const google = async (req, res) => {
  try {
    const validUser = await Admin.findOne({ email: req.body.email });

    if (validUser) {
      const { password: pass, ...rest } = validUser._doc;
      const accessToken = generateAccessToken(validUser);
      const refreshToken = generateRefreshToken(validUser);

      const refreshId = await addRefreshToken(validUser.id, refreshToken);

      res.cookie("access_token", accessToken, accessCookieOptions);
      res.cookie("refresh_token", refreshToken, refreshCookieOptions);
      res.cookie("refresh_id", refreshId, refreshCookieOptions);

      return res.json(rest);
    }

    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

    const newUser = new Admin({
      username:
        req.body.name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-4),
      email: req.body.email,
      password: hashedPassword,
      isadmin: false,
    });

    await newUser.save();
    const { password: pass, ...rest } = newUser._doc;

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    const refreshId = await addRefreshToken(newUser.id, refreshToken);

    res.cookie("access_token", accessToken, accessCookieOptions);
    res.cookie("refresh_token", refreshToken, refreshCookieOptions);
    res.cookie("refresh_id", refreshId, refreshCookieOptions);

    res.json({
      username: rest.username,
      email: rest.email,
      isadmin: rest.isadmin,
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};

// ========================= LOGOUT =========================

const logOutAllDevices = async (req, res) => {
  try {
    const userId = req.user; // assume user is authenticated and req.user contains userId
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    const refreshId = req.cookies.refresh_id;
    // Save blacklist timestamp for user
    await redisClient.set(`blacklist:user:${userId}`, now.toString());
    const ids = await redisClient.smembers(tokenSetKey(userId));
    if (ids.length) {
      const keys = ids.map((id) => tokenKey(userId, id));
      await redisClient.del(...keys);
      await redisClient.del(tokenSetKey(userId));
    }

    // Clear cookies
    res.clearCookie("access_token", { ...accessCookieOptions, maxAge: 0 });
    res.clearCookie("refresh_token", { ...refreshCookieOptions, maxAge: 0 });

    res.json({ message: "Logged out from all devices" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Logout failed" });
  }
};

const logOut = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    const refreshId = req.cookies.refresh_id;

    // await blacklistToken(accessToken);

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        if (refreshId) {
          await removeRefreshToken(decoded.id, refreshId);
        }
      } catch (err) {
        console.error("Invalid refresh token on logout:", err.message);
      }
    }

    res.clearCookie("access_token", { ...accessCookieOptions, maxAge: 0 });
    res.clearCookie("refresh_token", { ...refreshCookieOptions, maxAge: 0 });

    res.json({ message: "Logged out" });
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

// ========================= REFRESH TOKEN =========================
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  const refreshId = req.cookies.refresh_id;
  if (!refreshToken)
    return res.status(403).json({ message: "No refresh token" });

  // const blacklisted = await isTokenBlacklisted(refreshToken);
  // if (blacklisted) return res.status(403).json({ message: "Refresh token revoked" });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const valid = refreshId && (await hasRefreshToken(decoded.id, refreshToken, refreshId));

    if (!valid) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({ id: decoded.id });
    // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.id;
    // Check blacklist
    const blacklistTimestampStr = await redisClient.get(
      `blacklist:user:${decoded.id}`
    );
    if (blacklistTimestampStr) {
      const blacklistTimestamp = parseInt(blacklistTimestampStr, 10);

      // Token issued before blacklist time → invalid
      if (decoded.iat < blacklistTimestamp) {
        res.cookie("access_token", "", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 0, // expire immediately
        });

        res.cookie("refresh_token", "", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 0,
        });

        return res
          .status(401)
          .json({ message: "Session expired", forceLogout: true });
      }
    }
    res.cookie("access_token", newAccessToken, accessCookieOptions);

    res.json({ message: "Access token refreshed" });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// ========================= PROTECTED PROFILE =========================
const profile = async (req, res) => {
  try {
    const user = await Admin.findById(req.user);
    console.log(user);
    if (!user) return res.status(404).json({ message: "Admin not found" });

    res.json({
      username: user.username,
      email: user.email,
      isadmin: user.isadmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ========================= OTHER ADMIN FUNCTIONS =========================
const getOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.status(201).json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Order.findByIdAndUpdate(id, { status });
  res.json({ msg: "Status updated" });
};

const getOrderStats = async (req, res) => {
  const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
  const stats = await Order.aggregate(pipeline);
  res.json(stats);
};

const saveContact = async (req, res) => {
  const { email, name, mobile, message } = req.body;
  try {
    const newContact = new Contact({ email, name, mobile, message });
    await newContact.save();
    res.status(201).json("Contact saved successfully");
  } catch (error) {
    console.log("Error saving contact:", error);
    res.status(401).json("Error saving contact");
  }
};

const grantAdminAccess = async (req, res, next) => {
  const { email } = req.body;
  try {
    const requestingUser = await Admin.findById(req.user);
    if (!requestingUser || !requestingUser.isadmin) {
      return res
        .status(403)
        .json({ message: "Only admins can grant admin access." });
    }
    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isadmin = true;
    await user.save();

    res.status(200).json({ message: `${email} is now an admin.` });
  } catch (error) {
    next(error);
  }
};

const revokeAdminAccess = async (req, res, next) => {
  const { email } = req.body;
  try {
    const requestingUser = await Admin.findById(req.user);
    if (!requestingUser || !requestingUser.isadmin) {
      return res
        .status(403)
        .json({ message: "Only admins can revoke admin access." });
    }
    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isadmin = false;
    await user.save();

    res.status(200).json({ message: `${email} is no longer an admin.` });
  } catch (error) {
    next(error);
  }
};

const listAllUsers = async (req, res, next) => {
  try {
    const requestingUser = await Admin.findById(req.user);
    if (!requestingUser || !requestingUser.isadmin) {
      return res.status(403).json({ message: "Only admins can view users." });
    }
    const users = await Admin.find({}, "username email isadmin");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
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
  logOutAllDevices,
  updateOrderStatus,
  getOrderStats,
  saveContact,
  grantAdminAccess,
  revokeAdminAccess,
  listAllUsers,
};
