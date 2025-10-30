class LLMFallback {
  constructor(adapters, config = {}) {
    this.adapters = adapters;
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelayMs: config.retryDelayMs || 1000,
      ...config
    };
    this.currentAdapterIndex = 0;
  }

  async optimize(prompt, options = {}) {
    let lastError;
    
    for (let i = 0; i < this.adapters.length; i++) {
      const adapter = this.adapters[i];
      
      try {
        const result = await this._retryAdapter(
          () => adapter.callAdapter(prompt, options),
          this.config.maxRetries,
          this.config.retryDelayMs
        );
        
        if (result.ok) {
          return {
            ...result,
            adapterUsed: adapter.constructor.name
          };
        }
      } catch (error) {
        lastError = error;
        console.warn(`Adapter ${adapter.constructor.name} failed:`, error.message);
      }
    }
    
    throw lastError || new Error('All LLM adapters failed');
  }

  async _retryAdapter(fn, maxRetries, delayMs) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw lastError;
  }
}

module.exports = LLMFallback;