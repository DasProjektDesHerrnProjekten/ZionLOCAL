// Script to upload individual exam files to Supabase Storage
// Run with: npx tsx scripts/upload-exam-files.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kccrpozqbtrdwrldddcd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.log('❌ Missing VITE_SUPABASE_ANON_KEY environment variable');
  console.log('');
  console.log('Please set your Supabase anon key:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Navigate to your project "ElyonPlattform des Herrn Projekten"');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the "anon" key');
  console.log('5. Add it to your .env.local file: VITE_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log('🔧 Checking storage bucket "exams"...');
  
  try {
    const { data, error } = await supabase.storage.createBucket('exams', {
      public: false,
      fileSizeLimit: 104857600 // 100MB
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
        return true;
      }
      console.error('❌ Error creating bucket:', error.message);
      return false;
    }
    
    console.log('✅ Bucket created successfully');
    return true;
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('✅ Bucket already exists');
      return true;
    }
    console.error('❌ Exception creating bucket:', error.message);
    return false;
  }
}

async function uploadExamFiles() {
  const examFilesDir = path.join(__dirname, '../src/data/exam-files');
  
  if (!fs.existsSync(examFilesDir)) {
    console.log('❌ exam-files directory not found');
    console.log('⚠️ Run: npx tsx scripts/split-exams.ts first');
    return;
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
    } catch (error: any) {
      console.error(`❌ Exception: ${error.message}`);
      failed++;
    }
  }
  
  console.log('');
  console.log('🎉 Upload complete!');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
}

async function main() {
  console.log('🚀 Exam Files Upload to Supabase Storage');
  console.log('=========================================');
  console.log('');
  
  try {
    const bucketReady = await createBucket();
    if (!bucketReady) {
      console.log('❌ Cannot proceed without storage bucket');
      return;
    }
    
    await uploadExamFiles();
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main();