import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Clock, TrendingUp, Calendar, Activity } from 'lucide-react';
import { getStorageData } from '../utils/storage';

const Statistics = () => {
  const [sessions, setSessions] = useState([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const savedSessions = getStorageData('studySessions') || [];
    setSessions(savedSessions);
  }, []);

  const getFilteredSessions = () => {
    const now = new Date();
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessionDate >= monthAgo;
      }
      return true;
    });
  };

  const filteredSessions = getFilteredSessions();
  const totalMinutes = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalSessions = filteredSessions.length;
  const avgSessionLength = totalSessions > 0 ? (totalMinutes / totalSessions).toFixed(0) : 0;

  const getDailyData = () => {
    const dailyMap = {};
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      dailyMap[dateStr] = 0;
    }
    
    filteredSessions.forEach(session => {
      const dateStr = new Date(session.date).toDateString();
      if (dailyMap.hasOwnProperty(dateStr)) {
        dailyMap[dateStr] += session.duration;
      }
    });
    
    return Object.entries(dailyMap).map(([date, minutes]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes
    }));
  };

  const dailyData = getDailyData();
  const maxMinutes = Math.max(...dailyData.map(d => d.minutes), 1);

  return (
    <div className="p-8 relative z-0">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">Statistics</h1>
          <p className="text-gray-400 font-mono text-sm">Track your productivity journey</p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-3 mb-6">
          {['week', 'month', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-medium font-mono transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-[#13131a]/50 text-gray-400 border border-[#22d3ee]/20 hover:border-[#22d3ee]/40'
              }`}
            >
              {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono mb-1">Total Study Time</p>
                <p className="text-2xl font-bold text-white">{totalHours}<span className="text-sm text-gray-500">h</span></p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center border border-green-500/30">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono mb-1">Sessions Completed</p>
                <p className="text-2xl font-bold text-white">{totalSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/30">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono mb-1">Avg Session</p>
                <p className="text-2xl font-bold text-white">{avgSessionLength}<span className="text-sm text-gray-500">m</span></p>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-8 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Daily Study Time</h2>
          </div>
          
          <div className="space-y-3">
            {dailyData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-400 font-mono font-medium">
                  {day.date}
                </div>
                <div className="flex-1 h-10 bg-[#1a1a24] rounded-lg overflow-hidden relative border border-[#22d3ee]/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transition-all duration-500 flex items-center px-3"
                    style={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                  >
                    {day.minutes > 0 && (
                      <span className="text-sm font-semibold text-white font-mono">
                        {day.minutes}m
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {dailyData.every(d => d.minutes === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500 font-mono">No study sessions recorded yet</p>
            </div>
          )}
        </Card>

        {/* Recent Sessions */}
        <Card className="p-8 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 mt-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Sessions</h2>
          <div className="space-y-3">
            {filteredSessions.slice(-10).reverse().map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg border border-[#22d3ee]/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white font-mono">{session.duration} minutes</p>
                    <p className="text-sm text-gray-500 font-mono">
                      {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-cyan-500/10 rounded-full text-xs font-mono text-cyan-400 border border-cyan-500/30">
                  {session.preset || 'classic'}
                </div>
              </div>
            ))}
            
            {filteredSessions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 font-mono">No sessions recorded in this time period</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;