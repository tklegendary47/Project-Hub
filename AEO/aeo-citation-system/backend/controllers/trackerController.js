const Website = require("../models/Website");
const Citation = require("../models/Citation");
const { checkMention } = require("../utils/mockAIChecker");

const DEFAULT_PROMPTS = [
  "best option in {category} near {location}",
  "is {domain} legitimate and reliable",
  "where can I buy {category} online in {location}",
];

async function addWebsite(req, res) {
  try {
    const { domain, displayName, category, location } = req.body;
    if (!domain) {
      return res.status(400).json({ error: "domain is required." });
    }

    const prompts = DEFAULT_PROMPTS.map((p) =>
      p
        .replace("{category}", category || "this category")
        .replace("{location}", location || "your area")
        .replace("{domain}", domain)
    );

    const website = await Website.create({
      owner: req.user._id,
      domain: domain.toLowerCase(),
      displayName: displayName || domain,
      trackedPrompts: prompts,
    });

    res.status(201).json({ website });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "You're already tracking this domain." });
    }
    console.error("addWebsite error:", err);
    res.status(500).json({ error: "Could not add website." });
  }
}

async function listWebsites(req, res) {
  const websites = await Website.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ websites });
}

/**
 * Runs a fresh check across all 5 engines for every tracked prompt
 * on a website, and stores the results as Citation documents.
 * In production this would be triggered by a daily scheduled job
 * (e.g. node-cron or a hosted cron trigger) rather than only on demand.
 */
async function runCheck(req, res) {
  try {
    const { websiteId } = req.params;
    const website = await Website.findOne({ _id: websiteId, owner: req.user._id });
    if (!website) {
      return res.status(404).json({ error: "Website not found." });
    }

    const engines = Citation.ENGINES;
    const results = [];

    for (const engine of engines) {
      const prompt = website.trackedPrompts[0] || `best option for ${website.domain}`;
      const outcome = await checkMention(website.domain, engine, prompt);
      const citation = await Citation.create({
        website: website._id,
        engine,
        promptUsed: prompt,
        mentioned: outcome.mentioned,
        diagnostic: outcome.diagnostic,
      });
      results.push(citation);
    }

    res.json({ results });
  } catch (err) {
    console.error("runCheck error:", err);
    res.status(500).json({ error: "Could not complete the check." });
  }
}

/**
 * Aggregates recent mention history per engine for a website (not just
 * the single latest check — a rolling rate over the last 10 checks per
 * engine, so the dashboard shows a meaningful percentage), plus open
 * (unresolved) diagnostics — this is what the dashboard reads.
 */
async function getDashboard(req, res) {
  try {
    const { websiteId } = req.params;
    const website = await Website.findOne({ _id: websiteId, owner: req.user._id });
    if (!website) {
      return res.status(404).json({ error: "Website not found." });
    }

    const engines = Citation.ENGINES;
    const engineStats = {};
    let anyChecksYet = false;

    for (const engine of engines) {
      const recent = await Citation.find({ website: website._id, engine })
        .sort({ checkedAt: -1 })
        .limit(10);

      if (recent.length > 0) anyChecksYet = true;

      const rate = recent.length
        ? Math.round((recent.filter((c) => c.mentioned).length / recent.length) * 100)
        : 0;

      engineStats[engine] = {
        rate,
        checksCount: recent.length,
        latest: recent[0] || null,
      };
    }

    const engineRates = Object.values(engineStats).map((e) => e.rate);
    const overallMentionRate = engineRates.length
      ? Math.round(engineRates.reduce((a, b) => a + b, 0) / engineRates.length)
      : 0;
    const enginesCitingCount = Object.values(engineStats).filter(
      (e) => e.latest && e.latest.mentioned
    ).length;

    const openDiagnostics = await Citation.find({
      website: website._id,
      mentioned: false,
      "diagnostic.resolved": false,
    }).sort({ checkedAt: -1 });

    res.json({
      website,
      hasRunFirstCheck: anyChecksYet,
      overallMentionRate,
      enginesCiting: `${enginesCitingCount}/${engines.length}`,
      engineStats,
      openDiagnostics,
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    res.status(500).json({ error: "Could not load dashboard data." });
  }
}

async function resolveDiagnostic(req, res) {
  try {
    const { citationId } = req.params;
    const citation = await Citation.findById(citationId).populate("website");
    if (!citation || String(citation.website.owner) !== String(req.user._id)) {
      return res.status(404).json({ error: "Not found." });
    }
    if (!citation.diagnostic) {
      return res.status(400).json({ error: "This citation has no open diagnostic." });
    }
    citation.diagnostic.resolved = true;
    await citation.save();
    res.json({ citation });
  } catch (err) {
    console.error("resolveDiagnostic error:", err);
    res.status(500).json({ error: "Could not update diagnostic." });
  }
}

module.exports = { addWebsite, listWebsites, runCheck, getDashboard, resolveDiagnostic };
