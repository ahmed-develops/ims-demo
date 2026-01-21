
import React, { useState, useEffect } from 'react';
import { X, Save, Archive, Store, Package, Lock } from 'lucide-react';
import { Product, ProductSize, UserRole } from '../../types';

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  sizeIndex?: number; // Focused size index
  onSave: (updatedProduct: Product) => void;
  userRole: UserRole | null;
}

const StockUpdateModal: React.FC<StockUpdateModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  sizeIndex = -1, 
  onSave,
  userRole
}) => {
  // Use a string-based local state for variant fields to allow clearing
  const [localInputStocks, setLocalInputStocks] = useState<Record<number, { stock: string; warehouseStock: string }>>({});

  useEffect(() => {
    if (product) {
      const initial: Record<number, { stock: string; warehouseStock: string }> = {};
      product.sizes.forEach((s, i) => {
        initial[i] = {
          stock: s.stock.toString(),
          warehouseStock: s.warehouseStock.toString()
        };
      });
      setLocalInputStocks(initial);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleUpdateStock = (index: number, field: 'stock' | 'warehouseStock', value: string) => {
    setLocalInputStocks(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const handleConfirm = () => {
    const updatedSizes = product.sizes.map((s, i) => {
        const input = localInputStocks[i];
        return {
            ...s,
            stock: parseInt(input?.stock) || 0,
            warehouseStock: parseInt(input?.warehouseStock) || 0
        };
    });
    onSave({ ...product, sizes: updatedSizes });
    onClose();
  };

  const sizesToRender = sizeIndex !== -1 && product.sizes[sizeIndex] 
    ? [{ size: product.sizes[sizeIndex], originalIndex: sizeIndex }] 
    : product.sizes.map((s, i) => ({ size: s, originalIndex: i }));

  const isStoreLocked = userRole === 'Warehouse';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Package size={20} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</h3>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-0.5">
                    {sizeIndex !== -1 ? 'Isolated Variant Update' : 'Stock Level Management'}
                </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {isStoreLocked && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-xs">
                    <Lock size={14} className="shrink-0" />
                    <p>As a Warehouse Manager, you can only update Warehouse stock. Store quantities are locked.</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {sizesToRender.map(({ size, originalIndex }) => (
                    <div key={originalIndex} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Size: {size.sizeInternal} ({size.size})</span>
                            <span className="text-[10px] font-mono text-gray-400">Article Price: ₨ {product.price}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1">
                                    <Store size={10} /> Store Qty {isStoreLocked && <Lock size={8} />}
                                </label>
                                <div className="relative">
                                    <input 
                                        disabled={isStoreLocked}
                                        type="number"
                                        value={localInputStocks[originalIndex]?.stock || ''}
                                        onChange={(e) => handleUpdateStock(originalIndex, 'stock', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${
                                            isStoreLocked 
                                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed opacity-60' 
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white'
                                        }`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1">
                                    <Archive size={10} /> Wh Qty
                                </label>
                                <input 
                                    type="number"
                                    value={localInputStocks[originalIndex]?.warehouseStock || ''}
                                    onChange={(e) => handleUpdateStock(originalIndex, 'warehouseStock', e.target.value)}
                                    className="w-full px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {sizeIndex !== -1 && (
                <p className="text-[10px] text-gray-400 text-center italic">
                    Note: You are only editing stocks for the selected size. Other variants remain unchanged.
                </p>
            )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors">Cancel</button>
            <button 
                onClick={handleConfirm}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
            >
                <Save size={18} />
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
