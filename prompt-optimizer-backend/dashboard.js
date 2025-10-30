const express = require('express');
const path = require('path');
const router = express.Router();

// Serve static files from public directory
router.use(express.static(path.join(__dirname, '../public')));

// Dashboard route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// API endpoint for dashboard data
router.get('/data', async (req, res) => {
  try {
    const metrics = require('../metrics/metrics');
    const data = await metrics.getDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

module.exports = router;