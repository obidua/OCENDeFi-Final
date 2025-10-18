# Developer Quick Reference - Ocean DeFi Dashboard Integration

## Quick Start

### Using Blockchain Data in Components

```javascript
// Import the hooks
import { useUserOverview, usePortfolioSummaries, usePortfolioTotals } from '../hooks/useOceanData';

// In your component
function MyComponent() {
  const { data, loading, error, refetch } = useUserOverview();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data) return <NoDataDisplay />;

  return <div>{data.totalStakedUSD}</div>;
}
```

### Available Data Hooks

#### useUserOverview()
Returns user overview data from blockchain/cache:
```javascript
{
  totalStakedUSD: string,
  totalSafeWalletRama: string,
  directCount: string,
  teamCount: string,
  slabIndex: string,
  qualifiedVolumeUSD: string,
  royaltyTier: string,
  royaltyPaused: boolean
}
```

#### usePortfolioSummaries()
Returns array of user portfolios:
```javascript
[{
  pid: string,
  principalRama: string,
  principalUSD: string,
  creditedRama: string,
  capRama: string,
  booster: boolean,
  tier: string,
  active: boolean,
  frozenUntil: string
}]
```

#### usePortfolioTotals()
Returns aggregated portfolio data:
```javascript
{
  totalValueUSD: string,
  totalEarnedRama: string,
  directRefs: string,
  qualifiedVolumeUSD: string,
  royaltyLevel: string
}
```

#### useLast7DaysEarnings()
Returns 7-day earnings data for charts:
```javascript
[{
  date: string, // e.g., "Mon"
  amount: number // USD amount
}]
```

### Using Supabase Sync Service

```javascript
import supabaseSyncService from '../services/supabaseSync';

// Sync user data
await supabaseSyncService.fullSync(walletAddress);

// Check if sync needed
const shouldSync = await supabaseSyncService.shouldSyncData(walletAddress, 5);

// Get cached data
const cachedStats = await supabaseSyncService.getCachedUserStats(walletAddress);

// Log transaction
await supabaseSyncService.logTransaction(walletAddress, {
  hash: txHash,
  type: 'stake',
  amountUSD: '100000000',
  status: 'pending'
});
```

## Formatting Values

### Using Ocean Contract Service

```javascript
import oceanContractService from '../services/oceanContractService';

// Format USD (input is in 1e8 precision)
const formattedUSD = oceanContractService.formatUSD('10000000000'); // "$100.00"

// Format RAMA (input is in 1e18 precision)
const formattedRAMA = oceanContractService.formatRAMA('1000000000000000000'); // "1.00"

// Convert to decimal
const usdAmount = oceanContractService.toUSD('10000000000'); // 100
const ramaAmount = oceanContractService.toRAMA('1000000000000000000'); // 1

// Calculate rates
const dailyRate = oceanContractService.calculateDailyGrowthRate(stakedUSD, isBooster);
const maxCap = oceanContractService.calculateMaxCap(principalUSD, isBooster);
const lifetimeCap = oceanContractService.calculateLifetimeCap(totalStakedUSD);
```

## Common Patterns

### Loading State Pattern
```javascript
function MyComponent() {
  const { data, loading } = useUserOverview();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-cyan-500/20 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-cyan-500/10 rounded w-1/3"></div>
      </div>
    );
  }

  return <DataDisplay data={data} />;
}
```

### Error Handling Pattern
```javascript
function MyComponent() {
  const { data, error } = useUserOverview();

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-300">Error: {error}</p>
      </div>
    );
  }

  return <DataDisplay data={data} />;
}
```

### Refresh Data Pattern
```javascript
function MyComponent() {
  const { data, refetch } = useUserOverview();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <button onClick={handleRefresh} disabled={isRefreshing}>
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  );
}
```

## Database Queries

### Direct Supabase Queries

```javascript
import { supabase } from '../lib/supabase';

// Get user stats
const { data, error } = await supabase
  .from('user_stats')
  .select('*')
  .eq('wallet_address', address.toLowerCase())
  .maybeSingle();

// Get recent transactions
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('wallet_address', address.toLowerCase())
  .order('created_at', { ascending: false })
  .limit(10);

// Get earnings history
const { data, error } = await supabase
  .from('earnings_history')
  .select('*')
  .eq('wallet_address', address.toLowerCase())
  .gte('date', sevenDaysAgo)
  .order('date', { ascending: true });
```

