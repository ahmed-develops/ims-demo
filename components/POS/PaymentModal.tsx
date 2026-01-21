import React from 'react';
import { CreditCard, Banknote, X, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (method: 'Cash' | 'Card') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, total, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 transition-colors duration-200">
        
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select payment method</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Amount</div>
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-8">₨ {total.toFixed(2)}</div>
            
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onConfirm('Card')}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group bg-white dark:bg-gray-800"
                >
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <CreditCard size={24} />
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Card</span>
                </button>

                <button
                    onClick={() => onConfirm('Cash')}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group bg-white dark:bg-gray-800"
                >
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Banknote size={24} />
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Cash</span>
                </button>
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700">
            Secure Transaction Encrypted
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;