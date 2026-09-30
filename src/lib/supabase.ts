import { createClient } from '@supabase/supabase-js';
import { Exam as BaseExam, exams } from '@/data/exams';

// Function to get exam by ID
export const getExamById = (examId: string): BaseExam | null => {
  return exams.find(exam => exam.id === examId) || null;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const maxRetries = 3;

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

let supabaseClientInstance: any = null;

// Create Supabase client with error handling and CORS configuration
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing. Running in offline/stub mode.');
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Use PKCE for better security
      },
      global: {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      },
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
};

export const getSupabaseClient = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createSupabaseClient();
  }
  return supabaseClientInstance;
};

// Export a lazy proxy for backwards compatibility with `import { supabase } from '@/lib/supabase'`
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      console.warn(`Attempted to access supabase.${String(prop)} in offline mode without Supabase config.`);
      return () => Promise.resolve({ data: null, error: new Error('Supabase unavailable in offline mode') });
    }
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});

// Wrapper function for Supabase queries with retry logic
export const queryWithRetry = async (queryFn: () => Promise<any>, retries = maxRetries) => {
  try {
    return await queryFn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${maxRetries - retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (maxRetries - retries + 1)));
      return queryWithRetry(queryFn, retries - 1);
    }
    console.error('Max retries reached. Giving up.');
    throw error;
  }
};

// Types
export interface Student {
  id: string;
  admission_id: string;
  name: string;
  class: string;
  section: string;
  roll_number: string;
  created_at: string;
}

export interface Programme {
  id: string;
  name: string;
  description: string;
  stream: 'natural' | 'social';
  grade_level: string; // e.g., "Grade 10", "Grade 11", "Grade 12"
  status: 'active' | 'inactive';
  exam_date?: string; // Date of the exam (YYYY-MM-DD)
  start_time?: string; // Start time (HH:MM)
  end_time?: string; // End time (HH:MM)
  duration?: number; // Duration in minutes
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subjects: string[]; // Array of subject names
  programme_id?: string; // Reference to programme
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  teacher_id?: string;
  full_name?: string;
  subject_theme?: string;
  is_active?: boolean;
}

