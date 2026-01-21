
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, Percent, Banknote } from 'lucide-react';
import { CartItem, Customer } from '../../types';
import CustomerSelector from './CustomerSelector';

interface CheckoutDetails {
  amountPaid: number;
  balance: number;
  isPartial: boolean;
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
  const [discountInput, setDiscountInput] = useState('0'); // String to avoid sticky zero

  // Sync prop to local string state
  useEffect(() => {
    setDiscountInput(orderDiscount.toString());
  }, [orderDiscount]);
  
  const itemSubtotal = items.reduce((sum, item) => {
    const price = item.price;
    const effectivePrice = price * (1 - (item.discount || 0) / 100);
    return sum + effectivePrice * item.quantity;
  }, 0);

  const total = itemSubtotal * (1 - orderDiscount / 100);
  const inputValue = parseFloat(amountInput) || 0;
  const isCartEmpty = items.length === 0;

  const handleCheckoutClick = () => {
    const payingAmount = (inputValue > 0 && inputValue < total) ? inputValue : total;
    onCheckout({
        amountPaid: payingAmount,
        balance: Math.max(0, total - payingAmount),
        isPartial: payingAmount < total
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Current Order</h2>
        <CustomerSelector customers={customers} selectedCustomer={selectedCustomer} onSelect={onSelectCustomer} onAdd={onAddCustomer} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-gray-900/30">
        {isCartEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <ShoppingBag size={48} className="opacity-20" />
            <p className="text-sm">Cart is empty</p>
          </div>
        ) : (
          items.map((item) => {
            const price = item.price;
            const effectivePrice = price * (1 - (item.discount || 0)/100);
            return (
              <div key={`${item.id}-${item.selectedSize.sizeInternal}`} className="bg-white dark:bg-gray-700 p-3 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-3">
                <img src={item.image} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate text-sm">{item.name}</h4>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                    Size: {item.selectedSize.sizeInternal} ({item.selectedSize.size})
                  </p>
                  <div className="text-xs font-bold dark:text-gray-300">₨ {(effectivePrice * item.quantity).toFixed(0)}</div>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                  <button onClick={() => onUpdateQuantity(item.id, item.selectedSize.sizeInternal, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-gray-700 shadow-sm transition-transform active:scale-90"><Minus size={12} /></button>
                  <span className="w-4 text-center text-xs font-bold dark:text-white">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.selectedSize.sizeInternal, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-gray-700 shadow-sm transition-transform active:scale-90"><Plus size={12} /></button>
                </div>

                <button onClick={() => onRemoveItem(item.id, item.selectedSize.sizeInternal)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            );
          })
        )}
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-lg space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Subtotal</span>
            <span className="font-bold text-gray-700 dark:text-gray-300 font-mono">₨ {itemSubtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Percent size={14} />
            </div>
            <div className="flex-1">
                <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Global Discount (%)</span>
                <input 
                    type="number"
                    min="0"
                    max="100"
                    value={discountInput}
                    onChange={handleDiscountChange}
                    className="w-full bg-transparent border-none text-base font-black text-indigo-700 dark:text-indigo-400 outline-none p-0 h-auto"
                    placeholder="0"
                />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total Due</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₨ {total.toFixed(0)}</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 mt-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Banknote size={20} />
                </div>
                <div className="flex-1">
                    <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Cash Received</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-emerald-500">₨</span>
                        <input 
                            type="number" 
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent border-none text-2xl font-black text-gray-900 dark:text-white outline-none p-0 h-auto"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
            <button disabled={isCartEmpty} onClick={onClearCart} className="px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-black text-xs uppercase tracking-widest transition-all">Clear</button>
            <button disabled={isCartEmpty} onClick={handleCheckoutClick} className="px-4 py-4 rounded-xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95">
                <CreditCard size={18} />
                <span>Checkout</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
