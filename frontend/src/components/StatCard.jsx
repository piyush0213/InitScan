import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon, color = 'var(--accent-cyan)', mono = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 flex items-center gap-4"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: `0 0 30px ${color}08`,
      }}
    >
      {icon && (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}12`, color: color }}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
        <div className={`text-xl font-bold truncate ${mono ? 'font-mono' : ''}`} style={{ color }}>
          {value}
        </div>
      </div>
    </motion.div>
  );
}
