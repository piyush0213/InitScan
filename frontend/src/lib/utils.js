// Chain color mapping
export const CHAIN_COLORS = {
  'initia-testnet': '#00D4FF',
  'minimove-1': '#7C3AED',
  'miniwasm-1': '#00FF88',
  'minievm-1': '#FF9900',
  'drip-1': '#FF3B6B',
  'yieldmind-1': '#00FFCC',
};

export const CHAIN_NAMES = {
  'initia-testnet': 'Initia L1',
  'minimove-1': 'MiniMove',
  'miniwasm-1': 'MiniWasm',
  'minievm-1': 'MiniEVM',
  'drip-1': 'Drip',
  'yieldmind-1': 'YieldMind',
};

export const CHAINS = [
  { id: 'initia-testnet', name: 'Initia L1', type: 'L1' },
  { id: 'minimove-1', name: 'MiniMove', type: 'MiniMove' },
  { id: 'miniwasm-1', name: 'MiniWasm', type: 'MiniWasm' },
  { id: 'minievm-1', name: 'MiniEVM', type: 'MiniEVM' },
  { id: 'drip-1', name: 'Drip', type: 'Drip' },
  { id: 'yieldmind-1', name: 'YieldMind', type: 'YieldMind' },
];

export const TX_TYPES = [
  'MsgSend', 'MsgSwap', 'MsgDelegate', 'MsgExecuteContract',
  'MsgBridge', 'MsgNFT', 'MsgVote', 'MsgDeFi',
];

export const TAGS = [
  'transfer', 'swap', 'contract', 'stake',
  'bridge', 'nft', 'governance', 'defi',
];

// Truncate address: first 8 + last 6
export function truncateAddress(addr) {
  if (!addr || addr.length < 16) return addr || '—';
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

// Truncate hash: first 10 + last 6
export function truncateHash(hash) {
  if (!hash || hash.length < 18) return hash || '—';
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

// Relative time ago
export function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Format number with commas
export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Get chain color
export function getChainColor(chainId) {
  return CHAIN_COLORS[chainId] || '#00D4FF';
}

// Get chain name
export function getChainName(chainId) {
  return CHAIN_NAMES[chainId] || chainId;
}
