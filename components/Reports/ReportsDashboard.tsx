
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, Product, StockMovement, StockMovementType } from '../../types';
import { TrendingUp, Download, Printer, Box, ShoppingBag, Truck, Activity, PieChart, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

interface ReportsDashboardProps {
  transactions: Transaction[];
  products: Product[];
  movements: StockMovement[];
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ transactions, products, movements }) => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pulseSearch, setPulseSearch] = useState('');

  const stats = useMemo(() => {
    const filteredTxns = transactions.filter(t => {
      // Robust string comparison for YYYY-MM-DD formats
      return t.businessDate >= startDate && t.businessDate <= endDate;
    });

    const totalRevenue = filteredTxns.reduce((acc, t) => acc + t.total, 0);
    const totalTransactions = filteredTxns.length;
    
    let totalStoreStock = 0;
    let totalWhStock = 0;
    products.forEach(p => {
        p.sizes.forEach(s => {
            totalStoreStock += s.stock;
            totalWhStock += s.warehouseStock;
        });
    });

    const soldUnits = filteredTxns.reduce((acc, t) => {
        if (t.type === TransactionType.Return) return acc - t.items.reduce((iAcc, i) => iAcc + i.quantity, 0);
        return acc + t.items.reduce((iAcc, i) => iAcc + i.quantity, 0);
    }, 0);

    const availableUnits = totalStoreStock + totalWhStock;
    const soldRatio = (soldUnits + availableUnits) > 0 ? (soldUnits / (soldUnits + availableUnits)) * 100 : 0;

    return { 
        totalRevenue, 
        totalTransactions, 
        soldUnits, 
        totalStoreStock, 
        totalWhStock, 
        availableUnits,
        soldRatio 
    };
  }, [transactions, products, startDate, endDate]);

  const recentMovements = useMemo(() => {
      return movements
        .filter(m => 
            m.productName.toLowerCase().includes(pulseSearch.toLowerCase()) || 
            m.productId.toLowerCase().includes(pulseSearch.toLowerCase())
        )
        .slice(0, 10);
  }, [movements, pulseSearch]);

  const exportCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
        ['Date Range', `${startDate} to ${endDate}`],
        ['Total Revenue', `Rs. ${stats.totalRevenue}`],
        ['Total Transactions', stats.totalTransactions.toString()],
        ['Items Sold (In Range)', stats.soldUnits.toString()],
        ['Current Store Stock', stats.totalStoreStock.toString()],
        ['Current Warehouse Stock', stats.totalWhStock.toString()],
        ['Total Available Assets', stats.availableUnits.toString()],
        ['Sales to Stock Ratio', `${stats.soldRatio.toFixed(1)}%`]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `analytics_report_${startDate}_to_${endDate}.csv`);
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const summaryHtml = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #1a1a1a;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
          <div>
            <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0;">NiaMia Analytics Report</h1>
            <p style="font-size: 12px; color: #666; margin-top: 5px;">Period: <strong>${startDate}</strong> to <strong>${endDate}</strong></p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; margin: 0;">Generated On</p>
            <p style="font-size: 14px; font-weight: 700; margin: 0;">${new Date().toLocaleString()}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px;">
          <div style="background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0;">
            <p style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Total Revenue Flow</p>
            <p style="font-size: 32px; font-weight: 900; margin: 0;">₨ ${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div style="background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0;">
            <p style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Settled Transactions</p>
            <p style="font-size: 32px; font-weight: 900; margin: 0;">${stats.totalTransactions}</p>
          </div>
          <div style="background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0;">
            <p style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Store Floor Assets</p>
            <p style="font-size: 32px; font-weight: 900; margin: 0;">${stats.totalStoreStock} Units</p>
          </div>
          <div style="background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0;">
            <p style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Warehouse Reserve</p>
            <p style="font-size: 32px; font-weight: 900; margin: 0;">${stats.totalWhStock} Units</p>
          </div>
        </div>

        <div style="margin-top: 50px; border-top: 1px dashed #cbd5e1; padding-top: 30px;">
          <p style="font-size: 10px; text-align: center; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">End of Summary - Authorized Store Audit</p>
        </div>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Analytics Report - NiaMia</title>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
          <style>
            @page { margin: 10mm; size: portrait; }
            body { margin: 0; background: white; }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 800)">
          ${summaryHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">Analytics</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-3">Fiscal & Logistics Intelligence Dashboard</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none px-3 py-1.5 text-[10px] font-black uppercase outline-none dark:text-white" />
                    <span className="flex items-center text-gray-300">|</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none px-3 py-1.5 text-[10px] font-black uppercase outline-none dark:text-white" />
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                    <Download size={16} /> Export
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                    <Printer size={16} /> Print Report
                </button>
            </div>
        </header>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group transition-all hover:scale-[1.02]">
                <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Revenue Flow</p>
                <div className="text-4xl font-black tracking-tighter leading-none">₨ {stats.totalRevenue.toLocaleString()}</div>
                <p className="text-[9px] font-bold mt-4 opacity-70">Through {stats.totalTransactions} Settled Trans</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                <ShoppingBag className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-50 dark:text-indigo-900/10 opacity-40 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Items Sold</p>
                <div className="text-4xl font-black dark:text-white tracking-tighter leading-none">{stats.soldUnits} <span className="text-xs uppercase font-black text-gray-300">Units</span></div>
                <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.soldRatio}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500">{stats.soldRatio.toFixed(1)}%</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm group transition-all hover:border-indigo-500/20">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Store Assets</p>
                <div className="text-4xl font-black dark:text-white tracking-tighter leading-none">{stats.totalStoreStock} <span className="text-xs uppercase font-black text-gray-300">Units</span></div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">Front-end Availability</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm group transition-all hover:border-indigo-500/20">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">WH Reserves</p>
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter leading-none">{stats.totalWhStock} <span className="text-xs uppercase font-black text-gray-300">Units</span></div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">Safe Stock Retention</p>
            </div>
        </div>

        {/* Comparison Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 space-y-8">
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                <PieChart size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">Stock Distribution Analysis</h3>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">Store vs Warehouse Concentration Summary</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Retail Floor Concentration</span>
                                <span className="text-sm font-black dark:text-white">
                                  {stats.availableUnits > 0 ? ((stats.totalStoreStock / stats.availableUnits) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${stats.availableUnits > 0 ? (stats.totalStoreStock / stats.availableUnits) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Backstage / Warehouse Depth</span>
                                <span className="text-sm font-black dark:text-white">
                                  {stats.availableUnits > 0 ? ((stats.totalWhStock / stats.availableUnits) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${stats.availableUnits > 0 ? (stats.totalWhStock / stats.availableUnits) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-12">
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                             <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Combined Net Assets</p>
                             <div className="text-2xl font-black dark:text-white">{stats.availableUnits.toLocaleString()} <span className="text-[10px] text-gray-400 uppercase font-black">Articles</span></div>
                        </div>
                        <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                             <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-2">Liquidity Ratio</p>
                             <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.soldRatio.toFixed(1)}% <span className="text-[10px] text-gray-400 uppercase font-black">Velocity</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Movement Pulse Disabled (Commented Out for Future Re-enablement)
            <div className="lg:col-span-4 flex flex-col h-full">
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] flex-1 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="text-emerald-500 animate-pulse" size={20} />
                            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">Movement Log</h3>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input 
                                value={pulseSearch}
                                onChange={e => setPulseSearch(e.target.value)}
                                placeholder="Search Movement History..."
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {recentMovements.length > 0 ? recentMovements.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.quantityChange > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                                    {m.quantityChange > 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black dark:text-white uppercase truncate">{m.productName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${m.location === 'Store' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{m.location}</span>
                                        <span className="text-[9px] font-bold text-gray-400">{Math.abs(m.quantityChange)} Units</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-300 uppercase">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 p-10 opacity-30">
                                <Box size={40} className="mb-4" />
                                <p className="text-[10px] font-black uppercase">No Recent Activity</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-[8px] font-black text-gray-400 text-center uppercase tracking-widest">Real-time Logistics Sync Active</p>
                    </div>
                </div>
            </div>
            */}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
