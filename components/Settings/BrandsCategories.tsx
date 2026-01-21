import React, { useState } from 'react';
import { Plus, Trash2, Tag, Layers, Search } from 'lucide-react';

interface BrandsCategoriesProps {
  categories: string[];
  brands: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onAddBrand: (brand: string) => void;
  onDeleteBrand: (brand: string) => void;
}

const BrandsCategories: React.FC<BrandsCategoriesProps> = ({
  categories,
  brands,
  onAddCategory,
  onDeleteCategory,
  onAddBrand,
  onDeleteBrand
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleAddBr = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBrand.trim() && !brands.includes(newBrand.trim())) {
      onAddBrand(newBrand.trim());
      setNewBrand('');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands & Categories</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage product classifications and brand lists.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Categories Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[600px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Organize products into groups</p>
                    </div>
                </div>

                <form onSubmit={handleAddCat} className="flex gap-2 mb-4">
                    <input 
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New Category Name..."
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                    <button 
                        type="submit"
                        disabled={!newCategory.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                            <span className="font-medium text-gray-700 dark:text-gray-200">{cat}</span>
                            <button 
                                onClick={() => onDeleteCategory(cat)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Category"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                            No categories added yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Brands Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-[600px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <Tag size={20} />
                    </div>
                     <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Brands</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage product brands</p>
                    </div>
                </div>

                <form onSubmit={handleAddBr} className="flex gap-2 mb-4">
                    <input 
                        type="text"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        placeholder="New Brand Name..."
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                    <button 
                        type="submit"
                        disabled={!newBrand.trim()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {brands.map((brand, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                            <span className="font-medium text-gray-700 dark:text-gray-200">{brand}</span>
                            <button 
                                onClick={() => onDeleteBrand(brand)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Brand"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {brands.length === 0 && (
                         <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                            No brands added yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BrandsCategories;