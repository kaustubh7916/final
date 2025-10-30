 
// optimizer.js
const { applyRules } = require('./rule_engine');
const { countTokens, jaccard, toJSONStructure, toXMLStructure, validateSemantic } = require('./utils');
const geminiAdapter = require('./llm_adapters/gemini');
const hfAdapter = require('./llm_adapters/hf_inference');

async function optimize(reqBody) {
  const start = Date.now();
  let llmCalls = 0;

  // 1️⃣ Validate input
  if (!reqBody || !reqBody.prompt) {
    throw new Error("Missing 'prompt' field in request body.");
  }

  const prompt = reqBody.prompt.trim();
  if (prompt.length === 0) throw new Error("Prompt cannot be empty.");

  // 2️⃣ Preprocess (normalize spaces, punctuation)
  const preprocessed = preprocessPrompt(prompt);

  // 3️⃣ Local rule-based optimization
  const localCandidate = applyRules(preprocessed, { profile: reqBody.profile || 'neutral' });

  // 4️⃣ LLM-based optimization (parallel calls)
  const llmCandidates = await Promise.allSettled([
    geminiAdapter.callAdapter(prompt, { temperature: 0.7, max_tokens: 1000 }),
    hfAdapter.callAdapter(prompt, { temperature: 0.7, max_tokens: 1000 })
  ]);

  // 5️⃣ Process LLM results and count calls
  const candidates = [
    {
      source: "local",
      prompt: localCandidate.candidate,
      tokens: countTokens(localCandidate.candidate),
      applied_rules: localCandidate.applied_rules,
      semantic_score: 0, // Will be computed below
    }
  ];

  // Process Gemini result
  if (llmCandidates[0].status === 'fulfilled' && llmCandidates[0].value.ok) {
    const geminiResult = llmCandidates[0].value;
    llmCalls++;
    candidates.push({
      source: "gemini",
      prompt: geminiResult.text,
      tokens: geminiResult.tokens,
      applied_rules: [],
      semantic_score: 0, // Will be computed below
      latency_ms: geminiResult.latencyMs,
    });
  }

  // Process HF result
  if (llmCandidates[1].status === 'fulfilled' && llmCandidates[1].value.ok) {
    const hfResult = llmCandidates[1].value;
    llmCalls++;
    candidates.push({
      source: "hf_inference",
      prompt: hfResult.text,
      tokens: hfResult.tokens,
      applied_rules: [],
      semantic_score: 0, // Will be computed below
      latency_ms: hfResult.latencyMs,
    });
  }

  // 6️⃣ Compute semantic scores for all candidates
  for (const candidate of candidates) {
    const semanticResult = await validateSemantic(prompt, candidate.prompt);
    candidate.semantic_score = semanticResult.jaccard;
    candidate.semantic_passed = semanticResult.passed;
  }

  // 7️⃣ Selection heuristic: prefer shortest that passes semantic threshold
  const validCandidates = candidates.filter(c => c.semantic_passed);
  const chosenCandidate = validCandidates.length > 0 
    ? validCandidates.reduce((shortest, current) => 
        current.tokens < shortest.tokens ? current : shortest
      )
    : candidates[0]; // Fallback to first if none pass threshold

  // 8️⃣ Build structured response
  const originalTokens = countTokens(prompt);
  const result = {
    original: { prompt, tokens: originalTokens },
    optimized: candidates,
    chosen: {
      source: chosenCandidate.source,
      prompt: chosenCandidate.prompt,
      tokens: chosenCandidate.tokens,
      reason: chosenCandidate.semantic_passed 
        ? `shortest_valid_${chosenCandidate.source}` 
        : `fallback_${chosenCandidate.source}`,
      semantic_score: chosenCandidate.semantic_score,
    },
    structured: {
      json: toJSONStructure(chosenCandidate.prompt),
      xml: toXMLStructure(chosenCandidate.prompt),
    },
    metrics: {
      tokens_saved_pct: ((originalTokens - chosenCandidate.tokens) / originalTokens * 100).toFixed(2),
      time_ms: Date.now() - start,
      llm_calls: llmCalls,
    },
    provenance: {
      sources_used: candidates.map(c => c.source),
      rule_trace: { 
        local: localCandidate.applied_rules,
        gemini: llmCandidates[0].status === 'fulfilled' ? 'success' : 'failed',
        hf_inference: llmCandidates[1].status === 'fulfilled' ? 'success' : 'failed',
      },
    },
  };

  return result;
}

// Helper — Preprocess input
function preprocessPrompt(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\b(please|kindly|thank you( in advance)?)\b/gi, "")
    .trim();
}

module.exports = { optimize };
