# Offline Exam Platform Deployment

This package contains the complete offline exam platform for use with Safe Exam Browser (SEB).

## Directory Structure

```
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
```

## Deployment Instructions

### 1. System Requirements

- Windows PC (for SEB compatibility)
- Safe Exam Browser installed
- Modern web browser (Chrome, Firefox, Edge)
- Minimum 4GB RAM
- 100MB free disk space

### 2. Installation

1. Copy the entire `offline-deployment` folder to each exam PC
2. Place it in a fixed location (e.g., `C:\\ExamPlatform`)
3. Ensure all PCs have the same folder structure

### 3. Student Configuration

1. Open `data/students-template.json`
2. Edit the student information:
   - `student_id`: Unique student identifier
   - `name`: Student full name
   - `stream`: Student's academic stream (natural/social/both)
   - `grade`: Student's grade level
3. Save the file
4. Repeat for each exam PC (or copy the same file to all PCs)

### 4. SEB Configuration

1. Open Safe Exam Browser
2. Import the `seb-config.xml` file
3. Configure the startup URL to point to `index.html`
4. Test the configuration by launching SEB

### 5. Exam Access Management

Access to exams is managed through the built-in access control system:

- **Default Access**: Students have access to all active exams in their stream
- **Custom Access**: Modify the `exam_access` table in the local database
- **Exam Status**: Only exams with `status: "active"` are available

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
- Verify exams are in the `exams/` folder
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
- Build Date: 2026-09-30T07:11:34.571Z
- Offline Mode: Enabled
- Database: SQLite (via sql.js)