## Contract Integration

### Reading Contract Data

```javascript
import oceanContractService from '../services/oceanContractService';

// Get user overview
const overview = await oceanContractService.getUserOverview(walletAddress);

// Get portfolios
const portfolios = await oceanContractService.getPortfolioSummaries(walletAddress);

// Get totals
const totals = await oceanContractService.getPortfolioTotals(walletAddress);

// Get slab panel
const slabPanel = await oceanContractService.getSlabPanel(walletAddress);

// Get team network
const network = await oceanContractService.getTeamNetwork(walletAddress, 20);
```

## Common Calculations

### Portfolio Cap Calculation
```javascript
const maxCap = oceanContractService.calculateMaxCap(principalUSD, isBooster);
const earnedSoFar = oceanContractService.toRAMA(creditedRama);
const progress = (earnedSoFar / maxCap) * 100;
```

### Daily Rate Calculation
```javascript
const dailyRate = oceanContractService.calculateDailyGrowthRate(stakedUSD, isBooster);
// Returns: 0.33, 0.4, 0.66, or 0.8
```

### Lifetime Cap Calculation
```javascript
const totalStaked = oceanContractService.toUSD(totalStakedUSD);
const maxLifetimeCap = totalStaked * 4;
const earnedSoFar = oceanContractService.toRAMA(totalEarnedRama);
const progress = (earnedSoFar / maxLifetimeCap) * 100;
```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Common Issues & Solutions

### Issue: Data not loading
**Solution**: Check wallet connection and network
```javascript
const { address, isConnected } = useAccount();
if (!isConnected) {
  // Show connect wallet message
}
```

### Issue: Stale cache data
**Solution**: Force refresh
```javascript
const { refetch } = useUserOverview();
await refetch();
```

### Issue: BigInt conversion errors
**Solution**: Always convert to string before using
```javascript
const value = BigInt(data.amount).toString();
```

### Issue: Missing Supabase data
**Solution**: Trigger sync
```javascript
await supabaseSyncService.fullSync(walletAddress);
```

## Testing

### Test with Mock Wallet
```javascript
const testWallet = '0x1234567890123456789012345678901234567890';
const overview = await oceanContractService.getUserOverview(testWallet);
console.log('Overview:', overview);
```

### Test Cache Behavior
```javascript
// First call - should hit blockchain
const data1 = await supabaseSyncService.getCachedUserStats(wallet);
console.log('Cache status:', data1 ? 'Hit' : 'Miss');

// Wait and check again
await new Promise(resolve => setTimeout(resolve, 6000));
const shouldSync = await supabaseSyncService.shouldSyncData(wallet, 5);
console.log('Should sync:', shouldSync); // true after 5+ minutes
```

## Performance Tips

1. **Use cached data when available**
   - Hooks automatically check cache first
   - Reduces blockchain calls by 80%+

2. **Batch refetch operations**
   ```javascript
   await Promise.all([
     refetchOverview(),
     refetchPortfolios(),
     refetchTotals()
   ]);
   ```

3. **Debounce user actions**
   ```javascript
   const debouncedRefresh = debounce(handleRefresh, 1000);
   ```

4. **Show loading states immediately**
   ```javascript
   setLoading(true);
   await fetchData();
   setLoading(false);
   ```

## Security Best Practices

1. **Always use lowercase wallet addresses**
   ```javascript
   const address = walletAddress.toLowerCase();
   ```

2. **Validate user inputs**
   ```javascript
   if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
     throw new Error('Invalid address');
   }
   ```

3. **Use RLS policies**
   - All Supabase tables have RLS enabled
   - Users can only access their own data

4. **Never expose private keys**
   - Use wagmi/viem for signing
   - Never store private keys in database

## Useful Commands

```bash
# Build project
npm run build

# Run dev server
npm run dev

# Type check
npm run typecheck

# Lint code
npm run lint
```

## Support

For issues or questions:
1. Check this reference guide
2. Review DASHBOARD_INTEGRATION_SUMMARY.md
3. Check contract ABIs in store/Contract_ABI/
4. Review smart contract code for expected data structures
