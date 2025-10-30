// Rule engine - mirrors backend
export const rules = [
  {
    id: "r01_strip_polite",
    desc: "Strip polite padding anywhere (not just at start)",
    pattern: /(could you please|would you please|can you please|can you kindly|would you kindly|would you mind|i would appreciate( it)?( if)?|please|kindly|thanks?( in advance)?|thank you( in advance)?)/gi,
    replacement: "",
    priority: 100,
    safe: true,
  },
  {
    id: "r02_merge_act_as",
    desc: 'Convert "I want you to act as" → "Act as:"',
    pattern: /I want you to act as/gi,
    replacement: "Act as:",
  },
  {
    id: "r03_strip_closing",
    desc: 'Remove closing lines like Regards/Thanks',
    pattern: /(regards,|thanks[,.]?|sincerely,?)/gi,
    replacement: "",
  },
  {
    id: "r04_compress_lists",
    desc: 'Collapse long bullet lists into numbered steps',
    pattern: /(\n\s*[-*]\s*)+/g,
    replacement: "\n1. ",
  },
  {
    id: "r05_remove_fillers",
    desc: 'Remove filler words like very, actually, basically',
    pattern: /(very|actually|basically|really|literally)/gi,
    replacement: "",
  },
  {
    id: "r06_param_extract",
    desc: 'Extract quoted text or numbers as parameters (placeholder)',
    pattern: /"([^"]+)"|(\d{2,4})/g,
    replacement: (match: string, quoted: string, number: string) => quoted ? `<param:\"${quoted}\">` : `<param:${number}>`,
  },
  {
    id: "r07_length_hint",
    desc: 'Detect "in few words" or "briefly" → set profile:concise (metadata only)',
    pattern: /(in a few words|briefly)/gi,
    replacement: "",
    meta: { profile: "concise" },
  },
  {
    id: "r08_normalize_punc",
    desc: 'Normalize punctuation and whitespace',
    pattern: /\s*([,.!?;:])\s*/g,
    replacement: "$1 ",
  },
];

export function applyRules(prompt: string, context: any = {}) {
  let text = prompt;
  const applied_rules: string[] = [];
  const metadata = { ...context };

  for (const rule of rules) {
    const before = text;
    if (typeof rule.replacement === 'function')
      text = text.replace(rule.pattern, rule.replacement);
    else
      text = text.replace(rule.pattern, rule.replacement).trim();
    if (text !== before) {
      applied_rules.push(rule.id);
      if (rule.meta) Object.assign(metadata, rule.meta);
    }
  }
  text = text.replace(/\s+/g, ' ').trim();
  return { candidate: text, applied_rules, metadata };
}
