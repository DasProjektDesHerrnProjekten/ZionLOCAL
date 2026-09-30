const fs = require('fs');
const path = require('path');

// This script converts the TypeScript exams file to JSON for upload to Supabase
// Since we can't directly import TypeScript in Node.js, we'll do a simple extraction

function convertExamsToJson() {
  try {
    console.log('🔄 Converting exams.ts to JSON...');
    
    const examsPath = path.join(__dirname, '../src/data/exams.ts');
    const outputPath = path.join(__dirname, '../src/data/exams.json');
    
    if (!fs.existsSync(examsPath)) {
      console.error('❌ exams.ts not found');
      return;
    }
    
    const examsContent = fs.readFileSync(examsPath, 'utf8');
    
    // Extract the exams array from the TypeScript file
    // This is a simplified approach - for production you'd want to use a proper parser
    const arrayMatch = examsContent.match(/export const exams: Exam\[\] = \[([\s\S]*?)\];/);
    
    if (!arrayMatch) {
      console.error('❌ Could not find exams array in the file');
      return;
    }
    
    // Remove the export statement and type annotation to make it valid JavaScript
    const jsContent = arrayMatch[0]
      .replace('export const exams: Exam[] = ', 'const exams = ')
      .replace(';', '');
    
    // We need to handle the imports and references to other exam files
    // For simplicity, let's just replace the imported exam references with their actual data
    
    // This is a workaround - in production you'd want to properly compile the TypeScript
    console.log('⚠️ This conversion script needs manual adjustment for the imports');
    console.log('⚠️ For now, you may need to manually create the JSON file');
    
    // Alternative approach: use eval to execute the JavaScript (not recommended for production)
    try {
      // Remove TypeScript-specific syntax
      const cleanContent = examsContent
        .replace(/export interface Question \{[\s\S]*?\}/, '')
        .replace(/export interface Exam \{[\s\S]*?\}/, '')
        .replace(/import .* from '.*';/g, '')
        .replace(/export const exams: Exam\[\] = /, 'const exams = ')
        .replace(/,$/, '')
        .replace(/;$/, '');
      
      // For this to work, we'd need to handle all the imported exam data
      // This is complex, so let's suggest a different approach
      
      console.log('⚠️ Complex TypeScript file - manual conversion recommended');
      console.log('💡 Alternative: Copy the exams array manually to a JSON file');
      
    } catch (error) {
      console.error('❌ Error during conversion:', error);
    }
    
  } catch (error) {
    console.error('❌ Exception during conversion:', error);
  }
}

// A simpler approach: just read the file and provide instructions
function provideInstructions() {
  console.log('📋 Manual Conversion Instructions:');
  console.log('');
  console.log('1. Open src/data/exams.ts');
  console.log('2. Copy the entire exams array (after "export const exams: Exam[] = [")');
  console.log('3. Create a new file src/data/exams.json');
  console.log('4. Paste the array content and ensure it\'s valid JSON');
  console.log('5. Remove TypeScript-specific syntax like interface definitions');
  console.log('6. Replace imported exam references with actual data');
  console.log('');
  console.log('Or use this automated approach:');
  console.log('1. Install typescript and ts-node: npm install -g typescript ts-node');
  console.log('2. Run: ts-node scripts/convert-exams-to-json.ts');
}

// For now, let's just provide instructions since the automatic conversion is complex
provideInstructions();