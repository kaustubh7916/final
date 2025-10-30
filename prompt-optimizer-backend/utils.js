 // utils.js

/**
 * Utility functions for Prompt Optimizer
 * - Token counting
 * - Jaccard similarity
 * - JSON/XML converters
 */

const xml = require("xml-js");

/** 🔹 Estimate token count (simple heuristic) */
function countTokens(text = "") {
  if (!text) return 0;
  // Approximate: 1 token ≈ 0.75 words
  const words = text.trim().split(/\s+/);
  return Math.ceil(words.length / 0.75);
}

/** 🔹 Compute Jaccard similarity between two strings */
function jaccard(a, b) {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  const score = union.size === 0 ? 0 : intersection.size / union.size;
  return parseFloat(score.toFixed(3));
}

/** 🔹 Convert plain text to JSON-like structure */
function toJSONStructure(prompt) {
  return {
    type: "prompt",
    content: prompt,
    length: prompt.length,
    timestamp: new Date().toISOString(),
  };
}

/** 🔹 Convert plain text to XML string */
function toXMLStructure(prompt) {
  const obj = {
    prompt: {
      _attributes: { length: prompt.length },
      _text: prompt,
    },
  };
  return xml.js2xml(obj, { compact: true, spaces: 2 });
}

/** 🔹 Generate simple fingerprint (optional) */
function seededFingerprint(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `fp_${Math.abs(hash)}`;
}

/** 🔹 Semantic validation with Jaccard and optional cosine similarity */
async function validateSemantic(original, candidate) {
  const jaccardScore = jaccard(original, candidate);
  const threshold = parseFloat(process.env.SEMANTIC_THRESHOLD) || 0.7;
  
  let cosineScore = 0;
  let passed = jaccardScore >= threshold;
  
  // Optional Python microservice hook for cosine similarity
  if (process.env.USE_PY_EMBEDDINGS === 'true') {
    try {
      const axios = require('axios');
      const response = await axios.post(process.env.PY_EMBEDDINGS_URL || 'http://localhost:8001/embeddings', {
        texts: [original, candidate]
      }, { timeout: 5000 });
      
      if (response.data && response.data.similarity) {
        cosineScore = response.data.similarity;
        // Use cosine if available, otherwise fallback to Jaccard
        passed = cosineScore >= threshold;
      }
    } catch (error) {
      console.warn('[SEMANTIC] Python embeddings service unavailable, using Jaccard only:', error.message);
    }
  }
  
  return {
    jaccard: jaccardScore,
    cosine: cosineScore,
    passed,
    threshold
  };
}

module.exports = {
  countTokens,
  jaccard,
  toJSONStructure,
  toXMLStructure,
  seededFingerprint,
  validateSemantic,
};

