const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// Middleware to get alertEngine from app
function getAlertEngine(req) {
  return req.app.get('alertEngine');
}

// GET /api/alerts — list all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts — create alert
router.post('/', async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    const engine = getAlertEngine(req);
    if (engine) engine.refreshAlerts();
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id — update alert
router.patch('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    const engine = getAlertEngine(req);
    if (engine) engine.refreshAlerts();
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/alerts/:id — delete alert
router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    const engine = getAlertEngine(req);
    if (engine) engine.refreshAlerts();
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
