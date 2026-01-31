
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
    info: <Info className="text-indigo-500" size={20} />
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800',
    error: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-800',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-800',
    info: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-800'
  };

  return (
    <div className={`flex items-start gap-4 p-4 rounded-[1.25rem] border shadow-2xl animate-in slide-in-from-right-full duration-300 pointer-events-auto ${bgColors[toast.type]}`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white leading-tight">{toast.title}</h4>
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase leading-snug">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => (
  <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 w-80 pointer-events-none">
    {toasts.map(t => <Toast key={t.id} toast={t} onRemove={onRemove} />)}
  </div>
);

export default Toast;
