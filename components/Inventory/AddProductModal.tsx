
import React, { useState, useEffect } from 'react';
import { X, Package, Palette, Check, ChevronRight, ChevronLeft, Store, Archive, AlertCircle, Info, Layers, Tag, Sparkles } from 'lucide-react';
import { Product, UserRole, ProductSize } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Product) => void;
  product?: Product | null;
  prefilledSku?: string | null;
  readOnly?: boolean;
  collections: string[];
  userRole: UserRole | null;
}

const SIZE_OPTIONS = [
  { internal: '1', display: 'XS' },
  { internal: '1.5', display: 'S' },
  { internal: '2', display: 'M' },
  { internal: '2.5', display: 'L' },
  { internal: '3', display: 'XL' }
];

const ProductModal: React.FC<ProductModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    product, 
    prefilledSku,
    readOnly = false,
    collections,
    userRole
}) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]); 
  const [variantStocks, setVariantStocks] = useState<Record<string, { store: string; wh: string }>>({});

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '', 
    price: '',
    description: '',
    image: '',
    material_type: '',
    color: '',
  });

  const isEditMode = !!product;
  const isStoreLocked = userRole === 'Warehouse';

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setError(null);
      if (product) {
        const initialStocks: Record<string, { store: string; wh: string }> = {};
        product.sizes.forEach(s => {
          initialStocks[s.sizeInternal] = { 
            store: s.stock.toString(), 
            wh: s.warehouseStock.toString() 
          };
        });
        
        setVariantStocks(initialStocks);
        setSelectedSizes(product.sizes.map(s => s.sizeInternal));

        setFormData({
          sku: product.id,
          name: product.name,
          category: product.category || '',
          price: product.price.toString(),
          description: product.description || '',
          image: product.image || '',
          material_type: product.material_type || '',
          color: product.color || '',
        });
      } else {
        setSelectedSizes([]);
        setVariantStocks({});
        setFormData({
          sku: prefilledSku || '',
          name: '',
          category: '', 
          price: '',
          description: '',
          image: '',
          material_type: '',
          color: '',
        });
      }
    }
  }, [isOpen, product, prefilledSku]);

  if (!isOpen) return null;

  const handleToggleSize = (internal: string) => {
    if (selectedSizes.includes(internal)) {
      setSelectedSizes(prev => prev.filter(s => s !== internal));
      const newStocks = { ...variantStocks };
      delete newStocks[internal];
      setVariantStocks(newStocks);
    } else {
      setSelectedSizes(prev => [...prev, internal]);
      setVariantStocks(prev => ({
        ...prev,
        [internal]: { store: '', wh: '' }
      }));
    }
  };

  const updateVariantStock = (internal: string, field: 'store' | 'wh', value: string) => {
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10000)) {
        setVariantStocks(prev => ({
          ...prev,
          [internal]: {
            ...prev[internal],
            [field]: value
          }
        }));
    }
  };

  const handleNext = () => {
    if (step === 0) {
      if (!formData.sku || !formData.name || !formData.price) {
        setError("Article Code, Name, and Price are mandatory.");
        return;
      }
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (selectedSizes.length === 0) {
      setError("Select at least one variant.");
      return;
    }
    
    const finalSizes: ProductSize[] = selectedSizes.map(internal => {
        const opt = SIZE_OPTIONS.find(o => o.internal === internal);
        const stockData = variantStocks[internal] || { store: '', wh: '' };
        return {
            size: opt?.display || 'Unknown',
            sizeInternal: internal,
            stock: parseInt(stockData.store) || 0,
            warehouseStock: parseInt(stockData.wh) || 0
        };
    });

    const payload: Product = {
        id: formData.sku.trim(),
        name: formData.name.trim(),
        category: formData.category || 'Uncategorized',
        price: parseFloat(formData.price) || 0,
        image: formData.image.trim() || `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(formData.name)}`,
        description: formData.description.trim(),
        material_type: formData.material_type.trim(),
        color: formData.color.trim(),
        createdAt: product?.createdAt || new Date().toISOString(),
        sizes: finalSizes
    };

    onSave(payload);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'price' && value !== '' && (parseFloat(value) < 0 || parseFloat(value) > 1000000)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/10 dark:border-gray-800 transition-all duration-300">
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Package size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold dark:text-white uppercase tracking-tight">
                    {isEditMode ? 'Modify Article' : 'New Article Entry'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Identity System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            {error && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {step === 0 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Article SKU *</label>
                            <input disabled={isEditMode} name="sku" value={formData.sku} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-mono text-sm border-none focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50" placeholder="SKU Code" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Design Name *</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-bold text-sm border-none focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Product Name" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Collection Stream *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-bold text-sm border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                                <option value="">Select Collection</option>
                                {collections.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Retail Price (₨) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-black text-sm border-none focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Material Composition</label>
                            <input name="material_type" value={formData.material_type} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border-none outline-none" placeholder="e.g. Lawn / Silk" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Color Palette</label>
                            <input name="color" value={formData.color} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border-none outline-none" placeholder="Primary Color" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border-none outline-none resize-none" placeholder="Styling notes..." />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {SIZE_OPTIONS.map(opt => (
                            <button
                                key={opt.internal}
                                type="button"
                                onClick={() => handleToggleSize(opt.internal)}
                                className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                                    selectedSizes.includes(opt.internal)
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
                                }`}
                            >
                                {opt.display}
                            </button>
                        ))}
                    </div>
                    {selectedSizes.length > 0 && (
                        <div className="space-y-3">
                            {selectedSizes.map(internal => {
                                const opt = SIZE_OPTIONS.find(o => o.internal === internal);
                                const stocks = variantStocks[internal] || { store: '', wh: '' };
                                return (
                                    <div key={internal} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="col-span-4 text-xs font-bold dark:text-white uppercase tracking-widest">{opt?.display} Variant</div>
                                        <div className="col-span-4">
                                            <input disabled={isStoreLocked} type="number" value={stocks.store} onChange={(e) => updateVariantStock(internal, 'store', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-none rounded-lg text-xs font-bold outline-none" placeholder="Store Qty" />
                                        </div>
                                        <div className="col-span-4">
                                            <input type="number" value={stocks.wh} onChange={(e) => updateVariantStock(internal, 'wh', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-none rounded-lg text-xs font-bold outline-none" placeholder="Wh Qty" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex gap-4">
            <button type="button" onClick={step === 0 ? onClose : handleBack} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm uppercase tracking-widest transition-all">
                {step === 0 ? 'Cancel' : 'Previous'}
            </button>
            <button type="button" onClick={step === 2 ? handleSubmit : handleNext} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none">
                {step === 2 ? 'Save Article' : 'Continue'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
