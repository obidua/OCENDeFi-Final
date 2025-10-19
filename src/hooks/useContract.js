import { useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import Web3 from 'web3';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import OceanViewABI from '../../store/Contract_ABI/OCEANVIEWUPGRADABLEABI.json';
import OceanQueryABI from '../../store/Contract_ABI/OceanQueryUpgradeableABI.json';
import PortfolioManagerABI from '../../store/Contract_ABI/PortFolioManager.json';
import IncomeDistributorABI from '../../store/Contract_ABI/IncomeDistributor.json';
import SafeWalletABI from '../../store/Contract_ABI/SafeWallet.json';
import RoyaltyManagerABI from '../../store/Contract_ABI/RoyaltyManager.json';
import SlabManagerABI from '../../store/Contract_ABI/SlabManager.json';
import RewardVaultABI from '../../store/Contract_ABI/RewardVault.json';
import UserRegistryABI from '../../store/Contract_ABI/UserRegistry.json';

export function useWeb3() {
  return useMemo(() => {
    return new Web3('https://blockchain.ramestta.com');
  }, []);
}

export function useOceanViewContract() {
  const web3 = useWeb3();
  const { address: userAddress } = useAccount();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(OceanViewABI, CONTRACT_ADDRESSES.OCEAN_VIEW);
  }, [web3]);
}

export function useOceanQueryContract() {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(OceanQueryABI, CONTRACT_ADDRESSES.OCEAN_QUERY);
  }, [web3]);
}

export function usePortfolioManagerContract() {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(PortfolioManagerABI, CONTRACT_ADDRESSES.PORTFOLIO_MANAGER);
  }, [web3]);
}

export function useIncomeDistributorContract() {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(IncomeDistributorABI, CONTRACT_ADDRESSES.INCOME_DISTRIBUTOR);
  }, [web3]);
}

export function useSafeWalletContract() {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(SafeWalletABI, CONTRACT_ADDRESSES.SAFE_WALLET);
  }, [web3]);
}

export function useRoyaltyManagerContract() {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(RoyaltyManagerABI, CONTRACT_ADDRESSES.ROYALTY_MANAGER);
  }, [web3]);
}

export function useSlabManagerContract() {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(SlabManagerABI, CONTRACT_ADDRESSES.SLAB_MANAGER);
  }, [web3]);
}

export function useRewardVaultContract() {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(RewardVaultABI, CONTRACT_ADDRESSES.REWARD_VAULT);
  }, [web3]);
}

export function useUserRegistryContract() {
  const web3 = useWeb3();

  return useMemo(() => {
    if (!web3) return null;

    return new web3.eth.Contract(UserRegistryABI, CONTRACT_ADDRESSES.USER_REGISTRY);
  }, [web3]);
}
