import { Calendar, Filter } from 'lucide-react';
import { useState } from 'react';
import oceanContractService from '../services/oceanContractService';

export default function DailyEarningHistory({
  earningHistory = [],
  portfolios = [],
  loading = false
}) {
  const [selectedPortfolio, setSelectedPortfolio] = useState('all');

  const filteredHistory = selectedPortfolio === 'all'
    ? earningHistory
    : earningHistory.filter(entry => entry.portfolioId === selectedPortfolio);

  return (
    <div className="space-y-4">
      <div className="cyber-glass rounded-xl p-4 sm:p-6 border border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-cyan-300 uppercase tracking-wide">
              Daily Earning History
            </h2>
            <p className="text-sm text-cyan-300/90 mt-1">
              Track your daily earning rewards from smart contracts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-cyan-400" />
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            >
              <option value="all">All Portfolios</option>
              {portfolios?.map((portfolio) => (
                <option key={portfolio.pid} value={portfolio.pid}>
                  Portfolio #{portfolio.pid} (
                  {oceanContractService.formatUSD(portfolio.principalUSD)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center justify-between p-4 cyber-glass rounded-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-cyan-500/20 rounded w-24"></div>
                  <div className="h-3 bg-cyan-500/10 rounded w-32"></div>
                </div>
                <div className="h-6 bg-cyan-500/20 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : filteredHistory && filteredHistory.length > 0 ? (
          <div className="space-y-2">
            {filteredHistory.map((entry, index) => (
              <div
                key={index}
                className="cyber-glass rounded-lg p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neon-green/10 rounded-lg">
                      <Calendar size={18} className="text-neon-green" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cyan-300">
                        {entry.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-cyan-400/70 mt-0.5">
                        Day ID: {entry.dayId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neon-green">
                      {oceanContractService.formatUSD(entry.amountUSD)}
                    </p>
                    <p className="text-xs text-cyan-400/70">
                      ≈{' '}
                      {oceanContractService.formatRAMA(
                        (
                          (BigInt(entry.amountUSD) *
                            BigInt('1000000000000000000')) /
                          BigInt('100000000')
                        ).toString()
                      )}{' '}
                      RAMA
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-cyan-400/30 mb-4" />
            <p className="text-cyan-300/70 text-sm">
              No earning history found for the selected period
            </p>
            <p className="text-cyan-400/50 text-xs mt-2">
              Earnings will appear here once you start receiving rewards
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
