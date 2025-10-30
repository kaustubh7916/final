// rule_engine.js

/**
 * Rule Engine — applies regex-based transformations
 * to clean and compress prompts locally.
 *
 * Each rule is idempotent: applying it multiple times
 * should not change the output further.
 */

const rules = [
  {
    id: "r01_strip_polite",
    desc: "Strip polite padding anywhere (not just at start)",
    // Handles "could you please", "would you kindly", "thank you", etc.
    pattern: /\b(could you please|would you please|can you please|can you kindly|would you kindly|would you mind|i would appreciate( it)?( if)?|please|kindly|thanks?( in advance)?|thank you( in advance)?)\b/gi,
    replacement: "",
    priority: 100,
    safe: true,
  },
  {
    id: "r02_merge_act_as",
    desc: 'Convert "I want you to act as" → "Act as:"',
    pattern: /\bI want you to act as\b/gi,
    replacement: "Act as:",
  },
  {
    id: "r03_strip_closing",
    desc: "Remove closing lines like Regards/Thanks",
    pattern: /(regards,|thanks[,.]?|sincerely,?)/gi,
    replacement: "",
  },
  {
    id: "r04_compress_lists",
    desc: "Collapse long bullet lists into numbered steps",
    pattern: /(\n\s*[-*]\s*)+/g,
    replacement: "\n1. ",
  },
  {
    id: "r05_remove_fillers",
    desc: "Remove filler words like very, actually, basically",
    pattern: /\b(very|actually|basically|really|literally)\b/gi,
    replacement: "",
  },
  {
    id: "r06_param_extract",
    desc: "Extract quoted text or numbers as parameters (placeholder)",
    pattern: /"([^"]+)"|(\d{2,4})/g,
    replacement: (match, quoted, number) =>
      quoted ? `<param:"${quoted}">` : `<param:${number}>`,
  },
  {
    id: "r07_length_hint",
    desc: 'Detect "in few words" or "briefly" → set profile:concise (metadata only)',
    pattern: /\b(in a few words|briefly)\b/gi,
    replacement: "",
    meta: { profile: "concise" },
  },
  {
    id: "r08_normalize_punc",
    desc: "Normalize punctuation and whitespace",
    pattern: /\s*([,.!?;:])\s*/g,
    replacement: "$1 ",
  },
];

/**
 * Apply all rules sequentially.
 * @param {string} prompt - Input prompt text
 * @param {object} context - Extra context (profile, etc.)
 * @returns {{candidate: string, applied_rules: string[], metadata: object}}
 */
function applyRules(prompt, context = {}) {
  let text = prompt;
  const applied_rules = [];
  const metadata = { ...context };

  for (const rule of rules) {
    const before = text;
    text = text.replace(rule.pattern, rule.replacement).trim();

    // Track which rules made changes
    if (text !== before) {
      applied_rules.push(rule.id);
      if (rule.meta) Object.assign(metadata, rule.meta);
    }
  }

  // Normalize extra spaces
  text = text.replace(/\s+/g, " ").trim();

  return { candidate: text, applied_rules, metadata };
}

module.exports = { applyRules, rules };
