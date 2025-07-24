# 🧬 AgenticOmics Platform - User Guide

## What is AgenticOmics?
AgenticOmics is a platform designed to help researchers, graduate students, lab technicians, and professors upload, manage, and analyze omics data using AI-powered tools. No coding experience required!

## 🚀 Quick Start (For Non-Technical Users)

### One-Time Setup (First Time Only)

1. **Download Required Software** (click links to download):
   - [Java 17](https://adoptium.net/) - Choose "OpenJDK 17 LTS" for your system
   - [Node.js](https://nodejs.org/) - Choose "LTS" version
   - [Git](https://git-scm.com/) - For downloading the project

2. **Download the Project**:
   - Open Terminal (Mac) or Command Prompt (Windows)
   - Type these commands one by one:
   ```bash
   cd Desktop
   git clone https://github.com/victiny23/AgenticOmics.git
   cd AgenticOmics
   git checkout task-2-welcome-page-ui
   ```

### Starting the Application (Every Time You Want to Use It)

#### 🖥️ Windows Users:
1. Open the `AgenticOmics` folder on your Desktop
2. Double-click `start-app.bat`
3. Wait for the browser to open automatically
4. If browser doesn't open, go to: `http://localhost:3000`

#### 🍎 Mac/Linux Users:
1. Open Terminal
2. Type:
   ```bash
   cd Desktop/AgenticOmics
   ./start-app.sh
   ```
3. Open your browser and go to: `http://localhost:3000`

### Stopping the Application

#### 🖥️ Windows Users:
- Double-click `stop-app.bat`

#### 🍎 Mac/Linux Users:
- In Terminal, type: `./stop-app.sh`
- Or press `Ctrl+C` in the terminal where you started the app

## 🌐 Using the Platform

Once started, you can access these features:

### 📊 Main Dashboard (`http://localhost:3000`)
- **Welcome Page**: Overview of platform capabilities
- **Data Upload**: Upload your omics datasets
- **Pipeline Builder**: Create analysis workflows using drag-and-drop
- **Analysis Results**: View and download your results
- **Settings**: Configure your preferences

### 🔧 Advanced Access (Optional)
- **API Gateway**: `http://localhost:8080` - For developers
- **Authentication**: `http://localhost:8081` - User management

## 🆘 Troubleshooting

### Problem: "Can't access the website"
**Solution**: 
1. Make sure you waited 1-2 minutes after starting
2. Check that you're using `http://localhost:3000` (not 8080)
3. Try refreshing the browser page

### Problem: "Services won't start"
**Solution**:
1. Run the stop script first
2. Wait 30 seconds
3. Run the start script again

### Problem: "Port already in use"
**Solution**:
1. Close any other development servers you might have running
2. Restart your computer if needed
3. Try starting again

### Problem: "Command not found"
**Solution**: Make sure you installed Java, Node.js, and Git properly

## 📱 What You Should See

### ✅ Success Indicators:
- Browser opens to a clean, modern interface
- You see "AgenticOmics" branding
- Navigation tabs are visible and clickable
- No error messages

### ❌ Something's Wrong If:
- Browser shows "This site can't be reached"
- You see only error messages
- Page is completely blank
- Services fail to start in terminal

## 🎯 Platform Features

### For Researchers:
- **Easy Data Upload**: Drag and drop your omics files
- **AI-Powered Analysis**: Let AI suggest analysis pipelines
- **Visual Pipeline Builder**: Create workflows without coding
- **Automated Reports**: Get publication-ready results

### For Lab Managers:
- **User Management**: Control access to data and analyses
- **Project Organization**: Keep research organized by project
- **Collaboration Tools**: Share results with team members
- **Data Security**: Secure storage and access controls

### For Students:
- **Learning Mode**: Guided tutorials for omics analysis
- **Template Pipelines**: Pre-built workflows for common analyses
- **Interactive Results**: Explore data with interactive visualizations
- **Export Options**: Download results in various formats

## 📞 Getting Help

### If You're Stuck:
1. **Check the browser URL**: Should be `http://localhost:3000`
2. **Wait longer**: Services can take 1-2 minutes to fully start
3. **Restart everything**: Use stop script, wait, then start script
4. **Check logs**: Look in the `logs` folder for error messages

### Log Files Location:
- Windows: `AgenticOmics\logs\`
- Mac/Linux: `AgenticOmics/logs/`

Files to check:
- `frontend.log` - Web interface issues
- `gateway.log` - API problems
- `auth.log` - Login/security issues

## 🔄 Updates

To get the latest version:
1. Stop the application
2. In Terminal/Command Prompt:
   ```bash
   cd Desktop/AgenticOmics
   git pull origin task-2-welcome-page-ui
   ```
3. Start the application again

---

## 📋 Quick Reference

| What | Where | When |
|------|-------|------|
| **Start App** | `start-app.bat` (Windows) or `./start-app.sh` (Mac/Linux) | Every time you want to use it |
| **Stop App** | `stop-app.bat` (Windows) or `./stop-app.sh` (Mac/Linux) | When you're done |
| **Main Interface** | `http://localhost:3000` | After starting |
| **Logs** | `logs/` folder | When troubleshooting |

**Remember**: Always use `localhost:3000` in your browser, not the other ports!