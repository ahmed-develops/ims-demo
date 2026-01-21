import React, { useState } from 'react';
import { Plus, Trash2, Layers, Package } from 'lucide-react';
import { Product } from '../../types';

interface CategoriesViewProps {
  categories: string[];
  products: Product[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onAddCategory,
  onDeleteCategory
}) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories Management</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create categories and view associated products.</p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Layers size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Category</h2>
                </div>
            </div>
             <form onSubmit={handleAddCat} className="flex gap-2 max-w-md">
                <input 
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g., Smoothies"
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button 
                    type="submit"
                    disabled={!newCategory.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Add</span>
                </button>
            </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
                const associatedProducts = products.filter(p => p.category === cat);
                return (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col h-full">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-700/30">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{cat}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{associatedProducts.length} items</p>
                            </div>
                            <button 
                                onClick={() => onDeleteCategory(cat)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete Category"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        
                        <div className="p-4 flex-1 bg-white dark:bg-gray-800 overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                             {associatedProducts.length > 0 ? (
                                <ul className="space-y-2">
                                    {associatedProducts.map(p => (
                                        <li key={p.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <Package size={14} className="text-indigo-400" />
                                            <span className="truncate">{p.name}</span>
                                        </li>
                                    ))}
                                </ul>
                             ) : (
                                 <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic py-4">
                                     <span>No items in this category</span>
                                 </div>
                             )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesView;