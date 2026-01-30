
import React, { useState } from 'react';
import { Plus, Trash2, Layers, Search, Info } from 'lucide-react';
import { Product } from '../../types';
import ConfirmationModal from '../UI/ConfirmationModal';

interface CollectionsViewProps {
  collections: string[];
  products: Product[];
  onAddCollection: (collection: string) => void;
  onDeleteCollection: (collection: string) => void;
}

const CollectionsView: React.FC<CollectionsViewProps> = ({ collections = [], products = [], onAddCollection, onDeleteCollection }) => {
  const [newCollection, setNewCollection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  const handleAddColl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCollection.trim();
    if (trimmed && !collections.includes(trimmed)) {
      onAddCollection(trimmed);
      setNewCollection('');
    }
  };

  const filteredCollections = collections.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collections Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Define product streams and seasonal categories.</p>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text"
                    placeholder="Search collections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                />
            </div>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <form onSubmit={handleAddColl} className="flex gap-3">
                <div className="relative flex-1">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        maxLength={35}
                        value={newCollection}
                        onChange={(e) => setNewCollection(e.target.value)}
                        placeholder="Enter new collection name (e.g. Summer Eid '25)"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                    />
                </div>
                <button 
                    type="submit"
                    disabled={!newCollection.trim()}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                    <Plus size={18} />
                    <span>Create</span>
                </button>
            </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollections.map((coll) => {
                const count = products.filter(p => p.category === coll).length;
                return (
                    <div key={coll} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Layers size={20} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">{coll}</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{count} Articles</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setCollectionToDelete(coll)} 
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            })}
        </div>

        {filteredCollections.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <Layers size={48} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">No collections found matching your search.</p>
            </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!collectionToDelete}
        onClose={() => setCollectionToDelete(null)}
        onConfirm={() => collectionToDelete && onDeleteCollection(collectionToDelete)}
        title="Remove Collection?"
        message={`Are you sure you want to delete "${collectionToDelete}"? All items in this collection will become uncategorized.`}
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default CollectionsView;
