import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Calendar, Clock, Lock, Unlock, FileText, Download, Printer, CheckCircle, XCircle, AlertCircle, BookOpen, BarChart3, Users, ChevronDown, ChevronUp, Settings, Plus, Trash2, Edit, Save, X, Award, Power, Ban, Pause } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { exams as baseExams, Exam as BaseExam } from '@/data/exams';
import { loadExamAdminChanges, saveExamAdminChanges } from '@/lib/supabase';

interface Exam extends BaseExam {
  lastUpdated?: number;
}

const SuperAdminExamsPage = () => {
  useDocumentTitle('SuperAdmin - Exam Management');
  const { admin } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [examList, setExamList] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all exams with admin changes
  useEffect(() => {
    const loadAllExams = async () => {
      try {
        setIsLoading(true);

        // Load base exams from centralized data
        let mockExams: Exam[] = baseExams.map(exam => ({
          ...exam,
          totalMarks: exam.totalMarks || exam.totalQuestions
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
                title: `${exam.subject} -${count}`
              };
            }
            return exam;
          });
          
          setExamList(finalExams);
        } else {
          // Generate automatic names when no persisted changes exist
          const subjectCountMap: Record<string, number> = {};
          const finalExams = mockExams.map(exam => {
            subjectCountMap[exam.subject] = (subjectCountMap[exam.subject] || 0) + 1;
            const count = subjectCountMap[exam.subject];
            return {
              ...exam,
              title: `${exam.subject} -${count}`
            };
          });
          setExamList(finalExams);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
        setExamList(baseExams.map(exam => ({ ...exam, status: 'active' })));
      } finally {
        setIsLoading(false);
      }
    };

    loadAllExams();
  }, []);

  const filteredExams = examList.filter((exam) => {
    const matchesSearch =
      exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    const matchesSubject = filterSubject === 'all' || exam.subject === filterSubject;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Get unique subjects for filter
  const uniqueSubjects = Array.from(new Set(examList.map(exam => exam.subject))).sort();

  const persistExamChanges = async (examId: string, changes: Partial<Exam>) => {
    try {
      const changesObj = { [examId]: changes };
      await saveExamAdminChanges(changesObj);
    } catch (error) {
      console.error('Failed to persist exam changes:', error);
      const persistedChanges = localStorage.getItem('examAdminChanges') || '{}';
      const changesObj = JSON.parse(persistedChanges);
      changesObj[examId] = { ...changesObj[examId], ...changes };
      localStorage.setItem('examAdminChanges', JSON.stringify(changesObj));
    }
  };

  const updateExamPassword = async (examId: string, newPassword: string) => {
    setExamList(prevExams =>
      prevExams.map(exam =>
        exam.id === examId
          ? { ...exam, password: newPassword }
          : exam
      )
    );
    await persistExamChanges(examId, { password: newPassword });
  };

  const toggleExamStatus = async (examId: string) => {
    const currentStatus = examList.find(e => e.id === examId)?.status;
    let newStatus: Exam['status'];

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

    setExamList(prevExams =>
      prevExams.map(exam =>
        exam.id === examId
          ? { ...exam, status: newStatus }
          : exam
      )
    );
    await persistExamChanges(examId, { status: newStatus });
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

  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'active':
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'upcoming':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'disabled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleViewQuestions = (exam: Exam) => {
    setSelectedExam(exam);
    setShowQuestionsModal(true);
  };

  const handleScheduleExam = (exam: Exam) => {
    setEditingSchedule(exam);
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    if (editingSchedule) {
      setExamList(prevExams =>
        prevExams.map(exam =>
          exam.id === editingSchedule.id ? editingSchedule : exam
        )
      );
      setShowScheduleModal(false);
      setEditingSchedule(null);
    }
  };

  const generateExamPDF = (exam: Exam) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const questionsHtml = exam.questions.map((q, index) => {
      if (q.isPassage) {
        return `
          <div class="passage mb-6 p-4 bg-gray-50 border-l-4 border-blue-500">
            <h3 class="font-bold text-lg mb-2">Passage ${index + 1}</h3>
            <p class="text-gray-700 whitespace-pre-wrap">${q.text}</p>
          </div>
        `;
      }

      const optionsHtml = q.options ? `
        <div class="options mt-3 space-y-2">
          ${q.options.map((opt, i) => `
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">${String.fromCharCode(65 + i)}</span>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `
        <div class="question mb-6 p-4 border border-gray-200 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">${index + 1}</span>
            <div class="flex-1">
              <p class="font-medium text-gray-800">${q.text}</p>
              ${q.section ? `<span class="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${q.section}</span>` : ''}
              ${optionsHtml}
              ${q.correctAnswer !== undefined ? `<p class="mt-2 text-sm text-green-600 font-medium">Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}</p>` : ''}
              ${q.explanation ? `<p class="mt-2 text-sm text-gray-600 italic">Explanation: ${q.explanation}</p>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${exam.title} - Exam Questions</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          .header h1 {
            color: #1e40af;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header .meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 15px;
            color: #666;
          }
          .header .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .exam-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
          }
          .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
          }
          .question {
            page-break-inside: avoid;
          }
          .passage {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
          }
          @media print {
            body {
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${exam.title}</h1>
          <p class="text-gray-600">${exam.description}</p>
          <div class="meta">
            <div class="meta-item">
              <span>📅</span>
              <span>${exam.scheduledDate}</span>
            </div>
            <div class="meta-item">
              <span>⏱️</span>
              <span>${exam.duration} minutes</span>
            </div>
            <div class="meta-item">
              <span>📝</span>
              <span>${exam.totalQuestions} questions</span>
            </div>
          </div>
        </div>

        <div class="exam-info">
          <div class="info-item">
            <span class="info-label">Subject</span>
            <span class="info-value">${exam.subject}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="info-value">${exam.status}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Stream</span>
            <span class="info-value">${exam.stream || 'All'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Password</span>
            <span class="info-value">${exam.password || 'None'}</span>
          </div>
        </div>

        <div class="questions">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Questions</h2>
          ${questionsHtml}
        </div>

        <div class="no-print mt-8 pt-6 border-t border-gray-200 text-center">
          <button onclick="window.print()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4">
            🖨️ Print Exam
          </button>
          <button onclick="window.close()" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            ✖️ Close Window
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!admin || admin.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to SuperAdmins.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SuperAdmin Exam Management</h1>
        <p className="text-gray-600">Overview, plan, and manage all exams in the system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900">{examList.length}</p>
            </div>
            <BookOpen className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Exams</p>
              <p className="text-3xl font-bold text-green-600">{examList.filter(e => e.status === 'active' || e.status === 'ongoing').length}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Scheduled Exams</p>
              <p className="text-3xl font-bold text-blue-600">{examList.filter(e => e.status === 'upcoming' || e.status === 'scheduled').length}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-3xl font-bold text-purple-600">{examList.reduce((acc, e) => acc + e.totalQuestions, 0)}</p>
            </div>
            <FileText className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disabled">Disabled</option>
              <option value="scheduled">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subject-based Exam Folders */}
      <div className="space-y-6">
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
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No exams found matching your criteria.</p>
              </div>
            );
          }

          return sortedSubjects.map((subject, subjectIndex) => (
            <div key={subject} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Subject Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{subject}</h3>
                      <p className="text-sm text-gray-600">{groupedExams[subject].length} exam{groupedExams[subject].length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exams Table for this subject */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Exam Details</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Schedule</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Questions</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Total Marks</th>
                      <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedExams[subject].map((exam, index) => (
                      <tr
                        key={exam.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 max-w-md truncate">{exam.title}</p>
                            <p className="text-sm text-gray-500">ID: {exam.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar size={14} />
                              {exam.scheduledDate}
                            </div>
                            {exam.startTime && exam.endTime && (
                              <div className="flex items-center gap-2 text-gray-500 mt-1">
                                <Clock size={14} />
                                {exam.startTime} - {exam.endTime}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(exam.status)}`}>
                            {exam.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-700">{exam.totalQuestions}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Award size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-700">
                              {exam.totalMarks && exam.totalMarks > 0 ? exam.totalMarks : 'Not set'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleExamStatus(exam.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                exam.status === 'active'
                                  ? 'bg-green-100 hover:bg-green-200 text-green-600'
                                  : exam.status === 'disabled'
                                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                  : 'bg-red-100 hover:bg-red-200 text-red-600'
                              }`}
                              title={
                                exam.status === 'active'
                                  ? 'Make Inactive'
                                  : exam.status === 'inactive'
                                  ? 'Disable Exam'
                                  : exam.status === 'disabled'
                                  ? 'Enable Exam'
                                  : 'Enable Exam'
                              }
                            >
                              {exam.status === 'active' ? <Power size={16} /> :
                               exam.status === 'disabled' ? <Ban size={16} /> :
                               <Pause size={16} />}
                            </button>
                            <button
                              onClick={() => setEditingExam(exam)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Exam Settings"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleViewQuestions(exam)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Questions"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleScheduleExam(exam)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Schedule Exam"
                            >
                              <Calendar size={18} />
                            </button>
                            <button
                              onClick={() => generateExamPDF(exam)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Download/Print PDF"
                            >
                              <Download size={18} />
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

      {/* Questions Modal */}
      {showQuestionsModal && selectedExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedExam.title}</h2>
                <p className="text-gray-600">{selectedExam.subject} - {selectedExam.totalQuestions} Questions</p>
              </div>
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedExam.questions.map((q, index) => (
                <div key={q.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  {q.isPassage ? (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h3 className="font-bold text-lg mb-2">Passage {index + 1}</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{q.text}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{q.text}</p>
                          {q.section && (
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {q.section}
                            </span>
                          )}
                          {q.options && (
                            <div className="mt-3 space-y-2">
                              {q.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  <span className="text-gray-700">{opt}</span>
                                  {q.correctAnswer === i && (
                                    <CheckCircle size={16} className="text-green-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {q.correctAnswer !== undefined && (
                            <p className="mt-2 text-sm text-green-600 font-medium">
                              Correct Answer: {String.fromCharCode(65 + q.correctAnswer)}
                            </p>
                          )}
                          {q.explanation && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              Explanation: {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => generateExamPDF(selectedExam)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Download PDF
              </button>
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Exam</h2>
              <p className="text-gray-600">{editingSchedule.title}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingSchedule.status}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, status: e.target.value as Exam['status'] })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                <input
                  type="date"
                  value={editingSchedule.scheduledDate}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={editingSchedule.startTime || ''}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={editingSchedule.endTime || ''}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="text"
                  value={editingSchedule.password || ''}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter exam password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                <input
                  type="number"
                  value={editingSchedule.totalMarks || ''}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, totalMarks: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10, 100, etc."
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">The total marks this exam is out of (e.g., 10, 100, etc.)</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {editingExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Exam Settings</h2>
              <p className="text-gray-600">Configure settings for {editingExam.title}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                <input
                  type="text"
                  value={editingExam.title || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter exam title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Password</label>
                <input
                  type="text"
                  value={editingExam.password || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter exam password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                <input
                  type="number"
                  value={editingExam.totalMarks || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, totalMarks: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total marks (e.g., 100)"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use question count as total marks</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={async () => {
                  console.log('💾 Saving exam changes for:', editingExam.id);
                  
                  // Update local state
                  setExamList(prevExams =>
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
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={() => setEditingExam(null)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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

export default SuperAdminExamsPage;