import { AlertCircle, Eye } from 'lucide-react';
import { useViewMode } from '../contexts/ViewModeContext';

export default function ViewModeBanner() {
  const { viewMode, viewUserId, viewAddress } = useViewMode();

  if (!viewMode) return null;

  return (
    <div className="cyber-glass border-2 border-neon-orange rounded-xl p-4 mb-6 bg-neon-orange/5">
      <div className="flex items-start gap-3">
        <Eye className="text-neon-orange flex-shrink-0 mt-0.5" size={24} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="text-neon-orange" size={18} />
            <p className="text-lg font-bold text-neon-orange">VIEW MODE ACTIVE</p>
          </div>
          <p className="text-sm text-cyan-300 mb-2">
            You are viewing data for User ID: <span className="font-mono font-bold">{viewUserId}</span>
          </p>
          <p className="text-xs text-cyan-300/90 font-mono">
            Address: {viewAddress}
          </p>
          <p className="text-xs text-neon-orange/90 mt-2">
            All transaction buttons (Stake, Claim, Invest) are disabled in view mode
          </p>
        </div>
      </div>
    </div>
  );
}
