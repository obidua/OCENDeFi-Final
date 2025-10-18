import { Trophy, TrendingUp, Clock, CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useUserOverview } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';

const ROYALTY_TIER_NAMES = [
  'Coral Starter',
  'Pearl Diver',
  'Sea Explorer',
  'Wave Rider',
  'Tide Surge',
  'Deep Blue',
  'Ocean Guardian',
  'Marine Commander',
  'Aqua Captain',
  'Current Master',
  'Sea Legend',
  'Trident Icon',
  'Poseidon Crown',
  'Ocean Supreme',
];

const ROYALTY_LEVELS = [
  { requiredVolumeUSD: 5000e8, monthlyRoyaltyUSD: 50e8 },
  { requiredVolumeUSD: 10000e8, monthlyRoyaltyUSD: 150e8 },
  { requiredVolumeUSD: 20000e8, monthlyRoyaltyUSD: 400e8 },
  { requiredVolumeUSD: 60000e8, monthlyRoyaltyUSD: 1500e8 },
  { requiredVolumeUSD: 120000e8, monthlyRoyaltyUSD: 3500e8 },
  { requiredVolumeUSD: 300000e8, monthlyRoyaltyUSD: 10000e8 },
  { requiredVolumeUSD: 600000e8, monthlyRoyaltyUSD: 22000e8 },
  { requiredVolumeUSD: 1500000e8, monthlyRoyaltyUSD: 60000e8 },
  { requiredVolumeUSD: 3000000e8, monthlyRoyaltyUSD: 130000e8 },
  { requiredVolumeUSD: 5000000e8, monthlyRoyaltyUSD: 240000e8 },
  { requiredVolumeUSD: 10000000e8, monthlyRoyaltyUSD: 550000e8 },
  { requiredVolumeUSD: 30000000e8, monthlyRoyaltyUSD: 1800000e8 },
  { requiredVolumeUSD: 50000000e8, monthlyRoyaltyUSD: 3200000e8 },
  { requiredVolumeUSD: 100000000e8, monthlyRoyaltyUSD: 10000000e8 },
];

