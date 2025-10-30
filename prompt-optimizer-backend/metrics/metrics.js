// metrics/metrics.js

/**
 * Metrics collection and logging system
 * Tracks total_requests, llm_calls, avg_time_ms, tokens_saved, errors
 */

const fs = require('fs');
const path = require('path');

class MetricsCollector {
  constructor() {
    this.metricsFile = path.join(__dirname, 'metrics.jsonl');
    this.ensureMetricsFile();
  }

  /**
   * Ensure metrics file exists
   */
  ensureMetricsFile() {
    if (!fs.existsSync(this.metricsFile)) {
      fs.writeFileSync(this.metricsFile, '');
    }
  }

  /**
   * Log a request metric
   * @param {object} data - Metric data
   */
  logRequest(data) {
    const metric = {
      timestamp: new Date().toISOString(),
      type: 'request',
      ...data
    };
    
    const logLine = JSON.stringify(metric) + '\n';
    fs.appendFileSync(this.metricsFile, logLine);
  }

  /**
   * Log an error metric
   * @param {object} data - Error data
   */
  logError(data) {
    const metric = {
      timestamp: new Date().toISOString(),
      type: 'error',
      ...data
    };
    
    const logLine = JSON.stringify(metric) + '\n';
    fs.appendFileSync(this.metricsFile, logLine);
  }

  /**
   * Get aggregated metrics
   * @returns {object} Aggregated metrics
   */
  getAggregatedMetrics() {
    try {
      const content = fs.readFileSync(this.metricsFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line);
      
      if (lines.length === 0) {
        return this.getEmptyMetrics();
      }

      const metrics = lines.map(line => JSON.parse(line));
      const requests = metrics.filter(m => m.type === 'request');
      const errors = metrics.filter(m => m.type === 'error');

      const totalRequests = requests.length;
      const totalErrors = errors.length;
      const totalLlmCalls = requests.reduce((sum, r) => sum + (r.llm_calls || 0), 0);
      const totalTimeMs = requests.reduce((sum, r) => sum + (r.time_ms || 0), 0);
      const avgTimeMs = totalRequests > 0 ? Math.round(totalTimeMs / totalRequests) : 0;
      const totalTokensSaved = requests.reduce((sum, r) => sum + (r.tokens_saved || 0), 0);

      return {
        total_requests: totalRequests,
        total_errors: totalErrors,
        llm_calls: totalLlmCalls,
        avg_time_ms: avgTimeMs,
        tokens_saved: totalTokensSaved,
        error_rate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0,
        uptime_seconds: process.uptime(),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[METRICS] Error reading metrics:', error.message);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get empty metrics structure
   */
  getEmptyMetrics() {
    return {
      total_requests: 0,
      total_errors: 0,
      llm_calls: 0,
      avg_time_ms: 0,
      tokens_saved: 0,
      error_rate: 0,
      uptime_seconds: process.uptime(),
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Clear metrics (for testing)
   */
  clear() {
    fs.writeFileSync(this.metricsFile, '');
  }
}

module.exports = new MetricsCollector();
