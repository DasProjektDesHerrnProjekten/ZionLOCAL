import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamSubmitted } from '@/components/ExamSubmitted';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ExamSubmittedPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
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
