import { ExamResults } from '@/components/ExamResults';
import { ExamSubmitted } from '@/components/ExamSubmitted';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ResultsPage = () => {
  const { isAuthenticated, isLoading, student } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNewSubmission, setIsNewSubmission] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    
    // Check if coming from an exam submission
    if (location.state?.from === 'exam-submission') {
      setIsNewSubmission(true);
      // Remove the state to prevent showing the message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {isNewSubmission ? <ExamSubmitted /> : <ExamResults />}
    </div>
  );
};

export default ResultsPage;
