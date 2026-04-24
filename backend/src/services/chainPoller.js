const axios = require('axios');
const Transaction = require('../models/Transaction');
const CHAINS = require('../config/chains');

// Track last indexed block height per chain
const lastIndexedHeight = {};
// Chain health object shared with health service
const chainHealth = {};

// Initialize chain health
CHAINS.forEach(chain => {
  chainHealth[chain.id] = {
    chainId: chain.id,
    chainName: chain.name,
    chainType: chain.type,
    color: chain.color,
    status: 'unknown',
    latestHeight: 0,
    lastChecked: null,
    consecutiveOnline: 0,
  };
});

// Map Cosmos SDK message types to readable categories
function classifyMessage(msgType) {
  if (!msgType) return { txType: 'unknown', tags: ['unknown'] };

  const t = msgType.toLowerCase();
  const tags = [];

  if (t.includes('msgsend') || t.includes('transfer')) {
    tags.push('transfer');
    return { txType: 'MsgSend', tags };
  }
  if (t.includes('msgswap') || t.includes('swap')) {
    tags.push('swap', 'defi');
    return { txType: 'MsgSwap', tags };
  }
  if (t.includes('msgexecute') || t.includes('msginstantiate') || t.includes('contract') || t.includes('msgpublish')) {
    tags.push('contract');
    return { txType: 'MsgExecuteContract', tags };
  }
  if (t.includes('delegate') || t.includes('undelegate') || t.includes('redelegate') || t.includes('msgstake')) {
    tags.push('stake');
    return { txType: 'MsgDelegate', tags };
  }
  if (t.includes('bridge') || t.includes('ibctransfer') || t.includes('msgtransfer') || t.includes('msginitiatetoken')) {
    tags.push('bridge');
    return { txType: 'MsgBridge', tags };
  }
  if (t.includes('nft') || t.includes('msgsendnft') || t.includes('msgmint')) {
    tags.push('nft');
    return { txType: 'MsgNFT', tags };
  }
  if (t.includes('vote') || t.includes('proposal') || t.includes('deposit') || t.includes('msgsubmitproposal')) {
    tags.push('governance');
    return { txType: 'MsgVote', tags };
  }
  if (t.includes('provide') || t.includes('liquidity') || t.includes('withdraw') || t.includes('farm')) {
    tags.push('defi');
    return { txType: 'MsgDeFi', tags };
  }

  tags.push('other');
  return { txType: msgType.split('.').pop() || 'unknown', tags };
}

// Parse a raw Cosmos SDK transaction
function parseTx(txResponse, chain) {
  try {
    const tx = txResponse.tx;
    const txResult = txResponse.tx_response || txResponse;

    const hash = txResult.txhash || txResult.hash || '';
    const height = parseInt(txResult.height) || 0;
    const timestamp = txResult.timestamp
      ? new Date(txResult.timestamp)
      : new Date();
    const code = txResult.code || 0;
    const status = code === 0 ? 'success' : 'failed';
    const gasUsed = parseInt(txResult.gas_used) || 0;
    const gasWanted = parseInt(txResult.gas_wanted) || 0;
    const memo = tx?.body?.memo || txResult.tx?.body?.memo || '';

    // Get messages
    const messages = tx?.body?.messages || txResult.tx?.body?.messages || [];
    const firstMsg = messages[0] || {};
    const msgType = firstMsg['@type'] || firstMsg.type || '';

    const { txType, tags } = classifyMessage(msgType);

    // Extract sender / receiver
    let sender = firstMsg.sender || firstMsg.from_address || firstMsg.delegator_address || firstMsg.voter || '';
    let receiver = firstMsg.receiver || firstMsg.to_address || firstMsg.validator_address || firstMsg.contract || '';

    // Extract amount
    let amount = 0;
    let denom = '';
    const amountArr = firstMsg.amount || firstMsg.token || null;
    if (Array.isArray(amountArr) && amountArr.length > 0) {
      amount = parseInt(amountArr[0].amount) || 0;
      denom = amountArr[0].denom || '';
    } else if (amountArr && amountArr.amount) {
      amount = parseInt(amountArr.amount) || 0;
      denom = amountArr.denom || '';
    }

    // Convert uinit to INIT (1 INIT = 1,000,000 uinit)
    const amountINIT = denom.includes('uinit') ? amount / 1_000_000 : amount;

    // Whale detection: > 10,000 INIT
    const isWhale = amountINIT > 10000;
    if (isWhale) tags.push('whale');

    return {
      hash,
      chainId: chain.id,
      chainName: chain.name,
      chainType: chain.type,
      height,
      timestamp,
      sender,
      receiver,
      amount: amountINIT,
      denom: denom.replace(/^u/, '').toUpperCase() || 'INIT',
      amountUSD: 0,
      txType,
      rawMessages: messages,
      status,
      gasUsed,
      gasWanted,
      memo,
      isWhale,
      tags,
    };
  } catch (err) {
    console.error(`Error parsing tx for ${chain.id}:`, err.message);
    return null;
  }
}

