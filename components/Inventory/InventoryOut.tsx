
import React, { useState } from 'react';
import { Product, TransactionType, Transaction } from '../../types';
import { 
  ShoppingBag, Truck, Gift, Users, Clock, Wand2, ClipboardList
} from 'lucide-react';
import ShopifyOrderWizard from './ShopifyOrderWizard';
import PreOrderWizard from './PreOrderWizard';
import PRWizard from './PRWizard';
import FnFWizard from './FnFWizard';
import StoreTransferWizard from './StoreTransferWizard';

interface InventoryOutProps {
  products: Product[];
  transactions: Transaction[];
  onProcessOut: (
    type: TransactionType, 
    items: { productId: string; sizeInternal: string; quantity: number }[], 
    details: { orderId?: string; recipient?: string; discount?: number; }
  ) => void;
}

const InventoryOut: React.FC<InventoryOutProps> = ({ products, transactions, onProcessOut }) => {
  const [isShopifyWizardOpen, setIsShopifyWizardOpen] = useState(false);
  const [isPreOrderWizardOpen, setIsPreOrderWizardOpen] = useState(false);
  const [isPRWizardOpen, setIsPRWizardOpen] = useState(false);
  const [isFnFWizardOpen, setIsFnFWizardOpen] = useState(false);
  const [isTransferWizardOpen, setIsTransferWizardOpen] = useState(false);

  const actions = [
    { 
        id: TransactionType.Shopify, 
        label: 'Shopify Dispatch', 
        description: 'Process e-commerce orders via SKU scan',
        icon: ShoppingBag, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50 dark:bg-blue-900/20', 
        border: 'border-blue-100 dark:border-blue-800', 
        isWizard: true 
    },
    { 
        id: TransactionType.Transfer, 
        label: 'Move to Store', 
        description: 'Update retail floor inventory levels',
        icon: Truck, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
        border: 'border-emerald-100 dark:border-emerald-800',
        isWizard: true
    },
    { 
        id: TransactionType.PreOrder, 
        label: 'Pre-Order Fulfilment', 
        description: 'Release reserved booking stock',
        icon: Clock, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50 dark:bg-amber-900/20', 
        border: 'border-amber-100 dark:border-amber-800',
        isWizard: true
    },
    { 
        id: TransactionType.PR, 
        label: 'PR / Gift Release', 
        description: 'Authorize complimentary influencer stock',
        icon: Gift, 
        color: 'text-rose-600', 
        bg: 'bg-rose-50 dark:bg-rose-900/20', 
        border: 'border-rose-100 dark:border-rose-800',
        isWizard: true
    },
    { 
        id: TransactionType.FnF, 
        label: 'Family & Friends', 
        description: 'Internal staff or affiliate stock release',
        icon: Users, 
        color: 'text-purple-600', 
        bg: 'bg-purple-50 dark:bg-purple-900/20', 
        border: 'border-purple-100 dark:border-purple-800',
        isWizard: true
    },
  ];

  const getWizardBadgeColor = (id: TransactionType) => {
    switch(id) {
        case TransactionType.Shopify: return 'bg-blue-600 shadow-blue-100';
        case TransactionType.PreOrder: return 'bg-amber-500 shadow-amber-100';
        case TransactionType.PR: return 'bg-rose-500 shadow-rose-100';
        case TransactionType.FnF: return 'bg-purple-600 shadow-purple-100';
        case TransactionType.Transfer: return 'bg-emerald-600 shadow-emerald-100';
        default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="max-w-6xl mx-auto p-8 md:p-12">
        
        <header className="mb-12">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">Logistics Control</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-3">Warehouse Resource Dispatch & Channel Management</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((act) => (
                <button
                    key={act.id}
                    onClick={() => {
                        if (act.id === TransactionType.Shopify) setIsShopifyWizardOpen(true);
                        else if (act.id === TransactionType.PreOrder) setIsPreOrderWizardOpen(true);
                        else if (act.id === TransactionType.PR) setIsPRWizardOpen(true);
                        else if (act.id === TransactionType.FnF) setIsFnFWizardOpen(true);
                        else if (act.id === TransactionType.Transfer) setIsTransferWizardOpen(true);
                    }}
                    className={`group relative flex flex-col items-start p-8 rounded-[2.5rem] border-2 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:scale-95 text-left border-gray-100 dark:border-gray-800 hover:border-indigo-500/20`}
                >
                    <div className={`p-4 rounded-2xl mb-6 transition-transform group-hover:scale-110 ${act.bg} ${act.color}`}>
                        <act.icon size={32} />
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{act.label}</h3>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 leading-relaxed">{act.description}</p>
                    </div>
                    
                    {act.isWizard && (
                        <div className={`absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse ${getWizardBadgeColor(act.id)}`}>
                            <Wand2 size={10} />
                            Wizard
                        </div>
                    )}

                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Initialize Module</span>
                        <ClipboardList size={14} />
                    </div>
                </button>
            ))}
        </div>

        <div className="mt-16 p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                    <ClipboardList size={28} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Security Checksum</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">All warehouse dispatches are logged for audit transparency.</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">Logistics Core v2.0</p>
            </div>
        </div>
      </div>

      <ShopifyOrderWizard 
        isOpen={isShopifyWizardOpen} 
        onClose={() => setIsShopifyWizardOpen(false)}
        products={products}
        onComplete={(res) => {
            onProcessOut(
                TransactionType.Shopify, 
                res.items.map(i => ({ productId: i.product.id, sizeInternal: i.size.sizeInternal, quantity: i.quantity })),
                { orderId: res.details.orderId, recipient: res.details.recipient, discount: 0 }
            );
        }}
      />

      <PreOrderWizard 
        isOpen={isPreOrderWizardOpen} 
        onClose={() => setIsPreOrderWizardOpen(false)}
        products={products}
        onComplete={(res) => {
            onProcessOut(
                TransactionType.PreOrder, 
                res.items.map(i => ({ productId: i.product.id, sizeInternal: i.size.sizeInternal, quantity: i.quantity })),
                { recipient: res.details.customerName, discount: 0 }
            );
        }}
      />

      <PRWizard 
        isOpen={isPRWizardOpen} 
        onClose={() => setIsPRWizardOpen(false)}
        products={products}
        onComplete={(res) => {
            onProcessOut(
                TransactionType.PR, 
                res.items.map(i => ({ productId: i.product.id, sizeInternal: i.size.sizeInternal, quantity: i.quantity })),
                { recipient: res.details.recipientName, discount: 100 }
            );
        }}
      />

      <FnFWizard 
        isOpen={isFnFWizardOpen} 
        onClose={() => setIsFnFWizardOpen(false)}
        products={products}
        onComplete={(res) => {
            onProcessOut(
                TransactionType.FnF, 
                res.items.map(i => ({ productId: i.product.id, sizeInternal: i.size.sizeInternal, quantity: i.quantity })),
                { recipient: res.details.customerName, discount: res.details.discount }
            );
        }}
      />

      <StoreTransferWizard 
        isOpen={isTransferWizardOpen} 
        onClose={() => setIsTransferWizardOpen(false)}
        products={products}
        onComplete={(res) => {
            onProcessOut(
                TransactionType.Transfer, 
                res.items.map(i => ({ productId: i.product.id, sizeInternal: i.size.sizeInternal, quantity: i.quantity })),
                { recipient: res.details.recipient, discount: 0 }
            );
        }}
      />
    </div>
  );
};

export default InventoryOut;
