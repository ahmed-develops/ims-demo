import React, { useState, useMemo } from 'react';
import { Search, Eye, Calendar, DollarSign, RotateCcw, Download, Printer } from 'lucide-react';
import { Transaction, TransactionType } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  onViewReceipt: (transaction: Transaction) => void;
  onReturn?: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onViewReceipt, onReturn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Exact string comparison for business dates (YYYY-MM-DD)
      const inRange = t.businessDate >= startDate && t.businessDate <= endDate;
      
      return matchesSearch && inRange;
    });
  }, [transactions, searchTerm, startDate, endDate]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Order Ledger</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Multi-Channel Sales & Returns</p>
            </div>
            <div className="flex gap-3 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center px-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">From</span>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none dark:text-white" />
                </div>
                <div className="w-px h-6 bg-gray-100 dark:bg-gray-800 mx-1"></div>
                <div className="flex items-center px-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">To</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none dark:text-white" />
                </div>
            </div>
        </header>

        <div className="relative print:hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Find Transactions, Customers, ID..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 font-black text-xs uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
            />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b border-gray-50 dark:border-gray-800">
                    <tr>
                        <th className="p-6">Timestamp & ID</th>
                        <th className="p-6">Stream</th>
                        <th className="p-6">Client / Label</th>
                        <th className="p-6 text-right">Net Value</th>
                        <th className="p-6 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filtered.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                            <td className="p-6">
                                <div className="text-[11px] font-black dark:text-white uppercase leading-tight">{new Date(t.date).toLocaleDateString()}</div>
                                <div className="text-[9px] font-mono font-bold text-indigo-500 mt-0.5 uppercase">ID: {t.id}</div>
                            </td>
                            <td className="p-6">
                                <div className="flex flex-col gap-1 items-start">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.type === TransactionType.Return ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                        {t.type}
                                    </span>
                                    {t.isReturned && (
                                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                                            Returned
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="p-6 text-[11px] font-bold dark:text-gray-300 uppercase tracking-tighter">
                                {t.customer?.name || t.recipientName || 'Walk-in Guest'}
                            </td>
                            <td className={`p-6 text-right font-black text-sm tracking-tighter ${t.total < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                ₨ {t.total.toLocaleString()}
                            </td>
                            <td className="p-6 text-center">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => onViewReceipt(t)} className="p-2 text-gray-400 hover:text-indigo-600 transition-all"><Eye size={18} /></button>
                                    {t.type === TransactionType.Sale && onReturn && !t.isReturned && (
                                        <button onClick={() => onReturn(t)} className="p-2 text-gray-400 hover:text-red-500 transition-all" title="Return/Exchange"><RotateCcw size={18} /></button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-20 text-center text-gray-300 font-black uppercase text-[10px] tracking-widest opacity-50">No logs matching audit scope</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
export default TransactionList;