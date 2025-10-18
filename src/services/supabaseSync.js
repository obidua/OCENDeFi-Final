import { supabase } from '../lib/supabase';
import oceanContractService from './oceanContractService';

export const supabaseSyncService = {
  async ensureUser(walletAddress) {
    if (!walletAddress) return null;

    const lowerAddress = walletAddress.toLowerCase();

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', lowerAddress)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return null;
    }

    if (existingUser) {
      return existingUser;
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        wallet_address: lowerAddress,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return null;
    }

    return newUser;
  },

  async syncUserStats(walletAddress) {
    try {
      const user = await this.ensureUser(walletAddress);
      if (!user) return null;

      const overview = await oceanContractService.getUserOverview(walletAddress);

      const { data, error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          wallet_address: walletAddress.toLowerCase(),
          total_staked_usd: overview.totalStakedUSD,
          total_earned_rama: '0',
          safe_wallet_rama: overview.totalSafeWalletRama,
          direct_count: parseInt(overview.directCount),
          team_count: parseInt(overview.teamCount),
          slab_index: parseInt(overview.slabIndex),
          qualified_volume_usd: overview.qualifiedVolumeUSD,
          royalty_tier: parseInt(overview.royaltyTier),
          royalty_paused: overview.royaltyPaused,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'wallet_address'
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing user stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in syncUserStats:', error);
      return null;
    }
  },

  async syncPortfolios(walletAddress) {
    try {
      const user = await this.ensureUser(walletAddress);
      if (!user) return [];

      const portfolios = await oceanContractService.getPortfolioSummaries(walletAddress);

      const syncedPortfolios = [];

      for (const portfolio of portfolios) {
        const { data, error } = await supabase
          .from('portfolios')
          .upsert({
            user_id: user.id,
            wallet_address: walletAddress.toLowerCase(),
            portfolio_id: parseInt(portfolio.pid),
            principal_rama: portfolio.principalRama,
            principal_usd: portfolio.principalUSD,
            credited_rama: portfolio.creditedRama,
            cap_rama: portfolio.capRama,
            cap_percentage: parseInt(portfolio.capPct),
            is_booster: portfolio.booster,
            tier: parseInt(portfolio.tier),
            daily_rate_bps: parseInt(portfolio.dailyRateWad),
            is_active: portfolio.active,
            frozen_until: portfolio.frozenUntil > 0
              ? new Date(parseInt(portfolio.frozenUntil) * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'wallet_address,portfolio_id'
          })
          .select()
          .single();

        if (error) {
          console.error('Error syncing portfolio:', error);
        } else {
          syncedPortfolios.push(data);
        }
      }

      return syncedPortfolios;
    } catch (error) {
      console.error('Error in syncPortfolios:', error);
      return [];
    }
  },

  async logTransaction(walletAddress, txData) {
    try {
      const user = await this.ensureUser(walletAddress);
      if (!user) return null;

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress.toLowerCase(),
          transaction_hash: txData.hash,
          transaction_type: txData.type,
          amount_usd: txData.amountUSD || '0',
          amount_rama: txData.amountRAMA || '0',
          status: txData.status || 'pending',
          from_wallet: txData.from,
          to_wallet: txData.to,
          block_number: txData.blockNumber,
          gas_used: txData.gasUsed,
          metadata: txData.metadata || {},
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging transaction:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in logTransaction:', error);
      return null;
    }
  },

  async updateTransactionStatus(txHash, status) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('transaction_hash', txHash)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateTransactionStatus:', error);
      return null;
    }
  },

  async getCachedUserStats(walletAddress) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cached stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCachedUserStats:', error);
      return null;
    }
  },

  async getCachedPortfolios(walletAddress) {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cached portfolios:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCachedPortfolios:', error);
      return [];
    }
  },

  async getRecentTransactions(walletAddress, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentTransactions:', error);
      return [];
    }
  },

  async syncEarningsHistory(walletAddress, date, earningType, amountUSD, amountRAMA, portfolioId = null) {
    try {
      const user = await this.ensureUser(walletAddress);
      if (!user) return null;

      const { data, error } = await supabase
        .from('earnings_history')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress.toLowerCase(),
          date: date,
          earning_type: earningType,
          amount_usd: amountUSD,
          amount_rama: amountRAMA,
          portfolio_id: portfolioId,
          claimed: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing earnings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in syncEarningsHistory:', error);
      return null;
    }
  },

  async getLast7DaysEarnings(walletAddress) {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const { data, error } = await supabase
        .from('earnings_history')
        .select('date, amount_usd, amount_rama')
        .eq('wallet_address', walletAddress.toLowerCase())
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching 7-day earnings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLast7DaysEarnings:', error);
      return [];
    }
  },

  async shouldSyncData(walletAddress, maxAgeMinutes = 5) {
    try {
      const cachedStats = await this.getCachedUserStats(walletAddress);

      if (!cachedStats || !cachedStats.last_synced_at) {
        return true;
      }

      const lastSync = new Date(cachedStats.last_synced_at);
      const now = new Date();
      const minutesSinceSync = (now - lastSync) / (1000 * 60);

      return minutesSinceSync >= maxAgeMinutes;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return true;
    }
  },

  async fullSync(walletAddress) {
    try {
      console.log('Starting full sync for:', walletAddress);

      const [stats, portfolios] = await Promise.all([
        this.syncUserStats(walletAddress),
        this.syncPortfolios(walletAddress),
      ]);

      console.log('Full sync completed:', { stats, portfolios });

      return {
        success: true,
        stats,
        portfolios,
      };
    } catch (error) {
      console.error('Error in fullSync:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default supabaseSyncService;
