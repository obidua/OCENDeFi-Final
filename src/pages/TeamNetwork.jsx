import { Users, TrendingUp, Copy, CheckCircle, Eye, Search, Filter, LayoutGrid, Table, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useUserOverview, useTeamNetwork } from '../hooks/useOceanData';
import oceanContractService from '../services/oceanContractService';
import NumberPopup from '../components/NumberPopup';

export default function TeamNetwork() {
  const { address, isConnected } = useAccount();
  const { data: overview, loading: overviewLoading } = useUserOverview();
  const { data: teamNetwork, loading: teamLoading } = useTeamNetwork();

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('overview');
  const [activeLevel, setActiveLevel] = useState('L1');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Connect Your Wallet</h2>
          <p className="text-cyan-300/70">Please connect your wallet to view your team network</p>
        </div>
      </div>
    );
  }

  if (overviewLoading || teamLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-cyan-500/20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-cyan-500/10 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="cyber-glass rounded-xl p-4 border border-cyan-500/30 animate-pulse">
              <div className="h-4 bg-cyan-500/20 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-cyan-500/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const directCount = overview?.directCount || 0;
  const teamCount = overview?.teamCount || 0;
  const totalStakedUSD = overview?.totalStakedUSD || '0';
  const qualifiedVolumeUSD = overview?.qualifiedVolumeUSD || '0';

  const directMembers = teamNetwork?.directs || [];
  const referralLink = `https://oceandefi.io/ref/${address}`;

  const levels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];

  const currentLevelData = directMembers;

  const filteredData = currentLevelData.filter((member) => {
    const matchesSearch = member.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-neon-green relative inline-block">
            Team Network
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-neon-green/20 blur-xl -z-10" />
          </h1>
          <p className="text-cyan-300/90 mt-1">Manage your referral network and team structure</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'overview'
                ? 'bg-gradient-to-r from-cyan-500 to-neon-green text-dark-950'
                : 'cyber-glass text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="hidden sm:inline">Overview</span>
          </button>
          <button
            onClick={() => setViewMode('levels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'levels'
                ? 'bg-gradient-to-r from-cyan-500 to-neon-green text-dark-950'
                : 'cyber-glass text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50'
            }`}
          >
            <Table size={18} />
            <span className="hidden sm:inline">Level View</span>
          </button>
        </div>
      </div>

      <div className="cyber-glass border border-neon-green/50 rounded-2xl p-6 text-white relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-cyan-500/10 opacity-50 group-hover:opacity-70 transition-opacity" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-green/70 to-transparent" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="p-2 bg-neon-green/20 rounded-lg backdrop-blur-sm border border-neon-green/30">
            <Users size={24} className="text-neon-green" />
          </div>
          <div>
            <p className="text-sm text-neon-green font-medium uppercase tracking-wide">Your Referral Link</p>
            <p className="text-xs text-cyan-300/90">Share to grow your team</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 cyber-glass border border-neon-green/30 rounded-lg overflow-hidden relative z-10">
          <code className="flex-1 text-sm font-mono truncate text-cyan-300">{referralLink}</code>
          <button
            onClick={handleCopy}
            className="p-2 bg-neon-green/20 hover:bg-neon-green/30 rounded-lg transition-colors flex-shrink-0 border border-neon-green/30"
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? <CheckCircle size={20} className="text-neon-green" /> : <Copy size={20} className="text-neon-green" />}
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="cyber-glass rounded-xl p-4 border border-cyan-500/30">
              <p className="text-xs text-cyan-300/90 mb-1 truncate">Direct Members</p>
              <p className="text-2xl md:text-3xl font-bold text-cyan-300">{directCount.toString()}</p>
            </div>
            <div className="cyber-glass rounded-xl p-4 border border-cyan-500/30">
              <p className="text-xs text-cyan-300/90 mb-1 truncate">Total Team</p>
              <p className="text-2xl md:text-3xl font-bold text-neon-green">{teamCount.toString()}</p>
            </div>
            <div className="cyber-glass rounded-xl p-4 border border-cyan-500/30">
              <p className="text-xs text-cyan-300/90 mb-1 truncate">Team Volume</p>
              <NumberPopup
                value={totalStakedUSD}
                label="Team Volume"
                className="text-lg md:text-xl font-bold text-neon-green"
              />
            </div>
            <div className="cyber-glass rounded-xl p-4 border border-cyan-500/30">
              <p className="text-xs text-cyan-300/90 mb-1 truncate">Qualified Volume</p>
              <NumberPopup
                value={qualifiedVolumeUSD}
                label="Qualified Volume"
                className="text-lg md:text-xl font-bold text-neon-orange"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-cyan-300">Direct Referrals</h2>
                  <span className="text-sm text-cyan-300/90">{directMembers.length} members</span>
                </div>

                {directMembers.length > 0 ? (
                  <div className="overflow-x-auto -mx-6 px-6">
                    <div className="min-w-full space-y-3">
                      {directMembers.map((member, idx) => (
                        <div key={idx} className="p-4 cyber-glass border border-cyan-500/20 rounded-lg hover:border-cyan-500/40 transition-colors min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <code className="text-sm font-mono text-cyan-300 truncate">
                              {member.slice(0, 6)}...{member.slice(-4)}
                            </code>
                            <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded-full">
                              Active
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-cyan-300/90 mb-1">Member #{idx + 1}</p>
                              <p className="text-sm font-semibold text-cyan-400">Direct</p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-cyan-300/90 mb-1">Level</p>
                              <p className="text-sm font-semibold text-neon-green">L1</p>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(`https://ramascan.com/address/${member}`, '_blank')}
                            className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            <Eye size={14} />
                            View on Explorer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-cyan-400/30 mb-3" size={48} />
                    <p className="text-cyan-300/90 font-medium">No direct referrals yet</p>
                    <p className="text-sm text-cyan-300/70 mt-1">Share your referral link to start building your team</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
                <h3 className="font-semibold text-cyan-300 mb-4">Volume Calculation</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-cyan-400 mb-2">40:30:30 Rule</p>
                    <p className="text-xs text-cyan-300/90 mb-3">
                      For 3 legs, volume is calculated with caps
                    </p>
                    <div className="space-y-2">
                      <div className="p-2.5 cyber-glass border border-cyan-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-cyan-300">Leg 1</span>
                          <span className="text-xs font-bold text-cyan-300">40% Cap</span>
                        </div>
                      </div>
                      <div className="p-2.5 cyber-glass border border-neon-green/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neon-green">Leg 2</span>
                          <span className="text-xs font-bold text-neon-green">30% Cap</span>
                        </div>
                      </div>
                      <div className="p-2.5 cyber-glass border border-neon-orange/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neon-orange">Leg 3</span>
                          <span className="text-xs font-bold text-neon-orange">30% Cap</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-cyan-500/30">
                    <div className="p-3 cyber-glass border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-neon-green/5 rounded-lg">
                      <p className="text-xs font-medium text-cyan-300 mb-1">4+ Legs Bonus</p>
                      <p className="text-xs text-cyan-300/90">
                        100% of total volume qualifies (no caps)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
                <h3 className="font-semibold text-cyan-300 mb-4">Income Summary</h3>
                <div className="space-y-3">
                  <div className="p-3 cyber-glass border border-cyan-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-cyan-300">Spot Income</span>
                      <span className="text-xs font-bold text-cyan-300">10%</span>
                    </div>
                    <p className="text-xs text-cyan-300/90">Direct referral bonus</p>
                  </div>

                  <div className="p-3 cyber-glass border border-neon-green/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neon-green">Slab Income</span>
                      <span className="text-xs font-bold text-neon-green">Up to 60%</span>
                    </div>
                    <p className="text-xs text-neon-green/90">Team difference income</p>
                  </div>

                  <div className="p-3 cyber-glass border border-neon-orange/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neon-orange">Override Bonus</span>
                      <span className="text-xs font-bold text-neon-orange">10%/5%/5%</span>
                    </div>
                    <p className="text-xs text-neon-orange/90">Same-slab uplines</p>
                  </div>
                </div>
              </div>

              <div className="cyber-glass border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-medium text-cyan-300 mb-1">Build Smart</p>
                    <p className="text-xs text-cyan-300/90">
                      Focus on building multiple strong legs to maximize your qualified volume and unlock higher slab levels
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="cyber-glass rounded-xl p-4 border border-cyan-500/30">
              <p className="text-xs text-cyan-300/90 mb-1 truncate">Total Members</p>
              <p className="text-2xl md:text-3xl font-bold text-cyan-300">{teamCount.toString()}</p>
            </div>
            <div className="cyber-glass rounded-xl p-4 border border-cyan-500/30">
              <p className="text-xs text-cyan-300/90 mb-1 truncate">Direct Members</p>
              <p className="text-2xl md:text-3xl font-bold text-neon-green">{directCount.toString()}</p>
            </div>
            <div className="cyber-glass rounded-xl p-4 border border-cyan-500/30">
              <p className="text-xs text-cyan-300/90 mb-1 truncate">Team Volume</p>
              <NumberPopup
                value={totalStakedUSD}
                label="Team Volume"
                className="text-lg md:text-xl font-bold text-neon-orange"
              />
            </div>
            <div className="cyber-glass rounded-xl p-4 border border-cyan-500/30">
              <p className="text-xs text-cyan-300/90 mb-1 truncate">Qualified Volume</p>
              <NumberPopup
                value={qualifiedVolumeUSD}
                label="Qualified Volume"
                className="text-lg md:text-xl font-bold text-cyan-400"
              />
            </div>
          </div>

          <div className="cyber-glass rounded-2xl border border-cyan-500/30 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-cyan-500/30">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Team Level Structure</h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeLevel === level
                        ? 'bg-gradient-to-r from-cyan-500 to-neon-green text-white'
                        : 'cyber-glass border border-cyan-500/20 text-cyan-400 hover:border-cyan-500/30'
                    }`}
                  >
                    {level}
                    <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                      {level === 'L1' ? directMembers.length : 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/80" size={18} />
                  <input
                    type="text"
                    placeholder="Search by Address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 cyber-glass border border-cyan-500/20 rounded-lg text-sm text-cyan-300 placeholder-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {activeLevel === 'L1' ? (
                filteredData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-cyan-400/50 mb-3" size={48} />
                    <p className="text-cyan-300/90 font-medium">
                      {searchTerm ? 'No members found matching your search' : 'No team members at L1'}
                    </p>
                    <p className="text-sm text-cyan-300/70 mt-1">
                      {searchTerm ? 'Try adjusting your search' : 'Share your referral link to grow your team'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:-mx-6">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-cyan-500/20">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                              Address
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                              Level
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-500/10">
                          {filteredData.map((member, idx) => (
                            <tr key={idx} className="hover:bg-cyan-500/5 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-cyan-300">{idx + 1}</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <code className="text-xs font-mono text-cyan-300">
                                  {member.slice(0, 6)}...{member.slice(-4)}
                                </code>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm text-cyan-300">L1</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neon-green/20 text-neon-green border border-neon-green/30">
                                  Active
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => window.open(`https://ramascan.com/address/${member}`, '_blank')}
                                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto text-cyan-400/50 mb-3" size={48} />
                  <p className="text-cyan-300/90 font-medium">No team members at {activeLevel}</p>
                  <p className="text-sm text-cyan-300/70 mt-1">
                    Only direct referrals (L1) data is currently available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
              <h3 className="font-semibold text-cyan-300 mb-4">Volume Calculation</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-cyan-400 mb-2">40:30:30 Rule</p>
                  <p className="text-xs text-cyan-300/90 mb-3">
                    For 3 legs, volume is calculated with caps
                  </p>
                  <div className="space-y-2">
                    <div className="p-2.5 cyber-glass border border-cyan-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-cyan-300">Leg 1</span>
                        <span className="text-xs font-bold text-cyan-300">40% Cap</span>
                      </div>
                    </div>
                    <div className="p-2.5 cyber-glass border border-neon-green/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neon-green">Leg 2</span>
                        <span className="text-xs font-bold text-neon-green">30% Cap</span>
                      </div>
                    </div>
                    <div className="p-2.5 cyber-glass border border-neon-orange/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neon-orange">Leg 3</span>
                        <span className="text-xs font-bold text-neon-orange">30% Cap</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-cyan-500/30">
                  <div className="p-3 cyber-glass border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-neon-green/5 rounded-lg">
                    <p className="text-xs font-medium text-cyan-300 mb-1">4+ Legs Bonus</p>
                    <p className="text-xs text-cyan-300/90">
                      100% of total volume qualifies (no caps)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/30">
              <h3 className="font-semibold text-cyan-300 mb-4">Income Summary</h3>
              <div className="space-y-3">
                <div className="p-3 cyber-glass border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-cyan-300">Spot Income</span>
                    <span className="text-xs font-bold text-cyan-300">10%</span>
                  </div>
                  <p className="text-xs text-cyan-300/90">Direct referral bonus</p>
                </div>

                <div className="p-3 cyber-glass border border-neon-green/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neon-green">Slab Income</span>
                    <span className="text-xs font-bold text-neon-green">Up to 60%</span>
                  </div>
                  <p className="text-xs text-neon-green/90">Team difference income</p>
                </div>

                <div className="p-3 cyber-glass border border-neon-orange/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neon-orange">Override Bonus</span>
                    <span className="text-xs font-bold text-neon-orange">10%/5%/5%</span>
                  </div>
                  <p className="text-xs text-neon-orange/90">Same-slab uplines</p>
                </div>
              </div>

              <div className="mt-4 cyber-glass border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-medium text-cyan-300 mb-1">Build Smart</p>
                    <p className="text-xs text-cyan-300/90">
                      Focus on building multiple strong legs to maximize your qualified volume and unlock higher slab levels
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
