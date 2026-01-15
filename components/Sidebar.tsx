
import React from 'react';
import { User } from '../types';
import { LayoutDashboard, Users, Bell, LogOut, Sun, Moon, UserCircle } from 'lucide-react';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, toggleDarkMode, isDarkMode }) => {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-kist-blue dark:bg-slate-800 text-white shadow-xl z-50 hidden md:flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-kist-gold tracking-tight">KIST Tracker</h1>
        <p className="text-xs text-white/60 mt-1 uppercase font-semibold">Student Information System</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 mb-6">
          <div className="w-10 h-10 rounded-full bg-kist-gold/20 flex items-center justify-center border border-kist-gold/30 overflow-hidden">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="text-kist-gold" size={24} />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.username}</p>
            <p className="text-xs text-white/50">{user.role}</p>
          </div>
        </div>

        <nav className="space-y-1">
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          {user.role === 'ADMIN' && (
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
              <Users size={20} />
              <span>Students</span>
            </button>
          )}
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
            <Bell size={20} />
            <span>Notices</span>
          </button>
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span className="flex items-center space-x-3">
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-300" />}
            <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// Exporting Icons as well for reuse
export { LayoutDashboard, Users, Bell, LogOut, Sun, Moon, UserCircle };
export default Sidebar;
