import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../hooks/use-toast';
import { getSettings, saveSettings, saveSession } from '../utils/firestoreService';
import { useAuth } from './AuthContext';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [timerMode, setTimerMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef(null);
  const [settings, setSettings] = useState({ dailyGoal: 120, currentStreak: 0 });
  const [selectedPreset, setSelectedPreset] = useState('classic');
  const [presets, setPresets] = useState([]);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const [customTimer, setCustomTimer] = useState({ work: 25, shortBreak: 5, longBreak: 15 });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const savedSettings = await getSettings();
        if (savedSettings) {
          setSettings(savedSettings);
          setPresets(savedSettings.presets || [
            { id: 'classic', name: 'Classic', work: 25, shortBreak: 5, longBreak: 15 },
            { id: 'short', name: 'Short', work: 15, shortBreak: 3, longBreak: 10 },
            { id: 'long', name: 'Deep', work: 50, shortBreak: 10, longBreak: 30 }
          ]);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, [user]);

  const getCurrentPreset = useCallback(() => {
    if (selectedPreset === 'custom') {
      return customTimer;
    }
    return presets.find(p => p.id === selectedPreset) || presets[0] || { work: 25, shortBreak: 5, longBreak: 15 };
  }, [presets, selectedPreset, customTimer]);

  const saveStudySession = useCallback(async (minutes) => {
    if (!user || minutes < 1) return;
    
    try {
      const newSession = {
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
        duration: minutes,
        type: timerMode,
        preset: selectedPreset,
        timestamp: Date.now()
      };
      
      await saveSession(newSession);
      
      const lastDate = settings.lastStudyDate;
      const todayStr = new Date().toDateString();
      
      if (!lastDate || new Date(lastDate).toDateString() !== todayStr) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const isConsecutive = lastDate && new Date(lastDate).toDateString() === yesterday;
        
        const newSettings = {
          ...settings,
          currentStreak: isConsecutive ? settings.currentStreak + 1 : 1,
          lastStudyDate: new Date().toISOString()
        };
        setSettings(newSettings);
        await saveSettings(newSettings);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive"
      });
    }
  }, [user, timerMode, selectedPreset, settings, toast]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    const preset = getCurrentPreset();
    
    if (timerMode === 'work') {
      setSessionsCompleted(prev => {
        const newCount = prev + 1;
        
        const workMinutes = preset.work;
        saveStudySession(workMinutes);
        
        if (newCount % 4 === 0) {
          setTimerMode('longBreak');
          setTimeLeft(preset.longBreak * 60);
          toast({
            title: "Great work!",
            description: `Time for a ${preset.longBreak} minute long break`
          });
        } else {
          setTimerMode('shortBreak');
          setTimeLeft(preset.shortBreak * 60);
          toast({
            title: "Session complete!",
            description: `Time for a ${preset.shortBreak} minute break`
          });
        }
        
        return newCount;
      });
    } else {
      setTimerMode('work');
      setTimeLeft(preset.work * 60);
      toast({
        title: "Break over!",
        description: "Ready to focus again?"
      });
    }
  }, [timerMode, getCurrentPreset, saveStudySession, toast]);

  useEffect(() => {
    if (isRunning) {
      const preset = getCurrentPreset();
      const totalSeconds = timerMode === 'work' 
        ? preset.work * 60 
        : timerMode === 'shortBreak' 
        ? preset.shortBreak * 60 
        : preset.longBreak * 60;
      
      startTimeRef.current = Date.now();
      endTimeRef.current = startTimeRef.current + (timeLeft * 1000);
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remainingMs = endTimeRef.current - now;
        
        if (remainingMs <= 0) {
          setTimeLeft(0);
          handleTimerComplete();
          return;
        }
        
        setTimeLeft(Math.ceil(remainingMs / 1000));
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        
        if (timerMode === 'work' && startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
          if (elapsed >= 1) {
            saveStudySession(elapsed);
          }
        }
        startTimeRef.current = null;
        endTimeRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTimerComplete, timerMode, saveStudySession, getCurrentPreset, timeLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const preset = getCurrentPreset();
    setTimeLeft(preset.work * 60);
    setTimerMode('work');
  };

  const handlePresetChange = (presetId) => {
    if (isRunning) {
      toast({
        title: "Timer is running",
        description: "Please stop the timer before changing presets",
        variant: "destructive"
      });
      return;
    }
    setSelectedPreset(presetId);
    
    if (presetId === 'custom') {
      setTimeLeft(customTimer.work * 60);
    } else {
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        setTimeLeft(preset.work * 60);
      }
    }
    setTimerMode('work');
  };

  const handleCustomTimerChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 1 || numValue > 180) {
      toast({
        title: "Invalid time",
        description: "Please enter a value between 1 and 180 minutes",
        variant: "destructive"
      });
      return;
    }
    
    const newCustomTimer = { ...customTimer, [field]: numValue };
    setCustomTimer(newCustomTimer);
    
    if (field === 'work' && timerMode === 'work' && !isRunning) {
      setTimeLeft(numValue * 60);
    }
  };

  const value = {
    timerMode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    settings,
    selectedPreset,
    presets,
    customTimer,
    toggleTimer,
    resetTimer,
    handlePresetChange,
    handleCustomTimerChange,
    getCurrentPreset
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
