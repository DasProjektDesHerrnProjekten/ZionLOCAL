// Script to upload exam files with questions to Supabase Storage
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://kccrpozqbtrdwrldddcd.supabase.co';

// Try to get the anon key
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const examFilesDir = path.join(__dirname, '../src/data/exam-files');

async function uploadExamFiles() {
  console.log('📤 Uploading exam files with questions to Supabase Storage...');
  
  const files = fs.readdirSync(examFilesDir).filter(f => f.endsWith('.json'));
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
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
        console.error(`❌ Failed to upload ${file}:`, error.message);
        failCount++;
      } else {
        console.log(`✅ Uploaded ${file}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Exception uploading ${file}:`, error.message);
      failCount++;
    }
  }

  console.log(`\n🎉 Upload complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

uploadExamFiles();