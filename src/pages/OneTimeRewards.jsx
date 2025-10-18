import { Gift, CheckCircle, Lock, Wallet, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useUserOverview } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';

const REWARD_NAMES = [
  'Coral Spark',
  'Pearl Bloom',
  'Shell Harvest',
  'Wave Bounty',
  'Tide Treasure',
  'Blue Depth Bonus',
  'Guardian\'s Gift',
  'Captain\'s Chest',
  'Trident Gem',
  'Sea Legend Award',
  'Abyss Crown',
  'Poseidon\'s Favor',
  'Neptune Scepter',
  'Ocean Infinity',
];

const ONE_TIME_REWARDS = [
  { requiredVolumeUSD: 6000e8, rewardUSD: 100e8 },
  { requiredVolumeUSD: 15000e8, rewardUSD: 100e8 },
  { requiredVolumeUSD: 40000e8, rewardUSD: 100e8 },
  { requiredVolumeUSD: 120000e8, rewardUSD: 250e8 },
  { requiredVolumeUSD: 300000e8, rewardUSD: 250e8 },
  { requiredVolumeUSD: 600000e8, rewardUSD: 250e8 },
  { requiredVolumeUSD: 1500000e8, rewardUSD: 500e8 },
  { requiredVolumeUSD: 3000000e8, rewardUSD: 500e8 },
  { requiredVolumeUSD: 6000000e8, rewardUSD: 500e8 },
  { requiredVolumeUSD: 15000000e8, rewardUSD: 1000e8 },
  { requiredVolumeUSD: 30000000e8, rewardUSD: 1000e8 },
  { requiredVolumeUSD: 60000000e8, rewardUSD: 1000e8 },
  { requiredVolumeUSD: 200000000e8, rewardUSD: 1000e8 },
  { requiredVolumeUSD: 500000000e8, rewardUSD: 1000e8 },
];

