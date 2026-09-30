import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamSubmitted } from '@/components/ExamSubmitted';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineAuth } from '@/contexts/OfflineAuthContext';
import { isOfflineMode } from '@/lib/offline-mode';
import { Loader2 } from 'lucide-react';

const ExamSubmittedPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const offlineAuth = useOfflineAuth();

  const isAuth = isOfflineMode() ? offlineAuth.isAuthenticated : isAuthenticated;
  const loading = isOfflineMode() ? offlineAuth.loading : isLoading;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuth) {
      navigate('/login', { replace: true });
    }
  }, [isAuth, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ExamSubmitted />
    </div>
  );
};

export default ExamSubmittedPage;
