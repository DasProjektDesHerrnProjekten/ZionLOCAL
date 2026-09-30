# Offline Exam Platform - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the offline examination platform to exam computers for use with Safe Exam Browser (SEB).

## Prerequisites

### Online Preparation Phase (Required)

Before deploying to exam computers, you must:

1. **Have a functioning online system**
   - Supabase database configured
   - Admin access available
   - Exams created and configured

2. **Prepare student credentials**
   - Students registered in the system
   - Passwords set (not student ID)
   - Student streams assigned

3. **Configure exams**
   - Exams created and published
   - Questions loaded
   - Duration set
   - Streams assigned

## Step 1: Build the Offline Version

```bash
cd C:\Users\Winomickal\Documents\HauptPlattform\HauptPlattform
npm run build:offline
```

This creates a self-contained deployment in `dist-offline/` with:
- All assets bundled locally
- WASM files for SQLite
- Local fonts
- No CDN dependencies
- Relative paths for offline use

**Expected Output:**
- `dist-offline/index.html`
- `dist-offline/assets/` (JavaScript, CSS, fonts, WASM)
- `dist-offline/sql-wasm.wasm`
- `dist-offline/sql-wasm-browser.wasm`
- `dist-offline/seb-config.xml`

## Step 2: Prepare Exam Packages

### Option A: Using the Offline Admin Panel (Recommended)

1. **Access the admin panel**
   - Navigate to `http://localhost:5173/offline-admin` (development)
   - Or access from your deployed online system

2. **Provision exams**
   - Go to the "Provision" tab
   - Select exams to administer
   - Select students who will take the exams
   - Click "Provision Exam Package"

3. **Export the local database**
   - The admin panel will export the local database
   - Save the export file (JSON format)
   - This file contains all exam data and student credentials

### Option B: Manual Database Export

If you need to manually export the database:

1. Open the browser console on the admin panel
2. Run:
```javascript
const db = await getOfflineDB();
const export = await db.exportDatabase();
console.log(JSON.stringify(export));
```

3. Copy the JSON output to a file named `offline-database.json`

## Step 3: Create Deployment Package

### Create Deployment Folder Structure

```
C:\ExamPlatform\
├── index.html
├── assets\
│   ├── index.js
│   ├── index.css
│   ├── *.woff (fonts)
│   ├── *.woff2 (fonts)
│   └── sql-wasm*.wasm
├── seb-config.xml
├── offline-database.json
└── deployment.bat (optional)
```

### Copy Files

```batch
@echo off
REM Deployment script for Windows
mkdir C:\ExamPlatform
xcopy /E /I /Y dist-offline C:\ExamPlatform
copy offline-database.json C:\ExamPlatform\
echo Deployment complete!
```

## Step 4: Deploy to Exam Computers

### For Individual Computers

1. **Copy the deployment folder**
   - Copy the entire `C:\ExamPlatform\` folder
   - Transfer to each exam computer via USB or network

2. **Install Safe Exam Browser**
   - Download SEB from https://www.safeexambrowser.org/
   - Install on each exam computer
   - Configure settings (see Step 5)

3. **Import SEB Configuration**
   - Open SEB
   - File → Open Configuration
   - Select `C:\ExamPlatform\seb-config.xml`
   - Test the configuration

### For Network Deployment

If you have a local network:

1. **Set up a local web server**
   - Use IIS, Apache, or nginx
   - Point to the deployment folder
   - Ensure the server is accessible from exam computers

2. **Configure SEB to use the local server**
   - Update `seb-config.xml` with the server URL
   - Example: `http://exam-server.local/`

## Step 5: Configure Safe Exam Browser

### Default SEB Configuration

The provided `seb-config.xml` includes:

- **Startup URL**: `http://localhost:8080/index.html`
- **Browser Mode**: Fullscreen
- **User Interface**: Minimal
- **Restrictions**:
  - No clipboard access
  - No screenshot capability
  - No external navigation
  - Restricted keyboard shortcuts
  - JavaScript enabled
  - WebAssembly enabled

