// Exam Access Configuration Script for Offline Deployment
// Run this script before deploying to SEB to configure which exams are available to which students
// Automatically loads all exams and grants access based on stream matching

const fs = require('fs');
const path = require('path');

// Hash function (same as in the app)
function hashPassword(password) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initialize sql.js
let SQL;
async function initSqlJs() {
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs({
    locateFile: file => {
      if (file === 'sql-wasm.wasm' || file === 'sql-wasm-browser.wasm') {
        return path.join(__dirname, '../dist-offline/sql-wasm.wasm');
      }
      return file;
    }
  });
}

// Load database from file or localStorage export
function loadDatabase(dbPath) {
  try {
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      return new SQL.Database(buffer);
    }
    console.log('No existing database found, creating new one...');
    const db = new SQL.Database();
    createTables(db);
    seedMockStudents(db);
    return db;
  } catch (error) {
    console.error('Error loading database:', error);
    throw error;
  }
}

// Save database to file
function saveDatabase(db, dbPath) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    console.log('✅ Database saved successfully');
  } catch (error) {
    console.error('Error saving database:', error);
    throw error;
  }
}

// Create database tables
function createTables(db) {
  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS exam_access (
      student_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      has_access INTEGER NOT NULL,
      granted_at TEXT NOT NULL,
      PRIMARY KEY (student_id, exam_id),
      FOREIGN KEY (student_id) REFERENCES students (student_id)
    )
  `);

  db.run(`
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

  console.log('✅ Database tables created');
}

// Seed mock students
async function seedMockStudents(db) {
  const students = [
    {
      id: 'student-001',
      name: 'John Smith',
      student_id: 'STU001',
      stream: 'natural',
      grade: '12',
      password: 'password123'
    },
    {
      id: 'student-002',
      name: 'Jane Doe',
      student_id: 'STU002',
      stream: 'social',
      grade: '12',
      password: 'password123'
    },
    {
      id: 'student-003',
      name: 'Alex Johnson',
      student_id: 'STU003',
      stream: 'both',
      grade: '11',
      password: 'password123'
    },
    {
      id: 'student-121212',
      name: 'Test Student',
      student_id: '121212',
      stream: 'natural',
      grade: '12',
      password: 'password123'
    }
  ];

  for (const student of students) {
    const passwordHash = hashPassword(student.password);
    db.run(
      'INSERT OR REPLACE INTO students (id, name, student_id, stream, grade, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student.id, student.name, student.student_id, student.stream, student.grade, passwordHash, new Date().toISOString()]
    );
  }
  console.log('✅ Mock students seeded');
}

// Get all students
function getAllStudents(db) {
  const stmt = db.prepare('SELECT * FROM students');
  const students = [];
  while (stmt.step()) {
    students.push(stmt.getAsObject());
  }
  stmt.free();
  return students;
}

// Get all exams from metadata
function getAllExams(db) {
  const stmt = db.prepare('SELECT * FROM exams_metadata');
  const exams = [];
  while (stmt.step()) {
    exams.push(stmt.getAsObject());
  }
  stmt.free();
  return exams;
}

// Grant exam access
function grantExamAccess(db, studentId, examId) {
  db.run(
    'INSERT OR REPLACE INTO exam_access (student_id, exam_id, has_access, granted_at) VALUES (?, ?, ?, ?)',
    [studentId, examId, 1, new Date().toISOString()]
  );
}

// Cache exam metadata
function cacheExamMetadata(db, exam) {
  db.run(
    'INSERT OR REPLACE INTO exams_metadata (exam_id, title, subject, duration, total_questions, total_marks, stream, status, version, exam_data, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      exam.id,
      exam.title,
      exam.subject,
      exam.duration,
      exam.totalQuestions,
      exam.totalMarks || exam.totalQuestions, // Default to totalQuestions if not specified
      exam.stream || 'both',
      exam.status || 'active',
      '1.0',
      JSON.stringify(exam),
      new Date().toISOString()
    ]
  );
}

