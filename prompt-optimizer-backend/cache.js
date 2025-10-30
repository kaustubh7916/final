// cache.js - Simple in-memory cache to avoid redundant LLM calls

class PromptCache {
  constructor(maxSize = 1000, ttlMs = 3600000) { // 1 hour default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate cache key from prompt and options
   */
  _generateKey(prompt, options = {}) {
    const normalized = prompt.toLowerCase().trim();
    const optStr = JSON.stringify(options);
    return `${this._hash(normalized)}_${this._hash(optStr)}`;
  }

  /**
   * Simple hash function
   */
  _hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached result
   */
  get(prompt, options = {}) {
    const key = this._generateKey(prompt, options);
    const cached = this.cache.get(key);
    
    if (!cached) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return cached.result;
  }

  /**
   * Set cache entry
   */
  set(prompt, options = {}, result) {
    const key = this._generateKey(prompt, options);
    
    // Implement LRU: if cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total * 100).toFixed(2) : '0.00',
      ttlMs: this.ttlMs
    };
  }
}

// Export singleton instance
module.exports = new PromptCache();
