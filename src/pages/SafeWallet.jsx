import { Vault, TrendingUp, AlertCircle, Wallet, History, DollarSign, ArrowRight, Lock } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useUserOverview } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';

export default function SafeWallet() {
  const { address, isConnected } = useAccount();
  const { data: overview, loading: overviewLoading } = useUserOverview();

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view your safe wallet</p>
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

  const safeWalletRAMA = overview?.totalSafeWalletRama || '0';
  const safeWalletUSD = oceanContractService.toUSD(safeWalletRAMA);

  const handleStakeFromWallet = () => {
    alert('Stake from Safe Wallet: This feature will allow you to create portfolios using your Safe Wallet balance.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          Safe Wallet
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-cyan-300/90 mt-1">Your fee-free internal balance</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 cyber-glass border border-neon-green/50 rounded-2xl p-8 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-cyan-500/10 opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-green/70 to-transparent" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-3 bg-neon-green/20 rounded-xl backdrop-blur-sm border border-neon-green/30">
              <Vault size={32} className="text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-neon-green font-medium uppercase tracking-wide">Safe Wallet Balance</p>
              <p className="text-xs text-cyan-300/90">Fee-free internal funds</p>
            </div>
          </div>

          <div className="mb-6 relative z-10">
            <p className="text-5xl font-bold mb-2 text-neon-green">{oceanContractService.formatRAMA(safeWalletRAMA)} RAMA</p>
            <p className="text-2xl text-cyan-300">${safeWalletUSD.toLocaleString()} USD</p>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <button
              onClick={handleStakeFromWallet}
              className="py-3 bg-gradient-to-r from-cyan-500 to-neon-green text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Stake from Wallet
            </button>
            <button
              disabled
              className="py-3 cyber-glass rounded-lg font-medium border border-cyan-500/20 text-cyan-400/40 cursor-not-allowed relative group"
              title="Safe Wallet funds cannot be withdrawn - they can only be used for staking"
            >
              <Lock className="inline-block mr-2" size={16} />
              Withdraw (Locked)
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 bg-dark-950 border border-cyan-500/30 rounded px-3 py-2 text-xs text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Safe Wallet is for staking only
              </div>
            </button>
          </div>
        </div>

        <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 cyber-glass border border-cyan-500/20 rounded-lg">
              <DollarSign className="text-cyan-400" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-300">RAMA Price</p>
              <p className="text-xs text-cyan-300/90">Current market rate</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-300">$1.00</p>
          <p className="text-xs text-cyan-300/70 mt-1">Stable peg maintained</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="font-semibold text-cyan-300 mb-4">About Safe Wallet</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Zero Fees</p>
                <p className="text-xs text-cyan-300/90">
                  All earnings claimed to Safe Wallet have 0% fees
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Staking Only</p>
                <p className="text-xs text-cyan-300/90">
                  Safe Wallet funds can be used to create new portfolios or topup existing ones
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300">Main Wallet Alternative</p>
                <p className="text-xs text-cyan-300/90">
                  Choose Main Wallet claims (5% fee) for withdrawable funds
                </p>
              </div>
            </div>

            <div className="p-4 cyber-glass border border-neon-green/20 rounded-lg mt-4">
              <p className="text-sm font-medium text-neon-green mb-2">Fee Comparison</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300/90">Claim to Safe Wallet:</span>
                  <span className="text-neon-green font-bold">0% Fee</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300/90">Claim to Main Wallet:</span>
                  <span className="text-neon-orange font-bold">5% Fee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="font-semibold text-cyan-300 mb-4">Income Sources</h3>
          <div className="space-y-3">
            <div className="p-3 cyber-glass border border-cyan-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cyan-300">Direct Income (5%)</span>
                <ArrowRight className="text-neon-green" size={16} />
              </div>
              <p className="text-xs text-cyan-300/90">Claim direct commissions to Safe Wallet with 0% fees</p>
            </div>

            <div className="p-3 cyber-glass border border-cyan-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cyan-300">Slab Income</span>
                <ArrowRight className="text-neon-green" size={16} />
              </div>
              <p className="text-xs text-cyan-300/90">Claim difference income to Safe Wallet fee-free</p>
            </div>

            <div className="p-3 cyber-glass border border-cyan-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cyan-300">Royalty & Rewards</span>
                <ArrowRight className="text-neon-green" size={16} />
              </div>
              <p className="text-xs text-cyan-300/90">Claim monthly royalties and one-time rewards</p>
            </div>

            <div className="p-3 cyber-glass border border-cyan-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cyan-300">Portfolio Growth</span>
                <ArrowRight className="text-neon-green" size={16} />
              </div>
              <p className="text-xs text-cyan-300/90">Claim portfolio earnings to compound growth</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-glass rounded-2xl p-6 border-2 border-neon-purple relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />
        <div className="flex items-center gap-3 mb-4">
          <History className="text-neon-purple" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-neon-purple uppercase tracking-wide">Usage Strategy</h2>
            <p className="text-xs text-cyan-300/90 mt-1">Maximize your earnings with Smart Wallet management</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="cyber-glass border border-neon-purple/20 rounded-lg p-4">
            <div className="text-neon-purple text-2xl font-bold mb-2">1</div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Accumulate</p>
            <p className="text-xs text-cyan-300/90">Claim all income to Safe Wallet with 0% fees</p>
          </div>

          <div className="cyber-glass border border-cyan-500/20 rounded-lg p-4">
            <div className="text-cyan-400 text-2xl font-bold mb-2">2</div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Compound</p>
            <p className="text-xs text-cyan-300/90">Use Safe Wallet balance to create new portfolios</p>
          </div>

          <div className="cyber-glass border border-neon-green/20 rounded-lg p-4">
            <div className="text-neon-green text-2xl font-bold mb-2">3</div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Grow</p>
            <p className="text-xs text-cyan-300/90">Maximize returns by reinvesting earnings</p>
          </div>
        </div>
      </div>

      <div className="cyber-glass border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Blockchain Integrated</p>
            <p className="text-xs text-cyan-300/90">
              Your Safe Wallet balance is stored on-chain and displayed in real-time from the Ocean DeFi smart contracts on the Ramestta blockchain. Safe Wallet provides a fee-free way to compound your earnings by reinvesting them into new portfolios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
