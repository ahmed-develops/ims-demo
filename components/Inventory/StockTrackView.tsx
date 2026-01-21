
import React, { useState } from 'react';
import { StockMovement, StockMovementType, UserRole } from '../../types';
import { Search, History, ArrowUpRight, ArrowDownLeft, MoveHorizontal, Package, Printer, ShoppingBag, Gift, Users, Clock, Truck } from 'lucide-react';

interface StockTrackViewProps {
  movements: StockMovement[];
  userRole?: UserRole | null;
}

const StockTrackView: React.FC<StockTrackViewProps> = ({ movements, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = movements.filter(m => 
    m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => window.print();

  const getTypeBadge = (movement: StockMovement) => {
    const { type, notes } = movement;
    const noteStr = notes || '';

    // Specialized Outflow/Transfer Detection
    if (type === StockMovementType.Outward || type === StockMovementType.Transfer) {
        if (noteStr.includes('Shopify')) {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 uppercase tracking-tighter"><ShoppingBag size={10} /> Shopify</span>;
        }
        if (noteStr.includes('PR')) {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 uppercase tracking-tighter"><Gift size={10} /> PR / Gift</span>;
        }
        if (noteStr.includes('FnF')) {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 uppercase tracking-tighter"><Users size={10} /> F & F</span>;
        }
        if (noteStr.includes('PreOrder')) {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 uppercase tracking-tighter"><Clock size={10} /> Pre-Order</span>;
        }
        if (noteStr.includes('Transfer') || type === StockMovementType.Transfer) {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800 uppercase tracking-tighter"><Truck size={10} /> Transfer</span>;
        }
    }

    switch(type) {
        case StockMovementType.Sale:
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 uppercase tracking-tighter"><ArrowDownLeft size={10} /> POS Sale</span>;
        case StockMovementType.Adjustment:
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-tighter">Adjustment</span>;
        case StockMovementType.Inward:
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 uppercase tracking-tighter"><ArrowUpRight size={10} /> Stock In</span>;
        default:
            return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">{type}</span>;
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200" id="stock-track-ledger">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Stock Movement Track</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Historical ledger showing specific outflow modes and transfers.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search SKU, Notes or Actor..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-48 md:w-64 transition-all"
                    />
                </div>
                <button 
                    onClick={handlePrint}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all"
                    title="Print Movement History"
                >
                    <Printer size={20} />
                </button>
            </div>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-50 dark:border-gray-700 text-[10px] uppercase text-gray-400 dark:text-gray-500 font-black tracking-widest">
                        <tr>
                            <th className="p-5">Time Log</th>
                            <th className="p-5">Article & Variant</th>
                            <th className="p-5">Operation / Mode</th>
                            <th className="p-5 text-center">Change</th>
                            <th className="p-5 text-center">Store Bal</th>
                            <th className="p-5 text-center">WH Bal</th>
                            <th className="p-5">Performed By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filtered.length > 0 ? filtered.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="p-5">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-mono font-black text-gray-900 dark:text-gray-200">{new Date(m.timestamp).toLocaleDateString()}</span>
                                        <span className="text-[10px] font-bold text-gray-400 mt-0.5">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400"><Package size={16} /></div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[180px] leading-tight">{m.productName}</p>
                                            <p className="text-[9px] font-mono font-black text-indigo-500/70 uppercase mt-0.5">SKU: {m.productId} | V-{m.sizeInternal}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    {getTypeBadge(m)}
                                </td>
                                <td className="p-5 text-center">
                                    <span className={`text-sm font-black ${m.quantityChange > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {m.quantityChange > 0 ? '+' : ''}{m.quantityChange}
                                    </span>
                                </td>
                                <td className="p-5 text-center font-mono text-xs font-black text-gray-600 dark:text-gray-400">
                                    {m.newStoreStock}
                                </td>
                                <td className="p-5 text-center font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                                    {m.newWhStock}
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">{m.performedBy.charAt(0)}</div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{m.performedBy}</span>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="p-32 text-center text-gray-400">
                                    <History size={64} className="mx-auto mb-6 opacity-10" />
                                    <p className="font-black uppercase tracking-widest text-xs">No movement logs found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <style>{`
        @media print {
            body * { visibility: hidden; }
            #stock-track-ledger, #stock-track-ledger * { visibility: visible; }
            #stock-track-ledger { position: absolute; left: 0; top: 0; width: 100%; }
            .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default StockTrackView;
