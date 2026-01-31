
import React from 'react';
import { Transaction, ToastMessage } from '../../types';
import { Check, Printer, X, AlertTriangle } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose, addToast }) => {
  if (!transaction) return null;

  const itemSubtotal = (transaction.items || []).reduce((acc, item) => {
    const effectivePrice = item.price * (1 - (item.discount || 0) / 100);
    return acc + (effectivePrice * item.quantity);
  }, 0);

  const orderDiscountPercent = transaction.orderDiscount || 0;
  const orderDiscountAmount = itemSubtotal * (orderDiscountPercent / 100);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      addToast('error', 'Popup Blocked', 'Please enable popups to generate receipts');
      return;
    }

    const content = document.getElementById('receipt-content')?.innerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          ${styles}
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              background: white; 
              padding: 0; 
              width: 80mm; 
              margin: 0 !important;
            }
            .no-print { display: none !important; }
            * { color: black !important; font-family: 'Inter', system-ui, sans-serif !important; }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
          <div class="bg-white p-5">
            ${content}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-overlay">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        
        {/* Banner */}
        <div className={`p-4 text-center text-white ${transaction.isPartial ? 'bg-amber-500' : 'bg-emerald-500'}`}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                {transaction.isPartial ? <AlertTriangle size={20} /> : <Check size={20} />}
            </div>
            <h2 className="text-sm font-black uppercase tracking-tight leading-none">
                {transaction.isPartial ? 'Partial Settlement' : 'Order Settled'}
            </h2>
            <p className="text-[9px] font-bold opacity-80 mt-1 uppercase tracking-widest">#{transaction.id}</p>
        </div>

        {/* Receipt Paper Area */}
        <div id="receipt-content" className="bg-white p-6 flex-1 overflow-y-auto">
            <div className="text-center mb-6">
                <h3 className="font-black text-2xl text-gray-900 uppercase tracking-[0.2em] mb-1">NiaMia</h3>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em]">Official Store Receipt</p>
                <div className="w-10 h-0.5 bg-gray-900 mx-auto mt-4"></div>
            </div>

            <div className="space-y-1 mb-5 pb-4 border-b border-dashed border-gray-200">
                 <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Date</span>
                    <span className="text-gray-900">{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Trans ID</span>
                    <span className="text-gray-900">#{transaction.id}</span>
                </div>
                {transaction.customer && (
                    <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest pt-1">
                        <span>Client</span>
                        <span className="text-gray-900">{transaction.customer.name}</span>
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-6">
                {(transaction.items || []).map((item, index) => {
                    const effectiveTotal = (item.price * (1 - (item.discount || 0) / 100)) * item.quantity;
                    return (
                        <div key={index} className="flex justify-between items-start text-[11px]">
                            <div className="flex-1 pr-3">
                                <p className="font-black text-gray-900 uppercase leading-tight">{item.name}</p>
                                <p className="text-[8px] text-gray-400 font-bold mt-1">QTY: {item.quantity} | SIZE {item.selectedSize.sizeInternal}</p>
                            </div>
                            <span className="font-black text-gray-900">₨ {effectiveTotal.toFixed(0)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="border-t-2 border-dashed border-gray-100 pt-5 space-y-1.5">
                <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>₨ {itemSubtotal.toFixed(0)}</span>
                </div>
                {orderDiscountPercent > 0 && (
                    <div className="flex justify-between text-[9px] font-bold text-gray-900 uppercase tracking-widest">
                        <span>Discount ({orderDiscountPercent}%)</span>
                        <span>- ₨ {orderDiscountAmount.toFixed(0)}</span>
                    </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-tight">Net Total</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">₨ {transaction.total.toFixed(0)}</span>
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-gray-100 space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Mode</span>
                        <span className="text-gray-900">{transaction.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Paid</span>
                        <span className="text-gray-900">₨ {transaction.amountPaid.toFixed(0)}</span>
                    </div>
                    {transaction.isPartial && (
                        <div className="flex justify-between text-[9px] font-black text-gray-900 uppercase tracking-widest">
                            <span>Balance</span>
                            <span>₨ {transaction.balance.toFixed(0)}</span>
                        </div>
                    )}
                </div>
            </div>

             <div className="mt-8 text-center">
                 <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${transaction.id}`} 
                    alt="Receipt QR" 
                    className="w-14 h-14 mx-auto opacity-40 mix-blend-multiply"
                />
                 <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 italic text-center">Thank you for shopping at NiaMia</p>
             </div>
        </div>

        {/* Action Bar */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex gap-2">
             <button onClick={onClose} className="flex-1 py-2 bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-200 rounded-lg font-black text-[9px] uppercase tracking-widest border border-gray-200 dark:border-gray-500 hover:bg-gray-100 transition-all">
                Close
            </button>
            <button onClick={handlePrint} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md">
                <Printer size={14} />
                Generate Receipt
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
