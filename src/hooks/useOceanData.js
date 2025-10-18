import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import oceanContractService from '../services/oceanContractService';

export function useUserOverview() {
  const { address } = useAccount();
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
      const overview = await oceanContractService.getUserOverview(address);
      setData(overview);
    } catch (err) {
      console.error('Error fetching user overview:', err);
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

export function usePortfolioSummaries() {
  const { address } = useAccount();
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
  const { address } = useAccount();
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
  const { address } = useAccount();
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
  const { address } = useAccount();
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
  const { address } = useAccount();
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
  const { address } = useAccount();
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
  const { address } = useAccount();
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
