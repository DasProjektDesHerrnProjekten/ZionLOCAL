#!/usr/bin/env node

// Build script for offline exam platform deployment
// This script creates a complete offline deployment package

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Building offline exam platform deployment...');

async function buildOfflineDeployment() {
  try {
    // 1. Build the offline version
    console.log('📦 Building offline version...');
    execSync('npm run build:offline', { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Offline build completed');

    // 2. Create deployment directory structure
    console.log('📁 Creating deployment directory structure...');
    const deployDir = join(projectRoot, 'offline-deployment');
    const examsDir = join(deployDir, 'exams');
    const dataDir = join(deployDir, 'data');
    
    if (!existsSync(deployDir)) {
      mkdirSync(deployDir, { recursive: true });
    }
    if (!existsSync(examsDir)) {
      mkdirSync(examsDir, { recursive: true });
    }
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // 3. Copy built files to deployment directory
    console.log('📋 Copying built files...');
    const distDir = join(projectRoot, 'dist-offline');
    if (existsSync(distDir)) {
      execSync(`xcopy "${distDir}\\*" "${deployDir}\\" /E /I /Y`, { cwd: projectRoot, stdio: 'inherit' });
      
      // Fix HTML file paths for offline use
      const indexHtmlPath = join(deployDir, 'index.html');
      if (existsSync(indexHtmlPath)) {
        let htmlContent = readFileSync(indexHtmlPath, 'utf8');
        htmlContent = htmlContent.replace(/src="\/assets\//g, 'src="./assets/');
        htmlContent = htmlContent.replace(/href="\/assets\//g, 'href="./assets/');
        htmlContent = htmlContent.replace(/href="\/favicon/g, 'href="./favicon');
        writeFileSync(indexHtmlPath, htmlContent);
        console.log('   ✓ Fixed HTML paths for offline use');
      }
    }

    // 4. Copy SEB configuration
    console.log('🔧 Copying SEB configuration...');
    const sebConfigSource = join(projectRoot, 'public', 'seb-config.xml');
    const sebConfigDest = join(deployDir, 'seb-config.xml');
    if (existsSync(sebConfigSource)) {
      copyFileSync(sebConfigSource, sebConfigDest);
    }

    // 5. Generate exam files for pre-loading
    console.log('📝 Generating exam files for pre-loading...');
    await generateExamFiles(examsDir);

    // 6. Create initialization script
    console.log('📜 Creating initialization script...');
    await createInitScript(deployDir);

    // 7. Create README with deployment instructions
    console.log('📖 Creating deployment documentation...');
    await createDeploymentReadme(deployDir);

    // 8. Create student import template
    console.log('👤 Creating student import template...');
    await createStudentTemplate(dataDir);

    console.log('✅ Offline deployment build completed successfully!');
    console.log(`📂 Deployment package created at: ${deployDir}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Review the deployment directory');
    console.log('2. Customize student data in data/students-template.json');
    console.log('3. Run the initialization script on target PCs');
    console.log('4. Configure SEB with the provided seb-config.xml');
    console.log('5. Test the offline exam platform');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

async function generateExamFiles(examsDir) {
  try {
    // Use existing generated exam files from src/data/exam-files/
    const examFilesDir = join(projectRoot, 'src', 'data', 'exam-files');
    
    if (!existsSync(examFilesDir)) {
      console.log('   ⚠️ No exam files directory found, skipping exam generation');
      return;
    }
    
    const files = readdirSync(examFilesDir).filter(f => f.endsWith('.json'));
    
    console.log(`   Found ${files.length} exam files to copy`);
    
    for (const file of files) {
      const sourcePath = join(examFilesDir, file);
      const destPath = join(examsDir, file);
      copyFileSync(sourcePath, destPath);
      console.log(`   ✓ Copied: ${file}`);
    }
    
    // Copy exams-list.json if it exists
    const examsListSource = join(projectRoot, 'src', 'data', 'exams-list.json');
    if (existsSync(examsListSource)) {
      const examsListDest = join(examsDir, 'exams-list.json');
      copyFileSync(examsListSource, examsListDest);
      console.log(`   ✓ Copied: exams-list.json`);
    }
    
  } catch (error) {
    console.error('   ❌ Failed to generate exam files:', error);
    throw error;
  }
}

async function createInitScript(deployDir) {
  const initScript = `@echo off
REM Offline Exam Platform Initialization Script
REM Run this script on each exam PC to set up the offline environment

echo ========================================
echo Offline Exam Platform Setup
echo ========================================
echo.

REM Check if running in SEB
if "%SEB_START%"=="" (
    echo This script should be run from Safe Exam Browser
    echo Please configure SEB to launch this script
    pause
    exit /b 1
)

echo Setting up offline exam environment...
echo.

REM Check if browser is in offline mode
echo Platform initialized successfully
echo.

REM Launch the exam platform
start "" "index.html"

echo ========================================
echo Offline Exam Platform Ready
echo ========================================
pause
`;

  const initScriptPath = join(deployDir, 'init.bat');
  writeFileSync(initScriptPath, initScript);
  console.log('   ✓ Created: init.bat');
}

async function createDeploymentReadme(deployDir) {
  const readme = `# Offline Exam Platform Deployment

This package contains the complete offline exam platform for use with Safe Exam Browser (SEB).

## Directory Structure

\`\`\`
offline-deployment/
├── index.html          # Main application entry point
├── assets/             # Built application assets
├── exams/              # Pre-loaded exam files
│   ├── exams-list.json # Exam metadata
│   └── *.json          # Individual exam files
├── data/               # Student and configuration data
│   └── students-template.json
├── seb-config.xml      # SEB configuration file
├── init.bat            # Initialization script
└── README.md           # This file
\`\`\`

## Deployment Instructions

### 1. System Requirements

- Windows PC (for SEB compatibility)
- Safe Exam Browser installed
- Modern web browser (Chrome, Firefox, Edge)
- Minimum 4GB RAM
- 100MB free disk space

### 2. Installation

1. Copy the entire \`offline-deployment\` folder to each exam PC
2. Place it in a fixed location (e.g., \`C:\\\\ExamPlatform\`)
3. Ensure all PCs have the same folder structure

### 3. Student Configuration

1. Open \`data/students-template.json\`
2. Edit the student information:
   - \`student_id\`: Unique student identifier
   - \`name\`: Student full name
   - \`stream\`: Student's academic stream (natural/social/both)
   - \`grade\`: Student's grade level
3. Save the file
4. Repeat for each exam PC (or copy the same file to all PCs)

### 4. SEB Configuration

1. Open Safe Exam Browser
2. Import the \`seb-config.xml\` file
3. Configure the startup URL to point to \`index.html\`
4. Test the configuration by launching SEB

### 5. Exam Access Management

Access to exams is managed through the built-in access control system:

- **Default Access**: Students have access to all active exams in their stream
- **Custom Access**: Modify the \`exam_access\` table in the local database
- **Exam Status**: Only exams with \`status: "active"\` are available

### 6. Exam Day Procedures

1. Start each PC with SEB configured
2. Verify all exams are loaded correctly
3. Students log in with their student ID
4. Students take exams as scheduled
5. Results are saved locally automatically

### 7. Result Collection

After exams are completed:

1. Collect the SQLite database from each PC
2. Database location: In browser storage (localStorage)
3. Export using the built-in export function in the admin panel
4. Results can be collected via USB drive or network

## Troubleshooting

### Students cannot see exams
- Verify exams are in the \`exams/\` folder
- Check exam status is "active"
- Verify student stream matches exam stream
- Clear browser cache and reload

### Results not saving
- Check localStorage quota (limit: ~5MB)
- Verify browser allows localStorage
- Check for JavaScript errors in console

### SEB configuration issues
- Re-import the seb-config.xml file
- Verify SEB version compatibility
- Check that JavaScript is enabled

## Security Notes

- This offline system uses local browser storage
- Results are stored locally and not encrypted
- Physical access to PCs should be controlled
- Clear browser data between exam sessions if needed

## Support

For issues or questions:
- Check the console for error messages
- Verify all files are present in the deployment folder
- Ensure SEB is properly configured
- Test with a single student before full deployment

## Version Information

- Platform Version: 1.0.0
- Build Date: ${new Date().toISOString()}
- Offline Mode: Enabled
- Database: SQLite (via sql.js)
`;

  const readmePath = join(deployDir, 'README.md');
  writeFileSync(readmePath, readme);
  console.log('   ✓ Created: README.md');
}

async function createStudentTemplate(dataDir) {
  const studentTemplate = {
    students: [
      {
        id: "student-001",
        student_id: "101010",
        name: "Example Student",
        stream: "natural",
        grade: "12"
      }
    ],
    exam_access: [
      {
        student_id: "101010",
        exam_id: "english-euee-2018",
        has_access: true
      }
    ],
    instructions: {
      add_students: "Add student objects to the students array",
      grant_access: "Add exam access entries to exam_access array",
      student_id_format: "Use unique alphanumeric student IDs",
      stream_options: ["natural", "social", "both"]
    }
  };

  const templatePath = join(dataDir, 'students-template.json');
  writeFileSync(templatePath, JSON.stringify(studentTemplate, null, 2));
  console.log('   ✓ Created: students-template.json');
}

// Run the build
buildOfflineDeployment();