import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineAuth } from '@/contexts/OfflineAuthContext';
import Header from '@/components/Header';
import ExamCard from '@/components/ExamCard';
import { Button } from '@/components/ui/button';
import { exams as baseExams } from '@/data/exams';
import { BookOpen, Trophy, Clock, Atom, Users, GraduationCap, LogOut } from 'lucide-react';
import { getOfflineExamLoader } from '@/lib/offline-exam-loader';
import { getOfflineDatabase } from '@/lib/offline-db';
import { isOfflineMode } from '@/lib/offline-mode';

// Dynamic imports for online-only functionality
const loadOnlineDependencies = async () => {
  if (!isOfflineMode()) {
    const module = await import('@/lib/supabase');
    return {
      loadExamAdminChanges: module.loadExamAdminChanges,
      fetchScheduledExams: module.fetchScheduledExams,
      fetchProgrammes: module.fetchProgrammes,
      loadExamsFromStorage: module.loadExamsFromStorage,
      checkStudentExamAccess: module.checkStudentExamAccess,
    };
  }
  return null;
};

// Helper function to get current week's start date (Monday)
const getCurrentWeekStart = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

// Helper function to calculate exam status based on current time
const getExamStatus = (exam: any, hasAdminOverride = false) => {
  // If admin has explicitly set a status, respect it
  if (hasAdminOverride && exam.status && exam.status !== 'upcoming') {
    return exam.status;
  }
  
  const now = new Date();
  const scheduledStart = new Date(`${exam.scheduledDate}T${exam.startTime || '00:00'}:00`);
  const scheduledEnd = new Date(`${exam.scheduledDate}T${exam.endTime || '23:59'}:00`);
  if (now < scheduledStart) return 'scheduled';
  if (now >= scheduledStart && now <= scheduledEnd) return 'ongoing';
  return 'completed';
};

// Helper function to load exams with admin changes applied
const loadExamsWithAdminChanges = async () => {
  try {
    // In offline mode, use local database
    if (isOfflineMode()) {
      const examLoader = await getOfflineExamLoader();
      return await examLoader.loadAllExams();
    }
    
    // In online mode, load exams from Supabase Storage
    const onlineDeps = await loadOnlineDependencies();
    if (!onlineDeps) return [];
    let exams = await onlineDeps.loadExamsFromStorage();
    
    // Load persisted admin changes from Supabase
    const persistedChanges = await onlineDeps.loadExamAdminChanges();
    
    // First apply admin changes
    let updatedExams = exams.map(exam => {
      const change = persistedChanges[exam.id];
      if (change) {
        const updatedExam = { ...exam, ...change };
        // Apply editableTitle if it exists
        if (change.editableTitle) {
          updatedExam.title = change.editableTitle;
        }
        // Recalculate status based on current time, but respect admin override
        updatedExam.status = getExamStatus(updatedExam, true);
        return updatedExam;
      }
      const updatedExam = { ...exam };
      updatedExam.status = getExamStatus(updatedExam, false);
      return updatedExam;
    });

    // Generate automatic names for exams without custom titles
    const subjectCountMap: Record<string, number> = {};
    updatedExams = updatedExams.map(exam => {
      const hasCustomTitle = persistedChanges[exam.id]?.editableTitle;
      if (!hasCustomTitle) {
        // Only auto-name if there's no custom title
        subjectCountMap[exam.subject] = (subjectCountMap[exam.subject] || 0) + 1;
        const count = subjectCountMap[exam.subject];
        return {
          ...exam,
          title: `${exam.subject} - ${count}`
        };
      }
      return exam;
    });

    return updatedExams;
  } catch (error) {
    console.error('Failed to load exams from storage, falling back to local:', error);
    // Fallback to local exams if storage fails
    const onlineDeps = await loadOnlineDependencies();
    const persistedChanges = onlineDeps ? await onlineDeps.loadExamAdminChanges() : {};
    
    let updatedExams = baseExams.map(exam => {
      const change = persistedChanges[exam.id];
      if (change) {
        const updatedExam = { ...exam, ...change };
        if (change.editableTitle) {
          updatedExam.title = change.editableTitle;
        }
        updatedExam.status = getExamStatus(updatedExam, true);
        return updatedExam;
      }
      const updatedExam = { ...exam };
      updatedExam.status = getExamStatus(updatedExam, false);
      return updatedExam;
    });

    // Generate automatic names for exams without custom titles
    const subjectCountMap: Record<string, number> = {};
    updatedExams = updatedExams.map(exam => {
      const hasCustomTitle = persistedChanges[exam.id]?.editableTitle;
      if (!hasCustomTitle) {
        subjectCountMap[exam.subject] = (subjectCountMap[exam.subject] || 0) + 1;
        const count = subjectCountMap[exam.subject];
        return {
          ...exam,
          title: `${exam.subject} - ${count}`
        };
      }
      return exam;
    });

    return updatedExams;
  }
};

