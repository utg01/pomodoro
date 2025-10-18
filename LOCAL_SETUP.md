# Local Development Setup Guide

This guide will help you run the Pomodoro app locally on your PC using VS Code.

## Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify installation: `node --version`

2. **Python** (v3.9 or higher)
   - Download: https://www.python.org/downloads/
   - Verify installation: `python --version` or `python3 --version`

3. **Yarn** (Package manager)
   - Install: `npm install -g yarn`
   - Verify: `yarn --version`

4. **VS Code**
   - Download: https://code.visualstudio.com/

5. **Git**
   - Download: https://git-scm.com/downloads

## Step 1: Download Project from Emergent

### Option A: Using GitHub (Recommended)

1. In Emergent chat interface, click **"Save to GitHub"** button
2. Connect your GitHub account if not already connected
3. Save the project to a new repository
4. Clone to your local machine:
   ```bash
   git clone https://github.com/your-username/pomodoro-app.git
   cd pomodoro-app
   ```

### Option B: Manual Download

1. Download project files from Emergent
2. Create a new folder on your PC
3. Copy all files to that folder
4. Open the folder in VS Code

## Step 2: Install Dependencies

Open terminal in VS Code (Terminal > New Terminal):

### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
# or if you have multiple Python versions
python3 -m pip install -r requirements.txt
```

### Frontend Dependencies
```bash
cd ../frontend
yarn install
# or
npm install --legacy-peer-deps
```

## Step 3: Run the Application

### Option 1: Run Both Services Together

**Terminal 1 (Backend):**
```bash
cd backend
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8001
# or
python3 -m uvicorn server:app --reload --host 127.0.0.1 --port 8001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
yarn start
# or
npm start
```

The app will open automatically in your browser at `http://localhost:3000`

Backend API will be available at `http://localhost:8001`

### Option 2: Using VS Code Tasks (Recommended)

Create `.vscode/tasks.json` in project root:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "python",
      "args": ["-m", "uvicorn", "server:app", "--reload", "--host", "127.0.0.1", "--port", "8001"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "isBackground": true
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "yarn",
      "args": ["start"],
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "isBackground": true
    },
    {
      "label": "Start All",
      "dependsOn": ["Start Backend", "Start Frontend"]
    }
  ]
}
```

Then press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac), type "Run Task", and select "Start All"

## Step 4: Verify Everything Works

1. **Backend Check**: Open http://localhost:8001/api/ in browser
   - Should see: `{"message":"Pomodoro App API - Firebase Edition","status":"running"}`

2. **Frontend Check**: Open http://localhost:3000
   - Should see the Pomodoro timer interface

3. **Test Timer**:
   - Click "Start" button
   - Timer should count down
   - Data should save to Firestore

## Data Persistence (Firebase)

Your data is stored in Firebase Firestore (cloud database), so:

✅ **All your data is automatically saved online**
✅ **Access from any device** (after deployment)
✅ **No local database installation needed**
✅ **Automatic backups**

Your Firebase project: `pomodoro-app-f1472`

## Daily Development Workflow

### 1. Open Project in VS Code
```bash
cd /path/to/pomodoro-app
code .
```

### 2. Start Development Servers
Use VS Code tasks or run in two terminals as shown above

### 3. Make Your Changes
- Edit files in VS Code
- Changes auto-reload (hot reload enabled)
- Backend changes may require manual restart

### 4. Test Your Changes
- Frontend: Check browser (auto-refreshes)
- Backend: Check http://localhost:8001/api/

### 5. Save to GitHub (Daily)
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

## Troubleshooting

### Issue: Port Already in Use

**Backend (Port 8001):**
```bash
# Windows
netstat -ano | findstr :8001
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:8001 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: Module Not Found

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules
yarn install
```

### Issue: Firebase Connection Error

1. Check internet connection
2. Verify Firebase credentials in `frontend/.env`
3. Check Firebase Console for project status: https://console.firebase.google.com/

### Issue: Python Command Not Found

Try using `python3` instead of `python`:
```bash
python3 -m uvicorn server:app --reload --host 127.0.0.1 --port 8001
```

## VS Code Recommended Extensions

Install these for better development experience:

1. **Python** (by Microsoft)
2. **ESLint** (by Microsoft)
3. **Prettier** (Code formatter)
4. **GitLens** (Git visualization)
5. **Firebase Explorer**
6. **Thunder Client** (API testing)

## Accessing from Emergent and Local

### Hybrid Workflow

1. **Use Emergent for**:
   - AI-assisted development
   - New feature planning
   - Complex bug fixes

2. **Use Local VS Code for**:
   - Daily coding
   - Detailed debugging
   - Running tests
   - Git operations

3. **Sync with GitHub**:
   - Push changes from local: `git push`
   - Pull in Emergent when needed
   - Keep both in sync

## Viewing Firebase Data

1. Go to: https://console.firebase.google.com/
2. Select project: `pomodoro-app-f1472`
3. Click **Firestore Database** in sidebar
4. Browse your data:
   - `settings` - User preferences
   - `pomodoro_sessions` - Completed work sessions
   - `todos` - Task list

## Environment Variables Reference

### Backend (.env)
Currently using Firebase service account JSON file directly.

### Frontend (.env and .env.local)
```
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_FIREBASE_API_KEY=your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Next Steps

1. ✅ Run the app locally
2. ✅ Test all features
3. 📝 Deploy to Firebase (see DEPLOYMENT.md)
4. 🎨 Customize the app
5. 🚀 Share with others

## Getting Help

- Firebase Docs: https://firebase.google.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com/
- React Docs: https://react.dev/

---

**Need help?** Come back to Emergent and ask questions! 🚀
