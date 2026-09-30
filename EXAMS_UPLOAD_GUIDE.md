# Exams Upload to Supabase Storage Guide

## Overview
This guide will help you upload all exams to Supabase Storage under the `MyExamd` folder and update your application to use Supabase Storage instead of local files.

## Step 1: Create Supabase Storage Bucket

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to your project: "ElyonPlattform des Herrn Projekten"
3. Go to Storage section in the left sidebar
4. Click "New Bucket"
5. Name it: `exams`
6. Make it: Private (uncheck "Public bucket")
7. File size limit: 100MB
8. Click "Create Bucket"

### Option B: Using the Script
1. Get your Supabase anon key from Project Settings > API
2. Update the `SUPABASE_ANON_KEY` in `scripts/upload-exams-manual.js`
3. Run: `node scripts/upload-exams-manual.js`

## Step 2: Convert Exams to JSON

Since the exams are in TypeScript format, you need to convert them to JSON:

### Manual Conversion (Simplest)
1. Open `src/data/exams.ts`
2. Copy the entire `exams` array (everything after `export const exams: Exam[] = [`)
3. Create a new file `src/data/exams.json`
4. Paste the content and ensure it's valid JSON:
   - Remove TypeScript-specific syntax
   - Remove interface definitions
   - Replace imported exam references with actual data
   - Ensure proper JSON formatting

### Example JSON Structure:
```json
[
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
    "questions": [
      {
        "id": 1,
        "text": "In got has house all money new the her she.",
        "options": [
          "She has got her money all in the new house.",
          "She has got all her money in the new house.",
          "She has all her new money got in the house.",
          "All her money she has got in the new house."
        ],
        "correctAnswer": 1,
        "section": "Word Order"
      }
      // ... more questions
    ]
  }
  // ... more exams
]
```

## Step 3: Upload Exams to Supabase Storage

### Option A: Using Supabase Dashboard (Recommended)
1. Go to Storage > exams bucket
2. Create a folder named `MyExamd`
3. For each exam:
   - Click "Upload"
   - Upload individual exam files as `{examId}.json`
   - Or upload the complete `exams-list.json`

### Option B: Using the Script
1. Ensure `src/data/exams.json` exists
2. Update your anon key in `scripts/upload-exams-manual.js`
3. Run: `node scripts/upload-exams-manual.js`

## Step 4: Code Updates (Already Done)

The following code changes have already been implemented:

### Supabase Library (`src/lib/supabase.ts`)
- Added `loadExamsFromStorage()` function
- Added `loadExamFromStorage()` function  
- Added `uploadExamToStorage()` function
- Added Exam interface for storage

### ExamsPage (`src/pages/admin/ExamsPage.tsx`)
- Updated to use `loadExamsFromStorage()` instead of local import
- Maintains fallback to local data if storage fails

### ExamAccessPage (`src/pages/admin/ExamAccessPage.tsx`)
- Updated to use `loadExamsFromStorage()` instead of local import
- Maintains fallback to local data if storage fails

## Step 5: Testing

1. Start your development server
2. Navigate to the Exams Management page
3. Check if exams load correctly from Supabase Storage
4. Test exam name changes and verify they persist
5. Check the Exam Access Management page

## Troubleshooting

### If exams don't load from storage:
- Check browser console for errors
- Verify the bucket exists in Supabase dashboard
- Check that files are in the correct path: `MyExamd/exams-list.json`
- Verify your Supabase credentials are correct

### If upload fails:
- Check your anon key is correct
- Ensure the bucket exists
- Verify the JSON file is valid
- Check file size limits

### Fallback behavior:
- The code automatically falls back to local data if Supabase Storage fails
- This ensures your app continues to work during migration

## Benefits of Using Supabase Storage

1. **Centralized Management**: All exam data in one place
2. **Easy Updates**: Update exams without code deployment
3. **Scalability**: Handle large exam files efficiently
4. **Backup**: Automatic backups through Supabase
5. **Access Control**: Fine-grained permissions with RLS
6. **Consistency**: Same data across all environments

## Next Steps

After successful upload:
1. Remove local exam data files (optional, keep as backup)
2. Update other pages that import from `@/data/exams`
3. Add exam upload functionality to admin panel
4. Implement exam versioning and history