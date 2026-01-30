
import React from 'react';
import { CreditCard, Banknote, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (method: 'Cash' | 'Card') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, total, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 dark:border-gray-800 transition-all">
        
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Payment Port</h3>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Select Tender Method</p>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 text-center">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 mb-10 border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Final Settlement</p>
                <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                    <span className="text-2xl mr-1">₨</span>{total.toLocaleString()}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                <button
                    onClick={() => onConfirm('Card')}
                    className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-gray-100 dark:border-gray-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group bg-white dark:bg-gray-900 active:scale-95"
                >
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <CreditCard size={32} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-indigo-600">Digital Card</span>
                </button>

                <button
                    onClick={() => onConfirm('Cash')}
                    className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-gray-100 dark:border-gray-800 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group bg-white dark:bg-gray-900 active:scale-95"
                >
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                        <Banknote size={32} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-emerald-600">Physical Cash</span>
                </button>
            </div>
        </div>

        <div className="px-10 py-6 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-center gap-3 text-gray-400">
            <ShieldCheck size={16} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Secure POS Transmission</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
