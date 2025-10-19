import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TimerProvider } from './contexts/TimerContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import GlobalFloatingTimer from './components/GlobalFloatingTimer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timer from './pages/Timer';
import TodoList from './pages/TodoList';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <TimerProvider>
            <GlobalFloatingTimer />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="timer" element={<Timer />} />
                <Route path="todos" element={<TodoList />} />
                <Route path="stats" element={<Statistics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </TimerProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;