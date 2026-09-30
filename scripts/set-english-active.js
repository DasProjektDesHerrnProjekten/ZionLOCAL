// Script to set english-euee-2018 to active and grant student access
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

async function setupExam() {
  console.log('🔄 Setting english-euee-2018 to active status...');
  
  try {
    const { data, error } = await supabase
      .from('exam_admin_changes')
      .update({ status: 'active' })
      .eq('exam_id', 'english-euee-2018');
    
    if (error) {
      console.error('❌ Failed to set status:', error.message);
    } else {
      console.log('✅ Successfully set english-euee-2018 to active');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('🔄 Granting student 101010 access to english-euee-2018...');
  
  try {
    const { data, error } = await supabase
      .from('exam_access')
      .upsert({
        student_id: '101010',
        exam_id: 'english-euee-2018',
        has_access: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'student_id,exam_id'
      });
    
    if (error) {
      console.error('❌ Failed to grant access:', error.message);
    } else {
      console.log('✅ Successfully granted access to english-euee-2018');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

setupExam();