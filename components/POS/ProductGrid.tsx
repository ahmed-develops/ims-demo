
import React, { useState, useMemo } from 'react';
import { Search, Plus, Tag, X, Ruler, Check } from 'lucide-react';
import { Product, ProductSize, CartItem } from '../../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, selectedSize: ProductSize) => void;
  collections: string[];
  cart: CartItem[]; // New prop for stock calculation
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, collections, cart }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sizePickerProduct, setSizePickerProduct] = useState<Product | null>(null);

  const filterCollections = ['All', 'Discounted', ...collections];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      let matchesCollection = true;
      if (selectedFilter === 'All') {
        matchesCollection = true;
      } else if (selectedFilter === 'Discounted') {
        matchesCollection = (product.discount || 0) > 0;
      } else {
        matchesCollection = product.category === selectedFilter;
      }
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCollection && matchesSearch;
    });
  }, [products, selectedFilter, searchQuery]);

  const handleProductClick = (product: Product) => {
    if (product.sizes.length === 1) {
      onAddToCart(product, product.sizes[0]);
    } else {
      setSizePickerProduct(product);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {filterCollections.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                selectedFilter === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const totalStock = product.sizes.reduce((acc, s) => acc + s.stock, 0);
            const isOutOfStock = totalStock <= 0;
            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && handleProductClick(product)}
                className={`bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-all ${
                  isOutOfStock ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'cursor-pointer hover:shadow-md group'
                }`}
              >
                <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold uppercase bg-red-600 px-2 py-1 rounded">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{product.name}</h3>
                  <p className="text-[10px] text-gray-400 mb-2">{product.category}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">₨ {product.price.toFixed(0)}</span>
                    <span className="text-[10px] text-gray-400">{product.sizes.length} sizes</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Size Picker Modal - Updated for real-time stock and cart highlights */}
      {sizePickerProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Ruler size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Select Size</h3>
              </div>
              <button onClick={() => setSizePickerProduct(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
                <div className="w-14 h-14 rounded-xl overflow-hidden shadow-inner shrink-0">
                  <img src={sizePickerProduct.image} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-base truncate dark:text-white leading-tight">{sizePickerProduct.name}</p>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">₨ {sizePickerProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {sizePickerProduct.sizes.map((s, idx) => {
                    // Calculate quantity of THIS specific variant currently in cart
                    const inCartQty = cart.find(item => 
                      item.id === sizePickerProduct.id && 
                      item.selectedSize.sizeInternal === s.sizeInternal
                    )?.quantity || 0;

                    const effectiveStock = s.stock - inCartQty;
                    const isOut = effectiveStock <= 0;

                    return (
                        <button
                            key={idx}
                            disabled={isOut}
                            onClick={() => { onAddToCart(sizePickerProduct, s); setSizePickerProduct(null); }}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                                isOut 
                                ? 'bg-gray-50 dark:bg-gray-800/50 border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
                            }`}
                        >
                            <div className="text-left">
                                <span className="block font-black text-sm dark:text-white uppercase tracking-tight">Variant {s.sizeInternal} ({s.size})</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isOut ? 'text-red-400' : 'text-gray-400'}`}>
                                    {isOut ? 'Out of Stock' : `${effectiveStock} Available in Store`}
                                  </span>
                                  {inCartQty > 0 && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-md animate-in fade-in slide-in-from-left-1 duration-200">
                                      -{inCartQty} IN CART
                                    </span>
                                  )}
                                </div>
                            </div>
                            {!isOut && <Plus size={18} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    );
                })}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Node #042</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
