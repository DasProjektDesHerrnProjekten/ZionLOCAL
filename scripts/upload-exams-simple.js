const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = 'https://kccrpozqbtrdwrldddcd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjY3Jwb3pxYnRyZHdybGRkY2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0NDg3MTM3MSwiZXhwIjoyMDYwNDQ3NzF9.3qN7r7R8x5yV8z7q3B9x9K6j8W8p8v9p9q8r7t8x9y'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStorageBucket() {
  try {
    console.log('🔧 Creating storage bucket "exams"...');
    
    const { data, error } = await supabase.storage.createBucket('exams', {
      public: false,
      fileSizeLimit: 104857600 // 100MB limit
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
        return true;
      }
      console.error('❌ Error creating bucket:', error);
      return false;
    }
    
    console.log('✅ Successfully created bucket');
    return true;
  } catch (error) {
    console.error('❌ Exception creating bucket:', error);
    return false;
  }
}

async function uploadExamFile(examId, examData) {
  try {
    const fileName = `${examId}.json`;
    const filePath = `MyExamd/${fileName}`;
    
    console.log(`📤 Uploading ${examId}...`);
    
    const { data, error } = await supabase.storage
      .from('exams')
      .upload(filePath, JSON.stringify(examData, null, 2), {
        upsert: true,
        contentType: 'application/json'
      });
    
    if (error) {
      console.error(`❌ Failed to upload ${examId}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully uploaded ${examId}`);
    return true;
  } catch (error) {
    console.error(`❌ Exception uploading ${examId}:`, error);
    return false;
  }
}

async function uploadExams() {
  try {
    // Read the exams data file
    const examsPath = path.join(__dirname, '../src/data/exams.ts');
    
    // Since we can't directly import TypeScript in Node.js, we'll need to parse the file
    // For now, let's create a simpler approach by reading the file and extracting the JSON
    
    console.log('📋 Reading exams data...');
    
    // We'll need to manually extract the exams or convert the TS to JS first
    // For this example, let's assume we have a JSON version
    
    const jsonExamsPath = path.join(__dirname, '../src/data/exams.json');
    
    if (!fs.existsSync(jsonExamsPath)) {
      console.log('⚠️ exams.json not found, you need to convert exams.ts to JSON first');
      console.log('Run: node scripts/convert-exams-to-json.js');
      return;
    }
    
    const examsData = JSON.parse(fs.readFileSync(jsonExamsPath, 'utf8'));
    
    console.log(`📋 Found ${examsData.length} exams to upload`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const exam of examsData) {
      const success = await uploadExamFile(exam.id, exam);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    // Also upload the complete list
    console.log('📤 Uploading complete exams list...');
    const { data: listData, error: listError } = await supabase.storage
      .from('exams')
      .upload('MyExamd/exams-list.json', JSON.stringify(examsData, null, 2), {
        upsert: true,
        contentType: 'application/json'
      });
    
    if (listError) {
      console.error('❌ Failed to upload exams list:', listError);
    } else {
      console.log('✅ Successfully uploaded exams list');
    }
    
    console.log(`🎉 Upload completed! Success: ${successCount}, Failed: ${failCount}`);
  } catch (error) {
    console.error('❌ Error during upload:', error);
  }
}

async function main() {
  console.log('🚀 Starting exam upload to Supabase Storage...');
  
  const bucketCreated = await createStorageBucket();
  if (!bucketCreated) {
    console.log('❌ Failed to create storage bucket, aborting');
    return;
  }
  
  await uploadExams();
}

main();