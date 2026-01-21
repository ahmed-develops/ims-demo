import React from 'react';
import { Transaction, SessionInfo } from '../../types';
import { X, Clock, DollarSign, CreditCard, Banknote, Calendar } from 'lucide-react';

interface EndShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEndShift: () => void;
  sessionInfo: SessionInfo;
  transactions: Transaction[];
}

const EndShiftModal: React.FC<EndShiftModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirmEndShift, 
  sessionInfo, 
  transactions 
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const durationMs = now.getTime() - sessionInfo.startTime.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  // Filter transactions for this session
  // In a real app, this would query backend. Here we filter by time > sessionStart
  const sessionTransactions = transactions.filter(t => t.date >= sessionInfo.startTime);

  const totalSales = sessionTransactions.reduce((acc, t) => acc + t.total, 0);
  const cashSales = sessionTransactions.filter(t => t.paymentMethod === 'Cash').reduce((acc, t) => acc + t.amountPaid, 0);
  const cardSales = sessionTransactions.filter(t => t.paymentMethod === 'Card').reduce((acc, t) => acc + t.amountPaid, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transition-colors duration-200">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">End Shift Report</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Review your session details</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Time Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                        <Clock size={18} />
                        <span className="text-xs font-bold uppercase">Duration</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {hours}h {minutes}m
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {sessionInfo.startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - Now
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                        <DollarSign size={18} />
                        <span className="text-xs font-bold uppercase">Total Sales</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                        ₨ {totalSales.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {sessionTransactions.length} Transactions
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Payment Breakdown</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-emerald-600 dark:text-emerald-400 shadow-sm">
                                <Banknote size={18} />
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">Cash Collected</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">₨ {cashSales.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm">
                                <CreditCard size={18} />
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">Card Payments</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">₨ {cardSales.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg flex gap-3 text-amber-700 dark:text-amber-400 text-sm">
                <Calendar size={18} className="shrink-0" />
                <p>Ending this shift will log you out. Ensure all transactions are completed.</p>
            </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex gap-4">
            <button 
                onClick={onClose}
                className="flex-1 py-3 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={onConfirmEndShift}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
            >
                End Shift & Logout
            </button>
        </div>
      </div>
    </div>
  );
};

export default EndShiftModal;