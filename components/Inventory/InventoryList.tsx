
import React, { useState, useMemo } from 'react';
import { Product, UserRole, ProductSize } from '../../types';
import { Search, AlertCircle, Plus, Pencil, Trash2, Settings2, AlertTriangle, Archive, Store, ChevronDown, ChevronUp, ScanBarcode, Layers, Filter, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
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
  brands: string[];
  currentUserRole: UserRole | null;
}

type StockFilter = 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock';

const InventoryList: React.FC<InventoryListProps> = ({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  lowStockThreshold,
  onUpdateThreshold,
  collections,
  brands,
  currentUserRole
}) => {
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isStockUpdateModalOpen, setIsStockUpdateModalOpen] = useState(false);
  
  const [scannedNotFound, setScannedNotFound] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSizeIndex, setEditingSizeIndex] = useState<number>(-1);
  const [prefilledSku, setPrefilledSku] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState<StockFilter>('All');
  
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());

  const isReadOnly = currentUserRole === 'Viewer';
  const isFiltered = searchTerm !== '' || selectedCollection !== 'All' || selectedStockFilter !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCollection('All');
    setSelectedStockFilter('All');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCollection = 
        selectedCollection === 'All' || p.category === selectedCollection;

      const totalWhStock = p.sizes.reduce((acc, s) => acc + s.warehouseStock, 0);
      const isWhLow = totalWhStock <= (lowStockThreshold * p.sizes.length);
      const isWhOut = totalWhStock === 0;

      let matchesStock = true;
      if (selectedStockFilter === 'In Stock') matchesStock = totalWhStock > 0;
      else if (selectedStockFilter === 'Low Stock') matchesStock = isWhLow && !isWhOut;
      else if (selectedStockFilter === 'Out of Stock') matchesStock = isWhOut;

      return matchesSearch && matchesCollection && matchesStock;
    });
  }, [products, searchTerm, selectedCollection, selectedStockFilter, lowStockThreshold]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedProductIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedProductIds(next);
  };

  const handleOpenAddManual = () => {
    if (isReadOnly) return;
    setEditingProduct(null);
    setPrefilledSku(null);
    setIsMetadataModalOpen(true);
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    setIsScannerModalOpen(false);
    let matchedSizeIdx = -1;
    
    const existingProduct = products.find(p => {
        if (p.id === scannedCode) {
            matchedSizeIdx = 0; 
            return true;
        }
        const idx = p.sizes.findIndex(s => s.barcode === scannedCode || `${p.id}-${s.sizeInternal}` === scannedCode);
        if (idx !== -1) {
            matchedSizeIdx = idx;
            return true;
        }
        return false;
    });
    
    if (existingProduct) {
      setEditingProduct(existingProduct);
      setEditingSizeIndex(matchedSizeIdx);
      setIsStockUpdateModalOpen(true);
    } else {
      setScannedNotFound(scannedCode);
    }
  };

  const handleOpenMetadataEdit = (product: Product) => {
    if (isReadOnly) return;
    setEditingProduct(product);
    setIsMetadataModalOpen(true);
  };

  const handleOpenStockEdit = (product: Product, sizeIndex: number) => {
    if (isReadOnly) return;
    setEditingProduct(product);
    setEditingSizeIndex(sizeIndex);
    setIsStockUpdateModalOpen(true);
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          Manage article identity and monitor stock across Warehouse & Store.
                        </p>
                    </div>
                    {!isReadOnly && (
                      <div className="flex flex-wrap items-center gap-3">
                           <button 
                              type="button"
                              onClick={() => setIsScannerModalOpen(true)}
                              className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"
                           >
                              <ScanBarcode size={18} />
                              Scan Stock
                           </button>
                           <button 
                              type="button"
                              onClick={handleOpenAddManual}
                              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                           >
                              <Plus size={18} />
                              Add Article
                           </button>
                      </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by Article, SKU, Brand..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white"
                            />
                        </div>

                        <div className="relative group">
                            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <select 
                                value={selectedCollection}
                                onChange={(e) => setSelectedCollection(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none dark:text-gray-200 transition-all"
                            >
                                <option value="All">All Collections</option>
                                {collections.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        <div className="relative group">
                            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <select 
                                value={selectedStockFilter}
                                onChange={(e) => setSelectedStockFilter(e.target.value as StockFilter)}
                                className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none dark:text-gray-200 transition-all font-bold text-indigo-600"
                            >
                                <option value="All">All Warehouse Stock</option>
                                <option value="In Stock">Wh In Stock</option>
                                <option value="Low Stock">Wh Low Alert</option>
                                <option value="Out of Stock">Wh Out of Stock</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700 pt-4 lg:pt-0 lg:pl-4">
                        <button 
                            type="button"
                            disabled={!isFiltered}
                            onClick={resetFilters}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                isFiltered 
                                ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20 active:scale-95' 
                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
                            }`}
                        >
                            <RotateCcw size={16} className={isFiltered ? 'animate-in spin-in-180' : ''} />
                            <span>Reset Filters</span>
                        </button>

                        {!isReadOnly && (
                          <div className="flex items-center gap-2">
                               <button 
                                  type="button"
                                  onClick={() => setShowThresholdConfig(!showThresholdConfig)}
                                  className={`p-3 rounded-2xl transition-all ${showThresholdConfig ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                  title="Safety Level Threshold"
                              >
                                  <Settings2 size={20} />
                              </button>
                              {showThresholdConfig && (
                                  <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                      <input 
                                          type="number"
                                          value={lowStockThreshold}
                                          onChange={(e) => onUpdateThreshold(parseInt(e.target.value) || 0)}
                                          className="w-14 text-center text-sm font-black bg-gray-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-800 rounded-xl py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                      />
                                      <span className="text-[10px] font-black uppercase text-gray-400">Threshold</span>
                                  </div>
                              )}
                          </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Articles Found:</span>
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-black">
                            {filteredProducts.length}
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Stock Filter currently applied to Warehouse only</p>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-50 dark:border-gray-700 text-[10px] uppercase text-gray-400 dark:text-gray-500 font-black tracking-widest">
                        <tr>
                            <th className="p-5 w-12 text-center"></th>
                            <th className="p-5">Article Identity</th>
                            <th className="p-5">Collection</th>
                            <th className="p-5 text-right">Price (₨)</th>
                            <th className="p-5 text-center">Store Qty</th>
                            <th className="p-5 text-center">Total Wh</th>
                            {!isReadOnly && <th className="p-5 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredProducts.map((product) => {
                            const isExpanded = expandedProductIds.has(product.id);
                            
                            const totalStoreStock = product.sizes.reduce((acc, s) => acc + s.stock, 0);
                            const isStoreLow = totalStoreStock <= (lowStockThreshold * product.sizes.length);
                            const isStoreOut = totalStoreStock === 0;

                            const totalWhStock = product.sizes.reduce((acc, s) => acc + s.warehouseStock, 0);
                            const isWhLow = totalWhStock <= (lowStockThreshold * product.sizes.length);
                            const isWhOut = totalWhStock === 0;

                            return (
                                <React.Fragment key={product.id}>
                                    <tr 
                                        className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all group cursor-pointer ${isExpanded ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
                                        onClick={() => toggleExpand(product.id)}
                                    >
                                        <td className="p-5 text-center">
                                            <div className={`transition-all duration-300 transform ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-gray-300'}`}>
                                                <ChevronDown size={18} />
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 overflow-hidden relative shadow-inner shrink-0">
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-gray-900 dark:text-white truncate text-sm leading-tight">{product.name}</div>
                                                    <div className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter mt-0.5">{product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                              {product.category || 'NO COLLECTION'}
                                           </span>
                                        </td>
                                        <td className="p-5 text-right font-black text-gray-900 dark:text-white text-base tracking-tight">
                                            {product.price.toLocaleString()}
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className={`text-sm font-black flex items-center gap-1.5 ${isStoreOut ? 'text-red-500' : isStoreLow ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                    {isStoreOut ? <XCircle size={14} /> : isStoreLow ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                                                    {totalStoreStock}
                                                </div>
                                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-0.5">
                                                    {isStoreOut ? 'Out' : isStoreLow ? 'Low' : 'OK'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className={`text-sm font-black flex items-center gap-1.5 ${isWhOut ? 'text-red-500 font-black' : isWhLow ? 'text-amber-500' : 'text-indigo-600'}`}>
                                                    {isWhOut ? <Archive size={14} className="text-red-500" /> : isWhLow ? <Archive size={14} className="text-amber-500" /> : <Archive size={14} className="opacity-40" />}
                                                    {totalWhStock}
                                                </div>
                                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-0.5">
                                                    {isWhOut ? 'Empty' : isWhLow ? 'Refill' : 'Wh OK'}
                                                </span>
                                            </div>
                                        </td>
                                        {!isReadOnly && (
                                          <td className="p-5 text-right" onClick={(e) => e.stopPropagation()}>
                                              <div className="flex items-center justify-end gap-2">
                                                  <button 
                                                      onClick={() => handleOpenMetadataEdit(product)}
                                                      className="p-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                                                      title="Modify Article"
                                                  >
                                                      <Pencil size={18} />
                                                  </button>
                                                  <button 
                                                      onClick={() => setProductToDelete(product)}
                                                      className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                                                      title="Permanently Delete"
                                                  >
                                                      <Trash2 size={18} />
                                                  </button>
                                              </div>
                                          </td>
                                        )}
                                    </tr>

                                    {isExpanded && (
                                        <tr className="bg-gray-50/30 dark:bg-gray-900/40 animate-in slide-in-from-top-2 duration-300 border-b border-gray-100 dark:border-gray-700">
                                            <td colSpan={7} className="p-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {product.sizes.map((size, idx) => {
                                                        const storeIsLow = size.stock < lowStockThreshold;
                                                        const storeIsOut = size.stock === 0;

                                                        const whIsLow = size.warehouseStock < lowStockThreshold;
                                                        const whIsOut = size.warehouseStock === 0;

                                                        return (
                                                            <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between group/variant transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900">
                                                                <div className={`absolute top-0 left-0 w-1.5 h-full ${whIsOut ? 'bg-red-500' : whIsLow ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
                                                                
                                                                <div className="flex justify-between items-start">
                                                                    <div className="min-w-0">
                                                                        <span className="text-xs font-black text-indigo-600 block uppercase tracking-tighter">Size: {size.sizeInternal}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold uppercase truncate">{size.size} Variant</span>
                                                                    </div>
                                                                    {!isReadOnly && (
                                                                      <button 
                                                                          onClick={() => handleOpenStockEdit(product, idx)}
                                                                          className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all"
                                                                          title="Variant Settings"
                                                                      >
                                                                          <Settings2 size={14} />
                                                                      </button>
                                                                    )}
                                                                </div>

                                                                <div className="flex justify-between items-end mt-6">
                                                                    <div className="space-y-2">
                                                                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${storeIsOut ? 'text-red-500' : storeIsLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                                            <Store size={12} /> <span>{size.stock} in store</span>
                                                                        </div>
                                                                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${whIsOut ? 'text-red-600 bg-red-50 dark:bg-red-900/20 px-1 rounded' : whIsLow ? 'text-amber-600' : 'text-gray-400'}`}>
                                                                            <Archive size={12} className={whIsOut ? 'opacity-100' : 'opacity-50'} /> <span>{size.warehouseStock} in wh</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[9px] font-black font-mono text-gray-300 dark:text-gray-600">V-{idx+1}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-32 text-center bg-gray-50/20 dark:bg-gray-900/10">
                                    <div className="inline-flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 flex-col animate-in zoom-in-95">
                                        <Archive size={56} className="mb-6 text-gray-100 dark:text-gray-700" strokeWidth={1.5} />
                                        <p className="text-gray-400 dark:text-gray-500 font-bold px-10">No articles match your Warehouse criteria.</p>
                                        <button 
                                            onClick={resetFilters}
                                            className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
                                        >
                                            <RotateCcw size={14} />
                                            Reset Filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <BarcodeScannerModal 
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          onScan={handleBarcodeScanned}
        />

        <ProductModal 
            isOpen={isMetadataModalOpen}
            onClose={() => setIsMetadataModalOpen(false)}
            onSave={(p) => {
                if (editingProduct) onEditProduct(p);
                else onAddProduct(p);
            }}
            product={editingProduct}
            prefilledSku={prefilledSku}
            collections={collections}
            brands={brands}
            userRole={currentUserRole}
        />

        <StockUpdateModal 
            isOpen={isStockUpdateModalOpen}
            onClose={() => { setIsStockUpdateModalOpen(false); setEditingSizeIndex(-1); }}
            product={editingProduct}
            sizeIndex={editingSizeIndex}
            onSave={onEditProduct}
            userRole={currentUserRole}
        />
        
        {productToDelete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center border border-white/10">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <Trash2 size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Erase Article?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">This will permanently delete <span className="text-gray-900 dark:text-white font-black">{productToDelete.name}</span> and all associated variant stock history.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setProductToDelete(null)} className="py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">Dismiss</button>
                        <button onClick={() => { onDeleteProduct(productToDelete.id); setProductToDelete(null); }} className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-200 dark:shadow-none">Confirm Delete</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default InventoryList;
