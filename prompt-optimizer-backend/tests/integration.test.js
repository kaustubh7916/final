// tests/integration.test.js

/**
 * Integration tests for the full optimize() pipeline
 */

const { optimize } = require('../optimizer');

// Mock the LLM adapters
jest.mock('../llm_adapters/gemini', () => ({
  callAdapter: jest.fn().mockResolvedValue({
    ok: true,
    text: '[MOCK] Optimized prompt from Gemini',
    tokens: 10,
    raw: { mock: true },
    latencyMs: 100
  })
}));

jest.mock('../llm_adapters/hf_inference', () => ({
  callAdapter: jest.fn().mockResolvedValue({
    ok: true,
    text: '[MOCK] Optimized prompt from HF',
    tokens: 12,
    raw: { mock: true },
    latencyMs: 150
  })
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    // Set mock mode
    process.env.USE_MOCK_LLM = 'true';
    process.env.SEMANTIC_THRESHOLD = '0.5';
  });

  afterEach(() => {
    delete process.env.USE_MOCK_LLM;
    delete process.env.SEMANTIC_THRESHOLD;
  });

  test('should optimize a simple prompt', async () => {
    const request = {
      prompt: 'Could you please help me with this task? Thank you in advance!'
    };

    const result = await optimize(request);

    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('optimized');
    expect(result).toHaveProperty('chosen');
    expect(result).toHaveProperty('structured');
    expect(result).toHaveProperty('metrics');
    expect(result).toHaveProperty('provenance');

    expect(result.original.prompt).toBe(request.prompt);
    expect(result.optimized).toHaveLength(3); // local + gemini + hf
    expect(result.metrics.llm_calls).toBe(2);
    expect(result.metrics.tokens_saved_pct).toBeDefined();
  });

  test('should handle verbose prompt', async () => {
    const request = {
      prompt: 'I would really appreciate it if you could please help me understand this concept in a very detailed and comprehensive manner. Thank you so much for your time and assistance.'
    };

    const result = await optimize(request);

    expect(result.chosen.source).toBeDefined();
    expect(result.chosen.prompt).toBeDefined();
    expect(result.chosen.tokens).toBeGreaterThan(0);
    expect(result.metrics.tokens_saved_pct).toBeDefined();
  });

  test('should handle code prompt', async () => {
    const request = {
      prompt: 'Please write a function that calculates the factorial of a number. Make sure to handle edge cases and provide proper error handling.'
    };

    const result = await optimize(request);

    expect(result.chosen.prompt).toBeDefined();
    expect(result.structured.json).toBeDefined();
    expect(result.structured.xml).toBeDefined();
  });

  test('should handle list prompt', async () => {
    const request = {
      prompt: 'Please provide a list of the following items:\n- First item\n- Second item\n- Third item\n- Fourth item'
    };

    const result = await optimize(request);

    expect(result.chosen.prompt).toBeDefined();
    expect(result.provenance.sources_used).toContain('local');
    expect(result.provenance.sources_used).toContain('gemini');
    expect(result.provenance.sources_used).toContain('hf_inference');
  });

  test('should handle empty prompt error', async () => {
    const request = { prompt: '   ' };

    await expect(optimize(request)).rejects.toThrow('Prompt cannot be empty');
  });

  test('should handle missing prompt error', async () => {
    const request = {};

    await expect(optimize(request)).rejects.toThrow("Missing 'prompt' field");
  });

  test('should apply profile context', async () => {
    const request = {
      prompt: 'Please explain this briefly',
      profile: 'concise'
    };

    const result = await optimize(request);

    expect(result.chosen.prompt).toBeDefined();
    expect(result.metrics.time_ms).toBeGreaterThanOrEqual(0);
  });

  test('should handle LLM failures gracefully', async () => {
    // Mock LLM failures
    const geminiAdapter = require('../llm_adapters/gemini');
    const hfAdapter = require('../llm_adapters/hf_inference');
    
    geminiAdapter.callAdapter.mockResolvedValue({
      ok: false,
      text: '',
      tokens: 0,
      raw: { error: 'Mock failure' },
      latencyMs: 100
    });

    hfAdapter.callAdapter.mockResolvedValue({
      ok: false,
      text: '',
      tokens: 0,
      raw: { error: 'Mock failure' },
      latencyMs: 100
    });

    const request = {
      prompt: 'Test prompt'
    };

    const result = await optimize(request);

    expect(result.optimized).toHaveLength(1); // Only local candidate
    expect(result.chosen.source).toBe('local');
    expect(result.metrics.llm_calls).toBe(0);
  });
});
