// This script will use the existing Supabase client to upload exams
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Using the project URL we know from the MCP connection
const supabaseUrl = 'https://kccrpozqbtrdwrldddcd.supabase.co';

// We need to get the anon key - let's try to read it from the existing client setup
// For now, let's create a temporary script that will work when we have the key

console.log('🚀 Exam Upload Script using Supabase Client');
console.log('========================================');
console.log('');
console.log('⚠️ This script needs your Supabase anon key to work.');
console.log('');
console.log('To get your anon key:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Navigate to your project "ElyonPlattform des Herrn Projekten"');
console.log('3. Go to Settings > API');
console.log('4. Copy the "anon" key');
console.log('5. Update the ANON_KEY variable in this script');
console.log('');

const ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Replace this with your actual anon key

if (ANON_KEY === 'YOUR_ANON_KEY_HERE') {
  console.log('❌ Please update the ANON_KEY variable first');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, ANON_KEY);

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
    console.error('❌ Error creating bucket:', error);
    return false;
  }
  
  console.log('✅ Bucket created successfully');
  return true;
}

async function uploadExams() {
  console.log('📋 Reading exams data...');
  
  // First, let's try to read the exams from the TypeScript file
  const examsPath = path.join(__dirname, '../src/data/exams.ts');
  
  if (!fs.existsSync(examsPath)) {
    console.log('❌ exams.ts not found');
    return;
  }
  
  console.log('⚠️ Converting TypeScript to JSON...');
  console.log('⚠️ This requires manual conversion or using a TypeScript compiler');
  console.log('');
  console.log('For now, let me create a simple approach:');
  console.log('1. I will create a basic JSON structure');
  console.log('2. You can then manually fill in the exam data');
  console.log('3. Or use the Supabase dashboard to upload directly');
  
  // Create a sample JSON structure
  const sampleExams = [
    {
      "id": "english-euee-2018",
      "title": "MESKAYE ONLINE EXAM 2018 MODEL-1 ENGLISH",
      "subject": "English",
      "duration": 120,
      "totalQuestions": 120,
      "totalMarks": 100,
      "description": "English EUEE Exam - Ginbot 2010 (June, 2018)",
      "scheduledDate": "2026-02-21",
      "status": "ongoing",
      "stream": "natural",
      "password": "ENGLISH2025",
      "questions": []
    }
  ];
  
  const jsonPath = path.join(__dirname, '../src/data/exams.json');
  fs.writeFileSync(jsonPath, JSON.stringify(sampleExams, null, 2));
  console.log(`✅ Created sample exams.json at ${jsonPath}`);
  console.log('⚠️ Please update this file with your actual exam data');
}

async function uploadJsonExams() {
  const jsonPath = path.join(__dirname, '../src/data/exams.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.log('❌ exams.json not found. Please create it first.');
    return;
  }
  
  const examsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📋 Found ${examsData.length} exams to upload`);
  
  let success = 0;
  let failed = 0;
  
  for (const exam of examsData) {
    console.log(`📤 Uploading ${exam.id}...`);
    
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

async function main() {
  try {
    const bucketReady = await createBucket();
    if (!bucketReady) {
      console.log('❌ Cannot proceed without storage bucket');
      return;
    }
    
    await uploadExams();
    await uploadJsonExams();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();