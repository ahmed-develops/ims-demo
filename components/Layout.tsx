
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Moon, Sun, Clock, CalendarDays, UserCircle, Power, LogOut } from 'lucide-react';
import { ViewState, SessionInfo } from '../types';

export interface NavItem {
  id: ViewState;
  label: string;
  icon: React.ElementType;
}

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onEndShift?: () => void;
  onLogout?: () => void;
  sessionInfo: SessionInfo | null;
  currentUser: string;
  navItems: NavItem[];
}

const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onChangeView, 
  children, 
  isDarkMode, 
  onToggleTheme, 
  onEndShift,
  onLogout,
  sessionInfo,
  currentUser,
  navItems
}) => {
  const [duration, setDuration] = useState<string>('00:00:00');

  // Timer Logic
  useEffect(() => {
    if (!sessionInfo) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - sessionInfo.startTime.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionInfo]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-800 dark:text-gray-200 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-10 transition-colors duration-200">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">NiaMia</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Store #042</p>
          </div>
        </div>

        {/* User Info Card (Different for Session vs Admin) */}
        {sessionInfo ? (
          <div className="mx-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <UserCircle size={16} />
                <span className="text-sm font-bold truncate">{sessionInfo.cashierName}</span>
             </div>
             
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    <span className="font-mono">{duration}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sessionInfo.shift === 'Morning' 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                }`}>
                    {sessionInfo.shift}
                </span>
             </div>

             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                <CalendarDays size={14} />
                <span>
                   {sessionInfo.businessDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
             </div>
          </div>
        ) : (
           <div className="mx-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-1">
                <UserCircle size={18} />
                <span className="font-bold">{currentUser}</span>
             </div>
             <p className="text-xs text-gray-500 dark:text-gray-400">Administrator Access</p>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
            <button 
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg transition-colors text-sm font-medium"
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

          {onEndShift ? (
            <button 
                onClick={onEndShift}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
            >
                <Power size={20} />
                <span>End Shift</span>
            </button>
          ) : (
             <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
          )}
          
          <div className="mt-4 px-4 text-xs text-gray-400 dark:text-gray-600 text-center">
            v1.5.0 &copy; 2025
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
};

export default Layout;