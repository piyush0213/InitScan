import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import socket from '../lib/socket';
import { getRollupHealth } from '../lib/api';
import { getChainColor, formatNumber, timeAgo } from '../lib/utils';

export default function RollupHealth() {
  const { data: initialHealth } = useQuery({
    queryKey: ['rollupHealth'],
    queryFn: getRollupHealth,
    refetchInterval: 15000,
  });

  const [health, setHealth] = useState([]);

  useEffect(() => {
    if (initialHealth) setHealth(initialHealth);
  }, [initialHealth]);

  useEffect(() => {
    const handler = (data) => setHealth(data);
    socket.on('chain_health_update', handler);
    return () => socket.off('chain_health_update', handler);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Rollup Health Monitor
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Real-time status of all Initia rollups • Auto-refreshes every 15s
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {health.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl p-6 animate-pulse" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', height: '180px' }} />
          ))
        ) : (
          health.map((chain, i) => {
            const color = getChainColor(chain.chainId);
            const isOnline = chain.status === 'online';

            return (
              <motion.div
                key={chain.chainId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl p-6 relative overflow-hidden transition-all"
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isOnline ? `${color}30` : 'rgba(255,59,107,0.2)'}`,
                  boxShadow: isOnline ? `0 0 30px ${color}10` : 'none',
                }}
              >
                {/* Glow effect for online chains */}
                {isOnline && (
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${color}, transparent 70%)` }} />
                )}

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isOnline ? 'animate-pulse-glow' : ''}`}
                        style={{ background: isOnline ? color : 'var(--accent-pink)', boxShadow: isOnline ? `0 0 8px ${color}80` : 'none' }} />
                      <h3 className="font-mono font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {chain.chainName}
                      </h3>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${isOnline ? 'badge-success' : 'badge-failed'}`}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>

                  {/* Chain type badge */}
                  <div className="mb-4">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono"
                      style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
                      {chain.chainType}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Latest Block</span>
                      <span className="font-mono text-sm font-bold" style={{ color: isOnline ? color : 'var(--text-muted)' }}>
                        #{formatNumber(chain.latestHeight)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Last Checked</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {chain.lastChecked ? timeAgo(chain.lastChecked) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Uptime Streak</span>
                      <span className="font-mono text-xs" style={{ color: isOnline ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
                        {chain.consecutiveOnline} checks
                      </span>
                    </div>
                  </div>

                  {/* Health bar */}
                  <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isOnline ? '100%' : '0%' }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: isOnline ? color : 'var(--accent-pink)' }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
