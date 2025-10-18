import { useAccount } from 'wagmi';
import { useViewMode } from '../contexts/ViewModeContext';

export function useActiveAddress() {
  const { address: connectedAddress } = useAccount();
  const { viewMode, viewAddress } = useViewMode();

  return {
    address: viewMode ? viewAddress : connectedAddress,
    isViewMode: viewMode,
    connectedAddress,
  };
}
