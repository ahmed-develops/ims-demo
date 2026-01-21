
import React, { useState } from 'react';
import { Search, Printer, Barcode as BarcodeIcon, ChevronDown, ChevronUp, Layers, Tag, Eye } from 'lucide-react';
import { Product, UserRole } from '../../types';
import ProductModal from './AddProductModal';

interface BarcodeDirectoryProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  collections: string[];
  brands: string[];
  userRole: UserRole | null;
}

const BarcodeDirectory: React.FC<BarcodeDirectoryProps> = ({ 
  products, 
  onUpdateProduct, 
  collections, 
  brands, 
  userRole 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const isReadOnly = userRole === 'Viewer';

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sizes.some(s => {
      const variantBarcode = s.barcode || `${p.id}-${s.sizeInternal}`;
      return variantBarcode.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const toggleExpand = (id: string) => {
    const next = new Set(expandedProductIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedProductIds(next);
  };

  const handlePrintAll = () => {
    window.print();
  };

  const printLabel = (title: string, article: string, barcode: string, price: number) => {
    const barcodeUrl = `https://barcodeapi.org/api/128/${barcode}`;
    const win = window.open('', '_blank');
    if (win) {
        win.document.write(`
            <html>
                <head>
                    <title>Label - ${barcode}</title>
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        .label { border: 1px solid #ccc; padding: 20px; text-align: center; width: 300px; }
                        img { height: 60px; margin: 10px 0; }
                        .barcode-text { font-family: monospace; font-size: 14px; font-weight: bold; letter-spacing: 2px; }
                        .sku-text { font-size: 10px; color: #999; margin-top: 5px; }
                        .name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
                        .brand { font-size: 10px; color: #666; text-transform: uppercase; }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    <div class="label">
                        <div class="brand">NiaMia</div>
                        <div class="name">${title}</div>
                        <img src="${barcodeUrl}" />
                        <div class="barcode-text">${barcode}</div>
                        <div class="sku-text">Article: ${article}</div>
                        <div class="name">₨ ${price}</div>
                    </div>
                </body>
            </html>
        `);
        win.document.close();
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Barcode Directory</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {isReadOnly ? 'Viewing variant labels and pricing data.' : 'Manage labels for specific size variants and items.'}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Article or Barcode..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none w-48 md:w-64 transition-all"
                    />
                 </div>
                 <button 
                    onClick={handlePrintAll}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                 >
                    <Printer size={16} />
                    Print All
                 </button>
            </div>
        </header>

        <div id="barcode-grid" className="grid grid-cols-1 gap-4 print:grid-cols-2 print:gap-4 print:p-0">
            {filteredProducts.map((product) => {
                const isExpanded = expandedProductIds.has(product.id);
                
                return (
                    <div 
                        key={product.id} 
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden print:shadow-none print:border print:border-gray-300 print:rounded-none print:break-inside-avoid"
                    >
                        <div 
                            className="p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            onClick={() => toggleExpand(product.id)}
                        >
                             <div className="flex items-center gap-4 flex-1">
                                 <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Tag size={24} />
                                 </div>
                                 <div className="min-w-0">
                                     <h3 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                                     <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{product.brand}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">Article: {product.id}</span>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-4 print:hidden">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-gray-400 uppercase">{product.sizes.length} Variants</p>
                                </div>
                                <button 
                                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                             </div>
                        </div>

                        {/* Expandable Variants */}
                        {isExpanded && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {product.sizes.map((size, sIdx) => {
                                        const variantBarcode = size.barcode || `${product.id}-${size.sizeInternal}`;
                                        const barcodeUrl = `https://barcodeapi.org/api/128/${variantBarcode}`;
                                        return (
                                            <div key={sIdx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3 group/item shadow-sm">
                                                <div className="flex justify-between w-full items-center">
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Size: {size.sizeInternal} ({size.size})</span>
                                                    <span className="text-[10px] font-bold text-gray-400">₨ {size.price || product.price}</span>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-50 flex items-center justify-center min-h-[60px] w-full">
                                                    <img src={barcodeUrl} alt="Variant Barcode" className="h-10 w-auto mix-blend-multiply" />
                                                </div>
                                                <div className="text-center w-full">
                                                    <p className="text-[10px] font-mono text-gray-500 font-bold mb-3">{variantBarcode}</p>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            printLabel(`${product.name} (${size.size})`, product.id, variantBarcode, size.price || product.price);
                                                        }}
                                                        className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Printer size={12} /> Print Label
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 dark:text-gray-500">
                    <BarcodeIcon size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No articles or variant barcodes found.</p>
                </div>
            )}
        </div>
      </div>

      <ProductModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={onUpdateProduct}
        product={editingProduct}
        collections={collections}
        brands={brands}
        userRole={userRole}
        readOnly={isReadOnly}
      />
      
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #barcode-grid, #barcode-grid * {
                visibility: visible;
            }
            #barcode-grid {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .print\\:hidden {
                display: none !important;
            }
        }
      `}</style>
    </div>
  );
};

export default BarcodeDirectory;