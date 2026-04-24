const cron = require('node-cron');
const axios = require('axios');
const CHAINS = require('../config/chains');
const { chainHealth } = require('./chainPoller');

function startHealthChecker(io) {
  console.log('🏥 Starting health checker (every 15 seconds)');

  cron.schedule('*/15 * * * * *', async () => {
    for (const chain of CHAINS) {
      try {
        const res = await axios.get(
          `${chain.lcd}/cosmos/base/tendermint/v1beta1/blocks/latest`,
          { timeout: 8000 }
        );

        const height = parseInt(res.data?.block?.header?.height) || 0;
        chainHealth[chain.id].status = 'online';
        chainHealth[chain.id].latestHeight = height;
        chainHealth[chain.id].lastChecked = new Date();
        chainHealth[chain.id].consecutiveOnline += 1;
      } catch (err) {
        chainHealth[chain.id].status = 'offline';
        chainHealth[chain.id].lastChecked = new Date();
        chainHealth[chain.id].consecutiveOnline = 0;
      }
    }

    // Emit health update
    io.emit('chain_health_update', Object.values(chainHealth));
  });
}

module.exports = { startHealthChecker };
