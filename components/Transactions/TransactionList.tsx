
import React, { useState } from 'react';
import { Search, Eye, Calendar, CreditCard, DollarSign, Clock, User } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  onViewReceipt: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onViewReceipt }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customer?.phone.includes(searchTerm) ||
    t.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.externalOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cashierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = transactions.reduce((acc, t) => acc + t.amountPaid, 0); 
  const totalReceivables = transactions.reduce((acc, t) => acc + t.balance, 0);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
         <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Transaction History</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review and manage past point-of-sale and outbound activities.</p>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search ID, Order#, Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-48 md:w-64 transition-all"
                />
            </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <DollarSign size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Collected</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                    ₨ {totalRevenue.toFixed(2)}
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                        <Clock size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pending</span>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    ₨ {totalReceivables.toFixed(2)}
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 dark:bg-indigo-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <Calendar size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Transactions</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {transactions.length}
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <CreditCard size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">AOV</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                    ₨ {transactions.length > 0 ? (transactions.reduce((acc, t) => acc + t.total, 0) / transactions.length).toFixed(0) : '0'}
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-50 dark:border-gray-700 text-[10px] uppercase text-gray-400 dark:text-gray-500 font-black tracking-widest">
                    <tr>
                        <th className="p-5">Source & ID</th>
                        <th className="p-5">Type</th>
                        <th className="p-5">Customer / Recipient</th>
                        <th className="p-5">Cashier</th>
                        <th className="p-5 text-right">Total</th>
                        <th className="p-5 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {filtered.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                            <td className="p-5">
                                <div className="flex flex-col">
                                    <span className="text-xs font-mono text-indigo-600 font-black tracking-tight">#{t.id}</span>
                                    {t.externalOrderId && (
                                        <span className="text-[10px] font-bold text-gray-400 mt-0.5 italic">Order: {t.externalOrderId}</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                    t.type === 'Sale' ? 'bg-emerald-50 text-emerald-600' :
                                    t.type === 'Shopify' ? 'bg-indigo-50 text-indigo-600' :
                                    t.type === 'PR' ? 'bg-pink-50 text-pink-600' :
                                    'bg-amber-50 text-amber-600'
                                }`}>
                                    {t.type}
                                </span>
                            </td>
                            <td className="p-5">
                                {t.customer || t.recipientName ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-black text-gray-600 dark:text-gray-300">
                                            {(t.customer?.name || t.recipientName || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{t.customer?.name || t.recipientName}</p>
                                            {t.customer?.phone && <p className="text-[10px] font-mono text-gray-400">{t.customer.phone}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest italic">Guest / No Label</span>
                                )}
                            </td>
                            <td className="p-5">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-indigo-400" />
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t.cashierName}</span>
                                </div>
                            </td>
                             <td className="p-5 text-right font-black text-gray-900 dark:text-white text-base">
                                ₨ {t.total.toLocaleString()}
                                {t.orderDiscount ? <span className="block text-[9px] text-red-500">Disc: {t.orderDiscount}%</span> : null}
                            </td>
                            <td className="p-5 text-center">
                                <button 
                                    onClick={() => onViewReceipt(t)}
                                    className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                                    title="View Receipt"
                                >
                                    <Eye size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-20 text-center text-gray-400 dark:text-gray-600 font-bold italic">
                                No historical transactions match the search criteria.
                            </td>
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
