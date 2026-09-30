// Script to upload exams-list.json to Supabase Storage
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

async function uploadExamsList() {
  console.log('📤 Uploading exams-list.json to Supabase Storage...');
  
  const filePath = path.join(__dirname, '../src/data/exams-list.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  try {
    const { data, error } = await supabase.storage
      .from('exams')
      .upload('MyExamd/exams-list.json', fileContent, {
        upsert: true,
        contentType: 'application/json'
      });
    
    if (error) {
      console.error('❌ Failed:', error.message);
    } else {
      console.log('✅ Successfully uploaded exams-list.json');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

uploadExamsList();