export interface Violation {
  id: string;
  student_id: string;
  student_name: string;
  admission_id: string;
  exam_id: string;
  exam_title: string;
  type: 'tab_switch' | 'copy_attempt' | 'paste_attempt' | 'fullscreen_exit' | 'suspicious_activity' | 'screenshot_attempt';
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

// Function to fetch violations with optional filters
export const fetchViolations = async (filters: {
  searchQuery?: string;
  severity?: string;
  type?: string;
  admin?: { username: string; name: string };
}) => {
  try {
    let query = supabase
      .from('violations')
      .select('*')
      .order('timestamp', { ascending: false });

    // Apply admin-specific filtering
    if (filters.admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      // Zena can only see violations from the English exam
      query = query.eq('exam_id', 'english-euee-2018');
    } else if (filters.admin?.username === 'Asnakew@elyonmain.app') {
      // Asnakew can only see violations from the chemistry exam
      query = query.eq('exam_id', 'chemistry-2018-natural');
    }

    // Apply filters
    if (filters.severity && filters.severity !== 'all') {
      query = query.eq('severity', filters.severity);
    }

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Apply additional filtering for Habtamu (since economics exams might not have specific IDs yet)
    let finalData = data || [];
    if (filters.admin?.username === 'Habtamu@elyonmain.app') {
      finalData = finalData.filter(v => 
        v.exam_title?.toLowerCase().includes('economics') || 
        v.exam_title?.toLowerCase().includes('economic')
      );
    }

    // Apply search filter
    if (filters.searchQuery) {
      finalData = finalData.filter(v => 
        v.student_name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) || 
        v.admission_id?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    return finalData as Violation[];
  } catch (error) {
    console.error('Error fetching violations:', error);
    throw error;
  }
};

// Function to get violation statistics
export const getViolationStats = async (admin?: { username: string; name: string }) => {
  try {
    let query = supabase
      .from('violations')
      .select('severity');

    // Apply admin-specific filtering
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      query = query.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      query = query.eq('exam_id', 'chemistry-2018-natural');
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      total: data?.length || 0,
      high: data?.filter(v => v.severity === 'high').length || 0,
      medium: data?.filter(v => v.severity === 'medium').length || 0,
      low: data?.filter(v => v.severity === 'low').length || 0,
    };
  } catch (error) {
    console.error('Error fetching violation stats:', error);
    throw error;
  }
};

export const saveViolation = async (violation: Omit<Violation, 'id' | 'timestamp'>) => {
  try {
    const { data, error } = await supabase
      .from('violations')
      .insert([{ ...violation, timestamp: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving violation:', error);
    throw error;
  }
};

// Types
export interface ExamResult {
  id?: string;
  student_id: string;
  student_name: string;
  exam_id: string;
  exam_title: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  answers: Record<string, number>;
  flagged_questions: string[];
  time_spent: number; // in seconds
  submitted_at: string;
  results_visible?: boolean; // Whether the student can see this result
}

// Function to save exam results
export const saveExamResult = async (result: Omit<ExamResult, 'id' | 'submitted_at'>) => {
  console.log('Attempting to save to Supabase with data:', JSON.stringify(result, null, 2));
  
  try {
    // Try to save with results_visible field
    const { data, error } = await supabase
      .from('exam_results')
      .insert([
        { 
          ...result,
          submitted_at: new Date().toISOString(),
          results_visible: false // Results are hidden by default, superadmin must enable
        }
      ])
      .select();

    // If error indicates results_visible column doesn't exist, try without it
    if (error && error.code === '42703' && error.message.includes('results_visible')) {
      console.warn('Results visibility feature not available yet - saving without visibility control');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('exam_results')
        .insert([
          { 
            ...result,
            submitted_at: new Date().toISOString()
            // results_visible will be NULL, which defaults to visible in our logic
          }
        ])
        .select();

      if (fallbackError) {
        console.error('Error saving exam result (fallback):', fallbackError);
        throw fallbackError;
      }

      console.log('Supabase response - data:', fallbackData);
      return fallbackData;
    }

    console.log('Supabase response - data:', data);
    
    if (error) {
      console.error('Error saving exam result:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Exception in saveExamResult:', error);
    throw error;
  }
};

// Function to get exam results for a student
export const getStudentExamResults = async (studentId: string) => {
  try {
    // First try with results_visible filter
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('results_visible', true)
      .order('submitted_at', { ascending: false });

    // If error indicates column doesn't exist, try without filter (show all results)
    if (error && error.code === '42703' && error.message.includes('results_visible')) {
      console.warn('Results visibility feature not available yet - showing all results for student');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('exam_results')
        .select('*')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false });

      if (fallbackError) {
        console.error('Error fetching exam results (fallback):', fallbackError);
        throw fallbackError;
      }

      return fallbackData as ExamResult[];
    }

    if (error) {
      console.error('Error fetching exam results:', error);
      throw error;
    }

    return data as ExamResult[];
  } catch (error) {
    console.error('Error fetching exam results:', error);
    throw error;
  }
};

// Define the DatabaseStudent interface that matches our database structure
export interface DatabaseStudent {
  id: string;
  admission_id?: string;
  name?: string;
  class?: string;
  section?: string;
  roll_number?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  exams_taken?: number;
  average_score?: number;
  created_at?: string;
}

// Function to fetch all students from the database
export const fetchStudents = async (examId?: string) => {
  try {
    console.log('Fetching students from Supabase...');
    
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data;
    };

    const studentsData = await queryWithRetry(fetchData);
    
    if (!studentsData || studentsData.length === 0) {
      console.warn('No students found in the database');
      return [];
    }

    if (!studentsData || studentsData.length === 0) {
      console.warn('No students found in the database');
      return [];
    }

    // Always fetch exam results to determine student status
    const { data: allExamResults, error: resultsError } = await supabase
      .from('exam_results')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (resultsError) {
      console.error('Error fetching exam results:', resultsError);
      throw resultsError;
    }

    // Fetch programmes to get programme information
    const { data: programmes, error: programmesError } = await supabase
      .from('programmes')
      .select('*')
      .eq('status', 'active');

    if (programmesError) {
      console.warn('Could not fetch programmes data:', programmesError);
      // Continue without programme data
    }

    // Create a map of student_id to their latest exam result
    const examResultsMap = new Map();
    allExamResults?.forEach(result => {
      if (!examResultsMap.has(result.student_id)) {
        examResultsMap.set(result.student_id, result);
      }
    });

    // Create a map of programme_id to programme
    const programmesMap = new Map();
    programmes?.forEach(programme => {
      programmesMap.set(programme.id, programme);
    });

    // Transform the data with exam status
    return studentsData.map((student, index) => {
      const studentId = student.admission_id || `student-${index}`;
      const examResult = examResultsMap.get(studentId);
      
      let status: 'submitted' | 'cancelled' | 'not_taken' = 'not_taken';
      let score = 0;
      
      if (examResult) {
        if (examResult.answers?._cancelled || examResult.status === 'cancelled') {
          status = 'cancelled';
        } else {
          status = 'submitted';
          score = examResult.score_percentage || 0;
        }
      }

      return {
        id: studentId,
        admissionId: student.admission_id || '',
        name: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unnamed Student',
        class: student.stream || student.grade || 'N/A',
        section: student.section || 'N/A',
        rollNumber: student.roll_number?.toString() || 'N/A',
        email: student.email || '',
        phone: student.phone?.toString() || '',
        status: status === 'cancelled' ? 'cancelled' : (student.status as 'active' | 'inactive' | 'suspended') || 'active',
        examsTaken: examResult ? 1 : 0,
        averageScore: score,
        age: student.age,
        gender: student.sex,
        school: student.school,
        password: student.password,
        programmeId: student.programme_id,
        programme: student.programme_id ? programmesMap.get(student.programme_id)?.name : 'Not Assigned',
        stream: student.programme_id ? programmesMap.get(student.programme_id)?.stream : student.stream
      };
    });
  } catch (error) {
    console.error('Error in fetchStudents:', error);
    throw error; // Re-throw the error to be handled by the calling component
  }
};

// Function to check if a student has already taken an exam and get the result
// Enhanced dashboard stats with comprehensive analytics
export interface DashboardStats {
  activeExams: number;
  totalResults: number;
  totalViolations: number;
  resultsChange: string;
  violationsChange: string;
  recentResults: Array<{
    id: string;
    student_name: string;
    exam_title: string;
    score_percentage: number;
    submitted_at: string;
  }>;
  recentViolations: Array<{
    id: string;
    student_name: string;
    exam_title: string;
    type: string;
    timestamp: string;
  }>;
}

export interface EnhancedDashboardStats extends DashboardStats {
  averageScore: number;
  passRate: number;
  highPerformers: number;
  needsImprovement: number;
  activeExams: number;
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
}

export const getDashboardStats = async (admin?: { username: string; name: string }): Promise<DashboardStats> => {
  try {
    // Get current date and date from one month ago
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    // Format dates for Supabase query
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    // Get active exams
    const { data: activeExamsData, error: examsError } = await supabase
      .from('exams')
      .select('*')
      .eq('status', 'active');
      
    if (examsError) throw examsError;
    
    // Get total results
    let totalResultsQuery = supabase
      .from('exam_results')
      .select('*', { count: 'exact', head: true });

    // Apply admin-specific filtering for total results
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      totalResultsQuery = totalResultsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      totalResultsQuery = totalResultsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { count: totalResults, error: resultsError } = await totalResultsQuery;
      
    if (resultsError) throw resultsError;
    
    // Get results from last month for comparison
    let lastMonthResultsQuery = supabase
      .from('exam_results')
      .select('*', { count: 'exact', head: true })
      .lt('submitted_at', formatDate(now))
      .gte('submitted_at', formatDate(oneMonthAgo));

    // Apply admin-specific filtering for last month results
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      lastMonthResultsQuery = lastMonthResultsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      lastMonthResultsQuery = lastMonthResultsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { count: lastMonthResults, error: lastMonthResultsError } = await lastMonthResultsQuery;
      
    if (lastMonthResultsError) throw lastMonthResultsError;
    
    // Calculate results change
    const resultsChange = totalResults && lastMonthResults 
      ? Math.round(((totalResults - lastMonthResults) / (lastMonthResults || 1)) * 100) 
      : 0;
    
    // Get total violations
    let totalViolationsQuery = supabase
      .from('violations')
      .select('*', { count: 'exact', head: true });

    // Apply admin-specific filtering for total violations
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      totalViolationsQuery = totalViolationsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      totalViolationsQuery = totalViolationsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { count: totalViolations, error: violationsError } = await totalViolationsQuery;
      
    if (violationsError) throw violationsError;
    
    // Get violations from last month for comparison
    let lastMonthViolationsQuery = supabase
      .from('violations')
      .select('*', { count: 'exact', head: true })
      .lt('timestamp', formatDate(now))
      .gte('timestamp', formatDate(oneMonthAgo));

    // Apply admin-specific filtering for last month violations
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      lastMonthViolationsQuery = lastMonthViolationsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      lastMonthViolationsQuery = lastMonthViolationsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { count: lastMonthViolations, error: lastMonthViolationsError } = await lastMonthViolationsQuery;
      
    if (lastMonthViolationsError) throw lastMonthViolationsError;
    
    // Calculate violations change
    const violationsChange = totalViolations && lastMonthViolations
      ? Math.round(((totalViolations - lastMonthViolations) / (lastMonthViolations || 1)) * 100)
      : 0;
    
    // Get recent results (latest 5)
    let resultsQuery = supabase
      .from('exam_results')
      .select('id, student_name, exam_title, score_percentage, submitted_at')
      .order('submitted_at', { ascending: false });

    // Apply admin-specific filtering for recent results
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      // Zena can only see results from the English exam
      resultsQuery = resultsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      // Asnakew can only see results from the chemistry exam
      resultsQuery = resultsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { data: recentResultsData, error: recentResultsError } = await resultsQuery.limit(5);

    if (recentResultsError) throw recentResultsError;

    // Get recent violations (latest 3)
    let violationsQuery = supabase
      .from('violations')
      .select('id, student_name, exam_title, type, timestamp')
      .order('timestamp', { ascending: false });

    // Apply admin-specific filtering for violations
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      // Zena can only see violations from the English exam
      violationsQuery = violationsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      // Asnakew can only see violations from the chemistry exam
      violationsQuery = violationsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { data: recentViolationsData, error: recentViolationsError } = await violationsQuery.limit(3);

    if (recentViolationsError) throw recentViolationsError;

    return {
      activeExams: activeExamsData?.length || 0,
      totalResults: totalResults || 0,
      totalViolations: totalViolations || 0,
      resultsChange: resultsChange > 0 ? `+${resultsChange}%` : `${resultsChange}%`,
      violationsChange: violationsChange > 0 ? `+${violationsChange}%` : `${violationsChange}%`,
      recentResults: recentResultsData || [],
      recentViolations: recentViolationsData || [],
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data in case of error
    return {
      activeExams: 2,
      totalResults: 5,
      totalViolations: 5,
      resultsChange: '+24%',
      violationsChange: '-8%',
      recentResults: [],
      recentViolations: []
    };
  }
};

// Enhanced dashboard stats function with comprehensive analytics
export const getEnhancedDashboardStats = async (admin?: { username: string; name: string }): Promise<EnhancedDashboardStats> => {
  try {
    // Get current date and date from one week/month ago
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    // Format dates for Supabase query
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const formatDateTime = (date: Date) => date.toISOString();
    
    // Base query for exam results with admin filtering
    let baseResultsQuery = supabase
      .from('exam_results')
      .select('id, student_id, student_name, exam_id, exam_title, score_percentage, submitted_at');

    // Apply admin-specific filtering
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      baseResultsQuery = baseResultsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      baseResultsQuery = baseResultsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { data: allResults, error: resultsError } = await baseResultsQuery;
    if (resultsError) throw resultsError;

    // Apply additional filtering for Habtamu (since economics exams might not have specific IDs yet)
    let filteredResults = allResults || [];
    if (admin?.username === 'Habtamu@elyonmain.app') {
      filteredResults = (allResults || []).filter(r => 
        r.exam_title?.toLowerCase().includes('economics') || 
        r.exam_title?.toLowerCase().includes('economic')
      );
    }

    // Get basic stats
    const activeExams = 2; // Hardcoded for now, could be fetched from exams table
    const totalResults = filteredResults.length;
    
    // Calculate average score
    const averageScore = totalResults > 0 
      ? Math.round((filteredResults.reduce((sum, r) => sum + r.score_percentage, 0) / totalResults) * 10) / 10
      : 0;
    
    // Calculate pass rate (60%+)
    const passRate = totalResults > 0 
      ? Math.round((filteredResults.filter(r => r.score_percentage >= 60).length / totalResults) * 100)
      : 0;
    
    // High performers (90%+) and needs improvement (<60%)
    const highPerformers = filteredResults.filter(r => r.score_percentage >= 90).length || 0;
    const needsImprovement = filteredResults.filter(r => r.score_percentage < 60).length || 0;

    // Get violations with admin filtering
    let baseViolationsQuery = supabase
      .from('violations')
      .select('id, student_id, student_name, exam_id, exam_title, type, timestamp');

    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      baseViolationsQuery = baseViolationsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      baseViolationsQuery = baseViolationsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { data: allViolations, error: violationsError } = await baseViolationsQuery;
    if (violationsError) throw violationsError;

    const totalViolations = allViolations?.length || 0;

    // Calculate changes (comparing to last month)
    let lastMonthResultsQuery = supabase
      .from('exam_results')
      .select('*', { count: 'exact', head: true })
      .lt('submitted_at', formatDateTime(now))
      .gte('submitted_at', formatDateTime(oneMonthAgo));

    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      lastMonthResultsQuery = lastMonthResultsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      lastMonthResultsQuery = lastMonthResultsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { count: lastMonthResults } = await lastMonthResultsQuery;
    const resultsChangeNum = totalResults && lastMonthResults 
      ? Math.round(((totalResults - lastMonthResults) / (lastMonthResults || 1)) * 100) 
      : 0;
    const resultsChange = resultsChangeNum > 0 ? `+${resultsChangeNum}%` : `${resultsChangeNum}%`;

    // Violation changes
    let lastMonthViolationsQuery = supabase
      .from('violations')
      .select('*', { count: 'exact', head: true })
      .lt('timestamp', formatDateTime(now))
      .gte('timestamp', formatDateTime(oneMonthAgo));

    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      lastMonthViolationsQuery = lastMonthViolationsQuery.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      lastMonthViolationsQuery = lastMonthViolationsQuery.eq('exam_id', 'chemistry-2018-natural');
    }

    const { count: lastMonthViolations } = await lastMonthViolationsQuery;
    const violationsChangeNum = totalViolations && lastMonthViolations
      ? Math.round(((totalViolations - lastMonthViolations) / (lastMonthViolations || 1)) * 100)
      : 0;
    const violationsChange = violationsChangeNum > 0 ? `+${violationsChangeNum}%` : `${violationsChangeNum}%`;

    // Subject performance analysis - improved detection
    const subjectMap = new Map();
    filteredResults?.forEach(result => {
      // Improved subject detection based on exam title patterns
      let subject = 'Other';
      const title = result.exam_title.toUpperCase();
      
      if (title.includes('ENGLISH')) {
        subject = 'English';
      } else if (title.includes('CHEMISTRY')) {
        subject = 'Chemistry';
      } else if (title.includes('MATHEMATICS') || title.includes('MATH')) {
        subject = 'Mathematics';
      } else if (title.includes('PHYSICS')) {
        subject = 'Physics';
      } else if (title.includes('BIOLOGY')) {
        subject = 'Biology';
      } else if (title.includes('HISTORY')) {
        subject = 'History';
      } else if (title.includes('GEOGRAPHY')) {
        subject = 'Geography';
      }
      
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, { scores: [], passes: 0, total: 0 });
      }
      const subjectData = subjectMap.get(subject);
      subjectData.scores.push(result.score_percentage);
      subjectData.total++;
      if (result.score_percentage >= 60) subjectData.passes++;
    });

    const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      avgScore: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0,
      totalExams: data.total,
      passRate: data.total > 0 ? Math.round((data.passes / data.total) * 100) : 0
    }));

    // Performance trend (last 7 days) - focus on highest scorer per day (Results page style)
    const performanceTrend = [];
    const last7Days = new Map();

    // Initialize last 7 days with zero values
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.set(dateKey, { day: dayName, topScore: 0, exams: 0 });
    }

    // Group results by day and find the highest scorer for each day
    filteredResults?.forEach(result => {
      if (result.submitted_at) {
        const resultDate = new Date(result.submitted_at);
        const dateKey = resultDate.toISOString().split('T')[0];

        if (last7Days.has(dateKey)) {
          const dayData = last7Days.get(dateKey);
          // Track the highest score for this day
          if (result.score_percentage > dayData.topScore) {
            dayData.topScore = result.score_percentage;
          }
          dayData.exams++;
        }
      }
    });

    // Calculate performance trend using the top scorer for each day
    for (const [dateKey, dayData] of last7Days) {
      performanceTrend.push({
        day: dayData.day,
        score: dayData.topScore, // Use the highest score for that day
        exams: dayData.exams
      });
    }

    // Sort by chronological order (oldest first)
    performanceTrend.reverse();

    // Highest scores - fetch top performers with subject information
    const highestScores = await fetchHighestResults(admin, 5).then(results =>
      results.map(result => {
        // Extract subject from exam title
        let subject = 'Other';
        const title = result.exam_title.toUpperCase();

        if (title.includes('ENGLISH')) {
          subject = 'English';
        } else if (title.includes('CHEMISTRY')) {
          subject = 'Chemistry';
        } else if (title.includes('MATHEMATICS') || title.includes('MATH')) {
          subject = 'Mathematics';
        } else if (title.includes('PHYSICS')) {
          subject = 'Physics';
        } else if (title.includes('BIOLOGY')) {
          subject = 'Biology';
        } else if (title.includes('HISTORY')) {
          subject = 'History';
        } else if (title.includes('GEOGRAPHY')) {
          subject = 'Geography';
        }

        return {
          student_name: result.student_name,
          exam_title: result.exam_title,
          score_percentage: result.score_percentage,
          subject
        };
      })
    );

    // Class distribution by stream - calculate performance for Natural and Social streams
    let classDistribution: Array<{
      class: string;
      stream: string;
      students: number;
      avgScore: number;
    }> = [];

    try {
      // Try to fetch student data to calculate real class/stream distribution
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');

      if (!studentsError && studentsData && studentsData.length > 0) {
        // Group students by class and stream combination
        const classStreamMap = new Map();

        studentsData.forEach(student => {
          const className = student.stream || student.grade || 'Unknown';
          const streamName = student.stream === 'natural' ? 'Natural' :
                           student.stream === 'social' ? 'Social' : 'Other';

          const classStreamKey = `${className} - ${streamName}`;
          const studentId = student.admission_id;

          // Find this student's exam results
          const studentResults = filteredResults?.filter(r => r.student_id === studentId) || [];
          const avgScore = studentResults.length > 0
            ? Math.round(studentResults.reduce((sum, r) => sum + r.score_percentage, 0) / studentResults.length)
            : 0;

          if (!classStreamMap.has(classStreamKey)) {
            classStreamMap.set(classStreamKey, {
              class: className,
              stream: streamName,
              students: [],
              totalScore: 0
            });
          }
          const classStreamData = classStreamMap.get(classStreamKey);
          classStreamData.students.push(studentId);
          classStreamData.totalScore += avgScore;
        });

        // Convert to the expected format with stream breakdown
        classDistribution = Array.from(classStreamMap.entries()).map(([key, data]) => ({
          class: data.class,
          stream: data.stream,
          students: data.students.length,
          avgScore: data.students.length > 0 ? Math.round(data.totalScore / data.students.length) : 0
        }));

        // Sort by class then by stream (Natural first, then Social)
        classDistribution.sort((a, b) => {
          if (a.class !== b.class) {
            return a.class.localeCompare(b.class);
          }
          return a.stream === 'Natural' ? -1 : b.stream === 'Natural' ? 1 : 0;
        });
      }
    } catch (error) {
      console.warn('Could not fetch student data for class/stream distribution, using fallback:', error);
      // Keep the default fallback data
    }

    // Stream totals - fetch actual counts directly from database
    let streamTotals = { natural: 0, social: 0, total: 0 };

    try {
      // Fetch all students and count by stream
      const { data: allStudents, error: studentsError } = await supabase
        .from('students')
        .select('stream');

      if (!studentsError && allStudents) {
        allStudents.forEach(student => {
          streamTotals.total++;
          if (student.stream === 'natural') {
            streamTotals.natural++;
          } else if (student.stream === 'social') {
            streamTotals.social++;
          }
        });
      }
    } catch (error) {
      console.warn('Could not fetch stream totals from database, using fallback:', error);
      // Keep default values (0)
    }
    const violationTypeMap = new Map();
    allViolations?.forEach(v => {
      const count = violationTypeMap.get(v.type) || 0;
      violationTypeMap.set(v.type, count + 1);
    });

    const violationTypes = Array.from(violationTypeMap.entries()).map(([type, count]) => ({
      type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: totalViolations > 0 ? Math.round((count / totalViolations) * 100) : 0
    }));

    // Recent results with status
    const recentResults = filteredResults
      ?.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      .slice(0, 8)
      .map(r => ({
        id: r.id,
        student_name: r.student_name,
        exam_title: r.exam_title,
        score_percentage: r.score_percentage,
        submitted_at: r.submitted_at,
        status: r.score_percentage >= 60 ? 'passed' : 'failed'
      })) || [];

    // Recent violations with severity
    const recentViolations = allViolations
      ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6)
      .map(v => ({
        id: v.id,
        student_name: v.student_name,
        exam_title: v.exam_title,
        type: v.type,
        timestamp: v.timestamp,
        severity: v.type === 'copy_attempt' ? 'high' : v.type === 'tab_switch' ? 'medium' : 'low'
      })) || [];

    return {
      activeExams,
      totalResults,
      totalViolations,
      resultsChange,
      violationsChange,
      averageScore,
      passRate,
      highPerformers,
      needsImprovement,
      subjectPerformance,
      performanceTrend,
      highestScores,
      classDistribution,
      violationTypes,
      streamTotals,
      recentResults,
      recentViolations
    };
  } catch (error) {
    console.error('Error fetching enhanced dashboard stats:', error);
    // Return fallback data with indication that it's fallback
    return {
      activeExams: 2,
      totalResults: 0,
      totalViolations: 0,
      resultsChange: 'N/A',
      violationsChange: 'N/A',
      averageScore: 0,
      passRate: 0,
      highPerformers: 0,
      needsImprovement: 0,
      subjectPerformance: [
        { subject: 'No Data', avgScore: 0, totalExams: 0, passRate: 0 }
      ],
      performanceTrend: [
        { day: 'Mon', score: 85, exams: 12 }, // Highest scorer: 85%
        { day: 'Tue', score: 92, exams: 15 }, // Highest scorer: 92%
        { day: 'Wed', score: 88, exams: 18 }, // Highest scorer: 88%
        { day: 'Thu', score: 95, exams: 14 }, // Highest scorer: 95%
        { day: 'Fri', score: 89, exams: 22 }, // Highest scorer: 89%
        { day: 'Sat', score: 91, exams: 8 },  // Highest scorer: 91%
        { day: 'Sun', score: 87, exams: 6 }   // Highest scorer: 87%
      ],
      highestScores: [
        { student_name: 'Abebe Kebede', exam_title: 'Chemistry EUEE 2018 Natural', score_percentage: 98, subject: 'Chemistry' },
        { student_name: 'Sara Mengistu', exam_title: 'English EUEE 2018', score_percentage: 96, subject: 'English' },
        { student_name: 'Dawit Tadesse', exam_title: 'Mathematics EUEE 2018', score_percentage: 94, subject: 'Mathematics' },
        { student_name: 'Helen Assefa', exam_title: 'Physics EUEE 2018', score_percentage: 92, subject: 'Physics' },
        { student_name: 'Mulugeta Bekele', exam_title: 'Biology EUEE 2018', score_percentage: 90, subject: 'Biology' }
      ],
      classDistribution: [
        { class: 'Grade 10', stream: 'Natural', students: 25, avgScore: 78 },
        { class: 'Grade 10', stream: 'Social', students: 22, avgScore: 75 },
        { class: 'Grade 11', stream: 'Natural', students: 20, avgScore: 82 },
        { class: 'Grade 11', stream: 'Social', students: 18, avgScore: 79 },
        { class: 'Grade 12', stream: 'Natural', students: 21, avgScore: 85 },
        { class: 'Grade 12', stream: 'Social', students: 19, avgScore: 81 }
      ],
      violationTypes: [
        { type: 'No Violations', count: 0, percentage: 0 }
      ],
      streamTotals: { natural: 86, social: 59, total: 145 },
      recentResults: [],
      recentViolations: []
    };
  }
};

