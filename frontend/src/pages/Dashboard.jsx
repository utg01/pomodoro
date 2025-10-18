import React, { useState, useEffect } from 'react';
import { Clock, Flame, Target, TrendingUp, CheckCircle, Activity, Calendar } from 'lucide-react';
import { Card } from '../components/ui/card';
import { getSettings, getTodos, getSessions } from '../utils/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState({ dailyGoal: 120, currentStreak: 0 });
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [todos, setTodos] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [savedSettings, savedTodos, sessions] = await Promise.all([
        getSettings(),
        getTodos(),
        getSessions()
      ]);
      
      setSettings(savedSettings || { dailyGoal: 120, currentStreak: 0 });
      setTodos(savedTodos || []);
      
      // Calculate today's study time
      const today = new Date().toDateString();
      const todaySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === today);
      const totalMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      setTodayStudyTime(totalMinutes);
      
      // Get recent sessions
      setRecentSessions(sessions.slice(-5).reverse());
      
      // Get weekly data
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const daySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === dateStr);
        const minutes = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        weekData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          minutes
        });
      }
      setWeeklyData(weekData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const pendingTasks = todos.filter(t => !t.completed).length;
  const completedTasks = todos.filter(t => t.completed).length;
  const goalProgress = Math.min(Math.round((todayStudyTime / settings.dailyGoal) * 100), 100);
  const maxWeeklyMinutes = Math.max(...weeklyData.map(d => d.minutes), 1);

  return (
    <div className="p-4 sm:p-6 md:p-8 relative z-0">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">Dashboard</h1>
        <p className="text-gray-400 font-mono text-xs sm:text-sm">Overview of your focus journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Today's Focus */}
        <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 hover:border-[#22d3ee]/40 transition-all card-hover cursor-pointer" onClick={() => navigate('/timer')}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="px-2 py-1 bg-cyan-500/10 rounded-md">
              <span className="text-xs text-cyan-400 font-mono font-semibold">TODAY</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1 font-medium">Focus Time</p>
            <p className="text-3xl font-bold text-white mb-1">{todayStudyTime}<span className="text-lg text-gray-500">min</span></p>
            <p className="text-xs text-gray-500 font-mono">{Math.floor(todayStudyTime / 60)}h {todayStudyTime % 60}m logged</p>
          </div>
        </Card>

        {/* Streak */}
        <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 hover:border-[#22d3ee]/40 transition-all card-hover">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/30">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div className="px-2 py-1 bg-orange-500/10 rounded-md">
              <span className="text-xs text-orange-400 font-mono font-semibold">STREAK</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1 font-medium">Current Streak</p>
            <p className="text-3xl font-bold text-white mb-1">{settings.currentStreak}<span className="text-lg text-gray-500">d</span></p>
            <p className="text-xs text-gray-500 font-mono">Keep it going!</p>
          </div>
        </Card>

        {/* Daily Goal */}
        <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 hover:border-[#22d3ee]/40 transition-all card-hover cursor-pointer" onClick={() => navigate('/settings')}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div className="px-2 py-1 bg-blue-500/10 rounded-md">
              <span className="text-xs text-blue-400 font-mono font-semibold">GOAL</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1 font-medium">Daily Progress</p>
            <p className="text-3xl font-bold text-white mb-1">{goalProgress}<span className="text-lg text-gray-500">%</span></p>
            <div className="w-full bg-[#1a1a24] rounded-full h-1.5 mt-2">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${goalProgress}%` }}></div>
            </div>
          </div>
        </Card>

        {/* Tasks */}
        <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 hover:border-[#22d3ee]/40 transition-all card-hover cursor-pointer" onClick={() => navigate('/todos')}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center border border-green-500/30">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="px-2 py-1 bg-green-500/10 rounded-md">
              <span className="text-xs text-green-400 font-mono font-semibold">TASKS</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1 font-medium">Completed</p>
            <p className="text-3xl font-bold text-white mb-1">{completedTasks}<span className="text-lg text-gray-500">/{todos.length}</span></p>
            <p className="text-xs text-gray-500 font-mono">{pendingTasks} pending tasks</p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Weekly Activity - Takes 2 columns */}
        <div className="col-span-2">
          <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Weekly Activity</h2>
              </div>
              <div className="px-3 py-1 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                <span className="text-xs text-cyan-400 font-mono">LAST 7 DAYS</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm text-gray-400 font-mono font-medium">
                    {day.day}
                  </div>
                  <div className="flex-1 h-10 bg-[#1a1a24] rounded-lg overflow-hidden relative border border-[#22d3ee]/10">
                    {day.minutes > 0 && (
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transition-all duration-500 flex items-center px-3"
                        style={{ width: `${(day.minutes / maxWeeklyMinutes) * 100}%` }}
                      >
                        <span className="text-sm font-semibold text-white font-mono">
                          {day.minutes}m
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Sessions - Takes 1 column */}
        <div className="col-span-1">
          <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 h-full">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
            </div>
            
            <div className="space-y-3">
              {recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm font-mono">No sessions yet</p>
                </div>
              ) : (
                recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg border border-[#22d3ee]/10 hover:border-[#22d3ee]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{session.duration}m</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {new Date(session.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-cyan-500/10 rounded text-xs text-cyan-400 font-mono">
                      {session.preset || 'classic'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card 
          className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border-[#22d3ee]/30 hover:border-[#22d3ee]/60 transition-all cursor-pointer group"
          onClick={() => navigate('/timer')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Start Focus Session</h3>
              <p className="text-sm text-gray-400 font-mono">Begin a new Pomodoro timer</p>
            </div>
            <TrendingUp className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
        </Card>
        
        <Card 
          className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-green-500/30 hover:border-green-500/60 transition-all cursor-pointer group"
          onClick={() => navigate('/todos')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Manage Tasks</h3>
              <p className="text-sm text-gray-400 font-mono">View and organize your todos</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
