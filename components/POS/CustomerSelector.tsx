import React, { useState } from 'react';
import { User, Search, UserPlus, X, Phone, Check } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
  onAdd: (customer: Customer) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ 
  customers, 
  selectedCustomer, 
  onSelect, 
  onAdd 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      loyaltyPoints: 0,
      totalSpent: 0
    };
    onAdd(customer);
    onSelect(customer);
    setIsAdding(false);
    setIsOpen(false);
    setNewCustomer({ name: '', phone: '' });
  };

  return (
    <div className="relative">
      {!selectedCustomer ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium w-full"
        >
          <User size={16} />
          <span>Select Customer</span>
        </button>
      ) : (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 w-full animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
              {selectedCustomer.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate">{selectedCustomer.name}</p>
              <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{selectedCustomer.phone}</p>
            </div>
          </div>
          <button onClick={() => onSelect(null)} className="text-indigo-400 hover:text-indigo-600 shrink-0 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[70] overflow-hidden animate-in slide-in-from-top-2 duration-200 min-w-[280px]">
            {!isAdding ? (
              <div className="p-3">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-1 mb-3">
                  {filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => { onSelect(customer); setIsOpen(false); }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{customer.name}</p>
                        <p className="text-[10px] text-gray-400">{customer.phone}</p>
                      </div>
                      <Check size={14} className="text-indigo-500 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <p className="text-[10px] text-center text-gray-400 py-4">No customers found</p>
                  )}
                </div>

                <button 
                  onClick={() => setIsAdding(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <UserPlus size={14} />
                  Add New Customer
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">New Customer</h4>
                  <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">NAME</label>
                  <div className="relative">
                    <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required
                      autoFocus
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Customer Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">PHONE NUMBER</label>
                  <div className="relative">
                    <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="03xx-xxxxxxx"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors mt-2 shadow-md shadow-indigo-200 dark:shadow-none"
                >
                  Create & Select
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerSelector;