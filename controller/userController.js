import { generateAccessToken, generateRefreshToken } from "../auth/auth.js";
import { User } from "../db/dbconnection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mailer.js";
import { generateOTP } from "../utils/otpGenerator.js";

// ---------------------- LOGIN ----------------------
export const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken({ email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ email: user.email, role: user.role });

    // Save refresh token and send cookie
    await user.update({ refreshToken });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    return res.status(200).json({
      message: "User logged in",
      userData: {
        email: user.email,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------- REGISTER ----------------------
export const registerController = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const existUser = await User.findOne({ where: { email } });
    if (existUser) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashedPassword, role: "user" });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------- REFRESH TOKEN ----------------------
export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token not found" });

    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const user = await User.findOne({ where: { refreshToken } });
      if (!user) return res.status(403).json({ message: "User not found" });

      const newAccessToken = generateAccessToken({ email: user.email, role: user.role });
      return res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------- LOGOUT ----------------------
export const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(204).json({ message: "Already logged out" });

    const user = await User.findOne({ where: { refreshToken } });
    if (user) await user.update({ refreshToken: null });

    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------- PROFILE ----------------------
export const profileController = async (req, res) => {
  return res.json({ message: "This is a protected profile route", user: req.user });
};



// ---------------------- FORGOT PASSWORD ----------------------

export const requestPasswordReset = async (req, res) => { 
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return success message to avoid revealing if email exists
    if (!user) 
      return res.status(200).json({ message: "If email exists, OTP has been sent" });

    // --- OTP Abuse Protection ---
    const now = new Date();

    // Reset limit if last request was more than 1 hour ago
    if (!user.lastOTPRequest || (now - user.lastOTPRequest) > 60 * 60 * 1000) {
      user.resetOTPLimit = 0;
    }

    // Check if user exceeded OTP requests
    if (user.resetOTPLimit >= 5) {
      return res.status(429).json({ message: "Too many OTP requests. Try again later." });
    }

    // Generate new OTP and expiry
    const otp = generateOTP(6);
    const otpExpiry = new Date(now.getTime() + 1 * 60 * 1000); // 10 min

    // Update user with OTP, expiry, increment limit, and last request time
    await user.update({
      resetOTP: otp,
      resetOTPExpiry: otpExpiry,
      resetOTPLimit: user.resetOTPLimit + 1,
      lastOTPRequest: now,
    });

    // Send OTP via email
    await sendEmail(user.email, otp);

    return res.status(200).json({ message: "If email exists, OTP has been sent" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------- RESET PASSWORD ----------------------

export const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 1️⃣ Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // 2️⃣ Check if OTP matches and is not expired
    if (!user.resetOTP || user.resetOTP !== otp || !user.resetOTPExpiry || user.resetOTPExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update user password and clear OTP fields + reset limit
    await user.update({
      password: hashedPassword,
      resetOTP: null,
      resetOTPExpiry: null,
      resetOTPLimit: 0,
      lastOTPRequest: null,
    });

    return res.status(200).json({ message: "Password has been reset successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};