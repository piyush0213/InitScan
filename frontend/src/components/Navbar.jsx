import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import socket from '../lib/socket';

const pageTitles = {
  '/': 'Live Dashboard',
  '/explorer': 'Transaction Explorer',
  '/query': 'AI Query Engine',
  '/alerts': 'Smart Alerts',
  '/analytics': 'Analytics Hub',
  '/health': 'Rollup Health',
};

export default function Navbar() {
  const location = useLocation();
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const title = pageTitles[location.pathname] || 'InitScan';

  return (
    <header className="h-16 flex items-center justify-between pl-2 pr-6 shrink-0 relative overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>

      {/* Scanline overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.1) 2px, rgba(0,212,255,0.1) 4px)',
        }} />

      <div className="flex items-center gap-4 z-10">
        <h1 className="font-mono text-lg font-bold tracking-wider" style={{ color: 'var(--accent-cyan)' }}>
          INITSCAN
        </h1>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/</span>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{title}</span>
      </div>

      <div className="flex items-center gap-4 z-10">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'animate-pulse-glow' : ''}`}
            style={{ background: connected ? 'var(--accent-green)' : 'var(--accent-pink)' }} />
          <span className="font-mono text-xs" style={{ color: connected ? 'var(--accent-green)' : 'var(--accent-pink)' }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Network badge */}
        <div className="px-3 py-1 rounded-full text-xs font-mono"
          style={{ background: 'rgba(0, 212, 255, 0.08)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
          TESTNET
        </div>
      </div>
    </header>
  );
}
