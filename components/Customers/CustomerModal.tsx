import React, { useState, useEffect } from 'react';
import { X, User, Phone, Award, DollarSign } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer?: Customer | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          name: customer.name,
          phone: customer.phone,
        });
      } else {
        setFormData({
          name: '',
          phone: '',
        });
      }
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const savedCustomer: Customer = {
      id: customer ? customer.id : Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: formData.name,
      phone: formData.phone,
      loyaltyPoints: customer ? customer.loyaltyPoints : 0,
      totalSpent: customer ? customer.totalSpent : 0
    };
    onSave(savedCustomer);
    onClose();
  };

  const isEditMode = !!customer;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="John Doe"
                    />
                </div>
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input 
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="03xx-xxxxxxx"
                    />
                </div>
            </div>

            {/* Read Only Stats for Edit Mode */}
            {isEditMode && customer && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-400 mb-1 uppercase tracking-wider">
                            <Award size={14} /> Loyalty Pts
                        </div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {customer.loyaltyPoints}
                        </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                         <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-400 mb-1 uppercase tracking-wider">
                            <DollarSign size={14} /> Total Spent
                        </div>
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            ₨ {customer.totalSpent.toFixed(2)}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3 mt-6 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    {isEditMode ? 'Update Customer' : 'Add Customer'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;