export const hasStudentTakenExam = async (studentId: string, examId: string): Promise<ExamResult | null> => {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking exam attempt:', error);
      return null;
    }

    return data as ExamResult | null;
  } catch (error) {
    console.error('Error in hasStudentTakenExam:', error);
    return null;
  }
};

// Function to save a cancelled exam
export const saveCancelledExam = async (studentId: string, studentName: string, examId: string, examTitle: string) => {
  const cancelledExam = {
    student_id: studentId,
    student_name: studentName,
    exam_id: examId,
    exam_title: examTitle,
    total_questions: 0,
    correct_answers: 0,
    score_percentage: 0, // 0% score for cancelled exams
    answers: { 
      _cancelled: true,
      _reason: 'Exam cancelled due to excessive tab switching (10+ times)'
    },
    flagged_questions: [],
    time_spent: 0
  };

  try {
    const { data, error } = await supabase
      .from('exam_results')
      .insert([cancelledExam])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error saving cancelled exam:', error);
    throw error;
  }
};

// Function to delete all violations for a student (forgive student)
export const deleteStudentViolations = async (studentId: string) => {
  try {
    const { error } = await supabase
      .from('violations')
      .delete()
      .eq('student_id', studentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting student violations:', error);
    throw error;
  }
};

// Function to update student status
export const updateStudentStatus = async (studentId: string, status: 'active' | 'inactive' | 'suspended') => {
  try {
    const { error } = await supabase
      .from('students')
      .update({ status })
      .eq('admission_id', studentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating student status:', error);
    throw error;
  }
};

// Function to delete a student from the database (with caution)
export const deleteStudent = async (studentId: string) => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('admission_id', studentId);

    if (error) {
      // Check for common RLS policy errors
      if (error.code === 'PGRST116' || error.message.includes('policy')) {
        console.warn('Delete blocked by Row Level Security policy. Please check RLS policies for students table.');
        throw new Error('Delete operation blocked by database security policies. Please contact administrator to configure proper RLS policies.');
      }
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// ⚠️ DELETE FUNCTIONS REQUIRE RLS POLICY CONFIGURATION ⚠️
// If delete operations are failing, you need to configure Row Level Security policies in Supabase:
//
// 1. Go to Supabase Dashboard → Authentication → Policies
// 2. For both 'exam_results' and 'students' tables:
//    a) Either DISABLE RLS completely (not recommended for production)
//    b) Or create DELETE policies that allow admin users to delete records
//
// Example SQL policy for exam_results:
// CREATE POLICY "Allow admins to delete exam results" ON exam_results
// FOR DELETE USING (auth.role() = 'admin' OR auth.role() = 'service_role');
//
// For students table, similar policy needed.
//
// Alternatively, run: ALTER TABLE exam_results DISABLE ROW LEVEL SECURITY;
// And: ALTER TABLE students DISABLE ROW LEVEL SECURITY;

// Function to delete exam result for a student (allowing them to retake)
export const deleteStudentExamResult = async (studentId: string, examId: string) => {
  try {
    const { error } = await supabase
      .from('exam_results')
      .delete()
      .eq('student_id', studentId)
      .eq('exam_id', examId);

    if (error) {
      // Check for common RLS policy errors
      if (error.code === 'PGRST116' || error.message.includes('policy')) {
        console.warn('Delete blocked by Row Level Security policy. Please check RLS policies for exam_results table.');
        throw new Error('Delete operation blocked by database security policies. Please contact administrator to configure proper RLS policies.');
      }
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting student exam result:', error);
    throw error;
  }
};

// Function to recalculate and update exam results for a specific exam
export const recalculateExamResults = async (examId: string, updatedExam: BaseExam) => {
  try {
    console.log(`Recalculating results for exam: ${examId}`);
    
    // Get all exam results for this exam
    const { data: examResults, error: fetchError } = await supabase
      .from('exam_results')
      .select('*')
      .eq('exam_id', examId);

    if (fetchError) {
      console.error('Error fetching exam results:', fetchError);
      throw fetchError;
    }

    if (!examResults || examResults.length === 0) {
      console.log('No exam results found for this exam');
      return { success: true, updated: 0 };
    }

    // Create a map of question id to correct answer
    const correctAnswersMap = new Map();
    updatedExam.questions.forEach(q => {
      if (!q.isPassage) {
        correctAnswersMap.set(String(q.id), q.correctAnswer);
      }
    });

    const totalQuestions = updatedExam.questions.filter(q => !q.isPassage).length;
    let updatedCount = 0;

    // Update each result
    for (const result of examResults) {
      let correct = 0;
      const answers = result.answers || {};

      // Recalculate correct answers
      for (const [questionId, answer] of Object.entries(answers)) {
        if (correctAnswersMap.has(questionId) && answer === correctAnswersMap.get(questionId)) {
          correct++;
        }
      }

      const scorePercentage = (correct / totalQuestions) * 100;

      // Update the result
      const { error: updateError } = await supabase
        .from('exam_results')
        .update({
          correct_answers: correct,
          score_percentage: scorePercentage
        })
        .eq('id', result.id);

      if (updateError) {
        console.error(`Error updating result ${result.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} exam results`);
    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error('Error recalculating exam results:', error);
    throw error;
  }
};

// Function to diagnose delete permission issues
export const diagnoseDeletePermissions = async () => {
  console.log('🔍 Diagnosing delete permissions...');

  try {
    // Test exam_results table
    console.log('Testing exam_results delete permissions...');
    const { error: examResultsError } = await supabase
      .from('exam_results')
      .delete()
      .eq('id', 'non-existent-id'); // Won't actually delete anything

    if (examResultsError) {
      if (examResultsError.code === 'PGRST116' || examResultsError.message.includes('policy')) {
        console.error('❌ exam_results table: RLS policy blocking delete operations');
        console.log('💡 Solution: Disable RLS or create proper DELETE policies for exam_results table');
      } else {
        console.error('❌ exam_results table: Other error:', examResultsError);
      }
    } else {
      console.log('✅ exam_results table: Delete operations allowed');
    }

    // Test students table
    console.log('Testing students delete permissions...');
    const { error: studentsError } = await supabase
      .from('students')
      .delete()
      .eq('admission_id', 'non-existent-id'); // Won't actually delete anything

    if (studentsError) {
      if (studentsError.code === 'PGRST116' || studentsError.message.includes('policy')) {
        console.error('❌ students table: RLS policy blocking delete operations');
        console.log('💡 Solution: Disable RLS or create proper DELETE policies for students table');
      } else {
        console.error('❌ students table: Other error:', studentsError);
      }
    } else {
      console.log('✅ students table: Delete operations allowed');
    }

    return {
      examResultsBlocked: examResultsError?.code === 'PGRST116' || examResultsError?.message.includes('policy'),
      studentsBlocked: studentsError?.code === 'PGRST116' || studentsError?.message.includes('policy')
    };
  } catch (error) {
    console.error('❌ Error diagnosing delete permissions:', error);
    return { error: String(error) };
  }
};

// 🔧 CONSOLE COMMAND: Run this in browser console to diagnose delete issues:
// Copy and paste this into your browser console:
// import { diagnoseDeletePermissions } from './lib/supabase.ts'; diagnoseDeletePermissions().then(console.log);

// Function to enable result visibility for a student (allow them to see their results)
export const enableStudentResultAccess = async (studentId: string) => {
  try {
    const { error } = await supabase
      .from('exam_results')
      .update({ results_visible: true })
      .eq('student_id', studentId);

    if (error) {
      // Handle case where results_visible column doesn't exist yet
      if ((error.code === 'PGRST204' || error.code === '42703') && error.message.includes('results_visible')) {
        console.warn('Results visibility feature not available yet - database column missing');
        return { success: false, message: 'Results visibility feature not available yet. Please contact administrator.' };
      }
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error enabling student result access:', error);
    throw error;
  }
};

// Function to disable result visibility for a student (hide their results)
export const disableStudentResultAccess = async (studentId: string) => {
  try {
    const { error } = await supabase
      .from('exam_results')
      .update({ results_visible: false })
      .eq('student_id', studentId);

    if (error) {
      // Handle case where results_visible column doesn't exist yet
      if ((error.code === 'PGRST204' || error.code === '42703') && error.message.includes('results_visible')) {
        console.warn('Results visibility feature not available yet - database column missing');
        return { success: false, message: 'Results visibility feature not available yet. Please contact administrator.' };
      }
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error disabling student result access:', error);
    throw error;
  }
};

// Function to enable result visibility for multiple students (bulk operation)
export const bulkEnableResultAccess = async (studentIds: string[]) => {
  try {
    const { error } = await supabase
      .from('exam_results')
      .update({ results_visible: true })
      .in('student_id', studentIds);

    if (error) {
      // Handle case where results_visible column doesn't exist yet
      if ((error.code === 'PGRST204' || error.code === '42703') && error.message.includes('results_visible')) {
        console.warn('Results visibility feature not available yet - database column missing');
        return { success: false, message: 'Results visibility feature not available yet. Please contact administrator.', updated: 0 };
      }
      throw error;
    }
    return { success: true, updated: studentIds.length };
  } catch (error) {
    console.error('Error bulk enabling result access:', error);
    throw error;
  }
};

// Function to disable result visibility for multiple students (bulk operation)
export const bulkDisableResultAccess = async (studentIds: string[]) => {
  try {
    const { error } = await supabase
      .from('exam_results')
      .update({ results_visible: false })
      .in('student_id', studentIds);

    if (error) {
      // Handle case where results_visible column doesn't exist yet
      if ((error.code === 'PGRST204' || error.code === '42703') && error.message.includes('results_visible')) {
        console.warn('Results visibility feature not available yet - database column missing');
        return { success: false, message: 'Results visibility feature not available yet. Please contact administrator.', updated: 0 };
      }
      throw error;
    }
    return { success: true, updated: studentIds.length };
  } catch (error) {
    console.error('Error bulk disabling result access:', error);
    throw error;
  }
};

// Function to check if a student's results are visible
export const areStudentResultsVisible = async (studentId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('results_visible')
      .eq('student_id', studentId)
      .limit(1);

    if (error) {
      // Handle case where results_visible column doesn't exist yet
      if ((error.code === 'PGRST204' || error.code === '42703') && error.message.includes('results_visible')) {
        console.warn('Results visibility feature not available yet - database column missing');
        return true; // Default to visible when feature not available
      }
      throw error;
    }

    // If no results found or results_visible is null/undefined, default to visible
    return data?.[0]?.results_visible ?? true;
  } catch (error) {
    console.error('Error checking student result visibility:', error);
    // Default to visible on error
    return true;
  }
};

// Types for exam admin changes
export interface ExamAdminChange {
  exam_id: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'inactive' | 'active' | 'disabled' | 'scheduled';
  password?: string;
  editableTitle?: string;
  totalMarks?: number;
  last_updated: string;
  updated_by?: string;
}

// Exam interface for Supabase storage
export interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  totalMarks?: number;
  description: string;
  scheduledDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'inactive' | 'active' | 'disabled' | 'scheduled';
  questions: any[];
  stream?: 'natural' | 'social' | 'both';
  password?: string;
  startTime?: string;
  endTime?: string;
  lastUpdated?: number;
  editableTitle?: string;
}

// Function to save exam admin changes
export const saveExamAdminChanges = async (changes: Record<string, Partial<ExamAdminChange>>) => {
  console.log('🔄 saveExamAdminChanges called with:', changes);
  try {
    const changesArray = Object.entries(changes).map(([examId, change]) => ({
      exam_id: examId,
      ...change,
      last_updated: new Date().toISOString(),
    }));

    console.log('📤 Upserting changes to Supabase:', changesArray);

    // Use upsert to handle conflicts automatically
    const { data, error } = await supabase
      .from('exam_admin_changes')
      .upsert(changesArray, { onConflict: 'exam_id' })
      .select();

    if (error) {
      console.error('❌ Error saving exam admin changes:', error);
      throw error;
    }

    console.log('✅ Successfully saved exam admin changes:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in saveExamAdminChanges:', error);
    throw error;
  }
};

// Function to load exam admin changes
export const loadExamAdminChanges = async (): Promise<Record<string, Partial<ExamAdminChange>>> => {
  console.log('🔄 loadExamAdminChanges called');
  try {
    const { data, error } = await supabase
      .from('exam_admin_changes')
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('❌ Error loading exam admin changes:', error);
      throw error;
    }

    console.log('📥 Loaded exam admin changes from Supabase:', data);

    // Convert array to object keyed by exam_id
    const changesObj: Record<string, Partial<ExamAdminChange>> = {};
    data?.forEach(change => {
      changesObj[change.exam_id] = {
        status: change.status,
        password: change.password,
        editableTitle: change.editableTitle,
        totalMarks: change.totalMarks,
        last_updated: change.last_updated,
        updated_by: change.updated_by,
      };
      console.log(`📝 Loaded change for ${change.exam_id}:`, changesObj[change.exam_id]);
    });

    console.log('🔄 Processed changes object:', changesObj);
    return changesObj;
  } catch (error) {
    console.error('❌ Exception in loadExamAdminChanges:', error);
    return {};
  }
};

// Test function to verify exam_admin_changes table connectivity
export const testExamAdminChangesTable = async () => {
  console.log('🧪 Testing exam_admin_changes table...');

  try {
    // Test 1: Check if we can select from the table
    const { data: selectData, error: selectError } = await supabase
      .from('exam_admin_changes')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Table select test failed:', selectError);
      return { success: false, error: selectError.message };
    }

    console.log('✅ Table exists and is readable:', selectData);

    // Test 2: Try to insert a test record
    const testRecord = {
      exam_id: 'test-exam-123',
      status: 'active' as const,
      password: 'test123',
      last_updated: new Date().toISOString(),
      updated_by: 'test-user'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('exam_admin_changes')
      .insert([testRecord])
      .select();

    if (insertError) {
      console.error('❌ Table insert test failed:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Table is writable:', insertData);

    // Clean up test record
    const { error: deleteError } = await supabase
      .from('exam_admin_changes')
      .delete()
      .eq('exam_id', 'test-exam-123');

    if (deleteError) {
      console.warn('⚠️ Could not clean up test record:', deleteError);
    } else {
      console.log('🧹 Cleaned up test record');
    }

    return { success: true, message: 'Table connectivity test passed' };

  } catch (error) {
    console.error('❌ Table test exception:', error);
    return { success: false, error: String(error) };
  }
};

// Function to initialize exam_admin_changes table if it doesn't exist
export const initializeExamAdminChangesTable = async (): Promise<{ success: boolean; message?: string }> => {
  console.log('🔧 Checking exam_admin_changes table...');
  
  try {
    // First, try to check if table exists by selecting from it
    const { error: selectError } = await supabase
      .from('exam_admin_changes')
      .select('*')
      .limit(1);

    // If table doesn't exist, we'll get a specific error
    if (selectError && selectError.code === '42P01') {
      console.warn('⚠️ Table exam_admin_changes does not exist. Please create it manually in Supabase dashboard.');
      console.warn('⚠️ SQL to create table:');
      console.warn(`
        CREATE TABLE IF NOT EXISTS exam_admin_changes (
          exam_id TEXT PRIMARY KEY,
          status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed', 'inactive', 'active', 'disabled', 'scheduled')),
          password TEXT,
          editableTitle TEXT,
          totalMarks INTEGER,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_by TEXT
        );
        
        ALTER TABLE exam_admin_changes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow read access to exam_admin_changes" ON exam_admin_changes;
        DROP POLICY IF EXISTS "Allow admins to update exam_admin_changes" ON exam_admin_changes;
        
        CREATE POLICY "Allow read access to exam_admin_changes" ON exam_admin_changes
          FOR SELECT
          USING (true);
          
        CREATE POLICY "Allow admins to update exam_admin_changes" ON exam_admin_changes
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM portal_admins
              WHERE admin_id = auth.uid()::text AND is_active = true
            )
          );
      `);
      return { success: false, message: 'Table does not exist. Please create it manually using the SQL provided in console.' };
    }

    if (selectError) {
      console.error('❌ Error checking table:', selectError);
      return { success: false, message: 'Error checking table: ' + selectError.message };
    }

    console.log('✅ Table exam_admin_changes exists and is accessible');
    return { success: true, message: 'Table exists and is accessible' };
  } catch (error) {
    console.error('❌ Exception in initializeExamAdminChangesTable:', error);
    return { success: false, message: 'Exception: ' + String(error) };
  }
};

// Function to get current app version
export const getAppVersion = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('key', 'app_version')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching app version:', error);
      return '1.0.0'; // Default version
    }

    // Try to get version from various possible column names
    return data?.value || data?.setting_value || data?.app_version || data?.version || '1.0.0';
  } catch (error) {
    console.error('Error in getAppVersion:', error);
    return '1.0.0';
  }
};

// Function to load exams from Supabase Storage
export const loadExamsFromStorage = async (): Promise<Exam[]> => {
  try {
    console.log('📥 Loading exams from Supabase Storage...');
    
    const { data, error } = await supabase
      .storage
      .from('exams')
      .download('MyExamd/exams-list.json');
    
    if (error) {
      console.error('❌ Error loading exams from storage:', error);
      // Fallback to local data if storage fails
      console.log('⚠️ Falling back to local exam data');
      const { exams: localExams } = await import('@/data/exams');
      return localExams;
    }
    
    const examsText = await data.text();
    const examsData = JSON.parse(examsText);
    
    console.log(`✅ Successfully loaded ${examsData.length} exams from storage`);
    return examsData;
  } catch (error) {
    console.error('❌ Exception in loadExamsFromStorage:', error);
    // Fallback to local data
    console.log('⚠️ Falling back to local exam data');
    const { exams: localExams } = await import('@/data/exams');
    return localExams;
  }
};

// Function to load a single exam from Supabase Storage
export const loadExamFromStorage = async (examId: string): Promise<Exam | null> => {
  try {
    console.log(`📥 Loading exam ${examId} from Supabase Storage...`);
    
    const { data, error } = await supabase
      .storage
      .from('exams')
      .download(`MyExamd/${examId}.json`);
    
    if (error) {
      console.error(`❌ Error loading exam ${examId} from storage:`, error);
      return null;
    }
    
    const examText = await data.text();
    const examData = JSON.parse(examText);
    
    console.log(`✅ Successfully loaded exam ${examId} from storage`);
    return examData;
  } catch (error) {
    console.error(`❌ Exception in loadExamFromStorage for ${examId}:`, error);
    return null;
  }
};

// Function to upload exam to Supabase Storage
export const uploadExamToStorage = async (exam: BaseExam): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`📤 Uploading exam ${exam.id} to Supabase Storage...`);
    
    const { data, error } = await supabase
      .storage
      .from('exams')
      .upload(`MyExamd/${exam.id}.json`, JSON.stringify(exam, null, 2), {
        upsert: true,
        contentType: 'application/json'
      });
    
    if (error) {
      console.error(`❌ Error uploading exam ${exam.id}:`, error);
      return { success: false, error: error.message };
    }
    
    console.log(`✅ Successfully uploaded exam ${exam.id}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Exception uploading exam ${exam.id}:`, error);
    return { success: false, error: String(error) };
  }
};

