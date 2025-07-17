import User from "../models/User.js";
import bcrypt from "bcrypt";

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // ✅ Fetch full user with password
    const user = await User.findById(userId).select("+password"); // 👈 force include password

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Wrong old password" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: "New and confirm password do not match" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log("🔥 CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ success: false, error: "Setting error" });
  }
};

