import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Timer, CheckSquare, BarChart3, Settings } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#13131a]/80 backdrop-blur-xl border-r border-[#22d3ee]/10 z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Focus Flow</h1>
              <p className="text-xs text-gray-500 font-mono">v2.0</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </NavLink>
            
            <NavLink
              to="/timer"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'
                }`
              }
            >
              <Timer className="w-5 h-5" />
              <span className="font-medium">Timer</span>
            </NavLink>
            
            <NavLink
              to="/todos"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'
                }`
              }
            >
              <CheckSquare className="w-5 h-5" />
              <span className="font-medium">Tasks</span>
            </NavLink>
            
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Statistics</span>
            </NavLink>
            
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:bg-[#1a1a24] hover:text-gray-200'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </nav>
        </div>
        
        {/* Status indicator */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a24] rounded-lg border border-[#22d3ee]/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 font-mono">SYSTEM ACTIVE</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen relative z-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;