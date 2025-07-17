import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("🔥 authMiddleware error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }
    return res.status(500).json({ success: false, error: "Server error in authentication" });
  }
};

export default verifyUser;