// Function to update app version
export const updateAppVersion = async (version: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Try different possible column names for the value
    const { error } = await supabase
      .from('platform_settings')
      .upsert({
        key: 'app_version',
        value: version,
        setting_value: version, // Alternative column name
        app_version: version, // Alternative column name
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.error('Error updating app version:', error);
      return { success: false, message: 'Failed to update version' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateAppVersion:', error);
    return { success: false, message: 'Failed to update version' };
  }
};

// Function to diagnose version settings
export const diagnoseVersionSettings = async () => {
  console.log('🔍 Diagnosing version settings...');

  try {
    // Check if platform_settings table exists and has version data
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('key', 'app_version');

    if (error) {
      console.error('❌ platform_settings table issue:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No version setting found in platform_settings table');
      return { success: false, message: 'No version setting found' };
    }

    console.log('✅ Version settings found:', data[0]);
    return { success: true, version: data[0].value };
  } catch (error) {
    console.error('❌ Error diagnosing version settings:', error);
    return { success: false, error: String(error) };
  }
};

// Function to fetch highest scoring exam results
export const fetchHighestResults = async (admin?: { username: string; name: string }, limit: number = 10): Promise<ExamResult[]> => {
  try {
    console.log(`🔄 fetchHighestResults called for admin: ${admin?.username}, limit: ${limit}`);

    // Base query for highest scoring exam results
    let query = supabase
      .from('exam_results')
      .select('*')
      .order('score_percentage', { ascending: false })
      .limit(limit);

    // Apply admin-specific filtering
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      query = query.eq('exam_id', 'english-euee-2018');
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      query = query.eq('exam_id', 'chemistry-2018-natural');
    }

    const { data: highestResults, error } = await query;

    if (error) {
      console.error('❌ Error fetching highest results:', error);
      throw error;
    }

    // Apply additional filtering for Habtamu (since economics exams might not have specific IDs yet)
    let filteredResults = highestResults || [];
    if (admin?.username === 'Habtamu@elyonmain.app') {
      filteredResults = (highestResults || []).filter(r => 
        r.exam_title?.toLowerCase().includes('economics') || 
        r.exam_title?.toLowerCase().includes('economic')
      );
    }

    console.log('✅ Successfully fetched highest results:', filteredResults?.length || 0, 'results');
    return filteredResults;
  } catch (error) {
    console.error('❌ Exception in fetchHighestResults:', error);
    return [];
  }
};

// Function to fetch scheduled exams
export const fetchScheduledExams = async (admin?: { username: string; name: string }): Promise<Exam[]> => {
  try {
    console.log(`🔄 fetchScheduledExams called for admin: ${admin?.username}`);

    // Fetch all exams with status that could be considered "scheduled"
    // Since scheduled_exams table doesn't exist, we'll work with status-based filtering
    const query = supabase
      .from('exams')
      .select('*')
      .in('status', ['active', 'ongoing', 'upcoming']); // Include upcoming status

    const { data: scheduledExams, error } = await query;

    if (error) {
      console.error('❌ Error fetching scheduled exams:', error);
      // Don't throw error, just return empty array so dashboard can show fallback data
      return [];
    }

    console.log('✅ Successfully fetched scheduled exams:', scheduledExams?.length || 0, 'exams');

    // Filter based on admin permissions if needed
    let filteredExams = scheduledExams || [];

    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      filteredExams = filteredExams.filter(exam => exam.subject?.toLowerCase().includes('english'));
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      filteredExams = filteredExams.filter(exam => exam.subject?.toLowerCase().includes('chemistry'));
    } else if (admin?.username === 'Habtamu@elyonmain.app') {
      filteredExams = filteredExams.filter(exam => exam.subject?.toLowerCase().includes('economics') || exam.subject?.toLowerCase().includes('economic'));
    }

    return filteredExams;
  } catch (error) {
    console.error('❌ Exception in fetchScheduledExams:', error);
    return [];
  }
};

