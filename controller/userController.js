import { generateAccessToken, generateRefreshToken } from "../auth/auth.js";
import { User } from "../db/dbconnection.js";
import bcrypt from "bcryptjs";
import  jwt  from "jsonwebtoken";


// Login Controller
// Handles user authentication and token generation

export const loginController = async (req, res) => {

  // Extract username and password from request body
  const { username, password } = req.body;

  try {

    // Check if user exists in database
    const exist = await User.findOne({ where: { username } });

    // If user not found → return unauthorized
    if (!exist) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare entered password with hashed password in database
    const isValid = await bcrypt.compare(password, exist.password);

    // If password does not match → return unauthorized
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT access token (short-lived)
    const accessToken = generateAccessToken({
      username: exist.username,
      role: exist.role
    });

    // Generate JWT refresh token (long-lived)
    const refreshToken = generateRefreshToken({
      username: exist.username,
      role: exist.role
    });

    // Save refresh token in database (for token rotation / logout security)
    await exist.update({refreshToken:refreshToken });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    // Send success response with tokens
        return res.status(200).json({
        message: "User logged in",
        userData: {
            username: exist.username,
            accessToken,
            // refreshToken
        }
        });

  } catch (error) {

    //  Handle unexpected server errors
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const registerController = async (req, res) => {

  // Extract user data from request body
  const { username, password, email } = req.body;

  try {

    // Basic validation (prevent empty fields)
    if (!username || !password || !email) {
      return res.status(400).json({ 
        message: "Username, email and password are required" 
      });
    }

    // Check if username OR email already exists
    const existUser = await User.findOne({
      where: { username }
    });

    if (existUser) {
      return res.status(409).json({ 
        message: "User already exists" 
      });
    }

    // Hash password before saving (never store plain password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create new user in database
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role:"user" // default role
    });

    // Send success response (never return password)
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {

    // Handle unexpected server errors
    console.error("Register Error:", error);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};


export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Check if token exists in DB
      const user = await User.findOne({
        where: { refreshToken:refreshToken }
      });

      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        username: user.username,
        role: user.role
      });

      return res.status(200).json({
        accessToken: newAccessToken
      });
    });

  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // If no refresh token exists
    if (!refreshToken) {
      return res.status(204).json({ message: "Already logged out" });
    }

    // Find user with this refresh token
    const user = await User.findOne({
      where: { refreshToken }
    });

    if (user) {
      // Remove refresh token from database
      await user.update({ refreshToken: null });
    }

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true 
    });
    console.log("User logged out successfully");
    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};



export const profileController =  async(req, res) =>{
  return res.json("profile")
}


export const forgotPasswordController  = async (req, res) => {
  try {
    const {email} =  req.body;
    console.log(email)
    const exist = await User.findOne({where: {email:email}})
    if(!exist) {
      return res.status(401).json({message:"invalid credentials"})
    }
    return res.status(200).json({message:"code send to your email"})

  } catch (error) {
    console.log(error)
    return res.status(500).json("not good")
  }
}