// Create a simple mock exam for testing
function createMockExam() {
  return {
    id: 'mock-general-001',
    title: 'General Knowledge Test',
    subject: 'General',
    duration: 10, // 10 minutes
    totalQuestions: 10,
    totalMarks: 10,
    stream: 'both',
    status: 'active',
    questions: [
      {
        id: 1,
        text: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2
      },
      {
        id: 2,
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      },
      {
        id: 3,
        text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1
      },
      {
        id: 4,
        text: 'What is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctAnswer: 3
      },
      {
        id: 5,
        text: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2
      },
      {
        id: 6,
        text: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'O2', 'NaCl'],
        correctAnswer: 0
      },
      {
        id: 7,
        text: 'Who wrote "Romeo and Juliet"?',
        options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
        correctAnswer: 1
      },
      {
        id: 8,
        text: 'What is the largest mammal?',
        options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
        correctAnswer: 1
      },
      {
        id: 9,
        text: 'What year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctAnswer: 2
      },
      {
        id: 10,
        text: 'What is the currency of Japan?',
        options: ['Yuan', 'Won', 'Yen', 'Ringgit'],
        correctAnswer: 2
      }
    ]
  };
}

// Load exams from JSON export file
function loadExamsFromSource() {
  try {
    const jsonPath = path.join(__dirname, '../exams-export.json');
    if (!fs.existsSync(jsonPath)) {
      console.log('⚠️  No exams export file found. Run export-exams.bat first.');
      return [];
    }

    const content = fs.readFileSync(jsonPath, 'utf-8');
    const exams = JSON.parse(content);
    return exams;
  } catch (error) {
    console.error('Error loading exams from JSON:', error);
    return [];
  }
}

// Auto-configure exam access based on stream matching
function autoConfigureExamAccess(db) {
  console.log('\n=== Auto-configuring Exam Access ===\n');

  const students = getAllStudents(db);
  const exams = getAllExams(db);

  if (exams.length === 0) {
    console.log('⚠️  No exams found in database. Creating mock exam...');
    const mockExam = createMockExam();
    cacheExamMetadata(db, mockExam);
    console.log(`✅ Created mock exam: ${mockExam.title}`);

    // Reload exams after caching
    exams.length = 0;
    exams.push(...getAllExams(db));
  }

  console.log(`\nConfiguring access for ${students.length} students and ${exams.length} exams...\n`);

  let totalGrants = 0;

  students.forEach(student => {
    const studentStream = student.stream;
    exams.forEach(exam => {
      const examStream = exam.stream || 'both';

      // Grant access based on stream matching:
      // - natural students get natural exams
      // - social students get social exams
      // - both students get all exams
      // - both stream exams are available to all students
      const shouldGrant =
        studentStream === 'both' ||
        examStream === 'both' ||
        studentStream === examStream;

      if (shouldGrant) {
        grantExamAccess(db, student.student_id, exam.exam_id);
        totalGrants++;
      }
    });
  });

  console.log(`✅ Granted ${totalGrants} exam access permissions\n`);

  // Show summary
  console.log('Access Summary:');
  students.forEach(student => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM exam_access WHERE student_id = ? AND has_access = 1');
    stmt.bind([student.student_id]);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    console.log(`  ${student.name} (${student.student_id}): ${result.count} exams`);
  });
}

// Main function
async function main() {
  try {
    console.log('========================================');
    console.log('Exam Access Configuration Tool');
    console.log('========================================');
    console.log();
    console.log('Auto-configuring exam access based on stream matching:');
    console.log('- Natural stream students → Natural exams');
    console.log('- Social stream students → Social exams');
    console.log('- Both stream students → All exams');
    console.log();

    console.log('Initializing SQL.js...');
    await initSqlJs();
    console.log('✅ SQL.js initialized');

    const dbPath = path.join(__dirname, '../exam-offline.db');
    console.log(`Loading database from: ${dbPath}`);
    const db = loadDatabase(dbPath);

    // Auto-configure exam access
    autoConfigureExamAccess(db);

    saveDatabase(db, dbPath);

    console.log('\n✅ Configuration complete. Database saved.');
    console.log('You can now deploy to SEB with the configured exam access.');
    console.log();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
