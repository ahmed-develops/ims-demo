
import React, { useState } from 'react';
import { Search, Printer, Barcode as BarcodeIcon, ChevronDown, ChevronUp, Tag, RefreshCw, Save, Edit3, Wand2 } from 'lucide-react';
import { Product, UserRole, ProductSize, ToastMessage } from '../../types';
import ConfirmationModal from '../UI/ConfirmationModal';

interface BarcodeDirectoryProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  collections: string[];
  brands: string[];
  userRole: UserRole | null;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
}

const BarcodeDirectory: React.FC<BarcodeDirectoryProps> = ({ 
  products, 
  onUpdateProduct, 
  collections, 
  brands, 
  userRole,
  addToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());
  const [editingBarcode, setEditingBarcode] = useState<{ productId: string, sizeInternal: string, value: string } | null>(null);
  const [pendingBulkGenerate, setPendingBulkGenerate] = useState<Product | null>(null);

  const isReadOnly = userRole === 'Viewer';

  const filteredProducts = products.filter(p => {
    const s = searchTerm.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(s);
    const idMatch = p.id?.toLowerCase().includes(s);
    const brandMatch = (p.brand || '').toLowerCase().includes(s);
    const sizeMatch = (p.sizes || []).some(sz => {
       const variantBarcode = sz.barcode || `${p.id}-${sz.sizeInternal}`;
       return variantBarcode.toLowerCase().includes(s);
    });
    return nameMatch || idMatch || brandMatch || sizeMatch;
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expandedProductIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedProductIds(next);
  };

  const generateUniqueBarcode = (sku: string, size: string) => {
    const cleanSku = sku.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5);
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    return `NM-${cleanSku}-${size}-${timestamp}`;
  };

  const handleSaveBarcode = (product: Product, sizeInternal: string, newValue: string) => {
    const updatedSizes = product.sizes.map(s => 
      s.sizeInternal === sizeInternal ? { ...s, barcode: newValue } : s
    );
    onUpdateProduct({ ...product, sizes: updatedSizes });
    setEditingBarcode(null);
    addToast('success', 'Identity Updated', `Barcode for ${product.id} variant saved`);
  };

  const finalizeBulkGenerate = () => {
    if (!pendingBulkGenerate || isReadOnly) return;
    const product = pendingBulkGenerate;
    const updatedSizes = product.sizes.map(s => ({
      ...s,
      barcode: generateUniqueBarcode(product.id, s.sizeInternal)
    }));
    onUpdateProduct({ ...product, sizes: updatedSizes });
    setPendingBulkGenerate(null);
    addToast('success', 'Bulk Generation Complete', `Refreshed ${updatedSizes.length} variants for ${product.id}`);
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
      addToast('error', 'Print Blocked', 'Please enable popups to generate barcode PDF');
      return;
    }

    const cards = filteredProducts.flatMap(p => {
      return (p.sizes || []).map(s => {
        const variantBarcode = s.barcode || `${p.id}-${s.sizeInternal}`;
        const barcodeUrl = `https://barcodeapi.org/api/128/${variantBarcode}`;
        return `
          <div class="sticker">
            <div class="brand">NiaMia Boutique</div>
            <div class="product-name">${p.name}</div>
            <div class="variant">SIZE: ${s.size} (${s.sizeInternal})</div>
            <img src="${barcodeUrl}" class="barcode-img" />
            <div class="barcode-text">${variantBarcode}</div>
            <div class="price">Rs. ${s.price || p.price}</div>
          </div>
        `;
      });
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk Barcode Print</title>
          <style>
            @page { margin: 0; size: 50mm 25mm; }
            body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #fff; }
            .sticker { 
              width: 48mm; 
              height: 23mm; 
              padding: 1mm;
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              border: 0.1mm solid #eee;
              page-break-after: always;
              overflow: hidden;
              text-align: center;
            }
            .brand { font-size: 6pt; font-weight: 800; text-transform: uppercase; letter-spacing: 1pt; margin-bottom: 0.5mm; }
            .product-name { font-size: 7pt; font-weight: 700; text-transform: uppercase; white-space: nowrap; overflow: hidden; width: 100%; }
            .variant { font-size: 5pt; font-weight: 600; color: #666; margin-bottom: 1mm; }
            .barcode-img { height: 8mm; width: auto; max-width: 40mm; object-fit: contain; }
            .barcode-text { font-family: monospace; font-size: 6pt; font-weight: 700; margin-top: 0.5mm; }
            .price { font-size: 8pt; font-weight: 900; margin-top: 0.5mm; }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 800)">
          ${cards || '<p style="text-align:center; padding: 20px;">No barcodes to print.</p>'}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printLabel = (title: string, article: string, barcode: string, price: number, size: string) => {
    const barcodeUrl = `https://barcodeapi.org/api/128/${barcode}`;
    const win = window.open('', '_blank', 'width=400,height=400');
    if (win) {
        win.document.write(`
            <html>
                <head>
                    <title>Label - ${barcode}</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: sans-serif; }
                        .label { 
                          width: 50mm; 
                          height: 25mm; 
                          display: flex; 
                          flex-direction: column; 
                          align-items: center; 
                          justify-content: center; 
                          text-align: center;
                          border: 1px solid #eee;
                        }
                        .brand { font-size: 7pt; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-bottom: 0.5pt solid #000; width: 80%; margin-bottom: 1mm; }
                        .name { font-weight: 800; font-size: 8pt; text-transform: uppercase; width: 90%; white-space: nowrap; overflow: hidden; }
                        .size-tag { font-size: 6pt; color: #444; margin: 0.5mm 0; }
                        img { height: 10mm; max-width: 45mm; margin: 0.5mm 0; }
                        .barcode-text { font-family: monospace; font-size: 6pt; font-weight: bold; }
                        .price { font-weight: 900; font-size: 10pt; margin-top: 1mm; }
                    </style>
                </head>
                <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
                    <div class="label">
                        <div class="brand">NiaMia</div>
                        <div class="name">${title}</div>
                        <div class="size-tag">SIZE: ${size}</div>
                        <img src="${barcodeUrl}" />
                        <div class="barcode-text">${barcode}</div>
                        <div class="price">Rs. ${price}</div>
                    </div>
                </body>
            </html>
        `);
        win.document.close();
    } else {
        addToast('error', 'Print Blocked', 'Please enable popups for thermal label printing');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Identity & Barcoding</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {isReadOnly ? 'Audit Point-of-Sale Identities' : 'Generate & Manage Unique Product Serials'}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search SKU or Serial..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold placeholder-gray-300 outline-none focus:ring-4 focus:ring-indigo-500/10 w-48 md:w-64 transition-all"
                    />
                 </div>
                 <button 
                    onClick={handlePrintAll}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none"
                 >
                    <Printer size={16} />
                    Print All (PDF)
                 </button>
            </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => {
                const isExpanded = expandedProductIds.has(product.id);
                const variants = product.sizes || [];
                
                return (
                    <div 
                        key={product.id} 
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all"
                    >
                        <div 
                            className="p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            onClick={() => toggleExpand(product.id)}
                        >
                             <div className="flex items-center gap-4 flex-1">
                                 <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <BarcodeIcon size={24} />
                                 </div>
                                 <div className="min-w-0">
                                     <h3 className="font-black text-gray-900 dark:text-white uppercase truncate">{product.name}</h3>
                                     <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{product.category}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">#{product.id}</span>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                {!isReadOnly && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setPendingBulkGenerate(product); }}
                                    className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-2 group/btn"
                                    title="Auto-Generate Barcodes for all Variants"
                                  >
                                    <Wand2 size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">Auto-Fill All</span>
                                  </button>
                                )}
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{variants.length} Variants</p>
                                </div>
                                <button className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500">
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                             </div>
                        </div>

                        {isExpanded && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {variants.map((size, sIdx) => {
                                        const variantBarcode = size.barcode || `${product.id}-${size.sizeInternal}`;
                                        const barcodeUrl = `https://barcodeapi.org/api/128/${variantBarcode}`;
                                        const isEditing = editingBarcode?.productId === product.id && editingBarcode?.sizeInternal === size.sizeInternal;

                                        return (
                                            <div key={sIdx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3 group/item shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between w-full items-center">
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Size {size.sizeInternal} ({size.size})</span>
                                                    <span className="text-[10px] font-black text-gray-400">Rs. {size.price || product.price}</span>
                                                </div>
                                                
                                                <div className="bg-white p-3 rounded-lg border border-gray-50 flex items-center justify-center min-h-[70px] w-full">
                                                    <img src={barcodeUrl} alt="Variant Barcode" className="h-10 w-auto mix-blend-multiply" />
                                                </div>

                                                <div className="w-full space-y-2">
                                                    <div className="flex items-center gap-2">
                                                      {isEditing ? (
                                                        <div className="flex-1 flex gap-1">
                                                          <input 
                                                            autoFocus
                                                            value={editingBarcode.value}
                                                            onChange={(e) => setEditingBarcode({...editingBarcode, value: e.target.value.toUpperCase()})}
                                                            className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-indigo-200 rounded text-[10px] font-mono font-bold uppercase outline-none"
                                                          />
                                                          <button 
                                                            onClick={() => handleSaveBarcode(product, size.sizeInternal, editingBarcode.value)}
                                                            className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                          >
                                                            <Save size={14} />
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <>
                                                          <p className="flex-1 text-[10px] font-mono text-gray-500 font-bold truncate">{variantBarcode}</p>
                                                          {!isReadOnly && (
                                                            <div className="flex gap-1">
                                                              <button 
                                                                onClick={() => setEditingBarcode({ productId: product.id, sizeInternal: size.sizeInternal, value: variantBarcode })}
                                                                className="p-1 text-gray-300 hover:text-indigo-600 transition-colors"
                                                              >
                                                                <Edit3 size={14} />
                                                              </button>
                                                              <button 
                                                                onClick={() => handleSaveBarcode(product, size.sizeInternal, generateUniqueBarcode(product.id, size.sizeInternal))}
                                                                className="p-1 text-gray-300 hover:text-emerald-600 transition-colors"
                                                                title="Re-generate Unique Barcode"
                                                              >
                                                                <RefreshCw size={14} />
                                                              </button>
                                                            </div>
                                                          )}
                                                        </>
                                                      )}
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            printLabel(`${product.name}`, product.id, variantBarcode, size.price || product.price, size.size);
                                                        }}
                                                        className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Printer size={12} /> Generate Label
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
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!pendingBulkGenerate}
        onClose={() => setPendingBulkGenerate(null)}
        onConfirm={finalizeBulkGenerate}
        title="Refresh Article Serials?"
        message={`This will overwrite all existing barcodes for "${pendingBulkGenerate?.id}" with newly generated unique IDs. This action is logged for audit.`}
        confirmText="Generate All"
        type="warning"
      />
    </div>
  );
};

export default BarcodeDirectory;
