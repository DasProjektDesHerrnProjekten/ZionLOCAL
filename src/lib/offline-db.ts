import initSqlJs from 'sql.js';
import { exams } from '@/data/exams';

type SqlJsType = {
  Database: new (data?: Uint8Array) => SqlJsDatabase;
};

interface SqlJsDatabase {
  run: (sql: string, params?: unknown[]) => unknown;
  exec: (sql: string) => unknown[];
  export: () => Uint8Array;
  prepare: (sql: string) => SqlJsStatement;
}

interface SqlJsStatement {
  bind: (params: unknown[]) => void;
  step: () => boolean;
  getAsObject: () => Record<string, unknown>;
  free: () => void;
}

let SQL: SqlJsType | null = null;
let sqlJsInitPromise: Promise<SqlJsType> | null = null;

// Initialize sql.js promise
function getSqlJsPromise(): Promise<SqlJsType> {
  if (!sqlJsInitPromise) {
    sqlJsInitPromise = initSqlJs({
      locateFile: file => {
        // Use local WASM file for offline mode
        if (file === 'sql-wasm.wasm' || file === 'sql-wasm-browser.wasm') {
          return '/sql-wasm.wasm';
        }
        return file;
      }
    }).then((sqlJs: SqlJsType) => {
      SQL = sqlJs;
      console.log('✅ sql.js initialized (offline mode)');
      return SQL;
    }).catch((error: Error) => {
      console.error('❌ Failed to initialize sql.js:', error);
      throw error;
    });
  }
  return sqlJsInitPromise;
}

export interface OfflineExamResult {
  id: string;
  student_id: string;
  exam_id: string;
  student_name: string;
  exam_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  answers: Record<string, number>;
  time_taken: number;
  started_at: string;
  completed_at: string;
  status: 'completed' | 'in_progress' | 'abandoned';
}

export interface OfflineStudent {
  id: string;
  name: string;
  student_id: string;
  stream: 'natural' | 'social' | 'both';
  grade: string;
  created_at: string;
}

export interface OfflineExamAccess {
  student_id: string;
  exam_id: string;
  has_access: boolean;
  granted_at: string;
}

class OfflineDatabase {
  private db: SqlJsDatabase | null = null;
  private dbName = 'exam-offline.db';

