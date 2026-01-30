
import React, { useState, useMemo } from 'react';
import { Product, UserRole } from '../../types';
import { Search, Plus, Archive, ChevronDown, RotateCcw, ScanBarcode } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('All');

  const isReadOnly = currentUserRole === 'Viewer';
  const isStockOnly = currentUserRole === 'Warehouse';

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollection = selectedCollection === 'All' || p.category === selectedCollection;
      return matchesSearch && matchesCollection;
    });
  }, [products, searchTerm, selectedCollection]);

  const handleRowClick = (p: Product) => {
      setEditingProduct(p);
      setIsMetadataModalOpen(true);
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Inventory Engine</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Design Repository & Stock Monitoring</p>
                </div>
                {!isReadOnly && !isStockOnly && (
                    <div className="flex gap-3">
                        <button onClick={() => setIsScannerModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                            <ScanBarcode size={16} /> Scan Inventory
                        </button>
                        <button onClick={() => { setEditingProduct(null); setIsMetadataModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none">
                            <Plus size={16} /> Add Article
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Identity..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 font-black text-xs uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                    />
                </div>
                <select value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)} className="px-6 py-4 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 font-black text-xs uppercase tracking-widest outline-none shadow-sm cursor-pointer">
                    <option value="All">All Streams</option>
                    {collections.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b border-gray-50 dark:border-gray-800">
                        <tr>
                            <th className="p-6">Design Identity</th>
                            <th className="p-6">Collection Stream</th>
                            <th className="p-6 text-right">Price (₨)</th>
                            <th className="p-6 text-center">Store Qty</th>
                            <th className="p-6 text-center">Warehouse Qty</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {filteredProducts.map(p => {
                            const storeStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
                            const whStock = p.sizes.reduce((acc, s) => acc + s.warehouseStock, 0);
                            return (
                                <tr key={p.id} onClick={() => handleRowClick(p)} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all cursor-pointer group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image} className="w-12 h-12 rounded-2xl object-cover" />
                                            <div>
                                                <div className="text-xs font-black dark:text-white uppercase leading-tight">{p.name}</div>
                                                <div className="text-[10px] font-bold text-indigo-600 mt-0.5">#{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.category}</td>
                                    <td className="p-6 text-right font-black text-sm dark:text-white tracking-tighter">₨ {p.price.toLocaleString()}</td>
                                    <td className="p-6 text-center font-black text-xs text-gray-600 dark:text-gray-400">{storeStock}</td>
                                    <td className="p-6 text-center font-black text-xs text-indigo-600 dark:text-indigo-400">{whStock}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        <ProductModal 
            isOpen={isMetadataModalOpen} 
            onClose={() => setIsMetadataModalOpen(false)} 
            onSave={p => editingProduct ? onEditProduct(p) : onAddProduct(p)} 
            product={editingProduct} 
            collections={collections} 
            brands={[]} 
            userRole={currentUserRole} 
            readOnly={isReadOnly || isStockOnly}
        />
        <BarcodeScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} onScan={code => console.log(code)} />
    </div>
  );
};

export default InventoryList;
