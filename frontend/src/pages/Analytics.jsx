import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAnalyticsSummary } from '../lib/api';
import { CHAIN_COLORS, formatNumber } from '../lib/utils';
import StatCard from '../components/StatCard';
import { HiOutlineDatabase, HiOutlineTrendingUp, HiOutlineGlobe, HiOutlineLightningBolt } from 'react-icons/hi';

const COLORS = ['#00D4FF', '#7C3AED', '#00FF88', '#FF9900', '#FF3B6B', '#00FFCC', '#E8F4FF', '#7A9BBC'];

const tooltipStyle = {
  contentStyle: { background: '#112035', border: '1px solid #1A2840', borderRadius: '12px', fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#E8F4FF' },
  itemStyle: { color: '#E8F4FF' },
  labelStyle: { color: '#7A9BBC' },
};

export default function Analytics() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalyticsSummary,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div className="text-center py-20"><div className="text-4xl mb-4 animate-pulse">📊</div><div className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>Loading analytics...</div></div>;
  }

  const byChainData = (summary?.byChain || []).map(c => ({
    name: c.chainName || c._id,
    count: c.count,
    fill: CHAIN_COLORS[c._id] || '#00D4FF',
  }));

  const byTypeData = (summary?.byType || []).map((t, i) => ({
    name: t._id,
    value: t.count,
    fill: COLORS[i % COLORS.length],
  }));

  const byTagData = (summary?.byTag || []).map((t, i) => ({
    name: t._id,
    count: t.count,
    fill: COLORS[i % COLORS.length],
  }));

  const hourlyData = (summary?.byHour || []).map(h => ({
    hour: h._id?.split('T')[1]?.slice(0, 5) || h._id,
    total: h.count,
    whale: h.whaleCount || 0,
    regular: h.count - (h.whaleCount || 0),
  }));

  const failRateData = (summary?.failRate || []).map(c => ({
    name: c.chainName || c.chainId,
    success: c.total - c.failed,
    failed: c.failed,
    fill: CHAIN_COLORS[c.chainId] || '#00D4FF',
  }));

  const mostActive = summary?.byChain?.[0]?.chainName || '—';
  const topType = summary?.byType?.[0]?._id || '—';
  const whalePercent = summary?.totalTxs > 0 ? ((summary.whaleCount / summary.totalTxs) * 100).toFixed(1) : '0';
  const peakHour = hourlyData.reduce((max, h) => h.total > (max?.total || 0) ? h : max, {})?.hour || '—';

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard label="Total Indexed" value={formatNumber(summary?.totalTxs)} icon={<HiOutlineDatabase className="w-5 h-5" />} color="var(--accent-cyan)" />
        <StatCard label="24h Volume" value={formatNumber(summary?.txsLast24h)} icon={<HiOutlineTrendingUp className="w-5 h-5" />} color="var(--accent-green)" />
        <StatCard label="Most Active" value={mostActive} icon={<HiOutlineGlobe className="w-5 h-5" />} color="var(--accent-violet)" mono={false} />
        <StatCard label="Top Type" value={topType} icon={<HiOutlineLightningBolt className="w-5 h-5" />} color="var(--accent-amber)" mono={false} />
        <StatCard label="Whale %" value={`${whalePercent}%`} icon={<span className="text-lg">🐋</span>} color="var(--accent-amber)" />
        <StatCard label="Peak Hour" value={peakHour} icon={<span className="text-lg">⚡</span>} color="var(--accent-pink)" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Transactions per chain */}
        <ChartCard title="Transactions by Chain (24h)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byChainData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2840" /><XAxis dataKey="name" tick={{ fill: '#7A9BBC', fontSize: 11 }} /><YAxis tick={{ fill: '#7A9BBC', fontSize: 11 }} /><Tooltip {...tooltipStyle} /><Bar dataKey="count" radius={[6, 6, 0, 0]}>{byChainData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Volume over time */}
        <ChartCard title="Transaction Volume (24h)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hourlyData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2840" /><XAxis dataKey="hour" tick={{ fill: '#7A9BBC', fontSize: 11 }} /><YAxis tick={{ fill: '#7A9BBC', fontSize: 11 }} /><Tooltip {...tooltipStyle} /><Line type="monotone" dataKey="total" stroke="#00D4FF" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Type breakdown (donut) */}
        <ChartCard title="Transaction Type Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={byTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">{byTypeData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip {...tooltipStyle} /><Legend wrapperStyle={{ fontSize: '11px', color: '#7A9BBC' }} /></PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Tag distribution */}
        <ChartCard title="Tag Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byTagData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#1A2840" /><XAxis type="number" tick={{ fill: '#7A9BBC', fontSize: 11 }} /><YAxis dataKey="name" type="category" tick={{ fill: '#7A9BBC', fontSize: 11 }} width={80} /><Tooltip {...tooltipStyle} /><Bar dataKey="count" radius={[0, 6, 6, 0]}>{byTagData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Whale vs regular */}
        <ChartCard title="Whale vs Regular (24h)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2840" /><XAxis dataKey="hour" tick={{ fill: '#7A9BBC', fontSize: 11 }} /><YAxis tick={{ fill: '#7A9BBC', fontSize: 11 }} /><Tooltip {...tooltipStyle} /><Area type="monotone" dataKey="regular" stackId="1" stroke="#00D4FF" fill="#00D4FF30" /><Area type="monotone" dataKey="whale" stackId="1" stroke="#FF9900" fill="#FF990030" /><Legend wrapperStyle={{ fontSize: '11px', color: '#7A9BBC' }} /></AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6. Success vs Failed */}
        <ChartCard title="Success vs Failed by Chain">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={failRateData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2840" /><XAxis dataKey="name" tick={{ fill: '#7A9BBC', fontSize: 11 }} /><YAxis tick={{ fill: '#7A9BBC', fontSize: 11 }} /><Tooltip {...tooltipStyle} /><Bar dataKey="success" stackId="a" fill="#00FF88" radius={[0, 0, 0, 0]} /><Bar dataKey="failed" stackId="a" fill="#FF3B6B" radius={[6, 6, 0, 0]} /><Legend wrapperStyle={{ fontSize: '11px', color: '#7A9BBC' }} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <h3 className="font-mono text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      {children}
    </motion.div>
  );
}
