
import React from 'react';
import { AlertTriangle, Trash2, X, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 size={32} />;
      case 'warning': return <AlertTriangle size={32} />;
      default: return <HelpCircle size={32} />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'warning': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-none';
      default: return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 animate-in zoom-in-95 duration-200 border border-white/10 dark:border-gray-800 relative overflow-hidden">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all">
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className={`p-5 rounded-[2rem] mb-6 ${getColorClass()}`}>
            {getIcon()}
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-3">
            {title}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-10">
            {message}
          </p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose} 
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }} 
              className={`flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${getButtonClass()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
