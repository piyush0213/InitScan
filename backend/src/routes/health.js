const express = require('express');
const router = express.Router();
const { getChainHealth } = require('../services/chainPoller');

// GET /api/health/rollups — current chain health
router.get('/rollups', (req, res) => {
  res.json(getChainHealth());
});

module.exports = router;
