// Automated exam upload script that uses your existing Supabase configuration
// This script will automatically detect your Supabase credentials and upload all exam files

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to get credentials from environment or use the known project URL
const supabaseUrl = 'https://kccrpozqbtrdwrldddcd.supabase.co';

// Try multiple methods to get the anon key
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  // Try to read from .env file
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
    if (match) {
      supabaseKey = match[1].trim();
    }
  }
}

if (!supabaseKey) {
  console.log('❌ Cannot find Supabase anon key');
  console.log('');
  console.log('Please add your Supabase anon key to one of these locations:');
  console.log('1. Environment variable: VITE_SUPABASE_ANON_KEY');
  console.log('2. .env file: VITE_SUPABASE_ANON_KEY=your_key');
  console.log('');
  console.log('To get your key:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Navigate to "ElyonPlattform des Herrn Projekten"');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the "anon" key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadAllExams() {
  console.log('🚀 Automated Exam Upload to Supabase Storage');
  console.log('==========================================');
  console.log('');
  
  const examFilesDir = path.join(__dirname, '../src/data/exam-files');
  
  if (!fs.existsSync(examFilesDir)) {
    console.log('❌ exam-files directory not found');
    console.log('⚠️ Running split-exams first...');
    
    // Run the split script
    const { execSync } = await import('child_process');
    try {
      execSync('npx tsx scripts/split-exams.ts', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      console.log('✅ Exam files created');
    } catch (error) {
      console.log('❌ Failed to create exam files');
      process.exit(1);
    }
  }
  
  const files = fs.readdirSync(examFilesDir).filter(f => f.endsWith('.json'));
  console.log(`📋 Found ${files.length} exam files to upload`);
  console.log('');
  
  let success = 0;
  let failed = 0;
  
  for (const file of files) {
    console.log(`📤 Uploading ${file}...`);
    
    const filePath = path.join(examFilesDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      const { data, error } = await supabase.storage
        .from('exams')
        .upload(`MyExamd/${file}`, fileContent, {
          upsert: true,
          contentType: 'application/json'
        });
      
      if (error) {
        console.error(`❌ Failed: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ Success`);
        success++;
      }
    } catch (error) {
      console.error(`❌ Exception: ${error.message}`);
      failed++;
    }
  }
  
  console.log('');
  console.log('🎉 Upload complete!');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (success === files.length) {
    console.log('');
    console.log('🎊 All exams uploaded successfully!');
    console.log('✅ Your application will now use Supabase Storage for exams');
  }
}

uploadAllExams().catch(console.error);