export default function OneTimeRewards() {
  const { address, isConnected } = useAccount();
  const { data: overview, loading: overviewLoading } = useUserOverview();

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view one-time rewards</p>
        </div>
      </div>
    );
  }

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-cyan-500/20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-cyan-500/10 rounded w-1/2"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
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

  const qualifiedVolumeUSD = overview?.qualifiedVolumeUSD || '0';
  const qualifiedVolume = oceanContractService.toUSD(qualifiedVolumeUSD);

  const claimedRewards = [];
  let totalEarned = 0;
  let nextRewardIdx = -1;

  ONE_TIME_REWARDS.forEach((reward, idx) => {
    const requiredVolume = oceanContractService.toUSD(reward.requiredVolumeUSD.toString());
    if (qualifiedVolume >= requiredVolume) {
      claimedRewards.push(idx);
      totalEarned += oceanContractService.toUSD(reward.rewardUSD.toString());
    } else if (nextRewardIdx === -1) {
      nextRewardIdx = idx;
    }
  });

  const totalPossibleRewards = ONE_TIME_REWARDS.reduce((sum, r) =>
    sum + oceanContractService.toUSD(r.rewardUSD.toString()), 0
  );
  const remainingPotential = totalPossibleRewards - totalEarned;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          One-Time Rewards
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-cyan-300/90 mt-1">Achievement milestones with bonus rewards</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="cyber-glass border border-neon-green/50 rounded-2xl p-6 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-cyan-500/10 opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-green/70 to-transparent" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-neon-green/20 rounded-lg backdrop-blur-sm border border-neon-green/30">
              <Gift size={24} className="text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-neon-green font-medium uppercase tracking-wide">Rewards Claimed</p>
              <p className="text-xs text-cyan-300/90">Out of 14 milestones</p>
            </div>
          </div>
          <p className="text-5xl font-bold mb-2 relative z-10 text-neon-green">{claimedRewards.length}</p>
          <p className="text-sm text-cyan-300 relative z-10">/ 14 Total</p>
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-cyan-500/30 rounded-lg">
              <CheckCircle className="text-cyan-400" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-400 uppercase tracking-wide">Total Earned</p>
              <p className="text-xs text-cyan-300/90">From claimed rewards</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-neon-green">${totalEarned.toLocaleString()}</p>
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-neon-orange/30 rounded-lg">
              <Lock className="text-neon-orange" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-400 uppercase tracking-wide">Remaining Potential</p>
              <p className="text-xs text-cyan-300/90">Unclaimed rewards</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-neon-orange">${remainingPotential.toLocaleString()}</p>
        </div>
      </div>

      <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <h2 className="text-lg font-semibold text-cyan-300 mb-6 uppercase tracking-wide">Milestone Progress</h2>

        <div className="space-y-4">
          {ONE_TIME_REWARDS.map((reward, idx) => {
            const requiredVolume = oceanContractService.toUSD(reward.requiredVolumeUSD.toString());
            const rewardAmount = oceanContractService.toUSD(reward.rewardUSD.toString());
            const isClaimed = claimedRewards.includes(idx);
            const isLocked = qualifiedVolume < requiredVolume;
            const isNext = idx === nextRewardIdx;

            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border-2 transition-all relative overflow-hidden group ${
                  isClaimed
                    ? 'cyber-glass border-neon-green'
                    : isNext
                    ? 'cyber-glass border-cyan-500 shadow-cyan-500'
                    : isLocked
                    ? 'cyber-glass border-cyan-500/30 opacity-60'
                    : 'cyber-glass border-cyan-500/50'
                }`}
              >
                {isClaimed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-cyan-500/5" />
                )}
                {isNext && !isClaimed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-neon-green/10 animate-pulse" />
                )}
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isClaimed
                          ? 'bg-gradient-to-br from-neon-green to-cyan-500 text-dark-950'
                          : isNext
                          ? 'bg-gradient-to-br from-cyan-500 to-neon-green text-dark-950 animate-pulse'
                          : isLocked
                          ? 'cyber-glass border border-cyan-500/30 text-cyan-400/50'
                          : 'cyber-glass border border-cyan-500/50 text-cyan-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          isClaimed ? 'text-neon-green' : isNext ? 'text-cyan-300' : isLocked ? 'text-cyan-400/50' : 'text-cyan-400'
                        }`}>
                          {REWARD_NAMES[idx]}
                        </p>
                        <p className="text-xs text-cyan-300/60">Reward #{idx + 1}</p>
                        <p className="text-sm text-cyan-300/90">
                          Required Volume: ${requiredVolume.toLocaleString()}
                        </p>
                        {isNext && (
                          <p className="text-xs text-cyan-300 mt-1">
                            ${(requiredVolume - qualifiedVolume).toLocaleString()} more needed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-2xl font-bold mb-1 ${
                      isClaimed ? 'text-neon-green' : isNext ? 'text-cyan-300' : isLocked ? 'text-cyan-400/50' : 'text-cyan-400'
                    }`}>
                      ${rewardAmount.toLocaleString()}
                    </p>
                    <div>
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-medium border border-neon-green/30">
                          <CheckCircle size={14} />
                          Earned
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 cyber-glass border border-cyan-500/20 text-cyan-400/50 rounded-full text-xs font-medium">
                          <Lock size={14} />
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-medium border border-cyan-500/30">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <h3 className="font-semibold text-cyan-300 mb-4 uppercase tracking-wide">How It Works</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Build Qualified Volume</p>
                <p className="text-xs text-cyan-300/90">Grow your team using 40:30:30 calculation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Reach Milestones</p>
                <p className="text-xs text-cyan-300/90">Unlock rewards starting at $6,000 volume</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Automatic Eligibility</p>
                <p className="text-xs text-cyan-300/90">Rewards become available when volume milestones are reached</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <h3 className="font-semibold text-cyan-300 mb-4 uppercase tracking-wide">Reward Structure</h3>
          <div className="space-y-2">
            <div className="p-3 cyber-glass border border-cyan-500/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-cyan-300">Milestones 1-3</span>
                <span className="text-sm font-bold text-cyan-300">$100 each</span>
              </div>
            </div>
            <div className="p-3 cyber-glass border border-neon-green/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neon-green">Milestones 4-6</span>
                <span className="text-sm font-bold text-neon-green">$250 each</span>
              </div>
            </div>
            <div className="p-3 cyber-glass border border-neon-orange/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neon-orange">Milestones 7-9</span>
                <span className="text-sm font-bold text-neon-orange">$500 each</span>
              </div>
            </div>
            <div className="p-3 cyber-glass border border-cyan-400/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-cyan-400">Milestones 10-14</span>
                <span className="text-sm font-bold text-cyan-400">$1,000 each</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 cyber-glass border border-neon-green/20 rounded-lg">
            <p className="text-xs text-cyan-300/90 mb-1">Total Possible</p>
            <p className="text-2xl font-bold text-neon-green">${totalPossibleRewards.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="cyber-glass border border-cyan-500/20 rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-neon-green/5 opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="flex items-start gap-3 relative z-10">
          <AlertCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Blockchain Integrated</p>
            <p className="text-xs text-cyan-300/90">
              This page displays real-time data from the Ocean DeFi smart contracts. Your qualified volume and reward eligibility are calculated directly from the blockchain. One-time achievement rewards are automatically unlocked when you reach each volume milestone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
