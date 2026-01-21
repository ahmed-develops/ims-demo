
import React from 'react';
import { Transaction } from '../../types';
import { Check, Printer, Share2, X, AlertTriangle, User } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  // Recalculate 'Gross' item total to properly display discount flow
  const itemSubtotal = transaction.items.reduce((acc, item) => {
    // This calculates effective price of items (after item-level discount)
    const effectivePrice = item.price * (1 - (item.discount || 0) / 100);
    return acc + (effectivePrice * item.quantity);
  }, 0);

  const orderDiscountPercent = transaction.orderDiscount || 0;
  const orderDiscountAmount = itemSubtotal * (orderDiscountPercent / 100);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-sm-md overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200 max-w-sm">
        
        {/* Banner */}
        {transaction.isPartial ? (
             <div className="bg-amber-500 p-6 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <AlertTriangle size={32} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold mb-1">Partial Payment</h2>
                <p className="text-amber-100 text-sm">Balance Due: ₨ {transaction.balance.toFixed(2)}</p>
             </div>
        ) : (
             <div className="bg-emerald-500 p-6 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Check size={32} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold mb-1">Payment Success!</h2>
                <p className="text-emerald-100 text-sm">Transaction #{transaction.id}</p>
             </div>
        )}

        {/* Receipt Paper Effect - Always White */}
        <div className="relative bg-white p-6 flex-1 overflow-y-auto">
            {/* Serrated edge effect top */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-100/50 to-transparent"></div>

            <div className="text-center mb-6">
                <h3 className="font-bold text-xl text-gray-900 uppercase tracking-widest mb-1">NiaMia</h3>
                <p className="text-xs text-gray-500">123 Fashion Avenue, Style District</p>
                <p className="text-xs text-gray-500">Tel: (555) 987-6543</p>
            </div>

            <div className="border-b border-dashed border-gray-300 mb-4 pb-4 space-y-1">
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Date</span>
                    <span>{transaction.date.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Transaction ID</span>
                    <span>#{transaction.id}</span>
                </div>
                
                {transaction.customer && (
                    <div className="flex justify-between text-xs border-t border-gray-50 pt-1 mt-1">
                        <span className="text-gray-400">Customer</span>
                        <div className="text-right">
                            <p className="font-bold text-gray-800 uppercase tracking-tighter">{transaction.customer.name}</p>
                            <p className="text-xs text-gray-500">{transaction.customer.phone}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-6">
                {transaction.items.map((item, index) => {
                    const hasDiscount = (item.discount || 0) > 0;
                    const originalTotal = item.price * item.quantity;
                    const effectiveTotal = originalTotal * (1 - (item.discount || 0) / 100);

                    return (
                        <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-800">
                                <span className="font-medium mr-2">{item.quantity}x</span>
                                {item.name}
                                {hasDiscount && <span className="ml-2 text-[10px] text-red-500 bg-red-50 px-1 rounded">-{item.discount}%</span>}
                            </span>
                            <div className="flex flex-col items-end">
                                {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through decoration-gray-400">₨ {originalTotal.toFixed(2)}</span>
                                )}
                                <span className="text-gray-900 font-medium">₨ {effectiveTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-dashed border-gray-300 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>₨ {itemSubtotal.toFixed(2)}</span>
                </div>
                
                {orderDiscountPercent > 0 && (
                    <div className="flex justify-between text-sm text-indigo-600 font-medium">
                        <span>Discount ({orderDiscountPercent}%)</span>
                        <span>- ₨ {orderDiscountAmount.toFixed(2)}</span>
                    </div>
                )}
                
                <div className="flex justify-between text-xl font-bold text-gray-900 mt-2 border-t border-dotted border-gray-200 pt-2">
                    <span>Total</span>
                    <span>₨ {transaction.total.toFixed(2)}</span>
                </div>

                {/* Payment Breakdown */}
                <div className="mt-4 pt-2 border-t border-dotted border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>Amount Paid</span>
                        <span>₨ {transaction.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Payment Method</span>
                        <span>{transaction.paymentMethod}</span>
                    </div>
                    {transaction.isPartial && (
                        <div className="flex justify-between text-sm text-red-600 font-bold">
                            <span>Balance Due</span>
                            <span>₨ {transaction.balance.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>

             <div className="mt-8 text-center">
                 <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${transaction.id}`} 
                    alt="Receipt QR" 
                    className="w-24 h-24 mx-auto opacity-80 mix-blend-multiply"
                />
                 <p className="text-[10px] text-gray-400 mt-2">Thank you for shopping with us!</p>
             </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex gap-3">
             <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center justify-center gap-2">
                <X size={18} />
                <span>Close</span>
            </button>
            <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Printer size={18} />
                <span>Print</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;