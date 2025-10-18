import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';

const USER_ID = 'default_user'; // Single user for now

// Settings
export const saveSettings = async (settings) => {
  try {
    await setDoc(doc(db, 'settings', USER_ID), settings, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const getSettings = async () => {
  try {
    const docRef = doc(db, 'settings', USER_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Return default settings
      const defaultSettings = {
        dailyGoal: 120,
        currentStreak: 0,
        lastStudyDate: null,
        presets: [
          { id: 'classic', name: 'Classic', work: 25, shortBreak: 5, longBreak: 15 },
          { id: 'short', name: 'Short', work: 15, shortBreak: 3, longBreak: 10 },
          { id: 'long', name: 'Deep', work: 50, shortBreak: 10, longBreak: 30 }
        ]
      };
      await saveSettings(defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

// Study Sessions
export const saveSession = async (session) => {
  try {
    const sessionData = {
      ...session,
      user_id: USER_ID,
      timestamp: new Date().toISOString()
    };
    
    const sessionId = session.id || `session_${Date.now()}`;
    await setDoc(doc(db, 'pomodoro_sessions', sessionId), sessionData);
    return true;
  } catch (error) {
    console.error('Error saving session:', error);
    return false;
  }
};

export const getSessions = async () => {
  try {
    const q = query(collection(db, 'pomodoro_sessions'), where('user_id', '==', USER_ID));
    const querySnapshot = await getDocs(q);
    
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    
    return sessions;
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
};

// Todos
export const saveTodo = async (todo) => {
  try {
    const todoData = {
      ...todo,
      user_id: USER_ID,
      created_at: todo.created_at || new Date().toISOString()
    };
    
    const todoId = todo.id || `todo_${Date.now()}`;
    await setDoc(doc(db, 'todos', todoId), todoData);
    return todoId;
  } catch (error) {
    console.error('Error saving todo:', error);
    return null;
  }
};

export const getTodos = async () => {
  try {
    const q = query(collection(db, 'todos'), where('user_id', '==', USER_ID));
    const querySnapshot = await getDocs(q);
    
    const todos = [];
    querySnapshot.forEach((doc) => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    
    return todos;
  } catch (error) {
    console.error('Error getting todos:', error);
    return [];
  }
};

export const updateTodo = async (todoId, updates) => {
  try {
    const todoRef = doc(db, 'todos', todoId);
    await setDoc(todoRef, updates, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating todo:', error);
    return false;
  }
};

export const deleteTodo = async (todoId) => {
  try {
    await deleteDoc(doc(db, 'todos', todoId));
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    return false;
  }
};

// Real-time listeners
export const subscribeToSettings = (callback) => {
  const docRef = doc(db, 'settings', USER_ID);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const subscribeToTodos = (callback) => {
  const q = query(collection(db, 'todos'), where('user_id', '==', USER_ID));
  return onSnapshot(q, (querySnapshot) => {
    const todos = [];
    querySnapshot.forEach((doc) => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    callback(todos);
  });
};
