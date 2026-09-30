# SEB Configuration Instructions

## 🚀 Quick Setup (Follow These Steps)

### Step 1: Extract the Exam Platform
1. Extract the `offline-deployment` folder to: `C:\ExamPlatform\`
2. Verify you can see `index.html` in that folder

### Step 2: Configure SEB Using Our Config File

**Method A: Import Configuration File (Recommended)**
1. Open Safe Exam Browser
2. Click "Settings" or "Preferences" 
3. Look for "File" → "Open Configuration" or similar
4. Navigate to: `C:\ExamPlatform\seb-config-complete.seb`
5. Select the file and click "Open"
6. SEB should load the configuration

**Method B: Manual Configuration (If Import Fails)**
1. Open SEB Settings
2. Set these specific settings:

**General Settings:**
- **Start URL**: `file:///C:/ExamPlatform/index.html`
- **Allow Quit**: ❌ (unchecked)
- **Allow Task Switching**: ❌ (unchecked)
- **Allow URL Bar**: ❌ (unchecked)
- **Allow Right Click**: ❌ (unchecked)
- **Allow Developer Tools**: ❌ (unchecked)

**Browser Settings:**
- **Enable JavaScript**: ✅ (checked)
- **Enable LocalStorage**: ✅ (checked)
- **Enable SessionStorage**: ✅ (checked)
- **Enable Cookies**: ✅ (checked)
- **Enable WebGL**: ❌ (unchecked)
- **Enable WebRTC**: ❌ (unchecked)

**URL Filtering:**
- **Enable URL Filtering**: ✅ (checked)
- **Add these allowed URLs:**
  - `file://.*` (allows all local files)
  - `https://sql.js.org/.*` (for database library)

### Step 3: Test SEB Configuration
1. Save the SEB configuration
2. Close SEB completely
3. Reopen SEB
4. SEB should automatically open `file:///C:/ExamPlatform/index.html`
5. You should see the exam platform loading

### Step 4: Test Exam Platform
1. Navigate to `/offline-admin` (add `#/offline-admin` to URL)
2. Verify admin panel loads
3. Test adding a student
4. Test enabling an exam
5. Verify everything works

## 🔧 Troubleshooting Common SEB Issues

### "No SEB File" Error
**Problem:** SEB says "No SEB file" when trying to open settings

**Solution:**
1. Close SEB completely
2. Right-click SEB icon on Desktop
3. Select "Run as administrator"
4. Try opening configuration again
5. If still fails, use Method B (manual configuration)

### SEB Won't Load the Platform
**Problem:** SEB opens but shows blank page or error

**Solution:**
1. Check the file path: `file:///C:/ExamPlatform/index.html`
2. Use forward slashes, not backslashes
3. Make sure the folder exists at `C:\ExamPlatform\`
4. Try opening in regular browser first to test

### Configuration Won't Save
**Problem:** SEB settings don't save or reset

**Solution:**
1. Run SEB as administrator
2. Check folder permissions
3. Try saving to a different location
4. Check if antivirus is blocking SEB

### File Path Issues
**Problem:** Start URL won't work

**Solution:**
1. Use this exact format: `file:///C:/ExamPlatform/index.html`
2. Use forward slashes: `/` not `\`
3. No spaces in folder names (use `ExamPlatform` not `Exam Platform`)
4. Test path in regular browser first

## 📋 Alternative: Simple SEB Setup

If the configuration file doesn't work, use this simple method:

### Step 1: Create SEB Shortcut
1. Right-click on Desktop
2. Select "New" → "Shortcut"
3. Type this exact path (adjust if needed):
   ```
   "C:\Program Files\SafeExamBrowser\seb.exe" "file:///C:/ExamPlatform/index.html"
   ```
4. Name it "Exam Platform"
5. Click Finish

### Step 2: Configure Basic Settings
1. Open SEB normally
2. Set only these essential settings:
   - Allow Quit: ❌
   - Allow Task Switching: ❌
   - Allow URL Bar: ❌
   - Enable JavaScript: ✅
   - Enable LocalStorage: ✅
3. Save configuration

### Step 3: Test with Shortcut
1. Close SEB
2. Double-click the "Exam Platform" shortcut
3. SEB should open with the exam platform
4. Test functionality

## 🎯 Quick Test Checklist

After configuration, verify:
- [ ] SEB opens without errors
- [ ] Exam platform loads in SEB
- [ ] Platform is responsive
- [ ] Student login works
- [ ] Admin panel accessible
- [ ] Exams load correctly
- [ ] No console errors (F12)

## 📞 Still Having Issues?

### Try These Steps:
1. **Test in Regular Browser First**
   - Open Chrome/Edge
   - Navigate to `file:///C:/ExamPlatform/index.html`
   - If this doesn't work, SEB won't work either

2. **Check File Permissions**
   - Right-click `C:\ExamPlatform` folder
   - Properties → Security
   - Ensure "Read & Execute" for all users

3. **Reinstall SEB**
   - Uninstall SEB completely
   - Download fresh copy from safeexambrowser.org
   - Install as administrator
   - Try configuration again

4. **Use Default Settings**
   - Reset SEB to default settings
   - Configure only essential settings manually
   - Test with basic configuration

5. **Check Antivirus**
   - Temporarily disable antivirus
   - Test SEB configuration
   - Re-enable antivirus and add SEB to exceptions

## 🚀 Ready to Use

Once SEB is configured:
1. Open SEB
2. Exam platform loads automatically
3. Students can take exams
4. Admin panel available at `/offline-admin`
5. All features work offline

The configuration is designed to be simple and secure for exam environments. Follow these steps and you should have SEB working with your offline exam platform!