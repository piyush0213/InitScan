import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineBell,
  HiOutlineChartBar,
  HiOutlineStatusOnline,
} from 'react-icons/hi';

const links = [
  { to: '/', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { to: '/explorer', icon: HiOutlineSearch, label: 'Explorer' },
  { to: '/query', icon: HiOutlineSparkles, label: 'AI Query' },
  { to: '/alerts', icon: HiOutlineBell, label: 'Alerts' },
  { to: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  { to: '/health', icon: HiOutlineStatusOnline, label: 'Health' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] flex flex-col items-center py-4 gap-1 z-50"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 overflow-hidden border border-[var(--border)]">
        <img src="/logo.png" alt="InitScan Logo" className="w-full h-full object-cover" />
      </div>

      {/* Nav links */}
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
          style={({ isActive }) => ({
            background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
            color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
            border: isActive ? '1px solid rgba(0, 212, 255, 0.2)' : '1px solid transparent',
          })}
        >
          <Icon className="w-5 h-5" />
          {/* Tooltip */}
          <span className="absolute left-full ml-3 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            {label}
          </span>
        </NavLink>
      ))}
    </aside>
  );
}
