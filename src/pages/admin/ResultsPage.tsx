import { useState, useEffect } from 'react';
import { Search, Filter, Download, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, queryWithRetry, fetchHighestResults } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
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
import { useToast } from '@/components/ui/use-toast';

interface ExamResult {
  id?: string;
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

const ResultsPage = () => {
  useDocumentTitle('Exam Results');
  const { admin } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'marks_desc' | 'name_asc'>('marks_desc');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showNoDataPopup, setShowNoDataPopup] = useState(false);
  const [highestResults, setHighestResults] = useState<ExamResult[]>([]);
  const { toast } = useToast();

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
          if (admin?.role === 'overseer') {
            // Overseer can see all results - no filtering
          } else if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
            // Zena can only see results from the English exam
            query = query.eq('exam_id', 'english-euee-2018');
          } else if (admin?.username === 'Asnakew@elyonmain.app') {
            // Asnakew can only see results from the chemistry exam
            query = query.eq('exam_id', 'chemistry-2018-natural');
          } else if (admin?.username === 'Habtamu@elyonmain.app') {
            // Habtamu can only see results from economics exams
            // Since economics exams might not have specific IDs yet, filter by title after fetching
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

          // Apply additional admin-specific filtering for Habtamu
          let filteredResults = resultsWithStudents;
          if (admin?.username === 'Habtamu@elyonmain.app') {
            filteredResults = resultsWithStudents.filter(r => 
              r.exam_title?.toLowerCase().includes('economics') || 
              r.exam_title?.toLowerCase().includes('economic')
            );
          }

          return filteredResults;
        };

        // Fetch highest results in parallel
        const [resultsData, highestResultsData] = await Promise.all([
          queryWithRetry(fetchData),
          fetchHighestResults(admin, 10)
        ]);

        setResults(resultsData);
        setHighestResults(highestResultsData);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load exam results. Using sample data.');
        // Set some sample data
        const sampleData = [
          {
            id: '1',
            student_id: 'student-1',
            student_name: 'John Doe',
            exam_id: 'exam-1',
            exam_title: 'Mathematics Midterm',
            total_questions: 20,
            correct_answers: 15,
            score_percentage: 75,
            answers: {},
            time_spent: 1800,
            submitted_at: new Date().toISOString()
          },
          // Add more sample data as needed
        ];

        // Filter sample data based on admin permissions
        const filteredSampleData = admin?.username === 'ZenaZPrestigious@elyonmain.app'
          ? sampleData.filter(r => r.exam_title?.toLowerCase().includes('english'))
          : admin?.username === 'Asnakew@elyonmain.app'
          ? sampleData.filter(r => r.exam_title?.toLowerCase().includes('chemistry'))
          : admin?.username === 'Habtamu@elyonmain.app'
          ? sampleData.filter(r => r.exam_title?.toLowerCase().includes('economics') || r.exam_title?.toLowerCase().includes('economic'))
          : sampleData;

        setResults(filteredSampleData);
        setHighestResults(filteredSampleData.slice(0, 10)); // Set top 10 as highest results
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [admin]);

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

  const uniqueExams = ['all', ...new Set(results.map(r => r.exam_title))];
  const uniqueSections = ['all', ...new Set(transformedResults.map(r => r.section).filter(s => s && s !== 'N/A'))];
  const uniqueClasses = ['all', ...new Set(transformedResults.map(r => r.class).filter(c => c && c !== 'N/A'))];

  const filteredResults = transformedResults
    .filter((result) => {
      const matchesSearch = 
        result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.admissionId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesExam = filterExam === 'all' || result.examTitle === filterExam;
      const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
      const matchesSection = filterSection === 'all' || result.section === filterSection;
      const matchesClass = filterClass === 'all' || result.class === filterClass;
      return matchesSearch && matchesExam && matchesStatus && matchesSection && matchesClass;
    })
    .sort((a, b) => {
      if (sortBy === 'marks_desc') {
        const marksA = Math.round(a.percentage / 100 * 4 * 10) / 10; // Convert percentage to 4-point scale with 1 decimal precision
        const marksB = Math.round(b.percentage / 100 * 4 * 10) / 10;
        return marksB - marksA; // High to low
      }
      return a.studentName.localeCompare(b.studentName); // Alphabetical by name
    });

  const averageScore = filteredResults.length > 0 
    ? Math.round(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / filteredResults.length)
    : 0;

  const submittedCount = filteredResults.filter(r => r.status === 'submitted').length;
  const totalCount = filteredResults.length;
  const submittedRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  const exportToCSV = (data: typeof filteredResults) => {
    const headers = [
      'Student Name',
      'Admission ID',
      'Sections', 
      'Exam',
      'Score',
      'Marks/4',
      'Total Questions',
      'Percentage',
      'Duration',
      'Status',
      'Class'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(result => [
        `"${result.studentName}"`,
        `"${result.admissionId}"`,
        `"${result.section}"`,
        `"${result.examTitle}"`,
        result.score,
        `"${(Math.round(result.percentage / 100 * 4 * 10) / 10).toFixed(1)}"`,
        result.totalQuestions,
        result.percentage,
        `"${result.duration}"`,
        `"${result.status}"`,
        `"${result.class}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exam_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (filteredResults.length === 0) {
      setShowNoDataPopup(true);
    } else {
      setIsDownloading(true);
      toast({
        title: "Download Started",
        description: "Your exam results are being downloaded...",
      });
      exportToCSV(filteredResults);
      setTimeout(() => {
        setIsDownloading(false);
        toast({
          title: "Download Complete",
          description: "Exam results have been downloaded successfully.",
        });
      }, 2000);
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
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
          <p className="text-muted-foreground">View and manage all exam results</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <button 
          onClick={handleExport}
          disabled={isDownloading}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          {isDownloading ? 'Downloading...' : 'Export Results'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up">
          <p className="text-sm text-muted-foreground">Total Results</p>
          <p className="text-2xl font-display font-bold text-foreground">{filteredResults.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-muted-foreground">Average Score</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-display font-bold text-foreground">{averageScore}%</p>
            <TrendingUp size={18} className="text-success" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground">Submission Rate</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-display font-bold text-foreground">{submittedCount} / {totalCount}</p>
            <span className="text-sm text-muted-foreground">({submittedRate}%)</span>
          </div>
        </div>
      </div>

      {/* Highest Performers Section */}
      {highestResults.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Top Performers</h2>
            <span className="text-sm text-muted-foreground">Highest scoring results</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {highestResults.slice(0, 10).map((result, index) => {
              const marks = Math.round(result.score_percentage / 100 * 4 * 10) / 10; // Convert percentage to 4-point scale with 1 decimal
              const transformedResult = {
                studentName: result.student_name,
                admissionId: result.student_id,
                examTitle: result.exam_title,
                score: result.correct_answers,
                totalQuestions: result.total_questions,
                percentage: Math.round(result.score_percentage),
                marks: marks
              };
              
              return (
                <div 
                  key={result.id} 
                  className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 hover:shadow-md transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      #{index + 1}
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {transformedResult.marks.toFixed(1)}/4
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-foreground text-sm truncate">{transformedResult.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">{transformedResult.admissionId}</p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p className="truncate">{transformedResult.examTitle}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-success">
                        {transformedResult.percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {transformedResult.score}/{transformedResult.totalQuestions}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
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
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'marks_desc' | 'name_asc')}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="marks_desc">Sort by Marks (High to Low)</option>
          <option value="name_asc">Sort by Name (A-Z)</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Admission ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Sections</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Exam</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Score</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Marks/4</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Percentage</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Duration</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Class</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <tr 
                    key={result.id} 
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
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
                    <td className="px-6 py-4 text-foreground font-medium">
                      {(Math.round(result.percentage / 100 * 4 * 10) / 10).toFixed(1)}/4
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${result.percentage >= 60 ? 'bg-success' : 'bg-destructive'}`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <span className={`font-medium ${result.percentage >= 60 ? 'text-success' : 'text-destructive'}`}>
                          {result.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">{result.duration}</td>
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
                    <td className="px-6 py-4 text-foreground font-medium">{result.class}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-muted-foreground">
                    No results found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Data Alert Dialog */}
      <AlertDialog open={showNoDataPopup} onOpenChange={setShowNoDataPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Results Available</AlertDialogTitle>
            <AlertDialogDescription>
              There are no exam results matching your current filters. Please adjust your search criteria or filters to view available results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

};

export default ResultsPage;