export default function RoyaltyProgram() {
  const { address, isConnected } = useAccount();
  const { data: overview, loading: overviewLoading } = useUserOverview();

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view royalty program details</p>
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

  const royaltyTier = overview?.royaltyTier || 0;
  const qualifiedVolumeUSD = overview?.qualifiedVolumeUSD || '0';
  const royaltyLastMonthEpoch = overview?.royaltyLastMonthEpoch || 0;
  const royaltyPaused = overview?.royaltyPaused || false;

  const currentLevel = parseInt(royaltyTier);
  const currentDate = Math.floor(Date.now() / 1000);
  const monthInSeconds = 30 * 24 * 60 * 60;
  const canClaim = currentLevel > 0 && (currentDate - royaltyLastMonthEpoch) >= monthInSeconds;

  const payoutsReceived = royaltyLastMonthEpoch > 0 ? Math.floor((currentDate - royaltyLastMonthEpoch) / monthInSeconds) : 0;

  const qualifiedVolumeNum = oceanContractService.toUSD(qualifiedVolumeUSD);
  const requiredForNextTier = currentLevel < ROYALTY_LEVELS.length
    ? oceanContractService.toUSD(ROYALTY_LEVELS[currentLevel].requiredVolumeUSD.toString())
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          Royalty Program
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-cyan-300/90 mt-1">Monthly recurring rewards for top performers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="cyber-glass border border-neon-orange/50 rounded-2xl p-6 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/10 to-cyan-500/10 opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-neon-orange/20 rounded-lg backdrop-blur-sm border border-neon-orange/30">
              <Trophy size={24} className="text-neon-orange" />
            </div>
            <div>
              <p className="text-sm text-neon-orange font-medium">Current Level</p>
              <p className="text-xs text-cyan-300/90">Your royalty tier</p>
            </div>
          </div>
          <p className="text-5xl font-bold mb-2 text-neon-orange relative z-10">{currentLevel}</p>
          {currentLevel > 0 ? (
            <p className="text-lg text-neon-green relative z-10">
              {oceanContractService.formatUSD(ROYALTY_LEVELS[currentLevel - 1].monthlyRoyaltyUSD.toString())} / month
            </p>
          ) : (
            <p className="text-sm text-cyan-300/70 relative z-10">Build your team to unlock royalty tiers</p>
          )}
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-neon-green/20 rounded-lg">
              <CheckCircle className="text-neon-green" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">Program Status</p>
              <p className="text-xs text-cyan-300/90">Lifetime eligibility</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-300">
            {royaltyPaused ? (
              <span className="text-neon-orange">Paused</span>
            ) : currentLevel > 0 ? (
              <span className="text-neon-green">Active</span>
            ) : (
              <span className="text-cyan-400">Not Qualified</span>
            )}
          </p>
          <p className="text-sm text-cyan-300/90 mt-2">
            {currentLevel > 0 ? `Tier: ${ROYALTY_TIER_NAMES[currentLevel - 1]}` : 'Build volume to qualify'}
          </p>
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-cyan-500/20 rounded-lg">
              <Clock className="text-cyan-400" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">Next Claim</p>
              <p className="text-xs text-cyan-300/90">Monthly eligibility</p>
            </div>
          </div>
          <p className="text-lg font-bold text-cyan-300">
            {canClaim && !royaltyPaused ? 'Ready Now' : 'Not Ready'}
          </p>
          {canClaim && !royaltyPaused && (
            <button
              onClick={() => alert('Royalty claim functionality will be integrated with the RoyaltyManager contract')}
              className="mt-3 w-full py-2 bg-gradient-to-r from-cyan-500 to-neon-green text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Claim Royalty
            </button>
          )}
        </div>
      </div>

      <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4">Royalty Tiers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROYALTY_LEVELS.map((level, idx) => {
            const levelNum = idx + 1;
            const isAchieved = levelNum <= currentLevel;
            const isCurrent = levelNum === currentLevel;
            const requiredVolume = oceanContractService.toUSD(level.requiredVolumeUSD.toString());
            const monthlyPayout = oceanContractService.formatUSD(level.monthlyRoyaltyUSD.toString());

            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? 'border-neon-orange cyber-glass shadow-neon-orange'
                    : isAchieved
                    ? 'border-neon-green cyber-glass'
                    : 'border-cyan-500/30 cyber-glass'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold ${isCurrent ? 'text-neon-orange' : isAchieved ? 'text-neon-green' : 'text-cyan-300/90'}`}>
                      {ROYALTY_TIER_NAMES[idx]}
                    </span>
                    <span className="text-xs text-cyan-300/60">Tier #{levelNum}</span>
                  </div>
                  {isAchieved && (
                    <Trophy className={isCurrent ? 'text-neon-orange' : 'text-neon-green'} size={20} />
                  )}
                </div>
                <p className="text-sm text-cyan-300/90 mb-2">Required Volume</p>
                <p className="text-lg font-semibold text-cyan-300 mb-3">
                  ${requiredVolume.toLocaleString()}
                </p>
                <div className={`p-3 rounded-lg ${isCurrent ? 'bg-neon-orange/20' : isAchieved ? 'bg-neon-green/20' : 'bg-cyan-500/10'}`}>
                  <p className="text-xs text-cyan-300/90 mb-1">Monthly Payout</p>
                  <p className={`text-xl font-bold ${isCurrent ? 'text-neon-orange' : isAchieved ? 'text-neon-green' : 'text-cyan-400'}`}>
                    {monthlyPayout}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="font-semibold text-cyan-300 mb-4">Program Rules</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Monthly Payments</p>
                <p className="text-xs text-cyan-300/90">Receive royalty payments once per month for lifetime</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">10% Growth Renewal</p>
                <p className="text-xs text-cyan-300/90">Every 2 months, team volume must show 10% growth to continue</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Claim to Wallet</p>
                <p className="text-xs text-cyan-300/90">Transfer royalty payments to Safe Wallet or Main Wallet</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="font-semibold text-cyan-300 mb-4">Your Progress</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-cyan-300/90 mb-2">Current Qualified Volume</p>
              <p className="text-2xl font-bold text-cyan-300">
                {oceanContractService.formatUSD(qualifiedVolumeUSD)}
              </p>
            </div>
            {currentLevel < ROYALTY_LEVELS.length && (
              <>
                <div>
                  <p className="text-sm text-cyan-300/90 mb-2">Required for Next Tier</p>
                  <p className="text-2xl font-bold text-neon-orange">
                    ${requiredForNextTier.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 cyber-glass border border-neon-green/20 rounded-lg">
                  <p className="text-xs text-neon-green">
                    Build ${(requiredForNextTier - qualifiedVolumeNum).toLocaleString()} more volume to unlock {ROYALTY_TIER_NAMES[currentLevel]}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="cyber-glass border border-neon-green/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <TrendingUp className="text-neon-green flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-semibold text-neon-green mb-2">Maximize Your Royalties - Lifetime Earnings!</h4>
            <p className="text-sm text-cyan-300/90 mb-3">
              Build your team consistently to maintain the 10% growth requirement and unlock higher tiers for increased monthly payouts that continue FOR LIFE!
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 cyber-glass border border-neon-green/30 rounded-lg">
                <p className="text-xs text-cyan-300/90 mb-1">Duration</p>
                <p className="text-lg font-bold text-neon-green flex items-center gap-1">LIFETIME <span className="text-2xl">∞</span></p>
              </div>
              <div className="p-3 cyber-glass border border-neon-green/30 rounded-lg">
                <p className="text-xs text-cyan-300/90 mb-1">Top Tier Monthly</p>
                <p className="text-lg font-bold text-neon-green">$100,000</p>
              </div>
              <div className="p-3 cyber-glass border border-neon-green/30 rounded-lg">
                <p className="text-xs text-cyan-300/90 mb-1">Total Potential</p>
                <p className="text-lg font-bold text-neon-green flex items-center gap-1">UNLIMITED <span className="text-2xl">∞</span></p>
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
              This page displays real-time data from the Ocean DeFi smart contracts. Your royalty tier, qualification status, and volume are fetched directly from the Ramestta blockchain. Maintain 10% growth every 2 months to continue receiving monthly payouts for life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
