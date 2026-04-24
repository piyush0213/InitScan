const Alert = require('../models/Alert');
const axios = require('axios');

class AlertEngine {
  constructor() {
    this.alerts = [];
    this.loadAlerts();
  }

  async loadAlerts() {
    try {
      this.alerts = await Alert.find({ isActive: true }).lean();
    } catch (err) {
      console.error('Error loading alerts:', err.message);
    }
  }

  async refreshAlerts() {
    await this.loadAlerts();
  }

  async checkTransaction(tx, io) {
    for (const alert of this.alerts) {
      if (!alert.isActive) continue;

      const c = alert.conditions;
      let match = true;

      // Check chain filter
      if (c.chainIds && c.chainIds.length > 0 && !c.chainIds.includes(tx.chainId)) {
        match = false;
      }

      // Check tx type filter
      if (match && c.txTypes && c.txTypes.length > 0 && !c.txTypes.includes(tx.txType)) {
        match = false;
      }

      // Check minimum amount
      if (match && c.minAmountUSD && tx.amount < c.minAmountUSD) {
        match = false;
      }

      // Check whale filter
      if (match && c.isWhale && !tx.isWhale) {
        match = false;
      }

      // Check sender address
      if (match && c.senderAddress && tx.sender !== c.senderAddress) {
        match = false;
      }

      // Check receiver address
      if (match && c.receiverAddress && tx.receiver !== c.receiverAddress) {
        match = false;
      }

      // Check tags
      if (match && c.tags && c.tags.length > 0) {
        const hasTag = c.tags.some(tag => tx.tags.includes(tag));
        if (!hasTag) match = false;
      }

      if (match) {
        const triggeredAt = new Date();

        // Update alert in DB
        await Alert.findByIdAndUpdate(alert._id, {
          $inc: { triggerCount: 1 },
          lastTriggered: triggeredAt,
        });

        // Emit Socket.io event
        io.emit('alert_triggered', {
          alertId: alert._id,
          alertName: alert.name,
          transaction: tx,
          triggeredAt,
        });

        // POST to webhook if configured
        if (alert.webhookUrl) {
          try {
            await axios.post(alert.webhookUrl, {
              alertId: alert._id,
              alertName: alert.name,
              transaction: tx,
              triggeredAt,
            }, { timeout: 5000 });
          } catch (webhookErr) {
            console.error(`Webhook failed for alert ${alert.name}:`, webhookErr.message);
          }
        }
      }
    }
  }
}

module.exports = AlertEngine;
