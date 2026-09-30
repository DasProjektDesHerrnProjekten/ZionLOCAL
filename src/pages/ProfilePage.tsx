import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, BookOpen, Hash, GraduationCap, Info, LogOut, TrendingUp, Calendar, Clock, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { exams } from '@/data/exams';
import { getStudentExamResults, supabase } from '@/lib/supabase';
import { isOfflineMode } from '@/lib/offline-mode';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { student, logout } = useAuth();
  const [latestApk, setLatestApk] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  const [showSemesterPopup, setShowSemesterPopup] = useState(false);
  const [showApkPopup, setShowApkPopup] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!student) {
      navigate('/login');
    }
  }, [student, navigate]);

  // Fetch latest APK file
  useEffect(() => {
    const fetchLatestApk = async () => {
      try {
        const { data: files, error } = await supabase.storage
          .from('elyonplus-uploads')
          .list('', {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (!error && files && files.length > 0) {
          const latestFile = files.find(file => file.name.endsWith('.apk'));
          if (latestFile) {
            const { data: urlData } = supabase.storage
              .from('elyonplus-uploads')
              .getPublicUrl(latestFile.name);

            setLatestApk({
              name: latestFile.name,
              url: urlData.publicUrl
            });
          }
        }
      } catch (error) {
        console.error('Error fetching latest APK:', error);
      }
    };

    fetchLatestApk();
  }, []);

  // Fetch app version
  useEffect(() => {
    if (isOfflineMode()) return; // Skip in offline mode

    const fetchVersion = async () => {
      try {
        const { getAppVersion } = await import('@/lib/supabase');
        const version = await getAppVersion();
        setAppVersion(version);
      } catch (error) {
        console.error('Error fetching app version:', error);
        // Keep default version
      }
    };

    fetchVersion();
  }, []);

  const handleApkDownload = async () => {
    if (!latestApk) {
      setShowApkPopup(true);
      return;
    }

    setIsDownloadingApk(true);

    try {
      // Simulate download progress (in a real app, you'd track actual download progress)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = latestApk.url;
      link.download = latestApk.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloadingApk(false);
    }
  };

  const handleSemesterGrade = () => {
    setShowSemesterPopup(true);
  };

  const fetchExamResults = async () => {
    if (!student?.admission_id) return;

    try {
      const results = await getStudentExamResults(student.admission_id);
      setExamResults(results || []);
      setResultsExpanded(true);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      
      // Handle CORS or network errors gracefully
      if (error.message?.includes('CORS') || error.message?.includes('NetworkError')) {
        console.warn('CORS or network error - showing no results available');
        setExamResults([]);
        setResultsExpanded(true);
        return;
      }
      
      // For other errors, still show empty results
      setExamResults([]);
      setResultsExpanded(true);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds && seconds !== 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Get maximum score for subject-specific grading
  const getMaxScoreForSubject = (subject: string): number => {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('chemistry')) return 10;
    if (subjectLower.includes('english')) return 4;
    return 10; // Default to 10 for other subjects
  };

  // Get student's stream
  const studentStream = student?.class?.toLowerCase().includes('natural') ? 'Natural' : 'Social';
  
  // Total exams count - dynamically calculated
  const totalExams = exams.length;

  // Show loading state while checking authentication
  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                VERSION 2.0.0
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Zionian Examination v2.0.0 - Excellence in Learning
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="p-8 text-white" style={{ backgroundColor: '#8B6914' }}>
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
                  <UserIcon className="h-16 w-16 text-white/80" />
                </div>
                <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-white" style={{ backgroundColor: '#F4D03F' }}></div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white">{student.name}</h2>
                <p className="text-white/90 mt-1">Student • {studentStream} Science</p>
                <p className="text-white/90">{student.class} - {student.section}</p>
                <div className="mt-4 p-3 bg-white/10 rounded-lg inline-block">
                  <p className="text-white font-medium">{totalExams} Total Science Exams</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-700 mr-2" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission ID</p>
                    <p className="font-mono font-medium text-gray-900">{student.admission_id}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 text-gray-700 mr-2" />
                  Academic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Class & Section</p>
                    <p className="font-medium text-gray-900">{student.class} - {student.section}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-medium text-gray-900">{student.roll_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exam Results & Grades */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Results & Semester Grade</h3>
              
              {/* Results Button */}
              <div className="rounded-xl shadow overflow-hidden mb-4" style={{ background: 'linear-gradient(to right, #8B6914, #F4D03F)' }}>
                <button
                  onClick={fetchExamResults}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/10 transition-colors"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-white mr-3" />
                    <span className="text-white">
                      Show Your Exam Results
                    </span>
                  </div>
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Exam Results Display */}
              {resultsExpanded && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" style={{ color: '#8B6914' }} />
                    Your Exam Results
                  </h4>
                  
                  {examResults.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Not Available</p>
                      <p className="text-sm text-gray-500 mt-1">Results cannot be loaded at this time. Please check your connection or contact support.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {examResults.map((result, index) => (
                        <div 
                          key={result.id || index} 
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                          onClick={() => navigate(`/exam/${result.exam_id}/results/${result.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-gray-900">{result.exam_title}</h5>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(result.submitted_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDuration(result.time_spent)} taken</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold" style={{ color: '#8B6914' }}>
                                {Math.round(result.score_percentage)}%
                              </div>
                              <div className="text-sm text-gray-600">
                                {result.correct_answers}/{result.total_questions} correct
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ width: `${result.score_percentage}%`, backgroundColor: '#F4D03F' }}
                            />
                          </div>
                          
                          {/* Score Breakdown */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Score:</span>
                              <span className="font-medium text-gray-900 ml-1">
                                {result.correct_answers}/{result.total_questions}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Subject Score:</span>
                              <span className="font-medium text-gray-900 ml-1">
                                {(() => {
                                  const maxScore = getMaxScoreForSubject(result.exam_title);
                                  const scaledScore = (result.correct_answers / result.total_questions * maxScore).toFixed(1);
                                  return `${scaledScore}/${maxScore}`;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ELYONPLUS Download */}
              <div className="border-t border-white/20">
                <button
                  onClick={handleApkDownload}
                  disabled={isDownloadingApk}
                  className="w-full px-6 py-4 flex items-center justify-between transition-colors disabled:opacity-50"
                  style={{ background: 'linear-gradient(to right, #8B6914, #F4D03F)' }}
                >
                  <div className="flex items-center">
                    {isDownloadingApk ? (
                      <Loader2 className="h-5 w-5 text-white mr-3 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 text-white mr-3" />
                    )}
                    <span className="text-white font-medium">
                      {isDownloadingApk ? 'Downloading ELYONPLUS...' : 'Download NEW ELYONPLUS'}
                    </span>
                  </div>
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>

              <div className="border-t border-white/20">
                <button
                  onClick={handleSemesterGrade}
                  disabled
                  className="w-full px-6 py-4 flex items-center justify-between cursor-not-allowed"
                  style={{ background: 'linear-gradient(to right, #8B6914, #F4D03F)' }}
                >
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-white mr-3" />
                    <span className="text-white font-medium">Semester Grade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white bg-white/20 px-2 py-1 rounded-full">Coming Soon</span>
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-gray-700" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Need help?</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>For any changes to your profile information, please contact the school administration.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Version Information */}
            <div className="mt-6 relative overflow-hidden rounded-2xl p-8 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #8B6914/10, #F4D03F/5)', border: '2px solid #C5A028' }}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 w-20 h-20 rounded-full blur-xl" style={{ backgroundColor: '#8B6914' }}></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full blur-lg" style={{ backgroundColor: '#F4D03F' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full blur-md" style={{ backgroundColor: '#C5A028' }}></div>
              </div>

              <div className="relative z-10 text-center">
                {/* Header with Icon */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #8B6914, #F4D03F)' }}>
                      <span className="text-white font-black text-lg">v</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: '#F4D03F' }}></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Application Version</h3>
                    <div className="h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, #8B6914, #F4D03F)' }}></div>
                  </div>
                </div>

                {/* Version Number */}
                <div className="mb-3">
                  <span className="inline-block px-6 py-3 text-white text-3xl font-black rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-200" style={{ background: 'linear-gradient(to right, #8B6914, #F4D03F)' }}>
                    2.0.0
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-lg font-semibold text-gray-700 mb-2">Zionian Examination System</p>
                <p className="text-sm text-gray-600 mb-4">Advanced Learning Management Platform</p>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: '#8B6914/10', color: '#8B6914', borderColor: '#C5A028' }}>
                    📚 Smart Assessment
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: '#F4D03F/10', color: '#C5A028', borderColor: '#E4C030' }}>
                    📊 Real-time Analytics
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: '#8B6914/10', color: '#8B6914', borderColor: '#C5A028' }}>
                    🔒 Secure Platform
                  </span>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t" style={{ borderColor: '#C5A028' }}>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Excellence in Learning
                  </p>
                  <p className="text-xs text-gray-600">
                    Powered by <span className="font-semibold" style={{ color: '#8B6914' }}>Zionian Technologies</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Semester Grade Coming Soon Popup */}
      <AlertDialog open={showSemesterPopup} onOpenChange={setShowSemesterPopup}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Semester Grade Feature
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              The Semester Grade feature is currently under development and will be available soon. 
              This feature will provide a comprehensive overview of your academic performance across all subjects for the semester.
              <br /><br />
              <strong>What to expect:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Combined grade calculation from all exams</li>
                <li>Subject-wise performance breakdown</li>
                <li>Progress tracking and recommendations</li>
                <li>Certificate generation</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* APK Not Available Popup */}
      <AlertDialog open={showApkPopup} onOpenChange={setShowApkPopup}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-600" />
              ELYONPLUS App Not Available
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              The ELYONPLUS mobile application is not currently available for download. 
              This might be due to:
              <br /><br />
              <strong>Possible reasons:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The app is being updated with new features</li>
                <li>Technical maintenance is in progress</li>
                <li>The app is temporarily unavailable</li>
              </ul>
              <br />
              Please check back later or contact your administrator for more information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-orange-600 hover:bg-orange-700">
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
