import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';
import { getSettings, saveSettings, saveSession } from '../utils/firestoreService';
import { useAuth } from '../contexts/AuthContext';

const Timer = () => {
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

  const saveStudySession = useCallback(async (minutes) => {
    if (!user) return;
    
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
  }, [timerMode, presets, selectedPreset, saveStudySession, toast]);

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
  }, [isRunning, handleTimerComplete, timerMode, saveStudySession]);

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

  const getModeColor = () => {
    if (timerMode === 'work') return 'from-cyan-500 to-blue-500';
    if (timerMode === 'shortBreak') return 'from-green-500 to-emerald-500';
    return 'from-purple-500 to-pink-500';
  };

  const getModeLabel = () => {
    if (timerMode === 'work') return 'FOCUS MODE';
    if (timerMode === 'shortBreak') return 'SHORT BREAK';
    return 'LONG BREAK';
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 relative z-0">
      <Toaster />
      
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">Pomodoro Timer</h1>
        <p className="text-gray-400 font-mono text-xs sm:text-sm">Deep focus starts here</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Preset Selector */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 md:mb-8">
          {presets.map(preset => (
            <Button
              key={preset.id}
              variant={selectedPreset === preset.id ? 'default' : 'outline'}
              onClick={() => handlePresetChange(preset.id)}
              className={`${
                selectedPreset === preset.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent'
                  : 'bg-[#13131a]/50 text-gray-400 border-[#22d3ee]/20 hover:border-[#22d3ee]/40 hover:text-white'
              } font-mono`}
            >
              {preset.name}
            </Button>
          ))}
        </div>

        {/* Timer Card */}
        <Card className="p-6 sm:p-8 md:p-12 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
          
          <div className="relative z-10">
            {/* Mode Badge */}
            <div className="flex justify-center mb-6">
              <div className={`px-6 py-2 rounded-full bg-gradient-to-r ${getModeColor()} text-white font-mono font-bold text-sm shadow-lg`}>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {getModeLabel()}
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <div className="relative mb-8 sm:mb-12 flex items-center justify-center">
              <svg className="w-64 h-64 sm:w-80 sm:h-80" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="#1a1a24"
                  strokeWidth="10"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  strokeDashoffset={`${2 * Math.PI * 85 * (1 - progressPercentage() / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                  className="drop-shadow-lg"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-2 font-mono tracking-tight glow-text">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-mono">
                    Session #{sessionsCompleted + 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 sm:px-12 py-6 sm:py-7 text-base sm:text-lg font-medium rounded-xl shadow-lg shadow-cyan-500/30 border-0"
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
                className="px-6 sm:px-8 py-6 sm:py-7 rounded-xl bg-[#1a1a24] border-[#22d3ee]/20 hover:border-[#22d3ee]/40 text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Session Info */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-4 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 text-center">
            <p className="text-sm text-gray-400 font-mono mb-1">WORK</p>
            <p className="text-2xl font-bold text-white font-mono">{getCurrentPreset().work}m</p>
          </Card>
          <Card className="p-4 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 text-center">
            <p className="text-sm text-gray-400 font-mono mb-1">SHORT</p>
            <p className="text-2xl font-bold text-white font-mono">{getCurrentPreset().shortBreak}m</p>
          </Card>
          <Card className="p-4 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 text-center">
            <p className="text-sm text-gray-400 font-mono mb-1">LONG</p>
            <p className="text-2xl font-bold text-white font-mono">{getCurrentPreset().longBreak}m</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Timer;