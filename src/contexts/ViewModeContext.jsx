import { createContext, useContext, useState } from 'react';
import { useStore } from '../../store/useUserInfoStore';

const ViewModeContext = createContext();

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState(false);
  const [viewAddress, setViewAddress] = useState('');
  const [viewUserId, setViewUserId] = useState('');
  const { getUserDetails, checkUserById } = useStore();

  const enableViewMode = async (userIdOrAddress) => {
    try {
      let resolvedAddress;

      if (userIdOrAddress.startsWith('0x')) {
        resolvedAddress = userIdOrAddress;
      } else {
        resolvedAddress = await checkUserById(userIdOrAddress);
      }

      if (!resolvedAddress || resolvedAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('User not found');
      }

      const userDetails = await getUserDetails(userIdOrAddress);

      setViewAddress(resolvedAddress);
      setViewUserId(userDetails.id?.toString() || '');
      setViewMode(true);

      return { success: true, address: resolvedAddress };
    } catch (error) {
      console.error('Error enabling view mode:', error);
      return { success: false, error: error.message };
    }
  };

  const disableViewMode = () => {
    setViewMode(false);
    setViewAddress('');
    setViewUserId('');
    localStorage.removeItem('userAddress');
  };

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        viewAddress,
        viewUserId,
        enableViewMode,
        disableViewMode,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within ViewModeProvider');
  }
  return context;
}
