
import React, { useState } from 'react';
import { Product } from '../../types';
import { X, Printer, Archive, Calendar, Package } from 'lucide-react';

interface InventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

const InventoryReportModal: React.FC<InventoryReportModalProps> = ({ isOpen, onClose, products }) => {
  if (!isOpen) return null;

  const now = new Date();
  
  // Flatten products into variants for the report
  const stockItems = products.flatMap(p => 
    p.sizes.map(s => ({
      id: p.id,
      name: p.name,
      sku: p.id, // Assuming ID is SKU based on previous changes
      sizeInternal: s.sizeInternal,
      size: s.size,
      brand: p.brand,
      category: p.category,
      storeStock: s.stock,
      warehouseStock: s.warehouseStock
    }))
  );

  const totalWhStock = stockItems.reduce((acc, item) => acc + item.warehouseStock, 0);
  const totalStoreStock = stockItems.reduce((acc, item) => acc + item.storeStock, 0);
  const totalValue = products.reduce((acc, p) => {
     const productTotalStock = p.sizes.reduce((sAcc, s) => sAcc + s.warehouseStock + s.stock, 0);
     return acc + (productTotalStock * p.price);
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header (No Print) */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 shrink-0 print:hidden">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Archive size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inventory Report</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Preview and Print Stock List</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handlePrint}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                    <Printer size={18} />
                    <span>Print Report</span>
                </button>
                <button 
                    onClick={onClose} 
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Printable Area */}
        <div id="printable-report" className="flex-1 overflow-y-auto p-8 bg-white text-gray-900">
            {/* Report Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">Warehouse Inventory</h1>
                    <div className="text-sm text-gray-500 space-y-1">
                        <p className="font-bold text-gray-900">NiaMia Boutique Management</p>
                        <p>Store ID: #042</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-500 mb-1">
                        <Calendar size={16} />
                        <span className="font-mono text-sm">{now.toLocaleDateString()}</span>
                    </div>
                     <p className="text-xs text-gray-400">Generated: {now.toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total SKUs</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                </div>
                 <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Variants</p>
                    <p className="text-2xl font-bold">{stockItems.length}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Items (WH)</p>
                    <p className="text-2xl font-bold text-indigo-600">{totalWhStock}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">Est. Asset Value</p>
                    <p className="text-xl font-bold">₨ {totalValue.toLocaleString()}</p>
                </div>
            </div>

            {/* Inventory Table */}
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="py-3 px-2 font-bold uppercase text-xs text-gray-500">Product Details</th>
                        <th className="py-3 px-2 font-bold uppercase text-xs text-gray-500">SKU / ID</th>
                        <th className="py-3 px-2 font-bold uppercase text-xs text-gray-500">Category</th>
                        <th className="py-3 px-2 font-bold uppercase text-xs text-gray-500 text-center">Size</th>
                        <th className="py-3 px-2 font-bold uppercase text-xs text-gray-500 text-center bg-gray-50">Store Stock</th>
                        <th className="py-3 px-2 font-bold uppercase text-xs text-gray-500 text-center bg-indigo-50 text-indigo-700">Warehouse Stock</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {stockItems.map((item, idx) => (
                        <tr key={`${item.id}-${item.sizeInternal}-${idx}`} className="hover:bg-gray-50">
                            <td className="py-3 px-2">
                                <div className="font-bold">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.brand}</div>
                            </td>
                             <td className="py-3 px-2 font-mono text-xs">{item.id}</td>
                             <td className="py-3 px-2">{item.category}</td>
                             <td className="py-3 px-2 text-center font-bold">
                                {item.sizeInternal} <span className="text-gray-400 font-normal">({item.size})</span>
                             </td>
                             <td className="py-3 px-2 text-center bg-gray-50">
                                <span className={item.storeStock < 5 ? 'text-red-600 font-bold' : 'text-gray-900'}>
                                    {item.storeStock}
                                </span>
                             </td>
                             <td className="py-3 px-2 text-center bg-indigo-50 font-bold text-indigo-900">
                                {item.warehouseStock}
                             </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between text-xs text-gray-400">
                <p>Authorized Signature: __________________________</p>
                <p>Page 1 of 1</p>
            </div>
        </div>

      </div>
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-report, #printable-report * {
                visibility: visible;
            }
            #printable-report {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: auto;
                overflow: visible;
                padding: 0;
                margin: 0;
                background: white;
                color: black;
            }
            @page {
                size: auto;
                margin: 15mm;
            }
        }
      `}</style>
    </div>
  );
};

export default InventoryReportModal;