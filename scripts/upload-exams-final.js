// Final script to upload exams to Supabase Storage
// This script will use your existing Supabase configuration

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment or use defaults
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
  console.log('5. Set it as environment variable: VITE_SUPABASE_ANON_KEY=your_key');
  console.log('   Or update the ANON_KEY variable in this script');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log('🔧 Creating storage bucket "exams"...');
  
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
}

async function uploadExams() {
  const jsonPath = path.join(__dirname, '../src/data/exams.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.log('❌ exams.json not found');
    return;
  }
  
  const examsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📋 Found ${examsData.length} exams to upload`);
  console.log('');
  
  let success = 0;
  let failed = 0;
  
  for (const exam of examsData) {
    console.log(`📤 Uploading ${exam.id} (${exam.title})...`);
    
    const { data, error } = await supabase.storage
      .from('exams')
      .upload(`MyExamd/${exam.id}.json`, JSON.stringify(exam, null, 2), {
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
  }
  
  // Upload complete list
  console.log('');
  console.log('📤 Uploading complete exams list...');
  const { data, error } = await supabase.storage
    .from('exams')
    .upload('MyExamd/exams-list.json', JSON.stringify(examsData, null, 2), {
      upsert: true,
      contentType: 'application/json'
    });
  
  if (error) {
    console.error('❌ Failed to upload list:', error.message);
  } else {
    console.log('✅ List uploaded successfully');
  }
  
  console.log('');
  console.log('🎉 Upload complete!');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
}

async function main() {
  console.log('🚀 Exam Upload to Supabase Storage');
  console.log('====================================');
  console.log('');
  
  try {
    const bucketReady = await createBucket();
    if (!bucketReady) {
      console.log('❌ Cannot proceed without storage bucket');
      return;
    }
    
    await uploadExams();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();