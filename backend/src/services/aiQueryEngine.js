const { OpenAI } = require('openai');
const Transaction = require('../models/Transaction');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a blockchain data query assistant for the Initia ecosystem. You convert natural language questions into MongoDB query filters for a Transaction collection.

The Transaction schema has these fields:
- hash: String (unique transaction hash)
- chainId: String (one of: "initia-testnet", "minimove-1", "miniwasm-1", "minievm-1", "drip-1", "yieldmind-1")
- chainName: String (one of: "Initia L1", "MiniMove", "MiniWasm", "MiniEVM", "Drip", "YieldMind")
- chainType: String (one of: "L1", "MiniMove", "MiniWasm", "MiniEVM", "Drip", "YieldMind")
- height: Number (block height)
- timestamp: Date (ISO date)
- sender: String (wallet address)
- receiver: String (wallet address)
- amount: Number (in INIT, not uinit)
- denom: String (e.g. "INIT")
- txType: String (e.g. "MsgSend", "MsgSwap", "MsgDelegate", "MsgExecuteContract", "MsgBridge", "MsgNFT", "MsgVote", "MsgDeFi")
- status: String ("success" or "failed")
- gasUsed: Number
- gasWanted: Number
- memo: String
- isWhale: Boolean (true if amount > 10000 INIT)
- tags: [String] (e.g. ["transfer", "swap", "contract", "stake", "bridge", "nft", "governance", "defi", "whale", "other"])

IMPORTANT RULES:
1. Respond ONLY with valid raw JSON. No markdown fences, no preamble, no explanation outside the JSON.
2. The JSON must have this exact structure:
{
  "filter": { /* MongoDB query filter */ },
  "sort": { /* MongoDB sort, e.g. {"timestamp": -1} */ },
  "limit": /* number, max 100 */,
  "description": "Plain English explanation of what this query does"
}
3. For time expressions like "last hour", "today", "this week", "yesterday", use the placeholder strings:
   - "__LAST_HOUR__" for 1 hour ago
   - "__LAST_24H__" for 24 hours ago
   - "__LAST_WEEK__" for 7 days ago
   - "__TODAY_START__" for start of today
   - "__YESTERDAY_START__" for start of yesterday
   - "__YESTERDAY_END__" for end of yesterday
   These will be resolved server-side to actual ISO dates.
4. When user mentions a chain name, map it:
   - "L1" or "Initia" -> chainId: "initia-testnet"
   - "MiniMove" or "Move" -> chainId: "minimove-1"
   - "MiniWasm" or "Wasm" -> chainId: "miniwasm-1"
   - "MiniEVM" or "EVM" -> chainId: "minievm-1"
   - "Drip" -> chainId: "drip-1"
   - "YieldMind" -> chainId: "yieldmind-1"
5. Default sort is {"timestamp": -1} and default limit is 20.
6. For "whale" queries, use isWhale: true.
7. For "failed" queries, use status: "failed".`;

function resolveTimePlaceholders(obj) {
  const now = new Date();
  const replacements = {
    '__LAST_HOUR__': new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    '__LAST_24H__': new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    '__LAST_WEEK__': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    '__TODAY_START__': new Date(now.setHours(0, 0, 0, 0)).toISOString(),
    '__YESTERDAY_START__': new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    '__YESTERDAY_END__': new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(23, 59, 59, 999)).toISOString(),
  };

  const str = JSON.stringify(obj);
  let resolved = str;
  for (const [placeholder, value] of Object.entries(replacements)) {
    resolved = resolved.replace(new RegExp(placeholder, 'g'), value);
  }
  return JSON.parse(resolved);
}

async function processQuery(question) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question }
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const text = response.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Resolve time placeholders
    const filter = resolveTimePlaceholders(parsed.filter || {});
    const sort = parsed.sort || { timestamp: -1 };
    const limit = Math.min(parsed.limit || 20, 100);
    const description = parsed.description || 'Query results';

    // Execute the query
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .limit(limit)
      .lean();

    const count = await Transaction.countDocuments(filter);

    return {
      transactions,
      description,
      filter,
      count,
    };
  } catch (err) {
    console.error('AI Query error:', err.message);
    throw err;
  }
}

module.exports = { processQuery };
