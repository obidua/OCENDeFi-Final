import { TrendingUp, Users, DollarSign, Award, Wallet, AlertCircle, Target, BarChart3 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useUserOverview } from '../hooks/useOceanData';
import { useIncomeDistributorContract } from '../hooks/useContract';
import { useEffect, useState } from 'react';
import oceanContractService from '../services/oceanContractService';

export default function Analytics() {
  const { address, isConnected } = useAccount();
  const { data: overview, loading: overviewLoading } = useUserOverview();
  const incomeDistributor = useIncomeDistributorContract();
  const [incomeBreakdown, setIncomeBreakdown] = useState({
    direct: '0',
    slab: '0',
    total: '0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIncomeData() {
      if (!incomeDistributor || !address) {
        setLoading(false);
        return;
      }

      try {
        const [directIncome, differenceIncome] = await Promise.all([
          incomeDistributor.methods.directIncome(address).call(),
          incomeDistributor.methods.differenceIncome(address).call(),
        ]);

        const totalIncome = (BigInt(directIncome) + BigInt(differenceIncome)).toString();

        setIncomeBreakdown({
          direct: directIncome,
          slab: differenceIncome,
          total: totalIncome,
        });
      } catch (error) {
        console.error('Error fetching income data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIncomeData();
  }, [incomeDistributor, address]);

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view analytics</p>
        </div>
      </div>
    );
  }

  if (overviewLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-cyan-500/20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-cyan-500/10 rounded w-1/2"></div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="cyber-glass rounded-xl p-6 border border-cyan-500/30 animate-pulse">
              <div className="h-4 bg-cyan-500/20 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-cyan-500/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalStakedUSD = overview?.totalStakedUSD || '0';
  const qualifiedVolumeUSD = overview?.qualifiedVolumeUSD || '0';
  const directCount = overview?.directCount || 0;
  const teamCount = overview?.teamCount || 0;
  const slabIndex = overview?.slabIndex || 0;
  const royaltyTier = overview?.royaltyTier || 0;

  const totalEarned = oceanContractService.toUSD(incomeBreakdown.total);
  const directEarned = oceanContractService.toUSD(incomeBreakdown.direct);
  const slabEarned = oceanContractService.toUSD(incomeBreakdown.slab);
  const stakedValue = oceanContractService.toUSD(totalStakedUSD);
  const qualifiedVolume = oceanContractService.toUSD(qualifiedVolumeUSD);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          Analytics & Performance
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-cyan-300/90 mt-1">Track your portfolio performance and team growth</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="cyber-glass rounded-xl p-5 border border-cyan-500/30 hover:border-cyan-500/50 relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 cyber-glass border border-cyan-500/30 rounded-lg">
              <DollarSign className="text-cyan-400" size={20} />
            </div>
            <p className="text-sm font-medium text-cyan-400 uppercase tracking-wide">Total Earned</p>
          </div>
          <p className="text-2xl font-bold text-cyan-300">${totalEarned.toLocaleString()}</p>
          <p className="text-xs text-neon-green mt-1">All time earnings</p>
        </div>

        <div className="cyber-glass rounded-xl p-5 border border-cyan-500/30 hover:border-cyan-500/50 relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-green/50 to-transparent" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 cyber-glass border border-neon-green/30 rounded-lg">
              <TrendingUp className="text-neon-green" size={20} />
            </div>
            <p className="text-sm font-medium text-neon-green uppercase tracking-wide">Portfolio Value</p>
          </div>
          <p className="text-2xl font-bold text-cyan-300">${stakedValue.toLocaleString()}</p>
          <p className="text-xs text-cyan-300/70 mt-1">Total staked</p>
        </div>

        <div className="cyber-glass rounded-xl p-5 border border-cyan-500/30 hover:border-cyan-500/50 relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-orange/50 to-transparent" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 cyber-glass border border-neon-orange/30 rounded-lg">
              <Users className="text-neon-orange" size={20} />
            </div>
            <p className="text-sm font-medium text-neon-orange uppercase tracking-wide">Team Size</p>
          </div>
          <p className="text-2xl font-bold text-cyan-300">{teamCount.toString()}</p>
          <p className="text-xs text-cyan-300/70 mt-1">{directCount.toString()} direct members</p>
        </div>

        <div className="cyber-glass rounded-xl p-5 border border-cyan-500/30 hover:border-cyan-500/50 relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 cyber-glass border border-cyan-400/30 rounded-lg">
              <Award className="text-cyan-400" size={20} />
            </div>
            <p className="text-sm font-medium text-cyan-400 uppercase tracking-wide">Slab Level</p>
          </div>
          <p className="text-2xl font-bold text-cyan-300">{slabIndex.toString()}</p>
          <p className="text-xs text-cyan-300/70 mt-1">Current tier</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h2 className="text-lg font-semibold text-cyan-300 mb-6 flex items-center gap-2">
            <BarChart3 size={20} />
            Income Breakdown
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-cyan-300">Direct Income</span>
                <span className="text-sm font-bold text-neon-green">${directEarned.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-dark-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-green to-cyan-500"
                  style={{
                    width: `${totalEarned > 0 ? (directEarned / totalEarned) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-cyan-300">Slab Income</span>
                <span className="text-sm font-bold text-neon-purple">${slabEarned.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-dark-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-purple to-cyan-500"
                  style={{
                    width: `${totalEarned > 0 ? (slabEarned / totalEarned) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-cyan-500/20">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-cyan-300">Total Income</span>
                <span className="text-lg font-bold text-cyan-300">${totalEarned.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h2 className="text-lg font-semibold text-cyan-300 mb-6 flex items-center gap-2">
            <Target size={20} />
            Team Performance
          </h2>
          <div className="space-y-4">
            <div className="cyber-glass border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cyan-300/90">Qualified Volume</span>
                <span className="text-lg font-bold text-neon-green">${qualifiedVolume.toLocaleString()}</span>
              </div>
              <p className="text-xs text-cyan-300/70">40:30:30 calculation</p>
            </div>

            <div className="cyber-glass border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cyan-300/90">Direct Members</span>
                <span className="text-lg font-bold text-cyan-400">{directCount.toString()}</span>
              </div>
              <p className="text-xs text-cyan-300/70">First-level referrals</p>
            </div>

            <div className="cyber-glass border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cyan-300/90">Total Team</span>
                <span className="text-lg font-bold text-neon-orange">{teamCount.toString()}</span>
              </div>
              <p className="text-xs text-cyan-300/70">All downline members</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
        <h2 className="text-lg font-semibold text-cyan-300 mb-6">Achievement Status</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="cyber-glass border border-cyan-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${parseInt(slabIndex) > 0 ? 'bg-neon-green/20' : 'bg-cyan-500/20'}`}>
                {parseInt(slabIndex) > 0 ? (
                  <Award className="text-neon-green" size={20} />
                ) : (
                  <Award className="text-cyan-400" size={20} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Slab Qualification</p>
                <p className="text-xs text-cyan-300/70">Income tier</p>
              </div>
            </div>
            <p className={`text-lg font-bold ${parseInt(slabIndex) > 0 ? 'text-neon-green' : 'text-cyan-400'}`}>
              {parseInt(slabIndex) > 0 ? `Level ${slabIndex}` : 'Not Qualified'}
            </p>
          </div>

          <div className="cyber-glass border border-cyan-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${parseInt(royaltyTier) > 0 ? 'bg-neon-orange/20' : 'bg-cyan-500/20'}`}>
                {parseInt(royaltyTier) > 0 ? (
                  <Award className="text-neon-orange" size={20} />
                ) : (
                  <Award className="text-cyan-400" size={20} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Royalty Program</p>
                <p className="text-xs text-cyan-300/70">Monthly rewards</p>
              </div>
            </div>
            <p className={`text-lg font-bold ${parseInt(royaltyTier) > 0 ? 'text-neon-orange' : 'text-cyan-400'}`}>
              {parseInt(royaltyTier) > 0 ? `Tier ${royaltyTier}` : 'Not Qualified'}
            </p>
          </div>

          <div className="cyber-glass border border-cyan-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${parseInt(directCount) >= 3 ? 'bg-neon-green/20' : 'bg-cyan-500/20'}`}>
                {parseInt(directCount) >= 3 ? (
                  <Users className="text-neon-green" size={20} />
                ) : (
                  <Users className="text-cyan-400" size={20} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Team Building</p>
                <p className="text-xs text-cyan-300/70">Growth milestone</p>
              </div>
            </div>
            <p className={`text-lg font-bold ${parseInt(directCount) >= 3 ? 'text-neon-green' : 'text-cyan-400'}`}>
              {parseInt(directCount) >= 3 ? 'Active Builder' : 'Growing'}
            </p>
          </div>
        </div>
      </div>

      <div className="cyber-glass border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Live Blockchain Analytics</p>
            <p className="text-xs text-cyan-300/90">
              All analytics data is fetched in real-time from the Ocean DeFi smart contracts on the Ramestta blockchain. Your performance metrics, income breakdown, and team statistics are calculated directly from on-chain data for complete transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
