import { Award, TrendingUp, Users, AlertCircle, Layers, Wallet, CheckCircle, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSlabPanel, useUserOverview } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';

const SLAB_LEVELS = [
  { minVolumeUSD: 1000e8, percentageBPS: 1000, directRequired: 1 },
  { minVolumeUSD: 3000e8, percentageBPS: 1500, directRequired: 2 },
  { minVolumeUSD: 10000e8, percentageBPS: 2000, directRequired: 3 },
  { minVolumeUSD: 30000e8, percentageBPS: 2500, directRequired: 4 },
  { minVolumeUSD: 100000e8, percentageBPS: 3000, directRequired: 5 },
  { minVolumeUSD: 300000e8, percentageBPS: 3500, directRequired: 6 },
  { minVolumeUSD: 1000000e8, percentageBPS: 4000, directRequired: 7 },
  { minVolumeUSD: 3000000e8, percentageBPS: 4500, directRequired: 8 },
  { minVolumeUSD: 10000000e8, percentageBPS: 5000, directRequired: 9 },
  { minVolumeUSD: 30000000e8, percentageBPS: 5500, directRequired: 10 },
  { minVolumeUSD: 100000000e8, percentageBPS: 6000, directRequired: 11 },
];

const SLAB_TIER_NAMES = [
  'Coral Reef',
  'Shallow Waters',
  'Tide Pool',
  'Wave Crest',
  'Open Sea',
  'Deep Current',
  'Ocean Floor',
  'Abyssal Zone',
  'Mariana Trench',
  'Pacific Master',
  'Ocean Sovereign',
];

