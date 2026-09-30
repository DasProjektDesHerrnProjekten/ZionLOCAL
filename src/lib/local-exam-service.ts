// Local exam service for completely offline exam operations
// Handles exam attempts, answers, submission, grading without any Supabase dependency

import { getOfflineDatabase } from './offline-db';
import { Exam, Question } from '@/data/exams';

export interface LocalExamAttempt {
  id: string;
  student_id: string;
  exam_id: string;
  exam_version: string;
  student_name: string;
  exam_title: string;
  status: 'in_progress' | 'submitted' | 'cancelled';
  started_at: string;
  submitted_at?: string;
  deadline: string;
  duration: number;
}

export interface LocalExamResult {
  id: string;
  attempt_id: string;
  student_id: string;
  exam_id: string;
  student_name: string;
  exam_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number;
  started_at: string;
  completed_at: string;
  status: 'completed' | 'cancelled';
}

class LocalExamService {
  // Attempt management
  async createAttempt(studentId: string, studentName: string, exam: Exam): Promise<LocalExamAttempt> {
    const db = await getOfflineDatabase();
    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const examVersion = exam.version || '1.0';

    await db.createAttempt({
      id: attemptId,
      student_id: studentId,
      exam_id: exam.id,
      exam_version: examVersion,
      student_name: studentName,
      exam_title: exam.title,
      duration: exam.duration
    });

    return {
      id: attemptId,
      student_id: studentId,
      exam_id: exam.id,
      exam_version: examVersion,
      student_name: studentName,
      exam_title: exam.title,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      deadline: new Date(Date.now() + exam.duration * 60 * 1000).toISOString(),
      duration: exam.duration
    };
  }

  async getAttempt(attemptId: string): Promise<LocalExamAttempt | null> {
    const db = await getOfflineDatabase();
    const attempt = await db.getAttempt(attemptId);
    return attempt;
  }

  async getInProgressAttempt(studentId: string, examId: string): Promise<LocalExamAttempt | null> {
    const db = await getOfflineDatabase();
    const attempt = await db.getInProgressAttempt(studentId, examId);
    return attempt;
  }

  async updateAttemptStatus(attemptId: string, status: 'in_progress' | 'submitted' | 'cancelled'): Promise<void> {
    const db = await getOfflineDatabase();
    await db.updateAttemptStatus(attemptId, status);
  }

  // Answer management
  async saveAnswer(attemptId: string, questionId: string, answer: number): Promise<void> {
    const db = await getOfflineDatabase();
    await db.saveAnswer(attemptId, questionId, answer);
  }

  async getAnswers(attemptId: string): Promise<Record<string, number>> {
    const db = await getOfflineDatabase();
    return await db.getAnswers(attemptId);
  }

  // Flag management
  async toggleFlag(attemptId: string, questionId: string, flagged: boolean): Promise<void> {
    const db = await getOfflineDatabase();
    await db.toggleFlag(attemptId, questionId, flagged);
  }

  async getFlags(attemptId: string): Promise<Set<string>> {
    const db = await getOfflineDatabase();
    return await db.getFlags(attemptId);
  }

  // Event management
  async saveEvent(attemptId: string, eventType: string, description?: string, severity?: string): Promise<void> {
    const db = await getOfflineDatabase();
    await db.saveEvent({
      attempt_id: attemptId,
      event_type: eventType,
      description,
      severity
    });
  }

  async getEvents(attemptId: string): Promise<any[]> {
    const db = await getOfflineDatabase();
    return await db.getEvents(attemptId);
  }

  // Timer calculation based on timestamps
  calculateRemainingTime(attempt: LocalExamAttempt): number {
    const now = Date.now();
    const deadline = new Date(attempt.deadline).getTime();
    const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
    return remaining;
  }

  calculateElapsedTime(attempt: LocalExamAttempt): number {
    const now = Date.now();
    const started = new Date(attempt.started_at).getTime();
    const elapsed = Math.floor((now - started) / 1000);
    return elapsed;
  }