// Poll a single chain for new blocks and transactions
async function pollChain(chain, io, alertEngine) {
  try {
    // Fetch latest block
    const blockRes = await axios.get(
      `${chain.lcd}/cosmos/base/tendermint/v1beta1/blocks/latest`,
      { timeout: 10000 }
    );

    const latestHeight = parseInt(blockRes.data?.block?.header?.height) || 0;
    if (!latestHeight) return;

    // Update chain health
    chainHealth[chain.id].status = 'online';
    chainHealth[chain.id].latestHeight = latestHeight;
    chainHealth[chain.id].lastChecked = new Date();
    chainHealth[chain.id].consecutiveOnline += 1;

    const lastHeight = lastIndexedHeight[chain.id] || latestHeight - 1;
    const startHeight = lastHeight + 1;
    const endHeight = Math.min(latestHeight, startHeight + 4); // Max 5 blocks per cycle

    if (startHeight > latestHeight) return;

    for (let h = startHeight; h <= endHeight; h++) {
      try {
        const txRes = await axios.get(
          `${chain.lcd}/cosmos/tx/v1beta1/txs?events=tx.height=${h}&pagination.limit=50`,
          { timeout: 10000 }
        );

        const txResponses = txRes.data?.tx_responses || [];

        for (const txResp of txResponses) {
          const parsed = parseTx({ tx_response: txResp, tx: txResp.tx }, chain);
          if (!parsed || !parsed.hash) continue;

          try {
            // Deduplicate by hash
            const existing = await Transaction.findOne({ hash: parsed.hash }).lean();
            if (existing) continue;

            const savedTx = await new Transaction(parsed).save();
            const txObj = savedTx.toObject();

            // Emit via Socket.io
            io.to('all_chains').emit('new_transaction', txObj);
            io.to(chain.id).emit('new_transaction', txObj);

            // Run alert engine
            if (alertEngine) {
              alertEngine.checkTransaction(txObj, io);
            }
          } catch (saveErr) {
            if (saveErr.code !== 11000) { // Ignore duplicate key errors
              console.error(`Error saving tx ${parsed.hash}:`, saveErr.message);
            }
          }
        }
      } catch (blockErr) {
        console.error(`Error fetching txs at height ${h} for ${chain.id}:`, blockErr.message);
      }
    }

    lastIndexedHeight[chain.id] = endHeight;
  } catch (err) {
    chainHealth[chain.id].status = 'offline';
    chainHealth[chain.id].lastChecked = new Date();
    chainHealth[chain.id].consecutiveOnline = 0;
    console.error(`Error polling ${chain.id}:`, err.message);
  }
}

// Start polling all chains with staggered start
function startPolling(io, alertEngine) {
  const cron = require('node-cron');

  CHAINS.forEach((chain, index) => {
    setTimeout(() => {
      console.log(`🔗 Starting poller for ${chain.name} (${chain.id})`);
      // Poll every 3 seconds
      cron.schedule('*/3 * * * * *', () => {
        pollChain(chain, io, alertEngine).catch(err => {
          console.error(`Poller crash for ${chain.id}:`, err.message);
        });
      });
    }, index * 500); // Stagger by 500ms
  });
}

function getChainHealth() {
  return Object.values(chainHealth);
}

module.exports = { startPolling, getChainHealth, chainHealth };
