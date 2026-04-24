import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCopy, HiOutlineExternalLink } from 'react-icons/hi';
import toast from 'react-hot-toast';
import ChainBadge from './ChainBadge';
import { truncateAddress, truncateHash, timeAgo, formatNumber, copyToClipboard, getChainColor } from '../lib/utils';

export default function TransactionCard({ tx, index = 0, onClick }) {
  const [copied, setCopied] = useState('');
  const chainColor = getChainColor(tx.chainId);

  const handleCopy = async (text, type) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(type);
      toast.success(`${type} copied!`, { duration: 1500 });
      setTimeout(() => setCopied(''), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onClick}
      className="rounded-xl p-4 transition-all duration-200 cursor-pointer group"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: `0 0 0 0 ${chainColor}00`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${chainColor}50`;
        e.currentTarget.style.boxShadow = `0 0 20px ${chainColor}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChainBadge chainId={tx.chainId} chainName={tx.chainName} />
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,212,255,0.08)', color: 'var(--accent-cyan)' }}>
            {tx.txType}
          </span>
          {tx.isWhale && (
            <span className="badge-whale text-[10px] px-2 py-0.5 rounded-full font-bold">
              🐋 WHALE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tx.status === 'success' ? 'badge-success' : 'badge-failed'}`}>
            {tx.status === 'success' ? '✓ SUCCESS' : '✗ FAILED'}
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}
            title={new Date(tx.timestamp).toISOString()}>
            {timeAgo(tx.timestamp)}
          </span>
        </div>
      </div>

      {/* Hash row */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>TX</span>
        <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
          {truncateHash(tx.hash)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(tx.hash, 'Hash'); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/5"
        >
          <HiOutlineClipboardCopy className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Sender → Receiver */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>FROM</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(tx.sender, 'Sender'); }}
          className="font-mono text-xs px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          {truncateAddress(tx.sender)}
        </button>
        <span style={{ color: 'var(--text-muted)' }}>→</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>TO</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(tx.receiver, 'Receiver'); }}
          className="font-mono text-xs px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          {truncateAddress(tx.receiver)}
        </button>
      </div>

      {/* Amount + Tags */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {tx.amount > 0 && (
            <span className="font-mono text-sm font-bold" style={{ color: chainColor }}>
              {formatNumber(tx.amount)} {tx.denom}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {tx.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
