# SEB Quick Setup Guide

## 🚀 Simple 5-Minute SEB Setup

### Step 1: Prepare the Exam Platform Folder
1. Extract `offline-deployment` to: `C:\ExamPlatform\`
2. Verify you can see `index.html` in that folder
3. Test by opening `index.html` in Chrome (it should load the platform)

### Step 2: Open SEB Settings
1. Open Safe Exam Browser
2. Click the "Settings" button (or use the menu)
3. If it says "No SEB file", close SEB and reopen it as administrator

### Step 3: Configure SEB (Manual Setup - Most Reliable)

**Click through the SEB settings tabs and set these:**

**General Tab:**
- Start URL: `file:///C:/ExamPlatform/index.html`
- Exam URL: `file:///C:/ExamPlatform/index.html`
- Allow Quit: ❌ (unchecked)
- Confirm Quit: ❌ (unchecked)

**Browser Tab:**
- Allow Task Switching: ❌ (unchecked)
- Allow Browsing Back/Forward: ❌ (unchecked)
- Allow Developer Tools: ❌ (unchecked)
- Allow Print: ❌ (unchecked)
- Allow Spell Check: ❌ (unchecked)
- Allow Right Mouse Open: ❌ (unchecked)
- Allow Text Selection: ✅ (checked)

**Security Tab:**
- Enable URL Filtering: ✅ (checked)
- Add these URL filter rules:
  - Action: Allow, Expression: `file://.*`
  - Action: Allow, Expression: `https://sql.js.org/.*`
  - Action: Block, Expression: `.*`

**Applications Tab:**
- Leave all settings as default (should be empty)

**Additional Tab:**
- Enable LocalStorage: ✅ (checked)
- Enable SessionStorage: ✅ (checked)
- Enable WebSocket: ❌ (unchecked)
- Enable WebRTC: ❌ (unchecked)
- Enable WebGL: ❌ (unchecked)

### Step 4: Save and Test
1. Click "Save Configuration" or "Save Settings"
2. Close SEB completely
3. Reopen SEB
4. SEB should automatically open the exam platform
5. Test that it loads correctly

### Step 5: Test Exam Platform
1. Navigate to `/offline-admin` (add `#/offline-admin` to URL)
2. Verify admin panel loads
3. Test adding a student
4. Test enabling an exam
5. Close SEB and reopen to test automatic loading

## 🔧 Alternative: Use Command Line (If GUI Fails)

If SEB settings won't work, try this:

### Create a SEB Startup Script
1. Create a new text file on Desktop
2. Name it `start-exam.bat`
3. Add this content:
   ```batch
   @echo off
   "C:\Program Files\SafeExamBrowser\seb.exe" "file:///C:/ExamPlatform/index.html"
   ```
4. Save the file
5. Double-click `start-exam.bat` to start SEB with the exam platform

### Configure Basic SEB Settings
1. Open SEB normally
2. Set only these essential settings:
   - Allow Quit: ❌
   - Allow Task Switching: ❌
   - Enable JavaScript: ✅
   - Enable LocalStorage: ✅
3. Save configuration
4. Use the `start-exam.bat` script to start SEB

## 🎯 Quick Troubleshooting

### "No SEB File" Error
- Close SEB
- Right-click SEB icon
- Select "Run as administrator"
- Try opening settings again

### Platform Won't Load
- Check file path: `file:///C:/ExamPlatform/index.html`
- Use forward slashes `/` not backslashes `\`
- Test in regular browser first
- Check that `C:\ExamPlatform\` folder exists

### Settings Won't Save
- Run SEB as administrator
- Check folder permissions
- Try saving to Desktop instead
- Disable antivirus temporarily

### Wrong File Format
- SEB needs `.seb` or `.xml` files
- Our configuration file is `.seb` format
- If import fails, use manual configuration

## 📋 Essential Settings Only

If you want the absolute minimum SEB configuration:

**Required Settings:**
- Start URL: `file:///C:/ExamPlatform/index.html`
- Allow Quit: ❌
- Enable JavaScript: ✅
- Enable LocalStorage: ✅

**Optional but Recommended:**
- Allow Task Switching: ❌
- Allow Developer Tools: ❌
- Enable URL Filtering: ✅ (with file://.*)

## 🚀 Ready to Use

Once configured:
1. SEB opens with exam platform automatically
2. Students can log in and take exams
3. Admin panel available at `/offline-admin`
4. All features work offline
5. Results saved locally

The key is getting the file path correct: `file:///C:/ExamPlatform/index.html` with forward slashes. Everything else can be configured as needed!