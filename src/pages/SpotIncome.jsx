import { Coins, TrendingUp, Award, Clock, AlertCircle, Zap, Target, Wallet, Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useUserOverview, useTeamNetwork } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';
import { useIncomeDistributorContract } from '../hooks/useContract';
import { useEffect, useState } from 'react';

const spotLevels = [
  { level: 1, minInvestment: '$100', earning: '5%', minDirects: 0, description: 'Starter Level' },
  { level: 2, minInvestment: '$500', earning: '5%', minDirects: 3, description: 'Bronze Level' },
  { level: 3, minInvestment: '$1,000', earning: '5%', minDirects: 5, description: 'Silver Level' },
  { level: 4, minInvestment: '$5,000', earning: '5%', minDirects: 10, description: 'Gold Level' },
];

export default function SpotIncome() {
  const { address, isConnected } = useAccount();
  const { data: overview, loading: overviewLoading } = useUserOverview();
  const { data: teamNetwork, loading: teamLoading } = useTeamNetwork();
  const incomeDistributor = useIncomeDistributorContract();
  const [directIncome, setDirectIncome] = useState('0');
  const [loadingIncome, setLoadingIncome] = useState(true);

  useEffect(() => {
    async function fetchDirectIncome() {
      if (!incomeDistributor || !address) {
        setLoadingIncome(false);
        return;
      }

      try {
        const income = await incomeDistributor.methods.directIncome(address).call();
        setDirectIncome(income);
      } catch (error) {
        console.error('Error fetching direct income:', error);
      } finally {
        setLoadingIncome(false);
      }
    }

    fetchDirectIncome();
  }, [incomeDistributor, address]);

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view spot income details</p>
        </div>
      </div>
    );
  }

  if (overviewLoading || teamLoading || loadingIncome) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-cyan-500/20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-cyan-500/10 rounded w-1/2"></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="cyber-glass rounded-xl p-6 border border-cyan-500/30 animate-pulse">
              <div className="h-4 bg-cyan-500/20 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-cyan-500/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const directCount = overview?.directCount || 0;
  const teamCount = overview?.teamCount || 0;
  const totalStakedUSD = overview?.totalStakedUSD || '0';
  const directIncomeRAMA = directIncome || '0';

  const directMembers = teamNetwork?.directs || [];
  const activeDirects = directMembers.length;

  const averageSpotValue = activeDirects > 0
    ? oceanContractService.toRAMA(directIncomeRAMA) / activeDirects
    : 0;

  const currentLevel = activeDirects >= 10 ? 4 : activeDirects >= 5 ? 3 : activeDirects >= 3 ? 2 : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          Spot Income (Direct Income)
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-cyan-300/90 mt-1">Earn 5% direct commission on portfolio creation and topups</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="cyber-glass border border-cyan-500/50 rounded-2xl p-6 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-neon-green/10 opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-cyan-500/20 rounded-lg backdrop-blur-sm border border-cyan-500/30">
              <Coins size={24} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-cyan-300 font-medium uppercase tracking-wide">Total Direct Earnings</p>
              <p className="text-xs text-cyan-300/90">5% commission from directs</p>
            </div>
          </div>
          <p className="text-4xl font-bold mb-2 text-cyan-400 relative z-10">
            {oceanContractService.formatRAMA(directIncomeRAMA)} RAMA
          </p>
          <p className="text-sm text-neon-green relative z-10">
            {oceanContractService.formatUSD(directIncomeRAMA)} USD Equivalent
          </p>
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-neon-green/20 rounded-lg">
              <Users className="text-neon-green" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">Direct Referrals</p>
              <p className="text-xs text-cyan-300/90">Active income sources</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-neon-green">{directCount.toString()}</p>
          <p className="text-sm text-cyan-300/90 mt-1">Avg. {averageSpotValue.toFixed(2)} RAMA/direct</p>
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-neon-orange/20 rounded-lg">
              <Target className="text-neon-orange" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">Current Level</p>
              <p className="text-xs text-cyan-300/90">Direct income tier</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-neon-orange">Level {currentLevel}</p>
          <p className="text-sm text-cyan-300/90 mt-1">{spotLevels[currentLevel - 1].description}</p>
        </div>
      </div>

      <div className="cyber-glass rounded-2xl p-6 border-2 border-neon-green relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-green/50 to-transparent" />
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-neon-green uppercase tracking-wide">Direct Income Levels</h2>
              <p className="text-sm text-cyan-300/90 mt-1">Unlock higher tiers by building your direct team</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-cyan-300/90">Commission Rate</p>
              <p className="text-2xl font-bold text-neon-green">5%</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spotLevels.map((spot) => {
            const isActive = currentLevel >= spot.level;
            const isCurrentLevel = currentLevel === spot.level;

            return (
              <div
                key={spot.level}
                className={`cyber-glass rounded-xl p-4 border-2 transition-all ${
                  isCurrentLevel
                    ? 'border-neon-green hover:border-neon-green/70 hover:shadow-neon-green bg-neon-green/5'
                    : isActive
                    ? 'border-cyan-500/50 hover:border-cyan-500/70'
                    : 'border-cyan-500/20 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      isCurrentLevel
                        ? 'bg-neon-green/20 text-neon-green'
                        : isActive
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-cyan-500/10 text-cyan-300/50'
                    }`}
                  >
                    Level {spot.level}
                  </span>
                  {isCurrentLevel && (
                    <Zap size={16} className="text-neon-green animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-cyan-300/90 mb-1">{spot.description}</p>
                <p className="text-sm text-cyan-300 mb-1">Min Directs: {spot.minDirects}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-cyan-300/90">Income Rate</span>
                  <span className="text-lg font-bold text-neon-green">{spot.earning}</span>
                </div>
                <div className="mt-3">
                  {isCurrentLevel ? (
                    <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded-full font-medium">
                      Current
                    </span>
                  ) : isActive ? (
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full font-medium">
                      Achieved
                    </span>
                  ) : (
                    <span className="text-xs bg-cyan-500/10 text-cyan-300/50 px-2 py-1 rounded-full font-medium">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-cyan-400" size={24} />
            <h3 className="text-lg font-semibold text-cyan-300">Your Direct Team</h3>
          </div>

          {directMembers.length > 0 ? (
            <div className="space-y-3">
              {directMembers.slice(0, 5).map((member, idx) => (
                <div
                  key={idx}
                  className="cyber-glass border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Award size={20} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cyan-300 font-mono">
                          {member.slice(0, 6)}...{member.slice(-4)}
                        </p>
                        <p className="text-xs text-cyan-300/70">Direct Member #{idx + 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {directMembers.length > 5 && (
                <p className="text-sm text-cyan-300/70 text-center pt-2">
                  +{directMembers.length - 5} more direct members
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-cyan-400/30 mx-auto mb-3" />
              <p className="text-cyan-300/70">No direct referrals yet</p>
              <p className="text-xs text-cyan-300/50 mt-1">Start building your team to earn direct commission</p>
            </div>
          )}
        </div>

        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="font-semibold text-cyan-300 mb-4">How Direct Income Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Portfolio Creation & Topup</p>
                <p className="text-xs text-cyan-300/90">
                  Earn 5% instant commission whenever your direct referral creates a new portfolio or tops up
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Level Progression</p>
                <p className="text-xs text-cyan-300/90">
                  Unlock higher levels by building a larger direct team
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Instant Credit</p>
                <p className="text-xs text-cyan-300/90">
                  Direct income is credited immediately to your account
                </p>
              </div>
            </div>

            <div className="p-4 cyber-glass border border-neon-green/20 rounded-lg mt-4">
              <p className="text-sm font-medium text-neon-green mb-2">Earning Calculation</p>
              <p className="text-xs text-cyan-300/90">
                When your direct referral stakes $1,000 worth of RAMA:
              </p>
              <p className="text-xs text-neon-green font-bold mt-2">
                Your direct income = $1,000 × 5% = $50 RAMA
              </p>
            </div>

            <div className="p-4 cyber-glass border border-cyan-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-cyan-300">Team Statistics</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300/90">Direct Members:</span>
                  <span className="text-cyan-300 font-bold">{directCount.toString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300/90">Total Team:</span>
                  <span className="text-cyan-300 font-bold">{teamCount.toString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300/90">Team Volume:</span>
                  <span className="text-cyan-300 font-bold">{oceanContractService.formatUSD(totalStakedUSD)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-glass border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Blockchain Integrated</p>
            <p className="text-xs text-cyan-300/90">
              This page displays real-time data from the Ocean DeFi smart contracts. Direct income (Spot Income) represents your 5% commission earnings from direct referrals when they create new portfolios or topup existing ones. All data is fetched directly from the Ramestta blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
