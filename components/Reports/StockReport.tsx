
import React, { useMemo, useState } from 'react';
import { Product } from '../../types';
import { Printer, Package, DollarSign, Layers, PieChart, Filter, Search, Calendar } from 'lucide-react';

interface StockReportProps {
  products: Product[];
  collections: string[];
}

const StockReport: React.FC<StockReportProps> = ({ products, collections }) => {
  const [filterCollection, setFilterCollection] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const now = new Date();

  // --- Calculations with Filtering ---
  const stockItems = useMemo(() => {
    return products
      .filter(p => {
        const matchesCollection = filterCollection === 'All' || p.category === filterCollection;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesDate = true;
        if (startDate) matchesDate = matchesDate && new Date(p.createdAt) >= new Date(startDate);
        if (endDate) matchesDate = matchesDate && new Date(p.createdAt) <= new Date(endDate);

        return matchesCollection && matchesSearch && matchesDate;
      })
      .flatMap(p => 
        p.sizes.map(s => ({
          id: p.id,
          name: p.name,
          category: p.category,
          brand: p.brand || 'Unbranded',
          sizeInternal: s.sizeInternal,
          size: s.size,
          storeStock: s.stock,
          warehouseStock: s.warehouseStock,
          price: p.price,
          createdAt: p.createdAt
        }))
      );
  }, [products, filterCollection, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    const totalItems = stockItems.reduce((acc, item) => acc + item.storeStock + item.warehouseStock, 0);
    const totalStore = stockItems.reduce((acc, item) => acc + item.storeStock, 0);
    const totalWh = stockItems.reduce((acc, item) => acc + item.warehouseStock, 0);
    const totalValue = stockItems.reduce((acc, item) => acc + ((item.storeStock + item.warehouseStock) * item.price), 0);
    
    const byCategory = stockItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = 0;
        acc[item.category] += (item.storeStock + item.warehouseStock);
        return acc;
    }, {} as Record<string, number>);

    return { totalItems, totalStore, totalWh, totalValue, byCategory };
  }, [stockItems]);

  const categoryChartData = (Object.entries(stats.byCategory) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  const maxCatValue = Math.max(...categoryChartData.map(d => d.value as number), 1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200" id="report-container">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Reports</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Valuations and warehouse distribution.</p>
            </div>
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none font-bold"
            >
                <Printer size={18} />
                <span>Print Report</span>
            </button>
        </header>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center print:hidden">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Collection</label>
                    <div className="relative">
                        <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                            value={filterCollection} 
                            onChange={(e) => setFilterCollection(e.target.value)} 
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs dark:text-white outline-none"
                        >
                            <option value="All">All Collections</option>
                            {collections.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Article Search</label>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Name or SKU..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs dark:text-white outline-none" 
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date Added (From)</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs dark:text-white outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date Added (To)</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs dark:text-white outline-none" />
                </div>
            </div>
            <button 
                onClick={() => { setFilterCollection('All'); setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                className="p-2.5 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Reset Filters"
            >
                <Filter size={18} />
            </button>
        </div>

        {/* Detailed Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:border-none print:shadow-none">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center print:bg-white print:border-gray-300">
                <h3 className="font-bold text-gray-900 dark:text-white">Filtered Inventory Data</h3>
                <span className="text-xs text-gray-500">{stockItems.length} Variants Listed</span>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                        <tr>
                            <th className="p-4">Product Info</th>
                            <th className="p-4">SKU / ID</th>
                            <th className="p-4 text-center">Size</th>
                            <th className="p-4 text-center">Store Stock</th>
                            <th className="p-4 text-center">Wh Stock</th>
                            <th className="p-4 text-right">Unit Price</th>
                            <th className="p-4 text-right">Valuation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {stockItems.map((item, idx) => (
                            <tr key={`${item.id}-${item.sizeInternal}-${idx}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                                    <div className="text-[10px] text-gray-400">{item.brand} | {item.category}</div>
                                </td>
                                <td className="p-4 font-mono text-xs text-gray-500">{item.id}</td>
                                <td className="p-4 text-center font-bold">
                                    {item.sizeInternal} <span className="text-[10px] text-gray-400 font-normal">({item.size})</span>
                                </td>
                                <td className="p-4 text-center font-medium text-emerald-600">
                                    {item.storeStock}
                                </td>
                                <td className="p-4 text-center font-medium text-indigo-600">
                                    {item.warehouseStock}
                                </td>
                                <td className="p-4 text-right font-mono">₨ {item.price.toFixed(0)}</td>
                                <td className="p-4 text-right font-bold text-gray-900 dark:text-white">
                                    ₨ {((item.storeStock + item.warehouseStock) * item.price).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
        </div>

        {/* Graphs - Visible in UI, but adjusted for print */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm print:shadow-none">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <PieChart size={18} className="text-indigo-500" />
                    Asset Concentration
                </h3>
                <div className="space-y-4">
                    {categoryChartData.map((cat, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-600 dark:text-gray-300">{cat.label}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{cat.value} items</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${(cat.value as number / maxCatValue) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center print:shadow-none">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8 w-full text-left">Location Breakdown</h3>
                <div className="relative w-40 h-40 rounded-full border-8 border-gray-100 dark:border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalItems}</p>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Total Units</p>
                    </div>
                </div>
                <div className="flex gap-6 mt-6">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span>Store: {stats.totalStore}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <span>Warehouse: {stats.totalWh}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StockReport;
