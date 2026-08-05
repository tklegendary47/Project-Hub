const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function register(req, res) {
  try {
    const { name, email, password, businessName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash, businessName });

    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Something went wrong creating your account." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Something went wrong logging you in." });
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
