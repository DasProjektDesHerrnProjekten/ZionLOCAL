// Script to create exams-list.json from individual exam files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const examFilesDir = path.join(__dirname, '../src/data/exam-files');
const outputFilePath = path.join(__dirname, '../src/data/exams-list.json');

console.log('🔄 Creating exams-list.json from individual files...');

if (!fs.existsSync(examFilesDir)) {
  console.log('❌ exam-files directory not found');
  process.exit(1);
}

const files = fs.readdirSync(examFilesDir).filter(f => f.endsWith('.json'));
console.log(`📋 Found ${files.length} exam files`);

const allExams = [];

for (const file of files) {
  const filePath = path.join(examFilesDir, file);
  try {
    const examData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    allExams.push(examData);
    console.log(`✅ Loaded ${file}`);
  } catch (error) {
    console.error(`❌ Failed to load ${file}:`, error);
  }
}

fs.writeFileSync(outputFilePath, JSON.stringify(allExams, null, 2));
console.log(`✅ Created exams-list.json with ${allExams.length} exams`);
console.log(`📁 Location: ${outputFilePath}`);