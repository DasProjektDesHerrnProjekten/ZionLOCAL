import { Exam } from '@/data/exams';
import { Calendar, Clock, FileText, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { hasStudentTakenExam, ExamResult, checkStudentExamAccess } from '@/lib/supabase';

interface ExamCardProps {
  exam: Exam;
  index: number;
}

const ExamCard = ({ exam, index }: ExamCardProps) => {
  const navigate = useNavigate();
  const { student } = useAuth();
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const isCancelled = !!examResult?.answers && 
    (examResult.answers as any)._cancelled === true;

  useEffect(() => {
    const checkExamStatus = async () => {
      if (!student?.id) {
        setIsChecking(false);
        return;
      }
      
      try {
        // Check both exam result and access permission
        const [result, access] = await Promise.all([
          hasStudentTakenExam(student.id, exam.id),
          checkStudentExamAccess(student.id, exam.id)
        ]);

        setExamResult(result);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking exam status:', error);
        // On error, deny access for security
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkExamStatus();
  }, [exam.id, student?.id]);

  const handleCardClick = () => {
    if (examResult || exam.status === 'completed' || exam.status === 'inactive' || !hasAccess) {
      return; // Don't navigate if exam is completed, cancelled, inactive, or student doesn't have access
    }
    navigate(`/exam/${exam.id}`);
  };

  const getStatusStyles = (status: Exam['status']) => {
    switch (status) {
      case 'ongoing':
      case 'active':
        return 'bg-success text-white border-success/20';
      case 'upcoming':
        return 'bg-info/10 text-info border-info/20';
      case 'completed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: Exam['status']) => {
    switch (status) {
      case 'ongoing':
      case 'active':
        return 'Start Now';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'inactive':
        return 'DISABLED';
      default:
        return status;
    }
  };

  const isSATExam = exam.title.includes('SAT Online Exam');
  
  return (
    <div
      className={`group relative rounded-xl p-6 transition-all duration-300 animate-slide-up ${
        exam.status === 'upcoming' 
          ? 'opacity-80 cursor-not-allowed backdrop-blur-sm bg-primary/5 border border-border/20' 
          : !!examResult || exam.status === 'completed' || exam.status === 'inactive' || !hasAccess
            ? 'bg-destructive/10 text-destructive border border-destructive/30 cursor-not-allowed'
            : 'bg-primary text-primary-foreground border border-primary/50 hover:shadow-elevated cursor-pointer hover:bg-primary/90'
      }`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        filter: exam.status === 'upcoming' ? 'blur(1px)' : 'none'
      }}
      onClick={handleCardClick}
    >
      {examResult ? (
        <div className={`absolute -top-2 -right-2 rounded-full p-1 ${
          isCancelled ? 'bg-destructive' : 'bg-success'
        } text-white`}>
          {isCancelled ? <XCircle size={20} /> : <CheckCircle size={20} />}
        </div>
      ) : null}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              isCancelled 
                ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                : getStatusStyles(exam.status)
            }`}>
              {isCancelled ? 'DISMISSED' : getStatusLabel(exam.status)}
            </span>
            <span className={`text-xs ${exam.title.includes('SAT Online Exam') ? 'text-primary-foreground/80' : 'text-primary-foreground/80'}`}>
              {exam.subject}
            </span>
          </div>
          <h3 className="text-lg font-display font-semibold text-primary-foreground group-hover:text-primary-foreground/90 transition-colors">
            {exam.title}
          </h3>
          <p className="text-sm mt-1 text-primary-foreground/80">{exam.description}</p>
        </div>
      </div>

      <div className={`flex flex-wrap items-center gap-4 text-sm mb-4 ${exam.status === 'ongoing' || exam.status === 'active' ? 'text-primary-foreground/90' : 'text-foreground/90'}`}>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className={`${exam.status === 'ongoing' || exam.status === 'active' ? 'text-primary-foreground/70' : 'text-foreground/70'}`} />
          <span>{new Date(exam.scheduledDate).toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className={`${exam.status === 'ongoing' || exam.status === 'active' ? 'text-primary-foreground/70' : 'text-foreground/70'}`} />
          <span>{exam.duration} minutes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText size={14} className={`${exam.status === 'ongoing' || exam.status === 'active' ? 'text-primary-foreground/70' : 'text-foreground/70'}`} />
          <span>{exam.totalQuestions} questions</span>
        </div>
      </div>

      {exam.status === 'upcoming' ? (
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <div className="bg-card/90 border border-border rounded-lg p-4 text-center">
            <p className="font-medium text-foreground/80 mb-1">Coming Soon</p>
            <p className="text-xs text-muted-foreground">
              Available on {new Date(exam.scheduledDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      ) : !isChecking && (
        <div className="mt-4 pt-3 border-t border-border/20">
          {!!examResult || exam.status === 'completed' ? (
            <div className="flex items-center justify-between text-success">
              <span className="text-sm font-medium">Completed</span>
              <CheckCircle size={18} />
            </div>
          ) : exam.status === 'inactive' ? (
            <div className="flex items-center justify-between text-destructive">
              <span className="text-sm font-medium">DISABLED</span>
              <XCircle size={18} />
            </div>
          ) : !hasAccess ? (
            <div className="flex items-center justify-between text-destructive">
              <span className="text-sm font-medium">Access Denied</span>
              <XCircle size={18} />
            </div>
          ) : (exam.status === 'ongoing' || exam.status === 'active') && !examResult ? (
            <div className="flex items-center justify-end">
              <span className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 text-primary-foreground/90">
                Start Exam
                <ArrowRight size={16} />
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ExamCard;