// ==========================================
// SCHEDULED EXAMS MANAGEMENT FUNCTIONS
// ==========================================

// Interface for scheduled exam instances
export interface ScheduledExam {
  id: string;
  exam_id: string; // Reference to the static exam
  scheduled_date: string; // YYYY-MM-DD
  start_time?: string; // HH:MM
  end_time?: string; // HH:MM
  status: 'upcoming' | 'active' | 'ongoing' | 'completed' | 'cancelled';
  password?: string;
  created_at: string;
  updated_at: string;
}

// Function to create a scheduled exam instance
export const createScheduledExam = async (scheduledExam: Omit<ScheduledExam, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduledExam | null> => {
  try {
    console.log('🔄 createScheduledExam called with:', scheduledExam);

    const { data, error } = await supabase
      .from('scheduled_exams')
      .insert([{
        ...scheduledExam,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating scheduled exam:', error);
      throw error;
    }

    console.log('✅ Successfully created scheduled exam:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in createScheduledExam:', error);
    throw error;
  }
};

// Function to update a scheduled exam
export const updateScheduledExam = async (id: string, updates: Partial<Omit<ScheduledExam, 'id' | 'created_at'>>): Promise<ScheduledExam | null> => {
  try {
    console.log('🔄 updateScheduledExam called with id:', id, 'updates:', updates);

    const { data, error } = await supabase
      .from('scheduled_exams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating scheduled exam:', error);
      throw error;
    }

    console.log('✅ Successfully updated scheduled exam:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in updateScheduledExam:', error);
    throw error;
  }
};

// Function to fetch scheduled exams for a specific week
export const fetchScheduledExamsForWeek = async (weekStart: Date, admin?: { username: string; name: string }): Promise<ScheduledExam[]> => {
  try {
    console.log(`🔄 fetchScheduledExamsForWeek called for week starting: ${weekStart.toISOString()}`);

    // Calculate end of week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('scheduled_exams')
      .select(`
        *,
        exam:exams(*)
      `)
      .gte('scheduled_date', weekStart.toISOString().split('T')[0])
      .lte('scheduled_date', weekEnd.toISOString().split('T')[0])
      .in('status', ['upcoming', 'active', 'ongoing'])
      .order('scheduled_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('❌ Error fetching scheduled exams for week:', error);
      return [];
    }

    console.log('✅ Successfully fetched scheduled exams for week:', data?.length || 0);

    // Apply admin filtering if needed
    let filteredData = data || [];
    if (admin?.username === 'ZenaZPrestigious@elyonmain.app') {
      filteredData = filteredData.filter(item =>
        item.exam?.subject?.toLowerCase().includes('english')
      );
    } else if (admin?.username === 'Asnakew@elyonmain.app') {
      filteredData = filteredData.filter(item =>
        item.exam?.subject?.toLowerCase().includes('chemistry')
      );
    } else if (admin?.username === 'Habtamu@elyonmain.app') {
      filteredData = filteredData.filter(item =>
        item.exam?.subject?.toLowerCase().includes('economics') || item.exam?.subject?.toLowerCase().includes('economic')
      );
    }

    return filteredData;
  } catch (error) {
    console.error('❌ Exception in fetchScheduledExamsForWeek:', error);
    return [];
  }
};

// Function to schedule an exam instance from available exam templates
export const scheduleExam = async (
  examId: string,
  scheduledDate: string,
  startTime?: string,
  endTime?: string,
  password?: string
): Promise<ScheduledExam | null> => {
  try {
    console.log('🔄 scheduleExam called with:', { examId, scheduledDate, startTime, endTime });

    // Check if exam exists
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      console.error('❌ Exam not found:', examError);
      throw new Error('Exam not found');
    }

    // Create scheduled exam instance
    const scheduledExamData = {
      exam_id: examId,
      scheduled_date: scheduledDate,
      start_time: startTime,
      end_time: endTime,
      status: 'upcoming' as const,
      password: password
    };

    return await createScheduledExam(scheduledExamData);
  } catch (error) {
    console.error('❌ Exception in scheduleExam:', error);
    throw error;
  }
};

// Function to initialize exams in database from static data
export const initializeExamsInDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 initializeExamsInDatabase called');

    // Import exams dynamically to avoid circular dependencies
    const { exams } = await import('@/data/exams');

    // Check if exams table is empty
    const { data: existingExams, error: checkError } = await supabase
      .from('exams')
      .select('id')
      .limit(1);

    if (checkError && checkError.code !== '42P01') {
      console.error('❌ Error checking exams table:', checkError);
      throw checkError;
    }

    // If table doesn't exist or is empty, create it
    if (!existingExams || existingExams.length === 0) {
      console.log('📝 Initializing exams table with static data...');

      const examInserts = exams.map(exam => ({
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        total_questions: exam.totalQuestions,
        description: exam.description,
        scheduled_date: exam.scheduledDate,
        status: exam.status,
        stream: exam.stream || null,
        password: exam.password || null,
        start_time: exam.startTime || null,
        end_time: exam.endTime || null,
        last_updated: exam.lastUpdated || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('exams')
        .insert(examInserts);

      if (insertError) {
        console.error('❌ Error initializing exams:', insertError);
        throw insertError;
      }

      console.log('✅ Successfully initialized exams table with', examInserts.length, 'exams');
    } else {
      console.log('ℹ️ Exams table already has data, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Exception in initializeExamsInDatabase:', error);
    throw error;
  }
};

// Function to sync physics exam to database
export const syncPhysicsExamToDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 syncPhysicsExamToDatabase called');

    // Import physics exam
    const { physicsExam } = await import('@/data/physicsExam');

    // Check if physics exam already exists
    const { data: existingExam, error: checkError } = await supabase
      .from('exams')
      .select('id')
      .eq('id', physicsExam.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking physics exam:', checkError);
      throw checkError;
    }

    if (existingExam) {
      // Update existing exam
      console.log('📝 Updating existing physics exam');
      const { error: updateError } = await supabase
        .from('exams')
        .update({
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
          updated_at: new Date().toISOString()
        })
        .eq('id', physicsExam.id);

      if (updateError) {
        console.error('❌ Error updating physics exam:', updateError);
        throw updateError;
      }
    } else {
      // Insert new exam
      console.log('📝 Inserting new physics exam');
      const { error: insertError } = await supabase
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

      if (insertError) {
        console.error('❌ Error inserting physics exam:', insertError);
        throw insertError;
      }
    }

    console.log('✅ Successfully synced physics exam to database');
  } catch (error) {
    console.error('❌ Exception in syncPhysicsExamToDatabase:', error);
    throw error;
  }
};

// Function to fetch all programmes
export const fetchProgrammes = async (): Promise<Programme[]> => {
  try {
    console.log('🔄 fetchProgrammes called');

    const { data, error } = await supabase
      .from('programmes')
      .select('*')
      .order('grade_level', { ascending: true })
      .order('stream', { ascending: true });

    if (error) {
      console.error('❌ Error fetching programmes:', error);
      // Handle case where table doesn't exist yet
      if (error.code === '42P01') {
        console.warn('⚠️ programmes table does not exist yet');
        return [];
      }
      throw error;
    }

    console.log('✅ Successfully fetched programmes:', data?.length || 0, 'programmes');
    return data || [];
  } catch (error) {
    console.error('❌ Exception in fetchProgrammes:', error);
    return [];
  }
};

// Function to create a new programme
export const createProgramme = async (programme: Omit<Programme, 'id' | 'created_at' | 'updated_at'>): Promise<Programme | null> => {
  try {
    console.log('🔄 createProgramme called with:', programme);

    // Database now has scheduling columns, only exclude duration if it doesn't exist
    const { duration, ...programmeData } = programme;

    const { data, error } = await supabase
      .from('programmes')
      .insert([{
        ...programmeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating programme:', error);
      throw error;
    }

    console.log('✅ Successfully created programme:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in createProgramme:', error);
    throw error;
  }
};

// Function to update a programme
export const updateProgramme = async (id: string, updates: Partial<Omit<Programme, 'id' | 'created_at'>>): Promise<Programme | null> => {
  try {
    console.log('🔄 updateProgramme called with id:', id, 'updates:', updates);

    // Database now has scheduling columns, only exclude duration if it doesn't exist
    const { duration, ...updateData } = updates;

    const { data, error } = await supabase
      .from('programmes')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating programme:', error);
      throw error;
    }

    console.log('✅ Successfully updated programme:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in updateProgramme:', error);
    throw error;
  }
};

// Function to delete a programme
export const deleteProgramme = async (id: string): Promise<boolean> => {
  try {
    console.log('🔄 deleteProgramme called with id:', id);

    const { error } = await supabase
      .from('programmes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting programme:', error);
      throw error;
    }

    console.log('✅ Successfully deleted programme');
    return true;
  } catch (error) {
    console.error('❌ Exception in deleteProgramme:', error);
    throw error;
  }
};

// ==========================================
// TEACHERS MANAGEMENT FUNCTIONS
// ==========================================

// Function to fetch all teachers
export const fetchTeachers = async (): Promise<Teacher[]> => {
  try {
    console.log('🔄 fetchTeachers called');

    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching teachers:', error);
      // Handle case where table doesn't exist yet
      if (error.code === '42P01') {
        console.warn('⚠️ teachers table does not exist yet');
        return [];
      }
      throw error;
    }

    console.log('✅ Successfully fetched teachers:', data?.length || 0, 'teachers');
    
    // Map database columns to Teacher interface
    return (data || []).map(teacher => ({
      id: teacher.teacher_id || teacher.id || '',
      name: teacher.full_name || teacher.name || '',
      email: teacher.email,
      phone: teacher.phone,
      subjects: teacher.subject_theme ? [teacher.subject_theme] : [],
      programme_id: teacher.programme_id,
      status: teacher.is_active ? 'active' : 'inactive',
      created_at: teacher.created_at || new Date().toISOString(),
      updated_at: teacher.updated_at,
      teacher_id: teacher.teacher_id,
      full_name: teacher.full_name,
      subject_theme: teacher.subject_theme,
      is_active: teacher.is_active
    }));
  } catch (error) {
    console.error('❌ Exception in fetchTeachers:', error);
    return [];
  }
};

