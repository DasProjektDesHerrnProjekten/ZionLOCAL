import { useState, useEffect } from 'react';
import { useAdminAuth, Admin } from '@/contexts/AdminAuthContext';
import { studentResults, violations } from '@/data/mockData';
import { exams } from '@/data/exams';
import { Exam } from '@/data/exams';
import { geographyExam2018 } from '@/data/geographyExam2018';
import { Users, FileText, AlertTriangle, BookOpen, TrendingUp, TrendingDown, AlertCircle, BarChart3, PieChart, Target, Award, Clock, Zap, CheckCircle, XCircle, Activity, Trophy, GraduationCap } from 'lucide-react';
import { fetchStudents, getEnhancedDashboardStats, queryWithRetry, fetchScheduledExams, fetchProgrammes, initializeExamsInDatabase, supabase, recalculateExamResults } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie } from 'recharts';

interface Student {
  id: string;
  admissionId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  status?: string;
}

const AdminDashboard = () => {
  useDocumentTitle('Admin Dashboard');
  const { admin } = useAdminAuth();
  const [dashboardStats, setDashboardStats] = useState<{
    totalStudents: string;
    activeExams: string;
    totalResults: string;
    totalViolations: string;
    averageScore: string;
    passRate: string;
    highPerformers: string;
    needsImprovement: string;
    resultsChange: string;
    violationsChange: string;
    subjectPerformance: Array<{
      subject: string;
      avgScore: number;
      totalExams: number;
      passRate: number;
    }>;
    performanceTrend: Array<{
      day: string;
      score: number;
      exams: number;
    }>;
    highestScores: Array<{
      student_name: string;
      exam_title: string;
      score_percentage: number;
      subject: string;
    }>;
    classDistribution: Array<{
      class: string;
      stream: string;
      students: number;
      avgScore: number;
    }>;
    violationTypes: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    streamTotals: {
      natural: number;
      social: number;
      total: number;
    };
    recentResults: Array<{
      id: string;
      student_name: string;
      exam_title: string;
      score_percentage: number;
      submitted_at: string;
      status: string;
    }>;
    recentViolations: Array<{
      id: string;
      student_name: string;
      exam_title: string;
      type: string;
      timestamp: string;
      severity: string;
    }>;
  }>({
    totalStudents: '...',
    activeExams: '...',
    totalResults: '...',
    totalViolations: '...',
    averageScore: '...',
    passRate: '...',
    highPerformers: '...',
    needsImprovement: '...',
    resultsChange: '...',
    violationsChange: '...',
    subjectPerformance: [],
    performanceTrend: [],
    highestScores: [],
    classDistribution: [],
    violationTypes: [],
    streamTotals: { natural: 0, social: 0, total: 0 },
    recentResults: [],
    recentViolations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [scheduledExams, setScheduledExams] = useState<Exam[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDayExams, setSelectedDayExams] = useState<any[]>([]);

  const loadFallbackData = () => {
    setIsUsingFallback(true);
    
    // Filter data based on admin permissions
    const filteredResults = admin?.role === 'overseer' 
      ? studentResults
      : admin?.username === 'ZenaZPrestigious' 
      ? studentResults.filter(r => r.examTitle?.toLowerCase().includes('english'))
      : admin?.username === 'Asnakew'
      ? studentResults.filter(r => r.examTitle?.toLowerCase().includes('chemistry'))
      : admin?.username === 'Habtamu@elyonmain.app'
      ? studentResults.filter(r => r.examTitle?.toLowerCase().includes('economics') || r.examTitle?.toLowerCase().includes('economic'))
      : studentResults;
    
    const filteredViolations = admin?.role === 'overseer'
      ? violations
      : admin?.username === 'ZenaZPrestigious' 
      ? violations.filter(v => v.examTitle?.toLowerCase().includes('english'))
      : admin?.username === 'Asnakew'
      ? violations.filter(v => v.examTitle?.toLowerCase().includes('chemistry'))
      : admin?.username === 'Habtamu@elyonmain.app'
      ? violations.filter(v => v.examTitle?.toLowerCase().includes('economics') || v.examTitle?.toLowerCase().includes('economic'))
      : violations;
    
    // Calculate comprehensive analytics
    const totalStudents = studentResults.length;
    const activeExams = exams.filter(e => e.status === 'active' || e.status === 'ongoing').length;
    const totalResults = filteredResults.length;
    const totalViolations = filteredViolations.length;
    
    // Performance analytics
    const averageScore = filteredResults.length > 0 
      ? Math.round(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / filteredResults.length)
      : 0;
    
    const passRate = filteredResults.length > 0 
      ? Math.round((filteredResults.filter(r => r.percentage >= 60).length / filteredResults.length) * 100)
      : 0;
    
    const highPerformers = filteredResults.filter(r => r.percentage >= 90).length;
    const needsImprovement = filteredResults.filter(r => r.percentage < 60).length;
    
    const subjectPerformance = [
      { subject: 'English', avgScore: 78, totalExams: 45, passRate: 82 },
      { subject: 'Chemistry', avgScore: 72, totalExams: 32, passRate: 75 },
      { subject: 'Mathematics', avgScore: 65, totalExams: 28, passRate: 68 },
      { subject: 'Physics', avgScore: 70, totalExams: 25, passRate: 72 }
    ];
    
    // Sample scheduled exams
    const sampleScheduledExams: Exam[] = [
      {
        id: 'english-euee-2018',
        title: 'MESKAYE ONLINE EXAM 2018 MODEL-1 ENGLISH',
        subject: 'English',
        duration: 120,
        totalQuestions: 120,
        description: 'English EUEE Exam - Ginbot 2010 (June, 2018)',
        scheduledDate: '2026-02-21',
        status: 'active',
        startTime: '09:00',
        endTime: '11:00',
        questions: []
      },
      {
        id: 'chemistry-2018-natural',
        title: 'Chemistry Exam 2018 - Natural Science',
        subject: 'Chemistry',
        duration: 120,
        totalQuestions: 80,
        description: 'Chemistry EUEE Exam - Natural Science Stream',
        scheduledDate: '2026-02-22',
        status: 'upcoming',
        startTime: '10:00',
        endTime: '12:00',
        questions: []
      },
      {
        id: 'math-midterm',
        title: 'Mathematics Midterm Examination',
        subject: 'Mathematics',
        duration: 90,
        totalQuestions: 50,
        description: 'Mathematics Midterm - All Streams',
        scheduledDate: '2026-02-24',
        status: 'upcoming',
        startTime: '14:00',
        endTime: '15:30',
        questions: []
      }
    ];
    
    const highestScores = [
      { student_name: 'Abebe Kebede', exam_title: 'Chemistry EUEE 2018 Natural', score_percentage: 98, subject: 'Chemistry' },
      { student_name: 'Sara Mengistu', exam_title: 'English EUEE 2018', score_percentage: 96, subject: 'English' },
      { student_name: 'Dawit Tadesse', exam_title: 'Mathematics EUEE 2018', score_percentage: 94, subject: 'Mathematics' },
      { student_name: 'Helen Assefa', exam_title: 'Physics EUEE 2018', score_percentage: 92, subject: 'Physics' },
      { student_name: 'Mulugeta Bekele', exam_title: 'Biology EUEE 2018', score_percentage: 90, subject: 'Biology' }
    ];

    const performanceTrend = [
      { day: 'Mon', score: 75, exams: 12 },
      { day: 'Tue', score: 78, exams: 15 },
      { day: 'Wed', score: 82, exams: 18 },
      { day: 'Thu', score: 79, exams: 14 },
      { day: 'Fri', score: 85, exams: 22 },
      { day: 'Sat', score: 80, exams: 8 },
      { day: 'Sun', score: 77, exams: 6 }
    ];
    
    // Class distribution by stream
    const classDistribution = [
      { class: 'Grade 10', stream: 'Natural', students: 25, avgScore: 78 },
      { class: 'Grade 10', stream: 'Social', students: 22, avgScore: 75 },
      { class: 'Grade 11', stream: 'Natural', students: 20, avgScore: 82 },
      { class: 'Grade 11', stream: 'Social', students: 18, avgScore: 79 },
      { class: 'Grade 12', stream: 'Natural', students: 21, avgScore: 85 },
      { class: 'Grade 12', stream: 'Social', students: 19, avgScore: 81 }
    ];
    
    // Violation types
    const violationTypes = [
      { type: 'Copying', count: 8, percentage: 40 },
      { type: 'Late Submission', count: 6, percentage: 30 },
      { type: 'Multiple Attempts', count: 4, percentage: 20 },
      { type: 'Other', count: 2, percentage: 10 }
    ];
    
    return {
      stats: {
        totalStudents: totalStudents.toString(),
        activeExams: activeExams.toString(),
        totalResults: totalResults.toString(),
        totalViolations: totalViolations.toString(),
        averageScore: averageScore.toString(),
        passRate: passRate.toString(),
        highPerformers: highPerformers.toString(),
        needsImprovement: needsImprovement.toString(),
        resultsChange: '+24%',
        violationsChange: '-8%',
        subjectPerformance,
        performanceTrend,
        highestScores,
        classDistribution,
        violationTypes,
        streamTotals: { natural: 86, social: 59, total: 145 },
        recentResults: filteredResults.slice(0, 8).map(r => ({
          id: r.id,
          student_name: r.studentName,
          exam_title: r.examTitle,
          score_percentage: r.percentage,
          submitted_at: new Date().toISOString(),
          status: r.percentage >= 60 ? 'passed' : 'failed'
        })),
        recentViolations: filteredViolations.slice(0, 6).map(v => ({
          id: v.id,
          student_name: v.studentName,
          exam_title: v.examTitle,
          type: v.type,
          timestamp: v.timestamp,
          severity: v.type === 'copy_attempt' ? 'high' : 'medium'
        }))
      },
      scheduledExams: sampleScheduledExams
    };
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure physics exam is in database (one-time sync)
        await queryWithRetry(async () => {
          try {
            // Check if physics exam exists
            const { data: existing } = await supabase
              .from('exams')
              .select('id')
              .eq('id', 'physics-miskaye-hizunan-2024')
              .single();

            if (!existing) {
              // Add physics exam to database
              const { physicsExam } = await import('@/data/physicsExam');
              await supabase
                .from('exams')
                .insert([{
                  id: physicsExam.id,
                  title: physicsExam.title,
                  subject: physicsExam.subject,
                  duration: physicsExam.duration,
                  total_questions: physicsExam.totalQuestions,
                  description: physicsExam.description,
                  scheduled_date: physicsExam.scheduledDate,
                  status: physicsExam.status,
                  stream: physicsExam.stream || null,
                  password: physicsExam.password || null,
                  start_time: physicsExam.startTime || null,
                  end_time: physicsExam.endTime || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }]);
              console.log('✅ Added physics exam to database');
            }
          } catch (e) {
            console.error('Error ensuring physics exam in database:', e);
          }
        });

        // Ensure economics exam is in database (one-time sync)
        await queryWithRetry(async () => {
          try {
            // Check if economics exam exists
            const { data: existing } = await supabase
              .from('exams')
              .select('id')
              .eq('id', 'economics-2018')
              .single();

            if (!existing) {
              // Add economics exam to database
              const { economicsExam2018 } = await import('@/data/economicsExam2018');
              await supabase
                .from('exams')
                .insert([{
                  id: economicsExam2018.id,
                  title: economicsExam2018.title,
                  subject: economicsExam2018.subject,
                  duration: economicsExam2018.duration,
                  total_questions: economicsExam2018.totalQuestions,
                  description: economicsExam2018.description,
                  scheduled_date: economicsExam2018.scheduledDate,
                  status: economicsExam2018.status,
                  stream: economicsExam2018.stream || null,
                  password: economicsExam2018.password || null,
                  start_time: economicsExam2018.startTime || null,
                  end_time: economicsExam2018.endTime || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }]);
              console.log('✅ Economics ist im Bauch hinzugefügt.');
            }
          } catch (e) {
            console.error('Fehler Beim Economics Beigetreten, um es zum Bauch Hinzufügen.', e);
          }
        });

        // Load data with retry logic
        const [students, stats, scheduledExamsData, programmesData] = await Promise.all([
          queryWithRetry(async () => {
            try {
              return await fetchStudents();
            } catch (e) {
              console.error('Studenten konnten nich im Bauch gefunden', e);
              return [];
            }
          }),
          queryWithRetry(async () => {
            try {
              return await getEnhancedDashboardStats(admin ? { username: admin.username, name: admin.name } : undefined);
            } catch (e) {
              console.error('DashStats konnte nicht eingeladen.', e);
              return null;
            }
          }),
          queryWithRetry(async () => {
            try {
              return await fetchScheduledExams(admin ? { username: admin.username, name: admin.name } : undefined);
            } catch (e) {
              console.error('Fehler beim das abrufen der Nutzer.', e);
              return [];
            }
          }),
          queryWithRetry(async () => {
            try {
              return await fetchProgrammes();
            } catch (e) {
              console.error('Programmen konnte nicht abgeruft werden:', e);
              return [];
            }
          })
        ]);

        if (stats) {
          setDashboardStats({
            totalStudents: students?.length?.toString() || '0',
            activeExams: stats.activeExams.toString(),
            totalResults: stats.totalResults.toString(),
            totalViolations: stats.totalViolations.toString(),
            averageScore: stats.averageScore.toString(),
            passRate: stats.passRate.toString(),
            highPerformers: stats.highPerformers.toString(),
            needsImprovement: stats.needsImprovement.toString(),
            resultsChange: stats.resultsChange,
            violationsChange: stats.violationsChange,
            subjectPerformance: stats.subjectPerformance || [],
            performanceTrend: stats.performanceTrend || [],
            highestScores: stats.highestScores || [],
            classDistribution: stats.classDistribution || [],
            violationTypes: stats.violationTypes || [],
            streamTotals: stats.streamTotals || { natural: 0, social: 0, total: 0 },
            recentResults: stats.recentResults || [],
            recentViolations: stats.recentViolations || []
          });
        }

        setScheduledExams(scheduledExamsData);
        setProgrammes(programmesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Dash Data konnte nich abgeruft sein');
        const fallbackData = loadFallbackData();
        setDashboardStats(fallbackData.stats);
        setScheduledExams(fallbackData.scheduledExams);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [admin]);

  // Show welcome popup for all admins after login
  useEffect(() => {
    if (admin && (admin.role === 'overseer' || admin.username === 'ErgoZFood@elyonmain.app' || admin.username === 'HldanaZPresident@elyonmain.app' || admin.username === 'ZenaZPrestigious@elyonmain.app' || admin.username === 'Asnakew@elyonmain.app')) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 1000); // Show after 1 second for better UX
      return () => clearTimeout(timer);
    }
  }, [admin]);

  // Get personalized title based on admin
  const getAdminTitle = (admin: Admin | null) => {
    if (admin?.role === 'overseer') return 'School Director';
    switch (admin?.username) {
      case 'ErgoZFood@elyonmain.app':
        return 'Der Administrator des Systems';
      case 'HldanaZPresident@elyonmain.app':
        return 'President, Hldana';
      case 'ZenaZPrestigious@elyonmain.app':
        return 'English Department Head';
      case 'Asnakew@elyonmain.app':
        return 'Chemistry Department Head';
      default:
        return 'Administrator';
    }
  };

  const handleRecalculateGeographyResults = async () => {
    if (!confirm('Are you sure you want to recalculate all Geography 2018 exam results? This will update scores based on the corrected answer key.')) {
      return;
    }

    try {
      const result = await recalculateExamResults('geography-2018', geographyExam2018);
      if (result.success) {
        alert(`Successfully updated ${result.updated} exam results.`);
        // Refresh the dashboard data
        window.location.reload();
      } else {
        alert('Failed to recalculate results.');
      }
    } catch (error) {
      console.error('Error recalculating results:', error);
      alert('An error occurred while recalculating results.');
    }
  };

  const allStats = [
    { 
      label: 'Total Students', 
      value: dashboardStats.totalStudents, 
      icon: Users, 
      color: 'bg-info/10 text-info',
      change: '+5% from last month'
    },
    { 
      label: 'Active Exams', 
      value: dashboardStats.activeExams, 
      icon: BookOpen, 
      color: 'bg-success/10 text-success',
      change: '+2 from last month'
    },
    { 
      label: 'Average Score', 
      value: `${dashboardStats.averageScore}%`, 
      icon: Target, 
      color: 'bg-primary/10 text-primary',
      change: `${dashboardStats.resultsChange} from last month`
    },
    { 
      label: 'Pass Rate', 
      value: `${dashboardStats.passRate}%`, 
      icon: CheckCircle, 
      color: 'bg-emerald-500/10 text-emerald-600',
      change: '+3% from last month'
    },
    { 
      label: 'High Performers (90%+)', 
      value: dashboardStats.highPerformers, 
      icon: Award, 
      color: 'bg-amber-500/10 text-amber-600',
      change: '+8 from last week'
    },
    { 
      label: 'Needs Improvement (<60%)', 
      value: dashboardStats.needsImprovement, 
      icon: AlertTriangle, 
      color: 'bg-red-500/10 text-red-600',
      change: `${dashboardStats.violationsChange} from last month`
    },
    { 
      label: 'Total Results', 
      value: dashboardStats.totalResults, 
      icon: FileText, 
      color: 'bg-blue-500/10 text-blue-600',
      change: `${dashboardStats.resultsChange} from last month`
    },
    { 
      label: 'Violations', 
      value: dashboardStats.totalViolations, 
      icon: XCircle, 
      color: 'bg-destructive/10 text-destructive',
      change: `${dashboardStats.violationsChange} from last month`
    }
  ];

  // Filter stats based on admin role - overseers see all, others see only basic stats
  const stats = admin?.role === 'overseer' 
    ? allStats 
    : allStats.filter(stat => 
        stat.label === 'Total Students' || 
        stat.label === 'Active Exams' || 
        stat.label === 'Total Results' || 
        stat.label === 'Violations'
      );

  // Combine scheduled exams with programme exams that have scheduling info
  const allScheduledItems = [
    ...scheduledExams.map(exam => ({
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      scheduledDate: exam.scheduledDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      type: 'exam' as const
    })),
    ...programmes
      .filter(programme => programme.exam_date && programme.start_time && programme.end_time)
      .map(programme => ({
        id: programme.id,
        title: programme.name,
        subject: programme.name, // Use programme name instead of stream/grade format
        scheduledDate: programme.exam_date,
        startTime: programme.start_time,
        endTime: programme.end_time,
        type: 'programme' as const
      }))
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {admin?.role === 'overseer' 
                ? "Here's the complete overview of your school's performance today."
                : "Here's what's happening with your exams today."
              }
            </p>
          </div>
          {admin?.role === 'overseer' && (
            <div className="flex gap-3">
              <button
                onClick={handleRecalculateGeographyResults}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Recalculate Geography Results
              </button>
            </div>
          )}
          {isUsingFallback && (
            <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Using sample data
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comprehensive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 animate-slide-up hover:shadow-soft transition-shadow"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">
                  {isLoading ? '...' : stat.value}
                </p>
                {stat.change && (
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    stat.change.startsWith('+') ? 'text-success' : 
                    stat.change.startsWith('-') ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    <TrendingUp size={12} className={stat.change.startsWith('+') ? 'text-success' : stat.change.startsWith('-') ? 'text-destructive' : 'text-muted-foreground'} />
                    {stat.change}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional sections only for Overseers */}
      {admin?.role === 'overseer' && (
        <>

      {/* Subject Analysis & Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conditional: Highest Scores for Overseer, Performance Trends for others */}
        {admin?.role === 'overseer' ? (
          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Highest Scores</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Top performers by subject</span>
                <Trophy size={20} className="text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-4">
              {dashboardStats.highestScores.length > 0 ? (
                dashboardStats.highestScores.map((score, index) => (
                  <div key={`${score.student_name}-${score.exam_title}`} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{score.student_name}</p>
                        <p className="text-xs text-muted-foreground">{score.exam_title}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        score.subject === 'English' ? 'bg-blue-500/10 text-blue-600' :
                        score.subject === 'Chemistry' ? 'bg-green-500/10 text-green-600' :
                        score.subject === 'Mathematics' ? 'bg-purple-500/10 text-purple-600' :
                        score.subject === 'Physics' ? 'bg-orange-500/10 text-orange-600' :
                        score.subject === 'Biology' ? 'bg-teal-500/10 text-teal-600' :
                        'bg-gray-500/10 text-gray-600'
                      }`}>
                        {score.subject}
                      </span>
                      <span className="font-bold text-primary text-lg">{score.score_percentage}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No highest scores data available
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Performance Trends</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Based on Results Page data</span>
                <Activity size={20} className="text-muted-foreground" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardStats.performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {dashboardStats.performanceTrend.length > 0 && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">Top Performer Focus</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Trends calculated using high-performing student data from Results page
                </p>
              </div>
            )}
          </div>
        )}

        {/* Subject Performance Analysis */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Subject Performance</h2>
            <BarChart3 size={20} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {dashboardStats.subjectPerformance.map((subject, index) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{subject.subject}</span>
                  <span className="text-sm text-muted-foreground">{subject.avgScore}% avg</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.avgScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{subject.totalExams} exams</span>
                  <span>{subject.passRate}% pass rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Distribution & Stream Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Class Performance</h2>
            <Users size={20} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {dashboardStats.classDistribution.length > 0 ? (
              dashboardStats.classDistribution.map((item, index) => (
                <div key={`${item.class}-${item.stream}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">
                      {item.class} - {item.stream}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item.students} students</span>
                      <span className="text-sm font-medium text-primary">{item.avgScore}% avg</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        item.stream === 'Natural' ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.avgScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.stream} Science Stream</span>
                    <span>{item.avgScore}% performance</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No class distribution data available
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Natural Science</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Social Science</span>
            </div>
          </div>
        </div>

        {/* Stream Totals for Overseer */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Stream Totals</h2>
            <GraduationCap size={20} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {(() => {
              const naturalTotal = dashboardStats.streamTotals.natural;
              const socialTotal = dashboardStats.streamTotals.social;
              const totalStudents = dashboardStats.streamTotals.total;

              return (
                <>
                  {/* Natural Science Total */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Natural Science</p>
                        <p className="text-sm text-muted-foreground">STEM subjects focus</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-blue-600 dark:text-blue-400">{naturalTotal}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                  </div>

                  {/* Social Science Total */}
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Social Science</p>
                        <p className="text-sm text-muted-foreground">Humanities focus</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-green-600 dark:text-green-400">{socialTotal}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                  </div>

                  {/* Total Students */}
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Users size={20} className="text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Total Students</p>
                        <p className="text-sm text-muted-foreground">All streams combined</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-primary">{totalStudents}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </>)}
  

  {/* Scheduled Exams Section - Available for all admins */}
  {(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const currentWeekExams = allScheduledItems.filter(item => {
      if (!item.scheduledDate) return false;
      const examDate = new Date(item.scheduledDate);
      return examDate >= weekStart && examDate <= weekEnd;
    });

    return currentWeekExams.length > 0 && (
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 animate-slide-up shadow-lg" style={{ animationDelay: '800ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Clock size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Scheduled Exams</h2>
              <p className="text-sm text-muted-foreground">Weekly examination schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">
              {currentWeekExams.length} exams scheduled this week
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {(() => {
            // Calculate the current week dates (Monday to Sunday)
            const now = new Date();
            const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Calculate start of week (Monday)
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // If Sunday, go back 6 days, else go back to Monday
            weekStart.setHours(0, 0, 0, 0);

            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => {
              // Calculate the specific date for this day of the week
              const dayDate = new Date(weekStart);
              dayDate.setDate(weekStart.getDate() + dayIndex);

              const dayExams = allScheduledItems.filter(item => {
                if (!item.scheduledDate) return false;
                const examDate = new Date(item.scheduledDate);
                // Compare year, month, and day
                return examDate.getFullYear() === dayDate.getFullYear() &&
                       examDate.getMonth() === dayDate.getMonth() &&
                       examDate.getDate() === dayDate.getDate();
              });

                return (
                  <div 
                    key={day} 
                    className="bg-green-50 border-2 border-green-200 rounded-xl p-4 min-h-[200px] cursor-pointer hover:bg-green-100 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedDayExams(dayExams);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-green-800 text-lg">{day}</h3>
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{dayExams.length}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {dayExams.length > 0 ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <BookOpen size={16} className="text-white" />
                          </div>
                          <p className="text-sm font-semibold text-green-800">EXAM</p>
                          <p className="text-xs text-green-600 mt-1">Click to view details</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-20 text-center">
                          <div className="w-6 h-6 bg-green-200 rounded flex items-center justify-center mb-1">
                            <Clock size={12} className="text-green-600" />
                          </div>
                          <p className="text-xs text-green-600 font-medium">No exams</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
            });
          })()}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total scheduled examinations this week</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="font-bold text-primary">{currentWeekExams.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  })()}

      {/* Recent Activity Feeds - Available for all admins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results with Status */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Recent Results</h2>
            <TrendingUp size={20} className="text-muted-foreground" />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardStats.recentResults?.length > 0 ? (
              dashboardStats.recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{result.student_name}</p>
                    <p className="text-xs text-muted-foreground">{result.exam_title}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'passed' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {result.status}
                    </span>
                    <span className="font-semibold text-foreground">{result.score_percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isLoading ? 'Loading...' : 'No recent results found'}
              </p>
            )}
          </div>
        </div>

        {/* Enhanced Recent Violations */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Recent Violations</h2>
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardStats.recentViolations?.length > 0 ? (
              dashboardStats.recentViolations.map((violation) => (
                <div key={violation.id} className="flex items-start p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <div className={`p-1.5 rounded-lg mr-3 ${
                    violation.severity === 'high' ? 'bg-red-500/10' : 'bg-orange-500/10'
                  }`}>
                    <AlertTriangle size={16} className={violation.severity === 'high' ? 'text-red-500' : 'text-orange-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{violation.student_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {violation.type.replace(/_/g, ' ')} • {violation.exam_title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(violation.timestamp).toLocaleDateString()} at {new Date(violation.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    violation.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {violation.severity}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isLoading ? 'Loading...' : 'No recent violations found'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Exam Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-800">{selectedDay} - Exam Schedule</h2>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setSelectedDayExams([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedDayExams.length > 0 ? (
                selectedDayExams.map((exam, index) => (
                  <div key={exam.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800 text-sm">{exam.title}</h3>
                        <p className="text-xs text-green-600 mt-1">{exam.subject}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-green-600" />
                            <span className="text-xs text-green-700">
                              {exam.startTime && exam.endTime ? `${(() => {
                                const formatTime = (timeStr: string) => {
                                  if (!timeStr) return 'TBD';
                                  const [hours, minutes] = timeStr.split(':');
                                  const hour = parseInt(hours);
                                  const ampm = hour >= 12 ? 'PM' : 'AM';
                                  const displayHour = hour % 12 || 12;
                                  return `${displayHour}:${minutes} ${ampm}`;
                                };
                                return `${formatTime(exam.startTime)} - ${formatTime(exam.endTime)}`;
                              })()}` : 'Time TBD'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: {exam.type === 'exam' ? 'Examination' : 'Programme'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No exams scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
