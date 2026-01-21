import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, ArrowRight, LogOut, Coffee } from 'lucide-react';
import { getShiftDetails } from '../../utils';

interface StartShiftProps {
  username: string;
  onStartShift: () => void;
  onLogout: () => void;
}

const StartShift: React.FC<StartShiftProps> = ({ username, onStartShift, onLogout }) => {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { shift, businessDate } = getShiftDetails(now);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-200">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4 animate-bounce duration-[2000ms]">
                <Coffee size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hello, {username}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ready to start your work day?</p>
        </div>

        {/* Info Card */}
        <div className="p-8">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 mb-8">
                <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                            <Clock size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Current Time</p>
                            <p className="text-xl font-mono font-semibold text-gray-900 dark:text-white">
                                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                        </div>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white dark:bg-gray-600 rounded-xl shadow-sm border border-gray-100 dark:border-gray-500">
                         <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-2">Shift Type</p>
                         <div className={`flex items-center gap-2 font-bold ${
                             shift === 'Morning' ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'
                         }`}>
                             {shift === 'Morning' ? <Sun size={18} /> : <Moon size={18} />}
                             <span>{shift}</span>
                         </div>
                     </div>
                     <div className="p-4 bg-white dark:bg-gray-600 rounded-xl shadow-sm border border-gray-100 dark:border-gray-500">
                         <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-2">Business Date</p>
                         <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                             <span>{businessDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                         </div>
                     </div>
                </div>
            </div>

            <button 
                onClick={onStartShift}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
                <span>Start Shift</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
                onClick={onLogout}
                className="w-full mt-4 py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center justify-center gap-2"
            >
                <LogOut size={16} />
                <span>Not you? Sign Out</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default StartShift;