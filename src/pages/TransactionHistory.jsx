import { useState, useEffect } from 'react';
import { History, Filter, Search, TrendingUp, Award, Trophy, Gift, Layers, Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import oceanContractService from '../services/oceanContractService';

const TRANSACTION_TYPES = {
  STAKE: 'Stake',
  CLAIM: 'Claim',
  DIRECT_INCOME: 'Direct Income',
  SLAB_INCOME: 'Slab Income',
  ROYALTY: 'Royalty',
  REWARD: 'Reward',
};

export default function TransactionHistory() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      fetchTransactions();
    }
  }, [isConnected, address]);

  useEffect(() => {
    filterTransactions();
  }, [filter, searchTerm, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const mockData = [
        {
          id: 'tx001',
          type: TRANSACTION_TYPES.STAKE,
          amount: '100000000000',
          timestamp: Date.now() - 86400000,
          status: 'completed',
          hash: '0x' + '1'.repeat(64),
        },
        {
          id: 'tx002',
          type: TRANSACTION_TYPES.DIRECT_INCOME,
          amount: '5000000000',
          timestamp: Date.now() - 43200000,
          status: 'completed',
          hash: '0x' + '2'.repeat(64),
        },
        {
          id: 'tx003',
          type: TRANSACTION_TYPES.CLAIM,
          amount: '50000000000',
          timestamp: Date.now() - 3600000,
          status: 'completed',
          hash: '0x' + '3'.repeat(64),
        },
      ];
      setTransactions(mockData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.type === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case TRANSACTION_TYPES.STAKE:
        return <TrendingUp className="text-cyan-400" size={20} />;
      case TRANSACTION_TYPES.DIRECT_INCOME:
        return <Award className="text-neon-green" size={20} />;
      case TRANSACTION_TYPES.SLAB_INCOME:
        return <Layers className="text-neon-purple" size={20} />;
      case TRANSACTION_TYPES.ROYALTY:
        return <Trophy className="text-neon-orange" size={20} />;
      case TRANSACTION_TYPES.REWARD:
        return <Gift className="text-neon-green" size={20} />;
      case TRANSACTION_TYPES.CLAIM:
        return <Wallet className="text-cyan-400" size={20} />;
      default:
        return <History className="text-cyan-400" size={20} />;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          Transaction History
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-cyan-300/90 mt-1">Complete record of your Ocean DeFi activities</p>
      </div>

      <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={20} />
            <input
              type="text"
              placeholder="Search by transaction hash or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 cyber-glass border border-cyan-500/30 rounded-lg text-cyan-300 placeholder:text-cyan-300/50 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-neon-green text-white'
                  : 'cyber-glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter(TRANSACTION_TYPES.STAKE)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === TRANSACTION_TYPES.STAKE
                  ? 'bg-gradient-to-r from-cyan-500 to-neon-green text-white'
                  : 'cyber-glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-500'
              }`}
            >
              Stakes
            </button>
            <button
              onClick={() => setFilter(TRANSACTION_TYPES.CLAIM)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === TRANSACTION_TYPES.CLAIM
                  ? 'bg-gradient-to-r from-cyan-500 to-neon-green text-white'
                  : 'cyber-glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-500'
              }`}
            >
              Claims
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cyber-glass border border-cyan-500/20 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-cyan-500/20 rounded w-2/3 mb-3"></div>
                <div className="h-6 bg-cyan-500/30 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="cyber-glass border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 cyber-glass border border-cyan-500/20 rounded-lg mt-1">
                      {getTypeIcon(tx.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-cyan-300">{tx.type}</p>
                        <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-0.5 rounded-full border border-neon-green/30">
                          <CheckCircle className="inline-block mr-1" size={12} />
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-cyan-400/70" size={14} />
                        <p className="text-xs text-cyan-300/70">{formatDate(tx.timestamp)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-cyan-300/80 bg-dark-950/50 px-2 py-1 rounded">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </code>
                        <a
                          href={`https://ramascan.com/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-neon-green">
                      {oceanContractService.formatRAMA(tx.amount)} RAMA
                    </p>
                    <p className="text-sm text-cyan-300/70">
                      {oceanContractService.formatUSD(tx.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-cyan-400/30 mx-auto mb-3" />
            <p className="text-cyan-300/70">No transactions found</p>
            <p className="text-xs text-cyan-300/50 mt-1">
              {filter !== 'all' ? 'Try changing your filter' : 'Your transactions will appear here'}
            </p>
          </div>
        )}
      </div>

      <div className="cyber-glass border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Blockchain Verified</p>
            <p className="text-xs text-cyan-300/90">
              All transactions are recorded on the Ramestta blockchain and can be verified on the block explorer. Transaction history will be enhanced with Supabase caching for faster loading in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
