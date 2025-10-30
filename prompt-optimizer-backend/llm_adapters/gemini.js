// llm_adapters/gemini.js

/**
 * Gemini LLM Adapter
 * Provides async callAdapter(prompt, opts) → {ok, text, tokens, raw, latencyMs}
 * Includes retry with backoff, timeout, and redacted logging
 */

const axios = require('axios');

class GeminiAdapter {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.timeout = parseInt(process.env.LLM_TIMEOUT_MS) || 30000;
    this.maxRetries = parseInt(process.env.LLM_MAX_RETRIES) || 3;
    this.useMock = process.env.USE_MOCK_LLM === 'true';
  }

  /**
   * Call Gemini API with retry logic and error handling
   * @param {string} prompt - Input prompt
   * @param {object} opts - Options (temperature, max_tokens, etc.)
   * @returns {Promise<{ok: boolean, text: string, tokens: number, raw: object, latencyMs: number}>}
   */
  async callAdapter(prompt, opts = {}) {
    const startTime = Date.now();
    
    if (this.useMock) {
      return this._mockResponse(prompt, opts, startTime);
    }

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not set');
    }

    const requestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/${this.model}:generateContent`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      data: {
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: opts.temperature || 0.7,
          maxOutputTokens: opts.max_tokens || 1000,
          topP: opts.top_p || 0.9,
        }
      },
      timeout: this.timeout,
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(requestConfig);
        const latencyMs = Date.now() - startTime;
        
        if (response.data && response.data.candidates && response.data.candidates[0]) {
          const candidate = response.data.candidates[0];
          const text = candidate.content?.parts?.[0]?.text || '';
          const tokens = this._estimateTokens(text);
          
          // Redacted logging
          this._logRequest(prompt, text, latencyMs, attempt);
          
          return {
            ok: true,
            text: text.trim(),
            tokens,
            raw: response.data,
            latencyMs
          };
        } else {
          throw new Error('Invalid response structure from Gemini API');
        }
      } catch (error) {
        lastError = error;
        const isRetryable = this._isRetryableError(error);
        
        if (attempt === this.maxRetries || !isRetryable) {
          break;
        }
        
        // Exponential backoff
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
      raw: {
        error: lastError?.message,
        status: lastError?.response?.status,
        data: lastError?.response?.data
      },
      latencyMs
    };
  }

  /**
   * Mock response for testing
   */
  _mockResponse(prompt, opts, startTime) {
    const latencyMs = Date.now() - startTime;
    const mockText = `[MOCK] Optimized: ${prompt.substring(0, 50)}...`;
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

  /**
   * Estimate token count (simple heuristic)
   */
  _estimateTokens(text) {
    if (!text) return 0;
    const words = text.trim().split(/\s+/);
    return Math.ceil(words.length / 0.75);
  }

  /**
   * Check if error is retryable
   */
  _isRetryableError(error) {
    if (!error.response) return true; // Network errors are retryable
    
    const status = error.response.status;
    return status >= 500 || status === 429; // Server errors and rate limits
  }

  /**
   * Sleep utility
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Redacted logging
   */
  _logRequest(prompt, response, latencyMs, attempt, isMock = false) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      adapter: 'gemini',
      attempt,
      latencyMs,
      isMock,
      promptLength: prompt.length,
      responseLength: response.length,
      promptPreview: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    };
    
    console.log(`[GEMINI] ${JSON.stringify(logEntry)}`);
  }

  /**
   * Error logging
   */
  _logError(prompt, error, latencyMs) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      adapter: 'gemini',
      error: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      latencyMs,
      promptLength: prompt.length,
    };
    
    console.error(`[GEMINI_ERROR] ${JSON.stringify(logEntry)}`);
  }
}

module.exports = new GeminiAdapter();
