const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadExamsToStorage() {
  try {
    console.log('🚀 Starting exam upload to Supabase Storage...');
    
    // Read the exams data
    const examsPath = path.join(__dirname, '../src/data/exams.ts');
    const examsContent = fs.readFileSync(examsPath, 'utf8');
    
    // Extract the exams array from the file
    // This is a simple extraction - you might need to adjust based on your file structure
    const examsMatch = examsContent.match(/export const exams: Exam\[\] = \[([\s\S]*?)\];/);
    if (!examsMatch) {
      throw new Error('Could not find exams array in the file');
    }
    
    // Parse the exams array (this is a simplified approach)
    // For production, you'd want to use a proper parser or require the file
    const examsData = examsMatch[0];
    
    // Upload each exam as a separate file
    const exams = require('../src/data/exams.ts').exams;
    
    console.log(`📋 Found ${exams.length} exams to upload`);
    
    for (const exam of exams) {
      const fileName = `${exam.id}.json`;
      const filePath = `MyExamd/${fileName}`;
      
      console.log(`📤 Uploading ${exam.id} (${exam.title})...`);
      
      const { data, error } = await supabase.storage
        .from('exams')
        .upload(filePath, JSON.stringify(exam, null, 2), {
          upsert: true,
          contentType: 'application/json'
        });
      
      if (error) {
        console.error(`❌ Failed to upload ${exam.id}:`, error);
      } else {
        console.log(`✅ Successfully uploaded ${exam.id}`);
      }
    }
    
    // Also upload the complete exams list
    console.log('📤 Uploading complete exams list...');
    const { data: listData, error: listError } = await supabase.storage
      .from('exams')
      .upload('MyExamd/exams-list.json', JSON.stringify(exams, null, 2), {
        upsert: true,
        contentType: 'application/json'
      });
    
    if (listError) {
      console.error('❌ Failed to upload exams list:', listError);
    } else {
      console.log('✅ Successfully uploaded exams list');
    }
    
    console.log('🎉 Exam upload completed!');
  } catch (error) {
    console.error('❌ Error during upload:', error);
    process.exit(1);
  }
}

// Check if the storage bucket exists, create it if not
async function ensureStorageBucket() {
  try {
    console.log('🔧 Checking if storage bucket exists...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return;
    }
    
    const examsBucket = buckets.find(b => b.name === 'exams');
    
    if (!examsBucket) {
      console.log('📦 Creating exams storage bucket...');
      const { data, error } = await supabase.storage.createBucket('exams', {
        public: false,
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('✅ Created exams storage bucket');
      }
    } else {
      console.log('✅ Exams storage bucket already exists');
    }
  } catch (error) {
    console.error('Error ensuring storage bucket:', error);
  }
}

async function main() {
  await ensureStorageBucket();
  await uploadExamsToStorage();
}

main();