### Customize for Your Environment

If you need to modify the SEB configuration:

1. Open `seb-config.xml` in a text editor
2. Modify the following sections as needed:

```xml
<!-- Startup URL -->
<originURL>http://localhost:8080/index.html</originURL>

<!-- Allow local network access (if needed) -->
<urlFilter>
  <rule regex="^http://127\.0\.0\.1" action="allow"/>
  <rule regex="^http://localhost" action="allow"/>
</urlFilter>
```

3. Save the configuration
4. Re-import into SEB

## Step 6: Start the Offline Server

### Option A: Using a Simple HTTP Server

For each exam computer:

1. **Start a local server**
   ```batch
   cd C:\ExamPlatform
   npx serve -l 8080
   ```

2. **Or use Python (if available)**
   ```batch
   cd C:\ExamPlatform
   python -m http.server 8080
   ```

3. **Or use a pre-installed server**
   - IIS: Configure site to point to `C:\ExamPlatform`
   - Apache: Configure VirtualHost
   - nginx: Configure server block

### Option B: Using a Network Server

If using a local network:

1. **Deploy to a central server**
   - Install web server on a machine
   - Configure to serve the deployment folder
   - Ensure all exam computers can access it

2. **Update SEB configuration**
   - Change startup URL to the server address
   - Example: `http://exam-server.local/`

## Step 7: Import Exam Data

### Option A: Admin Panel Import (Recommended)

1. **Access the admin panel**
   - Navigate to `http://localhost:8080/offline-admin`
   - Login with admin credentials

2. **Import the database**
   - Go to the "Import" tab
   - Select the `offline-database.json` file
   - Click "Import Database"
   - Verify the import was successful

### Option B: Manual Import

If you need to manually import the database:

1. Open the browser console on the admin panel
2. Run:
```javascript
const db = await getOfflineDB();
const data = await fetch('offline-database.json').then(r => r.json());
await db.importDatabase(data);
console.log('Database imported successfully');
```

## Step 8: Test the Deployment

### Pre-Exam Testing Checklist

- [ ] SEB launches successfully
- [ ] Application loads without errors
- [ ] Login page displays correctly
- [ ] Student can authenticate with offline credentials
- [ ] Dashboard loads with provisioned exams
- [ ] Exam starts successfully
- [ ] Questions load correctly
- [ ] Timer functions properly
- [ ] Answers save when selected
- [ ] Navigation works
- [ ] Flagging works
- [ ] Submission completes
- [ ] Results display correctly
- [ ] Results persist after refresh
- [ ] Application works with no internet connection

### Offline Network Test

1. **Disconnect network**
   - Disable Wi-Fi
   - Unplug Ethernet
   - Verify no internet access

2. **Test complete workflow**
   - Launch SEB
   - Login
   - Take exam
   - Submit
   - View results

3. **Reconnect network**
   - Restore internet connection
   - Test synchronization (if applicable)

## Step 9: Create Startup Shortcut

### Windows Shortcut

1. **Create a batch file** (`start-exam.bat`):
```batch
@echo off
cd C:\ExamPlatform
start /B npx serve -l 8080
timeout /t 3
start "" "C:\Program Files\SafeExamBrowser\SafeExamBrowser.exe" C:\ExamPlatform\seb-config.xml
```

2. **Create a desktop shortcut**
   - Right-click on desktop → New → Shortcut
   - Target: `C:\ExamPlatform\start-exam.bat`
   - Name: "Offline Exam System"

## Step 10: Student Instructions

### Provide Students With:

1. **Login credentials**
   - Student ID
   - Password (not student ID)
   - Ensure they know their password before the exam

2. **Exam information**
   - Exam duration
   - Question count
   - Allowed time for each section (if applicable)

3. **SEB instructions**
   - How to launch SEB
   - What to do if SEB crashes
   - How to exit SEB after the exam

