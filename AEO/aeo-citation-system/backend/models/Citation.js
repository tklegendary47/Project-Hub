const mongoose = require("mongoose");

const ENGINES = ["chatgpt", "perplexity", "gemini", "claude", "google_ai"];

const diagnosticSchema = new mongoose.Schema(
  {
    reason: { type: String }, // plain-English reason the site wasn't mentioned
    suggestedFixes: [{ type: String }],
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    resolved: { type: Boolean, default: false },
  },
  { _id: false }
);

const citationSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true, index: true },
    engine: { type: String, enum: ENGINES, required: true },
    promptUsed: { type: String, required: true },
    mentioned: { type: Boolean, required: true },
    checkedAt: { type: Date, default: Date.now },
    diagnostic: diagnosticSchema, // present only when mentioned === false
  },
  { timestamps: true }
);

citationSchema.index({ website: 1, engine: 1, checkedAt: -1 });

citationSchema.statics.ENGINES = ENGINES;

module.exports = mongoose.model("Citation", citationSchema);
