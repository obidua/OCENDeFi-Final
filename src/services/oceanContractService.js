import Web3 from 'web3';
import { CONTRACT_ADDRESSES, USD_PRECISION, RAMA_PRECISION } from '../config/contracts';
import OceanViewABI from '../../store/Contract_ABI/OCEANVIEWUPGRADABLEABI.json';
import OceanQueryABI from '../../store/Contract_ABI/OceanQueryUpgradeableABI.json';

const RPC_URL = 'https://blockchain.ramestta.com';
const web3 = new Web3(RPC_URL);

const oceanViewContract = new web3.eth.Contract(OceanViewABI, CONTRACT_ADDRESSES.OCEAN_VIEW);
const oceanQueryContract = new web3.eth.Contract(OceanQueryABI, CONTRACT_ADDRESSES.OCEAN_QUERY);

export const oceanContractService = {
  async getUserOverview(userAddress) {
    try {
      const overview = await oceanViewContract.methods.getUserOverview(userAddress, 20).call();
      return {
        totalStakedRama: overview.totalStakedRama,
        totalStakedUSD: overview.totalStakedUSD,
        totalSafeWalletRama: overview.totalSafeWalletRama,
        totalRoiUsdPaid: overview.totalRoiUsdPaid,
        directCount: overview.directCount,
        teamCount: overview.teamCount,
        uplineSponsor: overview.uplineSponsor,
        slabIndex: overview.slabIndex,
        qualifiedVolumeUSD: overview.qualifiedVolumeUSD,
        slabCanClaim: overview.slabCanClaim,
        royaltyTier: overview.royaltyTier,
        royaltyLastMonthEpoch: overview.royaltyLastMonthEpoch,
        royaltyPaused: overview.royaltyPaused,
      };
    } catch (error) {
      console.error('Error fetching user overview:', error);
      throw error;
    }
  },

  async getPortfolioSummaries(userAddress) {
    try {
      const portfolios = await oceanViewContract.methods.getPortfolioSummaries(userAddress).call();
      return portfolios.map(p => ({
        pid: p.pid,
        principalRama: p.principalRama,
        principalUSD: p.principalUSD,
        capRama: p.capRama,
        creditedRama: p.creditedRama,
        capPct: p.capPct,
        booster: p.booster,
        tier: p.tier,
        dailyRateWad: p.dailyRateWad,
        active: p.active,
        createdAt: p.createdAt,
        frozenUntil: p.frozenUntil,
      }));
    } catch (error) {
      console.error('Error fetching portfolio summaries:', error);
      throw error;
    }
  },

  async getPortfolioTotals(userAddress) {
    try {
      const totals = await oceanViewContract.methods.getPortfolioTotals(userAddress).call();
      return {
        totalValueUSD: totals.totalValueUSD,
        totalEarnedRama: totals.totalEarnedRama,
        directRefs: totals.directRefs,
        qualifiedVolumeUSD: totals.qualifiedVolumeUSD,
        royaltyLevel: totals.royaltyLevel,
      };
    } catch (error) {
      console.error('Error fetching portfolio totals:', error);
      throw error;
    }
  },

  async getSlabPanel(userAddress) {
    try {
      const slabPanel = await oceanViewContract.methods.getSlabPanel(userAddress).call();
      return {
        slabIndex: slabPanel.slabIndex,
        qualifiedVolumeUSD: slabPanel.qualifiedVolumeUSD,
        directMembers: slabPanel.directMembers,
        canClaim: slabPanel.canClaim,
      };
    } catch (error) {
      console.error('Error fetching slab panel:', error);
      throw error;
    }
  },

  async getRoyaltyPanel(userAddress) {
    try {
      const royaltyPanel = await oceanViewContract.methods.getRoyaltyPanel(userAddress).call();
      return {
        currentLevel: royaltyPanel.currentLevel,
        lastPaidMonthEpoch: royaltyPanel.lastPaidMonthEpoch,
        paused: royaltyPanel.paused,
      };
    } catch (error) {
      console.error('Error fetching royalty panel:', error);
      throw error;
    }
  },

  async getWalletPanel(userAddress) {
    try {
      const walletPanel = await oceanViewContract.methods.getWalletPanel(userAddress).call();
      return {
        safeRama: walletPanel.safeRama,
        lifetimeRoiUsd: walletPanel.lifetimeRoiUsd,
      };
    } catch (error) {
      console.error('Error fetching wallet panel:', error);
      throw error;
    }
  },

  async getTeamNetwork(userAddress, maxDepth = 20) {
    try {
      const network = await oceanViewContract.methods.getTeamNetwork(userAddress, maxDepth).call();
      return {
        directs: network.directs,
        directCount: network.directCount,
        teamCount: network.teamCount,
      };
    } catch (error) {
      console.error('Error fetching team network:', error);
      throw error;
    }
  },

  async getLastTransactions(userAddress, limit = 10) {
    try {
      const transactions = await oceanViewContract.methods.getLastTransactions(userAddress, limit).call();
      return transactions;
    } catch (error) {
      console.error('Error fetching last transactions:', error);
      throw error;
    }
  },

  async getLast7DaysEarnings(userAddress, todayDayId) {
    try {
      const earnings = await oceanViewContract.methods.getLast7DaysEarningsUSD(userAddress, todayDayId).call();
      return {
        dayIds: earnings.dayIds,
        usdAmounts: earnings.usdAmounts,
      };
    } catch (error) {
      console.error('Error fetching last 7 days earnings:', error);
      throw error;
    }
  },

  async getDailyEarningHistory(userAddress, daysCount = 30) {
    try {
      const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      const history = [];

      for (let i = 0; i < Math.ceil(daysCount / 7); i++) {
        const dayId = today - (i * 7);
        const earnings = await oceanViewContract.methods.getLast7DaysEarningsUSD(userAddress, dayId).call();

        earnings.dayIds.forEach((day, idx) => {
          if (earnings.usdAmounts[idx] !== '0') {
            history.push({
              dayId: day.toString(),
              date: new Date(parseInt(day) * 86400 * 1000),
              amountUSD: earnings.usdAmounts[idx],
            });
          }
        });
      }

      return history.sort((a, b) => b.date - a.date).slice(0, daysCount);
    } catch (error) {
      console.error('Error fetching daily earning history:', error);
      throw error;
    }
  },

  async getSumOfUserStakes(userAddress) {
    try {
      const amount = await oceanViewContract.methods.getSumOfUserStakes(userAddress).call();
      return amount;
    } catch (error) {
      console.error('Error fetching sum of user stakes:', error);
      throw error;
    }
  },

  formatUSD(value) {
    if (typeof value === 'bigint' || typeof value === 'string') {
      const num = Number(value) / Number(USD_PRECISION);
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  },

  formatRAMA(value) {
    if (typeof value === 'bigint' || typeof value === 'string') {
      const num = Number(value) / Number(RAMA_PRECISION);
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
    }
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  },

  formatPercentage(bps) {
    const num = Number(bps) / 100;
    return `${num}%`;
  },

  toUSD(value) {
    return Number(value) / Number(USD_PRECISION);
  },

  toRAMA(value) {
    return Number(value) / Number(RAMA_PRECISION);
  },

  calculateDailyGrowthRate(stakedUSD, isBooster) {
    const stakedAmount = this.toUSD(stakedUSD);
    if (isBooster) {
      return stakedAmount >= 5010 ? 0.8 : 0.66;
    }
    return stakedAmount >= 5010 ? 0.4 : 0.33;
  },

  calculateMaxCap(principalUSD, isBooster) {
    const principal = this.toUSD(principalUSD);
    const multiplier = isBooster ? 2.5 : 2.0;
    return principal * multiplier;
  },

  calculateLifetimeCap(totalLifetimeStakedUSD) {
    const totalStaked = this.toUSD(totalLifetimeStakedUSD);
    return totalStaked * 4;
  },

  calculateProgressPercentage(current, max) {
    const currentNum = typeof current === 'string' ? this.toUSD(current) : current;
    const maxNum = typeof max === 'string' ? this.toUSD(max) : max;
    return (currentNum / maxNum) * 100;
  },

  getPortfolioStatus(active, frozenUntil) {
    const now = Math.floor(Date.now() / 1000);
    if (!active) return 'INACTIVE';
    if (Number(frozenUntil) > now) return 'FROZEN';
    return 'ACTIVE';
  },

  canClaimRoyalty(lastPaidMonthEpoch) {
    const now = Math.floor(Date.now() / 1000);
    const lastPaid = Number(lastPaidMonthEpoch);
    const oneMonthSeconds = 30 * 24 * 60 * 60;
    return (now - lastPaid) >= oneMonthSeconds;
  },

  calculateNextRoyaltyDate(lastPaidMonthEpoch) {
    const lastPaid = Number(lastPaidMonthEpoch);
    const oneMonthSeconds = 30 * 24 * 60 * 60;
    return new Date((lastPaid + oneMonthSeconds) * 1000);
  },
};

export default oceanContractService;
