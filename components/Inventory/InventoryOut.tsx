
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, TransactionType, Transaction, ProductSize } from '../../types';
import { 
  Search, Download, Printer, Box, ShoppingBag, Truck, Gift, 
  Users, Clock, Tag, Info, Sparkles, Plus, Barcode as BarcodeIcon, 
  MousePointer2, ChevronRight, Trash2, Minus, AlertCircle, 
  ClipboardList, User, Filter, X, History as HistoryIcon 
} from 'lucide-react';

interface InventoryOutProps {
  products: Product[];
  transactions: Transaction[];
  onProcessOut: (
    type: TransactionType, 
    items: { productId: string; sizeInternal: string; quantity: number }[], 
    details: { orderId?: string; recipient?: string; discount?: number; }
  ) => void;
}

interface CartItem {
    product: Product;
    size: ProductSize;
    quantity: number;
}

const InventoryOut: React.FC<InventoryOutProps> = ({ products, transactions, onProcessOut }) => {
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanMode, setIsScanMode] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('ALL');
  
  // Local Cart for Distribution
  const [outflowCart, setOutflowCart] = useState<CartItem[]>([]);
  const [details, setDetails] = useState({ orderId: '', recipient: '', discount: '' });
  const [showError, setShowError] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isScanMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanMode]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products.slice(0, 8);
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product, size: ProductSize) => {
    if (size.warehouseStock <= 0) return;
    
    setOutflowCart(prev => {
        const existing = prev.find(item => item.product.id === product.id && item.size.sizeInternal === size.sizeInternal);
        if (existing) {
            if (existing.quantity >= size.warehouseStock) return prev;
            return prev.map(item => (item.product.id === product.id && item.size.sizeInternal === size.sizeInternal) 
                ? { ...item, quantity: item.quantity + 1 } 
                : item);
        }
        return [...prev, { product, size, quantity: 1 }];
    });
    setSearchTerm('');
  };

  const updateCartQty = (productId: string, sizeInternal: string, delta: number) => {
    setOutflowCart(prev => prev.map(item => {
        if (item.product.id === productId && item.size.sizeInternal === sizeInternal) {
            const newQty = Math.max(0, item.quantity + delta);
            if (newQty > item.size.warehouseStock) return item;
            return { ...item, quantity: newQty };
        }
        return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string, sizeInternal: string) => {
    setOutflowCart(prev => prev.filter(item => !(item.product.id === productId && item.size.sizeInternal === sizeInternal)));
  };

  const handleScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim().toUpperCase();
    if (!query) return;

    for (const p of products) {
      const sizeMatch = (p.sizes || []).find(s => 
        (s.barcode?.toUpperCase() === query) || 
        (`${p.id}-${s.sizeInternal}`.toUpperCase() === query)
      );

      if (sizeMatch) {
        addToCart(p, sizeMatch);
        return;
      }
    }
  };

  const handleFinalize = () => {
    if (outflowCart.length === 0) return;
    
    const finalizeType = selectedType === 'ALL' ? TransactionType.Shopify : selectedType as TransactionType;

    // For Transfer (Store Movement), orderId is used for tracking but we can auto-fill for convenience
    const orderRef = details.orderId.trim() || (finalizeType === TransactionType.Transfer ? `TRANSFER-${Date.now()}` : '');

    if (!orderRef && finalizeType !== TransactionType.Transfer) {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        return;
    }

    const items = outflowCart.map(item => ({
        productId: item.product.id,
        sizeInternal: item.size.sizeInternal,
        quantity: item.quantity
    }));

    onProcessOut(
        finalizeType, 
        items, 
        { orderId: orderRef, recipient: details.recipient, discount: parseFloat(details.discount) || 0 }
    );
    
    setOutflowCart([]);
    setDetails({ orderId: '', recipient: '', discount: '' });
    setShowError(false);
  };

  const workflowTransactions = useMemo(() => {
    return transactions.filter(t => {
        const matchesType = selectedType === 'ALL' || t.type === selectedType;
        const matchesArticle = selectedArticleId === 'ALL' || (t.items || []).some(i => i.id === selectedArticleId);
        const matchesSearch = historySearch === '' || 
            (t.items || []).some(i => i.name.toLowerCase().includes(historySearch.toLowerCase()) || i.id.toLowerCase().includes(historySearch.toLowerCase())) ||
            t.externalOrderId?.toLowerCase().includes(historySearch.toLowerCase()) ||
            t.recipientName?.toLowerCase().includes(historySearch.toLowerCase());
        
        return matchesType && matchesArticle && matchesSearch;
    });
  }, [transactions, selectedType, historySearch, selectedArticleId]);

  const types = [
    { id: 'ALL', label: 'All Log', icon: Filter, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800' },
    { id: TransactionType.Transfer, label: 'Move to Store', icon: Truck, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' },
    { id: TransactionType.Shopify, label: 'Shopify', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { id: TransactionType.PreOrder, label: 'Pre-Order', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { id: TransactionType.PR, label: 'PR/Gift', icon: Gift, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
    { id: TransactionType.FnF, label: 'F&F', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      
      {/* Left Pane: Item Picker */}
      <div className="flex-1 flex flex-col min-w-0 print:hidden">
        <header className="p-6 pb-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">Logistics Control</h1>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Movement from Warehouse to POS or External</p>
                </div>
                <div className="flex flex-wrap gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    {types.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => { setSelectedType(t.id as any); }}
                            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                selectedType === t.id 
                                ? `${t.color} ring-1 ring-current shadow-sm` 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <t.icon size={12} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                <div className="relative flex-1 w-full group">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isScanMode ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {isScanMode ? <BarcodeIcon size={16} strokeWidth={2.5} /> : <Search size={16} />}
                    </div>
                    <form onSubmit={isScanMode ? handleScanSubmit : e => e.preventDefault()} className="w-full">
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder={isScanMode ? "SCAN SKU TO MOVE..." : "Search article to move..."} 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl font-bold text-[11px] outline-none transition-all ${
                                isScanMode ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-transparent focus:border-indigo-500'
                            }`}
                        />
                    </form>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700 h-[38px] shrink-0">
                    <button onClick={() => setIsScanMode(false)} className={`flex items-center gap-1.5 px-3 rounded-lg transition-all ${!isScanMode ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}>
                        <MousePointer2 size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">Search</span>
                    </button>
                    <button onClick={() => setIsScanMode(true)} className={`flex items-center gap-1.5 px-3 rounded-lg transition-all ${isScanMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400'}`}>
                        <BarcodeIcon size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">Scan</span>
                    </button>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <img src={p.image} className="w-10 h-10 rounded-xl object-cover" />
                            <div className="min-w-0">
                                <h3 className="text-[11px] font-black dark:text-white uppercase truncate">{p.name}</h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">#{p.id}</p>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            {(p.sizes || []).map((s, idx) => {
                                const inCart = outflowCart.find(c => c.product.id === p.id && c.size.sizeInternal === s.sizeInternal);
                                const available = s.warehouseStock - (inCart?.quantity || 0);
                                const isExhausted = available <= 0;
                                return (
                                    <button 
                                        key={idx}
                                        disabled={isExhausted}
                                        onClick={() => addToCart(p, s)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                                            isExhausted 
                                            ? 'bg-gray-50 dark:bg-gray-800 border-transparent opacity-40 cursor-not-allowed' 
                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-600 group'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black dark:text-white uppercase">Size {s.sizeInternal}</span>
                                            <span className="text-[8px] text-gray-400 font-bold">{available} WH Stock</span>
                                        </div>
                                        {!isExhausted && <Plus size={14} className="text-gray-300 group-hover:text-indigo-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Pane: Distribution Cart & History Audit */}
      <div className="w-full lg:w-[450px] border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shadow-2xl z-10 print:static print:w-full print:border-none">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 print:hidden">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <ClipboardList size={20} className="text-indigo-600" />
                    Movements
                </h2>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">WH Dispatch</span>
            </div>
            
            <div className="space-y-3">
                <div className="relative group">
                    <Tag className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${showError ? 'text-red-500' : 'text-gray-400'}`} size={14} />
                    <input 
                        value={details.orderId}
                        onChange={e => { setDetails({...details, orderId: e.target.value}); if(showError) setShowError(false); }}
                        className={`w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl font-bold text-[10px] uppercase outline-none transition-all ${
                            showError ? 'border-red-500 ring-2 ring-red-500/10' : 'border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500'
                        }`} 
                        placeholder={selectedType === TransactionType.Transfer ? "TRACKING REF (OPTIONAL)" : "ORDER REF # (MANDATORY) *"} 
                    />
                </div>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                        value={details.recipient}
                        onChange={e => setDetails({...details, recipient: e.target.value})}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-bold text-[10px] uppercase outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="RECIPIENT / RIDER / STORE CONTACT" 
                    />
                </div>
            </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-gray-800 print:hidden">
                <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/20">
                    Dispatch Queue ({outflowCart.length})
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50 print:bg-white">
                {outflowCart.length === 0 ? (
                    <div className="space-y-6 print:hidden">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                <HistoryIcon size={14} /> Logistics Audit
                            </h3>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Article Identity</label>
                                <div className="relative">
                                    <select 
                                        value={selectedArticleId}
                                        onChange={e => setSelectedArticleId(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl font-bold text-[10px] uppercase outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="ALL">ALL ARTICLES</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronRight size={14} className="rotate-90 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input 
                                    value={historySearch}
                                    onChange={e => setHistorySearch(e.target.value)}
                                    placeholder="Search IDs / Keywords..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-[10px] uppercase outline-none"
                                />
                            </div>
                        </div>

                        {workflowTransactions.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 space-y-3">
                                <Truck size={40} className="opacity-20" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Audit Tray Clean</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Movement Logs ({selectedType})</p>
                                {workflowTransactions.slice(0, 15).map((t, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center group">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${types.find(ty => ty.id === t.type)?.color || 'bg-gray-100'}`}>
                                                    {t.type}
                                                </span>
                                                <span className="text-[9px] font-black dark:text-white uppercase truncate">ID: {t.externalOrderId || t.id}</span>
                                            </div>
                                            <p className="text-[8px] text-gray-400 font-bold uppercase truncate">Target: {t.recipientName || 'Warehouse Staff'}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-black text-indigo-600">{t.items.reduce((a, i) => a + i.quantity, 0)} Units</p>
                                            <p className="text-[8px] text-gray-300 font-bold">{new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    outflowCart.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 animate-in slide-in-from-right-2">
                            <img src={item.product.image} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[10px] font-black dark:text-white uppercase truncate">{item.product.name}</h4>
                                <p className="text-[8px] text-indigo-500 font-black uppercase">Variant: {item.size.sizeInternal}</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg border border-gray-100 dark:border-gray-800">
                                <button onClick={() => updateCartQty(item.product.id, item.size.sizeInternal, -1)} className="p-1 hover:text-red-500 transition-colors"><Minus size={10} /></button>
                                <span className="text-[10px] font-black dark:text-white w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateCartQty(item.product.id, item.size.sizeInternal, 1)} className="p-1 hover:text-indigo-600 transition-colors"><Plus size={10} /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id, item.size.sizeInternal)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 space-y-4 print:hidden">
            <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Quantity</span>
                <span className="text-xl font-black text-gray-900 dark:text-white">{outflowCart.reduce((acc, i) => acc + i.quantity, 0)} Units</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <button 
                    disabled={outflowCart.length === 0}
                    onClick={() => { setOutflowCart([]); setDetails({ orderId: '', recipient: '', discount: '' }); setShowError(false); }}
                    className="py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 font-black text-[9px] uppercase tracking-widest rounded-xl hover:text-red-500 disabled:opacity-30 transition-all"
                >
                    Discard
                </button>
                <button 
                    disabled={outflowCart.length === 0}
                    onClick={handleFinalize}
                    className={`py-3 text-white font-black text-[9px] uppercase tracking-[0.15em] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 ${
                        showError ? 'bg-red-500' : (selectedType === TransactionType.Transfer ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none')
                    }`}
                >
                    {selectedType === TransactionType.Transfer ? 'Update Store Inventory' : 'Process Dispatch'} <ChevronRight size={14} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryOut;
