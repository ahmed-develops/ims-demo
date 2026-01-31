
import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Barcode, ChevronRight, ChevronLeft, CheckCircle2, User, Package, AlertCircle, Trash2, Plus, Minus } from 'lucide-react';
import { Product, ProductSize } from '../../types';

interface PreOrderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onComplete: (payload: {
    items: { product: Product; size: ProductSize; quantity: number }[];
    details: { customerName: string };
  }) => void;
}

interface WizardItem {
  product: Product;
  size: ProductSize;
  quantity: number;
}

const PreOrderWizard: React.FC<PreOrderWizardProps> = ({ isOpen, onClose, products, onComplete }) => {
  const [step, setStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<WizardItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setSearchQuery('');
      setSelectedItems([]);
      setCustomerName('');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 0 && isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, isOpen]);

  if (!isOpen) return null;

  const performScan = (query: string) => {
    const q = query.trim().toUpperCase();
    if (!q) return false;

    let found: { product: Product; size: ProductSize } | null = null;
    for (const p of products) {
      const sizeMatch = p.sizes.find(s => {
        const generatedId = `${p.id}-${s.sizeInternal}`.toUpperCase();
        const barcodeVal = (s.barcode || '').toUpperCase();
        return barcodeVal === q || generatedId === q;
      });
      
      if (sizeMatch) {
        found = { product: p, size: sizeMatch };
        break;
      }
    }

    if (found) {
      if (found.size.warehouseStock <= 0) {
        setError(`Article ${found.product.id}-${found.size.sizeInternal} is out of stock in WH.`);
        return false;
      } else {
        setSelectedItems(prev => {
          const existingIdx = prev.findIndex(item => item.product.id === found!.product.id && item.size.sizeInternal === found!.size.sizeInternal);
          if (existingIdx > -1) {
            const next = [...prev];
            const newQty = next[existingIdx].quantity + 1;
            if (newQty > found!.size.warehouseStock) {
              setError("Cannot exceed warehouse stock limits.");
              return prev;
            }
            next[existingIdx].quantity = newQty;
            return next;
          }
          return [...prev, { product: found!.product, size: found!.size, quantity: 1 }];
        });
        setError(null);
        setSearchQuery('');
        return true;
      }
    } else {
      setError("Article ID not recognized. Check SKU & Variant.");
      return false;
    }
  };

  const handleScanForm = (e: React.FormEvent) => {
    e.preventDefault();
    performScan(searchQuery);
  };

  const updateQty = (idx: number, delta: number) => {
    setSelectedItems(prev => {
      const next = [...prev];
      const item = next[idx];
      const newQty = item.quantity + delta;
      if (newQty < 1) return prev;
      if (newQty > item.size.warehouseStock) {
        setError(`Max WH stock for this variant is ${item.size.warehouseStock}`);
        return prev;
      }
      next[idx].quantity = newQty;
      setError(null);
      return next;
    });
  };

  const removeItem = (idx: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinish = () => {
    if (!customerName.trim()) {
      setError("Customer Name is mandatory for Pre-Order records.");
      return;
    }
    if (selectedItems.length === 0) {
      setError("Add at least one item.");
      setStep(0);
      return;
    }

    onComplete({
      items: selectedItems,
      details: { customerName }
    });
    onClose();
  };

  const handleContinue = () => {
    if (step === 0) {
      if (searchQuery.trim()) {
        const success = performScan(searchQuery);
        if (success) setStep(1);
      } else if (selectedItems.length > 0) {
        setStep(1);
      } else {
        setError("Please scan an item first.");
      }
    } else if (step === 2) {
      if (!customerName.trim()) {
        setError("Customer Name is mandatory.");
        return;
      }
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  const steps = [
    { label: 'Scan', icon: Barcode },
    { label: 'Review', icon: Package },
    { label: 'Client', icon: User },
    { label: 'Done', icon: CheckCircle2 }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-950 rounded-[1.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/10 relative max-h-[85vh]">
        
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-md">
                    <Clock size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Pre-Order Release</h3>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Order Fulfillment</p>
                </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
                <X size={18} />
            </button>
        </div>

        {error && (
            <div className="px-4 pt-4 shrink-0">
                <div className="p-2.5 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-[10px] animate-in slide-in-from-top-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <p className="font-black uppercase tracking-tight leading-tight">{error}</p>
                </div>
            </div>
        )}

        <div className="px-10 pt-5 flex justify-between items-center shrink-0">
            {steps.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 relative flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black z-10 transition-all duration-500 ${
                        step >= idx ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                        <s.icon size={10} />
                    </div>
                    {idx < steps.length - 1 && (
                        <div className={`absolute left-1/2 top-3 w-full h-[1px] -z-0 ${step > idx ? 'bg-amber-500' : 'bg-gray-100 dark:bg-gray-800'}`}></div>
                    )}
                </div>
            ))}
        </div>

        <div className="p-6 flex-1 overflow-y-auto scrollbar-hide">
            {step === 0 && (
                <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-300 py-2">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800">
                        <Barcode size={32} className="text-amber-500 animate-pulse" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Scan Booking</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Identify reserved stock items</p>
                    </div>
                    <form onSubmit={handleScanForm} className="max-w-[300px] mx-auto">
                        <input 
                            ref={inputRef}
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setError(null); }}
                            placeholder="NM-L25-501-2"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-amber-500/50 rounded-xl text-center font-black text-xs tracking-[0.1em] uppercase focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all dark:text-white"
                        />
                        <p className="mt-3 text-[7px] text-gray-400 font-bold uppercase tracking-[0.2em]">Press Enter to add. {selectedItems.length} items added.</p>
                    </form>
                </div>
            )}

            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 py-1 space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Review Release Queue</h4>
                      <button onClick={() => setStep(0)} className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1">
                        <Plus size={12} /> Add More
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedItems.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                          <img src={item.product.image} className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-black dark:text-white uppercase truncate">{item.product.name}</h4>
                            <p className="text-[8px] font-bold text-gray-400">V-{item.size.sizeInternal} | {item.product.id}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
                            <button onClick={() => updateQty(idx, -1)} className="p-0.5 text-gray-400 hover:text-red-500"><Minus size={12} /></button>
                            <span className="text-[10px] font-black dark:text-white w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQty(idx, 1)} className="p-0.5 text-gray-400 hover:text-amber-500"><Plus size={12} /></button>
                          </div>
                          <button onClick={() => removeItem(idx)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 py-1">
                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input 
                                autoFocus
                                value={customerName}
                                onChange={e => { setCustomerName(e.target.value); setError(null); }}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg font-black text-[11px] uppercase outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:text-white"
                                placeholder="Enter Full Name"
                            />
                        </div>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight mt-1 ml-1">Must match pre-order reservation identity</p>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-500 py-1">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Confirm Release</h4>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Reduction Authorized for {selectedItems.reduce((a,b)=>a+b.quantity,0)} Items</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-left space-y-2 max-h-40 overflow-y-auto">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-800">
                            <span className="text-[8px] font-black text-gray-400 uppercase">Client</span>
                            <span className="text-[10px] font-black text-amber-600 uppercase">{customerName}</span>
                        </div>
                        {selectedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[9px] py-1 border-b border-gray-50 dark:border-gray-800 last:border-0">
                            <span className="font-bold dark:text-white truncate max-w-[180px]">{item.product.name} (V-{item.size.sizeInternal})</span>
                            <span className="font-black text-amber-500">x{item.quantity}</span>
                          </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2.5 bg-gray-50/30 dark:bg-gray-900/30 shrink-0">
            {step > 0 && (
                <button 
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-lg font-black text-[9px] uppercase tracking-widest border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5"
                >
                    <ChevronLeft size={14} /> Back
                </button>
            )}
            <button 
                onClick={step === 3 ? handleFinish : handleContinue}
                className="flex-[2] py-2.5 bg-amber-500 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.15em] shadow-lg shadow-amber-100 dark:shadow-none hover:bg-amber-600 transition-all flex items-center justify-center gap-1.5 group"
            >
                {step === 3 ? 'Release & Log' : 'Continue'} 
                {step < 3 && <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PreOrderWizard;
