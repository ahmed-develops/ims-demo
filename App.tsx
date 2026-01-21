
import React, { useState, useEffect, useCallback } from 'react';
import Layout, { NavItem } from './components/Layout';
import ProductGrid from './components/POS/ProductGrid';
import Cart from './components/POS/Cart';
import PaymentModal from './components/POS/PaymentModal';
import ReceiptModal from './components/POS/ReceiptModal';
import InventoryList from './components/Inventory/InventoryList';
import InventoryOut from './components/Inventory/InventoryOut';
import StockReport from './components/Reports/StockReport';
import StockTrackView from './components/Inventory/StockTrackView';
import BarcodeDirectory from './components/Inventory/BarcodeDirectory';
import CustomerList from './components/Customers/CustomerList';
import TransactionList from './components/Transactions/TransactionList';
import CollectionsView from './components/Settings/CollectionsView';
import BrandsView from './components/Settings/BrandsView';
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
import { LayoutDashboard, ShoppingCart, Archive, Users, Layers, Tags, Briefcase, TrendingUp, Truck, FileText, ClipboardList, Database, Barcode, History, Eye } from 'lucide-react';

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
  // Custom collection and brand setup
  const [collections, setCollections] = useState<string[]>([
    Collection.WinterEditII,
    Collection.WinterFormals,
    Collection.LawnVol2_2025
  ]);
  const [brands, setBrands] = useState<string[]>(['NiaMia']);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(30);
  const [pendingCheckout, setPendingCheckout] = useState<{ amountPaid: number; balance: number; isPartial: boolean } | null>(null);
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

  const adminNavItems: NavItem[] = [
    { id: ViewState.Reports, label: 'Analytics', icon: TrendingUp },
    { id: ViewState.Inventory, label: 'Stock In', icon: Archive },
    { id: ViewState.InventoryOut, label: 'Stock OUT', icon: Truck },
    { id: ViewState.StockTrack, label: 'Stock Track', icon: History },
    { id: ViewState.Barcodes, label: 'Barcodes', icon: Barcode },
    { id: ViewState.StockReport, label: 'Stock Reports', icon: FileText },
    { id: ViewState.Customers, label: 'Customers', icon: Users },
    { id: ViewState.Collections, label: 'Collections', icon: Layers },
    { id: ViewState.Brands, label: 'Brands', icon: Tags },
    { id: ViewState.CashierManagement, label: 'Staff Mgmt', icon: Briefcase },
    { id: ViewState.Transactions, label: 'Transactions', icon: LayoutDashboard },
    { id: ViewState.AuditLogs, label: 'Audit Logs', icon: ClipboardList },
    { id: ViewState.Backup, label: 'Backup & Data', icon: Database },
  ];

  const cashierNavItems: NavItem[] = [
    { id: ViewState.POS, label: 'Point of Sale', icon: ShoppingCart },
    { id: ViewState.Transactions, label: 'Transactions', icon: LayoutDashboard },
    { id: ViewState.Customers, label: 'Customers', icon: Users },
  ];

  const warehouseNavItems: NavItem[] = [
      { id: ViewState.Inventory, label: 'Inventory (Stock In)', icon: Archive },
      { id: ViewState.InventoryOut, label: 'Inventory OUT', icon: Truck },
      { id: ViewState.StockTrack, label: 'Stock Track', icon: History },
      { id: ViewState.Barcodes, label: 'Barcodes', icon: Barcode },
      { id: ViewState.StockReport, label: 'Stock Report', icon: FileText },
  ];

  const viewerNavItems: NavItem[] = [
    { id: ViewState.Reports, label: 'Analytics', icon: TrendingUp },
    { id: ViewState.StockReport, label: 'Stock Reports', icon: FileText },
    { id: ViewState.Barcodes, label: 'Barcodes', icon: Barcode },
    { id: ViewState.Transactions, label: 'Transactions', icon: LayoutDashboard },
    { id: ViewState.AuditLogs, label: 'Audit Logs', icon: ClipboardList },
    { id: ViewState.CashierManagement, label: 'Staff Review', icon: Briefcase },
  ];

  const getNavItems = () => {
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
      customer: selectedCustomer || undefined,
      shift: sessionInfo.shift,
      businessDate: sessionInfo.businessDate.toISOString().split('T')[0],
      cashierName: sessionInfo.cashierName,
      orderDiscount
    };

    setTransactions(prev => [txn, ...prev]);
    addAuditLog('Sale', `New transaction ${txn.id} completed. Amount: ₨ ${total}`);
    setLastTransaction(txn);
    setCart([]);
    setSelectedCustomer(null);
    setOrderDiscount(0);
    setIsPaymentModalOpen(false);
    setPendingCheckout(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.POS:
        return (
          <div className="flex h-full">
            <div className="flex-1 overflow-hidden relative">
              <ProductGrid 
                products={products} 
                onAddToCart={addToCart} 
                collections={collections} 
                cart={cart} 
              />
            </div>
            <div className="w-[400px] shrink-0 h-full shadow-2xl z-20">
              <Cart
                items={cart}
                customers={customers}
                selectedCustomer={selectedCustomer}
                orderDiscount={orderDiscount}
                setOrderDiscount={setOrderDiscount}
                onSelectCustomer={setSelectedCustomer}
                onAddCustomer={c => { setCustomers([...customers, c]); addAuditLog('Customer Created', `Added customer ${c.name}`); }}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={(pid, sid) => setCart(prev => prev.filter(item => !(item.id === pid && item.selectedSize.sizeInternal === sid)))}
                onCheckout={handleCheckoutInit}
                onClearCart={() => { setCart([]); setOrderDiscount(0); }}
              />
            </div>
          </div>
        );
      case ViewState.Inventory:
        return <InventoryList 
            products={products} 
            onAddProduct={p => { 
                setProducts([p, ...products]); 
                addAuditLog('Product Added', `Created product ${p.name}`);
                p.sizes.forEach(s => {
                   if (s.stock > 0) logStockMovement(p.id, p.name, s.sizeInternal, StockMovementType.Inward, s.stock, s.stock, s.warehouseStock, 'Initial Store Stock');
                   if (s.warehouseStock > 0) logStockMovement(p.id, p.name, s.sizeInternal, StockMovementType.Inward, s.warehouseStock, s.stock, s.warehouseStock, 'Initial Warehouse Stock');
                });
            }} 
            onEditProduct={p => { 
                const oldProduct = products.find(x => x.id === p.id);
                if (oldProduct) {
                    p.sizes.forEach((newSize, idx) => {
                        const oldSize = oldProduct.sizes[idx];
                        if (oldSize) {
                            if (newSize.stock !== oldSize.stock) {
                                logStockMovement(p.id, p.name, newSize.sizeInternal, StockMovementType.Adjustment, newSize.stock - oldSize.stock, newSize.stock, newSize.warehouseStock, 'Manual Store Adjustment');
                            }
                            if (newSize.warehouseStock !== oldSize.warehouseStock) {
                                logStockMovement(p.id, p.name, newSize.sizeInternal, StockMovementType.Adjustment, newSize.warehouseStock - oldSize.warehouseStock, newSize.stock, newSize.warehouseStock, 'Manual Warehouse Adjustment');
                            }
                        }
                    });
                }
                setProducts(products.map(x => x.id === p.id ? p : x)); 
                addAuditLog('Product Edited', `Updated product ${p.name}`); 
            }} 
            onDeleteProduct={id => { setProducts(products.filter(x => x.id !== id)); addAuditLog('Product Deleted', `Deleted ID: ${id}`); }} 
            lowStockThreshold={lowStockThreshold} 
            onUpdateThreshold={setLowStockThreshold} 
            collections={collections} 
            brands={brands} 
            currentUserRole={currentUserRole} 
        />;
      case ViewState.InventoryOut:
        return <InventoryOut 
            products={products} 
            transactions={transactions}
            onProcessOut={(type, items, details) => { 
            setProducts(prev => prev.map(p => {
                const update = items.find(i => i.productId === p.id);
                if (update) {
                    const updatedSizes = p.sizes.map(s => {
                        if (s.sizeInternal === update.sizeInternal) {
                            const newWhStock = Math.max(0, s.warehouseStock - update.quantity);
                            const newStoreStock = type === TransactionType.Transfer 
                                ? s.stock + update.quantity 
                                : s.stock;
                            
                            logStockMovement(
                              p.id, p.name, s.sizeInternal, 
                              type === TransactionType.Transfer ? StockMovementType.Transfer : StockMovementType.Outward, 
                              -update.quantity, 
                              newStoreStock, 
                              newWhStock, 
                              `Inventory Out: ${type}`
                            );
                            
                            return { ...s, warehouseStock: newWhStock, stock: newStoreStock };
                        }
                        return s;
                    });
                    return { ...p, sizes: updatedSizes };
                }
                return p;
            }));

            if (type !== TransactionType.Transfer) {
                const item = products.find(p => p.id === items[0].productId);
                if (item) {
                   const variant = item.sizes.find(s => s.sizeInternal === items[0].sizeInternal);
                   const basePrice = (variant?.price || item.price);
                   const price = type === TransactionType.PR ? 0 : basePrice;
                   const finalTotal = price * items[0].quantity * (1 - (details.discount || 0) / 100);
                   
                   const txn: Transaction = {
                      id: `OUT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                      date: new Date(),
                      type,
                      items: [{ ...item, selectedSize: variant!, quantity: items[0].quantity }],
                      subtotal: basePrice * items[0].quantity,
                      total: finalTotal,
                      paymentMethod: 'N/A',
                      amountPaid: finalTotal,
                      balance: 0,
                      isPartial: false,
                      shift: 'Morning',
                      businessDate: new Date().toISOString().split('T')[0],
                      cashierName: currentUser,
                      recipientName: details.recipient,
                      externalOrderId: details.orderId,
                      orderDiscount: details.discount
                   };
                   setTransactions(prev => [txn, ...prev]);
                }
            } else {
                addAuditLog('Warehouse Transfer', `Moved ${items[0].quantity} unit(s) of ${items[0].productId} to Store.`);
            }

            addAuditLog('Inventory OUT', `Processed ${type}`);
            alert(`${type} processed successfully.`);
        }} />;
      case ViewState.StockTrack:
        return <StockTrackView movements={stockMovements} userRole={currentUserRole} />;
      case ViewState.Barcodes:
        return <BarcodeDirectory products={products} onUpdateProduct={p => { setProducts(products.map(x => x.id === p.id ? p : x)); addAuditLog('Inventory Update', `Updated article: ${p.id}`); }} collections={collections} brands={brands} userRole={currentUserRole} />;
      case ViewState.StockReport:
        return <StockReport products={products} collections={collections} />;
      case ViewState.Transactions:
        return <TransactionList transactions={transactions} onViewReceipt={setLastTransaction} />;
      case ViewState.Customers:
        return <CustomerList customers={customers} onAddCustomer={c => setCustomers([...customers, c])} onEditCustomer={c => setCustomers(customers.map(x => x.id === c.id ? c : x))} onDeleteCustomer={id => setCustomers(customers.filter(x => x.id !== id))} transactions={transactions} />;
      case ViewState.Reports:
        return <ReportsDashboard shiftHistory={shiftHistory} transactions={transactions} />;
      case ViewState.CashierManagement:
        return <CashierDashboard shiftHistory={shiftHistory} users={users} onAddUser={u => { setUsers([...users, u]); addAuditLog('User Added', `Created staff member ${u.fullName}`); }} onEditUser={u => { setUsers(users.map(x => x.id === u.id ? u : x)); addAuditLog('User Edited', `Updated staff member ${u.fullName}`); }} onDeleteUser={id => { setUsers(users.filter(x => x.id !== id)); addAuditLog('User Deleted', `Deleted staff member ID: ${id}`); }} currentUserRole={currentUserRole} />;
      case ViewState.AuditLogs:
        return <AuditLogsView logs={auditLogs} userRole={currentUserRole} />;
      case ViewState.Backup:
        return <BackupExportView data={{ products, transactions, customers, users, shiftHistory, stockMovements }} />;
      case ViewState.Collections:
        return <CollectionsView collections={collections} products={products} onAddCollection={c => setCollections([...collections, c])} onDeleteCollection={c => setCollections(collections.filter(x => x !== c))} />;
      case ViewState.Brands:
        return <BrandsView brands={brands} products={products} onAddBrand={b => setBrands([...brands, b])} onDeleteBrand={b => setBrands(brands.filter(x => x !== b))} />;
      default: return null;
    }
  };

  const handleCheckoutInit = (details: { amountPaid: number; balance: number; isPartial: boolean }) => {
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
      {(currentUserRole === 'Cashier') && <AIAssistant products={products} />}
      <PaymentModal isOpen={isPaymentModalOpen} total={pendingCheckout?.amountPaid || 0} onClose={() => setIsPaymentModalOpen(false)} onConfirm={handlePaymentConfirm} />
      <ReceiptModal transaction={lastTransaction} onClose={() => setLastTransaction(null)} />
      {sessionInfo && <EndShiftModal isOpen={showEndShiftModal} onClose={() => setShowEndShiftModal(false)} onConfirmEndShift={confirmEndShift} sessionInfo={sessionInfo} transactions={transactions} />}
    </>
  );
};

export default App;