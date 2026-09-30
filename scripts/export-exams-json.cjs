// Export exams from TypeScript source to JSON for configuration tool
const fs = require('fs');
const path = require('path');

console.log('Exporting exams to JSON...');

// Read the exams file
const examsPath = path.join(__dirname, '../src/data/exams.ts');
const content = fs.readFileSync(examsPath, 'utf-8');

// Extract exam IDs and basic info using a more robust regex
const examRegex = /{\s*id:\s*['"`]([^'"`]+)['"`],\s*title:\s*['"`]([^'"`]+)['"`],\s*subject:\s*['"`]([^'"`]+)['"`],\s*duration:\s*(\d+),\s*totalQuestions:\s*(\d+)[^}]*stream:\s*['"`]?([^'"`\s,]*)['"`]?/g;

const exams = [];
let match;
let matchCount = 0;

while ((match = examRegex.exec(content)) !== null) {
  matchCount++;
  exams.push({
    id: match[1],
    title: match[2],
    subject: match[3],
    duration: parseInt(match[4]),
    totalQuestions: parseInt(match[5]),
    stream: match[6] || 'both',
    status: 'active'
  });
}

console.log(`Found ${matchCount} exams`);

// Save to JSON
const outputPath = path.join(__dirname, '../exams-export.json');
fs.writeFileSync(outputPath, JSON.stringify(exams, null, 2));

console.log(`✅ Exams exported to ${outputPath}`);
console.log(`Total exams: ${exams.length}`);
