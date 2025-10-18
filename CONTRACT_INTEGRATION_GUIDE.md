# Ocean DeFi Smart Contract Integration Guide

This guide provides complete instructions for integrating smart contracts across all UI pages.

## Core Infrastructure (COMPLETED ✅)

### 1. Contract Addresses Configuration
**File**: `src/config/contracts.js`
- All contract addresses from useUserInfoStore.js have been configured
- Precision constants defined for USD and RAMA conversions

### 2. Contract Hooks
**File**: `src/hooks/useContract.js`
- Web3 initialization hook
- Individual contract hooks for all major contracts
- Reusable across all pages

### 3. Ocean Contract Service
**File**: `src/services/oceanContractService.js`
- Centralized service for all OceanView contract calls
- Utility functions for formatting and calculations
- Error handling built-in

### 4. React Hooks for Data Fetching
**File**: `src/hooks/useOceanData.js`
- `useUserOverview()` - Complete user overview
- `usePortfolioSummaries()` - All portfolios
- `usePortfolioTotals()` - Aggregated totals
- `useSlabPanel()` - Slab income data
- `useRoyaltyPanel()` - Royalty program data
- `useWalletPanel()` - Safe wallet balance
- `useTeamNetwork()` - Team structure
- `useLastTransactions()` - Transaction history

All hooks include:
- Automatic wallet address detection via wagmi
- Loading states
- Error handling
- Refetch capabilities

## Page Integration Patterns

### Dashboard Page (EXAMPLE COMPLETED ✅)
**File**: `src/pages/DashboardIntegrated.jsx`

**Pattern**:
```javascript
import { useUserOverview, usePortfolioSummaries, useWalletPanel } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: overview, loading, error } = useUserOverview();
  const { data: portfolios } = usePortfolioSummaries();

  // Handle not connected
  if (!isConnected) return <ConnectWalletPrompt />;

  // Handle loading
  if (loading) return <LoadingSkeleton />;

  // Extract data
  const totalStaked = overview?.totalStakedUSD || '0';
  const directCount = overview?.directCount || '0';

  // Format for display
  const formattedStaked = oceanContractService.formatUSD(totalStaked);

  return (
    // UI with real data
  );
}
```

### Remaining Pages Integration

## 1. StakeInvest Page
**File**: `src/pages/StakeInvest.jsx`

**Required Integrations**:
- Get user's existing portfolios
- Validate staking amounts against minimum stake requirement
- Check Safe Wallet balance for staking option
- Build and submit staking transaction

**Key Contract Calls**:
```javascript
// Check if user can stake
const canStake = await portfolioManager.methods.canCreatePortfolio(userAddress).call();

// Get minimum stake from CoreConfig
const minStake = await coreConfig.methods.minStakeUSD().call();

// Create portfolio transaction
const tx = await portfolioManager.methods.createPortfolio(
  principalUSD,
  isBooster,
  stakingSource // MAIN_WALLET or SAFE_WALLET
).encodeABI();
```

## 2. Portfolio Overview Page
**File**: `src/pages/PortfolioOverview.jsx`

**Required Integrations**:
- Replace `getMockPortfolioDetails()` with `usePortfolioSummaries()`
- Replace `getMockUserStatus()` with `useUserOverview()`
- Calculate progress bars from real data
- Show freeze status from `frozenUntil` field

**Data Mapping**:
```javascript
const portfolio = portfolios[0]; // Active portfolio
const stakedUSD = portfolio.principalUSD;
const totalEarned = portfolio.creditedRama;
const maxCap = oceanContractService.calculateMaxCap(portfolio.principalUSD, portfolio.booster);
const progress = (earned / maxCap) * 100;
const status = oceanContractService.getPortfolioStatus(portfolio.active, portfolio.frozenUntil);
```

## 3. TeamNetwork Page
**File**: `src/pages/TeamNetwork.jsx`

**Required Integrations**:
- Use `useTeamNetwork()` hook
- Display direct referrals from `directs` array
- Show team count from `teamCount`
- Map team member details

**Key Data**:
```javascript
const { data: network } = useTeamNetwork(20); // maxDepth = 20
const directMembers = network?.directs || [];
const directCount = network?.directCount || 0;
const totalTeamSize = network?.teamCount || 0;
```

