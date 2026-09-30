import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const SubjectDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subject, breakdown, studentData } = location.state || {};

  if (!subject || !breakdown || !studentData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">Subject Not Found</h2>
            <p className="text-muted-foreground">The requested subject details could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total score using proper weightings
  const quizTotal = (breakdown.quiz1 || 0) + (breakdown.quiz2 || 0);
  const quizWeighted = (quizTotal / 20) * 6; // 6% of total for quiz/test (max 20 points)

  const extrasWeighted = ((breakdown.extras || 0) / 5) * 24; // 24% of total for extras (max 5 points)

  const midtermWeighted = ((breakdown.midterm || 0) / 20) * 20; // 20% of total for midterm (max 20 points)

  const finalWeighted = ((breakdown.final || 0) / 25) * 50; // 50% of total for final (max 25 points)

  const totalScore = Math.round(quizWeighted + extrasWeighted + midtermWeighted + finalWeighted);
  const maxTotal = 100; // Total is always out of 100%

  const percentage = totalScore; // totalScore is already the percentage out of 100

  const getScoreColor = (score: number, max: number) => {
    if (max === 0) return "text-muted-foreground";
    const pct = (score / max) * 100;
    if (pct >= 70) return "text-green-600";
    if (pct >= 50) return "text-yellow-500";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button and Student Info */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-lg border border-primary/20 dark:border-primary/30 mb-6">
            <h1 className="text-2xl font-bold text-primary dark:text-primary-foreground mb-4">{subject} - Performance Summary</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#104129] p-4 rounded-lg border border-[#0a2e1d] shadow-md">
                <p className="text-sm text-white/80 mb-1">Student Name</p>
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10">
                  <span className="font-semibold text-white">{studentData.name}</span>
                </div>
              </div>
              <div className="bg-[#104129] p-4 rounded-lg border border-[#0a2e1d] shadow-md">
                <p className="text-sm text-white/80 mb-1">Admission ID</p>
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10">
                  <span className="font-semibold text-white">{studentData.admission_id}</span>
                </div>
              </div>
              <div className="bg-[#104129] p-4 rounded-lg border border-[#0a2e1d] shadow-md">
                <p className="text-sm text-white/80 mb-1">Roll Number</p>
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10">
                  <span className="font-semibold text-white">{studentData.roll_number || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Score Card */}
        <div className="mb-8">
          <Card className="border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-primary dark:text-primary-foreground">Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-sm text-primary dark:text-primary-foreground/90 mb-1">Total Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{totalScore}</span>
                    <span className="text-muted-foreground">/ 100</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    {totalScore}% of possible points
                  </p>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{totalScore}%</span>
                  </div>
                  <Progress value={totalScore} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/40 mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {percentage >= 70 ? 'Keep up the good work!' : 'Review your assessments'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Breakdown */}
        <Card className="border-[#0a2e1d] bg-[#104129]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Assessment Technique Breakdown</CardTitle>
            <p className="text-sm text-white/80">
              Detailed view of assessment components for {subject}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-2 font-medium">Assessment Component</th>
                    <th className="text-center py-3 px-2 font-medium">1</th>
                    <th className="text-center py-3 px-2 font-medium">2</th>
                    <th className="text-center py-3 px-2 font-medium">3</th>
                    <th className="text-center py-3 px-2 font-medium">4</th>
                    <th className="text-center py-3 px-2 font-medium">C/W</th>
                    <th className="text-center py-3 px-2 font-medium">H/W</th>
                    <th className="text-center py-3 px-2 font-medium">G/W</th>
                    <th className="text-center py-3 px-2 font-medium">C/P</th>
                    <th className="text-center py-3 px-2 font-medium">PR.</th>
                    <th className="text-center py-3 px-2 font-medium">AS.</th>
                    <th className="text-center py-3 px-2 font-medium">PRO.</th>
                    <th className="text-center py-3 px-2 font-medium">F/T</th>
                    <th className="text-center py-3 px-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Quiz/Test Section */}
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 font-medium">Quiz/Test (6%)</td>
                    <td className="text-center py-3 px-2">{breakdown.quiz1 || 0}</td>
                    <td className="text-center py-3 px-2">{breakdown.quiz2 || 0}</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2 font-medium">{(breakdown.quiz1 || 0) + (breakdown.quiz2 || 0)}</td>
                  </tr>

                  {/* Other Modalities Section */}
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 font-medium">Other Modalities (24%)</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2 font-medium">{breakdown.extras || 0}</td>
                  </tr>

                  {/* Midterm Section */}
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 font-medium">Midterm (20%)</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2 font-medium">{breakdown.midterm || 0}</td>
                  </tr>

                  {/* Final Section */}
                  <tr className="border-b border-white/20 bg-white/5">
                    <td className="py-3 px-2 font-medium">Final (50%)</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2">-</td>
                    <td className="text-center py-3 px-2 font-medium">{breakdown.final || 0}</td>
                  </tr>

                  {/* Reading/List Section with percentages */}
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 font-medium">Reading/List</td>
                    <td className="text-center py-3 px-2 text-xs">1%</td>
                    <td className="text-center py-3 px-2 text-xs">2%</td>
                    <td className="text-center py-3 px-2 text-xs">1%</td>
                    <td className="text-center py-3 px-2 text-xs">2%</td>
                    <td className="text-center py-3 px-2 text-xs">2%</td>
                    <td className="text-center py-3 px-2 text-xs">2%</td>
                    <td className="text-center py-3 px-2 text-xs">3%</td>
                    <td className="text-center py-3 px-2 text-xs">3%</td>
                    <td className="text-center py-3 px-2 text-xs">2%</td>
                    <td className="text-center py-3 px-2 text-xs">1%</td>
                    <td className="text-center py-3 px-2 text-xs">4%</td>
                    <td className="text-center py-3 px-2 text-xs">4%</td>
                    <td className="text-center py-3 px-2 text-xs font-medium">3%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-sm text-white/80">Total Score</p>
                  <p className="text-xl font-bold text-white">{totalScore}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-sm text-white/80">Maximum</p>
                  <p className="text-xl font-bold text-white">100</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-sm text-white/80">Percentage</p>
                  <p className="text-xl font-bold text-white">{percentage}%</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-sm text-white/80">Grade</p>
                  <p className="text-xl font-bold text-white">
                    {percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card className="border-border/40 mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Teacher's Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 p-4 rounded-lg">
              <p className="text-muted-foreground">
                {percentage >= 80
                  ? 'Outstanding performance! Your consistent effort and understanding of the material is commendable.'
                  : percentage >= 60
                  ? 'Good work so far. Consider reviewing the following areas to improve your grade: [specific topics].'
                  : 'Please schedule a meeting to discuss strategies for improvement. Focus on: [specific areas]'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubjectDetails;
