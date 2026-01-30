
import React, { useState } from 'react';
import { Customer, Transaction, UserRole } from '../../types';
import { Search, Plus, Pencil, Trash2, Users, AlertTriangle, Award, DollarSign, History, ChevronRight } from 'lucide-react';
import CustomerModal from './CustomerModal';
import ConfirmationModal from '../UI/ConfirmationModal';

interface CustomerListProps {
  customers: Customer[];
  transactions: Transaction[];
  onAddCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  userRole?: UserRole | null;
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  customers, 
  transactions,
  onAddCustomer, 
  onEditCustomer, 
  onDeleteCustomer,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Customer | null>(null);

  const isReadOnly = userRole === 'Viewer';

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    if (isReadOnly) return;
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    if (isReadOnly) return;
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (customer: Customer) => {
    if (editingCustomer) {
      onEditCustomer(customer);
    } else {
      onAddCustomer(customer);
    }
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      onDeleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Tracking</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Monitor profiles, lifetime value, and purchase history.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Name or Phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                     </div>
                     {!isReadOnly && (
                         <button 
                            onClick={handleOpenAdd}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                         >
                            <Plus size={16} />
                            Add Customer
                         </button>
                     )}
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                        <tr>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4 text-center">Loyalty</th>
                            <th className="p-4 text-right">Lifetime Spent</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{customer.name}</div>
                                            <div className="text-[10px] text-gray-400">ID: {customer.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                                    {customer.phone}
                                </td>
                                <td className="p-4 text-center">
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                                        {customer.loyaltyPoints} PTS
                                    </span>
                                </td>
                                <td className="p-4 text-right font-bold text-gray-900 dark:text-white">
                                    ₨ {customer.totalSpent.toFixed(2)}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => setViewingHistory(customer)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            title="View History"
                                        >
                                            <History size={18} />
                                        </button>
                                        {!isReadOnly && (
                                            <>
                                                <button 
                                                    onClick={() => handleOpenEdit(customer)}
                                                    className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                    title="Edit Profile"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setCustomerToDelete(customer)}
                                                    className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete Profile"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>

        <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCustomer} customer={editingCustomer} />

        <ConfirmationModal
          isOpen={!!customerToDelete}
          onClose={() => setCustomerToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Customer?"
          message={`Are you sure you want to remove "${customerToDelete?.name}"? All loyalty data will be lost permanently.`}
          confirmText="Delete"
          type="danger"
        />

        {/* Customer History Sidebar/Modal Overlay */}
        {viewingHistory && (
             <div className="fixed inset-0 z-[100] flex justify-end">
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingHistory(null)}></div>
                <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">{viewingHistory.name.charAt(0)}</div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{viewingHistory.name}</h3>
                                <p className="text-xs text-gray-500">Purchase History</p>
                            </div>
                        </div>
                        <button onClick={() => setViewingHistory(null)} className="text-gray-400 hover:text-gray-600"><Plus size={24} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {transactions.filter(t => t.customer?.id === viewingHistory.id).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <History size={48} className="opacity-10 mb-2" />
                                <p>No transactions found</p>
                            </div>
                        ) : (
                            transactions.filter(t => t.customer?.id === viewingHistory.id).map(t => (
                                <div key={t.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">#{t.id}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(t.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs text-gray-500">{t.items.length} items</div>
                                        <div className="font-bold dark:text-white">₨ {t.total.toFixed(0)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};

export default CustomerList;
