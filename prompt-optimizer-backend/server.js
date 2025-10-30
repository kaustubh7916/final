// server.js
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const optimizer = require('./optimizer');
const metrics = require('./metrics/metrics');

const app = express();

// Security headers & CORS
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS configuration
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '1mb' }));

// Rate limiter (basic protection)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests/min
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Simple request logger
app.use((req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  fs.appendFileSync(path.join(__dirname, 'logs', 'requests.log'), logEntry);
  next();
});

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  try {
    const aggregatedMetrics = metrics.getAggregatedMetrics();
    res.json(aggregatedMetrics);
  } catch (err) {
    console.error('Error in /metrics:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Main /optimize route
app.post('/api/optimize', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const result = await optimizer.optimize(req.body);
    
    // Log successful request metrics
    metrics.logRequest({
      time_ms: Date.now() - startTime,
      llm_calls: result.metrics.llm_calls,
      tokens_saved: result.metrics.tokens_saved_pct,
      chosen_source: result.chosen.source,
      semantic_score: result.chosen.semantic_score,
      prompt_length: req.body.prompt?.length || 0,
    });
    
    res.json(result);
  } catch (err) {
    console.error('Error in /optimize:', err.message);
    
    // Log error metrics
    metrics.logError({
      error_type: err.name,
      error_message: err.message,
      time_ms: Date.now() - startTime,
      prompt_length: req.body.prompt?.length || 0,
    });
    
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Prompt Optimizer API running on http://localhost:${PORT}`);
});