## 4. ClaimEarnings Page
**File**: `src/pages/ClaimEarnings.jsx`

**Required Integrations**:
- Calculate claimable amounts from portfolios
- Show claim options (Main Wallet 5% fee vs Safe Wallet 0% fee)
- Build claim transaction

**Claim Calculation**:
```javascript
const accruedGrowth = portfolio.creditedRama - portfolio.principalRama;
const claimableRAMA = accruedGrowth;

// For Main Wallet (5% fee)
const netAmount = claimableRAMA * 0.95;
const fee = claimableRAMA * 0.05;

// For Safe Wallet (0% fee)
const netAmount = claimableRAMA;
```

## 5. SlabIncome Page
**File**: `src/pages/SlabIncome.jsx`

**Required Integrations**:
- Use `useSlabPanel()` hook
- Display current slab level from `slabIndex`
- Show qualified volume from `qualifiedVolumeUSD`
- Show direct members count from `directMembers`
- Display slab claim eligibility from `canClaim`

**Data Structure**:
```javascript
const { data: slabPanel } = useSlabPanel();
const currentLevel = slabPanel?.slabIndex || 0;
const volume = slabPanel?.qualifiedVolumeUSD || '0';
const directs = slabPanel?.directMembers || 0;
const canClaim = slabPanel?.canClaim || false;
```

## 6. RoyaltyProgram Page
**File**: `src/pages/RoyaltyProgram.jsx`

**Required Integrations**:
- Use `useRoyaltyPanel()` hook
- Show current royalty level from `currentLevel`
- Display last payout date from `lastPaidMonthEpoch`
- Check if paused from `paused` field
- Calculate next claim date

**Data Structure**:
```javascript
const { data: royaltyPanel } = useRoyaltyPanel();
const currentLevel = royaltyPanel?.currentLevel || 0;
const lastPaid = royaltyPanel?.lastPaidMonthEpoch || 0;
const isPaused = royaltyPanel?.paused || false;

const canClaim = oceanContractService.canClaimRoyalty(lastPaid);
const nextClaimDate = oceanContractService.calculateNextRoyaltyDate(lastPaid);
```

## 7. OneTimeRewards Page
**File**: `src/pages/OneTimeRewards.jsx`

**Required Integrations**:
- Get qualified volume from `useUserOverview()`
- Map rewards against volume milestones
- Determine which rewards are claimable
- Build reward claim transaction

**Logic**:
```javascript
const { data: overview } = useUserOverview();
const qualifiedVolume = oceanContractService.toUSD(overview?.qualifiedVolumeUSD || '0');

// Check each reward milestone
ONE_TIME_REWARDS.forEach((reward, idx) => {
  const required = oceanContractService.toUSD(reward.requiredVolumeUSD);
  const isUnlocked = qualifiedVolume >= required;
  // Display reward with locked/unlocked state
});
```

## 8. SafeWallet Page
**File**: `src/pages/SafeWallet.jsx`

**Required Integrations**:
- Use `useWalletPanel()` hook
- Display Safe Wallet balance from `safeRama`
- Show lifetime ROI from `lifetimeRoiUsd`
- Implement portfolio viewer with address lookup
- Build staking transaction from Safe Wallet

**Data Structure**:
```javascript
const { data: walletPanel } = useWalletPanel();
const safeBalance = walletPanel?.safeRama || '0';
const lifetimeROI = walletPanel?.lifetimeRoiUsd || '0';

const formattedBalance = oceanContractService.formatRAMA(safeBalance);
const formattedROI = oceanContractService.formatUSD(lifetimeROI);
```

## Transaction Building Patterns

### Reading Data (View Functions)
```javascript
// Already implemented in oceanContractService.js
const data = await oceanViewContract.methods.getUserOverview(address, 20).call();
```

