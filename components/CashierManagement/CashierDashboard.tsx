
import React, { useMemo, useState } from 'react';
import { ShiftRecord, CashierUser, UserRole } from '../../types';
import { User, Calendar, Clock, Banknote, CreditCard, Filter, RefreshCcw, Search, Users, TrendingUp, Plus, Pencil, Trash2, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import UserModal from './UserModal';

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
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cashier Management</h1>
                <div className="flex items-center gap-1 mt-2 p-1 bg-gray-200/50 dark:bg-gray-800 rounded-lg w-fit border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('Performance')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Performance' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <TrendingUp size={16} />
                        Performance
                    </button>
                    <button 
                        onClick={() => setActiveTab('Staff')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Staff' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <Users size={16} />
                        Staff List
                    </button>
                </div>
            </div>
            
            {activeTab === 'Performance' && (
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                        <p className="text-[10px] uppercase font-bold opacity-80">Total Revenue</p>
                        <p className="text-xl font-bold">₨ {filteredTotals.sales.toFixed(0)}</p>
                    </div>
                     <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Transactions</p>
                        <p className="text-xl font-bold">{filteredTotals.txns}</p>
                    </div>
                </div>
            )}

            {activeTab === 'Staff' && (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search staff..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-48 md:w-64 transition-all"
                        />
                    </div>
                    {!isReadOnly && (
                      <button 
                          onClick={handleOpenAdd}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                      >
                          <Plus size={18} />
                          Add Cashier
                      </button>
                    )}
                </div>
            )}
        </header>

        {activeTab === 'Performance' ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mr-2">
                    <Filter size={18} />
                    <span>Filters</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">From Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">To Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Cashier</label>
                        <select value={selectedCashier} onChange={(e) => setSelectedCashier(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="All">All Cashiers</option>
                            {uniqueCashierNames.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Shift</label>
                        <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="All">All Shifts</option>
                            <option value="Morning">Morning</option>
                            <option value="Night">Night</option>
                        </select>
                    </div>
                </div>
                <button onClick={clearFilters} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"><RefreshCcw size={18} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[400px]">
                    <div className="flex items-center gap-3 mb-6 shrink-0">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><User size={20} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales by Cashier</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total revenue generated per employee</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {salesByCashier.map((c, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">{c.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{c.count} transactions</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-indigo-600 dark:text-indigo-400">₨ {c.total.toFixed(0)}</p>
                                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 ml-auto overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.total / Math.max(...salesByCashier.map(x => x.total))) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[400px]">
                    <div className="flex items-center gap-3 mb-6 shrink-0">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Calendar size={20} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Day-wise Sales</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total store revenue by date</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {salesByDay.map((d, idx) => (
                             <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-lg">
                                <span className="font-mono text-gray-600 dark:text-gray-300 text-sm">{d.date}</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">₨ {d.total.toFixed(0)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                 <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Clock size={20} /></div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shift History</h2>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Cashier</th>
                                <th className="p-4">Shift</th>
                                <th className="p-4 text-center">Duration</th>
                                <th className="p-4 text-right">Cash</th>
                                <th className="p-4 text-right">Card</th>
                                <th className="p-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {filteredHistory.map((s) => {
                                 const durationMs = s.endTime.getTime() - s.startTime.getTime();
                                 const h = Math.floor(durationMs / 3600000);
                                 const m = Math.floor((durationMs % 3600000) / 60000);
                                return (
                                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4 font-mono text-gray-600 dark:text-gray-300">{s.businessDate}</td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">{s.cashierName}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${s.shift === 'Morning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>{s.shift}</span>
                                        </td>
                                        <td className="p-4 text-center text-gray-500 dark:text-gray-400">{h}h {m}m</td>
                                        <td className="p-4 text-right font-mono">{s.cashSales.toFixed(0)}</td>
                                        <td className="p-4 text-right font-mono">{s.cardSales.toFixed(0)}</td>
                                        <td className="p-4 text-right font-bold text-gray-900 dark:text-white">₨ {s.totalSales.toFixed(0)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                     </table>
                 </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in duration-300">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Employee Roster</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Showing {filteredUsers.length} staff members</p>
                    </div>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Username</th>
                            <th className="p-4">Role</th>
                            {!isReadOnly && <th className="p-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${user.role === 'Admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
                                            {user.fullName.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">{user.fullName}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                                    {user.username}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800'}`}>
                                        {user.role === 'Admin' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                {!isReadOnly && (
                                  <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                          <button 
                                              onClick={() => handleOpenEdit(user)}
                                              className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                              title="Edit Staff Member"
                                          >
                                              <Pencil size={18} />
                                          </button>
                                          <button 
                                              onClick={() => setUserToDelete(user)}
                                              className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

      {userToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                          <AlertTriangle size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User?</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                      Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-white">"{userToDelete.fullName}"</span>? They will no longer be able to log in.
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setUserToDelete(null)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                      <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none">Delete</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CashierDashboard;
