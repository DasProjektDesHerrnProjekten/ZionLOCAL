import { useNavigate } from "react-router-dom";
import { LucideIcon, ArrowRight } from "lucide-react";
import { CircularProgress } from "./CircularProgress";

export interface AssessmentBreakdown {
  test1: number;
  test2: number;
  quiz1: number;
  quiz2: number;
  midterm: number;
  final: number;
  extras: number;
}

interface SubjectCardProps {
  subject: string;
  breakdown: AssessmentBreakdown;
  icon: LucideIcon;
  studentData: any;
}

const assessmentLabels: Record<keyof AssessmentBreakdown, { label: string; max: number }> = {
  test1: { label: "Test 1", max: 15 },
  test2: { label: "Test 2", max: 15 },
  quiz1: { label: "Quiz 1", max: 10 },
  quiz2: { label: "Quiz 2", max: 10 },
  midterm: { label: "Midterm", max: 20 },
  final: { label: "Final", max: 25 },
  extras: { label: "Extras", max: 5 },
};

export const SubjectCard = ({ subject, breakdown, icon: Icon, studentData }: SubjectCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to subject details with state data (original ScholarSphere approach)
    navigate('/subject-details', {
      state: {
        subject,
        breakdown,
        studentData
      }
    });
  };

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const maxTotal = Object.values(assessmentLabels).reduce((a, b) => a + b.max, 0);
  const percentage = Math.round((totalScore / maxTotal) * 100);

  const getGrade = (pct: number) => {
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    return "F";
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 70) return "text-success";
    if (pct >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-300 group hover:border-primary/30 cursor-pointer hover:shadow-md`}
      onClick={handleCardClick}
    >
      {/* Header with Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center p-1.5">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{subject}</h3>
              <p className="text-sm text-muted-foreground">Grade: {getGrade(percentage)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{totalScore}</p>
            <p className="text-xs text-muted-foreground">/ {maxTotal}</p>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <CircularProgress value={percentage} max={100} label="Overall %" size={100} />
        </div>

        {/* Click to expand hint */}
        <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
          <span>View detailed report</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