  async initialize(): Promise<void> {
    try {
      // Ensure sql.js is initialized
      await getSqlJsPromise();

      // Try to load from pre-configured file first (for SEB deployment)
      try {
        const response = await fetch('./exam-offline.db');
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const dbBytes = new Uint8Array(arrayBuffer);
          this.db = new SQL.Database(dbBytes);
          console.log('✅ Loaded pre-configured database from file');
          // Always run createTables() so missing tables (exam_attempts, exam_results, etc.)
          // are created — all statements use IF NOT EXISTS so existing data is safe.
          this.createTables();
          // Clear localStorage to avoid conflicts, then save the new database
          localStorage.removeItem(this.dbName);
          localStorage.removeItem('offline-student-id');
          // Clear any exam-related localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('offline-exam-') || key.startsWith('exam-')) {
              localStorage.removeItem(key);
            }
          });
          this.saveDatabase();
          return;
        }
      } catch (fileError) {
        console.log('No pre-configured database file found, checking localStorage...');
      }

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem(this.dbName);

      if (savedDb) {
        const dbBytes = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
        this.db = new SQL.Database(dbBytes);
        console.log('✅ Loaded existing offline database from localStorage');
        // Ensure mock students exist even in existing databases
        await this.ensureMockStudents();
      } else {
        // Create new database
        this.db = new SQL.Database();
        this.createTables();
        await this.seedMockStudents();
        this.saveDatabase();
        console.log('✅ Created new offline database with mock students');
      }
    } catch (error) {
      console.error('❌ Failed to initialize offline database:', error);
      throw error;
    }
  }

  private createTables(): void {
    // Create students table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        student_id TEXT UNIQUE NOT NULL,
        stream TEXT NOT NULL,
        grade TEXT,
        password_hash TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Create exam attempts table (tracks individual exam sessions)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS exam_attempts (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        exam_id TEXT NOT NULL,
        exam_version TEXT NOT NULL,
        student_name TEXT NOT NULL,
        exam_title TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at TEXT NOT NULL,
        submitted_at TEXT,
        deadline TEXT NOT NULL,
        duration INTEGER NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students (student_id),
        UNIQUE(student_id, exam_id, submitted_at)
      )
    `);

    // Create exam answers table (stores individual answers)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS exam_answers (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        answer INTEGER,
        answered_at TEXT NOT NULL,
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts (id) ON DELETE CASCADE,
        UNIQUE(attempt_id, question_id)
      )
    `);

    // Create exam flags table (stores flagged questions)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS exam_flags (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        flagged_at TEXT NOT NULL,
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts (id) ON DELETE CASCADE,
        UNIQUE(attempt_id, question_id)
      )
    `);

    // Create exam results table (final results after submission)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL UNIQUE,
        student_id TEXT NOT NULL,
        exam_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        exam_title TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_marks INTEGER NOT NULL,
        percentage REAL NOT NULL,
        correct_answers INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        time_taken INTEGER NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        status TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        sync_error TEXT,
        synced_at TEXT,
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts (id),
        FOREIGN KEY (student_id) REFERENCES students (student_id)
      )
    `);

    // Create exam events table (tracks violations and events)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS exam_events (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        description TEXT,
        severity TEXT,
        timestamp TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts (id) ON DELETE CASCADE
      )
    `);

    // Create exam access table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS exam_access (
        student_id TEXT NOT NULL,
        exam_id TEXT NOT NULL,
        has_access INTEGER NOT NULL,
        granted_at TEXT NOT NULL,
        PRIMARY KEY (student_id, exam_id),
        FOREIGN KEY (student_id) REFERENCES students (student_id)
      )
    `);

    // Create exams metadata table (for caching exam info)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS exams_metadata (
        exam_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        duration INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        total_marks INTEGER,
        stream TEXT NOT NULL,
        status TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0',
        exam_data TEXT,
        last_updated TEXT NOT NULL
      )
    `);

    // Create sync queue table (for offline-to-online synchronization)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create schema version table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      )
    `);

    // Initialize schema version
    const stmt = this.db.prepare('SELECT version FROM schema_version WHERE version = 1');
    stmt.step();
    const hasVersion = stmt.getAsObject();
    stmt.free();

    if (!hasVersion) {
      this.db.run('INSERT INTO schema_version (version, applied_at) VALUES (1, ?)', [new Date().toISOString()]);
      console.log('✅ Database schema version 1 initialized');
    }
  }

  private saveDatabase(): void {
    try {
      const data = this.db.export();
      const buffer = new Uint8Array(data);
      const binaryString = Array.from(buffer, byte => String.fromCharCode(byte)).join('');
      localStorage.setItem(this.dbName, btoa(binaryString));
    } catch (error) {
      console.error('❌ Failed to save database:', error);
    }
  }

  private async seedMockStudents(): Promise<void> {
    // Hash function (same as in OfflineAuthContext)
    async function hashPassword(password: string): Promise<string> {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }

    const mockStudents = [
      {
        id: 'student-001',
        name: 'John Smith',
        student_id: 'STU001',
        stream: 'natural' as const,
        grade: '12',
        password: 'password123'
      },
      {
        id: 'student-002',
        name: 'Jane Doe',
        student_id: 'STU002',
        stream: 'social' as const,
        grade: '12',
        password: 'password123'
      },
      {
        id: 'student-003',
        name: 'Alex Johnson',
        student_id: 'STU003',
        stream: 'both' as const,
        grade: '11',
        password: 'password123'
      },
      {
        id: 'student-121212',
        name: 'Test Student',
        student_id: '121212',
        stream: 'natural' as const,
        grade: '12',
        password: 'password123'
      }
    ];

    for (const student of mockStudents) {
      const passwordHash = await hashPassword(student.password);
      this.db.run(
        'INSERT OR REPLACE INTO students (id, name, student_id, stream, grade, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [student.id, student.name, student.student_id, student.stream, student.grade, passwordHash, new Date().toISOString()]
      );
      console.log(`✅ Seeded mock student: ${student.name} (ID: ${student.student_id})`);
    }
  }

  private async ensureMockStudents(): Promise<void> {
    // Hash function (same as in OfflineAuthContext)
    async function hashPassword(password: string): Promise<string> {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }

    const mockStudents = [
      {
        id: 'student-001',
        name: 'John Smith',
        student_id: 'STU001',
        stream: 'natural' as const,
        grade: '12',
        password: 'password123'
      },
      {
        id: 'student-002',
        name: 'Jane Doe',
        student_id: 'STU002',
        stream: 'social' as const,
        grade: '12',
        password: 'password123'
      },
      {
        id: 'student-003',
        name: 'Alex Johnson',
        student_id: 'STU003',
        stream: 'both' as const,
        grade: '11',
        password: 'password123'
      },
      {
        id: 'student-121212',
        name: 'Test Student',
        student_id: '121212',
        stream: 'natural' as const,
        grade: '12',
        password: 'password123'
      }
    ];

    for (const student of mockStudents) {
      // Check if student already exists
      const stmt = this.db.prepare('SELECT student_id FROM students WHERE student_id = ?');
      stmt.bind([student.student_id]);
      const hasRow = stmt.step();
      stmt.free();

      if (!hasRow) {
        // Student doesn't exist, add them
        const passwordHash = await hashPassword(student.password);
        this.db.run(
          'INSERT INTO students (id, name, student_id, stream, grade, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [student.id, student.name, student.student_id, student.stream, student.grade, passwordHash, new Date().toISOString()]
        );
        console.log(`✅ Added mock student: ${student.name} (ID: ${student.student_id})`);
      }
    }

    this.saveDatabase();
  }

  // Student operations
  async addStudent(student: OfflineStudent): Promise<void> {
    try {
      this.db.run(
        'INSERT OR REPLACE INTO students (id, name, student_id, stream, grade, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [student.id, student.name, student.student_id, student.stream, student.grade, (student as any).password_hash || null, student.created_at]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to add student:', error);
      throw error;
    }
  }

  async getStudent(studentId: string): Promise<OfflineStudent | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM students WHERE student_id = ?');
      stmt.bind([studentId]);
      const hasRow = stmt.step();
      const result = hasRow ? stmt.getAsObject() : null;
      stmt.free();
      return result || null;
    } catch (error) {
      console.error('❌ Failed to get student:', error);
      return null;
    }
  }

  async updateStudentPassword(studentId: string, passwordHash: string): Promise<void> {
    try {
      this.db.run(
        'UPDATE students SET password_hash = ? WHERE student_id = ?',
        [passwordHash, studentId]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to update student password:', error);
      throw error;
    }
  }

  // Exam attempt operations
  async createAttempt(attemptData: {
    id: string;
    student_id: string;
    exam_id: string;
    exam_version: string;
    student_name: string;
    exam_title: string;
    duration: number;
  }): Promise<void> {
    try {
      const startedAt = new Date().toISOString();
      const deadline = new Date(Date.now() + attemptData.duration * 60 * 1000).toISOString();

      this.db.run(
        `INSERT INTO exam_attempts 
         (id, student_id, exam_id, exam_version, student_name, exam_title, status, started_at, deadline, duration) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          attemptData.id,
          attemptData.student_id,
          attemptData.exam_id,
          attemptData.exam_version,
          attemptData.student_name,
          attemptData.exam_title,
          'in_progress',
          startedAt,
          deadline,
          attemptData.duration
        ]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to create attempt:', error);
      throw error;
    }
  }

  async getAttempt(attemptId: string): Promise<any | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM exam_attempts WHERE id = ?');
      stmt.bind([attemptId]);
      const hasRow = stmt.step();
      const result = hasRow ? stmt.getAsObject() : null;
      stmt.free();
      return result || null;
    } catch (error) {
      console.error('❌ Failed to get attempt:', error);
      return null;
    }
  }

  async getInProgressAttempt(studentId: string, examId: string): Promise<any | null> {
    try {
      const stmt = this.db.prepare(
        'SELECT * FROM exam_attempts WHERE student_id = ? AND exam_id = ? AND status = ?'
      );
      stmt.bind([studentId, examId, 'in_progress']);
      const hasRow = stmt.step();
      const result = hasRow ? stmt.getAsObject() : null;
      stmt.free();
      return result || null;
    } catch (error) {
      console.error('❌ Failed to get in-progress attempt:', error);
      return null;
    }
  }

  async getAllInProgressAttempts(studentId: string): Promise<any[]> {
    try {
      const stmt = this.db.prepare(
        'SELECT * FROM exam_attempts WHERE student_id = ? AND status = ?'
      );
      stmt.bind([studentId, 'in_progress']);
      const attempts: any[] = [];
      while (stmt.step()) {
        attempts.push(stmt.getAsObject());
      }
      stmt.free();
      return attempts;
    } catch (error) {
      console.error('❌ Failed to get all in-progress attempts:', error);
      return [];
    }
  }

  async updateAttemptStatus(attemptId: string, status: string): Promise<void> {
    try {
      const updateData: Record<string, string> = { status };
      if (status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      }

      const setClause = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
      const values = [...Object.values(updateData), attemptId];

      this.db.run(
        `UPDATE exam_attempts SET ${setClause} WHERE id = ?`,
        values
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to update attempt status:', error);
      throw error;
    }
  }

  // Answer operations
  async saveAnswer(attemptId: string, questionId: string, answer: number): Promise<void> {
    try {
      this.db.run(
        `INSERT OR REPLACE INTO exam_answers (id, attempt_id, question_id, answer, answered_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          `${attemptId}-${questionId}`,
          attemptId,
          questionId,
          answer,
          new Date().toISOString()
        ]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to save answer:', error);
      throw error;
    }
  }

  async getAnswers(attemptId: string): Promise<Record<string, number>> {
    try {
      const stmt = this.db.prepare('SELECT question_id, answer FROM exam_answers WHERE attempt_id = ?');
      stmt.bind([attemptId]);
      const answers: Record<string, number> = {};
      while (stmt.step()) {
        const row = stmt.getAsObject();
        answers[row.question_id] = row.answer;
      }
      stmt.free();
      return answers;
    } catch (error) {
      console.error('❌ Failed to get answers:', error);
      return {};
    }
  }

  // Flag operations
  async toggleFlag(attemptId: string, questionId: string, flagged: boolean): Promise<void> {
    try {
      if (flagged) {
        this.db.run(
          `INSERT OR REPLACE INTO exam_flags (id, attempt_id, question_id, flagged_at) 
           VALUES (?, ?, ?, ?)`,
          [
            `${attemptId}-flag-${questionId}`,
            attemptId,
            questionId,
            new Date().toISOString()
          ]
        );
      } else {
        this.db.run(
          'DELETE FROM exam_flags WHERE attempt_id = ? AND question_id = ?',
          [attemptId, questionId]
        );
      }
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to toggle flag:', error);
      throw error;
    }
  }

  async getFlags(attemptId: string): Promise<Set<string>> {
    try {
      const stmt = this.db.prepare('SELECT question_id FROM exam_flags WHERE attempt_id = ?');
      stmt.bind([attemptId]);
      const flags = new Set<string>();
      while (stmt.step()) {
        const row = stmt.getAsObject();
        flags.add(row.question_id);
      }
      stmt.free();
      return flags;
    } catch (error) {
      console.error('❌ Failed to get flags:', error);
      return new Set();
    }
  }

  // Event operations
  async saveEvent(eventData: {
    attempt_id: string;
    event_type: string;
    description?: string;
    severity?: string;
  }): Promise<void> {
    try {
      this.db.run(
        `INSERT INTO exam_events (id, attempt_id, event_type, description, severity, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          eventData.attempt_id,
          eventData.event_type,
          eventData.description || null,
          eventData.severity || null,
          new Date().toISOString()
        ]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to save event:', error);
      throw error;
    }
  }

  async getEvents(attemptId: string): Promise<any[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM exam_events WHERE attempt_id = ? ORDER BY timestamp DESC');
      stmt.bind([attemptId]);
      const events: Record<string, unknown>[] = [];
      while (stmt.step()) {
        events.push(stmt.getAsObject() as Record<string, unknown>);
      }
      stmt.free();
      return events;
    } catch (error) {
      console.error('❌ Failed to get events:', error);
      return [];
    }
  }

  // Result operations
  async saveResult(resultData: {
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
  }): Promise<void> {
    try {
      const completedAt = new Date().toISOString();

      this.db.run(
        `INSERT INTO exam_results 
         (id, attempt_id, student_id, exam_id, student_name, exam_title, score, total_marks, percentage, 
          correct_answers, total_questions, time_taken, started_at, completed_at, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resultData.id,
          resultData.attempt_id,
          resultData.student_id,
          resultData.exam_id,
          resultData.student_name,
          resultData.exam_title,
          resultData.score,
          resultData.total_marks,
          resultData.percentage,
          resultData.correct_answers,
          resultData.total_questions,
          resultData.time_taken,
          resultData.started_at,
          completedAt,
          'completed'
        ]
      );

      // Update attempt status
      await this.updateAttemptStatus(resultData.attempt_id, 'submitted');

      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to save result:', error);
      throw error;
    }
  }

  async getResult(resultId: string): Promise<any | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM exam_results WHERE id = ?');
      stmt.bind([resultId]);
      const hasRow = stmt.step();
      const result = hasRow ? stmt.getAsObject() : null;
      stmt.free();
      return result || null;
    } catch (error) {
      console.error('❌ Failed to get result:', error);
      return null;
    }
  }

  async getStudentResults(studentId: string): Promise<any[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM exam_results WHERE student_id = ? ORDER BY completed_at DESC');
      stmt.bind([studentId]);
      const results: Record<string, unknown>[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as Record<string, unknown>);
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('❌ Failed to get student results:', error);
      return [];
    }
  }

  // Sync queue operations
  async addToSyncQueue(item: {
    entity_type: string;
    entity_id: string;
    operation: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    try {
      this.db.run(
        `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          item.entity_type,
          item.entity_id,
          item.operation,
          item.payload ? JSON.stringify(item.payload) : null,
          'pending',
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error);
      throw error;
    }
  }

  async getPendingSyncItems(): Promise<Record<string, unknown>[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM sync_queue WHERE status = ? ORDER BY created_at ASC');
      stmt.bind(['pending']);
      const items: Record<string, unknown>[] = [];
      while (stmt.step()) {
        const item = stmt.getAsObject() as Record<string, unknown>;
        if (item.payload) {
          (item as Record<string, unknown>).payload = JSON.parse(item.payload as string);
        }
        items.push(item);
      }
      stmt.free();
      return items;
    } catch (error) {
      console.error('❌ Failed to get pending sync items:', error);
      return [];
    }
  }

  async updateSyncStatus(itemId: string, status: string, error?: string): Promise<void> {
    try {
      const updateData: Record<string, string | number> = { status, updated_at: new Date().toISOString() };
      if (error) {
        updateData.last_error = error;
        updateData.retry_count = 1; // This should increment in real implementation
      }

      const setClause = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
      const values = [...Object.values(updateData), itemId];

      this.db.run(
        `UPDATE sync_queue SET ${setClause} WHERE id = ?`,
        values
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to update sync status:', error);
      throw error;
    }
  }

  async getAllStudents(): Promise<OfflineStudent[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM students');
      const results: OfflineStudent[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as OfflineStudent);
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('❌ Failed to get all students:', error);
      return [];
    }
  }

  // Exam result operations
  async saveExamResult(result: OfflineExamResult): Promise<void> {
    try {
      this.db.run(
        `INSERT OR REPLACE INTO exam_results 
         (id, student_id, exam_id, student_name, exam_title, score, total_marks, percentage, 
          answers, time_taken, started_at, completed_at, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          result.id,
          result.student_id,
          result.exam_id,
          result.student_name,
          result.exam_title,
          result.score,
          result.total_marks,
          result.percentage,
          JSON.stringify(result.answers),
          result.time_taken,
          result.started_at,
          result.completed_at,
          result.status
        ]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to save exam result:', error);
      throw error;
    }
  }

  async getExamResult(resultId: string): Promise<OfflineExamResult | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM exam_results WHERE id = ?');
      stmt.bind([resultId]);
      const hasRow = stmt.step();
      const result = hasRow ? stmt.getAsObject() : null;
      stmt.free();

      if (result) {
        result.answers = JSON.parse(result.answers);
      }

      return result || null;
    } catch (error) {
      console.error('❌ Failed to get exam result:', error);
      return null;
    }
  }

  async getStudentExamResults(studentId: string): Promise<OfflineExamResult[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM exam_results WHERE student_id = ? ORDER BY completed_at DESC');
      stmt.bind([studentId]);
      const results: OfflineExamResult[] = [];
      while (stmt.step()) {
        const result = stmt.getAsObject() as any;
        result.answers = JSON.parse(result.answers);
        results.push(result);
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('❌ Failed to get student exam results:', error);
      return [];
    }
  }

  async getAllExamResults(): Promise<OfflineExamResult[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM exam_results ORDER BY completed_at DESC');
      const results: OfflineExamResult[] = [];
      while (stmt.step()) {
        const result = stmt.getAsObject() as any;
        result.answers = JSON.parse(result.answers);
        results.push(result);
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('❌ Failed to get all exam results:', error);
      return [];
    }
  }

  // Exam access operations
  async grantExamAccess(studentId: string, examId: string): Promise<void> {
    try {
      this.db.run(
        `INSERT OR REPLACE INTO exam_access (student_id, exam_id, has_access, granted_at) 
         VALUES (?, ?, 1, ?)`,
        [studentId, examId, new Date().toISOString()]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to grant exam access:', error);
      throw error;
    }
  }

  async revokeExamAccess(studentId: string, examId: string): Promise<void> {
    try {
      this.db.run(
        `UPDATE exam_access SET has_access = 0 WHERE student_id = ? AND exam_id = ?`,
        [studentId, examId]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to revoke exam access:', error);
      throw error;
    }
  }

  async checkExamAccess(studentId: string, examId: string): Promise<boolean> {
    try {
      if (!this.db) return true;
      const stmt = this.db.prepare('SELECT has_access FROM exam_access WHERE student_id = ? AND exam_id = ?');
      stmt.bind([studentId, examId]);
      const hasRow = stmt.step();
      const result = hasRow ? stmt.getAsObject() : null;
      stmt.free();
      // If no explicit restriction record exists in exam_access table, default to true (access granted)
      return result !== null ? result.has_access === 1 : true;
    } catch (error) {
      console.error('❌ Failed to check exam access:', error);
      return true;
    }
  }

  async getStudentAccessibleExams(studentId: string): Promise<string[]> {
    try {
      if (!this.db) return exams.map(e => e.id);
      const stmt = this.db.prepare('SELECT exam_id FROM exam_access WHERE student_id = ? AND has_access = 1');
      stmt.bind([studentId]);
      const examIds: string[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        if (row && row.exam_id) {
          examIds.push(row.exam_id as string);
        }
      }
      stmt.free();

      // If explicit access records exist for this student ID, return them
      if (examIds.length > 0) {
        return examIds;
      }

      // Default: Return all active / cached exam IDs or base exams list
      try {
        const metaStmt = this.db.prepare('SELECT exam_id FROM exams_metadata WHERE status = "active" OR status = "ongoing"');
        while (metaStmt.step()) {
          const row = metaStmt.getAsObject();
          if (row && row.exam_id) {
            examIds.push(row.exam_id as string);
          }
        }
        metaStmt.free();
      } catch (err) {
        // Ignore metadata table read errors
      }

      if (examIds.length === 0) {
        return exams.map(e => e.id);
      }
      return Array.from(new Set(examIds));
    } catch (error) {
      console.error('❌ Failed to get student accessible exams:', error);
      return exams.map(e => e.id);
    }
  }

  // Exam metadata operations
  async cacheExamMetadata(examId: string, metadata: Record<string, unknown>): Promise<void> {
    try {
      this.db.run(
        `INSERT OR REPLACE INTO exams_metadata
         (exam_id, title, subject, duration, total_questions, total_marks, stream, status, version, exam_data, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          examId,
          metadata.title,
          metadata.subject,
          metadata.duration,
          metadata.totalQuestions,
          metadata.totalMarks || 0,
          metadata.stream || 'both',
          metadata.status || 'active',
          metadata.version || '1.0',
          metadata.exam_data || null,
          new Date().toISOString()
        ]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('❌ Failed to cache exam metadata:', error);
    }
  }

  async getCachedExamMetadata(examId: string): Promise<any | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM exams_metadata WHERE exam_id = ?');
      stmt.bind([examId]);
      const hasRow = stmt.step();
      const result = hasRow ? stmt.getAsObject() : null;
      stmt.free();
      return result || null;
    } catch (error) {
      console.error('❌ Failed to get cached exam metadata:', error);
      return null;
    }
  }

  async getAllExamIds(): Promise<string[]> {
    try {
      const stmt = this.db.prepare('SELECT exam_id FROM exams_metadata');
      const examIds: string[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        examIds.push(row.exam_id);
      }
      stmt.free();
      return examIds;
    } catch (error) {
      console.error('❌ Failed to get all exam IDs:', error);
      return [];
    }
  }

  // Export/Import for data collection
  exportDatabase(): Uint8Array {
    return this.db.export();
  }

  async importDatabase(data: Uint8Array): Promise<void> {
    try {
      await getSqlJsPromise();
      this.db = new SQL.Database(data);
      this.saveDatabase();
      console.log('✅ Database imported successfully');
    } catch (error) {
      console.error('❌ Failed to import database:', error);
      throw error;
    }
  }

  async clearDatabase(): Promise<void> {
    try {
      await getSqlJsPromise();
      this.db = new SQL.Database();
      this.createTables();
      this.saveDatabase();
      console.log('✅ Database cleared');
    } catch (error) {
      console.error('❌ Failed to clear database:', error);
      throw error;
    }
  }
}

// Singleton instance and initialization promise
let offlineDbInstance: OfflineDatabase | null = null;
let dbInitPromise: Promise<OfflineDatabase> | null = null;

export async function getOfflineDatabase(): Promise<OfflineDatabase> {
  if (offlineDbInstance) {
    return offlineDbInstance;
  }
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      const instance = new OfflineDatabase();
      await instance.initialize();
      offlineDbInstance = instance;
      return instance;
    })();
  }
  return dbInitPromise;
}

export default OfflineDatabase;