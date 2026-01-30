
import React, { useMemo, useState } from 'react';
import { ShiftRecord, CashierUser, UserRole } from '../../types';
import { User, Calendar, Clock, Banknote, CreditCard, Filter, RefreshCcw, Search, Users, TrendingUp, Plus, Pencil, Trash2, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import UserModal from './UserModal';
import ConfirmationModal from '../UI/ConfirmationModal';

interface CashierDashboardProps {
  shiftHistory: ShiftRecord[];
  users: CashierUser[];
  onAddUser: (user: CashierUser) => void;
  onEditUser: (user: CashierUser) => void;
  onDeleteUser: (id: string) => void;
  currentUserRole?: UserRole | null;
}

type Tab = 'Performance' | 'Staff';

const CashierDashboard: React.FC<CashierDashboardProps> = ({ shiftHistory, users, onAddUser, onEditUser, onDeleteUser, currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Performance');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CashierUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<CashierUser | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCashier, setSelectedCashier] = useState<string>('All');
  const [selectedShift, setSelectedShift] = useState<string>('All');

  const isReadOnly = currentUserRole === 'Viewer';

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const uniqueCashierNames = useMemo(() => {
    const names = new Set(shiftHistory.map(s => s.cashierName));
    return Array.from(names);
  }, [shiftHistory]);

  const filteredHistory = useMemo(() => {
    return shiftHistory.filter(record => {
      // Use string comparison for robust YYYY-MM-DD filtering
      if (startDate && record.businessDate < startDate) return false;
      if (endDate && record.businessDate > endDate) return false;
      if (selectedCashier !== 'All' && record.cashierName !== selectedCashier) return false;
      if (selectedShift !== 'All' && record.shift !== selectedShift) return false;
      return true;
    });
  }, [shiftHistory, startDate, endDate, selectedCashier, selectedShift]);

  const salesByCashier = useMemo(() => {
    const acc: Record<string, { total: number; count: number }> = {};
    filteredHistory.forEach(s => {
      if (!acc[s.cashierName]) {
        acc[s.cashierName] = { total: 0, count: 0 };
      }
      acc[s.cashierName].total += s.totalSales;
      acc[s.cashierName].count += s.transactionCount;
    });
    return Object.entries(acc).map(([name, data]) => ({ name, ...data }));
  }, [filteredHistory]);

  const salesByDay = useMemo(() => {
    const acc: Record<string, number> = {};
    filteredHistory.forEach(s => {
      if (!acc[s.businessDate]) acc[s.businessDate] = 0;
      acc[s.businessDate] += s.totalSales;
    });
    return Object.entries(acc)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, total]) => ({ date, total }));
  }, [filteredHistory]);

  const filteredTotals = useMemo(() => {
    return filteredHistory.reduce((acc, curr) => ({
      sales: acc.sales + curr.totalSales,
      txns: acc.txns + curr.transactionCount
    }), { sales: 0, txns: 0 });
  }, [filteredHistory]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCashier('All');
    setSelectedShift('All');
  };

  const handleOpenAdd = () => {
    if (isReadOnly) return;
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: CashierUser) => {
    if (isReadOnly) return;
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete && !isReadOnly) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Access & Audits</h1>
                <div className="flex items-center gap-1 mt-3 p-1 bg-gray-200/50 dark:bg-gray-800 rounded-lg w-fit border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('Performance')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Performance' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <TrendingUp size={14} />
                        Performance
                    </button>
                    <button 
                        onClick={() => setActiveTab('Staff')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Staff' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users size={14} />
                        Staff List
                    </button>
                </div>
            </div>
            
            {activeTab === 'Performance' && (
                <div className="flex gap-4">
                    <div className="px-5 py-3 bg-indigo-600 text-white rounded-[1.25rem] shadow-xl shadow-indigo-100 dark:shadow-none">
                        <p className="text-[9px] uppercase font-black tracking-widest opacity-80 mb-1">Filter Revenue</p>
                        <p className="text-2xl font-black tracking-tighter">₨ {filteredTotals.sales.toLocaleString()}</p>
                    </div>
                     <div className="px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-[1.25rem] shadow-sm">
                        <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 mb-1">Trans Vol</p>
                        <p className="text-2xl font-black tracking-tighter">{filteredTotals.txns}</p>
                    </div>
                </div>
            )}

            {activeTab === 'Staff' && (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Find staff members..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 w-48 md:w-64 transition-all"
                        />
                    </div>
                    {!isReadOnly && (
                      <button 
                          onClick={handleOpenAdd}
                          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                      >
                          <Plus size={16} />
                          Add Cashier
                      </button>
                    )}
                </div>
            )}
        </header>

        {activeTab === 'Performance' ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-5 items-end md:items-center">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mr-2">
                    <Filter size={18} />
                    <span>Audit Scope</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Starts</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Ends</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Actor</label>
                        <select value={selectedCashier} onChange={(e) => setSelectedCashier(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none appearance-none cursor-pointer">
                            <option value="All">All Cashiers</option>
                            {uniqueCashierNames.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Slot</label>
                        <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none appearance-none cursor-pointer">
                            <option value="All">All Shifts</option>
                            <option value="Morning">Morning</option>
                            <option value="Night">Night</option>
                        </select>
                    </div>
                </div>
                <button onClick={clearFilters} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all" title="Reset Filters"><RefreshCcw size={18} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col h-[450px]">
                    <div className="flex items-center gap-3 mb-8 shrink-0">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"><User size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Sales Breakdown</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Per Cashier Performance Profile</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {salesByCashier.map((c, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center font-black text-lg text-indigo-600 dark:text-indigo-400">{c.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white uppercase text-sm tracking-tight">{c.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.count} trans processed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg tracking-tighter">₨ {c.total.toLocaleString()}</p>
                                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 ml-auto overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(c.total / Math.max(...salesByCashier.map(x => x.total))) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col h-[450px]">
                    <div className="flex items-center gap-3 mb-8 shrink-0">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Calendar size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Timeline Ledger</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Aggregate Revenue By Business Date</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {salesByDay.map((d, idx) => (
                             <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-xl group">
                                <span className="font-black text-gray-400 group-hover:text-gray-600 transition-colors text-[11px] uppercase tracking-[0.2em]">{d.date}</span>
                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm tracking-tighter">₨ {d.total.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                 <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><Clock size={22} /></div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Shift Lifecycle History</h2>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 text-[10px] uppercase text-gray-400 font-black tracking-[0.2em]">
                            <tr>
                                <th className="p-5">Business Date</th>
                                <th className="p-5">Staff Identity</th>
                                <th className="p-5">Slot</th>
                                <th className="p-5 text-center">Duration</th>
                                <th className="p-5 text-right">Cash Out</th>
                                <th className="p-5 text-right">Card Out</th>
                                <th className="p-5 text-right">Gross Intake</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredHistory.map((s) => {
                                 const durationMs = s.endTime.getTime() - s.startTime.getTime();
                                 const h = Math.floor(durationMs / 3600000);
                                 const m = Math.floor((durationMs % 3600000) / 60000);
                                return (
                                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-5 font-mono text-[11px] font-black text-gray-600 dark:text-gray-400">{s.businessDate}</td>
                                        <td className="p-5 font-black text-xs text-gray-900 dark:text-white uppercase">{s.cashierName}</td>
                                        <td className="p-5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${s.shift === 'Morning' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>{s.shift}</span>
                                        </td>
                                        <td className="p-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">{h}h {m}m</td>
                                        <td className="p-5 text-right font-mono text-xs text-gray-500">{s.cashSales.toLocaleString()}</td>
                                        <td className="p-5 text-right font-mono text-xs text-gray-500">{s.cardSales.toLocaleString()}</td>
                                        <td className="p-5 text-right font-black text-gray-900 dark:text-white text-sm tracking-tighter">₨ {s.totalSales.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                     </table>
                 </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in duration-300">
             <div className="p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Organization Roster</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Foundational Access & Identity Management</p>
                    </div>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 text-[10px] uppercase text-gray-400 font-black tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Employee Persona</th>
                            <th className="p-6">System Identity</th>
                            <th className="p-6">Permission Level</th>
                            {!isReadOnly && <th className="p-6 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg ${user.role === 'Admin' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {user.fullName.charAt(0)}
                                        </div>
                                        <span className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{user.fullName}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-xs text-gray-600 dark:text-gray-400 font-mono font-bold tracking-widest">
                                    @{user.username}
                                </td>
                                <td className="p-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] ${user.role === 'Admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                        {user.role === 'Admin' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                {!isReadOnly && (
                                  <td className="p-6 text-right">
                                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                          <button 
                                              onClick={() => handleOpenEdit(user)}
                                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                              title="Edit Staff Member"
                                          >
                                              <Pencil size={18} />
                                          </button>
                                          <button 
                                              onClick={() => setUserToDelete(user)}
                                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                              title="Remove Staff Member"
                                          >
                                              <Trash2 size={18} />
                                          </button>
                                      </div>
                                  </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
          </div>
        )}
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={editingUser ? onEditUser : onAddUser}
        user={editingUser}
      />

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Revoke Access?"
        message={`Are you sure you want to remove "${userToDelete?.fullName}"? This will immediately disable their store access.`}
        confirmText="Confirm"
        type="danger"
      />
    </div>
  );
};

export default CashierDashboard;
