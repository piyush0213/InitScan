const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/transactions — paginated list with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      chainId,
      txType,
      isWhale,
      status,
      tag,
      search,
      from,
      to,
      sort = 'timestamp',
      order = 'desc',
    } = req.query;

    const filter = {};

    if (chainId) filter.chainId = chainId;
    if (txType) filter.txType = txType;
    if (isWhale === 'true') filter.isWhale = true;
    if (status) filter.status = status;
    if (tag) filter.tags = tag;

    if (search) {
      filter.$or = [
        { hash: { $regex: search, $options: 'i' } },
        { sender: { $regex: search, $options: 'i' } },
        { receiver: { $regex: search, $options: 'i' } },
        { memo: { $regex: search, $options: 'i' } },
      ];
    }

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:hash — single transaction
router.get('/:hash', async (req, res) => {
  try {
    const tx = await Transaction.findOne({ hash: req.params.hash }).lean();
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
