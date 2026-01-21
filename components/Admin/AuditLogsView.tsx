
import React, { useState } from 'react';
import { AuditLog, UserRole } from '../../types';
import { Search, ClipboardList, Clock, User, Info } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
  // Added userRole to satisfy the component call in App.tsx
  userRole?: UserRole | null;
}

const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track every action performed within the boutique system.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                    />
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                        <tr>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filtered.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                                        <Clock size={12} />
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                            {log.user.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium dark:text-white">{log.user}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-start gap-2 max-w-md">
                                        <Info size={14} className="mt-0.5 text-gray-400 shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-gray-400">No matching logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AuditLogsView;
