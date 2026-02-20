import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  // user = { username: "...", role: "..." }
  return jwt.sign(
    {
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '5min', algorithm: 'HS256' }
  );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      role: user.role,
      jti: crypto.randomUUID() // unique token id
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );
};

const authenticationToken = (req, res, next) => {
  console.log("auth middleware")
  const token = req.headers.cookie?.split("=")[1];
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "Access token not found" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid access token" });
    }
    req.user = decoded;
      next();
  })
}

export { generateAccessToken, generateRefreshToken, authenticationToken };

