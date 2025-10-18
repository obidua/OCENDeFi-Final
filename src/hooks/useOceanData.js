import { useState, useEffect, useCallback } from 'react';
import oceanContractService from '../services/oceanContractService';
import supabaseSyncService from '../services/supabaseSync';
import { useActiveAddress } from './useActiveAddress';

export function useUserOverview() {
  const { address } = useActiveAddress();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const shouldSync = await supabaseSyncService.shouldSyncData(address, 5);

      if (!shouldSync) {
        const cachedStats = await supabaseSyncService.getCachedUserStats(address);
        if (cachedStats) {
          setData({
            totalStakedUSD: cachedStats.total_staked_usd,
            totalSafeWalletRama: cachedStats.safe_wallet_rama,
            directCount: cachedStats.direct_count.toString(),
            teamCount: cachedStats.team_count.toString(),
            slabIndex: cachedStats.slab_index.toString(),
            qualifiedVolumeUSD: cachedStats.qualified_volume_usd,
            royaltyTier: cachedStats.royalty_tier.toString(),
            royaltyPaused: cachedStats.royalty_paused,
          });
          setLoading(false);
          return;
        }
      }

      const overview = await oceanContractService.getUserOverview(address);
      setData(overview);

      supabaseSyncService.syncUserStats(address).catch(err =>
        console.error('Background sync failed:', err)
      );
    } catch (err) {
      console.error('Error fetching user overview:', err);
      setError(err.message);

      const cachedStats = await supabaseSyncService.getCachedUserStats(address);
      if (cachedStats) {
        setData({
          totalStakedUSD: cachedStats.total_staked_usd,
          totalSafeWalletRama: cachedStats.safe_wallet_rama,
          directCount: cachedStats.direct_count.toString(),
          teamCount: cachedStats.team_count.toString(),
          slabIndex: cachedStats.slab_index.toString(),
          qualifiedVolumeUSD: cachedStats.qualified_volume_usd,
          royaltyTier: cachedStats.royalty_tier.toString(),
          royaltyPaused: cachedStats.royalty_paused,
        });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function usePortfolioSummaries() {
  const { address } = useActiveAddress();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const portfolios = await oceanContractService.getPortfolioSummaries(address);
      setData(portfolios);
    } catch (err) {
      console.error('Error fetching portfolio summaries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function usePortfolioTotals() {
  const { address } = useActiveAddress();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const totals = await oceanContractService.getPortfolioTotals(address);
      setData(totals);
    } catch (err) {
      console.error('Error fetching portfolio totals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useSlabPanel() {
  const { address } = useActiveAddress();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const slabPanel = await oceanContractService.getSlabPanel(address);
      setData(slabPanel);
    } catch (err) {
      console.error('Error fetching slab panel:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useRoyaltyPanel() {
  const { address } = useActiveAddress();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const royaltyPanel = await oceanContractService.getRoyaltyPanel(address);
      setData(royaltyPanel);
    } catch (err) {
      console.error('Error fetching royalty panel:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useWalletPanel() {
  const { address } = useActiveAddress();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const walletPanel = await oceanContractService.getWalletPanel(address);
      setData(walletPanel);
    } catch (err) {
      console.error('Error fetching wallet panel:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useTeamNetwork(maxDepth = 20) {
  const { address } = useActiveAddress();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const network = await oceanContractService.getTeamNetwork(address, maxDepth);
      setData(network);
    } catch (err) {
      console.error('Error fetching team network:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address, maxDepth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useLastTransactions(limit = 10) {
  const { address } = useActiveAddress();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const transactions = await oceanContractService.getLastTransactions(address, limit);
      setData(transactions);
    } catch (err) {
      console.error('Error fetching last transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useLast7DaysEarnings() {
  const { address } = useActiveAddress();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cachedEarnings = await supabaseSyncService.getLast7DaysEarnings(address);

      if (cachedEarnings && cachedEarnings.length > 0) {
        const formatted = cachedEarnings.map(earning => ({
          date: earning.date,
          amount: oceanContractService.toUSD(earning.amount_usd)
        }));
        setData(formatted);
        setLoading(false);
        return;
      }

      const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      const earnings = await oceanContractService.getLast7DaysEarnings(address, today);

      const formatted = earnings.dayIds.map((dayId, index) => ({
        dayId: dayId.toString(),
        date: new Date(parseInt(dayId) * 86400 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        amount: oceanContractService.toUSD(earnings.usdAmounts[index])
      }));

      setData(formatted);
    } catch (err) {
      console.error('Error fetching 7-day earnings:', err);
      setError(err.message);

      const fallbackData = [
        { date: 'Mon', amount: 0 },
        { date: 'Tue', amount: 0 },
        { date: 'Wed', amount: 0 },
        { date: 'Thu', amount: 0 },
        { date: 'Fri', amount: 0 },
        { date: 'Sat', amount: 0 },
        { date: 'Sun', amount: 0 },
      ];
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useDailyEarningHistory(daysCount = 30) {
  const { address } = useActiveAddress();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const history = await oceanContractService.getDailyEarningHistory(address, daysCount);
      setData(history);
    } catch (err) {
      console.error('Error fetching daily earning history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address, daysCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