### Writing Data (Transactions)
```javascript
import { useAccount, useSendTransaction } from 'wagmi';
import Web3 from 'web3';

function Component() {
  const { address } = useAccount();
  const { sendTransaction } = useSendTransaction();

  const handleStake = async (amount, isBooster) => {
    const web3 = new Web3('https://blockchain.ramestta.com');
    const contract = new web3.eth.Contract(PortfolioManagerABI, CONTRACT_ADDRESSES.PORTFOLIO_MANAGER);

    // Encode transaction
    const data = contract.methods.createPortfolio(
      web3.utils.toWei(amount, 'ether'),
      isBooster,
      0 // MAIN_WALLET
    ).encodeABI();

    // Estimate gas
    const gasLimit = await web3.eth.estimateGas({
      from: address,
      to: CONTRACT_ADDRESSES.PORTFOLIO_MANAGER,
      data,
    });

    // Send transaction
    await sendTransaction({
      to: CONTRACT_ADDRESSES.PORTFOLIO_MANAGER,
      data,
      gas: gasLimit,
    });
  };

  return <button onClick={() => handleStake('100', false)}>Stake</button>;
}
```

## Utility Functions Reference

### Formatting Functions
```javascript
// USD formatting (8 decimal precision)
oceanContractService.formatUSD(value) // Returns "$1,234.56"

// RAMA formatting (18 decimal precision)
oceanContractService.formatRAMA(value) // Returns "1,234.56"

// Percentage formatting (from basis points)
oceanContractService.formatPercentage(bps) // Returns "15%"

// Convert to numeric
oceanContractService.toUSD(value) // Returns number
oceanContractService.toRAMA(value) // Returns number
```

### Calculation Functions
```javascript
// Daily growth rate based on stake amount and booster status
oceanContractService.calculateDailyGrowthRate(stakedUSD, isBooster)

// Maximum cap (2x for regular, 2.5x for booster)
oceanContractService.calculateMaxCap(principalUSD, isBooster)

// Lifetime 4x cap
oceanContractService.calculateLifetimeCap(totalLifetimeStakedUSD)

// Progress percentage
oceanContractService.calculateProgressPercentage(current, max)

// Portfolio status (ACTIVE, FROZEN, INACTIVE)
oceanContractService.getPortfolioStatus(active, frozenUntil)

// Royalty claim eligibility
oceanContractService.canClaimRoyalty(lastPaidMonthEpoch)

// Next royalty claim date
oceanContractService.calculateNextRoyaltyDate(lastPaidMonthEpoch)
```

## Error Handling Pattern

```javascript
function Component() {
  const { data, loading, error, refetch } = useUserOverview();

  if (error) {
    return (
      <div className="error-message">
        <p>Error loading data: {error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  return <DataDisplay data={data} />;
}
```

## Loading States Pattern

```javascript
if (loading) {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-cyan-500/20 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-cyan-500/10 rounded w-1/3"></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="cyber-glass rounded-xl p-5 border border-cyan-500/30 animate-pulse">
            <div className="h-4 bg-cyan-500/20 rounded w-2/3 mb-3"></div>
            <div className="h-8 bg-cyan-500/30 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing Checklist

### For Each Integrated Page:
- [ ] Wallet connection check works
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Data fetches from correct contract
- [ ] Numbers format correctly (USD/RAMA)
- [ ] Percentages calculate accurately
- [ ] Links and navigation work
- [ ] Responsive design maintained
- [ ] No console errors
- [ ] Transactions build correctly (if applicable)

## Migration Steps

1. **Keep Old Files**: Don't delete original pages immediately
2. **Create Integrated Versions**: Build new integrated pages alongside existing
3. **Test Thoroughly**: Test each page with real wallet connection
4. **Update Routes**: Switch routes to use integrated versions
5. **Remove Old Files**: Clean up after confirming everything works

## Important Notes

- **Precision**: USD uses 8 decimals, RAMA uses 18 decimals
- **BigInt**: Use BigInt for large number operations to avoid overflow
- **Gas Estimation**: Always estimate gas before submitting transactions
- **Error Messages**: Provide user-friendly error messages
- **Loading UX**: Always show loading indicators during data fetch
- **Refresh**: Implement refresh functionality on key pages
- **Wallet Status**: Check wallet connection before rendering
- **Network**: Verify user is on Ramestta network (chain ID 1370)

## Next Steps

1. Apply the Dashboard integration pattern to remaining pages
2. Test each page with real wallet connection
3. Verify all data displays correctly
4. Test transaction building and submission
5. Run full application build test
6. Deploy and monitor for errors

---

**Status**: Core infrastructure complete, Dashboard integrated as reference example. Remaining pages follow the same pattern demonstrated in DashboardIntegrated.jsx.
