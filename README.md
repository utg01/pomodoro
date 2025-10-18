# 🍅 Pomodoro Timer App

A beautiful, modern Pomodoro timer application built with React, FastAPI, and Firebase. Track your focus sessions, manage tasks, and boost your productivity.

![Pomodoro App](https://img.shields.io/badge/Status-Active-success)
![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange)
![React](https://img.shields.io/badge/React-19.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)

## ✨ Features

- ⏱️ **Pomodoro Timer** with customizable work/break intervals
- 📝 **Task Management** (Todo list with Pomodoro tracking)
- 📊 **Statistics & Analytics** (Track your productivity over time)
- 🎨 **Beautiful UI** with gradient effects and smooth animations
- ⚙️ **Customizable Settings** (Multiple timer presets)
- 🔄 **Real-time Sync** with Firebase Firestore
- 📱 **Responsive Design** (Works on desktop and mobile)
- 🔥 **Streak Tracking** (Maintain your daily study streak)

## 🎯 Timer Presets

- **Classic**: 25min work / 5min short break / 15min long break
- **Short**: 15min work / 3min short break / 10min long break
- **Deep**: 50min work / 10min short break / 30min long break

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Firebase SDK** - Firestore integration
- **Lucide Icons** - Beautiful icons

### Backend
- **FastAPI** - Python web framework
- **Firebase Admin SDK** - Server-side Firebase
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Database
- **Firebase Firestore** - NoSQL cloud database

## 📦 Project Structure

```
pomodoro-app/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Firebase configuration
│   │   ├── utils/         # Helper functions
│   │   └── hooks/         # Custom React hooks
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # FastAPI application
│   ├── server.py          # Main API server
│   ├── firebase_config.py # Firebase setup
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Container config for deployment
│
├── LOCAL_SETUP.md        # Local development guide
├── DEPLOYMENT.md         # Firebase deployment guide
├── firebase.json         # Firebase hosting config
└── .firebaserc           # Firebase project config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.9+
- Firebase account
- Git

### Local Development

**Full setup guide**: See [LOCAL_SETUP.md](./LOCAL_SETUP.md)

**Quick start:**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pomodoro-app
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   yarn install
   ```

3. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python -m uvicorn server:app --reload --host 127.0.0.1 --port 8001
   
   # Terminal 2 - Frontend
   cd frontend
   yarn start
   ```

4. **Open** http://localhost:3000

## 🌐 Deployment

### Firebase Hosting (Frontend) + Cloud Run (Backend)

**Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick deploy:**

```bash
# Frontend to Firebase Hosting
cd frontend
yarn build
cd ..
firebase deploy --only hosting

# Backend to Cloud Run
cd backend
gcloud run deploy pomodoro-backend --source .
```

Your app will be live at: `https://pomodoro-app-f1472.web.app`

## 📊 API Endpoints

### Core Endpoints
- `GET /api/` - Health check
- `GET /api/status` - Get system status

### Sessions
- `POST /api/sessions` - Save Pomodoro session
- `GET /api/sessions` - Get all sessions

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update settings

### Todos
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo

## 🔥 Firebase Setup

This app uses Firebase Firestore for data storage. All collections:

- **settings** - User preferences and timer presets
- **pomodoro_sessions** - Completed work sessions
- **todos** - Task list items

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // Update with auth later
    }
  }
}
```

## 🎨 Features in Detail

### Timer
- Multiple preset configurations
- Visual progress indicator
- Session counter
- Audio notifications (coming soon)
- Auto-switching between work/break modes

### Statistics
- Daily/weekly/monthly views
- Total focus time
- Session count
- Productivity trends
- Streak tracking

### Todos
- Create and manage tasks
- Estimate Pomodoros per task
- Track completed Pomodoros
- Mark tasks as complete
- Sync across devices

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
yarn test
```

### Code Formatting
```bash
# Backend (Python)
black backend/
isort backend/

# Frontend (JavaScript)
cd frontend
yarn format
```

## 🔐 Environment Variables

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_FIREBASE_API_KEY=your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Backend
Firebase service account JSON file required at:
`backend/firebase-service-account.json`

## 📱 Screenshots

(Add your app screenshots here)

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ using Emergent AI
- Pomodoro Technique® by Francesco Cirillo
- Icons by Lucide
- UI components by Radix UI

## 📞 Support

Having issues? Check out:
- [LOCAL_SETUP.md](./LOCAL_SETUP.md) - Local development guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- Firebase Docs: https://firebase.google.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com/

## 🗺️ Roadmap

- [ ] User authentication (Firebase Auth)
- [ ] Audio notifications
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)
- [ ] Export data feature
- [ ] Integration with Google Calendar
- [ ] Team features and collaboration
- [ ] Browser notifications
- [ ] Offline support with PWA

## 💡 Tips for Daily Use

1. **Morning routine**: Set your daily goal in Settings
2. **Work session**: Start timer, minimize distractions
3. **Break time**: Actually take breaks! Stand up, stretch
4. **Evening**: Check Statistics to see your progress
5. **Consistency**: Try to maintain your streak!

---

**Made with 🍅 by [Your Name]**

*Stay focused, stay productive!*

