// Script to update exams-list.json with full exam data including questions
import { exams } from '../src/data/exams.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputFilePath = path.join(__dirname, '../src/data/exams-list.json');

console.log('🔄 Updating exams-list.json with full exam data...');

fs.writeFileSync(outputFilePath, JSON.stringify(exams, null, 2));
console.log(`✅ Updated exams-list.json with ${exams.length} exams`);
console.log(`📁 Location: ${outputFilePath}`);