import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../lib/socket';
import { truncateHash, getChainColor } from '../lib/utils';

export default function AlertToast() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const handler = (data) => {
      const id = Date.now() + Math.random();
      setAlerts(prev => [...prev, { ...data, id }].slice(-5));

      // Auto dismiss after 8 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, 8000);
    };

    socket.on('alert_triggered', handler);
    return () => socket.off('alert_triggered', handler);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="pointer-events-auto rounded-xl p-4 w-80"
            style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${getChainColor(alert.transaction?.chainId)}40`,
              boxShadow: `0 0 20px ${getChainColor(alert.transaction?.chainId)}15`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: 'var(--accent-amber)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--accent-amber)' }}>
                ALERT
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {alert.alertName}
              </span>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {alert.transaction?.txType} on {alert.transaction?.chainName} •{' '}
              <span className="font-mono">{truncateHash(alert.transaction?.hash)}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
