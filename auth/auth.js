import jwt from 'jsonwebtoken';
import 'dotenv/config';
import crypto from "crypto";

// Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  // user = { email: "...", role: "..." }
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '5m', algorithm: 'HS256' }
  );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      jti: crypto.randomUUID() // unique token id
    },
    process.env.JWT_SECRET_REFRESH, // separate secret for refresh token
    { expiresIn: '7d', algorithm: 'HS256' }
  );
};

// const authenticationToken = (req, res, next) => {
//   console.log("auth middleware")

//   const token = req.headers.cookie?.split("=")[1];
//   console.log(token)
//   if (!token) {
//     return res.status(401).json({ message: "Access token not found" });
//   }
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: "Invalid access token" });
//     }
//     req.user = decoded;
//       next();
//   })
// }

const authenticationToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token not found" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired access token" });
    }

    req.user = decoded;
    console.log("Authenticated user:", req.user);
    next();
  });
};

export { generateAccessToken, generateRefreshToken, authenticationToken };

