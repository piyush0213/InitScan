const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalTxs,
      txsLast24h,
      whaleCount,
      byChain,
      byType,
      byTag,
      byHour,
      failedCount,
    ] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.countDocuments({ timestamp: { $gte: last24h } }),
      Transaction.countDocuments({ isWhale: true }),
      Transaction.aggregate([
        { $match: { timestamp: { $gte: last24h } } },
        { $group: { _id: '$chainId', count: { $sum: 1 }, chainName: { $first: '$chainName' } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { timestamp: { $gte: last24h } } },
        { $group: { _id: '$txType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { timestamp: { $gte: last24h } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%dT%H:00:00', date: '$timestamp' },
            },
            count: { $sum: 1 },
            whaleCount: {
              $sum: { $cond: ['$isWhale', 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Transaction.countDocuments({ status: 'failed', timestamp: { $gte: last24h } }),
    ]);

    // Fail rate by chain
    const failRateByChain = await Transaction.aggregate([
      { $match: { timestamp: { $gte: last24h } } },
      {
        $group: {
          _id: '$chainId',
          total: { $sum: 1 },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          chainName: { $first: '$chainName' },
        },
      },
    ]);

    const failRate = failRateByChain.map(c => ({
      chainId: c._id,
      chainName: c.chainName,
      total: c.total,
      failed: c.failed,
      rate: c.total > 0 ? ((c.failed / c.total) * 100).toFixed(1) : 0,
    }));

    res.json({
      totalTxs,
      txsLast24h,
      whaleCount,
      byChain,
      byType,
      byTag,
      byHour,
      failRate,
      failedLast24h: failedCount,
      successRate: txsLast24h > 0 ? (((txsLast24h - failedCount) / txsLast24h) * 100).toFixed(1) : 100,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/chain/:id
router.get('/chain/:id', async (req, res) => {
  try {
    const chainId = req.params.id;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [recentTxs, countToday, typeBreakdown, whaleActivity] = await Promise.all([
      Transaction.find({ chainId }).sort({ timestamp: -1 }).limit(20).lean(),
      Transaction.countDocuments({ chainId, timestamp: { $gte: last24h } }),
      Transaction.aggregate([
        { $match: { chainId, timestamp: { $gte: last24h } } },
        { $group: { _id: '$txType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.find({ chainId, isWhale: true })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
    ]);

    res.json({
      chainId,
      recentTxs,
      countToday,
      typeBreakdown,
      whaleActivity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
