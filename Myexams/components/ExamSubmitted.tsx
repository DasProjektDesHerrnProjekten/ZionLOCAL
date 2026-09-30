import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, User, BookOpen, Calendar, Home, Printer } from 'lucide-react';
import { useEffect } from 'react';

export const ExamSubmitted = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const currentDate = new Date();

  // Calculate next Friday at 12:00 PM
  const nextFriday = new Date();
  nextFriday.setDate(currentDate.getDate() + ((5 - currentDate.getDay() + 7) % 7));
  nextFriday.setHours(12, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/40 to-secondary/20">
      <div className="relative z-10 container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 shadow-sm">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold mb-3 text-foreground animate-fade-in">
            Exam submitted successfully
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.15s' }}>
            Thank you for completing your exam. Your responses have been securely recorded and will be evaluated soon.
          </p>
        </div>

        {/* Main Content Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Results Announcement Card */}
          <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl mr-4 bg-primary/10 text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-1 text-foreground">Results announcement</h2>
                <p className="text-sm text-muted-foreground">When to expect your official score</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center p-6 bg-muted/80 rounded-xl border border-border/60">
                <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-lg sm:text-2xl font-semibold text-foreground">
                  {nextFriday.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">around 12:00 PM (local time)</p>
              </div>

              <div className="bg-success/5 p-4 rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You will receive a notification as soon as your results are published. There is nothing else you need to do right now.
                </p>
              </div>
            </div>
          </div>

          {/* Student Information Card */}
          <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl mr-4 bg-secondary/20 text-secondary-foreground">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-1 text-foreground">Submission details</h2>
                <p className="text-sm text-muted-foreground">Summary of your exam submission</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg">
                  <span className="text-muted-foreground">Full name</span>
                  <span className="font-semibold text-foreground">{student?.name || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg">
                  <span className="text-muted-foreground">Admission ID</span>
                  <span className="font-semibold text-foreground">{student?.admission_id || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg">
                  <span className="text-muted-foreground">Class/stream</span>
                  <span className="font-semibold text-foreground">{student?.class || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg">
                  <span className="text-muted-foreground">Section</span>
                  <span className="font-semibold text-foreground">{student?.section || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/60">
                  <span className="text-muted-foreground">Submission time</span>
                  <span className="font-semibold text-foreground">
                    {currentDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="max-w-4xl mx-auto mt-10 animate-fade-in" style={{ animationDelay: '0.45s' }}>
          <div className="bg-card border-l-4 border-primary p-6 rounded-xl shadow-soft">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/30">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Important notice
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Your exam has been successfully submitted and is now being processed. Results will be available on the date shown above.
                  Please avoid contacting the administration about results before that time. Thank you for your patience and cooperation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 text-base sm:text-lg font-semibold shadow-soft hover:shadow-elevated transition-all duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="px-8 py-3 text-base sm:text-lg font-semibold shadow-soft hover:shadow-elevated transition-all duration-200"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Add fade-in animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ExamSubmitted;