// Function to create a new teacher
export const createTeacher = async (teacher: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>): Promise<Teacher | null> => {
  try {
    console.log('🔄 createTeacher called with:', teacher);

    const { data, error } = await supabase
      .from('teachers')
      .insert([{
        ...teacher,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating teacher:', error);
      throw error;
    }

    console.log('✅ Successfully created teacher:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in createTeacher:', error);
    throw error;
  }
};

// Function to update a teacher
export const updateTeacher = async (id: string, updates: Partial<Omit<Teacher, 'id' | 'created_at'>>): Promise<Teacher | null> => {
  try {
    console.log('🔄 updateTeacher called with id:', id, 'updates:', updates);

    const { data, error } = await supabase
      .from('teachers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating teacher:', error);
      throw error;
    }

    console.log('✅ Successfully updated teacher:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in updateTeacher:', error);
    throw error;
  }
};

// Function to delete a teacher
export const deleteTeacher = async (id: string): Promise<boolean> => {
  try {
    console.log('🔄 deleteTeacher called with id:', id);

    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting teacher:', error);
      throw error;
    }

    console.log('✅ Successfully deleted teacher');
    return true;
  } catch (error) {
    console.error('❌ Exception in deleteTeacher:', error);
    throw error;
  }
};

// Types for exam access management
export interface ExamAccess {
  id?: string;
  exam_id: string;
  student_id: string; // admission_id
  has_access: boolean;
  created_at?: string;
  updated_at?: string;
}

