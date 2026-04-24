import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineCode, HiOutlineChevronDown } from 'react-icons/hi';
import { postQuery } from '../lib/api';
import TransactionCard from '../components/TransactionCard';
import TransactionModal from '../components/TransactionModal';

const EXAMPLE_QUERIES = [
  'Whale transactions in the last hour',
  'Failed swaps on MiniMove today',
  'All bridge transactions this week',
  'Most recent contract executions on MiniEVM',
  'Stake transactions above 1000 INIT',
  'Show all governance votes this week',
  'Largest transfers on Initia L1',
  'NFT transactions on MiniWasm',
];

export default function AIQuery() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const handleSubmit = async (q) => {
    const query = q || question;
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await postQuery(query);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (q) => {
    setQuestion(q);
    handleSubmit(q);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <HiOutlineSparkles className="w-8 h-8" style={{ color: 'var(--accent-violet)' }} />
          <h2 className="font-mono text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            AI Query Engine
          </h2>
        </motion.div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Ask anything about on-chain activity across all Initia rollups
        </p>
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="gradient-border rounded-2xl p-[1px]">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about on-chain activity..."
                className="flex-1 px-6 py-4 text-base outline-none bg-transparent"
                style={{ color: 'var(--text-primary)' }}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="px-6 py-4 font-mono text-sm font-bold transition-all disabled:opacity-40"
                style={{ color: 'var(--accent-cyan)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                  </span>
                ) : 'QUERY'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Example Chips */}
      {!result && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleChipClick(q)}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(124,58,237,0.4)';
                e.target.style.color = 'var(--accent-violet)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              {q}
            </button>
          ))}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 text-sm"
          style={{ background: 'rgba(255,59,107,0.1)', border: '1px solid rgba(255,59,107,0.2)', color: 'var(--accent-pink)' }}
        >
          {error}
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* AI Description */}
          <div className="rounded-xl p-4"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineSparkles className="w-4 h-4" style={{ color: 'var(--accent-violet)' }} />
              <span className="text-xs font-bold uppercase" style={{ color: 'var(--accent-violet)' }}>AI Interpretation</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {result.description}
            </p>
          </div>

          {/* Filter JSON (collapsible) */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <HiOutlineCode className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  Generated MongoDB Filter
                </span>
              </div>
              <HiOutlineChevronDown
                className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>
            {showFilter && (
              <pre className="px-4 pb-4 font-mono text-xs overflow-x-auto"
                style={{ color: 'var(--accent-cyan)' }}>
                {JSON.stringify(result.filter, null, 2)}
              </pre>
            )}
          </div>

          {/* Result Count */}
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Found <span className="font-mono font-bold" style={{ color: 'var(--accent-cyan)' }}>{result.count}</span> transactions
          </div>

          {/* Transaction Results */}
          <div className="space-y-2">
            {result.transactions?.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <div className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                  No matching transactions found
                </div>
              </div>
            ) : (
              result.transactions?.map((tx, i) => (
                <TransactionCard key={tx.hash || tx._id} tx={tx} index={i} onClick={() => setSelectedTx(tx)} />
              ))
            )}
          </div>
        </motion.div>
      )}

      {selectedTx && <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}
