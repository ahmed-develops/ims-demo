
import React, { useState } from 'react';
import { ShoppingBag, Lock, User, AlertCircle, ShieldCheck, UserCheck, Package, Eye } from 'lucide-react';
import { CashierUser, UserRole } from '../types';

interface LoginProps {
  users: CashierUser[];
  onLogin: (user: CashierUser) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Cashier');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setIsLoading(true);
    setError('');

    setTimeout(() => {
        const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password &&
            u.role === selectedRole
        );

        if (user) {
            onLogin(user);
        } else {
            setError(`Invalid credentials for ${selectedRole} portal`);
            setIsLoading(false);
        }
    }, 800);
  };

  const getRoleIcon = (role: UserRole) => {
    switch(role) {
        case 'Admin': return <ShieldCheck size={14} className="shrink-0" />;
        case 'Warehouse': return <Package size={14} className="shrink-0" />;
        case 'Viewer': return <Eye size={14} className="shrink-0" />;
        default: return <UserCheck size={14} className="shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
            <div className="relative z-10">
                <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
                    <ShoppingBag size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-black text-white mb-1 tracking-tight uppercase">NiaMia Access</h1>
                <p className="text-indigo-100 text-xs font-medium tracking-wide">Enter the store management portal</p>
            </div>
        </div>

        <div className="p-8">
            {/* Role Tabs - Optimized for narrower container */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-8 gap-1">
                {(['Cashier', 'Admin', 'Warehouse', 'Viewer'] as UserRole[]).map((role) => (
                    <button
                        key={role}
                        type="button"
                        onClick={() => { setSelectedRole(role); setError(''); }}
                        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            selectedRole === role 
                            ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm scale-[1.02]' 
                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        {getRoleIcon(role)}
                        <span className="truncate">{role}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl animate-in slide-in-from-top-1">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Account Identity</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all dark:text-white font-bold text-sm"
                            placeholder="Username"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Security Key</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all dark:text-white font-bold text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-[11px] active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         <span>Authorizing...</span>
                        </>
                    ) : (
                        <span>Initialize Access</span>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center border-t border-gray-50 dark:border-gray-700 pt-6">
                <p className="text-[9px] text-gray-300 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">
                    Encrypted Core — NiaMia POS v1.5
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;