  // Submission and grading
  async submitExam(attemptId: string, exam: Exam, answers: Record<string, number>, flags: Set<string>): Promise<LocalExamResult> {
    const db = await getOfflineDatabase();
    
    // Get attempt details
    const attempt = await this.getAttempt(attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    // Calculate score
    const actualQuestions = exam.questions.filter(q => !q.isPassage);
    let correct = 0;
    
    actualQuestions.forEach((q) => {
      const questionId = String(q.id);
      // If question is flagged, count it as incorrect
      if (flags.has(questionId)) {
        return;
      }
      // Check if answer is correct
      if (answers[questionId] === q.correctAnswer) {
        correct++;
      }
    });

    const totalQuestions = actualQuestions.length;
    const totalMarks = exam.totalMarks || totalQuestions;
    const score = Math.round((correct / totalQuestions) * totalMarks);
    const percentage = (correct / totalQuestions) * 100;
    const timeTaken = this.calculateElapsedTime(attempt);

    // Create result
    const resultId = `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await db.saveResult({
      id: resultId,
      attempt_id: attemptId,
      student_id: attempt.student_id,
      exam_id: attempt.exam_id,
      student_name: attempt.student_name,
      exam_title: attempt.exam_title,
      score,
      total_marks,
      percentage,
      correct_answers: correct,
      total_questions: totalQuestions,
      time_taken: timeTaken,
      started_at: attempt.started_at
    });

    // Add to sync queue
    await db.addToSyncQueue({
      entity_type: 'result',
      entity_id: resultId,
      operation: 'create',
      payload: {
        id: resultId,
        attempt_id: attemptId,
        student_id: attempt.student_id,
        exam_id: attempt.exam_id,
        score,
        percentage,
        submitted_at: new Date().toISOString()
      }
    });

    return {
      id: resultId,
      attempt_id: attemptId,
      student_id: attempt.student_id,
      exam_id: attempt.exam_id,
      student_name: attempt.student_name,
      exam_title: attempt.exam_title,
      score,
      total_marks,
      percentage,
      correct_answers: correct,
      total_questions: totalQuestions,
      time_taken: timeTaken,
      started_at: attempt.started_at,
      completed_at: new Date().toISOString(),
      status: 'completed'
    };
  }

  async cancelExam(attemptId: string, reason: string): Promise<void> {
    const db = await getOfflineDatabase();
    
    // Update attempt status
    await this.updateAttemptStatus(attemptId, 'cancelled');
    
    // Log cancellation event
    await this.saveEvent(attemptId, 'exam_cancelled', reason, 'high');
    
    // Add to sync queue
    await db.addToSyncQueue({
      entity_type: 'attempt',
      entity_id: attemptId,
      operation: 'cancel',
      payload: { reason, cancelled_at: new Date().toISOString() }
    });
  }

  // Result retrieval
  async getResult(resultId: string): Promise<LocalExamResult | null> {
    const db = await getOfflineDatabase();
    const result = await db.getResult(resultId);
    return result;
  }

  async getStudentResults(studentId: string): Promise<LocalExamResult[]> {
    const db = await getOfflineDatabase();
    const results = await db.getStudentResults(studentId);
    return results;
  }

  // Exam access check (local only)
  async checkExamAccess(studentId: string, examId: string): Promise<boolean> {
    const db = await getOfflineDatabase();
    return await db.checkExamAccess(studentId, examId);
  }

  // Get student accessible exams
  async getStudentAccessibleExams(studentId: string): Promise<string[]> {
    const db = await getOfflineDatabase();
    return await db.getStudentAccessibleExams(studentId);
  }

  // Check if student has already taken exam
  async hasStudentTakenExam(studentId: string, examId: string): Promise<boolean> {
    const db = await getOfflineDatabase();
    const results = await db.getStudentResults(studentId);
    return results.some(r => r.exam_id === examId && r.status === 'completed');
  }
}

// Singleton instance
let localExamServiceInstance: LocalExamService | null = null;

export function getLocalExamService(): LocalExamService {
  if (!localExamServiceInstance) {
    localExamServiceInstance = new LocalExamService();
  }
  return localExamServiceInstance;
}

export default LocalExamService;