export default function SlabIncome() {
  const { address, isConnected } = useAccount();
  const { data: slabPanel, loading: slabLoading, error: slabError, refetch: refetchSlab } = useSlabPanel();
  const { data: overview, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useUserOverview();

  const handleRetry = () => {
    refetchSlab();
    refetchOverview();
  };

  const loading = slabLoading || overviewLoading;
  const error = slabError || overviewError;

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view slab income details</p>
        </div>
      </div>
    );
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
            Slab Income System
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
          </h1>
          <p className="text-cyan-300/90 mt-1">Earn difference income from your team's growth</p>
        </div>

        <div className="cyber-glass border border-red-500/50 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-300 mb-2">Error Loading Data</h2>
          <p className="text-cyan-300/70 mb-6 max-w-md mx-auto">
            {error || 'Unable to fetch slab income data from blockchain'}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-neon-green text-dark-950 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            <RefreshCw size={20} />
            Retry
          </button>
        </div>

        <div className="cyber-glass border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-cyan-300 mb-1">Troubleshooting Tips</p>
              <ul className="text-xs text-cyan-300/90 space-y-1 list-disc list-inside">
                <li>Make sure your wallet is connected to the Ramestta network</li>
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSlabIndex = slabPanel ? parseInt(slabPanel.slabIndex) : 0;
  const qualifiedVolumeUSD = slabPanel?.qualifiedVolumeUSD || '0';
  const directMembers = slabPanel?.directMembers || 0;
  const canClaim = slabPanel?.canClaim || false;

  const qualifiedVolume = oceanContractService.toUSD(qualifiedVolumeUSD);

  const nextSlabVolume = currentSlabIndex < SLAB_LEVELS.length
    ? oceanContractService.toUSD(SLAB_LEVELS[currentSlabIndex].minVolumeUSD.toString())
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          Slab Income System
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-cyan-300/90 mt-1">Earn difference income from your team's growth</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="cyber-glass border border-neon-green/50 rounded-2xl p-6 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-cyan-500/10 opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-green/70 to-transparent" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-neon-green/20 rounded-lg backdrop-blur-sm border border-neon-green/30">
              <Award size={24} className="text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-neon-green font-medium uppercase tracking-wide">Current Slab Level</p>
              <p className="text-xs text-cyan-300/90">Your qualification tier</p>
            </div>
          </div>
          <p className="text-5xl font-bold mb-2 text-neon-green relative z-10">{currentSlabIndex}</p>
          {currentSlabIndex > 0 && (
            <p className="text-lg text-cyan-300 relative z-10">
              {SLAB_TIER_NAMES[currentSlabIndex - 1]} - {(SLAB_LEVELS[currentSlabIndex - 1].percentageBPS / 100).toFixed(1)}%
            </p>
          )}
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-cyan-500/20 rounded-lg">
              <TrendingUp className="text-cyan-400" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">Slab Income Status</p>
              <p className="text-xs text-cyan-300/90">Claimable earnings</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-400">
            {canClaim ? (
              <span className="text-neon-green">Ready to Claim</span>
            ) : (
              'Not Yet Available'
            )}
          </p>
          <p className="text-sm text-cyan-300/70 mt-1">
            {canClaim ? 'Visit Claim Earnings to collect' : 'Meet slab requirements to earn'}
          </p>
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-neon-green/20 rounded-lg">
              <Users className="text-neon-green" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">Qualified Volume</p>
              <p className="text-xs text-cyan-300/90">40:30:30 calculated</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-300">{oceanContractService.formatUSD(qualifiedVolumeUSD)}</p>
        </div>
      </div>

      <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
        <h2 className="text-lg font-semibold text-cyan-300 mb-6">Slab Levels & Requirements</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SLAB_LEVELS.map((slab, idx) => {
            const slabNum = idx + 1;
            const isAchieved = slabNum <= currentSlabIndex;
            const isCurrent = slabNum === currentSlabIndex;
            const requiredVolume = oceanContractService.toUSD(slab.minVolumeUSD.toString());
            const percentage = (slab.percentageBPS / 100).toFixed(1);

            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? 'border-neon-green cyber-glass shadow-neon-green'
                    : isAchieved
                    ? 'border-cyan-500 cyber-glass'
                    : 'border-cyan-500/30 cyber-glass opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold ${isCurrent ? 'text-neon-green' : isAchieved ? 'text-cyan-400' : 'text-cyan-300/50'}`}>
                      {SLAB_TIER_NAMES[idx]}
                    </span>
                    <span className="text-xs text-cyan-300/60">Slab {slabNum}</span>
                  </div>
                  {isAchieved && (
                    <CheckCircle className={isCurrent ? 'text-neon-green' : 'text-cyan-400'} size={20} />
                  )}
                </div>
                <p className="text-sm text-cyan-300/90 mb-2">Required Volume</p>
                <p className="text-lg font-semibold text-cyan-300 mb-1">
                  ${requiredVolume.toLocaleString()}
                </p>
                <p className="text-xs text-cyan-300/70 mb-3">Min. {slab.directRequired} directs</p>
                <div className={`p-3 rounded-lg ${isCurrent ? 'bg-neon-green/20' : isAchieved ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}`}>
                  <p className="text-xs text-cyan-300/90 mb-1">Income Share</p>
                  <p className={`text-xl font-bold ${isCurrent ? 'text-neon-green' : isAchieved ? 'text-cyan-400' : 'text-cyan-400/50'}`}>
                    {percentage}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="font-semibold text-cyan-300 mb-4">How Slab Income Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Difference Income</p>
                <p className="text-xs text-cyan-300/90">
                  Earn the percentage difference when your slab level is higher than your downline
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Qualified Volume</p>
                <p className="text-xs text-cyan-300/90">
                  Based on 40:30:30 ratio across your three strongest legs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Progressive Growth</p>
                <p className="text-xs text-cyan-300/90">
                  Higher slabs unlock greater income share percentages
                </p>
              </div>
            </div>

            <div className="p-4 cyber-glass border border-neon-green/20 rounded-lg mt-4">
              <p className="text-sm font-medium text-neon-green mb-2">Example Calculation</p>
              <p className="text-xs text-cyan-300/90">
                If you're at Slab 5 (30%) and your downline is at Slab 3 (20%):
              </p>
              <p className="text-xs text-neon-green font-bold mt-2">
                You earn: (30% - 20%) = 10% difference income on their volume
              </p>
            </div>
          </div>
        </div>

        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="font-semibold text-cyan-300 mb-4">Your Progress</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-cyan-300/90 mb-2">Current Slab</p>
              <p className="text-2xl font-bold text-cyan-300">
                {currentSlabIndex > 0 ? SLAB_TIER_NAMES[currentSlabIndex - 1] : 'Not Qualified'}
              </p>
            </div>

            {currentSlabIndex < SLAB_LEVELS.length && (
              <>
                <div>
                  <p className="text-sm text-cyan-300/90 mb-2">Required for Next Slab</p>
                  <p className="text-2xl font-bold text-neon-orange">
                    ${nextSlabVolume.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 cyber-glass border border-neon-green/20 rounded-lg">
                  <p className="text-xs text-neon-green">
                    Build ${(nextSlabVolume - qualifiedVolume).toLocaleString()} more volume to unlock {SLAB_TIER_NAMES[currentSlabIndex]}
                  </p>
                </div>
              </>
            )}

            <div className="p-4 cyber-glass border border-cyan-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-cyan-300">Statistics</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300/90">Direct Members:</span>
                  <span className="text-cyan-300 font-bold">{directMembers.toString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300/90">Qualified Volume:</span>
                  <span className="text-cyan-300 font-bold">{oceanContractService.formatUSD(qualifiedVolumeUSD)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300/90">Claim Status:</span>
                  <span className={`font-bold ${canClaim ? 'text-neon-green' : 'text-cyan-300/70'}`}>
                    {canClaim ? 'Available' : 'Pending'}
                  </span>
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
              This page displays real-time data from the Ocean DeFi smart contracts. Slab income (difference income) is calculated based on the percentage difference between your slab level and your downline's slab levels. All data is fetched directly from the Ramestta blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
