// llm_adapters/groq.js

/**
 * Groq LLM Adapter - FREE high-speed inference
 * Get free API key: https://console.groq.com
 * Models: llama3-70b, mixtral-8x7b, gemma-7b (all free)
 */

const axios = require('axios');

class GroqAdapter {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseUrl = 'https://api.groq.com/openai/v1';
    this.model = process.env.GROQ_MODEL || 'llama3-70b-8192';
    this.timeout = parseInt(process.env.LLM_TIMEOUT_MS) || 30000;
    this.maxRetries = parseInt(process.env.LLM_MAX_RETRIES) || 3;
    this.useMock = process.env.USE_MOCK_LLM === 'true';
  }

  async callAdapter(prompt, opts = {}) {
    const startTime = Date.now();
    
    if (this.useMock) {
      return this._mockResponse(prompt, opts, startTime);
    }

    if (!this.apiKey) {
      console.warn('[GROQ] API key not set, skipping');
      return { ok: false, text: '', tokens: 0, raw: {}, latencyMs: 0 };
    }

    const systemPrompt = `You are a prompt optimization expert. Rewrite prompts to be concise and efficient while preserving meaning. Remove unnecessary words and redundancy. Output ONLY the optimized prompt.`;

    const requestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Optimize this prompt: "${prompt}"` }
        ],
        temperature: opts.temperature || 0.7,
        max_tokens: opts.max_tokens || 1000,
        top_p: opts.top_p || 0.9,
      },
      timeout: this.timeout,
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(requestConfig);
        const latencyMs = Date.now() - startTime;
        
        if (response.data?.choices?.[0]?.message?.content) {
          const text = response.data.choices[0].message.content.trim()
            .replace(/^["']|["']$/g, '')
            .replace(/^Optimized prompt:\s*/i, '');
          
          const tokens = response.data.usage?.completion_tokens || this._estimateTokens(text);
          
          this._logRequest(prompt, text, latencyMs, attempt);
          
          return {
            ok: true,
            text,
            tokens,
            raw: response.data,
            latencyMs
          };
        } else {
          throw new Error('Invalid response structure from Groq');
        }
      } catch (error) {
        lastError = error;
        const isRetryable = this._isRetryableError(error);
        
        if (attempt === this.maxRetries || !isRetryable) {
          break;
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await this._sleep(delay);
      }
    }

    const latencyMs = Date.now() - startTime;
    this._logError(prompt, lastError, latencyMs);
    
    return {
      ok: false,
      text: '',
      tokens: 0,
      raw: { error: lastError.message },
      latencyMs
    };
  }

  _mockResponse(prompt, opts, startTime) {
    const latencyMs = Date.now() - startTime;
    const mockText = `[MOCK_GROQ] Optimized: ${prompt.substring(0, 50)}`;
    const tokens = this._estimateTokens(mockText);
    
    this._logRequest(prompt, mockText, latencyMs, 1, true);
    
    return {
      ok: true,
      text: mockText,
      tokens,
      raw: { mock: true },
      latencyMs
    };
  }

  _estimateTokens(text) {
    if (!text) return 0;
    const words = text.trim().split(/\s+/);
    return Math.ceil(words.length / 0.75);
  }

  _isRetryableError(error) {
    if (!error.response) return true;
    const status = error.response.status;
    return status >= 500 || status === 429;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _logRequest(prompt, response, latencyMs, attempt, isMock = false) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      adapter: 'groq',
      model: this.model,
      attempt,
      latencyMs,
      isMock,
      promptLength: prompt.length,
      responseLength: response.length,
    };
    console.log(`[GROQ] ${JSON.stringify(logEntry)}`);
  }

  _logError(prompt, error, latencyMs) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      adapter: 'groq',
      error: error.message,
      status: error.response?.status,
      latencyMs,
      promptLength: prompt.length,
    };
    console.error(`[GROQ_ERROR] ${JSON.stringify(logEntry)}`);
  }
}

module.exports = new GroqAdapter();
