// Crash recovery service for offline exam platform
// Handles recovery of in-progress attempts after application/computer restart

import { getLocalExamService, LocalExamAttempt } from './local-exam-service';
import { getOfflineDatabase } from './offline-db';

export interface RecoveryState {
  hasRecoverableAttempt: boolean;
  attempt: LocalExamAttempt | null;
  answers: Record<string, number>;
  flags: Set<string>;
  timeRemaining: number;
}

class CrashRecoveryService {
  // Check for recoverable in-progress attempt
  async checkForRecoverableAttempt(studentId: string, examId: string): Promise<RecoveryState> {
    try {
      const examService = getLocalExamService();
      const db = await getOfflineDatabase();
      
      // Check for in-progress attempt
      const attempt = await examService.getInProgressAttempt(studentId, examId);
      
      if (!attempt) {
        return {
          hasRecoverableAttempt: false,
          attempt: null,
          answers: {},
          flags: new Set(),
          timeRemaining: 0
        };
      }

      // Calculate remaining time
      const timeRemaining = examService.calculateRemainingTime(attempt);
      
      // If time has expired, don't recover
      if (timeRemaining <= 0) {
        await examService.cancelExam(attempt.id, 'Time expired during recovery');
        return {
          hasRecoverableAttempt: false,
          attempt: null,
          answers: {},
          flags: new Set(),
          timeRemaining: 0
        };
      }

      // Load saved answers
      const answers = await db.getAnswers(attempt.id);
      
      // Load saved flags
      const flags = await db.getFlags(attempt.id);

      return {
        hasRecoverableAttempt: true,
        attempt,
        answers,
        flags,
        timeRemaining
      };
    } catch (error) {
      console.error('Error checking for recoverable attempt:', error);
      return {
        hasRecoverableAttempt: false,
        attempt: null,
        answers: {},
        flags: new Set(),
        timeRemaining: 0
      };
    }
  }

  // Recover an in-progress attempt
  async recoverAttempt(attemptId: string): Promise<{
    attempt: LocalExamAttempt;
    answers: Record<string, number>;
    flags: Set<string>;
    timeRemaining: number;
  } | null> {
    try {
      const examService = getLocalExamService();
      const db = await getOfflineDatabase();
      
      const attempt = await examService.getAttempt(attemptId);
      if (!attempt || attempt.status !== 'in_progress') {
        return null;
      }

      const timeRemaining = examService.calculateRemainingTime(attempt);
      const answers = await db.getAnswers(attemptId);
      const flags = await db.getFlags(attemptId);

      // Log recovery event
      await examService.saveEvent(attemptId, 'crash_recovery', 'Application recovered after crash', 'medium');

      return {
        attempt,
        answers,
        flags,
        timeRemaining
      };
    } catch (error) {
      console.error('Error recovering attempt:', error);
      return null;
    }
  }

  // Cancel an in-progress attempt (after critical failure)
  async cancelAttempt(attemptId: string, reason: string): Promise<void> {
    try {
      const examService = getLocalExamService();
      await examService.cancelExam(attemptId, reason);
    } catch (error) {
      console.error('Error cancelling attempt:', error);
    }
  }

  // Get all in-progress attempts for a student (across all exams)
  async getStudentInProgressAttempts(studentId: string): Promise<LocalExamAttempt[]> {
    try {
      const db = await getOfflineDatabase();
      return await db.getAllInProgressAttempts(studentId);
    } catch (error) {
      console.error('Error getting in-progress attempts:', error);
      return [];
    }
  }

  // Validate attempt integrity
  async validateAttemptIntegrity(attemptId: string): Promise<boolean> {
    try {
      const db = await getOfflineDatabase();
      const attempt = await db.getAttempt(attemptId);
      
      if (!attempt) {
        return false;
      }

      // Check if attempt is still valid (not expired, not corrupted)
      const examService = getLocalExamService();
      const timeRemaining = examService.calculateRemainingTime(attempt);
      
      if (timeRemaining <= 0) {
        return false;
      }

      // Check if database is intact
      const answers = await db.getAnswers(attemptId);
      const flags = await db.getFlags(attemptId);
      
      // Basic integrity check
      return attempt.status === 'in_progress';
    } catch (error) {
      console.error('Error validating attempt integrity:', error);
      return false;
    }
  }
}

// Singleton instance
let crashRecoveryServiceInstance: CrashRecoveryService | null = null;

export function getCrashRecoveryService(): CrashRecoveryService {
  if (!crashRecoveryServiceInstance) {
    crashRecoveryServiceInstance = new CrashRecoveryService();
  }
  return crashRecoveryServiceInstance;
}

export default CrashRecoveryService;
