import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { exams, Question } from '@/data/exams';
import { saveExamResult, hasStudentTakenExam, saveCancelledExam, saveViolation, loadExamAdminChanges } from '@/lib/supabase';
import { eueeVerbal2021Questions } from '@/data/eueeVerbalReasoning2021';
import { verbalReasoningQuestions } from '@/data/verbalReasoningQuestions';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  Check,
  X,
  Send,
  Book,
  Brain,
  MessageSquare,
  Type,
  CheckCircle,
  Hash,
  Lock
} from 'lucide-react';
import logo from '@/assets/logo.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getQuestionType = (questionId: number | string, examId?: string): string => {
  // For mock exam, return the specific question type
  if (examId === 'mock-2023-12') {
    // If questionId is already a string, try to parse it as a number
    const qId = typeof questionId === 'string' ? parseInt(questionId, 10) : questionId;
    
    // Return the question type based on the question ID
    const questionTypes = [
      'Science (planets, chemistry, astronomy)',
      'Geography (capitals, landmarks)',
      'Mathematics (prime numbers)',
      'Art (famous paintings)',
      'Science (planets, chemistry, astronomy)',
      'Technology (programming languages)',
      'Biology (largest mammal)',
      'Geography (capitals, landmarks)',
      'Science (planets, chemistry, astronomy)',
      'Environmental Science (renewable energy)'
    ];
    
    // Handle both 0-based and 1-based indexing
    const index = (qId <= questionTypes.length) ? qId - 1 : 0;
    return questionTypes[index] || 'General Knowledge';
  }
  
  // For non-mock exams, handle verbal reasoning questions
  if (typeof questionId === 'number') {
    const verbalQuestion = verbalReasoningQuestions.find(q => q.id === `v${questionId}`);
    if (!verbalQuestion) return 'Question';
    
    switch(verbalQuestion.type) {
      case 'antonym': return 'Antonym';
      case 'analogy': return 'Analogy';
      case 'synonym': return 'Synonym';
      case 'completion': return 'Sentence Completion';
      case 'comprehension': return 'Reading Comprehension';
      case 'logical': return 'Logical Reasoning';
      default: return 'Question';
    }
  }
  
  return 'Question';
};

const getQuestionSection = (questionId: string | number, examId?: string): string => {
  // For mock exam, return a general section
  if (examId === 'mock-2023-12') {
    return 'GENERAL KNOWLEDGE';
  }
  
  // For other exams, handle as before
  const id = typeof questionId === 'number' ? `v${questionId}` : questionId;
  const question = eueeVerbal2021Questions.find(q => q.id === id);
  if (!question) return 'VERBAL REASONING';
  
  // Return the section from the question object
  return question.section || 'VERBAL REASONAGE';
};

const getQuestionTypeIcon = (questionId: number) => {
  const verbalQuestion = verbalReasoningQuestions.find(q => q.id === `v${questionId}`);
  if (!verbalQuestion) return <Hash size={14} className="text-muted-foreground" />;
  
  switch(verbalQuestion.type) {
    case 'antonym': return <span className="text-green-600">Antonym</span>;
    case 'analogy': return <Brain size={14} className="text-blue-500" />;
    case 'synonym': return <CheckCircle size={14} className="text-green-500" />;
    case 'completion': return <Type size={14} className="text-purple-500" />;
    case 'comprehension': return <Book size={14} className="text-amber-500" />;
    case 'logical': return <MessageSquare size={14} className="text-cyan-500" />;
    default: return <Hash size={14} className="text-muted-foreground" />;
  }
};

// Helper function to format passage text with line breaks after each lettered segment
const formatPassage = (passage: string): string => {
  if (!passage) return '';
  // Add line breaks before each lettered segment (A., B., C., D., E., F.)
  // This ensures each segment starts on a new line
  // Pattern matches: space + letter + period + space, or just letter + period + space at word boundaries
  return passage
    .replace(/(\s+)([A-F]\.\s+)/g, '\n$2')  // Replace space(s) before lettered segments with newline
    .replace(/^([A-F]\.\s+)/, '$1')          // Keep first segment as is (if at start)
    .trim();                                  // Remove leading/trailing whitespace
};

