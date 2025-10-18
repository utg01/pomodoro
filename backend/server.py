from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from firebase_config import get_firestore_client
from auth_middleware import get_current_user, get_current_user_optional


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firestore connection
db = get_firestore_client()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Pomodoro Models
class PomodoroSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default_user"  # For now, single user. Add auth later
    date: str
    duration: int
    type: str  # 'work', 'shortBreak', 'longBreak'
    preset: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PomodoroSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = "default_user"
    daily_goal: int = 120
    current_streak: int = 0
    last_study_date: Optional[str] = None
    presets: List[dict] = Field(default_factory=lambda: [
        {"id": "classic", "name": "Classic", "work": 25, "shortBreak": 5, "longBreak": 15},
        {"id": "short", "name": "Short", "work": 15, "shortBreak": 3, "longBreak": 10},
        {"id": "long", "name": "Deep", "work": 50, "shortBreak": 10, "longBreak": 30}
    ])

class Todo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default_user"
    title: str
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    pomodoros_estimated: int = 1
    pomodoros_completed: int = 0

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Pomodoro App API - Firebase Edition", "status": "running"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    db.collection('status_checks').document(status_obj.id).set(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    docs = db.collection('status_checks').stream()
    status_checks = []
    
    for doc in docs:
        data = doc.to_dict()
        if isinstance(data.get('timestamp'), str):
            data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        status_checks.append(data)
    
    return status_checks

# Pomodoro Session Endpoints
@api_router.post("/sessions", response_model=PomodoroSession)
async def create_session(session: PomodoroSession):
    doc = session.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    db.collection('pomodoro_sessions').document(session.id).set(doc)
    return session

@api_router.get("/sessions", response_model=List[PomodoroSession])
async def get_sessions(user_id: str = "default_user"):
    docs = db.collection('pomodoro_sessions').where('user_id', '==', user_id).stream()
    sessions = []
    
    for doc in docs:
        data = doc.to_dict()
        if isinstance(data.get('timestamp'), str):
            data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        sessions.append(data)
    
    return sessions

# Settings Endpoints
@api_router.get("/settings", response_model=PomodoroSettings)
async def get_settings(user_id: str = "default_user"):
    doc = db.collection('settings').document(user_id).get()
    
    if doc.exists:
        return doc.to_dict()
    else:
        # Return default settings
        default_settings = PomodoroSettings()
        return default_settings

@api_router.post("/settings", response_model=PomodoroSettings)
async def update_settings(settings: PomodoroSettings):
    doc = settings.model_dump()
    db.collection('settings').document(settings.user_id).set(doc, merge=True)
    return settings

# Todo Endpoints
@api_router.post("/todos", response_model=Todo)
async def create_todo(todo: Todo):
    doc = todo.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    db.collection('todos').document(todo.id).set(doc)
    return todo

@api_router.get("/todos", response_model=List[Todo])
async def get_todos(user_id: str = "default_user"):
    docs = db.collection('todos').where('user_id', '==', user_id).stream()
    todos = []
    
    for doc in docs:
        data = doc.to_dict()
        if isinstance(data.get('created_at'), str):
            data['created_at'] = datetime.fromisoformat(data['created_at'])
        todos.append(data)
    
    return todos

@api_router.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: str, todo: Todo):
    doc = todo.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    db.collection('todos').document(todo_id).set(doc)
    return todo

@api_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    db.collection('todos').document(todo_id).delete()
    return {"message": "Todo deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)