// TypeScript script to convert exams.ts to exams.json
// Run with: npx tsx scripts/convert-exams.ts

import { exams } from '../src/data/exams';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '../src/data/exams.json');

console.log('🔄 Converting exams to JSON...');
console.log(`📋 Found ${exams.length} exams`);

try {
  const jsonData = JSON.stringify(exams, null, 2);
  fs.writeFileSync(outputPath, jsonData);
  console.log('✅ Successfully created exams.json');
  console.log(`📁 Location: ${outputPath}`);
} catch (error) {
  console.error('❌ Error converting exams:', error);
  process.exit(1);
}