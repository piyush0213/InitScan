const express = require('express');
const router = express.Router();
const { processQuery } = require('../services/aiQueryEngine');

// POST /api/query — AI-powered natural language query
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Please provide a question' });
    }

    const result = await processQuery(question);
    res.json(result);
  } catch (err) {
    console.error('Query route error:', err.message);
    res.status(500).json({
      error: 'Failed to process your query. Please try rephrasing.',
      details: err.message,
    });
  }
});

module.exports = router;
