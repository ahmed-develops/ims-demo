
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, Percent, Banknote, RotateCcw, AlertCircle } from 'lucide-react';
import { CartItem, Customer } from '../../types';
import CustomerSelector from './CustomerSelector';

interface CheckoutDetails {
  amountPaid: number;
  balance: number;
  isPartial: boolean;
  cashReceived: number;
  changeAmount: number;
}

interface CartProps {
  items: CartItem[];
  customers: Customer[];
  selectedCustomer: Customer | null;
  orderDiscount: number;
  setOrderDiscount: (discount: number) => void;
  onSelectCustomer: (customer: Customer | null) => void;
  onAddCustomer: (customer: Customer) => void;
  onUpdateQuantity: (productId: string, sizeInternal: string, delta: number) => void;
  onRemoveItem: (productId: string, sizeInternal: string) => void;
  onCheckout: (details: CheckoutDetails) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ 
  items, 
  customers,
  selectedCustomer,
  orderDiscount,
  setOrderDiscount,
  onSelectCustomer,
  onAddCustomer,
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  onClearCart 
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [discountInput, setDiscountInput] = useState('0');

  useEffect(() => {
    setDiscountInput(orderDiscount.toString());
  }, [orderDiscount]);
  
  const itemSubtotal = items.reduce((sum, item) => {
    const price = item.price;
    const effectivePrice = price * (1 - (item.discount || 0) / 100);
    return sum + effectivePrice * item.quantity;
  }, 0);

  const total = itemSubtotal * (1 - orderDiscount / 100);
  const cashTendered = parseFloat(amountInput) || 0;
  const isCartEmpty = items.length === 0;

  const changeDue = Math.max(0, cashTendered - total);
  const remainingBalance = Math.max(0, total - cashTendered);
  const isCheckoutDisabled = isCartEmpty || cashTendered <= 0;

  const handleCheckoutClick = () => {
    if (isCheckoutDisabled) return;

    const payingAmount = Math.min(cashTendered, total);
    const calculatedChange = Math.max(0, cashTendered - total);
    const balance = Math.max(0, total - cashTendered);

    onCheckout({
        amountPaid: payingAmount,
        balance: balance,
        isPartial: cashTendered < total,
        cashReceived: cashTendered,
        changeAmount: calculatedChange
    });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
        setDiscountInput('');
        setOrderDiscount(0);
        return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
        const clamped = Math.min(100, Math.max(0, num));
        setDiscountInput(clamped.toString());
        setOrderDiscount(clamped);
    }
  };

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Limit to 1,000,000 for safety
    if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 1000000)) {
        setAmountInput(val);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Active Session</h2>
        <CustomerSelector customers={customers} selectedCustomer={selectedCustomer} onSelect={onSelectCustomer} onAdd={onAddCustomer} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
        {isCartEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 space-y-4">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-full shadow-inner">
                <ShoppingBag size={48} className="opacity-20" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em]">Bag is empty</p>
          </div>
        ) : (
          items.map((item) => {
            const price = item.price;
            const effectivePrice = price * (1 - (item.discount || 0)/100);
            return (
              <div key={`${item.id}-${item.selectedSize.sizeInternal}`} className="group bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
                <img src={item.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 dark:text-gray-100 truncate text-sm leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-tighter mt-0.5">
                    Size: {item.selectedSize.sizeInternal}
                  </p>
                  <div className="text-xs font-black dark:text-gray-300 mt-1">₨ {(effectivePrice * item.quantity).toFixed(0)}</div>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-800">
                  <button onClick={() => onUpdateQuantity(item.id, item.selectedSize.sizeInternal, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all hover:text-red-500 active:scale-90"><Minus size={12} /></button>
                  <span className="w-5 text-center text-xs font-black dark:text-white">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.selectedSize.sizeInternal, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all hover:text-indigo-600 active:scale-90"><Plus size={12} /></button>
                </div>

                <button onClick={() => onRemoveItem(item.id, item.selectedSize.sizeInternal)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            );
          })
        )}
      </div>

      <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Gross Subtotal</span>
            <span className="font-black text-gray-500 dark:text-gray-400 font-mono">₨ {itemSubtotal.toFixed(0)}</span>
          </div>

          <div className={`group relative flex items-center gap-3 bg-indigo-50/40 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/50 transition-all ${isCartEmpty ? 'opacity-40 grayscale' : 'hover:border-indigo-400'}`}>
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none shrink-0">
                <Percent size={14} strokeWidth={3} />
            </div>
            <div className="flex-1">
                <span className="block text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] leading-none mb-1.5">Apply Order Discount</span>
                <input 
                    type="number"
                    min="0"
                    max="100"
                    disabled={isCartEmpty}
                    value={discountInput}
                    onChange={handleDiscountChange}
                    className="w-full bg-transparent border-none text-lg font-black text-indigo-700 dark:text-indigo-400 outline-none p-0 h-auto disabled:cursor-not-allowed"
                    placeholder="0"
                />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-baseline px-1">
                <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total Due</span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₨ {total.toFixed(0)}</span>
            </div>
          </div>

          <div className={`group relative flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-300 ${
              isCartEmpty 
              ? 'bg-gray-50/50 border-gray-100 dark:bg-gray-900 dark:border-gray-800 opacity-40' 
              : cashTendered > 0 
                ? 'bg-emerald-50/30 border-emerald-500/30 dark:bg-emerald-900/5 dark:border-emerald-900/50' 
                : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 focus-within:border-indigo-500'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${cashTendered > 0 ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                <Banknote size={24} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
                <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] leading-none mb-2">Cash Received</span>
                <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-black ${cashTendered > 0 ? 'text-emerald-500' : 'text-gray-300'}`}>₨</span>
                    <input 
                        type="number" 
                        disabled={isCartEmpty}
                        value={amountInput}
                        onChange={handleCashInputChange}
                        placeholder="0"
                        className="w-full bg-transparent border-none text-2xl font-black text-gray-900 dark:text-white outline-none p-0 h-auto placeholder:text-gray-200 dark:placeholder:text-gray-800 disabled:cursor-not-allowed"
                    />
                </div>
            </div>
          </div>

          {cashTendered > 0 && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                {changeDue > 0 ? (
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <RotateCcw size={12} strokeWidth={3} />
                            </div>
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Change Due</span>
                        </div>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400">₨ {changeDue.toFixed(0)}</span>
                    </div>
                ) : remainingBalance > 0 ? (
                    <div className="bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <AlertCircle size={12} strokeWidth={3} />
                            </div>
                            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Balance Due</span>
                        </div>
                        <span className="text-lg font-black text-rose-600 dark:text-rose-400">₨ {remainingBalance.toFixed(0)}</span>
                    </div>
                ) : (
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                         <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-2">Exact Payment Received</span>
                    </div>
                )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
                disabled={isCartEmpty} 
                onClick={onClearCart} 
                className="px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                Reset
            </button>
            <button 
                disabled={isCheckoutDisabled} 
                onClick={handleCheckoutClick} 
                className={`px-4 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.15em] active:scale-[0.97] ${
                    isCheckoutDisabled 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:-translate-y-0.5'
                }`}
            >
                <CreditCard size={18} strokeWidth={2.5} />
                <span>Checkout</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
