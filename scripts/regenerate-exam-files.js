// Script to regenerate exam files from exams.ts with questions
import { exams } from '../src/data/exams.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const examFilesDir = path.join(__dirname, '../src/data/exam-files');

console.log('🔄 Regenerating exam files with questions...');

// Ensure directory exists
if (!fs.existsSync(examFilesDir)) {
  fs.mkdirSync(examFilesDir, { recursive: true });
}

exams.forEach(exam => {
  const filePath = path.join(examFilesDir, `${exam.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(exam, null, 2));
  console.log(`✅ Generated ${exam.id}.json with ${exam.questions.length} questions`);
});

console.log(`🎉 Generated ${exams.length} exam files with questions`);