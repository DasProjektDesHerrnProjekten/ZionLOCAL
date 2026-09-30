# Complete SEB Installation Guide for Offline Exam Platform

## 📋 System Requirements

**Minimum Requirements:**
- Windows 10 or later (SEB works best on Windows)
- 4GB RAM (8GB recommended)
- 100MB free disk space
- Modern web browser (Chrome, Firefox, or Edge)
- USB drive for file transfer (if no network)

**Recommended:**
- 8GB RAM
- 500MB free disk space
- Administrative access for installation
- Network connection for initial setup (optional)

---

## 🚀 Step-by-Step Installation

### Phase 1: Prepare the Deployment Package

#### 1.1 Create the Deployment Package
```bash
# On your development machine
cd C:\Users\Winomickal\Documents\HauptPlattform\HauptPlattform
npm run build:offline-deployment
```

This creates the `offline-deployment` folder with everything needed.

#### 1.2 Customize Student Data (Optional but Recommended)
- Open `offline-deployment/data/students-template.json`
- Edit with your actual student data
- Save the file

#### 1.3 Package for Transfer
- Right-click the `offline-deployment` folder
- Select "Send to" → "Compressed (zipped) folder"
- Name it `exam-platform-offline.zip`

---

### Phase 2: Install Required Software on Target PC

#### 2.1 Install Safe Exam Browser (SEB)

**Download SEB:**
1. Go to https://safeexambrowser.org/download/
2. Download the Windows version (recommended: latest stable)
3. Save to Desktop or Downloads folder

**Install SEB:**
1. Double-click the SEB installer (.exe file)
2. Follow the installation wizard:
   - Accept license agreement
   - Choose installation location (default is fine)
   - Select "Add SEB to Desktop" and "Add SEB to Start Menu"
   - Click "Install"
3. Wait for installation to complete
4. Click "Finish"

**Verify SEB Installation:**
- Look for "Safe Exam Browser" icon on Desktop
- Double-click to open SEB
- SEB should open with a welcome screen
- Close SEB for now

#### 2.2 Install Web Browser (If Not Already Installed)

**Chrome (Recommended):**
1. Go to https://www.google.com/chrome/
2. Download Chrome
3. Install Chrome
4. Set Chrome as default browser (optional but recommended)

**Alternative:**
- Firefox: https://www.mozilla.org/firefox/
- Edge: Usually pre-installed on Windows

---

### Phase 3: Deploy the Exam Platform

#### 3.1 Transfer Deployment Package

**Option A: USB Drive (Recommended for Offline)**
1. Copy `exam-platform-offline.zip` to USB drive
2. Safely remove USB drive
3. Insert USB drive into target PC
4. Copy the zip file to Desktop or a fixed location

**Option B: Network Transfer (If Available)**
1. Copy `offline-deployment` folder to network share
2. Access from target PC
3. Copy to local drive

**Option C: Direct Copy (If PCs Are Connected)**
1. Use network sharing or file transfer
2. Copy `offline-deployment` folder directly

