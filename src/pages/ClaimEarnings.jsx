import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, AlertCircle, Clock, CheckCircle, Award, Layers, Gift, ChevronDown, Loader } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatUSD } from '../utils/contractData';
import NumberPopup from '../components/NumberPopup';
import oceanContractService from '../services/oceanContractService';
import oceanTransactionService from '../services/oceanTransactionService';
import { useUserOverview, usePortfolioSummaries, useWalletPanel, useSlabPanel } from '../hooks/useOceanData';
import Swal from 'sweetalert2';

export default function ClaimEarnings() {
  const { address, isConnected } = useAccount();
  const [selectedIncomeType, setSelectedIncomeType] = useState('');
  const [destination, setDestination] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: overview, loading: overviewLoading, refetch: refetchOverview } = useUserOverview();
  const { data: portfolios, loading: portfoliosLoading, refetch: refetchPortfolios } = usePortfolioSummaries();
  const { data: walletPanel, loading: walletLoading, refetch: refetchWallet } = useWalletPanel();
  const { data: slabPanel, loading: slabLoading, refetch: refetchSlab } = useSlabPanel();

  const activePortfolio = portfolios?.find(p => p.active) || portfolios?.[0];

  const accruedGrowthRAMA = activePortfolio
    ? BigInt(activePortfolio.creditedRama) - BigInt(activePortfolio.principalRama || '0')
    : 0n;

  const safeWalletBalance = walletPanel?.safeRama || '0';
  const slabAvailable = slabPanel?.canClaim || false;

  const ramaPrice = 0.0245;
  const totalAvailableRAMA = oceanContractService.toRAMA(accruedGrowthRAMA.toString());
  const totalAvailableUSD = totalAvailableRAMA * ramaPrice;

  const incomeOptions = [
    {
      id: 'portfolioGrowth',
      name: 'Portfolio Growth',
      description: 'From staking rewards',
      amountRAMA: accruedGrowthRAMA.toString(),
      icon: TrendingUp,
      color: 'neon-green',
      status: totalAvailableRAMA > 0 ? 'available' : 'none',
      portfolioId: activePortfolio?.pid,
    },
    {
      id: 'slabIncome',
      name: 'Slab Income',
      description: 'Team difference income',
      amountRAMA: '0',
      icon: Award,
      color: 'neon-purple',
      status: slabAvailable ? 'available' : 'cooldown',
    },
  ];

  const selectedIncome = incomeOptions.find(opt => opt.id === selectedIncomeType);

  const calculateDetails = () => {
    if (!selectedIncome) return { usd: 0, rama: 0, fee: 0, net: 0 };
    const rama = oceanContractService.toRAMA(selectedIncome.amountRAMA);
    const usd = rama * ramaPrice;
    const fee = destination === 'external' ? rama * 0.05 : 0;
    const net = rama - fee;
    return { usd, rama, fee, net };
  };

  const details = calculateDetails();
  const canClaim = selectedIncomeType && destination && details.rama >= (1 / ramaPrice) && !isClaiming;

  const handleClaim = async () => {
    if (!canClaim || !address) return;

    setIsClaiming(true);

    try {
      const result = await Swal.fire({
        title: 'Confirm Claim',
        html: `
          <div class="text-left space-y-2">
            <p><strong>Income Type:</strong> ${selectedIncome?.name}</p>
            <p><strong>Amount:</strong> ${details.net.toFixed(2)} RAMA</p>
            <p><strong>Destination:</strong> ${destination === 'safe' ? 'Safe Wallet' : 'External Wallet'}</p>
            ${destination === 'external' ? `<p class="text-orange-400"><strong>Fee (5%):</strong> ${details.fee.toFixed(2)} RAMA</p>` : ''}
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirm & Claim',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#06b6d4',
        background: '#0a1929',
        color: '#67e8f9',
      });

      if (!result.isConfirmed) {
        setIsClaiming(false);
        return;
      }

      let txResult;
      const toSafe = destination === 'safe';

      if (selectedIncomeType === 'portfolioGrowth') {
        txResult = await oceanTransactionService.claimPortfolioGrowth(
          address,
          selectedIncome.portfolioId,
          toSafe
        );
      } else if (selectedIncomeType === 'slabIncome') {
        txResult = await oceanTransactionService.claimSlabIncome(address, toSafe);
      } else if (selectedIncomeType === 'royaltyIncome') {
        txResult = await oceanTransactionService.claimRoyaltyIncome(address);
      }

      if (txResult?.success) {
        setShowSuccess(true);
        await Swal.fire({
          title: 'Claim Successful!',
          html: `
            <div class="text-left space-y-2">
              <p>Transaction Hash: ${txResult.txHash.substring(0, 10)}...</p>
              <p>Amount Claimed: ${details.net.toFixed(2)} RAMA</p>
              <p>Destination: ${destination === 'safe' ? 'Safe Wallet' : 'External Wallet'}</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#06b6d4',
          background: '#0a1929',
          color: '#67e8f9',
        });

        setTimeout(() => {
          setShowSuccess(false);
          setSelectedIncomeType('');
          setDestination('');
        }, 3000);

        await Promise.all([
          refetchOverview(),
          refetchPortfolios(),
          refetchWallet(),
          refetchSlab(),
        ]);
      }
    } catch (error) {
      console.error('Claim error:', error);
      const errorMessage = oceanTransactionService.parseTransactionError(error);

      await Swal.fire({
        title: 'Claim Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
        background: '#0a1929',
        color: '#67e8f9',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const maxCap = activePortfolio ? oceanContractService.calculateMaxCap(activePortfolio.principalUSD, activePortfolio.booster) : 0;
  const earnedSoFar = activePortfolio ? oceanContractService.toRAMA(activePortfolio.creditedRama) : 0;
  const portfolioCapRemaining = maxCap - earnedSoFar;

  const totalLifetimeStaked = oceanContractService.toUSD(overview?.totalStakedUSD || '0');
  const totalLifetimeEarned = oceanContractService.toRAMA(walletPanel?.lifetimeRoiUsd || '0');
  const maxLifetimeEarnable = totalLifetimeStaked * 4;
  const globalCapRemaining = maxLifetimeEarnable - totalLifetimeEarned;

  const getColorClasses = (color) => {
    const colors = {
      'neon-green': 'text-neon-green border-neon-green/50 bg-neon-green/5',
      'neon-purple': 'text-neon-purple border-neon-purple/50 bg-neon-purple/5',
      'neon-orange': 'text-neon-orange border-neon-orange/50 bg-neon-orange/5',
      'cyan-400': 'text-cyan-400 border-cyan-400/50 bg-cyan-400/5',
      'blue-400': 'text-blue-400 border-blue-400/50 bg-blue-400/5',
    };
    return colors[color] || colors['cyan-400'];
  };

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to claim earnings</p>
        </div>
      </div>
    );
  }

  if (overviewLoading || portfoliosLoading || walletLoading || slabLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Loading Earnings Data</h2>
          <p className="text-cyan-300/70">Fetching your claim information from blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          Claim Earnings
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-sm sm:text-base text-cyan-300/90 mt-1">Withdraw your accumulated rewards</p>
      </div>

      {showSuccess && (
        <div className="cyber-glass border-2 border-neon-green rounded-xl p-4 sm:p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-green/20 rounded-full">
              <CheckCircle size={24} className="text-neon-green" />
            </div>
            <div>
              <p className="font-bold text-neon-green text-sm sm:text-base">Claim Successful!</p>
              <p className="text-xs sm:text-sm text-cyan-300">
                {details.net.toFixed(2)} RAMA from {selectedIncome?.name} claimed to{' '}
                {destination === 'safe' ? 'Safe Wallet' : 'External Wallet'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="cyber-glass border border-neon-green/50 hover:border-neon-green rounded-2xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden group transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-cyan-500/10 opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-green/70 to-transparent" />
            <div className="flex items-center gap-3 mb-4 sm:mb-6 relative z-10">
              <div className="p-2 sm:p-3 bg-neon-green/20 rounded-xl backdrop-blur-sm flex-shrink-0 border border-neon-green/30">
                <TrendingUp size={20} className="sm:w-6 sm:h-6 text-neon-green" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-neon-green font-medium truncate uppercase tracking-wide">Total Available to Claim</p>
                <p className="text-xs text-cyan-300/90 truncate">From all income streams</p>
              </div>
            </div>
            <NumberPopup
              value={`${totalAvailableRAMA.toFixed(2)} RAMA`}
              label="Total Available"
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 text-neon-green relative z-10"
            />
            <p className="text-sm sm:text-base lg:text-lg text-cyan-300 relative z-10">
              ≈ ${totalAvailableUSD.toFixed(2)} USD
            </p>
          </div>

          <div className="cyber-glass rounded-2xl p-4 sm:p-6 border border-cyan-500/30 hover:border-cyan-500/80 relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <h2 className="text-base sm:text-lg font-semibold text-cyan-300 mb-3 sm:mb-4 uppercase tracking-wide">How to Claim</h2>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-cyan-300">1</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-cyan-300">Select Income Stream</p>
                  <p className="text-xs text-cyan-300/90">Choose which income type you want to claim</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-cyan-300">2</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-cyan-300">Choose Destination</p>
                  <p className="text-xs text-cyan-300/90">Safe Wallet (0% fee) or External Wallet (5% fee)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-cyan-300">3</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-cyan-300">Confirm & Claim</p>
                  <p className="text-xs text-cyan-300/90">Review details and complete your claim</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-cyan-300 mb-2 uppercase tracking-wide">
                  Step 1: Select Income Stream
                </label>
                <div className="relative">
                  <select
                    value={selectedIncomeType}
                    onChange={(e) => setSelectedIncomeType(e.target.value)}
                    className="w-full bg-dark-900 border-2 border-cyan-500/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-cyan-300 text-sm sm:text-base appearance-none cursor-pointer hover:border-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-colors"
                  >
                    <option value="">Choose income type...</option>
                    {incomeOptions.map((option) => {
                      const amount = oceanContractService.toRAMA(option.amountRAMA);
                      const isDisabled = option.status === 'cooldown' || option.status === 'none';
                      return (
                        <option key={option.id} value={option.id} disabled={isDisabled}>
                          {option.name} - {amount.toFixed(2)} RAMA {isDisabled ? `(${option.status})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" size={20} />
                </div>

                {selectedIncome && (
                  <div className={`mt-3 p-3 sm:p-4 rounded-lg border-2 ${getColorClasses(selectedIncome.color)}`}>
                    <div className="flex items-start gap-3">
                      <selectedIncome.icon size={20} className={`flex-shrink-0 text-${selectedIncome.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-cyan-300">{selectedIncome.name}</p>
                        <p className="text-xs text-cyan-300/80 mb-2">{selectedIncome.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          <span className="text-cyan-300">
                            <span className="text-cyan-300/70">Amount:</span>{' '}
                            <span className="font-bold">${details.usd.toFixed(2)}</span>
                          </span>
                          <span className="text-cyan-300">
                            <span className="text-cyan-300/70">RAMA:</span>{' '}
                            <span className="font-bold">{details.rama.toFixed(2)}</span>
                          </span>
                        </div>
                        {selectedIncome.lastClaim && (
                          <p className="text-xs text-cyan-300/60 mt-2">Last claimed: {selectedIncome.lastClaim}</p>
                        )}
                        {selectedIncome.cooldownEnds && selectedIncome.status === 'cooldown' && (
                          <p className="text-xs text-neon-orange mt-2">Available after: {selectedIncome.cooldownEnds}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedIncomeType && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-cyan-300 mb-2 uppercase tracking-wide">
                    Step 2: Choose Destination
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => setDestination('safe')}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
                        destination === 'safe'
                          ? 'border-neon-green bg-neon-green/10 shadow-lg/20'
                          : 'border-cyan-500/20 hover:border-cyan-500/40 bg-dark-900/30'
                      }`}
                    >
                      {destination === 'safe' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent" />
                      )}
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 relative z-10">
                        <Wallet className={destination === 'safe' ? 'text-neon-green' : 'text-cyan-400/50'} size={20} />
                        <span className={`font-semibold text-sm sm:text-base ${destination === 'safe' ? 'text-neon-green' : 'text-cyan-400'}`}>
                          Safe Wallet
                        </span>
                      </div>
                      <div className="space-y-1 relative z-10">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle size={14} className="text-neon-green flex-shrink-0" />
                          <span className="text-cyan-300">0% Deduction</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle size={14} className="text-neon-green flex-shrink-0" />
                          <span className="text-cyan-300">Instant Transfer</span>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setDestination('external')}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
                        destination === 'external'
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                          : 'border-cyan-500/20 hover:border-cyan-500/40 bg-dark-900/30'
                      }`}
                    >
                      {destination === 'external' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
                      )}
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 relative z-10">
                        <Wallet className={destination === 'external' ? 'text-cyan-400' : 'text-cyan-400/50'} size={20} />
                        <span className={`font-semibold text-sm sm:text-base ${destination === 'external' ? 'text-cyan-400' : 'text-cyan-400'}`}>
                          External Wallet
                        </span>
                      </div>
                      <div className="space-y-1 relative z-10">
                        <div className="flex items-center gap-2 text-xs">
                          <AlertCircle size={14} className="text-neon-orange flex-shrink-0" />
                          <span className="text-cyan-300">5% Deduction</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle size={14} className="text-cyan-400 flex-shrink-0" />
                          <span className="text-cyan-300">Triggers Team Rewards</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {selectedIncomeType && destination && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-cyan-300 mb-2 uppercase tracking-wide">
                    Step 3: Review & Claim
                  </label>
                  <div className="cyber-glass border border-cyan-500/30 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-cyan-300">Income Type</span>
                        <span className="font-medium text-cyan-300">{selectedIncome?.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-cyan-300">Gross Amount</span>
                        <span className="font-medium text-cyan-300">{details.rama.toFixed(2)} RAMA</span>
                      </div>
                      {destination === 'external' && (
                        <div className="flex justify-between items-center text-xs sm:text-sm text-neon-orange">
                          <span>Deduction (5%)</span>
                          <span className="font-medium">-{details.fee.toFixed(2)} RAMA</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-cyan-500/30">
                        <span className="text-xs sm:text-sm font-semibold text-cyan-300 uppercase tracking-wide">Net Amount</span>
                        <span className="font-bold text-sm sm:text-base text-neon-green">{details.net.toFixed(2)} RAMA</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={!canClaim || isClaiming}
                    className={`w-full py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition-all uppercase tracking-wide relative overflow-hidden group ${
                      canClaim && !isClaiming
                        ? 'bg-gradient-to-r from-cyan-500 to-neon-green text-dark-950 hover:shadow-lg hover:shadow-neon-cyan/50 hover:scale-[1.02]'
                        : 'bg-dark-850 text-cyan-400/30 cursor-not-allowed border border-cyan-500/20'
                    }`}
                  >
                    {canClaim && !isClaiming && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-neon-green opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isClaiming ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Processing...
                        </>
                      ) : canClaim ? (
                        `Claim ${selectedIncome?.name} to ${destination === 'safe' ? 'Safe Wallet' : 'External Wallet'}`
                      ) : (
                        'Select Income & Destination'
                      )}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cyber-glass rounded-2xl p-4 sm:p-6 border border-cyan-500/30 hover:border-cyan-500/80 relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <h2 className="text-base sm:text-lg font-semibold text-cyan-300 mb-3 sm:mb-4 uppercase tracking-wide">Claiming Rules</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-cyan-300">1</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-cyan-300">Minimum Claim</p>
                  <p className="text-xs text-cyan-300/90">Each income stream requires at least $1 USD to claim</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-cyan-300">2</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-cyan-300">External Wallet Claims</p>
                  <p className="text-xs text-cyan-300/90">Triggers slab income distribution to your upline team</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-cyan-300">3</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-cyan-300">Safe Wallet Claims</p>
                  <p className="text-xs text-cyan-300/90">No deduction, instant transfer, funds only for portfolio creation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="cyber-glass rounded-2xl p-4 sm:p-6 border border-cyan-500/30 hover:border-cyan-500/80 relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <h3 className="font-semibold text-sm sm:text-base text-cyan-300 mb-4 uppercase tracking-wide">Cap Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-cyan-400 uppercase tracking-wider">Portfolio Cap</span>
                  <span className="text-xs font-bold text-cyan-300">
                    {maxCap > 0 ? ((earnedSoFar / maxCap) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
                <div className="h-2 bg-dark-900 rounded-full overflow-hidden border border-cyan-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-neon-green rounded-full transition-all"
                    style={{ width: `${Math.min(maxCap > 0 ? (earnedSoFar / maxCap) * 100 : 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-cyan-300/90 mt-1">
                  {portfolioCapRemaining.toFixed(2)} RAMA remaining
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-cyan-400 uppercase tracking-wider">Global 4x Cap</span>
                  <span className="text-xs font-bold text-neon-green">
                    {maxLifetimeEarnable > 0 ? ((totalLifetimeEarned / maxLifetimeEarnable) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
                <div className="h-2 bg-dark-900 rounded-full overflow-hidden border border-cyan-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-neon-green to-cyan-500 rounded-full transition-all"
                    style={{ width: `${Math.min(maxLifetimeEarnable > 0 ? (totalLifetimeEarned / maxLifetimeEarnable) * 100 : 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-cyan-300/90 mt-1">
                  ${globalCapRemaining.toFixed(2)} remaining
                </p>
              </div>
            </div>
          </div>

          <div className="cyber-glass border border-cyan-500/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Clock className="text-cyan-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs sm:text-sm font-medium text-cyan-300 mb-1 uppercase tracking-wide">Cooldown Period</p>
                <p className="text-xs text-cyan-300/90">
                  24-hour cooldown applies to slab income claims after external wallet withdrawals
                </p>
              </div>
            </div>
          </div>

          <div className="cyber-glass border border-neon-orange/30 rounded-xl p-3 sm:p-4 ">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="text-neon-orange flex-shrink-0 mt-0.5 animate-pulse" size={18} />
              <div>
                <p className="text-xs sm:text-sm font-medium text-neon-orange mb-1 uppercase tracking-wide">Team Rewards</p>
                <p className="text-xs text-cyan-300/90">
                  When claiming to external wallet, 60% of growth is distributed to your upline team as slab income
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
