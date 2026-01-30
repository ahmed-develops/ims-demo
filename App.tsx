
import React, { useState, useEffect, useCallback } from 'react';
import Layout, { NavItem } from './components/Layout';
import ProductGrid from './components/POS/ProductGrid';
import Cart from './components/POS/Cart';
import PaymentModal from './components/POS/PaymentModal';
import ReceiptModal from './components/POS/ReceiptModal';
import DistributionReceiptModal from './components/Inventory/DistributionReceiptModal';
import InventoryList from './components/Inventory/InventoryList';
import InventoryOut from './components/Inventory/InventoryOut';
import StockReport from './components/Reports/StockReport';
import StockTrackView from './components/Inventory/StockTrackView';
import BarcodeDirectory from './components/Inventory/BarcodeDirectory';
import CustomerList from './components/Customers/CustomerList';
import TransactionList from './components/Transactions/TransactionList';
import CollectionsView from './components/Settings/CollectionsView';
import CashierDashboard from './components/CashierManagement/CashierDashboard';
import ReportsDashboard from './components/Reports/ReportsDashboard';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import StartShift from './components/Shift/StartShift';
import EndShiftModal from './components/Shift/EndShiftModal';
import AuditLogsView from './components/Admin/AuditLogsView';
import BackupExportView from './components/Admin/BackupExportView';
import { ViewState, Product, ProductSize, CartItem, Transaction, Customer, SessionInfo, Collection, ShiftRecord, CashierUser, UserRole, TransactionType, AuditLog, StockMovement, StockMovementType } from './types';
import { PRODUCTS, SHIFT_HISTORY, USERS } from './constants';
import { getShiftDetails } from './utils';
import { LayoutDashboard, ShoppingCart, Archive, Users, Layers, TrendingUp, Truck, FileText, ClipboardList, Database, Barcode, History, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.POS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS.map(p => ({ ...p, createdAt: new Date().toISOString() })));
  const [users, setUsers] = useState<CashierUser[]>(USERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [shiftHistory, setShiftHistory] = useState<ShiftRecord[]>(SHIFT_HISTORY);
  const [collections, setCollections] = useState<string[]>([
    Collection.WinterEditII,
    Collection.WinterFormals,
    Collection.LawnVol2_2025
  ]);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [lastDistribution, setLastDistribution] = useState<Transaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(30);
  const [pendingCheckout, setPendingCheckout] = useState<{ amountPaid: number; balance: number; isPartial: boolean; cashReceived: number; changeAmount: number } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addAuditLog = useCallback((action: string, details: string) => {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      user: currentUser || 'System',
      action,
      details
    };
    setAuditLogs(prev => [log, ...prev]);
  }, [currentUser]);

  const logStockMovement = useCallback((
    productId: string, 
    productName: string, 
    sizeInternal: string, 
    type: StockMovementType, 
    qtyChange: number,
    newStore: number,
    newWh: number,
    notes?: string
  ) => {
    const movement: StockMovement = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      productId,
      productName,
      sizeInternal,
      type,
      location: type === StockMovementType.Transfer ? 'Both' : (newStore !== -1 ? 'Store' : 'Warehouse'),
      quantityChange: qtyChange,
      newStoreStock: newStore,
      newWhStock: newWh,
      performedBy: currentUser || 'System',
      notes
    };
    setStockMovements(prev => [movement, ...prev]);
  }, [currentUser]);

  const getNavItems = () => {
    const adminNavItems: NavItem[] = [
        { id: ViewState.Reports, label: 'Analytics', icon: TrendingUp },
        { id: ViewState.Inventory, label: 'Stock In', icon: Archive },
        { id: ViewState.InventoryOut, label: 'Stock OUT', icon: Truck },
        { id: ViewState.StockTrack, label: 'Stock Track', icon: History },
        { id: ViewState.Barcodes, label: 'Barcodes', icon: Barcode },
        { id: ViewState.StockReport, label: 'Stock Reports', icon: FileText },
        { id: ViewState.Customers, label: 'Customers', icon: Users },
        { id: ViewState.Collections, label: 'Collections', icon: Layers },
        { id: ViewState.CashierManagement, label: 'Staff Mgmt', icon: Users },
        { id: ViewState.Transactions, label: 'Transactions', icon: LayoutDashboard },
        { id: ViewState.AuditLogs, label: 'Audit Logs', icon: ClipboardList },
        { id: ViewState.Backup, label: 'Backup & Data', icon: Database },
      ];
    
      const cashierNavItems: NavItem[] = [
        { id: ViewState.POS, label: 'Point of Sale', icon: ShoppingCart },
        { id: ViewState.Transactions, label: 'Transactions', icon: LayoutDashboard },
      ];
    
      const warehouseNavItems: NavItem[] = [
          { id: ViewState.Inventory, label: 'Stock In', icon: Archive },
          { id: ViewState.InventoryOut, label: 'Stock OUT', icon: Truck },
          { id: ViewState.StockTrack, label: 'Stock Track', icon: History },
          { id: ViewState.Barcodes, label: 'Barcodes', icon: Barcode },
          { id: ViewState.StockReport, label: 'Stock Report', icon: FileText },
          { id: ViewState.Collections, label: 'Collections', icon: Layers },
      ];
    
      const viewerNavItems: NavItem[] = [
        { id: ViewState.Reports, label: 'Analytics', icon: TrendingUp },
        { id: ViewState.StockReport, label: 'Stock Reports', icon: FileText },
        { id: ViewState.StockTrack, label: 'Stock Track', icon: History },
        { id: ViewState.Transactions, label: 'Transactions', icon: LayoutDashboard },
        { id: ViewState.Customers, label: 'Customers', icon: Users },
        { id: ViewState.AuditLogs, label: 'Audit Logs', icon: ClipboardList },
      ];

    switch(currentUserRole) {
        case 'Admin': return adminNavItems;
        case 'Cashier': return cashierNavItems;
        case 'Warehouse': return warehouseNavItems;
        case 'Viewer': return viewerNavItems;
        default: return [];
    }
  };

  const handleLogin = (user: CashierUser) => {
    setCurrentUser(user.fullName);
    setCurrentUserRole(user.role);
    setIsAuthenticated(true);
    addAuditLog('Login', `User ${user.username} logged in as ${user.role}`);
    
    if (user.role === 'Admin' || user.role === 'Viewer') setCurrentView(ViewState.Reports);
    else if (user.role === 'Warehouse') setCurrentView(ViewState.Inventory);
    else setCurrentView(ViewState.POS);
  };

  const handleLogout = () => {
    addAuditLog('Logout', `User ${currentUser} logged out`);
    setSessionInfo(null);
    setCurrentUser('');
    setCurrentUserRole(null);
    setIsAuthenticated(false);
    setCart([]);
    setSelectedCustomer(null);
  };

  const handleStartShift = () => {
    const now = new Date();
    const { shift, businessDate } = getShiftDetails(now);
    setSessionInfo({ startTime: now, shift, businessDate, cashierName: currentUser });
    addAuditLog('Start Shift', `${shift} shift started on ${businessDate.toDateString()}`);
  };

  const confirmEndShift = () => {
    if (sessionInfo) {
      const endTime = new Date();
      const sessionTxns = transactions.filter(t => t.date >= sessionInfo.startTime);
      const totalSales = sessionTxns.reduce((acc, t) => acc + t.total, 0);
      setShiftHistory(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        cashierName: sessionInfo.cashierName,
        startTime: sessionInfo.startTime,
        endTime,
        shift: sessionInfo.shift,
        businessDate: sessionInfo.businessDate.toISOString().split('T')[0],
        totalSales,
        cashSales: sessionTxns.filter(t => t.paymentMethod === 'Cash').reduce((acc, t) => acc + t.amountPaid, 0),
        cardSales: sessionTxns.filter(t => t.paymentMethod === 'Card').reduce((acc, t) => acc + t.amountPaid, 0),
        transactionCount: sessionTxns.length
      }, ...prev]);
      addAuditLog('End Shift', `${sessionInfo.shift} shift ended. Sales: ₨ ${totalSales}`);
    }
    setShowEndShiftModal(false);
    handleLogout();
  };

  const handlePaymentConfirm = (method: 'Cash' | 'Card') => {
    if (!pendingCheckout || cart.length === 0 || !sessionInfo) return;

    const subtotal = cart.reduce((sum, item) => {
        const price = item.selectedSize.price || item.price;
        return sum + (price * (1 - (item.discount || 0) / 100)) * item.quantity;
    }, 0);
    const total = subtotal * (1 - orderDiscount / 100);

    const cartSnapshot = [...cart];
    setProducts(prev => prev.map(p => {
        const updatedSizes = p.sizes.map(s => {
            const cartMatch = cartSnapshot.find(item => item.id === p.id && item.selectedSize.sizeInternal === s.sizeInternal);
            if (cartMatch) {
              const newStoreStock = Math.max(0, s.stock - cartMatch.quantity);
              logStockMovement(p.id, p.name, s.sizeInternal, StockMovementType.Sale, -cartMatch.quantity, newStoreStock, s.warehouseStock, `POS Transaction`);
              return { ...s, stock: newStoreStock };
            }
            return s;
        });
        return { ...p, sizes: updatedSizes };
    }));

    const txn: Transaction = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date(),
      type: TransactionType.Sale,
      items: cartSnapshot,
      subtotal, total,
      paymentMethod: method,
      amountPaid: pendingCheckout.amountPaid,
      balance: pendingCheckout.balance,
      isPartial: pendingCheckout.isPartial,
      cashReceived: pendingCheckout.cashReceived,
      changeAmount: pendingCheckout.changeAmount,
      customer: selectedCustomer || undefined,
      shift: sessionInfo.shift,
      businessDate: sessionInfo.businessDate.toISOString().split('T')[0],
      cashierName: sessionInfo.cashierName,
      orderDiscount
    };

    setTransactions(prev => [txn, ...prev]);
    addAuditLog('Sale', `Transaction ${txn.id} completed. Amount: ₨ ${total}`);
    setLastTransaction(txn);
    setCart([]);
    setSelectedCustomer(null);
    setOrderDiscount(0);
    setIsPaymentModalOpen(false);
    setPendingCheckout(null);
  };

  const handleProcessReturn = (txn: Transaction) => {
    if (!confirm(`Confirm Return/Exchange for Transaction #${txn.id}?`)) return;

    setProducts(prev => prev.map(p => {
        const updatedSizes = p.sizes.map(s => {
            const returnedItem = txn.items.find(item => item.id === p.id && item.selectedSize.sizeInternal === s.sizeInternal);
            if (returnedItem) {
                const newStoreStock = s.stock + returnedItem.quantity;
                logStockMovement(p.id, p.name, s.sizeInternal, StockMovementType.Return, returnedItem.quantity, newStoreStock, s.warehouseStock, `Return from Txn #${txn.id}`);
                return { ...s, stock: newStoreStock };
            }
            return s;
        });
        return { ...p, sizes: updatedSizes };
    }));

    const returnTxn: Transaction = {
        ...txn,
        id: `RET-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        date: new Date(),
        type: TransactionType.Return,
        total: -txn.total,
        amountPaid: -txn.amountPaid,
        originalTransactionId: txn.id,
        notes: `Customer return from #${txn.id}`
    };

    setTransactions(prev => [returnTxn, ...prev]);
    addAuditLog('Return', `Transaction #${txn.id} was returned.`);
  };

  const handleCheckoutInit = (details: { amountPaid: number; balance: number; isPartial: boolean; cashReceived: number; changeAmount: number }) => {
    setPendingCheckout(details);
    setIsPaymentModalOpen(true);
  };

  const updateQuantity = (productId: string, sizeInternal: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize.sizeInternal === sizeInternal) {
        const newQty = Math.max(0, item.quantity + delta);
        const prod = products.find(p => p.id === productId);
        const sizeObj = prod?.sizes.find(s => s.sizeInternal === sizeInternal);
        if (sizeObj && newQty > sizeObj.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const addToCart = (product: Product, selectedSize: ProductSize) => {
    if (selectedSize.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize.sizeInternal === selectedSize.sizeInternal);
      if (existing) {
        if (existing.quantity >= selectedSize.stock) return prev;
        return prev.map(item => (item.id === product.id && item.selectedSize.sizeInternal === selectedSize.sizeInternal) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, selectedSize, quantity: 1 }];
    });
  };

  const renderContent = () => {
    const canPerformReturn = currentUserRole === 'Admin' || currentUserRole === 'Cashier';

    switch (currentView) {
      case ViewState.POS:
        return (
          <div className="flex h-full">
            <div className="flex-1 overflow-hidden relative">
              <ProductGrid products={products} onAddToCart={addToCart} collections={collections} cart={cart} />
            </div>
            <div className="w-[400px] shrink-0 h-full shadow-2xl z-20">
              <Cart
                items={cart}
                customers={customers}
                selectedCustomer={selectedCustomer}
                orderDiscount={orderDiscount}
                setOrderDiscount={setOrderDiscount}
                onSelectCustomer={setSelectedCustomer}
                onAddCustomer={c => { setCustomers([...customers, c]); addAuditLog('Customer Created', `Added ${c.name}`); }}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={(pid, sid) => setCart(prev => prev.filter(item => !(item.id === pid && item.selectedSize.sizeInternal === sid)))}
                onCheckout={handleCheckoutInit}
                onClearCart={() => { setCart([]); setOrderDiscount(0); }}
              />
            </div>
          </div>
        );
      case ViewState.Inventory:
        return <InventoryList products={products} onAddProduct={p => { setProducts([p, ...products]); addAuditLog('Product Added', p.id); }} onEditProduct={p => setProducts(products.map(x => x.id === p.id ? p : x))} onDeleteProduct={id => setProducts(products.filter(x => x.id !== id))} lowStockThreshold={lowStockThreshold} onUpdateThreshold={setLowStockThreshold} collections={collections} currentUserRole={currentUserRole} />;
      case ViewState.InventoryOut:
        return <InventoryOut products={products} transactions={transactions} onProcessOut={(type, items, details) => { 
            // Handle multiple items/variants in a single logistical movement
            setProducts(prev => prev.map(p => {
                const productUpdates = items.filter(i => i.productId === p.id);
                if (productUpdates.length > 0) {
                    const updatedSizes = p.sizes.map(s => {
                        const variantUpdate = productUpdates.find(u => u.sizeInternal === s.sizeInternal);
                        if (variantUpdate) {
                            const newWhStock = Math.max(0, s.warehouseStock - variantUpdate.quantity);
                            const newStoreStock = type === TransactionType.Transfer ? s.stock + variantUpdate.quantity : s.stock;
                            logStockMovement(p.id, p.name, s.sizeInternal, type === TransactionType.Transfer ? StockMovementType.Transfer : StockMovementType.Outward, -variantUpdate.quantity, newStoreStock, newWhStock, `Inventory Movement: ${type} - ${details.orderId || details.recipient}`);
                            return { ...s, warehouseStock: newWhStock, stock: newStoreStock };
                        }
                        return s;
                    });
                    return { ...p, sizes: updatedSizes };
                }
                return p;
            }));

            const txItems: CartItem[] = items.map(ui => {
                const prod = products.find(p => p.id === ui.productId)!;
                const size = prod.sizes.find(s => s.sizeInternal === ui.sizeInternal)!;
                return { ...prod, selectedSize: size, quantity: ui.quantity };
            });

            const subtotal = txItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const total = subtotal * (1 - (details.discount || 0) / 100);

            const distTxn: Transaction = {
                id: `MV-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                date: new Date(),
                type,
                items: txItems,
                subtotal,
                total,
                paymentMethod: 'N/A',
                amountPaid: total,
                balance: 0,
                isPartial: false,
                shift: 'Morning',
                businessDate: new Date().toISOString().split('T')[0],
                cashierName: currentUser,
                recipientName: details.recipient,
                externalOrderId: details.orderId,
                orderDiscount: details.discount
            };

            setTransactions(prev => [distTxn, ...prev]);
            setLastDistribution(distTxn); // Trigger Movement Receipt
            addAuditLog('Inventory Out', `Logistics Release: ${items.length} variants. ID: ${distTxn.id}`);
        }} />;
      case ViewState.StockTrack:
        return <StockTrackView movements={stockMovements} userRole={currentUserRole} />;
      case ViewState.Barcodes:
        return <BarcodeDirectory products={products} onUpdateProduct={p => setProducts(products.map(x => x.id === p.id ? p : x))} collections={collections} brands={[]} userRole={currentUserRole} />;
      case ViewState.StockReport:
        return <StockReport products={products} collections={collections} movements={stockMovements} userRole={currentUserRole} />;
      case ViewState.Transactions:
        return <TransactionList transactions={transactions} onViewReceipt={setLastTransaction} onReturn={canPerformReturn ? handleProcessReturn : undefined} />;
      case ViewState.Customers:
        return <CustomerList customers={customers} onAddCustomer={c => setCustomers([...customers, c])} onEditCustomer={c => setCustomers(customers.map(x => x.id === c.id ? c : x))} onDeleteCustomer={id => setCustomers(customers.filter(x => x.id !== id))} transactions={transactions} userRole={currentUserRole} />;
      case ViewState.Reports:
        return <ReportsDashboard shiftHistory={shiftHistory} transactions={transactions} products={products} movements={stockMovements} />;
      case ViewState.CashierManagement:
        return <CashierDashboard shiftHistory={shiftHistory} users={users} onAddUser={u => setUsers([...users, u])} onEditUser={u => setUsers(users.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setUsers(users.filter(x => x.id !== id))} currentUserRole={currentUserRole} />;
      case ViewState.AuditLogs:
        return <AuditLogsView logs={auditLogs} userRole={currentUserRole} />;
      case ViewState.Backup:
        return <BackupExportView data={{ products, transactions, customers, users, shiftHistory, stockMovements }} />;
      case ViewState.Collections:
        return <CollectionsView collections={collections} products={products} onAddCollection={c => setCollections([...collections, c])} onDeleteCollection={c => setCollections(collections.filter(x => x !== c))} />;
      default: return null;
    }
  };

  if (!isAuthenticated) return <Login users={users} onLogin={handleLogin} />;
  if (currentUserRole === 'Cashier' && !sessionInfo) return <StartShift username={currentUser} onStartShift={handleStartShift} onLogout={handleLogout} />;

  return (
    <>
      <Layout 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isDarkMode={isDarkMode} 
        onToggleTheme={toggleTheme} 
        onEndShift={currentUserRole === 'Cashier' ? () => setShowEndShiftModal(true) : undefined} 
        onLogout={currentUserRole !== 'Cashier' ? handleLogout : undefined} 
        sessionInfo={sessionInfo} 
        currentUser={currentUser} 
        navItems={getNavItems()}
      >
        {renderContent()}
      </Layout>
      <AIAssistant products={products} />
      <PaymentModal isOpen={isPaymentModalOpen} total={pendingCheckout?.amountPaid || 0} onClose={() => setIsPaymentModalOpen(false)} onConfirm={handlePaymentConfirm} />
      <ReceiptModal transaction={lastTransaction} onClose={() => setLastTransaction(null)} />
      <DistributionReceiptModal transaction={lastDistribution} onClose={() => setLastDistribution(null)} />
      {sessionInfo && <EndShiftModal isOpen={showEndShiftModal} onClose={() => setShowEndShiftModal(false)} onConfirmEndShift={confirmEndShift} sessionInfo={sessionInfo} transactions={transactions} />}
    </>
  );
};

export default App;
