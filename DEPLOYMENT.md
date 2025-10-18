# Firebase Deployment Guide

This guide will help you deploy your Pomodoro app to Firebase (Frontend) and Google Cloud Run (Backend).

## Prerequisites

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Install Google Cloud SDK**:
   - Download from: https://cloud.google.com/sdk/docs/install
   - Follow installation instructions for your OS

3. **Login to Firebase**:
   ```bash
   firebase login
   ```

4. **Login to Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project pomodoro-app-f1472
   ```

## Deploying Frontend (Firebase Hosting)

### Step 1: Build the React App
```bash
cd frontend
yarn build
# or
npm run build
```

### Step 2: Deploy to Firebase Hosting
```bash
cd ..
firebase deploy --only hosting
```

Your frontend will be live at: `https://pomodoro-app-f1472.web.app`

## Deploying Backend (Google Cloud Run)

### Step 1: Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 2: Build and Deploy
```bash
cd backend

# Deploy to Cloud Run
gcloud run deploy pomodoro-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Step 3: Get Backend URL
After deployment, you'll get a URL like:
`https://pomodoro-backend-xxxxx-uc.a.run.app`

### Step 4: Update Frontend to Use New Backend

Update `frontend/.env.local`:
```
REACT_APP_BACKEND_URL=https://pomodoro-backend-xxxxx-uc.a.run.app
```

Then rebuild and redeploy frontend:
```bash
cd frontend
yarn build
cd ..
firebase deploy --only hosting
```

## Testing Your Deployment

1. **Test Frontend**: Visit `https://pomodoro-app-f1472.web.app`
2. **Test Backend**: Visit `https://your-backend-url/api/`

## Updating Your App

### To update frontend:
```bash
cd frontend
yarn build
cd ..
firebase deploy --only hosting
```

### To update backend:
```bash
cd backend
gcloud run deploy pomodoro-backend --source .
```

## Cost Optimization

- **Firebase Hosting**: Free tier includes 10GB storage and 360MB/day transfer
- **Cloud Run**: Free tier includes 2 million requests/month
- **Firestore**: Free tier includes 50K reads, 20K writes, 20K deletes per day

## Troubleshooting

### CORS Errors
If you see CORS errors, update `backend/server.py` CORS settings:
```python
allow_origins=["https://pomodoro-app-f1472.web.app"]
```

### Backend Not Responding
- Check Cloud Run logs: `gcloud run logs read pomodoro-backend`
- Verify Firestore security rules allow access
- Ensure service account has proper permissions

## Security Rules (Firestore)

In Firebase Console, set these Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // For now, allow all (add authentication later)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Next Steps

1. Add Firebase Authentication for user management
2. Secure Firestore with proper security rules
3. Set up CI/CD with GitHub Actions
4. Add custom domain
5. Enable analytics and monitoring
