// Script to split exams.json into individual exam files
// Run with: npx tsx scripts/split-exams.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/exams.json');
const outputDir = path.join(__dirname, '../src/data/exam-files');

console.log('🔄 Splitting exams into individual files...');

if (!fs.existsSync(jsonPath)) {
  console.log('❌ exams.json not found');
  process.exit(1);
}

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const examsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`📋 Found ${examsData.length} exams`);

let success = 0;
let failed = 0;

for (const exam of examsData) {
  try {
    const fileName = `${exam.id}.json`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(exam, null, 2));
    console.log(`✅ Created ${fileName}`);
    success++;
  } catch (error) {
    console.error(`❌ Failed to create ${exam.id}.json:`, error);
    failed++;
  }
}

console.log('');
console.log('🎉 Split complete!');
console.log(`✅ Success: ${success}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📁 Location: ${outputDir}`);