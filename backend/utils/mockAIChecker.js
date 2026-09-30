/**
 * mockAIChecker.js
 * ---------------------------------------------------------------
 * Simulates checking whether a website is mentioned by an AI engine
 * for a given prompt. This lets the whole product work end-to-end
 * (dashboard, diagnostics, weekly reports) before real API keys are
 * connected — matches the plan's Month 3 milestone of a working
 * crawler + mention-checking pipeline.
 *
 * TO GO LIVE WITH REAL ENGINES:
 * Replace the body of `checkMention()` with real calls, e.g.:
 *   - OpenAI Chat Completions API for ChatGPT
 *   - Perplexity's API
 *   - Google AI (Gemini) API
 *   - Anthropic API for Claude
 * Each call should send `promptUsed`, inspect the response text for
 * a mention of `domain`, and return the same shape this mock returns
 * so nothing else in the codebase needs to change.
 * --------------------------------------------------------------- */

const REASONS = [
  {
    reason: "No clear answer to this prompt on the site — the page doesn't directly state what the business does or where it operates.",
    suggestedFixes: [
      "Add a clear one-sentence answer near the top of the relevant page",
      "Include your service area or location in plain text, not just in an image or map",
    ],
    priority: "high",
  },
  {
    reason: "Missing structured data — AI engines can't reliably extract price, category, or availability information.",
    suggestedFixes: [
      "Add basic structured data (product name, price, availability) to key pages",
      "Re-run this check after publishing — Beacon verifies automatically",
    ],
    priority: "high",
  },
  {
    reason: "Thin content — this page is too short for an AI engine to confidently describe what you offer.",
    suggestedFixes: [
      "Expand the page to at least 150 words describing what you sell and who it's for",
    ],
    priority: "medium",
  },
  {
    reason: "Content exists but doesn't match how people actually phrase this question.",
    suggestedFixes: [
      "Add an FAQ section using the exact phrasing customers use when asking this",
    ],
    priority: "medium",
  },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param {string} domain - the website being checked, e.g. "lagosmarket.ng"
 * @param {string} engine - one of Citation.ENGINES
 * @param {string} promptUsed - the natural-language prompt being simulated
 * @returns {Promise<{mentioned: boolean, diagnostic: object|null}>}
 */
async function checkMention(domain, engine, promptUsed) {
  // Simulate network latency like a real API call would have.
  await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 80));

  // Weighted toward "mentioned" for engines that are further along
  // in a hypothetical optimization journey — purely for a believable demo.
  const engineWeights = {
    chatgpt: 0.72,
    perplexity: 0.6,
    google_ai: 0.5,
    gemini: 0.35,
    claude: 0.2,
  };
  const mentioned = Math.random() < (engineWeights[engine] ?? 0.5);

  if (mentioned) {
    return { mentioned: true, diagnostic: null };
  }

  const template = pickRandom(REASONS);
  return {
    mentioned: false,
    diagnostic: {
      reason: template.reason,
      suggestedFixes: template.suggestedFixes,
      priority: template.priority,
      resolved: false,
    },
  };
}

module.exports = { checkMention };
