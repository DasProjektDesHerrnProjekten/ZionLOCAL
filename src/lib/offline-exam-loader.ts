// Local exam file loader for offline mode
// Reads exam JSON files from local database instead of localStorage
// This provides more reliable persistence and larger storage capacity

import { Exam, exams as baseExams } from '@/data/exams';
import { getOfflineDatabase } from './offline-db';

export interface OfflineExamMetadata {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  stream: string;
  status: string;
  version: string;
  lastUpdated: string;
}

class OfflineExamLoader {
  private examCache: Map<string, Exam> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if local database is available
      const db = await getOfflineDatabase();
      console.log('✅ Offline exam loader initialized with local database');
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize offline exam loader:', error);
      this.initialized = true; // Still mark as initialized to prevent infinite loops
    }
  }

  async loadExam(examId: string): Promise<Exam | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Check cache first
    if (this.examCache.has(examId)) {
      return this.examCache.get(examId)!;
    }

    try {
      // Try to load from local database FIRST (highest priority)
      const db = await getOfflineDatabase();
      const examMetadata = await db.getCachedExamMetadata(examId);

      if (examMetadata && examMetadata.exam_data) {
        const exam = JSON.parse(examMetadata.exam_data) as Exam;
        this.examCache.set(examId, exam);
        console.log(`✅ Loaded exam ${examId} from local database`);
        return exam;
      }

      // Try to load from built-in base exams array (e.g. mock-2023-12)
      const baseExam = baseExams.find(e => e.id === examId);
      if (baseExam) {
        this.examCache.set(examId, baseExam);
        console.log(`✅ Loaded exam ${examId} from base exams definition`);
        return baseExam;
      }

      // Try to load from localStorage as fallback (lowest priority)
      const cachedExam = localStorage.getItem(`offline-exam-${examId}`);
      if (cachedExam) {
        const exam = JSON.parse(cachedExam) as Exam;
        this.examCache.set(examId, exam);
        console.log(`✅ Loaded exam ${examId} from localStorage fallback`);
        return exam;
      }

      console.warn(`⚠️ Exam ${examId} not found in offline storage`);
      return null;
    } catch (error) {
      console.error(`❌ Failed to load exam ${examId}:`, error);
      return null;
    }
  }

  async loadAllExams(): Promise<Exam[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const examsMap = new Map<string, Exam>();

    try {
      const db = await getOfflineDatabase();

      // Use the new method to get all exam IDs from metadata
      const examIds = await db.getAllExamIds();
      console.log(`Found ${examIds.length} exams in database metadata`);

      for (const examId of examIds) {
        const exam = await this.loadExam(examId);
        if (exam) {
          examsMap.set(exam.id, exam);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load exams from database:', error);
    }

    // Fallback: include built-in base exams (including mock-2023-12 General Knowledge exam)
    // only if no exams were loaded from database
    if (examsMap.size === 0) {
      console.log('No exams loaded from database, using base exams as fallback');
      for (const baseExam of baseExams) {
        examsMap.set(baseExam.id, baseExam);
      }
    }

    const resultList = Array.from(examsMap.values());
    console.log(`✅ Loaded ${resultList.length} exams from offline storage`);
    return resultList;
  }

  async getExamList(): Promise<OfflineExamMetadata[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const metadataList: OfflineExamMetadata[] = [];
    
    try {
      const db = await getOfflineDatabase();
      
      // Try to load from localStorage list as fallback
      const savedList = localStorage.getItem('offline-exam-list');
      if (savedList) {
        const examList = JSON.parse(savedList);
        return examList.map((item: any) => ({
          id: item.id,
          title: item.title,
          subject: item.subject,
          duration: item.duration,
          totalQuestions: item.totalQuestions,
          totalMarks: item.totalMarks || 0,
          stream: item.stream || 'both',
          status: item.status || 'active',
          version: '1.0',
          lastUpdated: item.lastModified || new Date().toISOString()
        }));
      }
      
    } catch (error) {
      console.error('❌ Failed to get exam list:', error);
    }

    return metadataList;
  }

  async cacheExam(exam: Exam): Promise<void> {
    try {
      // Cache exam in memory
      this.examCache.set(exam.id, exam);
      
      // Cache in local database
      const db = await getOfflineDatabase();
      await db.cacheExamMetadata(exam.id, {
        ...exam,
        status: exam.status || 'active',
        version: exam.version || '1.0',
        exam_data: JSON.stringify(exam)
      });
      
      // Also cache in localStorage as backup
      localStorage.setItem(`offline-exam-${exam.id}`, JSON.stringify(exam));
      
      // Update exam list in localStorage
      const savedList = localStorage.getItem('offline-exam-list');
      let examList = savedList ? JSON.parse(savedList) : [];
      
      const existingIndex = examList.findIndex((e: any) => e.id === exam.id);
      const metadata = {
        id: exam.id,
        filename: `${exam.id}.json`,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks || 0,
        stream: exam.stream || 'both',
        status: exam.status || 'active',
        fileSize: JSON.stringify(exam).length,
        lastModified: new Date().toISOString()
      };
      
      if (existingIndex === -1) {
        examList.push(metadata);
      } else {
        examList[existingIndex] = metadata;
      }
      
      localStorage.setItem('offline-exam-list', JSON.stringify(examList));
      
      console.log(`✅ Cached exam ${exam.id} in local database`);
    } catch (error) {
      console.error(`❌ Failed to cache exam ${exam.id}:`, error);
    }
  }

  async cacheExams(exams: Exam[]): Promise<void> {
    for (const exam of exams) {
      await this.cacheExam(exam);
    }
    console.log(`✅ Cached ${exams.length} exams for offline use`);
  }

  async clearCache(): Promise<void> {
    try {
      // Clear memory cache
      this.examCache.clear();
      
      // Clear localStorage cache
      const savedList = localStorage.getItem('offline-exam-list');
      if (savedList) {
        const examList = JSON.parse(savedList);
        for (const metadata of examList) {
          localStorage.removeItem(`offline-exam-${metadata.id}`);
        }
        localStorage.removeItem('offline-exam-list');
      }
      
      console.log('✅ Cleared offline exam cache');
    } catch (error) {
      console.error('❌ Failed to clear offline exam cache:', error);
    }
  }

  // Import exam from JSON file (for admin use)
  async importExamFromJson(jsonString: string): Promise<Exam> {
    try {
      const exam = JSON.parse(jsonString) as Exam;
      
      // Validate exam structure
      if (!exam.id || !exam.title || !exam.questions) {
        throw new Error('Invalid exam structure');
      }
      
      await this.cacheExam(exam);
      return exam;
    } catch (error) {
      console.error('❌ Failed to import exam from JSON:', error);
      throw error;
    }
  }

  // Export exam to JSON (for backup/transfer)
  async exportExamToJson(examId: string): Promise<string | null> {
    try {
      const exam = await this.loadExam(examId);
      if (!exam) {
        return null;
      }
      
      return JSON.stringify(exam, null, 2);
    } catch (error) {
      console.error(`❌ Failed to export exam ${examId}:`, error);
      return null;
    }
  }

  // Get storage usage
  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    
    // Calculate from cached exams
    for (const [_, exam] of this.examCache) {
      used += JSON.stringify(exam).length;
    }
    
    // SQLite database can handle much more than localStorage
    // For localStorage fallback, typical limit is ~5MB
    const total = 5 * 1024 * 1024; // 5MB in bytes
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  }
}

// Singleton instance
let offlineExamLoaderInstance: OfflineExamLoader | null = null;

export async function getOfflineExamLoader(): Promise<OfflineExamLoader> {
  if (!offlineExamLoaderInstance) {
    offlineExamLoaderInstance = new OfflineExamLoader();
    await offlineExamLoaderInstance.initialize();
  }
  return offlineExamLoaderInstance;
}

export default OfflineExamLoader;