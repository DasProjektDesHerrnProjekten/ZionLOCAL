import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ExamCancelled() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reason, examTitle } = location.state || {
    reason: 'Unknown reason',
    examTitle: 'the exam'
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">Exam Cancelled</h1>
        
        <div className="space-y-4 text-muted-foreground">
          <p>
            {examTitle} has been cancelled due to a violation of exam rules.
          </p>
          <p className="bg-destructive/10 p-4 rounded-lg text-destructive">
            {reason}
          </p>
          <p>
            Your exam results have been recorded as cancelled. Please contact the exam administrator if you believe this is a mistake.
          </p>
        </div>
        
        <div className="pt-6">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