### Emergency Procedures

**If SEB crashes:**
1. Relaunch SEB
2. Log in again
3. The system should recover in-progress attempts automatically

**If the application crashes:**
1. Relaunch the application
2. Log in again
3. The system should recover in-progress attempts automatically

**If the computer restarts:**
1. Wait for the computer to fully start
2. Launch SEB
3. Log in again
4. The system should recover in-progress attempts automatically

## Step 11: Post-Exam Data Collection

### Option A: Automatic Synchronization

If the exam computers will have internet access after the exam:

1. **Restore internet**
   - Reconnect to network
   - Ensure internet access

2. **Synchronize results**
   - The sync service will automatically attempt to sync
   - Results will be uploaded to Supabase
   - Check the admin panel for sync status

### Option B: Manual Data Export

If the exam computers will remain offline:

1. **Export results from each computer**
   - Access the admin panel on each computer
   - Go to the "Export" tab
   - Export the local database
   - Save to a USB drive

2. **Import to the main system**
   - Transfer the export files to the online system
   - Use the admin panel to import
   - Results will be merged into the main database

## Troubleshooting

### Common Issues

**SEB won't start:**
- Verify SEB is installed correctly
- Check the SEB configuration file
- Ensure the web server is running
- Check firewall settings

**Application won't load:**
- Verify the web server is running
- Check the startup URL in SEB config
- Verify all files are present in the deployment folder
- Check browser console for errors

**Students can't login:**
- Verify the database was imported correctly
- Check student credentials
- Verify password hashing migration completed
- Check the admin panel for student records

**Exams don't appear:**
- Verify exams were provisioned
- Check exam status is "active"
- Verify student stream matches exam stream
- Clear browser cache and reload

**Answers not saving:**
- Check localStorage quota
- Verify browser allows localStorage
- Check for JavaScript errors in console
- Verify SQLite initialization

**Timer issues:**
- Check system clock
- Verify attempt deadline is set correctly
- Check for JavaScript errors
- Verify timer calculation logic

**SEB configuration issues:**
- Re-import the seb-config.xml file
- Verify SEB version compatibility
- Check that JavaScript is enabled
- Verify startup URL is correct

## Security Considerations

### Physical Security

- Secure exam computers before the exam
- Restrict physical access during the exam
- Use locked keyboard/mouse if available
- Monitor students during the exam

### Data Security

- Secure the offline database export file
- Delete temporary export files after deployment
- Secure USB drives used for transfer
- Encrypt the database if required

### Post-Exam Cleanup

After the exam:

1. **Clear local data**
   - Clear localStorage on exam computers
   - Delete the local database
   - Remove temporary files

2. **Secure results**
   - Transfer results to the main system
   - Verify all results were collected
   - Backup the results

3. **Re-secure computers**
   - Remove exam software if required
   - Restore normal computer settings
   - Secure any data remaining on the computers

## Support and Maintenance

### Regular Maintenance

- Update the offline build after system changes
- Re-provision exams before each exam session
- Test the deployment before each exam
- Update SEB configuration if needed

### Monitoring

- Monitor sync status after exams
- Check for failed syncs
- Verify all results were collected
- Review any errors or issues

### Updates

When updating the system:

1. Build a new offline version
2. Test the new version thoroughly
3. Deploy to a test computer first
4. Roll out to all exam computers
5. Update the SEB configuration if needed

## Contact and Support

For issues or questions:

- Check the console for error messages
- Verify all files are present in the deployment folder
- Ensure SEB is properly configured
- Test with a single student before full deployment
- Review the troubleshooting section above

## Version Information

- Platform Version: 2.0.0
- Build Date: 2026-09-30
- Offline Mode: Enabled
- Database: SQLite (via sql.js 1.14.2)
- React: 18.3.1
- TypeScript: 5.8.3
- Vite: 5.4.21

---

**Last Updated**: 2026-09-30
**Status**: Ready for Deployment