// Function to check if a student has access to an exam
export const checkStudentExamAccess = async (studentId: string, examId: string): Promise<boolean> => {
  try {
    console.log('🔄 Checking exam access for student:', studentId, 'exam:', examId);

    const { data, error } = await supabase
      .from('exam_access')
      .select('has_access')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .maybeSingle(); // Use maybeSingle instead of single to handle no results

    if (error) {
      console.error('❌ Error checking exam access:', error);
      throw error;
    }

    const hasAccess = data?.has_access ?? false; // Default to false if no record exists
    console.log('✅ Exam access check result:', hasAccess);
    return hasAccess;
  } catch (error) {
    console.error('❌ Exception in checkStudentExamAccess:', error);
    return false; // Default to no access on error
  }
};

// Function to grant exam access to a student
export const grantExamAccess = async (studentId: string, examId: string): Promise<void> => {
  try {
    console.log('🔄 Granting exam access for student:', studentId, 'exam:', examId);

    const { data, error } = await supabase
      .from('exam_access')
      .upsert({
        student_id: studentId,
        exam_id: examId,
        has_access: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'student_id,exam_id'
      });

    if (error) {
      console.error('❌ Error granting exam access:', error);
      throw error;
    }

    console.log('✅ Successfully granted exam access');
  } catch (error) {
    console.error('❌ Exception in grantExamAccess:', error);
    throw error;
  }
};

