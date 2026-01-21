
import React from 'react';
import { Database, Download, FileJson, ShieldAlert, History } from 'lucide-react';

interface BackupExportViewProps {
  data: any;
}

const BackupExportView: React.FC<BackupExportViewProps> = ({ data }) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nova_boutique_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
             <header className="mb-10">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Management & Backup</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Export your store data for safe keeping or migration.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                        <Download size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Instant Backup</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        Generate a complete snapshot of your boutique's current state, including products, transactions, customer records, and shift history.
                    </p>
                    <button 
                        onClick={handleExport}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                        <FileJson size={20} />
                        Export All Data (.json)
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm border-l-4 border-l-amber-500">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                        <ShieldAlert size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">System Health</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                        Your data is currently stored locally. We recommend performing a backup before any major inventory updates or shift rotations.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <History size={16} className="text-gray-400" />
                            <span>Last export: Never</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <Database size={16} className="text-gray-400" />
                            <span>Storage used: Local Web Storage</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Admin Note</h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-400">
                    Exported JSON files can be imported into our Enterprise BI tools for advanced custom reporting beyond the built-in analytics dashboard.
                </p>
            </div>
        </div>
    </div>
  );
};

export default BackupExportView;
