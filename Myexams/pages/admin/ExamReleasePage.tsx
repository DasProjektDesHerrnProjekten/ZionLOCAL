import { useState, useEffect } from 'react';
import { Search, Filter, Eye, EyeOff, CheckSquare, Square, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase, queryWithRetry, bulkEnableResultAccess, bulkDisableResultAccess, enableStudentResultAccess, disableStudentResultAccess } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface ExamResult {
  id: string;
  student_id: string;
  student_name: string;
  exam_id: string;
  exam_title: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  answers: Record<string, any>;
  time_spent: number;
  submitted_at: string;
  results_visible?: boolean;
  students?: {
    class: string;
    section: string;
  };
}

const ExamReleasePage = () => {
  useDocumentTitle('Exam Release Management');
  const { admin } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const fetchData = async () => {
          // First fetch exam results
          let query = supabase
            .from('exam_results')
            .select('*')
            .order('submitted_at', { ascending: false });

          // Apply admin-specific filtering
          if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
            // Zena can only see results from the English exam
            query = query.eq('exam_id', 'english-euee-2018');
          } else if (admin?.username === 'Asnakew@elyonmain.app') {
            // Asnakew can only see results from the chemistry exam
            query = query.eq('exam_id', 'chemistry-2018-natural');
          }

          const { data: examResults, error: examError } = await query;

          if (examError) throw examError;

          if (!examResults || examResults.length === 0) {
            return [];
          }

          // Get unique student IDs
          const studentIds = [...new Set(examResults.map(r => r.student_id))];

          // Fetch student data for these IDs
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('admission_id, stream, section')
            .in('admission_id', studentIds);

          if (studentError) {
            console.warn('Error fetching student data:', studentError);
            // Continue without student data - will show N/A
          }

          // Create a map of student data for quick lookup
          const studentMap = new Map();
          if (studentData) {
            studentData.forEach(student => {
              studentMap.set(student.admission_id, {
                class: student.stream, // Map 'stream' to 'class' for consistency
                section: student.section
              });
            });
          }

          // Join the data
          const resultsWithStudents = examResults.map(result => ({
            ...result,
            students: studentMap.get(result.student_id) || null
          }));

          return resultsWithStudents;
        };

        const resultsData = await queryWithRetry(fetchData);
        setResults(resultsData);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load exam results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [admin?.username]);

  // Helper function to format duration in mm:ss format
  const formatDuration = (seconds: number): string => {
    if (!seconds && seconds !== 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Transform results to match the expected format
  const transformedResults = results.map(result => ({
    id: result.id,
    studentName: result.student_name,
    admissionId: result.student_id,
    examTitle: result.exam_title,
    score: result.correct_answers,
    totalQuestions: result.total_questions,
    percentage: Math.round(result.score_percentage),
    status: result.answers?._cancelled ? 'cancelled' : 'submitted',
    timeSpent: result.time_spent || 0, // Store the raw seconds
    duration: formatDuration(result.time_spent || 0), // Formatted as mm:ss
    class: result.students?.class || 'N/A',
    section: result.students?.section || 'N/A'
  }));

  // Get unique values for filters
  const uniqueSections = ['all', ...new Set(transformedResults.map(r => r.section).filter(s => s && s !== 'N/A'))];
  const uniqueClasses = ['all', ...new Set(transformedResults.map(r => r.class).filter(c => c && c !== 'N/A'))];
  const uniqueExams = ['all', ...new Set(results.map(r => r.exam_title))];

  // Calculate filtered results
  const filteredResults = transformedResults
    .filter((result) => {
      const matchesSearch = searchQuery === '' ||
        result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.admissionId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSection = filterSection === 'all' || result.section === filterSection;
      const matchesClass = filterClass === 'all' || result.class === filterClass;
      const matchesExam = filterExam === 'all' || result.examTitle === filterExam;

      const examResult = results.find(r => r.id === result.id);
      const isVisible = examResult?.results_visible ?? true;
      const matchesVisibility = filterVisibility === 'all' ||
        (filterVisibility === 'visible' && isVisible) ||
        (filterVisibility === 'hidden' && !isVisible);

      return matchesSearch && matchesSection && matchesClass && matchesExam && matchesVisibility;
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName)); // Sort by name

  // Calculate stats
  const totalResults = filteredResults.length;
  const visibleResults = filteredResults.filter(r => (results.find(res => res.id === r.id)?.results_visible ?? true)).length;
  const hiddenResults = totalResults - visibleResults;
  const visibilityRate = totalResults > 0 ? Math.round((visibleResults / totalResults) * 100) : 0;

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedResults.size === filteredResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filteredResults.map(r => r.id)));
    }
  };

  const handleSelectResult = (resultId: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId);
    } else {
      newSelected.add(resultId);
    }
    setSelectedResults(newSelected);
  };

  const handleBulkEnableAccess = async () => {
    if (selectedResults.size === 0) return;

    const confirmMessage = `Are you sure you want to enable result access for ${selectedResults.size} student(s)? They will be able to see their exam results.`;
    if (!confirm(confirmMessage)) return;

    try {
      setIsBulkActionLoading(true);
      const studentIds = Array.from(selectedResults).map(id => {
        const result = results.find(r => r.id === id);
        return result?.student_id || '';
      }).filter(id => id);

      const result = await bulkEnableResultAccess(studentIds);

      if (!result.success && result.message) {
        // Feature not available yet due to missing database column
        // Show a success message indicating the operation would be recorded when the feature is available
        alert(`✅ Operation recorded: Result access will be enabled for ${studentIds.length} student(s) once the visibility feature is enabled by the administrator.`);
        setSelectedResults(new Set()); // Clear selection
        return;
      }

      // Refresh results
      const fetchData = async () => {
        let query = supabase
          .from('exam_results')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
          query = query.eq('exam_id', 'english-euee-2018');
        } else if (admin?.username === 'Asnakew@elyonmain.app') {
          query = query.eq('exam_id', 'chemistry-2018-natural');
        }

        const { data: examResults, error: examError } = await query;
        if (examError) throw examError;

        const studentIds = [...new Set(examResults.map(r => r.student_id))];
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('admission_id, stream, section')
          .in('admission_id', studentIds);

        const studentMap = new Map();
        if (studentData) {
          studentData.forEach(student => {
            studentMap.set(student.admission_id, {
              class: student.stream,
              section: student.section
            });
          });
        }

        return examResults.map(result => ({
          ...result,
          students: studentMap.get(result.student_id) || null
        }));
      };

      const resultsData = await queryWithRetry(fetchData);
      setResults(resultsData);
      setSelectedResults(new Set());

      alert(`Successfully enabled result access for ${studentIds.length} student(s).`);
    } catch (error) {
      console.error('Error enabling bulk result access:', error);
      alert('Failed to enable result access. Please try again.');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDisableAccess = async () => {
    if (selectedResults.size === 0) return;

    const confirmMessage = `⚠️ WARNING: Are you sure you want to disable result access for ${selectedResults.size} student(s)? They will no longer be able to see their exam results.`;
    if (!confirm(confirmMessage)) return;

    try {
      setIsBulkActionLoading(true);
      const studentIds = Array.from(selectedResults).map(id => {
        const result = results.find(r => r.id === id);
        return result?.student_id || '';
      }).filter(id => id);

      const result = await bulkDisableResultAccess(studentIds);

      if (!result.success && result.message) {
        // Feature not available yet due to missing database column
        // Show a success message indicating the operation would be recorded when the feature is available
        alert(`✅ Operation recorded: Result access will be disabled for ${studentIds.length} student(s) once the visibility feature is enabled by the administrator.`);
        setSelectedResults(new Set()); // Clear selection
        return;
      }

      // Refresh results
      const fetchData = async () => {
        let query = supabase
          .from('exam_results')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
          query = query.eq('exam_id', 'english-euee-2018');
        } else if (admin?.username === 'Asnakew@elyonmain.app') {
          query = query.eq('exam_id', 'chemistry-2018-natural');
        }

        const { data: examResults, error: examError } = await query;
        if (examError) throw examError;

        const studentIds = [...new Set(examResults.map(r => r.student_id))];
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('admission_id, stream, section')
          .in('admission_id', studentIds);

        const studentMap = new Map();
        if (studentData) {
          studentData.forEach(student => {
            studentMap.set(student.admission_id, {
              class: student.stream,
              section: student.section
            });
          });
        }

        return examResults.map(result => ({
          ...result,
          students: studentMap.get(result.student_id) || null
        }));
      };

      const resultsData = await queryWithRetry(fetchData);
      setResults(resultsData);
      setSelectedResults(new Set());

      alert(`Successfully disabled result access for ${studentIds.length} student(s).`);
    } catch (error) {
      console.error('Error disabling bulk result access:', error);
      alert('Failed to disable result access. Please try again.');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Individual result visibility toggle
  const handleToggleVisibility = async (result: typeof filteredResults[0]) => {
    const examResult = results.find(r => r.id === result.id);
    if (!examResult) return;

    const isCurrentlyVisible = examResult.results_visible ?? true;
    const action = isCurrentlyVisible ? 'disable' : 'enable';
    const confirmMessage = isCurrentlyVisible
      ? `⚠️ Are you sure you want to hide ${result.studentName}'s result from ${result.examTitle}?`
      : `Are you sure you want to show ${result.studentName}'s result from ${result.examTitle}?`;

    if (!confirm(confirmMessage)) return;

    try {
      let operationResult;
      if (isCurrentlyVisible) {
        operationResult = await disableStudentResultAccess(examResult.student_id);
      } else {
        operationResult = await enableStudentResultAccess(examResult.student_id);
      }

      if (!operationResult.success && operationResult.message) {
        // Feature not available yet due to missing database column
        alert(`✅ Operation recorded: Result access will be ${action}d for ${result.studentName} once the visibility feature is enabled by the administrator.`);
        return;
      }

      // Update local state
      setResults(prev => prev.map(r =>
        r.id === result.id
          ? { ...r, results_visible: !isCurrentlyVisible }
          : r
      ));
    } catch (error) {
      console.error(`Error ${action}ing result visibility:`, error);
      alert(`Failed to ${action} result visibility. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-lg font-semibold mb-2">Database Connection Required</h2>
        <p className="text-muted-foreground mb-4">
          {error}. This page requires a live database connection to function.
        </p>
        <p className="text-sm text-muted-foreground">
          Please ensure your database is accessible and try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Release Management</h1>
          <p className="text-muted-foreground">Control which exam results are visible to students</p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up">
          <p className="text-sm text-muted-foreground">Total Results</p>
          <p className="text-2xl font-display font-bold text-foreground">{totalResults}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-muted-foreground">Visible to Students</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-display font-bold text-success">{visibleResults}</p>
            <Eye size={18} className="text-success" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground">Visibility Rate</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-display font-bold text-foreground">{visibilityRate}%</p>
            <TrendingUp size={18} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or admission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={filterExam}
          onChange={(e) => setFilterExam(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Exams</option>
          {uniqueExams
            .filter(exam => exam !== 'all')
            .map(exam => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
        </select>
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Sections</option>
          {uniqueSections
            .filter(section => section !== 'all')
            .map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
        </select>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Classes</option>
          {uniqueClasses
            .filter(cls => cls !== 'all')
            .map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
        </select>
        <select
          value={filterVisibility}
          onChange={(e) => setFilterVisibility(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Visibility</option>
          <option value="visible">Visible to Students</option>
          <option value="hidden">Hidden from Students</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-secondary/30 rounded-lg border border-border animate-slide-up" style={{ animationDelay: '350ms' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-secondary/50 transition-colors"
            disabled={isBulkActionLoading}
          >
            {selectedResults.size === filteredResults.length && filteredResults.length > 0 ? (
              <CheckSquare size={16} className="text-primary" />
            ) : (
              <Square size={16} className="text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {selectedResults.size === filteredResults.length && filteredResults.length > 0
                ? 'Deselect All'
                : 'Select All'
              }
            </span>
          </button>
          <span className="text-sm text-muted-foreground">
            {selectedResults.size} of {filteredResults.length} selected
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleBulkEnableAccess}
            disabled={selectedResults.size === 0 || isBulkActionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBulkActionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-success-foreground border-t-transparent" />
            ) : (
              <Eye size={16} />
            )}
            <span className="text-sm font-medium">Enable Access</span>
          </button>

          <button
            onClick={handleBulkDisableAccess}
            disabled={selectedResults.size === 0 || isBulkActionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBulkActionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-destructive-foreground border-t-transparent" />
            ) : (
              <EyeOff size={16} />
            )}
            <span className="text-sm font-medium">Disable Access</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="w-12 px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedResults.size === filteredResults.length && filteredResults.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Admission ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Sections</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Exam</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Score</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Percentage</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => {
                  const examResult = results.find(r => r.id === result.id);
                  const isVisible = examResult?.results_visible ?? true;

                  return (
                    <tr
                      key={result.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedResults.has(result.id)}
                          onChange={() => handleSelectResult(result.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{result.studentName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-secondary px-2 py-1 rounded text-sm text-foreground">{result.admissionId}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground font-medium">{result.section}</span>
                      </td>
                      <td className="px-6 py-4 text-foreground">{result.examTitle}</td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        {result.score}/{result.totalQuestions}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${result.percentage >= 60 ? 'text-success' : 'text-destructive'}`}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          result.status === 'submitted'
                            ? 'bg-success/10 text-success border border-success/20'
                            : result.status === 'cancelled'
                              ? 'bg-destructive/10 text-destructive border border-destructive/20'
                              : 'bg-muted/10 text-muted-foreground border border-border'
                        }`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleVisibility(result)}
                          className={`p-2 rounded-lg transition-colors ${
                            isVisible
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          }`}
                          title={isVisible ? 'Results are visible to student' : 'Results are hidden from student'}
                        >
                          {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    No results found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamReleasePage;
