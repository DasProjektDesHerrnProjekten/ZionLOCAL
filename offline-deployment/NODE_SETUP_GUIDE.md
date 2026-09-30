# Node.js Setup Guide for Offline Exam Platform

## 🚀 Quick Setup

### Step 1: Install Node.js on Exam PCs

**Download:**
1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Accept default settings
5. Complete installation

**Verify Installation:**
```bash
node --version
```
Should show something like: `v20.x.x` or `v18.x.x`

### Step 2: Deploy the Exam Platform

1. Copy the `offline-deployment` folder to: `C:\ExamPlatform\`
2. Verify all files are present:
   - `index.html`
   - `server.js`
   - `start-server.bat`
   - `start-exam-with-seb.bat`
   - `assets/` folder
   - `exams/` folder
   - `data/` folder

### Step 3: Start the Server

**Option A: Start Server Only**
1. Double-click `start-server.bat`
2. Server starts on port 8080
3. Access at: http://localhost:8080
4. Press Ctrl+C to stop

**Option B: Start with SEB (Recommended)**
1. Double-click `start-exam-with-seb.bat`
2. Server starts automatically
3. SEB opens with the exam platform
4. Server runs in background
5. Press any key after exam to stop server

### Step 4: Configure SEB

**If using manual SEB configuration:**

**General Tab:**
- **Start URL**: `http://localhost:8080`
- **Allow Quit**: ❌ (unchecked)

**Security Tab:**
- **Enable URL Filtering**: ✅ (checked)
- Add filter rule: Action: "Allow", Expression: `http://localhost:8080.*`
- Add filter rule: Action: "Block", Expression: `.*`

**Additional Tab:**
- **Enable LocalStorage**: ✅ (checked)
- **Enable SessionStorage**: ✅ (checked)

**Or import the provided config:**
- Use `seb-config-localhost.seb` in SEB settings

## 🔧 Troubleshooting

### "Node.js is not installed"
- Download and install Node.js from https://nodejs.org/
- Restart the computer after installation
- Verify with `node --version`

### "Port 8080 is already in use"
- Stop any other server running on port 8080
- Or edit `server.js` to use a different port
- Update SEB configuration to match new port

### "SEB not found"
- Install SEB from https://safeexambrowser.org/
- Check SEB installation path in `start-exam-with-seb.bat`
- Update the path if installed in a different location

### Server won't start
- Check if Node.js is installed: `node --version`
- Verify you're in the correct directory: `C:\ExamPlatform\`
- Check if another Node.js process is running: `tasklist | findstr node`
- Kill existing Node.js processes: `taskkill /f /im node.exe`

## 📋 Exam Day Workflow

### Before Exam:
1. Start server: Double-click `start-server.bat`
2. Verify server is running: Open http://localhost:8080 in browser
3. Test student login
4. Test exam access
5. Close browser

### During Exam:
1. Use `start-exam-with-seb.bat` to start everything
2. Students take exams through SEB
3. Server runs in background
4. Monitor for any issues

### After Exam:
1. Close SEB
2. Press any key in the server window to stop it
3. Export results from admin panel
4. Collect result files

## 🎯 Benefits of Using Node.js

- ✅ Reliable and well-tested
- ✅ Fast performance
- ✅ Easy to troubleshoot
- ✅ Cross-platform compatible
- ✅ Minimal setup required
- ✅ Works perfectly with SEB

## 📞 Support

If you encounter issues:
1. Check Node.js version: `node --version`
2. Check server logs in the console window
3. Verify SEB configuration
4. Test in regular browser first: http://localhost:8080

The Node.js server approach is the most reliable solution for offline exam deployment!