import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePause, HiOutlinePlay, HiOutlineLightningBolt, HiOutlineGlobe, HiOutlineTrendingUp } from 'react-icons/hi';
import socket from '../lib/socket';
import { getTransactions, getAnalyticsSummary } from '../lib/api';
import TransactionCard from '../components/TransactionCard';
import StatCard from '../components/StatCard';
import { CHAINS, formatNumber } from '../lib/utils';
import TransactionModal from '../components/TransactionModal';

export default function Dashboard() {
  const [liveFeed, setLiveFeed] = useState([]);
  const [paused, setPaused] = useState(false);
  const [selectedChain, setSelectedChain] = useState('all');
  const [whalesOnly, setWhalesOnly] = useState(false);
  const [successOnly, setSuccessOnly] = useState(false);
  const [txPerMin, setTxPerMin] = useState(0);
  const [selectedTx, setSelectedTx] = useState(null);
  const txCountRef = useRef(0);
  const intervalRef = useRef(null);

  // Initial load
  const { data: initialTxs } = useQuery({
    queryKey: ['recentTxs'],
    queryFn: () => getTransactions({ limit: 50, order: 'desc' }),
  });

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: getAnalyticsSummary,
    refetchInterval: 15000,
  });

  // Load initial transactions
  useEffect(() => {
    if (initialTxs?.transactions) {
      setLiveFeed(prev => {
        if (prev.length > 0) return prev;
        return initialTxs.transactions;
      });
    }
  }, [initialTxs]);

  // Socket listener for new transactions
  useEffect(() => {
    const handler = (tx) => {
      if (paused) return;
      txCountRef.current += 1;
      setLiveFeed(prev => [tx, ...prev].slice(0, 100));
    };

    socket.on('new_transaction', handler);
    return () => socket.off('new_transaction', handler);
  }, [paused]);

  // TX/min counter
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTxPerMin(txCountRef.current);
      txCountRef.current = 0;
    }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Filter the feed
  const filteredFeed = liveFeed.filter(tx => {
    if (selectedChain !== 'all' && tx.chainId !== selectedChain) return false;
    if (whalesOnly && !tx.isWhale) return false;
    if (successOnly && tx.status !== 'success') return false;
    return true;
  });

  const activeChains = summary?.byChain?.length || 0;

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          label="Total Indexed"
          value={formatNumber(summary?.totalTxs || liveFeed.length)}
          icon={<HiOutlineGlobe className="w-5 h-5" />}
          color="var(--accent-cyan)"
        />
        <StatCard
          label="Last 24h"
          value={formatNumber(summary?.txsLast24h || 0)}
          icon={<HiOutlineTrendingUp className="w-5 h-5" />}
          color="var(--accent-green)"
        />
        <StatCard
          label="Active Chains"
          value={activeChains}
          icon={<HiOutlineLightningBolt className="w-5 h-5" />}
          color="var(--accent-violet)"
        />
        <StatCard
          label="Whale TXs"
          value={formatNumber(summary?.whaleCount || 0)}
          icon={<span className="text-lg">🐋</span>}
          color="var(--accent-amber)"
        />
        <StatCard
          label="TX/min"
          value={txPerMin}
          icon={<HiOutlineLightningBolt className="w-5 h-5" />}
          color="var(--accent-pink)"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Chain selector */}
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="font-mono text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="all">All Chains</option>
          {CHAINS.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Toggle filters */}
        <button
          onClick={() => setWhalesOnly(!whalesOnly)}
          className={`font-mono text-xs px-3 py-2 rounded-lg transition-all ${whalesOnly ? '' : 'opacity-60'}`}
          style={{
            background: whalesOnly ? 'rgba(255,153,0,0.15)' : 'var(--bg-surface)',
            border: `1px solid ${whalesOnly ? 'rgba(255,153,0,0.3)' : 'var(--border)'}`,
            color: whalesOnly ? 'var(--accent-amber)' : 'var(--text-secondary)',
          }}
        >
          🐋 Whales Only
        </button>

        <button
          onClick={() => setSuccessOnly(!successOnly)}
          className={`font-mono text-xs px-3 py-2 rounded-lg transition-all ${successOnly ? '' : 'opacity-60'}`}
          style={{
            background: successOnly ? 'rgba(0,255,136,0.15)' : 'var(--bg-surface)',
            border: `1px solid ${successOnly ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
            color: successOnly ? 'var(--accent-green)' : 'var(--text-secondary)',
          }}
        >
          ✓ Success Only
        </button>

        {/* Pause/Resume */}
        <button
          onClick={() => setPaused(!paused)}
          className="ml-auto flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-lg transition-all"
          style={{
            background: paused ? 'rgba(255,59,107,0.15)' : 'rgba(0,255,136,0.15)',
            border: `1px solid ${paused ? 'rgba(255,59,107,0.3)' : 'rgba(0,255,136,0.3)'}`,
            color: paused ? 'var(--accent-pink)' : 'var(--accent-green)',
          }}
        >
          {paused ? <HiOutlinePlay className="w-4 h-4" /> : <HiOutlinePause className="w-4 h-4" />}
          {paused ? 'RESUME' : 'LIVE'}
        </button>
      </div>

      {/* Live Feed */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {filteredFeed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-4xl mb-4">📡</div>
              <div className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                Waiting for transactions...
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Indexing blocks from {CHAINS.length} rollups
              </div>
            </motion.div>
          ) : (
            filteredFeed.map((tx, i) => (
              <TransactionCard key={tx.hash || tx._id || i} tx={tx} index={i} onClick={() => setSelectedTx(tx)} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}
