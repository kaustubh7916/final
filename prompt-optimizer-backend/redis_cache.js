const redis = require('redis');
const { promisify } = require('util');
const crypto = require('crypto');

class RedisCache {
  constructor(config) {
    this.config = config;
    this.client = redis.createClient({
      host: config.host || 'localhost',
      port: config.port || 6379
    });
    
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    
    this.memoryCache = {};
    this.memoryCacheSize = 0;
  }

  async get(key) {
    try {
      const value = await this.getAsync(key);
      if (value) return JSON.parse(value);
      
      // Fallback to memory cache
      if (this.config.fallback_to_memory) {
        return this.memoryCache[key];
      }
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      if (this.config.fallback_to_memory) {
        return this.memoryCache[key] || null;
      }
      return null;
    }
  }

  async set(key, value, ttlSeconds) {
    try {
      await this.setAsync(key, JSON.stringify(value), 'EX', ttlSeconds || this.config.cache_ttl_seconds || 86400);
      
      // Update memory cache
      if (this.config.fallback_to_memory) {
        this._updateMemoryCache(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      if (this.config.fallback_to_memory) {
        this._updateMemoryCache(key, value);
      }
    }
  }

  _updateMemoryCache(key, value) {
    if (this.memoryCacheSize >= (this.config.memory_cache_limit || 1000)) {
      // Remove oldest key
      const oldestKey = Object.keys(this.memoryCache)[0];
      delete this.memoryCache[oldestKey];
      this.memoryCacheSize--;
    }
    
    this.memoryCache[key] = value;
    this.memoryCacheSize++;
  }

  generatePromptHash(prompt) {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  async close() {
    await this.client.quit();
  }
}

module.exports = RedisCache;