import Web3 from 'web3';
import { CONTRACT_ADDRESSES, RAMA_PRECISION, USD_PRECISION } from '../config/contracts';
import PortfolioManagerABI from '../../store/Contract_ABI/PortFolioManager.json';
import IncomeDistributorABI from '../../store/Contract_ABI/IncomeDistributor.json';
import SafeWalletABI from '../../store/Contract_ABI/SafeWallet.json';
import supabaseSyncService from './supabaseSync';

const RPC_URL = 'https://blockchain.ramestta.com';

export const oceanTransactionService = {
  async getWeb3Provider() {
    if (window.ethereum) {
      return new Web3(window.ethereum);
    }
    return new Web3(RPC_URL);
  },

  async createPortfolio(userAddress, referrerAddress, ramaAmount) {
    try {
      const web3 = await this.getWeb3Provider();
      const portfolioManager = new web3.eth.Contract(
        PortfolioManagerABI,
        CONTRACT_ADDRESSES.PORTFOLIO_MANAGER
      );

      const value = BigInt(ramaAmount) * RAMA_PRECISION;

      const gasEstimate = await portfolioManager.methods
        .createPortfolio(referrerAddress)
        .estimateGas({
          from: userAddress,
          value: value.toString(),
        });

      const gasPrice = await web3.eth.getGasPrice();

      const tx = await portfolioManager.methods
        .createPortfolio(referrerAddress)
        .send({
          from: userAddress,
          value: value.toString(),
          gas: Math.floor(Number(gasEstimate) * 1.2),
          gasPrice: gasPrice,
        });

      await supabaseSyncService.logTransaction(userAddress, {
        hash: tx.transactionHash,
        type: 'stake',
        amountRAMA: value.toString(),
        status: 'completed',
        from: userAddress,
        to: CONTRACT_ADDRESSES.PORTFOLIO_MANAGER,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
        metadata: { referrer: referrerAddress },
      });

      await supabaseSyncService.fullSync(userAddress);

      return {
        success: true,
        txHash: tx.transactionHash,
        portfolioId: tx.events?.PortfolioCreated?.returnValues?.pid,
      };
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  },

  async claimPortfolioGrowth(userAddress, portfolioId, toSafeWallet = false) {
    try {
      const web3 = await this.getWeb3Provider();
      const incomeDistributor = new web3.eth.Contract(
        IncomeDistributorABI,
        CONTRACT_ADDRESSES.INCOME_DISTRIBUTOR
      );

      const method = toSafeWallet
        ? incomeDistributor.methods.claimToSafe(portfolioId)
        : incomeDistributor.methods.claimToExternal(portfolioId);

      const gasEstimate = await method.estimateGas({ from: userAddress });
      const gasPrice = await web3.eth.getGasPrice();

      const tx = await method.send({
        from: userAddress,
        gas: Math.floor(Number(gasEstimate) * 1.2),
        gasPrice: gasPrice,
      });

      await supabaseSyncService.logTransaction(userAddress, {
        hash: tx.transactionHash,
        type: toSafeWallet ? 'claim_to_safe' : 'claim_to_external',
        status: 'completed',
        from: userAddress,
        to: CONTRACT_ADDRESSES.INCOME_DISTRIBUTOR,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
        metadata: { portfolioId, destination: toSafeWallet ? 'safe' : 'external' },
      });

      await supabaseSyncService.fullSync(userAddress);

      return {
        success: true,
        txHash: tx.transactionHash,
        amount: tx.events?.Claimed?.returnValues?.amount || '0',
      };
    } catch (error) {
      console.error('Error claiming portfolio growth:', error);
      throw error;
    }
  },

  async claimSlabIncome(userAddress, toSafeWallet = false) {
    try {
      const web3 = await this.getWeb3Provider();
      const incomeDistributor = new web3.eth.Contract(
        IncomeDistributorABI,
        CONTRACT_ADDRESSES.INCOME_DISTRIBUTOR
      );

      const method = toSafeWallet
        ? incomeDistributor.methods.claimSlabToSafe()
        : incomeDistributor.methods.claimSlabToExternal();

      const gasEstimate = await method.estimateGas({ from: userAddress });
      const gasPrice = await web3.eth.getGasPrice();

      const tx = await method.send({
        from: userAddress,
        gas: Math.floor(Number(gasEstimate) * 1.2),
        gasPrice: gasPrice,
      });

      await supabaseSyncService.logTransaction(userAddress, {
        hash: tx.transactionHash,
        type: toSafeWallet ? 'claim_slab_to_safe' : 'claim_slab_to_external',
        status: 'completed',
        from: userAddress,
        to: CONTRACT_ADDRESSES.INCOME_DISTRIBUTOR,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
        metadata: { destination: toSafeWallet ? 'safe' : 'external' },
      });

      await supabaseSyncService.fullSync(userAddress);

      return {
        success: true,
        txHash: tx.transactionHash,
        amount: tx.events?.SlabClaimed?.returnValues?.amount || '0',
      };
    } catch (error) {
      console.error('Error claiming slab income:', error);
      throw error;
    }
  },

  async claimRoyaltyIncome(userAddress) {
    try {
      const web3 = await this.getWeb3Provider();
      const incomeDistributor = new web3.eth.Contract(
        IncomeDistributorABI,
        CONTRACT_ADDRESSES.INCOME_DISTRIBUTOR
      );

      const gasEstimate = await incomeDistributor.methods
        .claimRoyalty()
        .estimateGas({ from: userAddress });
      const gasPrice = await web3.eth.getGasPrice();

      const tx = await incomeDistributor.methods.claimRoyalty().send({
        from: userAddress,
        gas: Math.floor(Number(gasEstimate) * 1.2),
        gasPrice: gasPrice,
      });

      await supabaseSyncService.logTransaction(userAddress, {
        hash: tx.transactionHash,
        type: 'claim_royalty',
        status: 'completed',
        from: userAddress,
        to: CONTRACT_ADDRESSES.INCOME_DISTRIBUTOR,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
      });

      await supabaseSyncService.fullSync(userAddress);

      return {
        success: true,
        txHash: tx.transactionHash,
        amount: tx.events?.RoyaltyClaimed?.returnValues?.amount || '0',
      };
    } catch (error) {
      console.error('Error claiming royalty income:', error);
      throw error;
    }
  },

  async withdrawFromSafeWallet(userAddress, amount) {
    try {
      const web3 = await this.getWeb3Provider();
      const safeWallet = new web3.eth.Contract(
        SafeWalletABI,
        CONTRACT_ADDRESSES.SAFE_WALLET
      );

      const amountBigInt = BigInt(amount) * RAMA_PRECISION;

      const gasEstimate = await safeWallet.methods
        .withdraw(amountBigInt.toString())
        .estimateGas({ from: userAddress });
      const gasPrice = await web3.eth.getGasPrice();

      const tx = await safeWallet.methods.withdraw(amountBigInt.toString()).send({
        from: userAddress,
        gas: Math.floor(Number(gasEstimate) * 1.2),
        gasPrice: gasPrice,
      });

      await supabaseSyncService.logTransaction(userAddress, {
        hash: tx.transactionHash,
        type: 'safe_wallet_withdraw',
        amountRAMA: amountBigInt.toString(),
        status: 'completed',
        from: userAddress,
        to: CONTRACT_ADDRESSES.SAFE_WALLET,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
      });

      await supabaseSyncService.fullSync(userAddress);

      return {
        success: true,
        txHash: tx.transactionHash,
      };
    } catch (error) {
      console.error('Error withdrawing from safe wallet:', error);
      throw error;
    }
  },

  async getSafeWalletBalance(userAddress) {
    try {
      const web3 = new Web3(RPC_URL);
      const safeWallet = new web3.eth.Contract(
        SafeWalletABI,
        CONTRACT_ADDRESSES.SAFE_WALLET
      );

      const balance = await safeWallet.methods.balanceOf(userAddress).call();
      return balance;
    } catch (error) {
      console.error('Error getting safe wallet balance:', error);
      throw error;
    }
  },

  async getConnectedWalletBalance(userAddress) {
    try {
      const web3 = new Web3(RPC_URL);
      const balance = await web3.eth.getBalance(userAddress);
      return balance;
    } catch (error) {
      console.error('Error getting connected wallet balance:', error);
      throw error;
    }
  },

  async checkUserRegistration(userAddress) {
    try {
      const web3 = new Web3(RPC_URL);
      const portfolioManager = new web3.eth.Contract(
        PortfolioManagerABI,
        CONTRACT_ADDRESSES.PORTFOLIO_MANAGER
      );

      const isRegistered = await portfolioManager.methods
        .checkWhetherUserIsRegistered()
        .call({ from: userAddress });

      return isRegistered;
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  },

  async validateReferrerAddress(referrerAddress) {
    try {
      const web3 = new Web3(RPC_URL);
      const portfolioManager = new web3.eth.Contract(
        PortfolioManagerABI,
        CONTRACT_ADDRESSES.PORTFOLIO_MANAGER
      );

      const hasActivePortfolio = await portfolioManager.methods
        .hasActiveMin50(referrerAddress)
        .call();

      return hasActivePortfolio;
    } catch (error) {
      console.error('Error validating referrer:', error);
      return false;
    }
  },

  parseTransactionError(error) {
    if (error.message.includes('User denied')) {
      return 'Transaction was cancelled by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('execution reverted')) {
      const revertReason = error.message.match(/execution reverted: (.+)/);
      return revertReason ? revertReason[1] : 'Transaction failed';
    }
    return error.message || 'Transaction failed';
  },
};

export default oceanTransactionService;
