import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineLightningBolt, HiOutlineClock } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getAlerts, createAlert, updateAlert, deleteAlert } from '../lib/api';
import { CHAINS, TX_TYPES, TAGS, timeAgo } from '../lib/utils';

function CreateAlertModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '', conditions: { chainIds: [], txTypes: [], minAmountUSD: 0, senderAddress: '', receiverAddress: '', isWhale: false, tags: [] }, webhookUrl: '',
  });
  const mutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => { queryClient.invalidateQueries(['alerts']); toast.success('Alert created!'); onClose(); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });
  const toggleArr = (field, item) => {
    setForm(prev => {
      const arr = prev.conditions[field];
      const next = arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
      return { ...prev, conditions: { ...prev.conditions, [field]: next } };
    });
  };
  const iStyle = { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' };
  const chip = (active, color) => ({
    background: active ? `${color}20` : 'var(--bg-base)',
    border: `1px solid ${active ? `${color}50` : 'var(--border)'}`,
    color: active ? color : 'var(--text-secondary)',
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: 'rgba(8,11,20,0.85)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-mono text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Create Alert</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Alert Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Large whale transfer" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={iStyle} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Chains</label>
            <div className="flex flex-wrap gap-2">{CHAINS.map(c => <button key={c.id} onClick={() => toggleArr('chainIds', c.id)} className="text-xs px-3 py-1.5 rounded-lg" style={chip(form.conditions.chainIds.includes(c.id), '#00D4FF')}>{c.name}</button>)}</div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>TX Types</label>
            <div className="flex flex-wrap gap-2">{TX_TYPES.map(t => <button key={t} onClick={() => toggleArr('txTypes', t)} className="text-xs px-3 py-1.5 rounded-lg" style={chip(form.conditions.txTypes.includes(t), '#7C3AED')}>{t}</button>)}</div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Tags</label>
            <div className="flex flex-wrap gap-2">{TAGS.map(t => <button key={t} onClick={() => toggleArr('tags', t)} className="text-xs px-3 py-1.5 rounded-lg" style={chip(form.conditions.tags.includes(t), '#00FFCC')}>{t}</button>)}</div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Whale Only</label>
            <button onClick={() => setForm(p => ({ ...p, conditions: { ...p.conditions, isWhale: !p.conditions.isWhale } }))} className="w-11 h-6 rounded-full relative" style={{ background: form.conditions.isWhale ? 'rgba(255,153,0,0.3)' : 'var(--border)' }}>
              <div className="w-4 h-4 rounded-full absolute top-1 transition-all" style={{ left: form.conditions.isWhale ? '24px' : '4px', background: form.conditions.isWhale ? '#FF9900' : 'var(--text-muted)' }} />
            </button>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Min Amount (INIT)</label>
            <input type="number" value={form.conditions.minAmountUSD || ''} onChange={e => setForm(p => ({ ...p, conditions: { ...p.conditions, minAmountUSD: parseFloat(e.target.value) || 0 } }))} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none font-mono" style={iStyle} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Watch Address</label>
            <input value={form.conditions.senderAddress} onChange={e => setForm(p => ({ ...p, conditions: { ...p.conditions, senderAddress: e.target.value } }))} placeholder="init1..." className="w-full px-4 py-2.5 rounded-lg text-sm outline-none font-mono" style={iStyle} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Webhook URL</label>
            <input value={form.webhookUrl} onChange={e => setForm({ ...form, webhookUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={iStyle} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={() => mutation.mutate(form)} disabled={!form.name.trim()} className="px-6 py-2 rounded-lg font-mono text-sm font-bold disabled:opacity-40" style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--accent-cyan)' }}>Create</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Alerts() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const { data: alerts = [], isLoading } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });
  const toggleMut = useMutation({ mutationFn: ({ id, isActive }) => updateAlert(id, { isActive }), onSuccess: () => queryClient.invalidateQueries(['alerts']) });
  const delMut = useMutation({ mutationFn: deleteAlert, onSuccess: () => { queryClient.invalidateQueries(['alerts']); toast.success('Deleted'); } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Smart Alerts</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Get notified on specific on-chain events</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-sm font-bold hover:scale-105 transition-all" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--accent-cyan)' }}>
          <HiOutlinePlus className="w-4 h-4" /> Create Alert
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><div className="text-4xl mb-4 animate-pulse">🔔</div><div className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div></div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20"><div className="text-5xl mb-4">🔕</div><div className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>No alerts configured yet</div></div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((a, i) => (
              <motion.div key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: `1px solid ${a.isActive ? 'rgba(0,212,255,0.15)' : 'var(--border)'}`, opacity: a.isActive ? 1 : 0.6 }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{a.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${a.isActive ? 'badge-success' : 'badge-failed'}`}>{a.isActive ? 'ACTIVE' : 'PAUSED'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {a.conditions?.chainIds?.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF' }}>{a.conditions.chainIds.length} chains</span>}
                      {a.conditions?.txTypes?.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}>{a.conditions.txTypes.join(', ')}</span>}
                      {a.conditions?.isWhale && <span className="text-[10px] px-2 py-0.5 rounded badge-whale">🐋 Whale</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><HiOutlineLightningBolt className="w-3.5 h-3.5" /><span className="font-mono">{a.triggerCount}</span> triggers</span>
                      {a.lastTriggered && <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" />Last: {timeAgo(a.lastTriggered)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => toggleMut.mutate({ id: a._id, isActive: !a.isActive })} className="w-11 h-6 rounded-full relative" style={{ background: a.isActive ? 'rgba(0,255,136,0.3)' : 'var(--border)' }}>
                      <div className="w-4 h-4 rounded-full absolute top-1 transition-all" style={{ left: a.isActive ? '24px' : '4px', background: a.isActive ? '#00FF88' : 'var(--text-muted)' }} />
                    </button>
                    <button onClick={() => delMut.mutate(a._id)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: '#FF3B6B' }}><HiOutlineTrash className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {showCreate && <CreateAlertModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
