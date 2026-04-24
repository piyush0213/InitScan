import { getChainColor } from '../lib/utils';

export default function ChainBadge({ chainId, chainName, size = 'sm' }) {
  const color = getChainColor(chainId);
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`font-mono font-bold rounded-full whitespace-nowrap ${sizeClasses}`}
      style={{
        background: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {chainName || chainId}
    </span>
  );
}
