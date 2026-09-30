import { useState, useEffect } from 'react';
import { Search, Filter, Users, CheckCircle, XCircle, AlertCircle, TrendingUp, Lock, Unlock, UserCheck, UserX, Upload, Download, FileText } from 'lucide-react';
import { supabase, queryWithRetry, bulkGrantExamAccess, bulkRevokeExamAccess, grantExamAccess, revokeExamAccess, fetchExamAccessRecords, fetchStudents, loadExamAdminChanges, initializeExamAdminChangesTable, loadExamsFromStorage } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Exam as BaseExam } from '@/data/exams';

interface Exam extends BaseExam {
  lastUpdated?: number;
}

interface Student {
  id: string;
  admissionId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  stream?: string; // Natural or Social
  subjects?: {
    mathematics?: boolean;
    english?: boolean;
    chemistry?: boolean;
    physics?: boolean;
    geography?: boolean;
    history?: boolean;
    sat?: boolean;
    biology?: boolean;
    economics?: boolean;
  };
}

interface ExamAccessRecord {
  id?: string;
  exam_id: string;
  student_id: string;
  has_access: boolean;
  updated_at?: string;
}

const ExamAccessPage = () => {
  useDocumentTitle('Exam Access Management');
  const { admin } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterAccess, setFilterAccess] = useState<string>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAccessRecords, setExamAccessRecords] = useState<Record<string, ExamAccessRecord[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [currentExamId, setCurrentExamId] = useState<string>('');

  // CSV upload state
  const [isCsvUploadOpen, setIsCsvUploadOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [autoAssignMode, setAutoAssignMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch all students
        const studentsData = await queryWithRetry(async () => {
          const data = await fetchStudents();
          return data;
        });

        setStudents(studentsData);

        // Get unique exam IDs from the exams data
        const examIds = exams.map(exam => exam.id);

        // Fetch access records for all exams
        const accessRecords: Record<string, ExamAccessRecord[]> = {};

        for (const examId of examIds) {
          const records = await queryWithRetry(async () => {
            return await fetchExamAccessRecords(examId);
          });
          accessRecords[examId] = records;
        }

        setExamAccessRecords(accessRecords);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load exam access data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get filtered exams based on admin role
  const getFilteredExams = () => {
    let filteredExams = exams;

    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      filteredExams = exams.filter(exam => exam.id === 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      filteredExams = exams.filter(exam => exam.id === 'chemistry-2018-natural');
    } else if (admin?.username === 'Habtamu@elyonmain.app') {
      filteredExams = exams.filter(exam =>
        exam.title?.toLowerCase().includes('economics') ||
        exam.title?.toLowerCase().includes('economic')
      );
    }

    return filteredExams;
  };

  const filteredExams = getFilteredExams();
  const uniqueExams = filteredExams.map(exam => ({ id: exam.id, title: exam.title }));

  // Helper function to check if student has access to an exam
  const hasAccess = (studentId: string | number, examId: string): boolean => {
    const records = examAccessRecords[examId] || [];
    const record = records.find(r => r.student_id === String(studentId));
    return record?.has_access ?? false;
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.admissionId && String(student.admissionId).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAccess = filterAccess === 'all' ||
      (filterAccess === 'has_access' && currentExamId && hasAccess(String(student.admissionId), currentExamId)) ||
      (filterAccess === 'no_access' && currentExamId && !hasAccess(String(student.admissionId), currentExamId));

    return matchesSearch && matchesAccess;
  });

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => String(s.admissionId))));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkGrantAccess = async () => {
    if (selectedStudents.size === 0 || !currentExamId) return;

    const confirmMessage = `Are you sure you want to grant exam access to ${selectedStudents.size} student(s) for "${filteredExams.find(e => e.id === currentExamId)?.title}"?`;
    if (!confirm(confirmMessage)) return;

    try {
      setIsBulkActionLoading(true);
      const studentIds = Array.from(selectedStudents);

      await bulkGrantExamAccess(studentIds, currentExamId);

      // Update local state
      setExamAccessRecords(prev => ({
        ...prev,
        [currentExamId]: [
          ...(prev[currentExamId] || []).filter(r => !studentIds.includes(r.student_id)),
          ...studentIds.map(studentId => ({
            exam_id: currentExamId,
            student_id: studentId,
            has_access: true,
            updated_at: new Date().toISOString()
          }))
        ]
      }));

      setSelectedStudents(new Set());
      alert(`Successfully granted access to ${studentIds.length} student(s).`);
    } catch (error) {
      console.error('Error bulk granting access:', error);
      alert('Failed to grant access. Please try again.');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkRevokeAccess = async () => {
    if (selectedStudents.size === 0 || !currentExamId) return;

    const confirmMessage = `⚠️ WARNING: Are you sure you want to revoke exam access from ${selectedStudents.size} student(s) for "${filteredExams.find(e => e.id === currentExamId)?.title}"?`;
    if (!confirm(confirmMessage)) return;

    try {
      setIsBulkActionLoading(true);
      const studentIds = Array.from(selectedStudents);

      await bulkRevokeExamAccess(studentIds, currentExamId);

      // Update local state
      setExamAccessRecords(prev => ({
        ...prev,
        [currentExamId]: [
          ...(prev[currentExamId] || []).filter(r => !studentIds.includes(r.student_id)),
          ...studentIds.map(studentId => ({
            exam_id: currentExamId,
            student_id: studentId,
            has_access: false,
            updated_at: new Date().toISOString()
          }))
        ]
      }));

      setSelectedStudents(new Set());
      alert(`Successfully revoked access from ${studentIds.length} student(s).`);
    } catch (error) {
      console.error('Error bulk revoking access:', error);
      alert('Failed to revoke access. Please try again.');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleToggleAccess = async (studentId: string, examId: string) => {
    const student = students.find(s => String(s.admissionId) === studentId);
    const exam = filteredExams.find(e => e.id === examId);
    const currentlyHasAccess = hasAccess(studentId, examId);

    const action = currentlyHasAccess ? 'revoke' : 'grant';
    const confirmMessage = currentlyHasAccess
      ? `Are you sure you want to revoke access for ${student?.name} from "${exam?.title}"?`
      : `Are you sure you want to grant access for ${student?.name} to "${exam?.title}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      if (currentlyHasAccess) {
        await revokeExamAccess(studentId, examId);
      } else {
        await grantExamAccess(studentId, examId);
      }

      // Update local state
      setExamAccessRecords(prev => ({
        ...prev,
        [examId]: [
          ...(prev[examId] || []).filter(r => r.student_id !== studentId),
          {
            exam_id: examId,
            student_id: studentId,
            has_access: !currentlyHasAccess,
            updated_at: new Date().toISOString()
          }
        ]
      }));
    } catch (error) {
      console.error(`Error ${action}ing access:`, error);
      alert(`Failed to ${action} access. Please try again.`);
    }
  };

  // CSV processing functions
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        let value: string | boolean = values[index]?.trim() || '';
        // Convert boolean strings to actual booleans for subject columns
        if (['mathematics', 'english', 'chemistry', 'physics', 'geography', 'history', 'sat', 'biology', 'economics'].includes(header)) {
          value = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
        }
        row[header] = value;
      });
      return row;
    });

    return rows;
  };

  const getExamIdForSubject = (subject: string, stream?: string): string | null => {
    const subjectLower = subject.toLowerCase();

    // Map subjects to exam IDs based on stream
    if (subjectLower === 'mathematics') {
      return 'math-2018';
    } else if (subjectLower === 'english') {
      return 'english-euee-2018';
    } else if (subjectLower === 'chemistry') {
      return stream === 'Natural' ? 'chemistry-2018-natural' : 'chemistry-2018-social';
    } else if (subjectLower === 'physics') {
      return 'physics-miskaye-hizunan-2024';
    } else if (subjectLower === 'geography') {
      return 'geography-2018';
    } else if (subjectLower === 'history') {
      return 'history-2018';
    } else if (subjectLower === 'sat') {
      return 'sat-2018';
    } else if (subjectLower === 'biology') {
      return 'biology-2018-grade12';
    } else if (subjectLower === 'economics') {
      return 'economics-2018';
    }

    return null;
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Accept CSV files regardless of MIME type (some CSVs might not be detected as text/csv)
      const fileName = file.name.toLowerCase();
      const isCsv = fileName.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';

      if (isCsv) {
        setCsvFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          const csvText = e.target?.result as string;
          const parsedData = parseCSV(csvText);
          setCsvPreview(parsedData.slice(0, 5)); // Show first 5 rows as preview
        };
        reader.readAsText(file);
      } else {
        alert('Please select a valid CSV file.');
        setCsvFile(null);
        setCsvPreview([]);
      }
    }
  };

  const processCsvAndAssignAccess = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first.');
      return;
    }

    setIsProcessingCsv(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvText = e.target?.result as string;

          if (!csvText || csvText.trim().length === 0) {
            throw new Error('CSV file is empty');
          }

          const csvData = parseCSV(csvText);

          if (csvData.length === 0) {
            throw new Error('No valid data found in CSV');
          }

          let successCount = 0;
          let errorCount = 0;

          for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];

            try {
              // Map Google Forms columns to our expected format
              const mappedRow: any = {
                admission_id: row['provide us with your admission id'] || '',
                name: row['provide us with your name'] || '',
                stream: row['what is your stream'] || '',
                section: row['provide us with your class and section'] || '',
                // Initialize all subjects to false
                mathematics: false,
                english: false,
                chemistry: false,
                physics: false,
                geography: false,
                history: false,
                sat: false,
                biology: false,
                economics: false
              };

              // Parse subject selections based on stream
              const stream = mappedRow.stream.toLowerCase();

              // Check individual subject columns for true/false values
              if (stream === 'natural') {
                mappedRow.english = row['which exams  (english for natural science)'] === 'true';
                mappedRow.mathematics = row['which exams  (mathematics for natural science)'] === 'true';
                mappedRow.sat = row['which exams  (sat for natural science)'] === 'true';
                mappedRow.biology = row['which exams  (biology for natural science)'] === 'true';
                mappedRow.chemistry = row['which exams  (chemistry for natural science)'] === 'true';
                mappedRow.physics = row['which exams  (physics for natural science)'] === 'true';
              } else if (stream === 'social') {
                mappedRow.english = row['which exams  (english for social science)'] === 'true';
                mappedRow.mathematics = row['which exams  (mathematics for social science)'] === 'true';
                mappedRow.sat = row['which exams  (sat for social science)'] === 'true';
                mappedRow.history = row['which exams  (history for social science)'] === 'true';
                mappedRow.geography = row['which exams  (geography for social science)'] === 'true';
                mappedRow.economics = row['which exams  (economics for social science)'] === 'true';
              }

              const studentId = mappedRow.admission_id;
              if (!studentId || studentId.trim() === '') {
                console.warn(`Row ${i + 1}: No student ID found, skipping`);
                errorCount++;
                continue;
              }

              // Auto-assign based on stream and subjects
              if (autoAssignMode) {
                const examsToGrant: string[] = [];

                // Natural stream subjects
                if (mappedRow.stream.toLowerCase() === 'natural') {
                  if (mappedRow.mathematics) examsToGrant.push('math-2018');
                  if (mappedRow.english) examsToGrant.push('english-euee-2018');
                  if (mappedRow.chemistry) examsToGrant.push('chemistry-2018-natural');
                  if (mappedRow.physics) examsToGrant.push('physics-miskaye-hizunan-2024');
                  if (mappedRow.biology) examsToGrant.push('biology-2018-grade12');
                  if (mappedRow.sat) examsToGrant.push('sat-2018');
                }
                // Social stream subjects
                else if (mappedRow.stream.toLowerCase() === 'social') {
                  if (mappedRow.mathematics) examsToGrant.push('math-2018');
                  if (mappedRow.english) examsToGrant.push('english-euee-2018');
                  if (mappedRow.geography) examsToGrant.push('geography-2018');
                  if (mappedRow.history) examsToGrant.push('history-2018');
                  if (mappedRow.economics) examsToGrant.push('economics-2018');
                  if (mappedRow.sat) examsToGrant.push('sat-2018');
                }

                console.log(`Row ${i + 1}: Granting access to exams:`, examsToGrant);

                // Grant access to calculated exams
                for (const examId of examsToGrant) {
                  try {
                    await grantExamAccess(studentId, examId);
                    console.log(`Row ${i + 1}: Granted access to ${examId}`);
                  } catch (examError) {
                    console.error(`Row ${i + 1}: Failed to grant access to ${examId}:`, examError);
                  }
                }

                if (examsToGrant.length > 0) successCount++;
              } else {
                console.log(`Row ${i + 1}: Auto-assign mode disabled, skipping access grant`);
                successCount++;
              }
            } catch (rowError) {
              console.error(`Row ${i + 1}: Error processing row:`, rowError);
              errorCount++;
            }
          }

          const message = autoAssignMode
            ? `CSV processing complete!\n✅ Successfully processed: ${successCount} students\n❌ Errors: ${errorCount} students\n\nExam access has been granted based on student selections.`
            : `CSV processing complete!\n✅ Successfully validated: ${successCount} students\n❌ Errors: ${errorCount} students\n\nEnable "Auto-assign exam access" to grant permissions.`;

          alert(message);
          console.log('CSV processing summary:', { successCount, errorCount, total: csvData.length });

          // Refresh data
          window.location.reload();
        } catch (processingError) {
          console.error('Error during CSV processing:', processingError);
          alert(`Failed to process CSV: ${processingError.message}`);
        }
      };

      reader.onerror = () => {
        console.error('File reading error');
        alert('Failed to read the CSV file. Please try again.');
      };

      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Error setting up CSV processing:', error);
      alert('Failed to start CSV processing. Please try again.');
    } finally {
      setIsProcessingCsv(false);
    }
  };

  // Calculate stats
  const totalStudents = filteredStudents.length;
  const studentsWithAccess = currentExamId ? filteredStudents.filter(s => hasAccess(String(s.admissionId), currentExamId)).length : 0;
  const studentsWithoutAccess = currentExamId ? totalStudents - studentsWithAccess : 0;
  const accessRate = currentExamId && totalStudents > 0 ? Math.round((studentsWithAccess / totalStudents) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading exam access data...</p>
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
          <h1 className="text-2xl font-bold text-foreground">Exam Access Management</h1>
          <p className="text-muted-foreground">Control which students can access specific exams</p>
        </div>
        {admin?.role === 'superadmin' && (
          <button
            onClick={() => setIsCsvUploadOpen(!isCsvUploadOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Upload size={18} />
            <span>Import Student Data</span>
          </button>
        )}
      </div>

      {/* CSV Upload Section */}
      {isCsvUploadOpen && admin?.role === 'superadmin' && (
        <div className="mb-8 p-6 bg-card border border-border rounded-xl animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={24} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Bulk Student Data Import</h3>
              <p className="text-sm text-muted-foreground">Upload CSV file to automatically assign exam access based on student academic information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV should contain: admission_id, name, stream, section, and subject columns (mathematics, english, chemistry, etc.)
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <input
                      type="checkbox"
                      checked={autoAssignMode}
                      onChange={(e) => setAutoAssignMode(e.target.checked)}
                      className="rounded border-border"
                    />
                    Auto-assign exam access
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Automatically grant access to exams based on student's academic stream and enrolled subjects
                  </p>
                </div>
              </div>

              <div className="ml-4">
                <button
                  onClick={() => {
                    const csvContent = `admission_id,name,stream,section,mathematics,english,chemistry,physics,geography,history,sat,biology,economics
707070,TWEST TEEST,Natural,12A,true,true,true,true,false,false,true,true,false
707071,Kidus Anteneh,Social,12B,true,true,false,false,true,true,true,false,true
707072,Soliyana Mesfin,Natural,12C,true,true,true,true,false,false,false,true,false`;
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'student_data_template.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <Download size={16} />
                  <span>Download Template</span>
                </button>
              </div>
            </div>

            {csvPreview.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">CSV Preview (First 5 rows)</h4>
                <div className="bg-secondary/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-foreground whitespace-pre-wrap">
                    {JSON.stringify(csvPreview, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={processCsvAndAssignAccess}
                disabled={!csvFile || isProcessingCsv}
                className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingCsv ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-success-foreground border-t-transparent" />
                ) : (
                  <Upload size={16} />
                )}
                <span>{isProcessingCsv ? 'Processing...' : 'Process & Import'}</span>
              </button>

              {csvFile && (
                <button
                  onClick={() => {
                    console.log('Testing CSV processing...');
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const csvText = e.target?.result as string;
                      console.log('CSV raw text length:', csvText.length);
                      const parsedData = parseCSV(csvText);
                      console.log('Parsed data count:', parsedData.length);
                      console.log('First parsed row:', parsedData[0]);
                      alert(`CSV parsed successfully! Found ${parsedData.length} students. Check console for details.`);
                    };
                    reader.readAsText(csvFile);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText size={16} />
                  <span>Test CSV</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCsvFile(null);
                  setCsvPreview([]);
                  setAutoAssignMode(false);
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {currentExamId && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 animate-slide-up">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-display font-bold text-foreground">{totalStudents}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <p className="text-sm text-muted-foreground">Have Access</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-display font-bold text-success">{studentsWithAccess}</p>
              <UserCheck size={18} className="text-success" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <p className="text-sm text-muted-foreground">Access Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-display font-bold text-foreground">{accessRate}%</p>
              <TrendingUp size={18} className="text-primary" />
            </div>
          </div>
        </div>
      )}

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
          onChange={(e) => {
            setFilterExam(e.target.value);
            setCurrentExamId(e.target.value === 'all' ? '' : e.target.value);
            setSelectedStudents(new Set());
          }}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Select Exam</option>
          {uniqueExams.map(exam => (
            <option key={exam.id} value={exam.id}>{exam.title}</option>
          ))}
        </select>
        {currentExamId && (
          <select
            value={filterAccess}
            onChange={(e) => setFilterAccess(e.target.value)}
            className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Access Levels</option>
            <option value="has_access">Has Access</option>
            <option value="no_access">No Access</option>
          </select>
        )}
      </div>

      {!currentExamId ? (
        <div className="text-center py-12">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Select an Exam</h3>
          <p className="text-muted-foreground">Choose an exam from the dropdown above to manage student access permissions.</p>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-secondary/30 rounded-lg border border-border animate-slide-up" style={{ animationDelay: '350ms' }}>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                disabled={isBulkActionLoading}
              >
                {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? (
                  <CheckCircle size={16} className="text-primary" />
                ) : (
                  <div className="w-4 h-4 border-2 border-muted-foreground rounded" />
                )}
                <span className="text-sm font-medium">
                  {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0
                    ? 'Deselect All'
                    : 'Select All'
                  }
                </span>
              </button>
              <span className="text-sm text-muted-foreground">
                {selectedStudents.size} of {filteredStudents.length} selected
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBulkGrantAccess}
                disabled={selectedStudents.size === 0 || isBulkActionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkActionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-success-foreground border-t-transparent" />
                ) : (
                  <Unlock size={16} />
                )}
                <span className="text-sm font-medium">Grant Access</span>
              </button>

              <button
                onClick={handleBulkRevokeAccess}
                disabled={selectedStudents.size === 0 || isBulkActionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkActionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-destructive-foreground border-t-transparent" />
                ) : (
                  <Lock size={16} />
                )}
                <span className="text-sm font-medium">Revoke Access</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="w-12 px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Admission ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Class</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Section</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Access Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => {
                      const accessGranted = hasAccess(String(student.admissionId), currentExamId);

                      return (
                        <tr
                          key={String(student.admissionId)}
                          className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(String(student.admissionId))}
                              onChange={() => handleSelectStudent(String(student.admissionId))}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">{student.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="bg-secondary px-2 py-1 rounded text-sm text-foreground">{String(student.admissionId)}</code>
                          </td>
                          <td className="px-6 py-4 text-foreground">{student.class}</td>
                          <td className="px-6 py-4 text-foreground">{student.section}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleAccess(String(student.admissionId), currentExamId)}
                              className={`p-2 rounded-lg transition-colors ${
                                accessGranted
                                  ? 'bg-success/10 text-success hover:bg-success/20'
                                  : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                              }`}
                              title={accessGranted ? 'Student has access - click to revoke' : 'Student has no access - click to grant'}
                            >
                              {accessGranted ? <UserCheck size={16} /> : <UserX size={16} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No students found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamAccessPage;
