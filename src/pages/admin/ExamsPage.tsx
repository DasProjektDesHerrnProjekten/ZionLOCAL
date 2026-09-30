import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, AlertCircle, Loader2, Play, Pause, Power, Ban, Calendar, Clock, Lock, BookOpen } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { saveExamAdminChanges, loadExamAdminChanges, testExamAdminChangesTable, initializeExamAdminChangesTable, loadExamsFromStorage } from '@/lib/supabase';
import { Exam as BaseExam } from '@/data/exams';

interface Exam extends BaseExam {
  lastUpdated?: number;
}

const ExamsPage = () => {
  useDocumentTitle('Manage Exams');
  const { admin } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize the exam_admin_changes table if it doesn't exist
        await initializeExamAdminChangesTable();

        // Load exams from Supabase Storage (with fallback to local data)
        let baseExams: Exam[] = await loadExamsFromStorage();
        
        let mockExams: Exam[] = baseExams.map(exam => ({
          ...exam,
          totalMarks: exam.totalMarks || exam.totalQuestions // Default to question count if not set
        }));

        const getExamStatus = (exam: Exam): Exam['status'] => {
          const now = new Date();
          const scheduledStart = new Date(`${exam.scheduledDate}T${exam.startTime || '00:00'}:00`);
          const scheduledEnd = new Date(`${exam.scheduledDate}T${exam.endTime || '23:59'}:00`);
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
              const updatedExam = { ...exam, ...change };
              // Apply editableTitle if it exists, overriding auto-generated name
              if (change.editableTitle) {
                updatedExam.title = change.editableTitle;
              }
              return updatedExam;
            }
            return exam;
          });
          
          // Generate automatic names for exams without custom titles
          const subjectCountMap: Record<string, number> = {};
          const finalExams = updatedExams.map(exam => {
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
          
          setExams(finalExams);
        } else {
          // Generate automatic names when no persisted changes exist
          const subjectCountMap: Record<string, number> = {};
          const finalExams = mockExams.map(exam => {
            subjectCountMap[exam.subject] = (subjectCountMap[exam.subject] || 0) + 1;
            const count = subjectCountMap[exam.subject];
            return {
              ...exam,
              title: `${exam.subject} - ${count}`
            };
          });
          setExams(finalExams);
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
    (window as any).initializeTable = initializeExamAdminChangesTable;
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

  // Get unique subjects for filter
  const uniqueSubjects = Array.from(new Set(exams.map(exam => exam.subject))).sort();

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    const matchesSubject = filterSubject === 'all' || exam.subject === filterSubject;
    return matchesSearch && matchesStatus && matchesSubject;
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
            <option value="scheduled">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject-based Exam Folders */}
      <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {(() => {
          // Group exams by subject
          const groupedExams = filteredExams.reduce((acc, exam) => {
            if (!acc[exam.subject]) {
              acc[exam.subject] = [];
            }
            acc[exam.subject].push(exam);
            return acc;
          }, {} as Record<string, Exam[]>);

          // Sort subjects alphabetically
          const sortedSubjects = Object.keys(groupedExams).sort();

          if (sortedSubjects.length === 0) {
            return (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No exams found matching your criteria.</p>
              </div>
            );
          }

          return sortedSubjects.map((subject, subjectIndex) => (
            <div key={subject} className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: `${subjectIndex * 100}ms` }}>
              {/* Subject Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <BookOpen size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{subject}</h3>
                      <p className="text-sm text-muted-foreground">{groupedExams[subject].length} exam{groupedExams[subject].length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exams Table for this subject */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/30 border-b border-border">
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Exam</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Questions</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Total Marks</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Password</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedExams[subject].map((exam, index) => (
                      <tr
                        key={exam.id}
                        className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{exam.title}</p>
                            <p className="text-xs text-muted-foreground">ID: {exam.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">{exam.duration} min</td>
                        <td className="px-6 py-4 text-foreground">{exam.totalQuestions}</td>
                        <td className="px-6 py-4 text-foreground font-medium">{exam.totalMarks && exam.totalMarks > 0 ? exam.totalMarks : 'Not set'}</td>
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
            </div>
          ));
        })()}
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
                <label className="text-sm font-medium text-foreground block mb-2">Exam Title</label>
                <input
                  type="text"
                  value={editingExam.title || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter exam title"
                />
              </div>
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
              {(admin?.role === 'superadmin' || admin?.role === 'overseer') && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={editingExam.totalMarks || ''}
                    onChange={(e) => setEditingExam({ ...editingExam, totalMarks: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Enter total marks (e.g., 100)"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to use question count as total marks</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={async () => {
                  console.log('💾 Saving exam changes for:', editingExam.id);
                  
                  // Get the current exam from state
                  const currentExam = exams.find(e => e.id === editingExam.id);
                  
                  // Update local state
                  setExams(prevExams =>
                    prevExams.map(exam =>
                      exam.id === editingExam.id
                        ? { ...exam, title: editingExam.title, password: editingExam.password, totalMarks: editingExam.totalMarks }
                        : exam
                    )
                  );
                  
                  // Persist changes
                  await updateExamPassword(editingExam.id, editingExam.password || '');
                  
                  // Always persist editableTitle to override auto-generated names
                  await persistExamChanges(editingExam.id, { editableTitle: editingExam.title });
                  
                  if (editingExam.totalMarks !== undefined) {
                    await persistExamChanges(editingExam.id, { totalMarks: editingExam.totalMarks });
                  }
                  
                  console.log('✅ Exam changes saved successfully');
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
