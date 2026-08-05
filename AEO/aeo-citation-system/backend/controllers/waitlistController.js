const Waitlist = require("../models/Waitlist");

async function joinWaitlist(req, res) {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    await Waitlist.updateOne(
      { email: email.toLowerCase() },
      { $setOnInsert: { email: email.toLowerCase(), source: "landing_page" } },
      { upsert: true }
    );

    res.status(201).json({ message: "You're on the list." });
  } catch (err) {
    console.error("joinWaitlist error:", err);
    res.status(500).json({ error: "Could not join the waitlist right now." });
  }
}

module.exports = { joinWaitlist };
