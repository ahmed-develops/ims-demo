
export enum Collection {
  All = 'All',
  WinterEditII = 'Winter Edit II',
  WinterFormals = 'Winter Formals',
  LawnVol2_2025 = 'Lawn Vol 2 2025'
}

export type UserRole = 'Admin' | 'Cashier' | 'Warehouse' | 'Viewer';

export interface ProductSize {
  size: string;         // e.g. "XS"
  sizeInternal: string; // e.g. "1"
  stock: number;        // Store Stock
  warehouseStock: number;
  barcode?: string;     // Size-specific barcode (Optional override)
  price?: number;
}

export interface Product {
  id: string;           // Internal Article Reference / Style Code
  name: string;
  category: string;
  brand?: string;
  price: number; 
  image: string;
  description: string;
  sizes: ProductSize[];
  discount?: number;
  material_type?: string;
  color?: string;
  parts?: string[];
  createdAt: string; 
}

export interface CartItem extends Product {
  selectedSize: ProductSize;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  totalSpent: number;
}

export interface CashierUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export enum TransactionType {
  Sale = 'Sale',
  Shopify = 'Shopify',
  PreOrder = 'PreOrder',
  PR = 'PR',
  FnF = 'FnF',
  Transfer = 'Transfer'
}

export enum StockMovementType {
  Sale = 'Sale',
  Adjustment = 'Adjustment',
  Transfer = 'Transfer',
  Inward = 'Inward',
  Outward = 'Outward'
}

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  sizeInternal: string;
  type: StockMovementType;
  location: 'Store' | 'Warehouse' | 'Both';
  quantityChange: number;
  newStoreStock: number;
  newWhStock: number;
  performedBy: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'N/A';
  amountPaid: number;
  balance: number;
  isPartial: boolean;
  customer?: Customer;
  shift: 'Morning' | 'Night';
  businessDate: string;
  cashierName: string;
  orderDiscount?: number;
  externalOrderId?: string;
  recipientName?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface SessionInfo {
  startTime: Date;
  shift: 'Morning' | 'Night';
  businessDate: Date;
  cashierName: string;
}

export interface ShiftRecord {
  id: string;
  cashierName: string;
  startTime: Date;
  endTime: Date;
  shift: 'Morning' | 'Night';
  businessDate: string;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  transactionCount: number;
}

export enum ViewState {
  POS = 'POS',
  Transactions = 'Transactions',
  StockTrack = 'StockTrack',
  Inventory = 'Inventory',
  InventoryOut = 'InventoryOut',
  StockReport = 'StockReport',
  Customers = 'Customers',
  Collections = 'Collections',
  Brands = 'Brands',
  CashierManagement = 'CashierManagement',
  Reports = 'Reports',
  AuditLogs = 'AuditLogs',
  Backup = 'Backup',
  Barcodes = 'Barcodes'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}