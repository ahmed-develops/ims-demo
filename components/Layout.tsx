
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
      {/* Sidebar - HIDDEN DURING PRINT */}
      <aside className="no-print w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-10 transition-colors duration-200 print:hidden">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white uppercase leading-none">NiaMia</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black tracking-widest uppercase mt-1">Management</p>
          </div>
        </div>

        {sessionInfo ? (
          <div className="mx-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <UserCircle size={16} />
                <span className="text-xs font-black truncate uppercase tracking-tight">{sessionInfo.cashierName}</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                    <Clock size={14} />
                    <span className="font-mono">{duration}</span>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    sessionInfo.shift === 'Morning' 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                }`}>
                    {sessionInfo.shift}
                </span>
             </div>
          </div>
        ) : (
           <div className="mx-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-1">
                <UserCircle size={18} />
                <span className="text-xs font-black uppercase tracking-tight">{currentUser}</span>
             </div>
             <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Administrator</p>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600'} />
                <span className="font-black text-[10px] uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
            <button 
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-[10px] font-black uppercase tracking-wider"
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{isDarkMode ? 'Light' : 'Dark'} Mode</span>
            </button>

          {onEndShift ? (
            <button 
                onClick={onEndShift}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-[10px] font-black uppercase tracking-wider"
            >
                <Power size={18} />
                <span>End Shift</span>
            </button>
          ) : (
             <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-[10px] font-black uppercase tracking-wider"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content - REMOVE OVERFLOW DURING PRINT */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50 dark:bg-gray-900 print:overflow-visible print:bg-white print:h-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
