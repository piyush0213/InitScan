const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  conditions: {
    chainIds: { type: [String], default: [] },
    txTypes: { type: [String], default: [] },
    minAmountUSD: { type: Number, default: 0 },
    senderAddress: { type: String, default: '' },
    receiverAddress: { type: String, default: '' },
    isWhale: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  webhookUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  triggerCount: { type: Number, default: 0 },
  lastTriggered: { type: Date, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Alert', alertSchema);
