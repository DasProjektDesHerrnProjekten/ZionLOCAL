import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamResult, getStudentExamResults } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Clock, Award, BookOpen, BarChart, TrendingUp, TrendingDown, Target, Calendar, Filter, Trophy, Star, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const ExamResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'high' | 'low'>('all');
  const { student } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadResults = async () => {
      if (!student?.id) return;

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

  const calculateStats = () => {
    if (results.length === 0) return null;

    const totalExams = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.score_percentage, 0) / totalExams;
    const highestScore = Math.max(...results.map(r => r.score_percentage));
    const lowestScore = Math.min(...results.map(r => r.score_percentage));
    const totalCorrect = results.reduce((sum, r) => sum + r.correct_answers, 0);
    const totalQuestions = results.reduce((sum, r) => sum + r.total_questions, 0);
    const overallAccuracy = (totalCorrect / totalQuestions) * 100;

    // Calculate recent performance (last 5 exams)
    const recentResults = results.slice(0, 5);
    const recentAverage = recentResults.reduce((sum, r) => sum + r.score_percentage, 0) / recentResults.length;
    const trend = recentResults.length >= 2 ? recentAverage - (results.slice(5, 10).reduce((sum, r) => sum + r.score_percentage, 0) / Math.min(5, results.length - 5)) : 0;

    return {
      totalExams,
      averageScore,
      highestScore,
      lowestScore,
      overallAccuracy,
      trend,
      totalCorrect,
      totalQuestions
    };
  };

  const filteredAndSortedResults = () => {
    let filtered = [...results];

    // Apply filters
    switch (filterBy) {
      case 'recent':
        filtered = filtered.slice(0, 10);
        break;
      case 'high':
        filtered = filtered.filter(r => r.score_percentage >= 70);
        break;
      case 'low':
        filtered = filtered.filter(r => r.score_percentage < 50);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      } else {
        return b.score_percentage - a.score_percentage;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#dcfce7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#10422a] border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-[#10422a]">Loading your exam results...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-[#dcfce7] flex items-center justify-center">
        <div className="text-center py-12 px-6 max-w-md">
          <div className="bg-[#10422a] rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-[#dcfce7]" />
          </div>
          <h3 className="text-2xl font-bold text-[#10422a] mb-2">No exam results yet</h3>
          <p className="text-[#10422a] mb-8 leading-relaxed">
            Complete your first exam to see your performance analytics and detailed results here.
          </p>
          <Button
            className="bg-[#10422a] hover:bg-[#10422a]/90 text-[#dcfce7] px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            Take Your First Exam
          </Button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const displayResults = filteredAndSortedResults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dcfce7] via-[#dcfce7] to-[#f0f9ff]">
      {/* Hero Section with Glassmorphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#10422a]/10 via-[#10422a]/5 to-[#10422a]/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#10422a]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#dcfce7]/30 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            {/* Animated Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#10422a] to-[#0d3528] rounded-2xl shadow-2xl mb-6 transform hover:scale-110 transition-all duration-300">
              <Trophy className="h-10 w-10 text-[#dcfce7]" />
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#10422a] via-[#0d3528] to-[#10422a] bg-clip-text text-transparent mb-4">
              Academic Excellence
            </h1>
            <p className="text-xl text-[#10422a]/70 max-w-3xl mx-auto leading-relaxed">
              Your journey to success, one exam at a time. Track progress, analyze performance, and achieve your goals.
            </p>
          </div>

          {/* Quick Stats Hero Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="backdrop-blur-lg bg-white/70 border border-[#10422a]/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#10422a] to-[#0d3528] rounded-xl">
                    <BookOpen className="h-6 w-6 text-[#dcfce7]" />
                  </div>
                  <TrendingUp className={`h-5 w-5 ${stats.trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div className="text-3xl font-bold text-[#10422a] mb-1">{stats.totalExams}</div>
                <div className="text-sm text-[#10422a]/60 font-medium">Total Exams</div>
                {stats.trend !== 0 && (
                  <div className={`text-xs mt-2 ${stats.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}% from last period
                  </div>
                )}
              </div>

              <div className="backdrop-blur-lg bg-white/70 border border-[#10422a]/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#10422a] to-[#0d3528] rounded-xl">
                    <Target className="h-6 w-6 text-[#dcfce7]" />
                  </div>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-[#10422a] mb-1">{Math.round(stats.averageScore)}%</div>
                <div className="text-sm text-[#10422a]/60 font-medium">Average Score</div>
                <div className="w-full bg-[#10422a]/10 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-[#10422a] to-[#0d3528] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.averageScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="backdrop-blur-lg bg-white/70 border border-[#10422a]/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#10422a] to-[#0d3528] rounded-xl">
                    <Award className="h-6 w-6 text-[#dcfce7]" />
                  </div>
                  <Trophy className="h-5 w-5 text-[#10422a]" />
                </div>
                <div className="text-3xl font-bold text-[#10422a] mb-1">{Math.round(stats.highestScore)}%</div>
                <div className="text-sm text-[#10422a]/60 font-medium">Best Score</div>
                <div className="text-xs text-[#10422a]/50 mt-2">Personal Record</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Advanced Statistics Dashboard */}
        {stats && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#10422a] mb-8 text-center">Performance Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Overview Card */}
              <div className="backdrop-blur-lg bg-white/80 border border-[#10422a]/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#10422a] to-[#0d3528] rounded-xl mr-4">
                    <BarChart className="h-6 w-6 text-[#dcfce7]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#10422a]">Performance Overview</h3>
                    <p className="text-[#10422a]/60">Detailed analytics breakdown</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#10422a]">Overall Accuracy</span>
                      <span className="text-lg font-bold text-[#10422a]">{Math.round(stats.overallAccuracy)}%</span>
                    </div>
                    <div className="w-full bg-[#10422a]/10 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#10422a] to-[#0d3528] h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${stats.overallAccuracy}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#dcfce7]/50 rounded-xl p-4 border border-[#10422a]/10">
                      <div className="text-2xl font-bold text-[#10422a]">{stats.totalCorrect}</div>
                      <div className="text-sm text-[#10422a]/60">Correct Answers</div>
                    </div>
                    <div className="bg-[#dcfce7]/50 rounded-xl p-4 border border-[#10422a]/10">
                      <div className="text-2xl font-bold text-[#10422a]">{stats.totalQuestions}</div>
                      <div className="text-sm text-[#10422a]/60">Total Questions</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Showcase */}
              <div className="backdrop-blur-lg bg-white/80 border border-[#10422a]/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#10422a] to-[#0d3528] rounded-xl mr-4">
                    <Trophy className="h-6 w-6 text-[#dcfce7]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#10422a]">Achievements</h3>
                    <p className="text-[#10422a]/60">Your academic milestones</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gradient-to-r from-[#dcfce7]/30 to-[#dcfce7]/10 rounded-xl border border-[#10422a]/10">
                    <div className="p-2 bg-[#10422a] rounded-lg mr-4">
                      <Trophy className="h-5 w-5 text-[#dcfce7]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#10422a]">High Achiever</div>
                      <div className="text-sm text-[#10422a]/60">Scored above 80% in {results.filter(r => r.score_percentage >= 80).length} exams</div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gradient-to-r from-[#dcfce7]/30 to-[#dcfce7]/10 rounded-xl border border-[#10422a]/10">
                    <div className="p-2 bg-[#10422a] rounded-lg mr-4">
                      <Target className="h-5 w-5 text-[#dcfce7]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#10422a]">Consistent Performer</div>
                      <div className="text-sm text-[#10422a]/60">Completed {stats.totalExams} exams successfully</div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gradient-to-r from-[#dcfce7]/30 to-[#dcfce7]/10 rounded-xl border border-[#10422a]/10">
                    <div className="p-2 bg-[#10422a] rounded-lg mr-4">
                      <Award className="h-5 w-5 text-[#dcfce7]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#10422a]">Accuracy Master</div>
                      <div className="text-sm text-[#10422a]/60">{Math.round(stats.overallAccuracy)}% overall accuracy rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stunning Results Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {displayResults.map((result, index) => {
            const isSpecialExam = result.exam_title === "ETHIOPIAN UNIVERSITY ENTRANCE EXAMINATION (EUEE) - ENGLISH";
            return (
            <div
              key={result.id}
              className={`group relative rounded-3xl p-6 shadow-xl transition-all duration-500 ${
                isSpecialExam ? 'bg-white border-2 border-[#10422a]' : 'backdrop-blur-lg bg-white/80 border border-[#10422a]/10 hover:shadow-2xl transform hover:-translate-y-3 hover:rotate-1'
              }`}
            >
              {/* Gradient Border Effect */}
              {!isSpecialExam && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#10422a] to-[#0d3528] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
              )}

              {/* Score Badge with Glow */}
              <div className="absolute -top-3 -right-3 z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#10422a] rounded-full blur-md opacity-50"></div>
                  <Badge className="relative px-4 py-2 text-sm font-bold bg-gradient-to-r from-[#10422a] to-[#0d3528] text-[#dcfce7] border-0 shadow-lg">
                    {Math.round(result.score_percentage)}%
                  </Badge>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="absolute top-4 left-4">
                <div className={`w-3 h-3 rounded-full ${
                  result.score_percentage >= 80 ? 'bg-green-500 shadow-green-500/50 shadow-lg' :
                  result.score_percentage >= 60 ? 'bg-yellow-500 shadow-yellow-500/50 shadow-lg' :
                  'bg-red-500 shadow-red-500/50 shadow-lg'
                }`}></div>
              </div>

              <div className="pt-8">
                <CardHeader className="pb-4 px-0">
                  <CardTitle className={`text-xl font-bold line-clamp-2 leading-tight ${
                    isSpecialExam ? 'text-[#10422a]' : 'text-[#10422a] group-hover:text-[#0d3528] transition-colors duration-300'
                  }`}>
                    {result.exam_title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-[#10422a]/60 mt-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(result.submitted_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </CardHeader>

                <CardContent className="px-0 pb-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`bg-gradient-to-br from-[#dcfce7] to-[#dcfce7]/50 p-4 rounded-2xl border border-[#10422a]/10 transition-all duration-300 ${
                      isSpecialExam ? '' : 'group-hover:shadow-md'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#10422a]/60 font-medium uppercase tracking-wide">Correct</p>
                          <p className="text-lg font-bold text-[#10422a]">{result.correct_answers}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br from-[#dcfce7] to-[#dcfce7]/50 p-4 rounded-2xl border border-[#10422a]/10 transition-all duration-300 ${
                      isSpecialExam ? '' : 'group-hover:shadow-md'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <X className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#10422a]/60 font-medium uppercase tracking-wide">Incorrect</p>
                          <p className="text-lg font-bold text-[#10422a]">{result.total_questions - result.correct_answers}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br from-[#dcfce7] to-[#dcfce7]/50 p-4 rounded-2xl border border-[#10422a]/10 transition-all duration-300 ${
                      isSpecialExam ? '' : 'group-hover:shadow-md'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#10422a]/60 font-medium uppercase tracking-wide">Time</p>
                          <p className="text-lg font-bold text-[#10422a]">
                            {Math.floor(result.time_spent / 60)}:{(result.time_spent % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br from-[#dcfce7] to-[#dcfce7]/50 p-4 rounded-2xl border border-[#10422a]/10 transition-all duration-300 ${
                      isSpecialExam ? '' : 'group-hover:shadow-md'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#10422a]/60 font-medium uppercase tracking-wide">Accuracy</p>
                          <p className="text-lg font-bold text-[#10422a]">
                            {Math.round((result.correct_answers / result.total_questions) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className={`w-full font-semibold py-4 rounded-2xl shadow-lg transition-all duration-300 ${
                      isSpecialExam 
                        ? 'bg-[#10422a] text-[#dcfce7]' 
                        : 'bg-gradient-to-r from-[#10422a] to-[#0d3528] hover:from-[#0d3528] hover:to-[#10422a] text-[#dcfce7] hover:shadow-xl transform hover:scale-105 group-hover:shadow-2xl'
                    }`}
                    onClick={() => navigate(`/exam/${result.exam_id}/results/${result.id}`)}
                  >
                    <BarChart className="mr-3 h-5 w-5" />
                    View Detailed Analysis
                  </Button>
                </CardContent>
              </div>
            </div>
            );
          })}
        </div>

        {/* Elegant Footer */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center justify-center p-4 bg-white/60 backdrop-blur-lg border border-[#10422a]/10 rounded-2xl shadow-xl">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 text-[#10422a] hover:bg-[#10422a] hover:text-[#dcfce7] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowUpRight className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
