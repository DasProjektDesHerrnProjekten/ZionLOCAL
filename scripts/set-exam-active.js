// Script to set sat-euee-2013 to active status
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

async function setExamActive() {
  console.log('🔄 Setting sat-euee-2013 to active status...');
  
  try {
    const { data, error } = await supabase
      .from('exam_admin_changes')
      .update({ status: 'active' })
      .eq('exam_id', 'sat-euee-2013');
    
    if (error) {
      console.error('❌ Failed:', error.message);
    } else {
      console.log('✅ Successfully set sat-euee-2013 to active');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

setExamActive();