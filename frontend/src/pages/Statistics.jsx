import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { BarChart3, Clock, TrendingUp, Calendar } from 'lucide-react';
import { getStorageData } from '../utils/storage';

const Statistics = () => {
  const [sessions, setSessions] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

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

  // Get daily breakdown for the chart
  const getDailyData = () => {
    const dailyMap = {};
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    
    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      dailyMap[dateStr] = 0;
    }
    
    // Fill with actual data
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
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Statistics</h1>
          <p className="text-slate-500">Track your study progress over time</p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-3 mb-6">
          {['week', 'month', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Study Time</p>
                <p className="text-2xl font-bold text-slate-800">{totalHours}h</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Sessions Completed</p>
                <p className="text-2xl font-bold text-slate-800">{totalSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Avg Session</p>
                <p className="text-2xl font-bold text-slate-800">{avgSessionLength}m</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-8 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">Daily Study Time</h2>
          </div>
          
          <div className="space-y-3">
            {dailyData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-slate-600 font-medium">
                  {day.date}
                </div>
                <div className="flex-1 h-10 bg-slate-100 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg transition-all duration-500 flex items-center px-3"
                    style={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                  >
                    {day.minutes > 0 && (
                      <span className="text-sm font-semibold text-white">
                        {day.minutes} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {dailyData.every(d => d.minutes === 0) && (
            <div className="text-center py-12">
              <p className="text-slate-400">No study sessions recorded yet. Start a timer to see your progress!</p>
            </div>
          )}
        </Card>

        {/* Recent Sessions */}
        <Card className="p-8 bg-white border-slate-200 mt-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Recent Sessions</h2>
          <div className="space-y-3">
            {filteredSessions.slice(-10).reverse().map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{session.duration} minutes</p>
                    <p className="text-sm text-slate-500">
                      {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                  {session.preset || 'classic'}
                </div>
              </div>
            ))}
            
            {filteredSessions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No sessions recorded in this time period</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;