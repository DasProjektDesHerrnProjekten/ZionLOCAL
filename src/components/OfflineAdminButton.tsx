// Offline Admin Button component
// Shows admin panel access button in offline mode

import { isOfflineMode, getOfflineAdminUrl } from '@/lib/offline-mode';
import { useNavigate } from 'react-router-dom';

export default function OfflineAdminButton() {
  const navigate = useNavigate();
  
  if (!isOfflineMode()) {
    return null; // Only show in offline mode
  }

  return (
    <button
      onClick={() => navigate(getOfflineAdminUrl())}
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      title="Open Offline Admin Panel"
    >
      ⚙️ Admin Panel
    </button>
  );
}