# Offline Admin Panel Guide

## Overview

The Offline Admin Panel provides full control over exam availability and student access in offline environments. It works completely without internet using local storage and SQLite database.

## Accessing the Admin Panel

### In Offline Mode
1. Navigate to `/offline-admin` in the application
2. No authentication required (local admin access)
3. Full access to all offline management features

### In Online Mode
The admin panel is primarily designed for offline use but can be accessed for testing and setup.

## Features

### 1. Exam Availability Management

**Location**: Exams tab

**What it does**:
- Enable/disable exams for student access
- Control which exams appear in student dashboards
- Set exam status to "active" or "disabled"

**How to use**:
1. Go to the Exams tab
2. Find the exam you want to manage
3. Click "Enable" or "Disable" button
4. Changes take effect immediately for all students

**Important Notes**:
- Only "active" exams are visible to students
- Disabled exams won't appear in student dashboards
- Exam status is stored in local database
- Changes apply to all students immediately

### 2. Student Access Management

**Location**: Students tab

**What it does**:
- Add new students to the system
- Grant/revoke specific exam access per student
- Manage student information (ID, name, stream, grade)

**How to add a student**:
1. Go to the Students tab
2. Fill in the "Add New Student" form:
   - Student ID: Unique identifier (e.g., "101010")
   - Full Name: Student's complete name
   - Stream: Natural Science, Social Science, or Both
   - Grade: Student's grade level (e.g., "12")
3. Click "Add Student"

**How to manage exam access**:
1. Go to the Students tab
2. Find the student you want to manage
3. In the "Exam Access" section, you'll see all available exams
4. Click "Grant" to give access or "Revoke" to remove access
5. Changes are saved immediately

**Stream-based access**:
- Students with "natural" stream can only see natural science exams
- Students with "social" stream can only see social science exams
- Students with "both" stream can see all exams
- Admin can override this by granting specific exam access

### 3. Results Management

**Location**: Results tab

**What it does**:
- View all completed exam results
- Export results for collection and grading
- Import results from other PCs
- Monitor exam completion status

**How to export results**:
1. Go to the Results tab
2. Click "Export Results" button
3. A `.db` file will be downloaded
4. This file contains all student results from this PC

**How to import results**:
1. Go to the Results tab
2. Click "Choose File" and select a `.db` file
3. Results will be merged with existing data
4. Use this to collect results from multiple PCs

**Result information displayed**:
- Student name and ID
- Exam title
- Completion date/time
- Score and percentage
- Status (completed/in progress/abandoned)

### 4. System Settings

**Location**: Settings tab

**What it does**:
- Database management
- Exam cache management
- System information
- Data backup and restore

**Database Management**:
- **Clear All Data**: Removes all students, results, and access data
- **Backup Database**: Creates a downloadable backup of the entire database

**Exam Cache Management**:
- **Clear Exam Cache**: Removes cached exam files from localStorage
- Use this if exams are not updating correctly

**System Information**:
- Number of exams loaded
- Number of students registered
- Number of results recorded
- Current system mode (offline)

## Workflow Examples

### Example 1: Setting Up for an Exam Day

1. **Prepare Exams**:
   - Go to Exams tab
   - Enable the exams for today's test
   - Disable all other exams

2. **Add Students**:
   - Go to Students tab
   - Add all students taking the exam
   - Set their correct stream and grade

3. **Grant Access**:
   - For each student, grant access to the enabled exams
   - Alternatively, students with matching stream will see relevant exams automatically

4. **Test Setup**:
   - Log in as a test student
   - Verify exams appear correctly
   - Take a practice exam to ensure functionality

### Example 2: Collecting Results After Exam

1. **Export from Each PC**:
   - Go to Results tab on each exam PC
   - Click "Export Results"
   - Save each file with PC identifier (e.g., `pc1-results.db`)

2. **Consolidate Results**:
   - On an admin PC, go to Results tab
   - Import each PC's result file one by one
   - All results will be consolidated

3. **Analyze Results**:
   - View consolidated results in the Results tab
   - Export final consolidated results for grading
   - Clear data from exam PCs for next use

### Example 3: Managing Exam Access During Exam

1. **Late Student Arrives**:
   - Go to Students tab
   - Add the late student
   - Grant access to the current exam
   - Student can immediately start the exam

2. **Emergency Exam Change**:
   - Go to Exams tab
   - Disable the problematic exam
   - Enable the replacement exam
   - Grant access to affected students
   - Students will see the updated exam list

## Best Practices

### Before Exam Day
- ✅ Test the admin panel thoroughly
- ✅ Add all students in advance
- ✅ Enable only the required exams
- ✅ Grant appropriate access to all students
- ✅ Create a database backup

### During Exam Day
- ✅ Monitor for any issues via Results tab
- ✅ Be ready to grant access to late students
- ✅ Keep the admin panel accessible for emergencies
- ✅ Have backup plans for technical issues

### After Exam Day
- ✅ Export results from all PCs immediately
- ✅ Consolidate results on admin PC
- ✅ Backup the final results
- ✅ Clear data from exam PCs if needed
- ✅ Review results for any anomalies

## Troubleshooting

### Students can't see exams
- Check exam status is "active" in Exams tab
- Verify student has access in Students tab
- Check student stream matches exam stream
- Clear exam cache in Settings tab

### Results not appearing
- Check Results tab for completion status
- Verify student completed the exam
- Check browser console for errors
- Try exporting and re-importing results

### Admin panel not loading
- Clear browser cache
- Check localStorage quota (limit: ~5MB)
- Verify you're using the offline build
- Check JavaScript console for errors

### Access changes not applying
- Refresh the page after making changes
- Check that you clicked the correct button
- Verify database is saving properly
- Try clearing cache and reloading

## Security Considerations

- Admin panel has no authentication in offline mode
- Physical access to PCs should be controlled
- Regularly backup the database
- Clear sensitive data after exams
- Monitor for unauthorized access

## Technical Details

### Data Storage
- **Database**: SQLite (via sql.js WebAssembly)
- **Location**: Browser localStorage
- **Size Limit**: ~5MB (browser limit)
- **Backup Format**: Binary `.db` files

### Exam Files
- **Location**: Pre-loaded in `exams/` folder
- **Format**: JSON files
- **Caching**: localStorage for performance
- **Size**: Varies by exam content

### Access Control
- **Stream-based**: Automatic filtering by student stream
- **Manual override**: Admin can grant specific access
- **Real-time**: Changes apply immediately
- **Persistence**: Stored in local database

## Advanced Usage

### Bulk Student Import
1. Prepare student data in JSON format
2. Use the student template format
3. Import via Settings > Database Management
4. Verify all students imported correctly

### Custom Exam Status
- Exams can have custom status values
- Only "active" exams are visible to students
- Use other statuses for tracking purposes
- Admin can filter by status in Exams tab

### Result Analytics
- Export results to CSV for analysis
- Use external tools for detailed analysis
- Track completion rates and performance
- Identify trends across multiple exams

## Support

For issues or questions:
1. Check this guide first
2. Review the console for error messages
3. Verify all data is present
4. Test with a single student first
5. Contact technical support if needed

## Updates and Maintenance

### Regular Tasks
- Backup database before major changes
- Clear cache periodically for performance
- Update exam files when content changes
- Review and clean up old results

### System Updates
- Test new versions thoroughly
- Backup data before updating
- Update all PCs consistently
- Verify functionality after updates

This admin panel provides complete control over your offline exam system. Use it responsibly and test thoroughly before important exams!