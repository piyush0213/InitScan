import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';
import { getTransactions } from '../lib/api';
import TransactionCard from '../components/TransactionCard';
import TransactionModal from '../components/TransactionModal';
import { CHAINS, TX_TYPES, TAGS } from '../lib/utils';

export default function Explorer() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    chainId: '',
    txType: '',
    tag: '',
    status: '',
    isWhale: '',
    from: '',
    to: '',
    sort: 'timestamp',
    order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const queryParams = {
    page,
    limit: 20,
    search: search || undefined,
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    ),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['explorer', queryParams],
    queryFn: () => getTransactions(queryParams),
    keepPreviousData: true,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const selectStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hash, address, or memo..."
            className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none font-mono transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 rounded-xl flex items-center gap-2 text-sm transition-all"
          style={{
            background: showFilters ? 'rgba(0,212,255,0.1)' : 'var(--bg-surface)',
            border: `1px solid ${showFilters ? 'rgba(0,212,255,0.3)' : 'var(--border)'}`,
            color: showFilters ? 'var(--accent-cyan)' : 'var(--text-secondary)',
          }}
        >
          <HiOutlineFilter className="w-4 h-4" />
          Filters
        </button>
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <select value={filters.chainId} onChange={(e) => updateFilter('chainId', e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none cursor-pointer" style={selectStyle}>
            <option value="">All Chains</option>
            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={filters.txType} onChange={(e) => updateFilter('txType', e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none cursor-pointer" style={selectStyle}>
            <option value="">All Types</option>
            {TX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={filters.tag} onChange={(e) => updateFilter('tag', e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none cursor-pointer" style={selectStyle}>
            <option value="">All Tags</option>
            {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none cursor-pointer" style={selectStyle}>
            <option value="">Any Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <select value={filters.isWhale} onChange={(e) => updateFilter('isWhale', e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none cursor-pointer" style={selectStyle}>
            <option value="">All Sizes</option>
            <option value="true">Whales Only</option>
          </select>

          <input type="datetime-local" value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none" style={selectStyle} />

          <input type="datetime-local" value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none" style={selectStyle} />

          <select value={filters.order} onChange={(e) => updateFilter('order', e.target.value)}
            className="text-sm rounded-lg px-3 py-2 outline-none cursor-pointer" style={selectStyle}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {data?.total ? `${data.total.toLocaleString()} transactions found` : 'Loading...'}
          {isFetching && <span className="ml-2 animate-pulse">⏳</span>}
        </span>
        {data?.pages > 1 && (
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {data.page} of {data.pages}
          </span>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">⛓️</div>
            <div className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>Loading transactions...</div>
          </div>
        ) : data?.transactions?.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <div className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>No transactions found</div>
          </div>
        ) : (
          data?.transactions?.map((tx, i) => (
            <TransactionCard key={tx.hash || tx._id} tx={tx} index={i} onClick={() => setSelectedTx(tx)} />
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="font-mono text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-30"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i;
            if (p > data.pages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="font-mono text-xs w-9 h-9 rounded-lg transition-all"
                style={{
                  background: p === page ? 'rgba(0,212,255,0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${p === page ? 'rgba(0,212,255,0.3)' : 'var(--border)'}`,
                  color: p === page ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={page === data.pages}
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            className="font-mono text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-30"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            Next →
          </button>
        </div>
      )}

      {selectedTx && <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}
