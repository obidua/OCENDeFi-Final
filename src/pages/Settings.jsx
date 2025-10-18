import { useState } from 'react';
import { Settings as SettingsIcon, AlertCircle, Clock, Lock, Copy, ExternalLink, CheckCircle, Info, Wallet, Shield, Link as LinkIcon } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useUserOverview } from '../hooks/useOceanData';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import CopyButton from '../components/CopyButton';
import ViewModeBanner from '../components/ViewModeBanner';
import { useViewMode } from '../contexts/ViewModeContext';
import Swal from 'sweetalert2';

export default function Settings() {
  const { address, isConnected } = useAccount();
  const { viewMode } = useViewMode();
  const { data: overview, loading } = useUserOverview();
  const [showAllRules, setShowAllRules] = useState(false);

  const referralLink = address ? `https://oceandefi.com/signup?ref=${address}` : '';

  const handlePrincipalWithdrawal = () => {
    if (viewMode) {
      Swal.fire({
        icon: 'warning',
        title: 'View Mode Active',
        text: 'You cannot request withdrawal while in view mode.',
        confirmButtonColor: '#06b6d4',
        background: '#0a1929',
        color: '#67e8f9',
      });
      return;
    }

    Swal.fire({
      title: 'Request Principal Withdrawal',
      html: `
        <div class="text-left space-y-3">
          <p class="text-cyan-300">This will initiate a 72-hour freeze period:</p>
          <ul class="text-sm text-cyan-300/80 space-y-2 list-disc pl-5">
            <li>No income earned during freeze</li>
            <li>Cancel within 72 hours to resume earning</li>
            <li>After 72 hours: 80% refund (20% exit fee)</li>
            <li>Portfolio closes and removes business from uplines</li>
          </ul>
          <p class="text-orange-400 text-sm mt-4">⚠️ This action cannot be undone after 72 hours</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Initiate Withdrawal',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#06b6d4',
      background: '#0a1929',
      color: '#67e8f9',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'info',
          title: 'Feature Coming Soon',
          text: 'Principal withdrawal functionality will be available in the next update.',
          confirmButtonColor: '#06b6d4',
          background: '#0a1929',
          color: '#67e8f9',
        });
      }
    });
  };

  const contractRules = [
    {
      id: 1,
      title: 'Minimum Stake',
      description: '$50 minimum for ID activation',
      icon: DollarSign,
    },
    {
      id: 2,
      title: 'Slab Claim Requirement',
      description: 'Must have 40:30:30 volume distribution',
      icon: Shield,
    },
    {
      id: 3,
      title: 'ROI Distribution',
      description: '0.33% daily for Tier 1, 0.40% for Tier 2',
      icon: TrendingUp,
    },
    {
      id: 4,
      title: 'Direct Income',
      description: '5% commission on portfolio creation & topups',
      icon: Users,
    },
    {
      id: 5,
      title: 'Slab Income',
      description: 'Difference income based on slab levels (10%-60%)',
      icon: Layers,
    },
    {
      id: 6,
      title: 'Royalty Program',
      description: 'Monthly rewards from 0.5% to 4% of global pool',
      icon: Trophy,
    },
    {
      id: 7,
      title: 'Withdrawal Freeze',
      description: '72-hour freeze period for principal withdrawal',
      icon: Clock,
    },
    {
      id: 8,
      title: 'Exit Fee',
      description: '20% fee on principal withdrawal after freeze',
      icon: AlertCircle,
    },
  ];

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewModeBanner />

      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
          Settings & Information
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
        </h1>
        <p className="text-cyan-300/90 mt-1">Platform rules and withdrawal management</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Principal Withdrawal Section */}
          <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <h2 className="text-lg font-semibold text-cyan-300 mb-4 uppercase tracking-wide">Principal Withdrawal</h2>

            <div className="cyber-glass border border-cyan-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-cyan-300 mb-2 uppercase tracking-wide">0% Trust Policy - Withdrawal Anytime</p>
                  <ul className="text-xs text-cyan-400/80 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-neon-green flex-shrink-0 mt-0.5" />
                      <span>Request withdrawal anytime (complete freedom)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock size={14} className="text-neon-orange flex-shrink-0 mt-0.5" />
                      <span>72-hour freeze period (no income during freeze)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-neon-green flex-shrink-0 mt-0.5" />
                      <span>Cancel within 72 hours to resume earning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Only lose income during freeze period if cancelled</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info size={14} className="text-neon-orange flex-shrink-0 mt-0.5" />
                      <span>After 72 hours: 80% refund (20% exit fee)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Closed portfolio removes business from uplines</span>
                    </li>
                  </ul>
                  <p className="text-xs text-neon-green italic mt-3">
                    "Withdraw anytime with 20% fee after 72h freeze — or cancel to keep earning."
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePrincipalWithdrawal}
              disabled={viewMode}
              className={`w-full py-4 rounded-lg font-bold uppercase tracking-wide transition-all ${
                viewMode
                  ? 'bg-dark-700/50 text-cyan-400/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              Request Principal Withdrawal
            </button>
          </div>

          {/* Contract Rules Reference */}
          <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
            <h2 className="text-lg font-semibold text-cyan-300 mb-4 uppercase tracking-wide">Contract Rules Reference</h2>

            <div className="grid md:grid-cols-2 gap-3">
              {contractRules.slice(0, showAllRules ? contractRules.length : 4).map((rule) => (
                <div
                  key={rule.id}
                  className="cyber-glass border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-cyan-400">{rule.id}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cyan-300 mb-1">{rule.title}</p>
                      <p className="text-xs text-cyan-300/70">{rule.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {contractRules.length > 4 && (
              <button
                onClick={() => setShowAllRules(!showAllRules)}
                className="w-full mt-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showAllRules ? 'Show Less' : `Show All ${contractRules.length} Rules`}
              </button>
            )}
          </div>
        </div>

        {/* Platform Info Sidebar */}
        <div className="space-y-6">
          <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-4">
              <SettingsIcon className="text-cyan-400" size={20} />
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Platform Info</h3>
            </div>

            <div className="space-y-4">
              {/* Ocean Smart Contract */}
              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">Ocean Smart Contract</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-cyan-300 bg-dark-950/50 px-2 py-1 rounded flex-1 truncate">
                    {CONTRACT_ADDRESSES.OCEAN_VIEW.slice(0, 10)}...{CONTRACT_ADDRESSES.OCEAN_VIEW.slice(-8)}
                  </code>
                  <CopyButton text={CONTRACT_ADDRESSES.OCEAN_VIEW} />
                  <a
                    href={`https://ramascan.com/address/${CONTRACT_ADDRESSES.OCEAN_VIEW}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              {/* Sponsor Address */}
              {overview && (
                <div>
                  <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">Sponsor Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-cyan-300 bg-dark-950/50 px-2 py-1 rounded flex-1 truncate">
                      {address.slice(0, 10)}...{address.slice(-8)}
                    </code>
                    <CopyButton text={address} />
                  </div>
                </div>
              )}

              {/* Referral Link */}
              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">Your Referral Link</p>
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-xs font-mono text-cyan-300 bg-dark-950/50 px-2 py-1 rounded flex-1 truncate">
                    {referralLink.slice(0, 30)}...
                  </code>
                  <CopyButton text={referralLink} />
                </div>
              </div>

              {/* Chain ID */}
              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">Chain ID</p>
                <p className="text-sm font-medium text-cyan-300">1370</p>
              </div>

              {/* Blockchain Name */}
              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">Blockchain Name</p>
                <p className="text-sm font-medium text-cyan-300">Ramestta Mainnet</p>
              </div>

              {/* Currency Symbol */}
              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">Currency Symbol</p>
                <p className="text-sm font-medium text-cyan-300">RAMA</p>
              </div>

              {/* RPC Endpoints */}
              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">RPC Endpoint 1</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-cyan-300 bg-dark-950/50 px-2 py-1 rounded flex-1 truncate">
                    blockchain.ramestta.com
                  </code>
                  <CopyButton text="https://blockchain.ramestta.com" />
                </div>
              </div>

              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">RPC Endpoint 2</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-cyan-300 bg-dark-950/50 px-2 py-1 rounded flex-1 truncate">
                    blockchain2.ramestta.com
                  </code>
                  <CopyButton text="https://blockchain2.ramestta.com" />
                </div>
              </div>

              {/* Block Explorer */}
              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">Block Explorer</p>
                <a
                  href="https://ramascan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  https://ramascan.com
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Bridge */}
              <div>
                <p className="text-xs text-cyan-300/70 mb-1 uppercase tracking-wide">Bridge</p>
                <a
                  href="https://ramesttabridge.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  ramesttabridge.com
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="cyber-glass rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="/dashboard/about"
                className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-400 transition-colors p-2 rounded hover:bg-cyan-500/10"
              >
                <Info size={16} />
                <span>About Ocean DeFi</span>
              </a>
              <a
                href="/dashboard/ocean-defi-guide"
                className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-400 transition-colors p-2 rounded hover:bg-cyan-500/10"
              >
                <Shield size={16} />
                <span>DeFi Guide</span>
              </a>
              <a
                href="https://ramascan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-400 transition-colors p-2 rounded hover:bg-cyan-500/10"
              >
                <ExternalLink size={16} />
                <span>Block Explorer</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Notice */}
      <div className="cyber-glass border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-cyan-300 mb-1">Blockchain Security</p>
            <p className="text-xs text-cyan-300/90">
              All contracts are deployed on Ramestta Mainnet and verified on the block explorer. Your funds are secured by smart contracts with no central authority. Always verify contract addresses before interacting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import missing icons
import { DollarSign, TrendingUp, Users, Layers, Trophy } from 'lucide-react';
