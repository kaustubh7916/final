// llm_adapters/ollama.js

/**
 * Ollama LLM Adapter - FREE local LLM server
 * Run locally: https://ollama.ai
 * Supports multiple models: llama2, mistral, phi, etc.
 */

const axios = require('axios');

class OllamaAdapter {
  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama2';
    this.timeout = parseInt(process.env.LLM_TIMEOUT_MS) || 30000;
    this.maxRetries = parseInt(process.env.LLM_MAX_RETRIES) || 3;
    this.useMock = process.env.USE_MOCK_LLM === 'true';
  }

  async callAdapter(prompt, opts = {}) {
    const startTime = Date.now();
    
    if (this.useMock) {
      return this._mockResponse(prompt, opts, startTime);
    }

    const systemPrompt = `You are a prompt optimization expert. Your task is to rewrite prompts to be more concise and efficient while preserving their core meaning and intent. Remove unnecessary words, polite padding, and redundancy. Output ONLY the optimized prompt, nothing else.`;

    const requestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/api/generate`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        model: this.model,
        prompt: `${systemPrompt}\n\nOriginal prompt: "${prompt}"\n\nOptimized prompt:`,
        stream: false,
        options: {
          temperature: opts.temperature || 0.7,
          num_predict: opts.max_tokens || 1000,
          top_p: opts.top_p || 0.9,
        }
      },
      timeout: this.timeout,
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(requestConfig);
        const latencyMs = Date.now() - startTime;
        
        if (response.data && response.data.response) {
          const text = response.data.response.trim()
            .replace(/^["']|["']$/g, '') // Remove quotes
            .replace(/^Optimized prompt:\s*/i, ''); // Remove prefix if present
          
          const tokens = this._estimateTokens(text);
          
          this._logRequest(prompt, text, latencyMs, attempt);
          
          return {
            ok: true,
            text: text,
            tokens,
            raw: response.data,
            latencyMs
          };
        } else {
          throw new Error('Invalid response structure from Ollama');
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
    const mockText = `[MOCK_OLLAMA] Optimized: ${prompt.substring(0, 50)}`;
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
      adapter: 'ollama',
      model: this.model,
      attempt,
      latencyMs,
      isMock,
      promptLength: prompt.length,
      responseLength: response.length,
    };
    console.log(`[OLLAMA] ${JSON.stringify(logEntry)}`);
  }

  _logError(prompt, error, latencyMs) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      adapter: 'ollama',
      error: error.message,
      status: error.response?.status,
      latencyMs,
      promptLength: prompt.length,
    };
    console.error(`[OLLAMA_ERROR] ${JSON.stringify(logEntry)}`);
  }
}

module.exports = new OllamaAdapter();
