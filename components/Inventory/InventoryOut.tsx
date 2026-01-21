
import React, { useState, useMemo } from 'react';
import { Product, TransactionType, Transaction } from '../../types';
import { Search, ArrowRight, Package, ShoppingBag, Truck, Gift, Users, Ruler, FileText, ScanBarcode, Info, Layers, Tag, Palette, Box, ClipboardList, Clock } from 'lucide-react';
import BarcodeScannerModal from './BarcodeScannerModal';

interface InventoryOutProps {
  products: Product[];
  transactions: Transaction[];
  onProcessOut: (
    type: TransactionType, 
    items: { productId: string; sizeInternal: string; quantity: number }[], 
    details: { 
        orderId?: string; 
        recipient?: string; 
        discount?: number;
    }
  ) => void;
}

const InventoryOut: React.FC<InventoryOutProps> = ({ products, transactions, onProcessOut }) => {
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.Shopify);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [quantity, setQuantity] = useState('1'); // String state to allow clearing
  const [orderDetails, setOrderDetails] = useState({ orderId: '', recipient: '', discount: '' }); // String discount
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const workflowTransactions = useMemo(() => {
    return transactions.filter(t => t.type === selectedType);
  }, [transactions, selectedType]);

  const handleBarcodeScanned = (scannedCode: string) => {
    setIsScannerOpen(false);
    let matchedSizeIdx = 0;
    const product = products.find(p => {
      if (p.id === scannedCode) {
        matchedSizeIdx = 0;
        return true;
      }
      const sizeIndex = p.sizes.findIndex(s => 
        s.barcode === scannedCode || `${p.id}-${s.sizeInternal}` === scannedCode
      );
      if (sizeIndex !== -1) {
        matchedSizeIdx = sizeIndex;
        return true;
      }
      return false;
    });

    if (product) {
        setSelectedProduct(product);
        setSelectedSizeIdx(matchedSizeIdx);
        setSearchTerm('');
    } else {
        alert(`No article found for code: ${scannedCode}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const size = selectedProduct.sizes[selectedSizeIdx];
    const finalQty = parseInt(quantity) || 1;
    const finalDiscount = parseFloat(orderDetails.discount) || 0;

    onProcessOut(
        selectedType, 
        [{ productId: selectedProduct.id, sizeInternal: size.sizeInternal, quantity: finalQty }], 
        { orderId: orderDetails.orderId, recipient: orderDetails.recipient, discount: finalDiscount }
    );

    setSelectedProduct(null);
    setQuantity('1');
    setOrderDetails({ orderId: '', recipient: '', discount: '' });
    setSearchTerm('');
  };

  const getPricePreview = () => {
    if (!selectedProduct) return 0;
    if (selectedType === TransactionType.PR) return 0;
    const basePrice = selectedProduct.sizes[selectedSizeIdx].price || selectedProduct.price;
    const disc = parseFloat(orderDetails.discount) || 0;
    return basePrice * (1 - disc / 100);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val === '') {
      setOrderDetails({ ...orderDetails, discount: '' });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const clamped = Math.min(100, Math.max(0, num));
      setOrderDetails({ ...orderDetails, discount: clamped.toString() });
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Inventory OUT</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Direct Warehouse Outflows & Transfers</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
                { type: TransactionType.Shopify, label: 'Shopify', icon: ShoppingBag },
                { type: TransactionType.PreOrder, label: 'Pre-Order', icon: Package },
                { type: TransactionType.PR, label: 'PR / Gift', icon: Gift },
                { type: TransactionType.FnF, label: 'F & F', icon: Users },
                { type: TransactionType.Transfer, label: 'Transfer', icon: Truck },
            ].map((item) => (
                <button
                    key={item.type}
                    onClick={() => { setSelectedType(item.type); setSelectedProduct(null); }}
                    className={`group flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        selectedType === item.type 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl' 
                        : 'border-white dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-400 hover:border-indigo-50 dark:hover:border-gray-700'
                    }`}
                >
                    <item.icon size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
                </button>
            ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                        <Info size={18} />
                    </div>
                    <div>
                        <h2 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">
                            {selectedType} Entry
                        </h2>
                    </div>
                </div>
                {!selectedProduct && (
                    <button 
                        onClick={() => setIsScannerOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-md"
                    >
                        <ScanBarcode size={16} />
                        Manual Scan
                    </button>
                )}
            </div>
            
            <div className="p-10">
                {!selectedProduct ? (
                    <div className="flex flex-col items-start gap-4 min-h-[60px] justify-center">
                        {selectedType !== TransactionType.Shopify ? (
                            <div className="relative group w-full max-w-xs animate-in fade-in slide-in-from-left-2">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={18} />
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Search Article..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white"
                                />
                                {searchTerm && (
                                    <div className="absolute top-full left-0 right-0 mt-3 z-30 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] overflow-hidden bg-white dark:bg-gray-800 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                                        {filteredProducts.map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => { setSelectedProduct(product); setSelectedSizeIdx(0); }}
                                                className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shadow-inner">
                                                        <img src={product.image} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-white text-xs">{product.name}</p>
                                                        <p className="text-[9px] font-black text-indigo-600 uppercase mt-0.5">{product.id}</p>
                                                    </div>
                                                </div>
                                                <ArrowRight size={18} className="text-gray-300" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                          <div className="w-full h-full min-h-[60px] flex items-center justify-start">
                          </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-3 duration-300">
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
                            <div className="lg:col-span-3">
                                <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800">
                                    <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                                </div>
                            </div>
                            <div className="lg:col-span-9 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="text-left">
                                        <h3 className="font-black text-4xl text-gray-900 dark:text-white leading-tight">{selectedProduct.name}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase">{selectedProduct.id}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedProduct.brand}</span>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setSelectedProduct(null)} className="text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full hover:bg-red-100 transition-colors uppercase tracking-widest">Reset</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600 text-left">
                                        <div className="text-[9px] font-black text-gray-400 uppercase mb-2">Category</div>
                                        <div className="text-sm font-bold dark:text-white uppercase">{selectedProduct.category}</div>
                                    </div>
                                    {selectedType !== TransactionType.Transfer && (
                                        <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600 text-left">
                                            <div className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Outflow Value</div>
                                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase">
                                                {selectedType === TransactionType.PR ? '₨ 0 (PR)' : `₨ ${getPricePreview().toLocaleString()}`}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>

                         <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div>
                                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-3 ml-1">Variant Size</label>
                                    <div className="relative">
                                        <select 
                                            value={selectedSizeIdx}
                                            onChange={(e) => setSelectedSizeIdx(parseInt(e.target.value))}
                                            className="w-full px-6 py-4 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl text-base font-black text-indigo-700 dark:text-indigo-300 outline-none appearance-none"
                                        >
                                            {selectedProduct.sizes.map((s, idx) => (
                                                <option key={idx} value={idx}>{s.sizeInternal} ({s.size}) — {s.warehouseStock} WH stock</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-3 ml-1">Removal Qty</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max={selectedProduct.sizes[selectedSizeIdx].warehouseStock} 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(e.target.value)} 
                                        className="w-full px-6 py-4 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl text-xl font-black text-indigo-700 dark:text-indigo-300 outline-none text-center" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                {selectedType === TransactionType.Shopify && (
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-3 ml-1">Order # Ref <span className="text-red-500">*</span></label>
                                        <input 
                                            required 
                                            placeholder="e.g. #SHOP-9921" 
                                            value={orderDetails.orderId} 
                                            onChange={(e) => setOrderDetails({...orderDetails, orderId: e.target.value})} 
                                            className="w-full px-6 py-4 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 rounded-2xl font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10" 
                                        />
                                    </div>
                                )}
                                {(selectedType === TransactionType.PR || selectedType === TransactionType.FnF || selectedType === TransactionType.PreOrder) && (
                                    <div className={selectedType === TransactionType.FnF ? 'md:col-span-1' : 'md:col-span-2'}>
                                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-3 ml-1">
                                            Recipient Identity <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            required 
                                            placeholder="Full Name" 
                                            value={orderDetails.recipient} 
                                            onChange={(e) => setOrderDetails({...orderDetails, recipient: e.target.value})} 
                                            className="w-full px-6 py-4 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 rounded-2xl font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10" 
                                        />
                                    </div>
                                )}
                                {selectedType === TransactionType.FnF && (
                                    <div>
                                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-3 ml-1">Discount (%)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            max="100"
                                            value={orderDetails.discount} 
                                            onChange={handleDiscountChange} 
                                            className="w-full px-6 py-4 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 rounded-2xl font-black text-indigo-700 outline-none focus:ring-4 focus:ring-indigo-500/10" 
                                        />
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 active:scale-[0.98]">
                                <Box size={22} strokeWidth={3} />
                                Confirm Movement
                            </button>
                         </div>
                    </form>
                )}
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                        <ClipboardList size={22} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">{selectedType} Logs</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active session removals</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-full text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                    <Clock size={12} />
                    {workflowTransactions.length} Transactions
                </div>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/20 text-[10px] uppercase font-black text-gray-400 tracking-[0.15em] border-b border-gray-50 dark:border-gray-700">
                        <tr>
                            <th className="p-6">Time</th>
                            {selectedType === TransactionType.Shopify && <th className="p-6">Order #</th>}
                            {(selectedType === TransactionType.PR || selectedType === TransactionType.PreOrder || selectedType === TransactionType.FnF) && <th className="p-6">Name</th>}
                            <th className="p-6">Article</th>
                            <th className="p-6 text-center">Variant</th>
                            <th className="p-6 text-center">Qty</th>
                            {selectedType !== TransactionType.Transfer && <th className="p-6 text-right">Total</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {workflowTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-6 text-[11px] font-mono text-gray-500 whitespace-nowrap">
                                    {t.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                {selectedType === TransactionType.Shopify && <td className="p-6 font-black text-indigo-600 text-xs">{t.externalOrderId}</td>}
                                {(selectedType === TransactionType.PR || selectedType === TransactionType.PreOrder || selectedType === TransactionType.FnF) && (
                                    <td className="p-6 font-black text-gray-900 dark:text-white text-xs uppercase tracking-tight">{t.recipientName}</td>
                                )}
                                <td className="p-6">
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-black text-gray-800 dark:text-gray-200">{t.items[0]?.name}</span>
                                        <span className="text-[9px] font-mono text-indigo-500 font-bold uppercase mt-0.5">{t.items[0]?.id}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-center font-black text-[11px] text-gray-500 uppercase tracking-tighter">
                                    Size {t.items[0]?.selectedSize.sizeInternal}
                                </td>
                                <td className="p-6 text-center">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg font-black text-xs text-indigo-600">
                                        {t.items[0]?.quantity}
                                    </span>
                                </td>
                                {selectedType !== TransactionType.Transfer && (
                                    <td className="p-6 text-right font-black text-sm text-gray-900 dark:text-white">
                                        ₨ {t.total.toLocaleString()}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {workflowTransactions.length === 0 && (
                            <tr>
                                <td colSpan={10} className="p-20 text-center text-gray-300 dark:text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] italic">
                                    No records found for current {selectedType} session
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
             </div>
        </div>
      </div>

      <BarcodeScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScan={handleBarcodeScanned} 
      />
    </div>
  );
};

export default InventoryOut;
