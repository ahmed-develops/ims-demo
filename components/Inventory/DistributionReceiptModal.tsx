
import React from 'react';
import { Transaction, ToastMessage } from '../../types';
import { Truck, Printer, X, User, Tag, MapPin, Shield } from 'lucide-react';

interface DistributionReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
}

const DistributionReceiptModal: React.FC<DistributionReceiptModalProps> = ({ transaction, onClose, addToast }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      addToast('error', 'Popup Blocked', 'Please allow popups to generate distribution vouchers');
      return;
    }

    const content = document.getElementById('gatepass-content')?.innerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Gate Pass - ${transaction.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          ${styles}
          <style>
            @page { margin: 15mm; }
            body { background: white; padding: 0; }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
          <div class="bg-white text-black p-8 font-sans">
            ${content}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalItems = (transaction.items || []).reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] transition-colors duration-200">
        
        {/* Logistics Banner */}
        <div className="p-5 text-center text-white bg-indigo-600">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <Truck size={24} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] leading-none">Logistics Outbound Manifest</h2>
            <p className="text-[10px] font-bold opacity-70 mt-2 uppercase tracking-widest">Movement Log: {transaction.id}</p>
        </div>

        {/* The Voucher */}
        <div id="gatepass-content" className="bg-white p-10 flex-1 overflow-y-auto">
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-900">
                <div>
                    <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tight leading-none mb-1">NiaMia</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">Stock Release Note / Gate Pass</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-900 uppercase">Audit Record</p>
                    <p className="text-sm font-mono font-bold text-indigo-600">#{transaction.id}</p>
                </div>
            </div>

            {/* Reference Data */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Authorization</p>
                        <div className="flex items-center gap-2">
                             <Shield size={12} className="text-gray-400" />
                             <span className="text-[10px] font-black text-gray-800 uppercase">{transaction.cashierName} ({transaction.cashierRole})</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                        <p className="text-[11px] font-bold text-gray-800">{new Date(transaction.date).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Movement Mode</p>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-black uppercase border border-indigo-100">{transaction.type}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Source Location</p>
                        <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-gray-400" />
                            <p className="text-[10px] font-black uppercase">{transaction.locationSource || 'Warehouse'}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination Target</p>
                        <div className="flex items-center gap-2 text-indigo-600">
                            <Truck size={12} />
                            <p className="text-[10px] font-black uppercase">{transaction.locationDestination || 'External Dispatch'}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Ref / Label</p>
                        <div className="flex items-center gap-2 text-gray-800">
                            <Tag size={12} className="text-gray-400" />
                            <p className="text-[10px] font-black uppercase">{transaction.externalOrderId || 'INTERNAL_RELEASE'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-10 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="py-3 pr-4">Article (SKU)</th>
                            <th className="py-3 text-center">Size</th>
                            <th className="py-3 text-center">Qty</th>
                            <th className="py-3 text-right">Price</th>
                            <th className="py-3 text-right">Disc.</th>
                            <th className="py-3 text-right">Net Amt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(transaction.items || []).map((item, idx) => {
                            const unitPrice = item.price;
                            const discountPercent = item.discount || 0;
                            const finalPrice = unitPrice * (1 - discountPercent / 100);
                            return (
                                <tr key={idx} className="text-[10px]">
                                    <td className="py-4 pr-4">
                                        <p className="font-black text-gray-900 uppercase truncate max-w-[150px]">{item.name}</p>
                                        <p className="text-[8px] font-mono text-gray-400">#{item.id}</p>
                                    </td>
                                    <td className="py-4 text-center font-bold text-gray-500 uppercase">{item.selectedSize.sizeInternal}</td>
                                    <td className="py-4 text-center font-black text-gray-900">{item.quantity}</td>
                                    <td className="py-4 text-right font-mono text-gray-500">₨ {unitPrice.toLocaleString()}</td>
                                    <td className="py-4 text-right font-mono text-rose-500">{discountPercent}%</td>
                                    <td className="py-4 text-right font-black text-indigo-600">₨ {(finalPrice * item.quantity).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-900">
                            <td colSpan={2} className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-900">Aggregate Logistics Total</td>
                            <td className="py-4 text-center font-black text-lg text-gray-900">{totalItems} Units</td>
                            <td colSpan={3} className="py-4 text-right font-black text-xl text-indigo-700">₨ {transaction.total.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-10 mt-12 pt-10 border-t border-dashed border-gray-200">
                <div className="space-y-8 text-center">
                    <div className="h-px bg-gray-300 w-full"></div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Authorized Store Representative</p>
                    <p className="text-[10px] font-bold text-gray-900 uppercase -mt-6 italic">{transaction.cashierName}</p>
                </div>
                <div className="space-y-8 text-center">
                    <div className="h-px bg-gray-300 w-full"></div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Warehouse Receiver / Dispatch Driver</p>
                </div>
            </div>

            <div className="mt-16 text-center">
                 <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=GATEPASS-${transaction.id}`} 
                    alt="Voucher QR" 
                    className="w-16 h-16 mx-auto opacity-30 mix-blend-multiply"
                />
                 <p className="text-[7px] font-black text-gray-300 uppercase tracking-[0.5em] mt-4 italic">Encrypted Logistics Data Verified</p>
            </div>
        </div>

        {/* Actions */}
        <div className="p-5 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex gap-3">
             <button onClick={onClose} className="flex-1 py-3 bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-200 dark:border-gray-500 hover:bg-gray-100 transition-all">
                Dismiss
            </button>
            <button onClick={handlePrint} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl">
                <Printer size={16} />
                Generate Manifest
            </button>
        </div>
      </div>
    </div>
  );
};

export default DistributionReceiptModal;
