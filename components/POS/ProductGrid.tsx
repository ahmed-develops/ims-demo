
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, X, Ruler, ChevronDown, Check, Barcode, MousePointer2 } from 'lucide-react';
import { Product, ProductSize, CartItem } from '../../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, selectedSize: ProductSize) => void;
  collections: string[];
  cart: CartItem[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, collections, cart }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sizePickerProduct, setSizePickerProduct] = useState<Product | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScanMode, setIsScanMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filterCollections = ['All', 'Discounted', ...collections];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCollection = selectedFilter === 'All' || 
                                (selectedFilter === 'Discounted' ? (product.discount || 0) > 0 : product.category === selectedFilter);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             product.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCollection && matchesSearch;
    });
  }, [products, selectedFilter, searchQuery]);

  // Keep input focused in Scan Mode
  useEffect(() => {
    if (isScanMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanMode]);

  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    // 1. Try exact variant barcode match
    let foundProduct: Product | undefined;
    let foundSize: ProductSize | undefined;

    for (const p of products) {
      const sizeMatch = p.sizes.find(s => 
        (s.barcode?.toUpperCase() === query) || 
        (`${p.id}-${s.sizeInternal}`.toUpperCase() === query)
      );
      if (sizeMatch) {
        foundProduct = p;
        foundSize = sizeMatch;
        break;
      }
    }

    // 2. Try exact base SKU match
    if (!foundProduct) {
      foundProduct = products.find(p => p.id.toUpperCase() === query);
      if (foundProduct && foundProduct.sizes.length === 1) {
        foundSize = foundProduct.sizes[0];
      }
    }

    if (foundProduct) {
      if (foundSize) {
        onAddToCart(foundProduct, foundSize);
        // Visual feedback pulse can be added here
      } else {
        // Multiple sizes available for this SKU
        setSizePickerProduct(foundProduct);
      }
      setSearchQuery('');
    } else {
      // Potentially show "No Item Found" toast here
    }
  };

  const handleQuickAdd = (product: Product) => {
    if (product.sizes.length === 1) {
      onAddToCart(product, product.sizes[0]);
    } else {
      setSizePickerProduct(product);
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isScanMode ? 'text-indigo-600' : 'text-gray-400'}`}>
               {isScanMode ? <Barcode size={18} strokeWidth={2.5} /> : <Search size={18} />}
            </div>
            
            <form onSubmit={(e) => isScanMode ? handleBarcodeSubmit(e) : e.preventDefault()}>
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                placeholder={isScanMode ? "READY TO SCAN..." : "Search SKU or Name..."}
                className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 rounded-2xl text-gray-900 dark:text-white outline-none transition-all shadow-sm font-bold text-sm ${
                  isScanMode 
                  ? 'border-indigo-500 ring-4 ring-indigo-500/10 placeholder:text-indigo-300' 
                  : 'border-transparent focus:border-indigo-500'
                }`}
                value={searchQuery}
                onChange={(e) => { 
                  setSearchQuery(e.target.value); 
                  if (!isScanMode) setIsDropdownOpen(true); 
                }}
                onFocus={() => !isScanMode && setIsDropdownOpen(true)}
              />
            </form>

            {!isScanMode && (
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronDown size={20} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isDropdownOpen && searchQuery && !isScanMode && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[1.5rem] shadow-2xl overflow-hidden max-h-72 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                  {filteredProducts.length > 0 ? filteredProducts.map(p => (
                      <button 
                          key={p.id}
                          onClick={() => handleQuickAdd(p)}
                          className="w-full p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left flex items-center gap-4 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0"
                      >
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1">
                              <p className="font-black text-xs dark:text-white uppercase">{p.name}</p>
                              <p className="text-[10px] text-indigo-600 font-bold">{p.id}</p>
                          </div>
                          <span className="font-black text-xs dark:text-gray-400">₨ {p.price.toFixed(0)}</span>
                      </button>
                  )) : (
                      <div className="p-10 text-center text-gray-400 text-xs font-black uppercase tracking-widest italic">No matching articles</div>
                  )}
              </div>
            )}
          </div>

          {/* Mode Toggle Switch */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 h-[52px]">
            <button
              onClick={() => setIsScanMode(false)}
              className={`flex items-center gap-2 px-4 rounded-xl transition-all ${!isScanMode ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Search Mode"
            >
              <MousePointer2 size={18} />
              <span className="text-[10px] font-black uppercase hidden lg:block tracking-widest">Search</span>
            </button>
            <button
              onClick={() => setIsScanMode(true)}
              className={`flex items-center gap-2 px-4 rounded-xl transition-all ${isScanMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              title="Barcode Scan Mode"
            >
              <Barcode size={18} />
              <span className="text-[10px] font-black uppercase hidden lg:block tracking-widest">Scan</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {filterCollections.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-5 py-2 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${
                selectedFilter === cat
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const totalStock = product.sizes.reduce((acc, s) => acc + s.stock, 0);
            const isOutOfStock = totalStock <= 0;
            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && handleQuickAdd(product)}
                className={`bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-transparent flex flex-col h-full transition-all group ${
                  isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:border-indigo-500/20'
                }`}
              >
                <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[9px] font-black uppercase bg-red-600 px-3 py-1.5 rounded-full tracking-widest">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-black text-gray-900 dark:text-gray-100 text-xs mb-1 uppercase tracking-tight truncate">{product.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">{product.id}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm tracking-tighter">₨ {product.price.toFixed(0)}</span>
                    <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter">{product.sizes.length} VARIANTS</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sizePickerProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 pb-4 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                  <Ruler size={20} />
                </div>
                <h3 className="font-black text-lg text-gray-900 dark:text-white tracking-tight uppercase">Select Variant</h3>
              </div>
              <button onClick={() => setSizePickerProduct(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 gap-3">
                {sizePickerProduct.sizes.map((s, idx) => {
                    const inCartQty = cart.find(item => item.id === sizePickerProduct.id && item.selectedSize.sizeInternal === s.sizeInternal)?.quantity || 0;
                    const effectiveStock = s.stock - inCartQty;
                    const isOut = effectiveStock <= 0;
                    return (
                        <button
                            key={idx}
                            disabled={isOut}
                            onClick={() => { onAddToCart(sizePickerProduct, s); setSizePickerProduct(null); }}
                            className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${
                                isOut ? 'bg-gray-50 dark:bg-gray-900 border-transparent opacity-40 grayscale cursor-not-allowed' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 active:scale-95'
                            }`}
                        >
                            <div className="text-left">
                                <span className="block font-black text-sm dark:text-white uppercase tracking-widest">Size {s.sizeInternal} — {s.size}</span>
                                <span className={`text-[10px] font-bold ${isOut ? 'text-red-500' : 'text-gray-400'} uppercase tracking-widest mt-1`}>
                                    {isOut ? 'Stock Exhausted' : `${effectiveStock} Units Ready`}
                                </span>
                            </div>
                            {!isOut && <Check size={20} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
