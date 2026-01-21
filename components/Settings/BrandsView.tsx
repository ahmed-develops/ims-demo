
import React, { useState } from 'react';
import { Plus, Trash2, Tag, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';

interface BrandsViewProps {
  brands: string[];
  products: Product[];
  onAddBrand: (brand: string) => void;
  onDeleteBrand: (brand: string) => void;
}

const BrandsView: React.FC<BrandsViewProps> = ({
  brands = [],
  products = [],
  onAddBrand,
  onDeleteBrand
}) => {
  const [newBrand, setNewBrand] = useState('');

  const handleAddBr = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBrand.trim();
    if (trimmed && !brands.includes(trimmed)) {
      onAddBrand(trimmed);
      setNewBrand('');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands Management</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Organize your inventory by brands and suppliers.</p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Tag size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Brand</h2>
                </div>
            </div>
             <form onSubmit={handleAddBr} className="flex gap-2 max-w-md">
                <input 
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g., Local Farms"
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                />
                <button 
                    type="submit"
                    disabled={!newBrand.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Add</span>
                </button>
            </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => {
                const associatedProducts = products.filter(p => p.brand === brand);
                return (
                    <div key={brand} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col h-full">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-700/30">
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">{brand}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{associatedProducts.length} items</p>
                            </div>
                            <button 
                                onClick={() => onDeleteBrand(brand)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Delete Brand"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        
                        <div className="p-4 flex-1 bg-white dark:bg-gray-800 overflow-y-auto max-h-[200px]">
                             {associatedProducts.length > 0 ? (
                                <ul className="space-y-2">
                                    {associatedProducts.map(p => (
                                        <li key={p.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <ShoppingBag size={14} className="text-emerald-400 shrink-0" />
                                            <span className="truncate">{p.name}</span>
                                        </li>
                                    ))}
                                </ul>
                             ) : (
                                 <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic py-4">
                                     <span>No items linked to this brand</span>
                                 </div>
                             )}
                        </div>
                    </div>
                );
            })}
            {brands.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    No brands defined. Add one above.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BrandsView;
