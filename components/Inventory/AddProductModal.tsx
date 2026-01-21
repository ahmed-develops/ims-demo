
import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Palette, Check, ChevronRight, ChevronLeft, Store, Archive, Lock, AlertCircle, Info, Layers, Tag, Sparkles } from 'lucide-react';
import { Product, UserRole, ProductSize } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Product) => void;
  product?: Product | null;
  prefilledSku?: string | null;
  readOnly?: boolean;
  collections: string[];
  brands: string[];
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
    brands,
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
    brand: '',    
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
          brand: product.brand || '',
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
          brand: '',    
          price: '', // Empty instead of 0
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
        [internal]: { store: '', wh: '' } // Use empty strings
      }));
    }
  };

  const updateVariantStock = (internal: string, field: 'store' | 'wh', value: string) => {
    setVariantStocks(prev => ({
      ...prev,
      [internal]: {
        ...prev[internal],
        [field]: value
      }
    }));
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
      setError("At least one size variant must be selected.");
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
        category: formData.category || null as any,
        brand: formData.brand || null as any,
        price: parseFloat(formData.price) || 0,
        image: formData.image.trim() || `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(formData.name)}`,
        description: formData.description.trim() || null as any,
        material_type: formData.material_type.trim() || null as any,
        color: formData.color.trim() || null as any,
        createdAt: product?.createdAt || new Date().toISOString(),
        sizes: finalSizes
    };

    onSave(payload);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-10 px-8">
        {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === i ? 'bg-indigo-600 text-white scale-110 shadow-xl ring-4 ring-indigo-50 dark:ring-indigo-900/20' : 
                    step > i ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}>
                    {step > i ? <Check size={18} strokeWidth={3} /> : i + 1}
                </div>
                {i < 2 && <div className={`w-16 h-1 rounded-full transition-colors duration-500 ${step > i ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-700'}`} />}
            </React.Fragment>
        ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20 transition-all duration-300">
        <div className="p-8 pb-4 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <Package size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {isEditMode ? 'Modify Article' : 'New Article Entry'}
                </h3>
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} />
                    {step === 0 ? 'Step 1: Identity' : step === 1 ? 'Step 2: Aesthetics & Material' : 'Step 3: Initial Variants & Stock'}
                </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-hide">
            {renderStepIndicator()}

            {error && (
                <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-3xl flex items-center gap-4 text-red-600 dark:text-red-400 text-sm animate-in slide-in-from-top-4 duration-300">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Article SKU / Code <span className="text-red-500">*</span></label>
                            <input 
                                required
                                disabled={isEditMode}
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white font-mono text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                                placeholder="e.g. ART-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Display Name <span className="text-red-500">*</span></label>
                            <input 
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                placeholder="e.g. Silk Evening Gown"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Layers size={12}/> Collection</label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none transition-all"
                            >
                                <option value="">Please select...</option>
                                {collections.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Tag size={12}/> Brand</label>
                            <select 
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none transition-all"
                            >
                                <option value="">Please select...</option>
                                {brands.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Retail Price (₨) <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">₨</div>
                                <input 
                                    required
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white font-black text-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Material Composition</label>
                            <input 
                                name="material_type"
                                value={formData.material_type}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                placeholder="e.g. 100% Pima Cotton"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Color Shade</label>
                            <div className="relative group">
                                <Palette className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input 
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="e.g. Charcoal Gray"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Article Description</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-3xl text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none transition-all"
                            placeholder="Detail the fit, style notes, and care instructions..."
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div>
                        <div className="flex items-center gap-3 mb-6 ml-1">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Select Sizes <span className="text-red-500">*</span></label>
                            <Info size={14} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {SIZE_OPTIONS.map(opt => (
                                <button
                                    key={opt.internal}
                                    type="button"
                                    onClick={() => handleToggleSize(opt.internal)}
                                    className={`px-6 py-4 rounded-[1.5rem] text-sm font-black border-2 transition-all flex items-center gap-4 ${
                                        selectedSizes.includes(opt.internal)
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50/30'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                        selectedSizes.includes(opt.internal) ? 'bg-white border-white text-indigo-600' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                    }`}>
                                        {selectedSizes.includes(opt.internal) && <Check size={14} strokeWidth={4} />}
                                    </div>
                                    <div className="text-left">
                                        <div className="leading-none">{opt.display}</div>
                                        <div className="text-[9px] opacity-60 font-mono tracking-tighter mt-1">INTERNAL: {opt.internal}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedSizes.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2 ml-1">
                                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Initial Inventory Allocation</label>
                            </div>
                            <div className="space-y-4">
                                {selectedSizes.map(internal => {
                                    const opt = SIZE_OPTIONS.find(o => o.internal === internal);
                                    const stocks = variantStocks[internal] || { store: '', wh: '' };
                                    return (
                                        <div key={internal} className="grid grid-cols-12 gap-5 items-center p-5 bg-gray-50 dark:bg-gray-700/20 rounded-[1.5rem] border border-gray-50 dark:border-gray-700/50 animate-in slide-in-from-bottom-4 duration-300">
                                            <div className="col-span-4 lg:col-span-3">
                                                <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{opt?.display}</div>
                                                <div className="text-[9px] font-black text-indigo-500/70">VARIANT {internal}</div>
                                            </div>
                                            <div className="col-span-4 relative group">
                                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                                <input 
                                                    disabled={isStoreLocked}
                                                    type="number"
                                                    value={stocks.store}
                                                    onChange={(e) => updateVariantStock(internal, 'store', e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none disabled:opacity-40 transition-all"
                                                    placeholder="Store"
                                                />
                                            </div>
                                            <div className="col-span-4 relative group">
                                                <Archive className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                                                <input 
                                                    type="number"
                                                    value={stocks.wh}
                                                    onChange={(e) => updateVariantStock(internal, 'wh', e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                                    placeholder="WH"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center border-4 border-dashed border-gray-50 dark:border-gray-700/50 rounded-[3rem] transition-all">
                            <Package size={56} className="mx-auto mb-6 text-gray-100 dark:text-gray-700" />
                            <p className="text-gray-400 dark:text-gray-500 text-sm font-bold px-10">Select at least one variant size above to initialize stock distribution.</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="p-10 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 shrink-0 flex gap-6">
            {step > 0 ? (
                <button 
                    type="button" 
                    onClick={handleBack} 
                    className="flex-1 py-5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-[1.5rem] font-black text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-100 dark:border-gray-600 flex items-center justify-center gap-3 shadow-sm active:scale-95"
                >
                    <ChevronLeft size={22} strokeWidth={3} />
                    Back
                </button>
            ) : (
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="flex-1 py-5 bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-400 rounded-[1.5rem] font-black text-sm hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all border border-gray-100 dark:border-gray-700 active:scale-95"
                >
                    Dismiss
                </button>
            )}

            {step < 2 ? (
                <button 
                    type="button" 
                    onClick={handleNext} 
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 group active:scale-95"
                >
                    Next Step
                    <ChevronRight size={22} strokeWidth={3} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
            ) : (
                <button 
                    onClick={handleSubmit}
                    type="button" 
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95"
                >
                    <Check size={22} strokeWidth={3} />
                    {isEditMode ? 'Commit Changes' : 'Initialize Article'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
