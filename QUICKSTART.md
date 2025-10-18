# 🚀 Quick Start Guide - Get Running in 5 Minutes!

## What You Have Now

✅ **Fully functional Pomodoro app** with Firebase integration
✅ **Backend API** running with Firebase Firestore
✅ **Frontend** with React and modern UI
✅ **All data** automatically saved to Firebase cloud
✅ **Ready to deploy** to production

## Your Firebase Project

**Project Name**: `pomodoro-app-f1472`
**Console**: https://console.firebase.google.com/project/pomodoro-app-f1472

## 🏃 Run Locally on Your PC

### Step 1: Get the Code

**Option A - Via GitHub (Recommended)**:
1. Click **"Save to GitHub"** button in Emergent
2. Clone on your PC:
   ```bash
   git clone <your-repo-url>
   cd pomodoro-app
   ```

**Option B - Download Manually**:
- Download all files from Emergent
- Extract to a folder on your PC

### Step 2: Install Tools

You need:
1. **Node.js** - https://nodejs.org/ (v16+)
2. **Python** - https://python.org/ (v3.9+)
3. **VS Code** - https://code.visualstudio.com/
4. **Yarn** - Run: `npm install -g yarn`

### Step 3: Install Dependencies

Open VS Code terminal:

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend (new terminal)
cd frontend
yarn install
```

### Step 4: Start the App

**Terminal 1 - Backend**:
```bash
cd backend
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8001
```

**Terminal 2 - Frontend**:
```bash
cd frontend
yarn start
```

✅ **App opens at**: http://localhost:3000
✅ **API at**: http://localhost:8001/api/

## 🌐 Deploy to Firebase (Make it Live!)

### Prerequisites

Install Firebase CLI:
```bash
npm install -g firebase-tools
```

Install Google Cloud SDK:
- Download: https://cloud.google.com/sdk/docs/install

### Login

```bash
firebase login
gcloud auth login
gcloud config set project pomodoro-app-f1472
```

### Deploy Frontend (Firebase Hosting)

```bash
cd frontend
yarn build
cd ..
firebase deploy --only hosting
```

✅ **Your live app**: https://pomodoro-app-f1472.web.app

### Deploy Backend (Google Cloud Run)

```bash
cd backend
gcloud run deploy pomodoro-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

After deployment, update frontend `.env` with the backend URL and redeploy.

## 📊 View Your Data

**Firebase Console**: https://console.firebase.google.com/project/pomodoro-app-f1472/firestore

You'll see these collections:
- `settings` - Your preferences
- `pomodoro_sessions` - Work sessions
- `todos` - Your tasks

## 🎯 What Works Right Now

✅ **Pomodoro Timer**
  - Multiple presets (Classic, Short, Deep)
  - Work/break cycles
  - Session tracking

✅ **Data Storage**
  - All data saves to Firebase automatically
  - Access from anywhere after deployment
  - No need for local database

✅ **API Endpoints**
  - `/api/sessions` - Save and get work sessions
  - `/api/settings` - User preferences
  - `/api/todos` - Task management

## 🎨 How to Customize

### Change Timer Presets

Edit `backend/server.py` in the `PomodoroSettings` model:
```python
presets: List[dict] = Field(default_factory=lambda: [
    {"id": "your-preset", "name": "Your Name", "work": 30, "shortBreak": 5, "longBreak": 15}
])
```

### Change Colors/Theme

Edit `frontend/src/index.css` or component Tailwind classes.

### Add New Features

1. **Backend**: Add API endpoints in `backend/server.py`
2. **Frontend**: Create components in `frontend/src/components/`
3. **Database**: Collections auto-create in Firestore

## 📱 Access from Multiple Devices

Once deployed to Firebase:
1. Access from any device
2. All data syncs automatically
3. No configuration needed

## 🐛 Common Issues

**Port already in use?**
```bash
# Kill port 8001 (backend)
lsof -ti:8001 | xargs kill -9   # Mac/Linux
netstat -ano | findstr :8001    # Windows

# Kill port 3000 (frontend)
lsof -ti:3000 | xargs kill -9   # Mac/Linux
```

**Module not found?**
```bash
cd backend && pip install -r requirements.txt
cd frontend && yarn install
```

**Firebase error?**
- Check internet connection
- Verify credentials in `.env` files
- Check Firebase Console for project status

## 💡 Daily Workflow

1. **Morning**: Open VS Code, run `yarn start` (frontend) and backend
2. **Code**: Make changes, they auto-reload
3. **Save**: `git add . && git commit -m "changes" && git push`
4. **Deploy**: When ready, run deployment commands above

## 📚 Full Documentation

- **Local Setup**: See [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Project Overview**: See [README.md](./README.md)

## 🆘 Get Help

**In Emergent**: Ask me any questions!
**Firebase Docs**: https://firebase.google.com/docs
**FastAPI Docs**: https://fastapi.tiangolo.com/
**React Docs**: https://react.dev/

---

## ✨ What's Next?

Now you can:
1. ✅ Run locally on your PC
2. ✅ Make changes and see them live
3. ✅ Deploy to Firebase for public access
4. ✅ All data saved to cloud automatically

**No more local database setup needed! 🎉**

Firebase handles everything - storage, backups, scaling, security.

---

**Ready to code?** Open VS Code and start building! 🚀
