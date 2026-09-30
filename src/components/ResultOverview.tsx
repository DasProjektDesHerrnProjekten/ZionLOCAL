import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { exams } from '@/data/exams';
import { ExamResult, getStudentExamResults } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Home, Printer } from 'lucide-react';

interface ExamWithStatus {
  id: string;
  title: string;
  status: 'taken' | 'not_taken';
  score?: number;
}

export const ResultOverview = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!student?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStudentExamResults(student.id);
        setResults(data);
      } catch (error) {
        console.error('Failed to load exam results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [student?.id]);

  const examStatuses: ExamWithStatus[] = useMemo(() => {
    return exams.map((exam) => {
      const result = results.find((r) => r.exam_id === exam.id);
      return {
        id: exam.id,
        title: exam.title,
        status: result ? 'taken' : 'not_taken',
        score: result?.score_percentage,
      };
    });
  }, [results]);

  const overallScore = useMemo(() => {
    const taken = examStatuses.filter((e) => e.status === 'taken' && typeof e.score === 'number');
    if (taken.length === 0) return 0;
    const sum = taken.reduce((acc, e) => acc + (e.score || 0), 0);
    return sum / taken.length;
  }, [examStatuses]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/40 to-secondary/20 flex items-center justify-center px-4 py-10">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8">
        {/* Left student summary card */}
        <Card className="w-full lg:w-80 bg-emerald-900 text-emerald-50 rounded-3xl shadow-2xl border-0 flex flex-col">
          <div className="flex flex-col items-center px-8 pt-8 pb-4">
            <div className="h-20 w-20 rounded-full bg-emerald-800 flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-emerald-100" />
            </div>
            <h2 className="text-lg font-semibold text-center uppercase tracking-wide">
              {student?.name || 'Student Name'}
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 text-center">
              {student?.class || 'Your School / Class'}
            </p>
          </div>

          <div className="px-8 pb-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-emerald-100/80">Admission No.</span>
              <span className="font-semibold">{student?.admission_id || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-100/80">Stream</span>
              <span className="font-semibold">
                {student?.class?.toLowerCase().includes('social')
                  ? 'Social'
                  : student?.class
                  ? 'Natural'
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-100/80">Section</span>
              <span className="font-semibold">{student?.section || '—'}</span>
            </div>
          </div>

          <div className="mt-6 px-8 pb-8">
            <div className="bg-emerald-800 rounded-2xl py-4 px-4 text-center shadow-inner">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                Total Score
              </p>
              <p className="mt-2 text-3xl font-bold">
                {overallScore.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Right results list card */}
        <Card className="flex-1 bg-card rounded-3xl shadow-2xl border border-border/60 px-6 sm:px-8 py-6 sm:py-8">
          <div className="mb-6 border-b border-border/60 pb-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-emerald-900">
              Exam Results
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of your registered exams and completion status.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Loading your results…
            </div>
          ) : (
            <div className="space-y-3">
              {examStatuses.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {exam.title}
                    </p>
                    {exam.status === 'taken' && typeof exam.score === 'number' && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Completed • {Math.round(exam.score)}%
                      </p>
                    )}
                  </div>
                  <div>
                    {exam.status === 'taken' ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1">
                        Not yet taken
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              variant="default"
              className="px-6 sm:px-8"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              Check Again
            </Button>
            <Button
              variant="outline"
              className="px-6 sm:px-8"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Result
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResultOverview;

