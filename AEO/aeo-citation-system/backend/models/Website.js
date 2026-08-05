const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    domain: { type: String, required: true, trim: true, lowercase: true },
    displayName: { type: String, trim: true },
    // The set of prompts Beacon checks this site against — e.g.
    // "best e-commerce site in Lagos". Populated during onboarding
    // from the business category + location the user provides.
    trackedPrompts: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

websiteSchema.index({ owner: 1, domain: 1 }, { unique: true });

module.exports = mongoose.model("Website", websiteSchema);