#### 3.2 Extract Deployment Package
1. Right-click `exam-platform-offline.zip`
2. Select "Extract All..."
3. Choose extraction location (e.g., `C:\ExamPlatform\`)
4. Click "Extract"
5. Wait for extraction to complete

**Recommended Location:**
- `C:\ExamPlatform\` (system drive, easy to access)
- Avoid desktop (may get cluttered)
- Avoid user profile (different for each user)

#### 3.3 Verify Deployment Structure
After extraction, you should have:
```
C:\ExamPlatform\
├── index.html
├── assets/
├── exams/
├── data/
├── seb-config.xml
├── init.bat
└── README.md
```

---

### Phase 4: Configure SEB

#### 4.1 Import SEB Configuration

**Method A: Import Configuration File**
1. Open Safe Exam Browser
2. Click "Settings" or "Preferences"
3. Look for "Import Configuration" or "Load Configuration"
4. Navigate to `C:\ExamPlatform\seb-config.xml`
5. Select the file and import

**Method B: Manual Configuration (If Import Fails)**
1. Open SEB Settings
2. Configure these key settings:
   - **Start URL**: Set to `file:///C:/ExamPlatform/index.html`
   - **Allow Quit**: Disable (recommended for exams)
   - **Allow Task Switching**: Disable
   - **Allow URL Bar**: Disable
   - **Allow Right Click**: Disable
   - **Allow JavaScript**: Enable (required)
   - **Allow LocalStorage**: Enable (required)
   - **Allow Cookies**: Enable (required)

#### 4.2 Test SEB Configuration
1. Save SEB configuration
2. Close SEB
3. Reopen SEB
4. SEB should automatically open the exam platform
5. Verify the platform loads correctly
6. Close SEB

---

### Phase 5: Configure the Exam Platform

#### 5.1 Initial Platform Setup
1. Open `C:\ExamPlatform\index.html` in Chrome (outside SEB first)
2. Navigate to `/offline-admin` (add `#/offline-admin` to URL)
3. You should see the Offline Admin Panel

#### 5.2 Add Students (if not done in template)
1. Go to "Students" tab in admin panel
2. Fill in "Add New Student" form:
   - Student ID: (e.g., "101010")
   - Full Name: Student's complete name
   - Stream: Natural Science, Social Science, or Both
   - Grade: Grade level (e.g., "12")
3. Click "Add Student"
4. Repeat for all students

#### 5.3 Configure Exam Availability
1. Go to "Exams" tab in admin panel
2. Review all 18 available exams
3. Enable only the exams for today's test
4. Disable all other exams
5. Changes take effect immediately

#### 5.4 Grant Student Access
1. Go to "Students" tab
2. For each student, check "Exam Access" section
3. Grant access to the enabled exams
4. Students will see only exams they have access to

#### 5.5 Test Student Access
1. Open a new browser window (incognito/private mode)
2. Navigate to `file:///C:/ExamPlatform/index.html`
3. Log in as a test student
4. Verify only enabled exams appear
5. Verify exam access permissions work correctly

---

### Phase 6: Final SEB Integration

#### 6.1 Set SEB Startup URL
1. Open SEB Settings
2. Set "Start URL" to: `file:///C:/ExamPlatform/index.html`
3. Save configuration

#### 6.2 Create Desktop Shortcut (Optional)
1. Right-click on Desktop
2. Select "New" → "Shortcut"
3. Location: SEB executable path (e.g., `C:\Program Files\SafeExamBrowser\seb.exe`)
4. Name: "Exam Platform"
5. Finish

#### 6.3 Test Complete Workflow
1. Close all browsers
2. Open SEB
3. SEB should automatically open the exam platform
4. Test student login
5. Test exam access
6. Test exam taking
7. Close SEB

---

### Phase 7: Pre-Exam Verification

#### 7.1 System Check
- [ ] SEB opens correctly
- [ ] Exam platform loads in SEB
- [ ] All 18 exams are available in admin panel
- [ ] Student login works
- [ ] Exam access permissions work
- [ ] Students can see enabled exams
- [ ] Students cannot see disabled exams
- [ ] Exam taking interface works

#### 7.2 Data Verification
- [ ] Student data is correct
- [ ] Exam access is properly configured
- [ ] Only required exams are enabled
- [ ] No data corruption or errors

#### 7.3 Performance Check
- [ ] Platform loads quickly
- [ ] No lag when navigating
- [ ] Exam questions load properly
- [ ] Images display correctly
- [ ] No JavaScript errors

---

### Phase 8: Exam Day Procedures

#### 8.1 Pre-Exam Setup (30 minutes before)
1. Start all exam PCs
2. Open SEB on each PC
3. Verify platform loads correctly
4. Verify all students can log in
5. Verify exam access is correct
6. Have backup plan ready

#### 8.2 During Exam
1. Monitor PC functionality
2. Be ready to handle technical issues
3. Admin panel accessible for emergencies
4. Student support as needed

#### 8.3 Post-Exam
1. Export results from each PC
2. Collect result files via USB or network
3. Consolidate results on admin PC
4. Clear data from exam PCs (if needed)
5. Prepare for next exam

---

## 🔧 Troubleshooting

### SEB Won't Open the Platform

**Problem:** SEB opens but doesn't load the exam platform

**Solutions:**
1. Check start URL in SEB settings
2. Verify file path is correct: `file:///C:/ExamPlatform/index.html`
3. Use forward slashes in file paths
4. Try opening in regular browser first to test

### Students Can't See Exams

**Problem:** Students log in but see no exams

**Solutions:**
1. Check exam status in admin panel (must be "active")
2. Verify student has exam access in admin panel
3. Check student stream matches exam stream
4. Clear browser cache and reload
5. Check JavaScript console for errors

### Platform Won't Load

**Problem:** index.html won't open or shows errors

**Solutions:**
1. Verify all files are present in `C:\ExamPlatform\`
2. Check file permissions
3. Try different browser
4. Check antivirus isn't blocking files
5. Verify JavaScript is enabled

### Results Not Saving

**Problem:** Student completes exam but results don't save

**Solutions:**
1. Check localStorage quota (limit: ~5MB)
2. Verify browser allows localStorage
3. Check for JavaScript errors
4. Try clearing cache and retry
5. Verify student is properly logged in

### SEB Configuration Issues

**Problem:** SEB settings won't save or load

**Solutions:**
1. Run SEB as administrator
2. Check write permissions
3. Try exporting config and re-importing
4. Use manual configuration instead
5. Reinstall SEB if needed

---

## 📋 Quick Reference Checklist

### Installation Checklist
- [ ] SEB installed
- [ ] Web browser installed
- [ ] Deployment package transferred
- [ ] Files extracted to correct location
- [ ] SEB configuration imported
- [ ] Start URL configured
- [ ] Admin panel accessible
- [ ] Students added
- [ ] Exams configured
- [ ] Access permissions set
- [ ] Complete workflow tested

### Pre-Exam Day Checklist
- [ ] All PCs start correctly
- [ ] SEB opens platform correctly
- [ ] Student login works
- [ ] Exam access verified
- [ ] Backup plan ready
- [ ] Admin contact info available

### Post-Exam Checklist
- [ ] Results exported from all PCs
- [ ] Result files collected
- [ ] Results consolidated
- [ ] Data backed up
- [ ] PCs cleaned for next use

---

## 🎯 Best Practices

### Security
- Keep physical access to PCs controlled
- Don't share admin passwords
- Clear sensitive data after exams
- Monitor for unauthorized access

### Performance
- Use SSD storage if available
- Close unnecessary applications
- Keep at least 500MB free space
- Restart PCs before exams

### Reliability
- Test thoroughly before exam day
- Have backup PCs ready
- Keep installation files available
- Document any custom configurations

### Data Management
- Regular database backups
- Clear cache periodically
- Monitor storage usage
- Archive old results

---

## 📞 Support Resources

### SEB Documentation
- Official website: https://safeexambrowser.org/
- User guide: https://safeexambrowser.org/user-guide/
- FAQ: https://safeexambrowser.org/faq/

### Platform Documentation
- Admin guide: `OFFLINE_ADMIN_GUIDE.md`
- Deployment guide: `offline-deployment/README.md`
- SEB config: `offline-deployment/seb-config.xml`

### Common Issues
- JavaScript console errors: Check browser console (F12)
- File path issues: Use forward slashes in paths
- Permission issues: Run as administrator
- Performance issues: Clear cache, restart browser

---

## 🔄 Updates and Maintenance

### Regular Updates
- Check for SEB updates monthly
- Update exam content as needed
- Review and update student data
- Clear old result data

### System Updates
- Test updates before deployment
- Backup data before updating
- Update all PCs consistently
- Verify functionality after updates

### Emergency Procedures
1. Have backup installation ready
2. Keep contact info for technical support
3. Document any custom configurations
4. Test emergency procedures before exams

---

This guide provides everything needed to install and configure the offline exam platform with SEB on new PCs. Follow each step carefully and test thoroughly before exam day!