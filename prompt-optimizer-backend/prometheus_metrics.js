const client = require('prom-client');
const metrics = require('./metrics/metrics');

class PrometheusMetrics {
  constructor() {
    this.registry = new client.Registry();
    this.setupMetrics();
  }

  setupMetrics() {
    // Define metrics
    this.requestCounter = new client.Counter({
      name: 'optimizer_requests_total',
      help: 'Total number of optimization requests',
      labelNames: ['intent_type', 'status_code'],
      registers: [this.registry]
    });

    this.llmLatency = new client.Histogram({
      name: 'optimizer_llm_latency_seconds',
      help: 'LLM adapter latency in seconds',
      labelNames: ['adapter'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry]
    });

    this.semanticScore = new client.Gauge({
      name: 'optimizer_semantic_score',
      help: 'Average semantic similarity score',
      registers: [this.registry]
    });

    this.clarityScore = new client.Gauge({
      name: 'optimizer_clarity_score',
      help: 'Average clarity score',
      registers: [this.registry]
    });

    // Register default metrics
    client.collectDefaultMetrics({ register: this.registry });
  }

  async updateMetrics() {
    const stats = await metrics.getStats();
    this.semanticScore.set(stats.avg_semantic_score || 0);
    this.clarityScore.set(stats.avg_clarity_score || 0);
  }

  getMetrics() {
    return this.registry.metrics();
  }
}

module.exports = PrometheusMetrics;