// Helper function to format question text with line breaks after numbered/lettered segments
const formatQuestionText = (text: string): string => {
  if (!text) return '';
  // Add line breaks before numbered segments (1., 2., 3., etc.) and lettered segments (A., B., C., D., etc.)
  // This ensures each segment starts on a new line for better readability
  return text
    .replace(/(\s+)(\d+\.\s+)/g, '\n$2')     // Replace space(s) before numbered segments with newline
    .replace(/(\s+)([A-F]\.\s+)/g, '\n$2')    // Replace space(s) before lettered segments with newline
    .replace(/(\s+)([A-F]\.\.\.\s*)/g, '\n$2') // Handle patterns like "B..." with line break
    .replace(/(\s+)(\d+\.\.\.\s*)/g, '\n$2')  // Handle patterns like "1..." with line break
    .trim();                                   // Remove leading/trailing whitespace
};

const Exam = () => {
  // Router and context hooks
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, student, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // State declarations at the top level - before any conditional returns
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [exam, setExam] = useState<typeof exams[0] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassage, setShowPassage] = useState(true);
  const [violationCount, setViolationCount] = useState(0);
  const [showCopyWarning, setShowCopyWarning] = useState(false);
  const [copyPasteViolations, setCopyPasteViolations] = useState(0);
  // Password verification state
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [examPassword, setExamPassword] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // New state for exam pages
  const [currentPage, setCurrentPage] = useState<'intro' | 'section-transition' | 'question'>('intro');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const examStartTime = useRef<number | null>(null);

  // Helper function to get violation severity
  const getViolationSeverity = useCallback((count: number): 'low' | 'medium' | 'high' => {
    if (count >= 7) return 'high';
    if (count >= 3) return 'medium';
    return 'low';
  }, []);

  // Handle password verification
  const handlePasswordSubmit = () => {
    if (enteredPassword === examPassword) {
      setShowPasswordPopup(false);
      setEnteredPassword('');
      toast({
        title: 'Access Granted',
        description: 'Password verified successfully. You can now start the exam.',
      });
    } else {
      toast({
        title: 'Incorrect Password',
        description: 'The password you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
      setEnteredPassword('');
    }
  };

  const handlePasswordCancel = () => {
    navigate('/dashboard');
  };

  // Handle exam cancellation due to violations
  const handleExamCancellation = useCallback(async (reason: string) => {
    if (!exam || !student) {
      console.warn('Exam or student data is missing');
      return;
    }
    
    try {
      // Save cancelled exam with 0 score
      await saveCancelledExam(
        student.id,
        student.name || 'Unknown Student',
        exam.id,
        exam.title
      );

      // Clear saved answers and flags from localStorage
      const key = getStorageKey(exam.id, student.id);
      localStorage.removeItem(key);
      const flagsKey = getFlagsStorageKey(exam.id, student.id);
      localStorage.removeItem(flagsKey);
      
      // Update state
      setIsSubmitted(true);
      setShowSubmitDialog(false);
      
      // Show toast notification
      toast({
        title: 'Exam Cancelled',
        description: `Your exam has been cancelled due to: ${reason}`,
        variant: 'destructive',
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 5000);
      
    } catch (error) {
      console.error('Error cancelling exam:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while processing your exam cancellation.',
        variant: 'destructive',
      });
    }
  }, [exam, student, navigate, toast]);

  // Handle all types of violations
  const handleViolation = useCallback(async (type: 'copy_attempt' | 'paste_attempt' | 'screenshot_attempt', description: string) => {
    if (!exam || !student || isSubmitted) return;

    // Calculate the new violation count based on type
    const currentViolations = copyPasteViolations;
    const newCount = currentViolations + 1;
    const maxViolations = 10;

    // If we've already reached max violations, don't process additional violations
    if (currentViolations >= maxViolations) {
      return;
    }

    // Update the appropriate state based on violation type (but don't save to database yet)
    setCopyPasteViolations(newCount);
    setShowCopyWarning(true);
    // Hide warning after 10 seconds
    setTimeout(() => setShowCopyWarning(false), 10000);

    // Check if we've reached the maximum number of violations
    if (newCount >= maxViolations) {
      const reason = `Exceeded maximum allowed copy/paste attempts (${maxViolations}). Total violations: copy/paste attempts (${newCount})`;

      // Save only one final violation record with complete reason
      try {
        await saveViolation({
          student_id: student.id,
          student_name: student.name || 'Unknown Student',
          admission_id: student.admission_id || 'N/A',
          exam_id: exam.id,
          exam_title: exam.title,
          type: 'suspicious_activity', // Use suspicious_activity as the final violation type
          description: reason,
          severity: 'high',
        });
      } catch (error) {
        console.error('Failed to save final violation record:', error);
      }

      await handleExamCancellation(reason);
    }
  }, [exam, student, copyPasteViolations, isSubmitted, handleExamCancellation]);

  // Helper function to get localStorage key for answers
  const getStorageKey = (examId: string, studentId: string) => `exam_answers_${examId}_${studentId}`;

  // Helper function to get localStorage key for flags
  const getFlagsStorageKey = (examId: string, studentId: string) => `exam_flags_${examId}_${studentId}`;

  // Handle authentication and exam loading
  useEffect(() => {
    const loadExamData = async () => {
      // Check authentication first
      if (!isAuthenticated && !authLoading) {
        navigate('/', { state: { from: location.pathname } });
        return;
      }

      // If still loading auth or student data, wait
      if (authLoading || !student) {
        return;
      }

      // Find the exam
      const foundExam = exams.find((e) => e.id === id);
      
      if (!foundExam) {
        toast({
          title: 'Exam not found',
          description: 'The requested exam could not be found.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      // Load persisted admin changes from Supabase
      const persistedChanges = await loadExamAdminChanges();
      let examWithChanges = foundExam;
      if (persistedChanges && persistedChanges[foundExam.id]) {
        const examChanges = persistedChanges[foundExam.id];
        examWithChanges = { ...foundExam, ...examChanges };
      }

      // Check if the exam is for the student's stream
      if (examWithChanges.stream && examWithChanges.stream !== 'both') {
        const studentStream = student.class?.toLowerCase().includes('social') ? 'social' : 'natural';
        if (examWithChanges.stream !== studentStream) {
          toast({
            title: 'Access Denied',
            description: 'This exam is not available for your stream.',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }
      }

      // Set the exam data
      setExam(examWithChanges);
      setTimeLeft(examWithChanges.duration * 60);
      
      // Check if exam has a password
      if (examWithChanges.password) {
        setExamPassword(examWithChanges.password);
        setShowPasswordPopup(true);
      } else {
        setExamPassword(null);
        setShowPasswordPopup(false);
      }
      
      // Load saved answers and flags from localStorage
      if (student) {
        const key = getStorageKey(examWithChanges.id, student.id);
        const savedAnswers = localStorage.getItem(key);
        if (savedAnswers) {
          try {
            const parsedAnswers = JSON.parse(savedAnswers);
            setAnswers(parsedAnswers);
          } catch (error) {
            console.error('Failed to parse saved answers:', error);
          }
        }

        const flagsKey = getFlagsStorageKey(examWithChanges.id, student.id);
        const savedFlags = localStorage.getItem(flagsKey);
        if (savedFlags) {
          try {
            const parsedFlags = JSON.parse(savedFlags);
            setFlaggedQuestions(new Set(parsedFlags));
          } catch (error) {
            console.error('Failed to parse saved flags:', error);
          }
        }
      }
      
      // Set exam start time
      examStartTime.current = Date.now();
      
      // Mark checking as complete
      setIsChecking(false);
      
      // Cleanup function
      return () => {
        // Any cleanup code if needed
      };
    };

    loadExamData();
  }, [id, isAuthenticated, authLoading, student, navigate, location.pathname, toast]);

  // Update loading state when dependencies change
  useEffect(() => {
    // We're no longer loading if:
    // 1. We're not checking the exam status
    // 2. We're not loading auth data
    // 3. We have the exam data
    // 4. We have the student data
    setIsLoading(isChecking || authLoading || !exam || !student);
  }, [isChecking, authLoading, exam, student]);

  // Check if exam can be taken
  useEffect(() => {
    // Skip if still loading or no exam/student data
    if (isLoading || !exam || !student) return;
    
    const checkExamStatus = async () => {
      if (!isAuthenticated) {
        navigate('/', { state: { from: location.pathname } });
        return;
      }

      try {
        // Check if exam is already taken
        const taken = await hasStudentTakenExam(student!.id, exam.id);
        if (taken) {
          toast({
            title: 'Exam already taken',
            description: 'You have already completed this exam.',
            variant: 'default',
          });
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking exam status:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while checking the exam status.',
          variant: 'destructive',
        });
        navigate('/dashboard');
      } finally {
        setIsChecking(false);
      }
    };

    checkExamStatus();
  }, [isAuthenticated, navigate, student, location.pathname, toast, isLoading, exam]);

  // Copy/Paste prevention and navigation detection
  useEffect(() => {
    if (isSubmitted) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy_attempt', 'Attempted to copy exam content');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy_attempt', 'Attempted to cut exam content');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('paste_attempt', 'Attempted to paste content during exam');
    };

    // Screenshot prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common screenshot shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleViolation('screenshot_attempt', 'Attempted to take screenshot via print');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '4') {
        e.preventDefault();
        handleViolation('screenshot_attempt', 'Attempted to take screenshot via shortcut');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '3') {
        e.preventDefault();
        handleViolation('screenshot_attempt', 'Attempted to take screenshot via shortcut');
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        handleViolation('screenshot_attempt', 'Attempted to take screenshot via PrintScreen');
      }
    };

    // Visibility change detection (navigation away or tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden && currentPage === 'question' && !isSubmitted) {
        handleExamCancellation('Tab switch detected - exam cancelled');
      }
    };

    // Before unload event (browser back button, refresh, navigation)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentPage === 'question' && !isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam will be cancelled.';
        return 'Are you sure you want to leave? Your exam will be cancelled.';
      }
    };

    // Fullscreen change detection - removed automatic cancellation
    const handleFullscreenChange = () => {
      // Don't cancel exam when fullscreen is exited
      // Students may accidentally exit fullscreen during the exam
      console.log('Fullscreen state changed:', document.fullscreenElement ? 'entered' : 'exited');
    };

    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isSubmitted, handleViolation, handleExamCancellation, currentPage]);

  // Timer
  useEffect(() => {
    if (!exam || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mark exam as started when first question is answered
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !examStartTime.current) {
      examStartTime.current = Date.now();
    }
  }, [answers]);

  // Auto-show passage for questions 10-16 and 17-23
  useEffect(() => {
    if (!exam || isLoading || isChecking) return;
    
    const actualQuestions = exam.questions.filter(q => !q.isPassage);
    if (actualQuestions.length === 0 || currentQuestion >= actualQuestions.length) return;
    
    const question = actualQuestions[currentQuestion];
    if (!question) return;
    
    const questionNumber = Number(question.id);
    // Show passage for questions 10-16 (passage-1) and 17-23 (passage-2)
    const isQuestionWithPassage =
      (questionNumber >= 10 && questionNumber <= 16) ||
      (questionNumber >= 17 && questionNumber <= 23);
    
    if (isQuestionWithPassage) {
      const passageQuestion = question.passageId 
        ? exam.questions.find(q => q.id === question.passageId || (q.isPassage && q.id === question.passageId))
        : null;
      
      if (passageQuestion && passageQuestion.text) {
        setShowPassage(true);
      }
    } else {
      // Hide passage for other questions
      setShowPassage(false);
    }
  }, [currentQuestion, exam, isLoading, isChecking]);

  const handleAnswer = (questionId: string | number, optionIndex: number) => {
    const id = String(questionId);
    setAnswers((prev) => {
      const newAnswers = { ...prev, [id]: optionIndex };
      
      // Save to localStorage
      if (exam && student) {
        const key = getStorageKey(exam.id, student.id);
        localStorage.setItem(key, JSON.stringify(newAnswers));
      }
      
      return newAnswers;
    });
  };

  const toggleFlag = (questionId: string | number) => {
    const id = String(questionId);
    const isFlagged = flaggedQuestions.has(id);
    
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (isFlagged) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      // Save to localStorage
      if (exam && student) {
        const flagsKey = getFlagsStorageKey(exam.id, student.id);
        localStorage.setItem(flagsKey, JSON.stringify(Array.from(newSet)));
      }

      return newSet;
    });
    
    toast({ 
      title: isFlagged ? 'Flag removed' : 'Question flagged', 
      description: `Question ${id} ${isFlagged ? 'unflagged' : 'flagged for review'}`,
      duration: 10000 
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || !student) {
      console.error('Exam or student data is missing');
      return;
    }
    
    console.log('Starting exam submission...');
    setIsSubmitted(true);
    setShowSubmitDialog(false);
    
    // Filter out passage questions for scoring
    const actualQuestionsForScoring = exam.questions.filter(q => !q.isPassage);
    
    // Calculate score
    let correct = 0;
    actualQuestionsForScoring.forEach((q) => {
      const questionId = String(q.id);
      // If question is flagged, count it as incorrect (0 points)
      if (flaggedQuestions.has(questionId)) {
        return; // Skip to next question (counts as incorrect)
      }
      // Otherwise, check if answer is correct
      if (answers[questionId] === q.correctAnswer) {
        correct++;
      }
    });

    const scorePercentage = (correct / actualQuestionsForScoring.length) * 100;
    const timeSpent = (exam.duration * 60) - timeLeft; // in seconds

    // Prepare result data
    const resultData = {
      student_id: student.id,
      student_name: student.name,
      exam_id: exam.id,
      exam_title: exam.title,
      total_questions: actualQuestionsForScoring.length,
      correct_answers: correct,
      score_percentage: scorePercentage,
      answers,
      flagged_questions: Array.from(flaggedQuestions),
      time_spent: timeSpent
    };

    try {
      console.log('Attempting to save exam result to Supabase...');
      const saveResult = await saveExamResult(resultData);
      console.log('Exam result saved successfully:', saveResult);

      // Clear saved answers and flags from localStorage
      if (exam && student) {
        const key = getStorageKey(exam.id, student.id);
        localStorage.removeItem(key);
        const flagsKey = getFlagsStorageKey(exam.id, student.id);
        localStorage.removeItem(flagsKey);
      }

      // Navigate to exam submitted page with state
      navigate('/exam-submitted', { 
        state: { from: 'exam-submission' },
        replace: true 
      });
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving your exam results. Please check the console for details.',
        variant: 'destructive',
      });
    }
  }, [exam, answers, timeLeft, student, flaggedQuestions, navigate, toast]);

  // Render loading state if any of these conditions are true
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Loading Exam</h2>
        <p className="text-muted-foreground text-center">
          {!student ? 'Loading your profile...' : 
           !exam ? 'Preparing the exam...' : 'Almost there...'}
        </p>
      </div>
    );
  }

  // Show password popup if required
  if (showPasswordPopup) {
    return (
      <div className="min-h-screen bg-background">
        {/* Password Verification Popup */}
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card border border-primary/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-bounce-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6 animate-pulse">
                <Lock className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Exam Password Required
              </h2>
              <p className="text-primary font-medium text-xl mb-2">
                {exam?.title}
              </p>
              <p className="text-muted-foreground text-base mb-6">
                This exam requires a password to access. Please enter the password provided by your instructor.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Enter Exam Password</label>
                  <input
                    type="password"
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Enter password"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handlePasswordCancel}
                  className="flex-1 bg-secondary text-foreground font-medium px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!enteredPassword.trim()}
                  className="flex-1 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Access Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter out passage questions (questions with isPassage: true)
  const actualQuestions = exam.questions.filter(q => !q.isPassage);
  const question: Question = actualQuestions[currentQuestion];
  
  // Get question number
  const questionNumber = Number(question.id);
  
  // Show passage for questions 10-16 (passage-1) and 17-23 (passage-2)
  const shouldShowPassage =
    (questionNumber >= 10 && questionNumber <= 16) ||
    (questionNumber >= 17 && questionNumber <= 23);
  
  // Find passage if question has passageId (only for questions that should show passage)
  const passageQuestion = (shouldShowPassage && question.passageId)
    ? exam.questions.find(q => q.id === question.passageId || (q.isPassage && q.id === question.passageId))
    : null;
  const questionWithPassage = passageQuestion 
    ? { ...question, passage: passageQuestion.text }
    : question;
  
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeLeft <= 300; // 5 minutes warning

  // Group questions by sections
  const groupQuestionsBySection = (questions: Question[]) => {
    const sections: { [key: string]: Question[] } = {};
    
    questions.forEach((question) => {
      const section = question.section || 'Other';
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(question);
    });
    
    return sections;
  };

  const questionSections = groupQuestionsBySection(actualQuestions);

  // Navigation functions for exam pages
  const handleStartExam = () => {
    setCurrentPage('question');
    setCurrentQuestion(0);
    setCurrentSectionIndex(0);
    
    // Request fullscreen when exam starts
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
    }
  };

  const handleNextSection = (nextSectionIndex: number) => {
    const sectionNames = Object.keys(questionSections);
    const nextSectionName = sectionNames[nextSectionIndex];
    const nextSectionQuestions = questionSections[nextSectionName];
    const firstQuestionIndex = actualQuestions.findIndex(q => nextSectionQuestions.includes(q));
    
    setCurrentSectionIndex(nextSectionIndex);
    setCurrentQuestion(firstQuestionIndex);
    setCurrentPage('question');
  };

  // Check if we need to show section transition
  const shouldShowSectionTransition = (questionIndex: number) => {
    if (questionIndex === 0) return false; // Don't show transition before first question
    
    const currentQuestion = actualQuestions[questionIndex];
    const previousQuestion = actualQuestions[questionIndex - 1];
    
    return currentQuestion.section !== previousQuestion.section;
  };

  // Intro Page Component
  const IntroPage = () => (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-elevated sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <img src={logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-display font-bold truncate">Exam Instructions</h1>
                <p className="text-xs text-primary-foreground/70 truncate">{student.name} • {student.admission_id}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 lg:p-12 shadow-soft">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                EDUCATIONAL ASSESSMENT AND EXAMINATIONS SERVICE (EAES)
              </h1>
              <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-2">
                {exam.title.includes('CHEMISTRY') ? 'CHEMISTRY MODEL EXAM' : exam.title}
              </h2>
              <h3 className="text-lg lg:text-xl text-muted-foreground mb-6">
                {exam.subject}, {exam.description}
              </h3>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-foreground mb-4">Exam Overview</h4>
                <p className="text-muted-foreground">
                  You will have {exam.totalQuestions} multiple-choice questions to complete in {exam.duration} minutes.
                </p>
              </div>

              <div className="border-t border-border pt-8">
                <h4 className="text-xl font-semibold text-foreground mb-6 text-center">Rules and Regulations</h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-foreground text-sm font-medium">1</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Exam Integrity</h5>
                        <p className="text-sm text-muted-foreground">
                          Do not attempt to cheat, copy, or use unauthorized materials during the examination.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-foreground text-sm font-medium">2</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Time Management</h5>
                        <p className="text-sm text-muted-foreground">
                          Manage your time effectively. The exam has a strict time limit and will auto-submit when time expires.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-foreground text-sm font-medium">3</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Question Navigation</h5>
                        <p className="text-sm text-muted-foreground">
                          You can navigate between questions using the sidebar or navigation buttons. Flag questions for review.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-foreground text-sm font-medium">4</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Copy/Paste Prevention</h5>
                        <p className="text-sm text-muted-foreground">
                          Copying and pasting content is strictly prohibited and will result in exam cancellation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary-foreground text-sm font-medium">5</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Final Submission</h5>
                        <p className="text-sm text-muted-foreground">
                          Review all answers before submitting. Once submitted, you cannot make changes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-6">
                    By clicking "Start Exam", you agree to follow all rules and regulations.
                  </p>
                  <button
                    onClick={handleStartExam}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-soft hover:shadow-glow"
                  >
                    Start Exam
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // Section Transition Page Component
  const SectionTransitionPage = ({ nextSectionName, nextSectionIndex }: { nextSectionName: string; nextSectionIndex: number }) => {
    const sectionQuestions = questionSections[nextSectionName] || [];
    const questionCount = sectionQuestions.length;
    
    return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-elevated sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <img src={logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-display font-bold truncate">Section Transition</h1>
                <p className="text-xs text-primary-foreground/70 truncate">{student.name} • {student.admission_id}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-card border border-border rounded-2xl p-8 lg:p-12 shadow-soft">
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Book className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Next Section
              </h2>
              <h3 className="text-xl lg:text-2xl font-semibold text-primary mb-6">
                {nextSectionName}
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                {`Next you will have ${questionCount} questions in ${nextSectionName}`}
              </p>
            </div>

            <button
              onClick={() => handleNextSection(nextSectionIndex)}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-soft hover:shadow-glow"
            >
              Continue to {nextSectionName}
            </button>
          </div>
        </div>
      </main>
    </div>
    );
  };

  // Main exam interface rendering logic
  if (currentPage === 'intro') {
    return <IntroPage />;
  }

  // Check if we need to show section transition
  const sectionNames = Object.keys(questionSections);
  const currentQuestionData = actualQuestions[currentQuestion];
  const currentSectionName = currentQuestionData?.section || sectionNames[0];
  
  if (currentPage === 'section-transition') {
    return (
      <SectionTransitionPage 
        nextSectionName={currentSectionName} 
        nextSectionIndex={sectionNames.indexOf(currentSectionName)} 
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col ${currentPage === 'question' ? 'exam-security-mode' : ''}`}>
      {/* Exam Header */}
      <header className="bg-primary text-primary-foreground shadow-elevated sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <img src={logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-display font-bold truncate">{exam.title}</h1>
                <p className="text-xs text-primary-foreground/70 truncate">{student.name} • {student.admission_id}</p>
              </div>
            </div>

            {/* Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all w-full sm:w-auto justify-between sm:justify-normal"
              title={isSidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
            >
              <span className="flex items-center gap-2">
                <ChevronLeft size={16} className={`transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                <span className="text-sm font-medium">{isSidebarCollapsed ? 'Expand' : 'Collapse'}</span>
              </span>
            </button>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl ${isTimeWarning ? 'bg-destructive/20 animate-pulse-subtle' : 'bg-primary-foreground/10'} w-full sm:w-auto justify-between sm:justify-normal`}>
              <div className="flex items-center gap-2">
                <Clock size={16} className={isTimeWarning ? 'text-destructive-foreground' : ''} />
                <span className={`font-mono text-base sm:text-lg font-bold ${isTimeWarning ? 'text-destructive-foreground' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              {showCopyWarning && (
                <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-lg z-50 flex items-center gap-2 animate-fade-in-out max-w-[95vw] text-xs sm:text-sm">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span className="truncate">
                    {copyPasteViolations < 9 
                      ? `Copy/paste not allowed (${copyPasteViolations + 1}/10)`
                      : 'Final warning! Next attempt cancels exam.'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-3xl mx-auto animate-fade-in" key={currentQuestion}>
            {/* Question Counter */}
            <div className="inline-block text-white px-4 py-2 rounded-lg font-medium mb-2" style={{ backgroundColor: '#104129' }}>
              Question {currentQuestion + 1}/{actualQuestions.length}
            </div>
            
            {/* Question Card */}
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-soft">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  {(exam.id === 'exam-1' || exam.id === 'mock-2023-12') && (
                    <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-t-md w-fit mb-2">
                      <span className="font-semibold text-sm tracking-wide">
                        {getQuestionType(Number(question.id), exam.id) || 'GENERAL KNOWLEDGE'}
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    {shouldShowPassage && questionWithPassage.passage && (
                      <div className="mb-6">
                        <button 
                          onClick={() => setShowPassage(!showPassage)}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                          {showPassage ? (
                            <>
                              <ChevronUp size={16} />
                              <span>Hide Passage</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              <span>Show Passage</span>
                            </>
                          )}
                        </button>
                        {showPassage && (
                          <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                            <div className="whitespace-pre-line text-sm">{formatPassage(questionWithPassage.passage!)}</div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-4">
                      <h2 className="text-lg font-medium text-foreground whitespace-pre-line">
                        {formatQuestionText(question.text)}
                      </h2>
                      {question.image && (
                        <div className="mt-4">
                          <img 
                            src={question.image} 
                            alt="Question diagram" 
                            className="max-w-full h-auto rounded-lg border border-border"
                            onError={(e) => {
                              console.error('Image failed to load:', question.image);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Flag Button */}
                <button
                  onClick={() => toggleFlag(String(question.id))}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    flaggedQuestions.has(String(question.id))
                      ? 'bg-warning/20 text-warning'
                      : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                  }`}
                  title="Flag for review"
                >
                  <Flag size={20} className={flaggedQuestions.has(String(question.id)) ? 'fill-current' : ''} />
                </button>
              </div>
            
            {/* Options - Only show if question has options */}
            {question.options && question.options.length > 0 ? (
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = answers[question.id] === index;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(question.id, index)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 group
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground shadow-soft' 
                          : 'bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30'
                        }
                      `}
                    >
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                        ${isSelected 
                          ? 'bg-primary-foreground/20' 
                          : 'bg-background group-hover:bg-primary/10'
                        }
                      `}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isSelected && <Check size={20} />}
                    </button>
                  );
                })}
              </div>
            ) : null}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {currentQuestion === actualQuestions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitDialog(true)}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-glow transition-all"
                >
                  <Send size={18} />
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => {
                    const nextQuestionIndex = currentQuestion + 1;
                    if (shouldShowSectionTransition(nextQuestionIndex)) {
                      setCurrentPage('section-transition');
                      setCurrentQuestion(nextQuestionIndex);
                    } else {
                      setCurrentQuestion(nextQuestionIndex);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Question Navigation Sidebar */}
        <aside className={`bg-card border-b lg:border-b-0 lg:border-r border-border overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-12 hidden lg:block' : 'lg:w-56'}`}>
          <div className="sticky top-0 bg-card z-10 p-3 border-b border-border lg:border-b-0">
            {!isSidebarCollapsed && (
              <>
                <h3 className="text-xs font-medium text-muted-foreground mb-2 hidden sm:block">Question Navigator</h3>
                <div className="flex items-center justify-between sm:block">
                  <p className="text-xs text-muted-foreground sm:mb-2">
                    {answeredCount}/{actualQuestions.length} answered
                  </p>
                  <div className="flex gap-2 sm:hidden">
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.min(actualQuestions.length - 1, prev + 1))}
                      disabled={currentQuestion === actualQuestions.length - 1}
                      className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          {!isSidebarCollapsed && (
            <div className="p-3 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-3">
              {Object.entries(questionSections).map(([sectionName, sectionQuestions], sectionIndex) => (
                <div key={sectionName}>
                  {/* Section Header */}
                  <div className="mb-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {sectionName}
                    </h4>
                  </div>
                  
                  {/* Question Grid for this Section */}
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-2 mb-3">
                    {sectionQuestions.map((q, questionIndex) => {
                      const globalIndex = actualQuestions.findIndex(aq => aq.id === q.id);
                      const questionId = String(q.id);
                      const isAnswered = answers[questionId] !== undefined;
                      const isFlagged = flaggedQuestions.has(questionId);
                      const isCurrent = globalIndex === currentQuestion;
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            if (shouldShowSectionTransition(globalIndex)) {
                              setCurrentPage('section-transition');
                              setCurrentQuestion(globalIndex);
                            } else {
                              setCurrentQuestion(globalIndex);
                              setCurrentPage('question');
                            }
                            // Close mobile sidebar if open
                            if (window.innerWidth < 1024) {
                              document.body.classList.remove('overflow-hidden');
                            }
                          }}
                          className={`relative w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-md text-sm sm:text-xs font-medium transition-all duration-200 
                            ${isCurrent ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-105'}
                            ${isAnswered ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}
                          `}
                          aria-label={`Question ${globalIndex + 1}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
                        >
                          <span className="relative">
                            {globalIndex + 1}
                            {isFlagged && (
                              <Flag 
                                size={10}
                                className="absolute -top-2 -right-2 text-warning fill-warning drop-shadow-sm" 
                              />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Divider between sections (except after the last section) */}
                  {sectionIndex < Object.keys(questionSections).length - 1 && (
                    <div className="border-t border-border/50 my-2"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-secondary border border-border" />
                <span className="text-muted-foreground">Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flag size={10} className="text-warning fill-warning" />
                <span className="text-muted-foreground">Flagged</span>
              </div>
            </div>
          </div>
          )}
        </aside>

        {/* Submit Confirmation Dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent className="bg-card border-border max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Submit Exam?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <div>You have answered <strong>{answeredCount}</strong> out of <strong>{actualQuestions.length}</strong> questions.</div>
                    {flaggedQuestions.size > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-warning">
                        <Flag size={14} className="flex-shrink-0" />
                        <span>You have <strong>{flaggedQuestions.size}</strong> flagged question{flaggedQuestions.size !== 1 ? 's' : ''} for review.</span>
                      </div>
                    )}
                  </div>

                  {/* Question Status Overview */}
                  <div className="mt-4">
                    <div className="font-medium text-foreground mb-2">Question Status:</div>
                    <div className="grid grid-cols-5 gap-2">
                      {actualQuestions.map((q) => {
                        const isFlagged = flaggedQuestions.has(String(q.id));
                        const isAnswered = answers[String(q.id)] !== undefined;
                        
                        return (
                          <div 
                            key={q.id}
                            className={`p-2 rounded-lg text-center text-sm ${
                              isFlagged 
                                ? 'bg-warning/10 border border-warning/30 text-warning' 
                                : isAnswered 
                                  ? 'bg-success/10 border border-success/30 text-success'
                                  : 'bg-destructive/10 border border-destructive/30 text-destructive'
                            }`}
                            title={isFlagged ? 'Flagged' : isAnswered ? 'Answered' : 'Not Answered'}
                          >
                            {q.id}
                            {isFlagged && ' 🚩'}
                            {isAnswered && !isFlagged && ' ✓'}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 text-foreground">
                    Are you sure you want to submit? This action cannot be undone.
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                Review Answers
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit Exam
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Exam;