// Function to revoke exam access from a student
export const revokeExamAccess = async (studentId: string, examId: string): Promise<void> => {
  try {
    console.log('🔄 Revoking exam access for student:', studentId, 'exam:', examId);

    const { data, error } = await supabase
      .from('exam_access')
      .upsert({
        student_id: studentId,
        exam_id: examId,
        has_access: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'student_id,exam_id'
      });

    if (error) {
      console.error('❌ Error revoking exam access:', error);
      throw error;
    }

    console.log('✅ Successfully revoked exam access');
  } catch (error) {
    console.error('❌ Exception in revokeExamAccess:', error);
    throw error;
  }
};

// Function to bulk grant exam access to multiple students
export const bulkGrantExamAccess = async (studentIds: string[], examId: string): Promise<void> => {
  try {
    console.log('🔄 Bulk granting exam access for', studentIds.length, 'students to exam:', examId);

    const accessRecords = studentIds.map(studentId => ({
      student_id: studentId,
      exam_id: examId,
      has_access: true,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('exam_access')
      .upsert(accessRecords, {
        onConflict: 'student_id,exam_id'
      });

    if (error) {
      console.error('❌ Error bulk granting exam access:', error);
      throw error;
    }

    console.log('✅ Successfully bulk granted exam access');
  } catch (error) {
    console.error('❌ Exception in bulkGrantExamAccess:', error);
    throw error;
  }
};

// Function to bulk revoke exam access from multiple students
export const bulkRevokeExamAccess = async (studentIds: string[], examId: string): Promise<void> => {
  try {
    console.log('🔄 Bulk revoking exam access for', studentIds.length, 'students from exam:', examId);

    const accessRecords = studentIds.map(studentId => ({
      student_id: studentId,
      exam_id: examId,
      has_access: false,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('exam_access')
      .upsert(accessRecords, {
        onConflict: 'student_id,exam_id'
      });

    if (error) {
      console.error('❌ Error bulk revoking exam access:', error);
      throw error;
    }

    console.log('✅ Successfully bulk revoked exam access');
  } catch (error) {
    console.error('❌ Exception in bulkRevokeExamAccess:', error);
    throw error;
  }
};

// Function to fetch all exam access records for an exam
export const fetchExamAccessRecords = async (examId: string): Promise<ExamAccess[]> => {
  try {
    console.log('🔄 Fetching exam access records for exam:', examId);

    const { data, error } = await supabase
      .from('exam_access')
      .select('*')
      .eq('exam_id', examId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching exam access records:', error);
      throw error;
    }

    console.log('✅ Successfully fetched exam access records:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Exception in fetchExamAccessRecords:', error);
    return [];
  }
};

// Function to get students with access to a specific exam
export const getStudentsWithExamAccess = async (examId: string): Promise<string[]> => {
  try {
    console.log('🔄 Getting students with access to exam:', examId);

    const { data, error } = await supabase
      .from('exam_access')
      .select('student_id')
      .eq('exam_id', examId)
      .eq('has_access', true);

    if (error) {
      console.error('❌ Error getting students with exam access:', error);
      throw error;
    }

    const studentIds = data?.map(record => record.student_id) || [];
    console.log('✅ Students with access:', studentIds.length);
    return studentIds;
  } catch (error) {
    console.error('❌ Exception in getStudentsWithExamAccess:', error);
    return [];
  }
};

// Function to get exams accessible to a student
export const getExamsAccessibleToStudent = async (studentId: string): Promise<string[]> => {
  try {
    console.log('🔄 Getting exams accessible to student:', studentId);

    const { data, error } = await supabase
      .from('exam_access')
      .select('exam_id')
      .eq('student_id', studentId)
      .eq('has_access', true);

    if (error) {
      console.error('❌ Error getting exams accessible to student:', error);
      throw error;
    }

    const examIds = data?.map(record => record.exam_id) || [];
    console.log('✅ Exams accessible to student:', examIds.length);
    return examIds;
  } catch (error) {
    console.error('❌ Exception in getExamsAccessibleToStudent:', error);
    return [];
  }
};
