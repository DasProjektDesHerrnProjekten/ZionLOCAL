// Simple script to upload exams to Supabase Storage
// This script assumes you have created a JSON version of your exams

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://kccrpozqbtrdwrldddcd.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Replace with your actual anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createBucket() {
  console.log('🔧 Creating storage bucket "exams"...');
  
  const { data, error } = await supabase.storage.createBucket('exams', {
    public: false,
    fileSizeLimit: 104857600 // 100MB
  });
  
  if (error && !error.message.includes('already exists')) {
    console.error('❌ Error creating bucket:', error);
    return false;
  }
  
  console.log('✅ Bucket ready');
  return true;
}

async function uploadExam(examId, examData) {
  console.log(`📤 Uploading ${examId}...`);
  
  const { data, error } = await supabase.storage
    .from('exams')
    .upload(`MyExamd/${examId}.json`, JSON.stringify(examData, null, 2), {
      upsert: true,
      contentType: 'application/json'
    });
  
  if (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
  
  console.log(`✅ Success`);
  return true;
}

async function main() {
  console.log('🚀 Exam Upload Script');
  console.log('==================');
  console.log('');
  console.log('⚠️ IMPORTANT: You need to:');
  console.log('1. Replace YOUR_ANON_KEY_HERE with your actual Supabase anon key');
  console.log('2. Create a JSON file with your exams data (src/data/exams.json)');
  console.log('3. Run this script: node scripts/upload-exams-manual.js');
  console.log('');
  
  // Check if exams.json exists
  const examsJsonPath = path.join(__dirname, '../src/data/exams.json');
  if (!fs.existsSync(examsJsonPath)) {
    console.log('❌ exams.json not found. Please create it first.');
    console.log('💡 You can manually convert your exams.ts to exams.json');
    return;
  }
  
  const bucketReady = await createBucket();
  if (!bucketReady) return;
  
  const examsData = JSON.parse(fs.readFileSync(examsJsonPath, 'utf8'));
  console.log(`📋 Found ${examsData.length} exams to upload`);
  console.log('');
  
  let success = 0;
  let failed = 0;
  
  for (const exam of examsData) {
    const result = await uploadExam(exam.id, exam);
    if (result) success++;
    else failed++;
  }
  
  // Upload complete list
  console.log('📤 Uploading complete list...');
  const { data, error } = await supabase.storage
    .from('exams')
    .upload('MyExamd/exams-list.json', JSON.stringify(examsData, null, 2), {
      upsert: true,
      contentType: 'application/json'
    });
  
  if (error) {
    console.error('❌ Failed to upload list:', error.message);
  } else {
    console.log('✅ List uploaded');
  }
  
  console.log('');
  console.log('🎉 Upload complete!');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
}

main();