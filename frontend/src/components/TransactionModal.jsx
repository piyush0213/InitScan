import { motion } from 'framer-motion';
import { HiX, HiOutlineClipboardCopy } from 'react-icons/hi';
import toast from 'react-hot-toast';
import ChainBadge from './ChainBadge';
import { formatNumber, copyToClipboard, getChainColor } from '../lib/utils';

export default function TransactionModal({ tx, onClose }) {
  if (!tx) return null;

  const color = getChainColor(tx.chainId);

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success(`${label} copied!`);
  };

  const InfoRow = ({ label, value, mono = false, copiable = false }) => (
    <div className="flex items-start justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs uppercase tracking-wider shrink-0 mr-4" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm text-right break-all ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--text-primary)' }}>
          {value || '—'}
        </span>
        {copiable && value && (
          <button onClick={() => handleCopy(value, label)} className="shrink-0 p-1 rounded hover:bg-white/5">
            <HiOutlineClipboardCopy className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,20,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{
          background: 'var(--bg-elevated)',
          border: `1px solid ${color}40`,
          boxShadow: `0 0 40px ${color}15`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ChainBadge chainId={tx.chainId} chainName={tx.chainName} size="md" />
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tx.status === 'success' ? 'badge-success' : 'badge-failed'}`}>
              {tx.status === 'success' ? '✓ SUCCESS' : '✗ FAILED'}
            </span>
            {tx.isWhale && <span className="badge-whale text-xs px-2 py-0.5 rounded-full font-bold">🐋 WHALE</span>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <HiX className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-0">
          <InfoRow label="TX Hash" value={tx.hash} mono copiable />
          <InfoRow label="Block Height" value={tx.height} mono />
          <InfoRow label="Chain" value={`${tx.chainName} (${tx.chainId})`} />
          <InfoRow label="Timestamp" value={new Date(tx.timestamp).toLocaleString()} />
          <InfoRow label="Type" value={tx.txType} />
          <InfoRow label="Sender" value={tx.sender} mono copiable />
          <InfoRow label="Receiver" value={tx.receiver} mono copiable />
          <InfoRow label="Amount" value={tx.amount > 0 ? `${formatNumber(tx.amount)} ${tx.denom}` : '—'} mono />
          <InfoRow label="Gas Used" value={formatNumber(tx.gasUsed)} mono />
          <InfoRow label="Gas Wanted" value={formatNumber(tx.gasWanted)} mono />
          <InfoRow label="Memo" value={tx.memo || '—'} />
          <InfoRow label="Tags" value={tx.tags?.join(', ') || '—'} />
        </div>

        {/* Raw Messages */}
        {tx.rawMessages && tx.rawMessages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Raw Messages
            </h3>
            <pre className="font-mono text-xs p-4 rounded-xl overflow-x-auto"
              style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {JSON.stringify(tx.rawMessages, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
