
import React, { useMemo, useState } from 'react';
import { Product, StockMovement, StockMovementType, UserRole } from '../../types';
import { Printer, Search, Download, Box, TrendingUp, Filter, Calculator } from 'lucide-react';

interface StockReportProps {
  products: Product[];
  collections: string[];
  movements: StockMovement[];
  userRole: UserRole | null;
}

const StockReport: React.FC<StockReportProps> = ({ products, collections, movements, userRole }) => {
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
          const sold = movements
            .filter(m => m.productId === p.id && m.sizeInternal === s.sizeInternal && m.type === StockMovementType.Sale)
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
            value: (s.stock + s.warehouseStock) * (s.price || p.price)
          };
        })
      );
  }, [products, movements, searchTerm, filterCollection]);

  const grandTotalValue = useMemo(() => {
    return reportData.reduce((acc, d) => acc + d.value, 0);
  }, [reportData]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) return;

    const content = document.getElementById('stock-ledger-table')?.outerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Stock Ledger Report - NiaMia</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { margin: 15mm; size: landscape; }
            body { padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: white; color: black; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f9fafb !important; color: #6b7280 !important; font-weight: 800; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.05em; border-bottom: 2pt solid black; }
            td { border-bottom: 1px solid #f3f4f6; padding: 12px 8px; font-size: 9pt; }
            .valuation-col { ${canSeeValuation ? '' : 'display: none;'} }
            .summary-box { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              padding: 20px; 
              background: #f8fafc; 
              border: 1px solid #e2e8f0; 
              border-radius: 12px;
              margin-bottom: 30px;
            }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 800)">
          <div class="mb-10 text-center">
            <h1 class="text-3xl font-black uppercase tracking-[0.3em] mb-2">NiaMia Inventory Ledger</h1>
            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Audit Timestamp: ${new Date().toLocaleString()}</p>
          </div>

          ${canSeeValuation ? `
          <div class="summary-box">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Articles in Audit</p>
              <p class="text-2xl font-black">${reportData.length} Variants</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Gross Inventory Valuation</p>
              <p class="text-3xl font-black text-indigo-600">₨ ${grandTotalValue.toLocaleString()}</p>
            </div>
          </div>
          ` : ''}

          <div class="overflow-hidden rounded-xl border border-gray-100">
            ${content}
          </div>

          <div class="mt-20 flex justify-between border-t border-dashed border-gray-300 pt-8">
            <div class="text-center w-64">
              <div class="h-px bg-gray-400 w-full mb-2"></div>
              <p class="text-[8px] font-black uppercase tracking-widest">Store Manager Signature</p>
            </div>
             <div class="text-center w-64">
              <div class="h-px bg-gray-400 w-full mb-2"></div>
              <p class="text-[8px] font-black uppercase tracking-widest">Auditor Verification</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    const headers = canSeeValuation 
        ? ['SKU', 'Name', 'Category', 'Variant', 'Units Sold', 'Store Bal', 'Wh Bal', 'Valuation']
        : ['SKU', 'Name', 'Category', 'Variant', 'Units Sold', 'Store Bal', 'Wh Bal'];
    
    const rows = reportData.map(d => {
        const row = [d.id, d.name, d.category, d.internal, d.sold, d.store, d.wh];
        if (canSeeValuation) row.push(d.value);
        return row;
    });

    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `stock_audit_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">Stock Ledger</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Comprehensive Asset & Movement Audit</p>
            </div>
            <div className="flex gap-2">
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                    <Download size={16} /> Export CSV
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                    <Printer size={16} /> Print Master Audit
                </button>
            </div>
        </header>

        {canSeeValuation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none flex flex-col justify-between h-32">
                <div className="flex items-center justify-between opacity-80">
                  <span className="text-[9px] font-black uppercase tracking-widest">Total Asset Valuation</span>
                  <Calculator size={18} />
                </div>
                <div className="text-3xl font-black tracking-tighter">₨ {grandTotalValue.toLocaleString()}</div>
             </div>
             <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-32">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Store Inventory</span>
                <div className="text-3xl font-black dark:text-white tracking-tighter">
                  {reportData.reduce((acc, d) => acc + d.store, 0)} Units
                </div>
             </div>
             <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-32">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Warehouse Reserve</span>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                  {reportData.reduce((acc, d) => acc + d.wh, 0)} Units
                </div>
             </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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

        <div id="stock-ledger-table" className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b border-gray-100 dark:border-gray-800">
                    <tr>
                        <th className="p-6">Article Identity</th>
                        <th className="p-6 text-center">Collection</th>
                        <th className="p-6 text-center">Units Sold</th>
                        <th className="p-6 text-center">Store Bal</th>
                        <th className="p-6 text-center">Wh Bal</th>
                        {canSeeValuation && <th className="p-6 text-right">Asset Value</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {reportData.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                            <td className="p-6">
                                <div className="text-xs font-black dark:text-white uppercase leading-tight truncate max-w-[250px]">{d.name}</div>
                                <div className="text-[9px] font-black text-indigo-500 mt-1 uppercase tracking-tighter">SKU: {d.id} — Variant: {d.internal}</div>
                            </td>
                            <td className="p-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.category}</td>
                            <td className="p-6 text-center">
                                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-[10px] font-black uppercase">{d.sold}</span>
                            </td>
                            <td className="p-6 text-center font-black text-xs text-gray-600 dark:text-gray-400">{d.store}</td>
                            <td className="p-6 text-center font-black text-xs text-indigo-600 dark:text-indigo-400">{d.wh}</td>
                            {canSeeValuation && (
                                <td className="p-6 text-right font-black text-sm dark:text-white tracking-tighter">₨ {d.value.toLocaleString()}</td>
                            )}
                        </tr>
                    ))}
                    {reportData.length === 0 && (
                        <tr>
                            <td colSpan={canSeeValuation ? 6 : 5} className="p-20 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest italic opacity-50">Zero matches found in audit</td>
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
