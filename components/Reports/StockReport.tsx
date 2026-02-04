
import React, { useMemo, useState } from 'react';
import { Product, StockMovement, StockMovementType, UserRole } from '../../types';
import { Printer, Search, Download, Box, TrendingUp, Filter, Calculator, ArrowRightLeft, ShoppingCart, LayoutDashboard } from 'lucide-react';

interface StockReportProps {
  products: Product[];
  collections: string[];
  movements: StockMovement[];
  userRole: UserRole | null;
}

type ReportTab = 'Unified' | 'StoreShelf' | 'WarehouseReserve';

const StockReport: React.FC<StockReportProps> = ({ products, collections, movements, userRole }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('Unified');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollection, setFilterCollection] = useState('All');
  
  const canSeeValuation = userRole === 'Admin' || userRole === 'Viewer';

  const reportData = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesColl = filterCollection === 'All' || p.category === filterCollection;
        return matchesSearch && matchesColl;
      })
      .flatMap(p => 
        (p.sizes || []).map(s => {
          // Calculate historical flow
          const sold = movements
            .filter(m => m.productId === p.id && m.sizeInternal === s.sizeInternal && m.type === StockMovementType.Sale)
            .reduce((acc, m) => acc + Math.abs(m.quantityChange), 0);

          const transferred = movements
            .filter(m => m.productId === p.id && m.sizeInternal === s.sizeInternal && m.type === StockMovementType.Transfer)
            .reduce((acc, m) => acc + Math.abs(m.quantityChange), 0);

          return {
            id: p.id,
            name: p.name,
            category: p.category,
            size: s.size,
            internal: s.sizeInternal,
            store: s.stock,
            wh: s.warehouseStock,
            sold,
            transferred,
            value: (s.stock + s.warehouseStock) * (s.price || p.price)
          };
        })
      );
  }, [products, movements, searchTerm, filterCollection]);

  const filteredReportData = useMemo(() => {
    if (activeTab === 'StoreShelf') return reportData.filter(d => d.store > 0 || d.sold > 0);
    if (activeTab === 'WarehouseReserve') return reportData.filter(d => d.wh > 0);
    return reportData;
  }, [reportData, activeTab]);

  const totals = useMemo(() => {
    return {
        store: reportData.reduce((acc, d) => acc + d.store, 0),
        wh: reportData.reduce((acc, d) => acc + d.wh, 0),
        sold: reportData.reduce((acc, d) => acc + d.sold, 0),
        transferred: reportData.reduce((acc, d) => acc + d.transferred, 0),
        value: reportData.reduce((acc, d) => acc + d.value, 0)
    };
  }, [reportData]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) return;

    const content = document.getElementById('report-table-target')?.outerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Master Stock Audit - NiaMia</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { margin: 15mm; size: landscape; }
            body { padding: 20px; font-family: 'Plus Jakarta Sans', sans-serif; background: white; color: black; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #000; font-size: 9pt; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 9pt; }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 800)">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24pt; font-weight: 900; text-transform: uppercase; letter-spacing: 4px;">Unified Movement Ledger</h1>
            <p style="text-transform: uppercase; font-size: 8pt; color: #666; letter-spacing: 2px;">Boutique & Warehouse Internal Audit: ${new Date().toLocaleString()}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
             <div style="border: 1px solid #000; padding: 15px;">
                <p style="font-size: 7pt; font-weight: 800; text-transform: uppercase; margin: 0;">Total Store Units</p>
                <p style="font-size: 18pt; font-weight: 900; margin: 0;">${totals.store}</p>
             </div>
             <div style="border: 1px solid #000; padding: 15px;">
                <p style="font-size: 7pt; font-weight: 800; text-transform: uppercase; margin: 0;">Total Sales (Converted)</p>
                <p style="font-size: 18pt; font-weight: 900; margin: 0;">${totals.sold}</p>
             </div>
             <div style="border: 1px solid #000; padding: 15px;">
                <p style="font-size: 7pt; font-weight: 800; text-transform: uppercase; margin: 0;">Warehouse Reserve</p>
                <p style="font-size: 18pt; font-weight: 900; margin: 0;">${totals.wh}</p>
             </div>
             <div style="border: 1px solid #000; padding: 15px;">
                <p style="font-size: 7pt; font-weight: 800; text-transform: uppercase; margin: 0;">Inventory Valuation</p>
                <p style="font-size: 18pt; font-weight: 900; margin: 0;">₨ ${totals.value.toLocaleString()}</p>
             </div>
          </div>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">Stock Ledger</h1>
                <div className="flex items-center gap-1 mt-4 p-1 bg-gray-200/50 dark:bg-gray-800 rounded-xl w-fit border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActiveTab('Unified')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Unified' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Unified Flow</button>
                    <button onClick={() => setActiveTab('StoreShelf')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'StoreShelf' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Store Shelf</button>
                    <button onClick={() => setActiveTab('WarehouseReserve')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'WarehouseReserve' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>WH Reserve</button>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                    <Printer size={16} /> Print Audit
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <ArrowRightLeft size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Total Transferred In</span>
                </div>
                <div className="text-3xl font-black dark:text-white tracking-tighter">{totals.transferred} <span className="text-xs text-gray-400">UNITS</span></div>
             </div>
             <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <ShoppingCart size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Total Sales Out</span>
                </div>
                <div className="text-3xl font-black dark:text-white tracking-tighter">{totals.sold} <span className="text-xs text-gray-400">UNITS</span></div>
             </div>
             <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <LayoutDashboard size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Current Store Bal</span>
                </div>
                <div className="text-3xl font-black dark:text-white tracking-tighter">{totals.store} <span className="text-xs text-gray-400">UNITS</span></div>
             </div>
             <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                <div className="flex items-center justify-between opacity-80 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest">Gross Net Valuation</span>
                  <Calculator size={18} />
                </div>
                <div className="text-2xl font-black tracking-tighter">₨ {totals.value.toLocaleString()}</div>
             </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Article Code or Name..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-black text-[11px] uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-indigo-500/10"
                />
            </div>
            <select 
                value={filterCollection} 
                onChange={e => setFilterCollection(e.target.value)}
                className="px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-black text-[11px] uppercase tracking-widest outline-none cursor-pointer border-none"
            >
                <option value="All">All Stream Collections</option>
                {collections.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>

        <div id="report-table-target" className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b border-gray-100 dark:border-gray-800">
                    <tr>
                        <th className="p-6">Article Identity</th>
                        <th className="p-6 text-center">Collection</th>
                        <th className="p-6 text-center text-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/5">Transferred In</th>
                        <th className="p-6 text-center text-emerald-600 bg-emerald-50/20 dark:bg-emerald-900/5">Retail Sold</th>
                        <th className="p-6 text-center font-black text-gray-900 dark:text-white">Store Bal</th>
                        <th className="p-6 text-center">WH Bal</th>
                        {canSeeValuation && <th className="p-6 text-right">Asset Value</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filteredReportData.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                            <td className="p-6">
                                <div className="text-xs font-black dark:text-white uppercase leading-tight truncate max-w-[200px]">{d.name}</div>
                                <div className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-tighter">SKU: <span className="text-indigo-500">{d.id}</span> — V-{d.internal}</div>
                            </td>
                            <td className="p-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.category}</td>
                            <td className="p-6 text-center bg-indigo-50/10 dark:bg-indigo-900/5">
                                <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{d.transferred}</span>
                            </td>
                            <td className="p-6 text-center bg-emerald-50/10 dark:bg-emerald-900/5">
                                <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800 text-emerald-600 rounded-lg text-[10px] font-black uppercase">{d.sold}</span>
                            </td>
                            <td className={`p-6 text-center font-black text-sm ${d.store < 3 ? 'text-rose-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
                                {d.store}
                            </td>
                            <td className="p-6 text-center font-black text-xs text-gray-400 dark:text-gray-500">{d.wh}</td>
                            {canSeeValuation && (
                                <td className="p-6 text-right font-black text-sm dark:text-white tracking-tighter">₨ {d.value.toLocaleString()}</td>
                            )}
                        </tr>
                    ))}
                    {filteredReportData.length === 0 && (
                        <tr>
                            <td colSpan={canSeeValuation ? 7 : 6} className="p-32 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
                                    <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-full mb-4 shadow-inner">
                                        <Box size={48} className="opacity-10" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Audit Results</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default StockReport;
