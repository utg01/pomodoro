import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Timer, CheckSquare, BarChart3, Settings } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">Focus Flow</h1>
          </div>
          
          <nav className="space-y-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Timer className="w-5 h-5" />
              <span className="font-medium">Timer</span>
            </NavLink>
            
            <NavLink
              to="/todos"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <CheckSquare className="w-5 h-5" />
              <span className="font-medium">Tasks</span>
            </NavLink>
            
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Statistics</span>
            </NavLink>
            
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;