const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true, index: true },
  chainId: { type: String, required: true },
  chainName: { type: String, required: true },
  chainType: { type: String, required: true },
  height: { type: Number, required: true },
  timestamp: { type: Date, required: true, index: true },
  sender: { type: String, default: '' },
  receiver: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  denom: { type: String, default: '' },
  amountUSD: { type: Number, default: 0 },
  txType: { type: String, default: 'unknown' },
  rawMessages: { type: mongoose.Schema.Types.Mixed, default: [] },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  gasUsed: { type: Number, default: 0 },
  gasWanted: { type: Number, default: 0 },
  memo: { type: String, default: '' },
  isWhale: { type: Boolean, default: false, index: true },
  tags: { type: [String], default: [] },
}, {
  timestamps: true,
});

transactionSchema.index({ chainId: 1, timestamp: -1 });
transactionSchema.index({ sender: 1, timestamp: -1 });
transactionSchema.index({ receiver: 1, timestamp: -1 });
transactionSchema.index({ txType: 1 });
transactionSchema.index({ tags: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
