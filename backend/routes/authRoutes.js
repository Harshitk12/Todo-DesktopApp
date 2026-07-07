import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "dev_secret_change_me", {
    expiresIn: "7d",
  });
}

router.post("/signup", async (req, res) => {
  try {
    const username = req.body.username?.trim().toLowerCase();
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: "Password must be 4+ characters" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    const token = createToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const username = req.body.username?.trim().toLowerCase();
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid login details" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid login details" });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
