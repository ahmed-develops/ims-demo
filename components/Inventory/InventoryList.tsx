
import React, { useState, useMemo } from 'react';
import { Product, UserRole } from '../../types';
import { Search, Plus, Archive, ChevronDown, ChevronUp, RotateCcw, ScanBarcode, Filter, AlertTriangle, Store, Package, Edit3 } from 'lucide-react';
import ProductModal from './AddProductModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import StockUpdateModal from './StockUpdateModal';

interface InventoryListProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  lowStockThreshold: number;
  onUpdateThreshold: (threshold: number) => void;
  collections: string[];
  currentUserRole: UserRole | null;
}

const InventoryList: React.FC<InventoryListProps> = ({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  lowStockThreshold,
  onUpdateThreshold,
  collections,
  currentUserRole
}) => {
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isStockUpdateModalOpen, setIsStockUpdateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSizeIndex, setEditingSizeIndex] = useState<number>(-1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Available' | 'Low' | 'Empty'>('All');

  const isReadOnly = currentUserRole === 'Viewer';
  const canManageInventory = currentUserRole === 'Admin' || currentUserRole === 'Warehouse';

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const handleEditMetadata = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(p);
    setIsMetadataModalOpen(true);
  };

  const handleQuickStockUpdate = (p: Product, sizeIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(p);
    setEditingSizeIndex(sizeIndex);
    setIsStockUpdateModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const totalStoreStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
      const totalWhStock = p.sizes.reduce((acc, s) => acc + s.warehouseStock, 0);
      const combinedStock = totalStoreStock + totalWhStock;

      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollection = selectedCollection === 'All' || p.category === selectedCollection;
      
      let matchesStock = true;
      if (stockFilter === 'Available') matchesStock = combinedStock > 0;
      else if (stockFilter === 'Low') matchesStock = combinedStock > 0 && combinedStock <= lowStockThreshold;
      else if (stockFilter === 'Empty') matchesStock = combinedStock === 0;

      return matchesSearch && matchesCollection && matchesStock;
    });
  }, [products, searchTerm, selectedCollection, stockFilter, lowStockThreshold]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">Inventory Engine</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Design Repository & Advanced Stock Management</p>
                </div>
                {canManageInventory && (
                    <div className="flex gap-3">
                        <button onClick={() => setIsScannerModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                            <ScanBarcode size={16} /> Scan Inventory
                        </button>
                        <button onClick={() => { setEditingProduct(null); setIsMetadataModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none">
                            <Plus size={16} /> Add New Article
                        </button>
                    </div>
                )}
            </header>

            {/* Filter Suite */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 print:hidden">
                <div className="lg:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Article ID or Name..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 font-black text-xs uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-indigo-500/5 shadow-sm"
                    />
                </div>
                
                <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <select 
                        value={selectedCollection} 
                        onChange={e => setSelectedCollection(e.target.value)} 
                        className="w-full pl-11 pr-6 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 font-black text-xs uppercase tracking-widest outline-none shadow-sm cursor-pointer appearance-none group-hover:border-indigo-200 transition-all"
                    >
                        <option value="All">All Streams</option>
                        {collections.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${stockFilter === 'All' ? 'text-gray-300' : 'text-indigo-500'}`}>
                        {stockFilter === 'Low' || stockFilter === 'Empty' ? <AlertTriangle size={16} /> : <Archive size={16} />}
                    </div>
                    <select 
                        value={stockFilter} 
                        onChange={e => setStockFilter(e.target.value as any)} 
                        className="w-full pl-11 pr-6 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 font-black text-xs uppercase tracking-widest outline-none shadow-sm cursor-pointer appearance-none group-hover:border-indigo-200 transition-all"
                    >
                        <option value="All">Stock: All</option>
                        <option value="Available">Stock: Available</option>
                        <option value="Low">Stock: Low Level</option>
                        <option value="Empty">Stock: Exhausted</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b border-gray-50 dark:border-gray-800">
                            <tr>
                                <th className="p-6 w-12"></th>
                                <th className="p-6">Design Identity</th>
                                <th className="p-6">Stream</th>
                                <th className="p-6 text-right">MSRP (₨)</th>
                                <th className="p-6 text-center">Store Stock</th>
                                <th className="p-6 text-center">WH Reserve</th>
                                <th className="p-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredProducts.map(p => {
                                const isExpanded = expandedRows.has(p.id);
                                const storeStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
                                const whStock = p.sizes.reduce((acc, s) => acc + s.warehouseStock, 0);
                                const combined = storeStock + whStock;
                                
                                const isOut = combined === 0;
                                const isLow = combined > 0 && combined <= lowStockThreshold;

                                return (
                                    <React.Fragment key={p.id}>
                                        <tr 
                                            onClick={(e) => toggleRow(p.id, e)} 
                                            className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all cursor-pointer group ${isExpanded ? 'bg-indigo-50/20 dark:bg-indigo-900/5' : ''}`}
                                        >
                                            <td className="p-6">
                                                <ChevronDown size={16} className={`transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180 text-indigo-500' : 'text-gray-400'}`} />
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img src={p.image} className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                                        {isOut && <div className="absolute inset-0 bg-red-500/20 rounded-2xl" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black dark:text-white uppercase leading-tight group-hover:text-indigo-600 transition-colors">{p.name}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Article: <span className="font-mono text-indigo-600">#{p.id}</span></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right font-black text-sm dark:text-white tracking-tighter font-mono">₨ {p.price.toLocaleString()}</td>
                                            <td className={`p-6 text-center font-black text-xs ${storeStock < 5 ? 'text-amber-500' : 'text-gray-600 dark:text-gray-400'}`}>{storeStock}</td>
                                            <td className="p-6 text-center font-black text-xs text-indigo-600 dark:text-indigo-400">{whStock}</td>
                                            <td className="p-6 text-center">
                                                <div className="flex items-center justify-center gap-4">
                                                    {isOut ? (
                                                        <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 text-[9px] font-black uppercase rounded-lg border border-red-100 dark:border-red-900/30 tracking-widest">Exhausted</span>
                                                    ) : isLow ? (
                                                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[9px] font-black uppercase rounded-lg border border-amber-100 dark:border-amber-900/30 tracking-widest">Critical</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100 dark:border-emerald-900/30 tracking-widest">Healthy</span>
                                                    )}
                                                    {canManageInventory && (
                                                        <button 
                                                            onClick={(e) => handleEditMetadata(p, e)}
                                                            className="p-2 text-gray-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Edit Details"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={7} className="p-0 border-none">
                                                <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
                                                            <div className="max-w-4xl">
                                                                <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                                                                    <Archive size={14} />
                                                                    <span>Variant Performance Breakdown</span>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {(p.sizes || []).map((sz, idx) => (
                                                                        <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 group/card hover:border-indigo-200 transition-all">
                                                                            <div className="flex justify-between items-start">
                                                                                <div>
                                                                                    <span className="text-[11px] font-black dark:text-white uppercase tracking-widest">Size {sz.sizeInternal} — {sz.size}</span>
                                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Ref: {p.id}-{sz.sizeInternal}</p>
                                                                                </div>
                                                                                {canManageInventory && (
                                                                                    <button 
                                                                                        onClick={(e) => handleQuickStockUpdate(p, idx, e)}
                                                                                        className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-indigo-600 rounded-lg transition-all"
                                                                                        title="Edit Stock"
                                                                                    >
                                                                                        <Edit3 size={14} />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 flex flex-col items-center">
                                                                                    <Store size={12} className="text-gray-400 mb-1" />
                                                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Store</span>
                                                                                    <span className="text-sm font-black dark:text-white">{sz.stock}</span>
                                                                                </div>
                                                                                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 flex flex-col items-center">
                                                                                    <Package size={12} className="text-indigo-400 mb-1" />
                                                                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">WH</span>
                                                                                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{sz.warehouseStock}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
                                            <div className="p-6 bg-white dark:bg-gray-900 rounded-full shadow-inner mb-4">
                                                <Search size={48} className="opacity-20" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero results in current cache</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <ProductModal 
            isOpen={isMetadataModalOpen} 
            onClose={() => setIsMetadataModalOpen(false)} 
            onSave={p => editingProduct ? onEditProduct(p) : onAddProduct(p)} 
            product={editingProduct} 
            collections={collections} 
            userRole={currentUserRole} 
            readOnly={isReadOnly}
        />
        <StockUpdateModal 
            isOpen={isStockUpdateModalOpen}
            onClose={() => setIsStockUpdateModalOpen(false)}
            product={editingProduct}
            sizeIndex={editingSizeIndex}
            onSave={onEditProduct}
            userRole={currentUserRole}
        />
        <BarcodeScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} onScan={code => console.log(code)} />
    </div>
  );
};

export default InventoryList;
