import { useState } from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { useViewMode } from '../contexts/ViewModeContext';
import Swal from 'sweetalert2';

export default function ViewModeToggle() {
  const { viewMode, viewUserId, viewAddress, enableViewMode, disableViewMode } = useViewMode();
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnableViewMode = async () => {
    if (!inputValue.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Input Required',
        text: 'Please enter a User ID or wallet address',
      });
      return;
    }

    setLoading(true);
    const result = await enableViewMode(inputValue.trim());
    setLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'View Mode Enabled',
        text: `Viewing data for ${result.address.slice(0, 6)}...${result.address.slice(-4)}`,
        timer: 2000,
      });
      setShowInput(false);
      setInputValue('');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.error || 'Failed to enable view mode',
      });
    }
  };

  const handleDisableViewMode = () => {
    disableViewMode();
    Swal.fire({
      icon: 'info',
      title: 'View Mode Disabled',
      text: 'Returned to your own account',
      timer: 2000,
    });
  };

  if (viewMode) {
    return (
      <div className="cyber-glass border border-neon-orange rounded-lg px-4 py-2 flex items-center gap-3">
        <Eye className="text-neon-orange" size={18} />
        <div>
          <p className="text-xs text-neon-orange font-medium">Viewing Mode</p>
          <p className="text-xs text-cyan-300/90 font-mono">
            ID: {viewUserId} | {viewAddress.slice(0, 6)}...{viewAddress.slice(-4)}
          </p>
        </div>
        <button
          onClick={handleDisableViewMode}
          className="p-1 hover:bg-neon-orange/20 rounded transition-colors"
          title="Exit view mode"
        >
          <X className="text-neon-orange" size={16} />
        </button>
      </div>
    );
  }

  if (showInput) {
    return (
      <div className="cyber-glass border border-cyan-500/30 rounded-lg p-3 flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter User ID or Address..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleEnableViewMode()}
          className="bg-transparent border-none outline-none text-cyan-300 text-sm w-48 placeholder:text-cyan-300/50"
          autoFocus
        />
        <button
          onClick={handleEnableViewMode}
          disabled={loading}
          className="p-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded transition-colors disabled:opacity-50"
          title="Search"
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
          ) : (
            <Search className="text-cyan-400" size={16} />
          )}
        </button>
        <button
          onClick={() => {
            setShowInput(false);
            setInputValue('');
          }}
          className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
          title="Cancel"
        >
          <X className="text-cyan-400" size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="cyber-glass border border-cyan-500/30 hover:border-cyan-500 rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
      title="View another user's data"
    >
      <EyeOff className="text-cyan-400" size={18} />
      <span className="text-sm text-cyan-300">View Mode</span>
    </button>
  );
}
