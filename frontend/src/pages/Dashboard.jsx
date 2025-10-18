import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Flame, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';
import { getStorageData, saveStorageData } from '../utils/storage';

const Dashboard = () => {
  const { toast } = useToast();
  const [timerMode, setTimerMode] = useState('work'); // work, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef(null);
  const [settings, setSettings] = useState({ dailyGoal: 120, currentStreak: 0 });
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('classic');
  const [presets, setPresets] = useState([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Load settings and presets
    const savedSettings = getStorageData('settings') || { dailyGoal: 120, currentStreak: 0, lastStudyDate: null };
    const savedPresets = getStorageData('presets') || [
      { id: 'classic', name: 'Classic Pomodoro', work: 25, shortBreak: 5, longBreak: 15 },
      { id: 'short', name: 'Short Sessions', work: 15, shortBreak: 3, longBreak: 10 },
      { id: 'long', name: 'Long Focus', work: 50, shortBreak: 10, longBreak: 30 }
    ];
    
    setSettings(savedSettings);
    setPresets(savedPresets);
    
    // Calculate today's study time
    const sessions = getStorageData('studySessions') || [];
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);
    const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    setTodayStudyTime(totalMinutes);

    // Update streak
    updateStreak(savedSettings);
  }, []);

  const updateStreak = (currentSettings) => {
    const today = new Date().toDateString();
    const lastDate = currentSettings.lastStudyDate;
    
    if (!lastDate) {
      return;
    }
    
    const lastStudyDate = new Date(lastDate).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastStudyDate !== today && lastStudyDate !== yesterday) {
      // Streak broken
      const newSettings = { ...currentSettings, currentStreak: 0 };
      setSettings(newSettings);
      saveStorageData('settings', newSettings);
    }
  };

  const getCurrentPreset = () => {
    return presets.find(p => p.id === selectedPreset) || presets[0] || { work: 25, shortBreak: 5, longBreak: 15 };
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
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setTimeLeft(preset.work * 60);
      setTimerMode('work');
    }
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        
        // Save study session if it was a work session and some time passed
        if (timerMode === 'work' && startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
          if (elapsed >= 1) {
            saveStudySession(elapsed);
          }
        }
        startTimeRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const saveStudySession = (minutes) => {
    const sessions = getStorageData('studySessions') || [];
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: minutes,
      type: timerMode,
      preset: selectedPreset
    };
    sessions.push(newSession);
    saveStorageData('studySessions', sessions);
    
    // Update today's study time
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);
    const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    setTodayStudyTime(totalMinutes);
    
    // Update streak
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
      saveStorageData('settings', newSettings);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    const preset = getCurrentPreset();
    
    if (timerMode === 'work') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      
      // Save the completed work session
      const workMinutes = preset.work;
      saveStudySession(workMinutes);
      
      // Determine next break
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
    } else {
      setTimerMode('work');
      setTimeLeft(preset.work * 60);
      toast({
        title: "Break over!",
        description: "Ready to focus again?"
      });
    }
    
    // Play notification sound
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVa7n77BdGAg+luLztmQcBjiP1fLNfC0FJHzJ79+RQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZ');
      audio.play().catch(() => {});
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const preset = getCurrentPreset();
    setTimeLeft(preset.work * 60);
    setTimerMode('work');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = () => {
    const preset = getCurrentPreset();
    const totalSeconds = timerMode === 'work' 
      ? preset.work * 60 
      : timerMode === 'shortBreak' 
      ? preset.shortBreak * 60 
      : preset.longBreak * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  return (
    <div className="p-8">
      <Toaster />
      
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Today's Focus</p>
              <p className="text-2xl font-semibold text-slate-800">{todayStudyTime} min</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Current Streak</p>
              <p className="text-2xl font-semibold text-slate-800">{settings.currentStreak} days</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Daily Goal</p>
              <p className="text-2xl font-semibold text-slate-800">{Math.round((todayStudyTime / settings.dailyGoal) * 100)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timer Card */}
      <Card className="p-12 bg-white border-slate-200 shadow-lg max-w-2xl mx-auto">
        {/* Preset Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {presets.map(preset => (
            <Button
              key={preset.id}
              variant={selectedPreset === preset.id ? 'default' : 'outline'}
              onClick={() => handlePresetChange(preset.id)}
              className={selectedPreset === preset.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {preset.name}
            </Button>
          ))}
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <div className={`px-6 py-2 rounded-lg font-medium ${timerMode === 'work' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}`}>
            Focus
          </div>
          <div className={`px-6 py-2 rounded-lg font-medium ${timerMode === 'shortBreak' ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>
            Short Break
          </div>
          <div className={`px-6 py-2 rounded-lg font-medium ${timerMode === 'longBreak' ? 'bg-purple-100 text-purple-700' : 'text-slate-400'}`}>
            Long Break
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-12">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={timerMode === 'work' ? '#10b981' : timerMode === 'shortBreak' ? '#3b82f6' : '#a855f7'}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPercentage() / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl font-bold text-slate-800 mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-slate-500 font-medium">
                Session {sessionsCompleted + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={toggleTimer}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl"
          >
            {isRunning ? (
              <><Pause className="w-6 h-6 mr-2" /> Pause</>
            ) : (
              <><Play className="w-6 h-6 mr-2" /> Start</>
            )}
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={resetTimer}
            className="px-8 py-6 rounded-xl"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;