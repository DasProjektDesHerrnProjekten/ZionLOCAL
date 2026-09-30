import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExamResult, getStudentExamResults, getExamById } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Clock, BookOpen, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/data/exams';

export const ExamResultDetails = () => {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [exam, setExam] = useState<any>(null);
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const { student } = useAuth();
  const navigate = useNavigate();
  const { examId, resultId } = useParams<{ examId: string; resultId: string }>();

  useEffect(() => {
    const loadResult = async () => {
      if (!student?.id || !resultId || !examId) return;

      try {
        setLoading(true);
        const allResults = await getStudentExamResults(student.id);
        const foundResult = allResults.find(r => r.id === resultId);
        setResult(foundResult || null);

        // Also fetch exam data
        const examData = getExamById(examId);
        setExam(examData);
      } catch (error) {
        console.error('Failed to load exam result details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [student?.id, resultId, examId]);

  const getQuestionReview = () => {
    if (!result || !exam) return [];

    const actualQuestions = exam.questions.filter((q: Question) => !q.isPassage);
    return actualQuestions.map((question: Question) => {
      const questionId = String(question.id);
      const userAnswer = result.answers[questionId];
      const isCorrect = userAnswer === question.correctAnswer;
      const userAnswerText = userAnswer !== undefined ? question.options?.[userAnswer] : 'Not answered';
      const correctAnswerText = question.options?.[question.correctAnswer] || 'N/A';

      return {
        ...question,
        userAnswer,
        isCorrect,
        userAnswerText,
        correctAnswerText
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#10422a]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#dcfce7] border-t-transparent"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto py-8 px-4 bg-[#10422a] min-h-screen">
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-[#dcfce7] mb-4" />
          <h3 className="text-lg font-medium text-[#dcfce7]">Result not found</h3>
          <p className="text-[#dcfce7]/70 mt-2">The requested exam result could not be found.</p>
          <Button className="mt-6 bg-[#dcfce7] hover:bg-[#dcfce7]/90 text-[#10422a]" onClick={() => navigate('/results')}>
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    return 'text-[#dcfce7]';
  };

  const getScoreBgColor = (percentage: number) => {
    return 'bg-[#dcfce7] text-[#10422a]';
  };

  return (
    <div className="min-h-screen bg-[#10422a] text-[#dcfce7]">
      <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/results')} className="text-[#dcfce7] hover:bg-[#dcfce7]/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#dcfce7]">{result.exam_title}</h1>
            <p className="text-[#dcfce7]/70">
              Exam completed on {new Date(result.submitted_at).toLocaleDateString()} at {new Date(result.submitted_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Badge className={getScoreBgColor(result.score_percentage)}>
          {Math.round(result.score_percentage)}% Score
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-[#dcfce7] border-[#10422a]/20 hover:shadow-lg transition-all duration-300 hover:bg-[#dcfce7]/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#10422a]">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-[#10422a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#10422a]">{result.total_questions}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#dcfce7] border-[#10422a]/20 hover:shadow-lg transition-all duration-300 hover:bg-[#dcfce7]/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#10422a]">Correct Answers</CardTitle>
            <Check className="h-4 w-4 text-[#10422a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#10422a]">{result.correct_answers}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#dcfce7] border-[#10422a]/20 hover:shadow-lg transition-all duration-300 hover:bg-[#dcfce7]/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#10422a]">Incorrect Answers</CardTitle>
            <X className="h-4 w-4 text-[#10422a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#10422a]">{result.total_questions - result.correct_answers}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#dcfce7] border-[#10422a]/20 hover:shadow-lg transition-all duration-300 hover:bg-[#dcfce7]/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#10422a]">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-[#10422a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#10422a]">
              {Math.floor(result.time_spent / 60)}m {result.time_spent % 60}s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="mb-8 bg-[#10422a] border-[#dcfce7]/20">
        <CardHeader>
          <CardTitle className="text-[#dcfce7]">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#dcfce7]">Accuracy Rate</span>
              <span className={`text-lg font-bold ${getScoreColor(result.score_percentage)}`}>
                {Math.round((result.correct_answers / result.total_questions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#dcfce7]/20 rounded-full h-2">
              <div
                className="bg-[#dcfce7] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(result.correct_answers / result.total_questions) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-[#dcfce7]/70">
              You answered {result.correct_answers} out of {result.total_questions} questions correctly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Question Review Toggle */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={() => setShowQuestionReview(!showQuestionReview)}
          className="bg-[#dcfce7] text-[#10422a] hover:bg-[#dcfce7]/80 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
        >
          {showQuestionReview ? <EyeOff className="mr-2 h-5 w-5" /> : <Eye className="mr-2 h-5 w-5" />}
          {showQuestionReview ? 'Hide Question Review' : 'Show Question Review'}
        </Button>
      </div>

      {/* Question Review */}
      {showQuestionReview && (
        <Card className="mb-8 bg-[#10422a] border-[#dcfce7]/20">
          <CardHeader>
            <CardTitle className="text-[#dcfce7] flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Question by Question Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {getQuestionReview().map((question, index) => (
                <div key={question.id} className="bg-[#dcfce7]/10 rounded-lg p-6 border border-[#dcfce7]/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#dcfce7]">{index + 1}.</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        question.isCorrect 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {question.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    {question.section && (
                      <Badge variant="outline" className="text-[#dcfce7] border-[#dcfce7]/50">
                        {question.section}
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-[#dcfce7] font-medium mb-3">{question.text}</p>
                    
                    {question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isUserAnswer = question.userAnswer === optionIndex;
                          const isCorrectAnswer = question.correctAnswer === optionIndex;
                          
                          return (
                            <div 
                              key={optionIndex} 
                              className={`p-3 rounded-lg border transition-colors ${
                                isUserAnswer && isCorrectAnswer 
                                  ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'bg-red-500/20 border-red-500/50 text-red-200'
                                  : isCorrectAnswer
                                  ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                  : 'bg-[#dcfce7]/5 border-[#dcfce7]/20 text-[#dcfce7]/70'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                <span>{option}</span>
                                {isUserAnswer && <span className="text-sm font-medium">(Your Answer)</span>}
                                {isCorrectAnswer && <Check className="h-4 w-4 text-green-400 ml-auto" />}
                                {isUserAnswer && !isCorrectAnswer && <X className="h-4 w-4 text-red-400 ml-auto" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {question.explanation && (
                    <div className="bg-[#10422a]/50 rounded-lg p-4 border border-[#dcfce7]/20">
                      <h4 className="text-[#dcfce7] font-semibold mb-2 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Explanation
                      </h4>
                      <p className="text-[#dcfce7]/80 text-sm leading-relaxed">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => navigate('/dashboard')} className="bg-[#dcfce7] text-[#10422a]">
          Back to Dashboard
        </Button>
      </div>
      </div>
    </div>
  );
};

export default ExamResultDetails;
