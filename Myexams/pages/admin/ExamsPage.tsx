import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, AlertCircle, Loader2, Play, Pause, Power, Ban, Calendar, Clock, Lock } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { saveExamAdminChanges, loadExamAdminChanges, testExamAdminChangesTable } from '@/lib/supabase';

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'inactive' | 'active' | 'disabled' | 'scheduled';
  scheduledDate: string;
  password?: string;
  startTime?: string;
  endTime?: string;
  lastUpdated?: number;
}

const ExamsPage = () => {
  useDocumentTitle('Manage Exams');
  const { admin } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load base mock data
        let mockExams: Exam[] = [
          {
            id: 'english-euee-2018',
            title: 'MESKAYE ONLINE EXAM 2018 MODEL-1 ENGLISH',
            subject: 'English',
            duration: 120,
            totalQuestions: 120,
            status: 'active',
            scheduledDate: new Date().toISOString().split('T')[0], // Today's date for testing
            password: 'ENGLISH2025',
            startTime: '06:00',
            endTime: '08:00'
          },
          {
            id: 'chemistry-2018-natural',
            title: 'MESKAYE ONLINE EXAM 2018 MODEL-1 CHEMISTRY',
            subject: 'Chemistry',
            duration: 120,
            totalQuestions: 70,
            status: 'inactive',
            scheduledDate: '2025-06-16',
            password: 'CHEM2025',
            startTime: '10:00',
            endTime: '11:30'
          },
          {
            id: 'economics-2018',
            title: 'Economics Model Exam Questions for Grade 12th Students in 2018/2026 Academic Year.',
            subject: 'Economics',
            duration: 120,
            totalQuestions: 100,
            status: 'ongoing',
            scheduledDate: '2026-02-21',
            password: 'ECON2025',
            startTime: '09:00',
            endTime: '11:00'
          },
          {
            id: 'physics-miskaye-hizunan-2024',
            title: 'Physics Exam Miskaye Hizunan Medhane Alem Monastery School Grade 12 Physics Mock Examination',
            subject: 'Physics',
            duration: 120,
            totalQuestions: 50,
            status: 'active',
            scheduledDate: new Date().toISOString().split('T')[0], // Today's date for testing
            password: 'PHYSICS2025',
            startTime: '14:00',
            endTime: '16:00'
          },
          {
            id: 'geography-2018',
            title: 'MESKAYE ONLINE EXAM 2018 MODEL GEOGRAPHY',
            subject: 'Geography',
            duration: 120,
            totalQuestions: 100,
            status: 'ongoing',
            scheduledDate: '2026-02-27',
            password: 'GEO2018',
            startTime: '09:00',
            endTime: '11:00'
          },
          {
            id: 'history-2018',
            title: 'Meskaye Hizunan Medhane Alem Monastery School 2018 E.C 2nd Semester history Model Test for Grade 12',
            subject: 'History',
            duration: 120,
            totalQuestions: 100,
            status: 'ongoing',
            scheduledDate: '2026-02-27',
            password: 'HIST2018',
            startTime: '09:00',
            endTime: '11:00'
          },
          {
            id: 'sat-2018',
            title: '2018 EC MESKAYE HIZUNAN MEDHANE ALEM MONASTERY SCHOOL Scholastic Aptitude Test (SAT)- For Grade 12',
            subject: 'SAT',
            duration: 60,
            totalQuestions: 35,
            status: 'ongoing',
            scheduledDate: '2026-02-27',
            password: 'SAT2018',
            startTime: '10:00',
            endTime: '11:00'
          },
          {
            id: 'math-2018',
            title: 'GRADE 12 MATHEMATICS (FOR SOCIAL SCIENCE) MODEL EXAMINATIONS 2016E.C/ 2024G.C',
            subject: 'Mathematics',
            duration: 180,
            totalQuestions: 65,
            status: 'ongoing',
            scheduledDate: '2026-02-27',
            password: 'MATH2018',
            startTime: '09:00',
            endTime: '12:00'
          },
          {
            id: 'biology-2018-grade12',
            title: 'MESKAYE HIZUNAN MEDANIALEM MONASTERY SCHOOL 2018/APRIL 2026 SECOND SEMESTER BIOLOGY MODEL EXAMINATION FOR GRADE 12',
            subject: 'Biology',
            duration: 120,
            totalQuestions: 100,
            status: 'ongoing',
            scheduledDate: '2026-04-01',
            password: 'BIO2026',
            startTime: '09:00',
            endTime: '11:00'
          }
        ];

        const getExamStatus = (exam: Exam): Exam['status'] => {
          const now = new Date();
          const scheduledStart = new Date(`${exam.scheduledDate}T${exam.startTime}:00`);
          const scheduledEnd = new Date(`${exam.scheduledDate}T${exam.endTime}:00`);
          if (now < scheduledStart) return 'scheduled';
          if (now >= scheduledStart && now <= scheduledEnd) return 'ongoing';
          return 'completed';
        };

        mockExams = mockExams.map(exam => ({ ...exam, status: getExamStatus(exam) }));

        // Load persisted admin changes from Supabase
        const persistedChanges = await loadExamAdminChanges();
        if (Object.keys(persistedChanges).length > 0) {
          const updatedExams = mockExams.map(exam => {
            const change = persistedChanges[exam.id];
            if (change) {
              return { ...exam, ...change };
            }
            return exam;
          });
          setExams(updatedExams);
        } else {
          setExams(mockExams);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
        setError('Failed to load exams.');
      } finally {
        setIsLoading(false);
      }
    };

    loadExams();

    // Add global test function for debugging
    (window as any).testSupabaseTable = testExamAdminChangesTable;
    (window as any).loadExamChanges = loadExamAdminChanges;
    (window as any).saveExamChanges = saveExamAdminChanges;
  }, []);

  const persistExamChanges = async (examId: string, changes: Partial<Exam>) => {
    try {
      const changesObj = { [examId]: changes };
      await saveExamAdminChanges(changesObj);
    } catch (error) {
      console.error('Failed to persist exam changes:', error);
      // Fallback to localStorage if Supabase fails
      const persistedChanges = localStorage.getItem('examAdminChanges') || '{}';
      const changesObj = JSON.parse(persistedChanges);
      changesObj[examId] = { ...changesObj[examId], ...changes };
      localStorage.setItem('examAdminChanges', JSON.stringify(changesObj));
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleExamStatus = async (examId: string) => {
    const currentStatus = exams.find(e => e.id === examId)?.status;
    let newStatus: Exam['status'];

    if (admin?.role === 'superadmin' || admin?.role === 'overseer') {
      // Superadmin cycle: active -> inactive -> disabled -> active
      switch (currentStatus) {
        case 'active':
          newStatus = 'inactive';
          break;
        case 'inactive':
          newStatus = 'disabled';
          break;
        case 'disabled':
          newStatus = 'active';
          break;
        default:
          newStatus = 'active';
      }
    } else {
      // Regular admin cycle: active -> inactive -> active
      newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    }

    setExams(prevExams =>
      prevExams.map(exam =>
        exam.id === examId
          ? { ...exam, status: newStatus }
          : exam
      )
    );
    await persistExamChanges(examId, { status: newStatus });
  };

  const updateExamPassword = async (examId: string, newPassword: string) => {
    setExams(prevExams =>
      prevExams.map(exam =>
        exam.id === examId
          ? { ...exam, password: newPassword }
          : exam
      )
    );
    await persistExamChanges(examId, { password: newPassword });
  };

  const getStatusStyles = (status: Exam['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'disabled':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (!admin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading exams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exams Management</h1>
          <p className="text-muted-foreground">Manage all available exams, passwords, and schedules</p>

          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by exam title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Exam</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Subject</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Duration</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Questions</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Password</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam, index) => (
                <tr
                  key={exam.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">ID: {exam.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">{exam.subject}</td>
                  <td className="px-6 py-4 text-foreground">{exam.duration} min</td>
                  <td className="px-6 py-4 text-foreground">{exam.totalQuestions}</td>
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <span className="font-mono text-sm bg-secondary/50 px-2 py-1 rounded flex items-center gap-1">
                        <Lock size={12} />
                        {exam.password ? '••••••••' : 'No password'}
                      </span>
                      <div className="absolute z-10 hidden group-hover:block bg-card border border-border p-2 rounded shadow-lg text-sm">
                        {exam.password || 'No password set'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusStyles(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleExamStatus(exam.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          exam.status === 'active'
                            ? 'bg-success/10 hover:bg-success/20 text-success'
                            : exam.status === 'disabled'
                            ? 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-500'
                            : 'bg-destructive/10 hover:bg-destructive/20 text-destructive'
                        }`}
                        title={
                          admin?.role === 'superadmin' || admin?.role === 'overseer'
                            ? exam.status === 'active'
                              ? 'Make Inactive'
                              : exam.status === 'inactive'
                              ? 'Disable Exam'
                              : exam.status === 'disabled'
                              ? 'Enable Exam'
                              : 'Enable Exam'
                            : exam.status === 'active'
                            ? 'Disable Exam'
                            : 'Enable Exam'
                        }
                      >
                        {exam.status === 'active' ? <Power size={16} /> :
                         exam.status === 'disabled' ? <Ban size={16} /> :
                         <Pause size={16} />}
                      </button>
                      <button
                        onClick={() => setEditingExam(exam)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Edit Exam Settings"
                      >
                        <Edit size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exams found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Exam Modal */}
      {editingExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card border border-primary/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-bounce-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Edit Exam Settings
              </h2>
              <p className="text-muted-foreground text-sm">
                Configure password and schedule for {editingExam.title}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Exam Password</label>
                <input
                  type="text"
                  value={editingExam.password || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter exam password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={async () => {
                  await updateExamPassword(editingExam.id, editingExam.password || '');
                  setEditingExam(null);
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingExam(null)}
                className="px-6 py-3 bg-secondary text-foreground rounded-full hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