const Dashboard = () => {
  const { isAuthenticated, student, isLoading, logout } = useAuth();
  const offlineAuth = useOfflineAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (isOfflineMode()) {
      offlineAuth.logout();
    } else {
      logout();
    }
    navigate('/login');
  };

  // Get exams with admin changes applied - must be before any conditional returns
  const [examsWithChanges, setExamsWithChanges] = useState([]);

  // Add state for schedule modal
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDayExams, setSelectedDayExams] = useState<any[]>([]);

  // Add state for scheduled exams from DB
  const [scheduledExams, setScheduledExams] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [accessibleExamIds, setAccessibleExamIds] = useState<Set<string>>(new Set());

  // Load exams on component mount
  useEffect(() => {
    const initializeExams = async () => {
      if (isOfflineMode()) {
        // Load exams from local database
        const examLoader = await getOfflineExamLoader();
        const examsData = await examLoader.loadAllExams();
        setExamsWithChanges(examsData);
        
        // Load exam access from local database
        const effectiveStudentId = offlineAuth.student?.student_id || offlineAuth.student?.id || student?.id;
        if (effectiveStudentId) {
          const db = await getOfflineDatabase();
          const accessibleIds = await db.getStudentAccessibleExams(effectiveStudentId);
          console.log('Accessible exam IDs for student:', effectiveStudentId, accessibleIds);
          if (accessibleIds && accessibleIds.length > 0) {
            setAccessibleExamIds(new Set(accessibleIds));
          } else {
            console.log('No access configured, showing all exams');
            setAccessibleExamIds(new Set(examsData.map(e => e.id)));
          }
        } else {
          console.log('No student ID found, showing all exams');
          setAccessibleExamIds(new Set(examsData.map(e => e.id)));
        }
      } else {
        // Load exams from Supabase
        const onlineDeps = await loadOnlineDependencies();
        if (onlineDeps) {
          const [examsData, scheduledData, programmesData] = await Promise.all([
            loadExamsWithAdminChanges(),
            onlineDeps.fetchScheduledExams(),
            onlineDeps.fetchProgrammes()
          ]);
          setExamsWithChanges(examsData);
          setScheduledExams(scheduledData);
          setProgrammes(programmesData);
        }
      }
    };
    initializeExams();
  }, [student?.id, offlineAuth.student?.student_id, offlineAuth.student?.id]);

  // Check exam access permissions (online mode only)
  useEffect(() => {
    const checkExamAccess = async () => {
      if (!student?.id || isOfflineMode()) return;

      try {
        const onlineDeps = await loadOnlineDependencies();
        if (!onlineDeps) return;

        const accessibleIds = new Set<string>();

        // Check access for each exam concurrently
        const accessPromises = examsWithChanges.map(exam =>
          onlineDeps.checkStudentExamAccess(student.id, exam.id)
        );

        const accessResults = await Promise.all(accessPromises);

        accessResults.forEach((hasAccess, index) => {
          if (hasAccess) {
            accessibleIds.add(examsWithChanges[index].id);
          }
        });

        setAccessibleExamIds(accessibleIds);
      } catch (error) {
        console.error('Error checking exam access:', error);
        // On error, allow access to all exams (fallback)
        const allExamIds = new Set(examsWithChanges.map(exam => exam.id));
        setAccessibleExamIds(allExamIds);
      }
    };

    if (examsWithChanges.length > 0 && !isOfflineMode()) {
      checkExamAccess();
    }
  }, [student?.id, examsWithChanges]);

  useEffect(() => {
    // Initialize analytics (skip in offline mode)
    if (!isOfflineMode()) {
      import('@/utils/analytics').then(({ default: trackEvent }) => {
        trackEvent('page_view', { page: 'Dashboard' });
      });
    }

    // Redirect if not authenticated
    const isAuth = isOfflineMode() ? offlineAuth.isAuthenticated : isAuthenticated;
    if (!isAuth) {
      navigate('/');
    }
  }, [isAuthenticated, offlineAuth.isAuthenticated, navigate]);

  // Sync admin changes every 5 seconds for more responsive updates (online mode only)
  useEffect(() => {
    if (isOfflineMode()) return; // Skip sync in offline mode

    const syncAdminChanges = async () => {
      const updatedExams = await loadExamsWithAdminChanges();
      console.log('Dashboard syncing admin changes:', updatedExams.map(e => ({ id: e.id, status: e.status })));
      setExamsWithChanges(updatedExams);
    };

    const syncScheduledExams = async () => {
      const onlineDeps = await loadOnlineDependencies();
      if (onlineDeps) {
        const updatedScheduled = await onlineDeps.fetchScheduledExams();
        setScheduledExams(updatedScheduled);
      }
    };

    const syncProgrammes = async () => {
      const onlineDeps = await loadOnlineDependencies();
      if (onlineDeps) {
        const updatedProgrammes = await onlineDeps.fetchProgrammes();
        setProgrammes(updatedProgrammes);
      }
    };

    const syncExamAccess = async () => {
      if (!student?.id) return;

      try {
        const onlineDeps = await loadOnlineDependencies();
        if (!onlineDeps) return;

        const accessibleIds = new Set<string>();
        const accessPromises = examsWithChanges.map(exam =>
          onlineDeps.checkStudentExamAccess(student.id, exam.id)
        );
        const accessResults = await Promise.all(accessPromises);

        accessResults.forEach((hasAccess, index) => {
          if (hasAccess) {
            accessibleIds.add(examsWithChanges[index].id);
          }
        });

        setAccessibleExamIds(accessibleIds);
      } catch (error) {
        console.error('Error syncing exam access:', error);
      }
    };

    // Check for updates every 1 second for real-time sync
    const interval = setInterval(() => {
      syncAdminChanges();
      syncScheduledExams();
      syncProgrammes();
      syncExamAccess();
    }, 1000);

    return () => clearInterval(interval);
  }, [student?.id, examsWithChanges]);

  if (isLoading || (isOfflineMode() && offlineAuth.loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAuth = isOfflineMode() ? offlineAuth.isAuthenticated : isAuthenticated;
  const currentStudent = isOfflineMode() ? offlineAuth.student : student;

  if (!isAuth || !currentStudent) {
    return null;
  }

  // Get student's stream accurately for offline vs online
  const rawStream = (currentStudent as any)?.stream || ((currentStudent as any)?.class?.toLowerCase().includes('natural') ? 'natural' : (currentStudent as any)?.class?.toLowerCase().includes('both') ? 'both' : 'social');
  const studentStream = typeof rawStream === 'string' ? rawStream.toLowerCase() : 'natural';
  
  // Filter exams for each stream and by access permissions
  const filterExamsByStream = (stream: string) => {
    return examsWithChanges.filter(exam => {
      // Check if exam is in the accessible list
      if (accessibleExamIds.size > 0 && !accessibleExamIds.has(exam.id)) {
        return false;
      }

      // Show exams that match the stream or are for both
      const examStream = (exam.stream || 'both').toLowerCase();
      return stream === 'both' || examStream === 'both' || examStream === stream;
    });
  };

  // Get exams for each stream
  const socialExams = filterExamsByStream('social');
  const naturalExams = filterExamsByStream('natural');

  // Show ongoing, active, or inactive exams (inactive will show "Time is Up")
  // Disabled exams are hidden
  const socialOngoing = socialExams.filter(e => e.status !== 'disabled' && (e.status === 'ongoing' || e.status === 'active' || e.status === 'inactive' || e.status === 'scheduled') && accessibleExamIds.has(e.id));
  const naturalOngoing = naturalExams.filter(e => e.status !== 'disabled' && (e.status === 'ongoing' || e.status === 'active' || e.status === 'inactive' || e.status === 'scheduled') && accessibleExamIds.has(e.id));

  // Total exams count (excluding disabled)
  const totalExams = examsWithChanges.filter(e => e.status !== 'disabled').length;

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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Welcome back, {currentStudent?.name?.split(' ')[0] || 'Student'}!
            </h2>
            <p className="text-muted-foreground mt-1">Ready to take your exams? Your upcoming assessments are listed below.</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 self-start sm:self-auto border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>

        {/* Exam Schedule Section */}
        {(() => {
          const scheduledExams = allScheduledItems.filter(item => item.scheduledDate);

          return scheduledExams.length > 0 && (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-10 animate-slide-up shadow-lg" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Clock size={20} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">Scheduled Exams</h2>
                    <p className="text-sm text-muted-foreground">Weekly examination schedule</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-primary">
                    {scheduledExams.length} exams scheduled
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                {(() => {
                  const weekStart = getCurrentWeekStart();

                  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => {
                    const dayDate = new Date(weekStart);
                    dayDate.setDate(weekStart.getDate() + dayIndex);

                    const dayExams = scheduledExams.filter(item => {
                      if (!item.scheduledDate) return false;
                      const examDate = new Date(item.scheduledDate);
                      return examDate.getFullYear() === dayDate.getFullYear() &&
                             examDate.getMonth() === dayDate.getMonth() &&
                             examDate.getDate() === dayDate.getDate();
                    });

                      return (
                        <div
                          key={day}
                          className="rounded-xl p-4 min-h-[150px] cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                          style={{ backgroundColor: '#FFFACD', border: '2px solid #F4D03F' }}
                          onClick={() => {
                            setSelectedDay(day);
                            setSelectedDayExams(dayExams);
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-base" style={{ color: '#8B6914' }}>{day}</h3>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8B6914' }}>
                              <span className="text-xs font-bold text-white">{dayExams.length}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {dayExams.length > 0 ? (
                              <div className="text-center py-4">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#8B6914' }}>
                                  <BookOpen size={14} className="text-white" />
                                </div>
                                <p className="text-sm font-semibold" style={{ color: '#8B6914' }}>EXAM</p>
                                <p className="text-xs mt-1" style={{ color: '#C5A028' }}>Click to view</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-16 text-center">
                                <div className="w-5 h-5 rounded flex items-center justify-center mb-1" style={{ backgroundColor: '#F4D03F' }}>
                                  <Clock size={10} style={{ color: '#C5A028' }} />
                                </div>
                                <p className="text-xs font-medium" style={{ color: '#C5A028' }}>No exams</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                  });
                })()}
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total scheduled examinations</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="font-bold text-primary">{scheduledExams.length}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center gap-4 animate-slide-up shadow-md" style={{ animationDelay: '100ms' }}>
            <div className="p-3 bg-primary-foreground/10 rounded-xl">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{totalExams}</p>
              <p className="text-sm text-primary-foreground/80">Total Science Exams</p>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center gap-4 animate-slide-up shadow-md" style={{ animationDelay: '200ms' }}>
            <div className="p-3 bg-primary-foreground/10 rounded-xl">
              <Clock className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {studentStream === 'natural' ? naturalOngoing.length : socialOngoing.length}
              </p>
              <p className="text-sm text-primary-foreground/80">Available Now</p>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center gap-4 animate-slide-up shadow-md" style={{ animationDelay: '300ms' }}>
            <div className="p-3 bg-primary-foreground/10 rounded-xl">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">0</p>
              <p className="text-sm text-primary-foreground/80">Upcoming</p>
            </div>
          </div>
        </div>

        {/* Stream-specific Exams */}
        <section className="mb-10 p-6 rounded-xl" style={{ backgroundColor: '#FFFACD' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#F4D03F' }}>
              {studentStream === 'natural' ? (
                <Atom className="h-5 w-5" style={{ color: '#8B6914' }} />
              ) : (
                <Users className="h-5 w-5" style={{ color: '#8B6914' }} />
              )}
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground">
              {studentStream === 'natural' ? 'Natural Science' : 'Social Science'} Exams
            </h3>
          </div>

          {studentStream === 'natural' ? (
            naturalOngoing.length > 0 ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
                  <h4 className="text-md font-medium text-foreground/90">Available Now</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {naturalOngoing.map((exam, index) => (
                    <ExamCard key={exam.id} exam={exam} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No exam available</p>
              </div>
            )
          ) : (
            socialOngoing.length > 0 ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
                  <h4 className="text-md font-medium text-foreground/90">Available Now</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {socialOngoing.map((exam, index) => (
                    <ExamCard key={exam.id} exam={exam} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No exam available</p>
              </div>
            )
          )}

        </section>
      </main>

      {/* Exam Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#8B6914' }}>{selectedDay} - Exam Schedule</h2>
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
                  <div key={exam.id} className="rounded-lg p-4" style={{ backgroundColor: '#FFFACD', border: '1px solid #F4D03F' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8B6914' }}>
                        <BookOpen size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm" style={{ color: '#8B6914' }}>{exam.title}</h3>
                        <p className="text-xs mt-1" style={{ color: '#C5A028' }}>{exam.subject}</p>
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
                          Type: Examination
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

export default Dashboard;
