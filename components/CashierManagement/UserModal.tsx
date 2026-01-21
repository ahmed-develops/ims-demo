
import React, { useState, useEffect } from 'react';
import { X, User, Lock, Briefcase, ShieldCheck, UserCheck, Package, Eye } from 'lucide-react';
import { CashierUser, UserRole } from '../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: CashierUser) => void;
  user?: CashierUser | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'Cashier' as UserRole
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          fullName: user.fullName,
          username: user.username,
          password: user.password,
          role: user.role
        });
      } else {
        setFormData({
          fullName: '',
          username: '',
          password: '',
          role: 'Cashier'
        });
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const savedUser: CashierUser = {
      id: user ? user.id : Math.random().toString(36).substr(2, 9).toUpperCase(),
      fullName: formData.fullName,
      username: formData.username,
      password: formData.password,
      role: formData.role
    };
    onSave(savedUser);
    onClose();
  };

  const isEditMode = !!user;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Employee' : 'Register New Staff Member'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input 
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="e.g. Sarah Jenkins"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                        <input 
                            required
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="sjenkins"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                        <input 
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Access Level</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'Cashier'})}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${formData.role === 'Cashier' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-500'}`}
                    >
                        <UserCheck size={18} />
                        <span className="font-bold text-[10px] uppercase">Cashier</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'Warehouse'})}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${formData.role === 'Warehouse' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600 text-purple-700 dark:text-purple-400 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600 text-gray-500'}`}
                    >
                        <Package size={18} />
                        <span className="font-bold text-[10px] uppercase">Warehouse</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'Admin'})}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${formData.role === 'Admin' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-600 text-amber-700 dark:text-amber-400 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600 text-gray-500'}`}
                    >
                        <ShieldCheck size={18} />
                        <span className="font-bold text-[10px] uppercase">Admin</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'Viewer'})}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${formData.role === 'Viewer' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-600 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600 text-gray-500'}`}
                    >
                        <Eye size={18} />
                        <span className="font-bold text-[10px] uppercase">Viewer</span>
                    </button>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    {isEditMode ? 'Update Staff' : 'Register Member'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
