
import React, { useMemo } from 'react';
import { ShiftRecord, Transaction, TransactionType } from '../../types';
import { TrendingUp, DollarSign, ShoppingBag, Calendar, Truck, Store } from 'lucide-react';

interface ReportsDashboardProps {
  shiftHistory: ShiftRecord[];
  transactions: Transaction[];
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ shiftHistory, transactions }) => {
  
  const stats = useMemo(() => {
    const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
    const storeSales = transactions.filter(t => t.type === TransactionType.Sale).reduce((acc, t) => acc + t.total, 0);
    const warehouseSales = transactions.filter(t => t.type !== TransactionType.Sale).reduce((acc, t) => acc + t.total, 0);
    const totalTransactions = transactions.length;
    
    return {
      totalRevenue,
      storeSales,
      warehouseSales,
      totalTransactions,
      avgOrderValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    };
  }, [transactions]);

  const salesTrend = useMemo(() => {
    const grouped = transactions.reduce((acc, curr) => {
        const date = curr.businessDate;
        if (!acc[date]) acc[date] = 0;
        acc[date] += curr.total;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7);
  }, [transactions]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales & Performance Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time breakdown of store vs warehouse commerce.</p>
        </header>

        {/* Top Level Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        <Store size={14} className="text-indigo-500" /> Store Revenue (POS)
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">₨ {stats.storeSales.toLocaleString()}</div>
                </div>
                <div className="mt-4 w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${(stats.storeSales / (stats.totalRevenue || 1)) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        <Truck size={14} className="text-amber-500" /> Warehouse Sales
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">₨ {stats.warehouseSales.toLocaleString()}</div>
                </div>
                <div className="mt-4 w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(stats.warehouseSales / (stats.totalRevenue || 1)) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none flex flex-col justify-between text-white">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">
                        <TrendingUp size={14} /> Gross Revenue
                    </div>
                    <div className="text-3xl font-bold">₨ {stats.totalRevenue.toLocaleString()}</div>
                </div>
                <p className="mt-4 text-xs text-indigo-100 opacity-80">Aggregate turnover from all sources</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Recent Sales Trend</h3>
                <div className="h-48 flex items-end gap-2 px-2">
                    {salesTrend.map((day, i) => {
                        const max = Math.max(...salesTrend.map(d => d.value), 1);
                        const height = (day.value / max) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-indigo-100 dark:bg-indigo-900/40 rounded-t-lg relative group transition-all" style={{ height: `${height}%` }}>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                        ₨ {day.value}
                                    </div>
                                    <div className="w-full h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg"></div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono rotate-45 md:rotate-0 mt-2">
                                    {day.date.split('-').slice(1).join('/')}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-6">Transaction Source Breakdown</h3>
                 <div className="space-y-4">
                     {[
                        { type: TransactionType.Sale, color: 'bg-indigo-500' },
                        { type: TransactionType.Shopify, color: 'bg-emerald-500' },
                        { type: TransactionType.PreOrder, color: 'bg-amber-500' },
                        { type: TransactionType.PR, color: 'bg-pink-500' },
                        { type: TransactionType.FnF, color: 'bg-purple-500' }
                     ].map(item => {
                         const count = transactions.filter(t => t.type === item.type).length;
                         const pct = (count / (transactions.length || 1)) * 100;
                         return (
                            <div key={item.type}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{item.type}</span>
                                    <span className="text-gray-500">{count} orders ({pct.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                                </div>
                            </div>
                         );
                     })}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
