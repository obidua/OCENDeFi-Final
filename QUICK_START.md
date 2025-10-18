# Quick Start: Smart Contract Integration

## 🎯 What Has Been Implemented

### ✅ Complete Infrastructure (Ready to Use)

1. **Contract Addresses** → `src/config/contracts.js`
2. **Web3 Hooks** → `src/hooks/useContract.js`
3. **Contract Service** → `src/services/oceanContractService.js`
4. **Data Hooks** → `src/hooks/useOceanData.js`
5. **Reference Page** → `src/pages/DashboardIntegrated.jsx`

### 📚 Documentation

- **CONTRACT_INTEGRATION_GUIDE.md** - Complete integration guide with code examples
- **IMPLEMENTATION_SUMMARY.md** - Detailed status and completion tracking
- **QUICK_START.md** - This file

## 🚀 How to Use (For Any Page)

### Step 1: Import Required Modules
```javascript
import { useAccount } from 'wagmi';
import { useUserOverview, usePortfolioSummaries } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';
```

### Step 2: Set Up Component
```javascript
export default function YourPage() {
  const { address, isConnected } = useAccount();
  const { data: overview, loading, error } = useUserOverview();
  const { data: portfolios } = usePortfolioSummaries();

  // Wallet not connected
  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  // Loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Error
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Extract data
  const totalStaked = overview?.totalStakedUSD || '0';
  const directCount = overview?.directCount || '0';

  // Format for display
  const formattedStaked = oceanContractService.formatUSD(totalStaked);

  return (
    <div>
      <h1>Staked: {formattedStaked}</h1>
      <p>Direct Members: {directCount.toString()}</p>
    </div>
  );
}
```

## 📋 Available Hooks

| Hook | Data Returned | Use Case |
|------|---------------|----------|
| `useUserOverview()` | Complete user data | Dashboard, overview pages |
| `usePortfolioSummaries()` | All portfolios | Portfolio list, details |
| `usePortfolioTotals()` | Aggregated totals | Summary cards |
| `useSlabPanel()` | Slab income data | Slab income page |
| `useRoyaltyPanel()` | Royalty data | Royalty program page |
| `useWalletPanel()` | Safe wallet balance | Safe wallet page |
| `useTeamNetwork(depth)` | Team structure | Team network page |
| `useLastTransactions(limit)` | Transaction history | Transaction pages |

## 🔧 Common Service Functions

### Formatting
```javascript
oceanContractService.formatUSD(value)        // "$1,234.56"
oceanContractService.formatRAMA(value)       // "1,234.56"
oceanContractService.formatPercentage(bps)   // "15%"
```

### Calculations
```javascript
oceanContractService.calculateDailyGrowthRate(stakedUSD, isBooster)
oceanContractService.calculateMaxCap(principalUSD, isBooster)
oceanContractService.calculateLifetimeCap(totalStaked)
oceanContractService.getPortfolioStatus(active, frozenUntil)
```

### Conversions
```javascript
oceanContractService.toUSD(value)   // Convert from 8-decimal to number
oceanContractService.toRAMA(value)  // Convert from 18-decimal to number
```

## 📊 Data Structure Examples

### UserOverview
```javascript
{
  totalStakedRama: "850000000000000000000",     // 850 RAMA (18 decimals)
  totalStakedUSD: "750000000000",               // $7,500 (8 decimals)
  totalSafeWalletRama: "45000000000000000000",  // 45 RAMA
  directCount: "4",                              // 4 direct members
  teamCount: "12",                               // 12 total team
  slabIndex: "3",                                // Slab level 3
  qualifiedVolumeUSD: "1250000000000",          // $12,500
  royaltyTier: "2",                              // Royalty level 2
  uplineSponsor: "0x1234...",                   // Sponsor address
  slabCanClaim: true,                            // Can claim slab income
  royaltyPaused: false                           // Royalty not paused
}
```

### PortfolioSummary
```javascript
{
  pid: "0",                                      // Portfolio ID
  principalRama: "500000000000000000000",       // 500 RAMA principal
  principalUSD: "500000000000",                 // $5,000 USD value
  creditedRama: "625000000000000000000",        // 625 RAMA credited
  capRama: "1250000000000000000000",            // 1,250 RAMA cap
  capPct: "200",                                 // 200% or 250%
  booster: false,                                // Not booster
  active: true,                                  // Active portfolio
  frozenUntil: "0",                              // Not frozen
  dailyRateWad: "3300000000000000",             // 0.33% daily
  createdAt: "1697000000",                       // Unix timestamp
  tier: "1"                                      // Portfolio tier
}
```

## 🎨 UI Pattern Example

```jsx
export default function ExamplePage() {
  const { address, isConnected } = useAccount();
  const { data, loading, error, refetch } = useUserOverview();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cyan-300">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect to view data</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-cyan-500/20 rounded w-1/4"></div>
        <div className="h-32 bg-cyan-500/10 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-glass rounded-xl p-6 border border-red-500/30">
        <h3 className="text-red-400 font-bold mb-2">Error Loading Data</h3>
        <p className="text-cyan-300/70 text-sm mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const staked = oceanContractService.formatUSD(data.totalStakedUSD);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cyan-400">Your Data</h1>
      <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
        <p className="text-sm text-cyan-400 mb-2">Total Staked</p>
        <p className="text-3xl font-bold text-cyan-300">{staked}</p>
      </div>
    </div>
  );
}
```

## 🔥 Quick Copy-Paste Template

```javascript
import { useAccount } from 'wagmi';
import { useUserOverview } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';

export default function PageName() {
  const { address, isConnected } = useAccount();
  const { data, loading, error, refetch } = useUserOverview();

  if (!isConnected) return <ConnectWalletPrompt />;
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} retry={refetch} />;

  // Your page logic here
  const formattedValue = oceanContractService.formatUSD(data.totalStakedUSD);

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

## 📖 Where to Look

| Need | File |
|------|------|
| See working example | `src/pages/DashboardIntegrated.jsx` |
| Detailed guide | `CONTRACT_INTEGRATION_GUIDE.md` |
| Available functions | `src/services/oceanContractService.js` |
| Available hooks | `src/hooks/useOceanData.js` |
| Contract addresses | `src/config/contracts.js` |

## ⚠️ Important Notes

1. **Precision**: USD has 8 decimals (100000000), RAMA has 18 decimals
2. **BigInt**: Use BigInt for arithmetic with large blockchain values
3. **Formatting**: Always use service formatters for display
4. **Wallet Check**: Always check `isConnected` before rendering data
5. **Loading States**: Always show loading indicators
6. **Error Handling**: Always handle and display errors gracefully

## 🎯 Next Steps

1. Choose a page to integrate (start with Priority 1 pages)
2. Copy the template above
3. Import the hooks you need
4. Replace mock data with hook data
5. Format values using the service
6. Test with a connected wallet
7. Move to the next page

## 💪 You're Ready!

Everything you need is implemented and documented. Just follow the pattern demonstrated in `DashboardIntegrated.jsx` for each page.

**Pro Tip**: Start with simple pages (like SafeWallet) before tackling complex ones (like StakeInvest with transactions).
