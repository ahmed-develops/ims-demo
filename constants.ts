
import { Collection, Product, CashierUser, ShiftRecord } from './types';

export const USERS: CashierUser[] = [
  { id: 'u1', username: 'admin', password: '123', fullName: 'System Administrator', role: 'Admin' },
  { id: 'u2', username: 'sarah', password: '123', fullName: 'Sarah Jenkins', role: 'Cashier' },
  { id: 'u3', username: 'mike', password: '123', fullName: 'Mike Ross', role: 'Cashier' },
  { id: 'u4', username: 'warehouse', password: '123', fullName: 'Dave Keeper', role: 'Warehouse' },
  { id: 'u5', username: 'viewer', password: '123', fullName: 'John Auditor', role: 'Viewer' }
];

const now = Date.now();
const nowIso = new Date().toISOString();

export const SHIFT_HISTORY: ShiftRecord[] = [
  {
    id: 's1',
    cashierName: 'Sarah Jenkins',
    startTime: new Date(now - 14400000),
    endTime: new Date(now), 
    shift: 'Morning',
    businessDate: new Date().toISOString().split('T')[0],
    totalSales: 98000,
    cashSales: 45000,
    cardSales: 53000,
    transactionCount: 18
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'NM-W2-001',
    name: 'Embroidered Velvet Shrug',
    category: Collection.WinterEditII,
    price: 8500,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&q=80',
    description: 'Luxurious velvet shrug with intricate gold embroidery from Winter Edit II.',
    brand: 'NiaMia',
    createdAt: nowIso,
    sizes: [
      { size: 'S', sizeInternal: '1.5', stock: 10, warehouseStock: 30, price: 8500 },
      { size: 'M', sizeInternal: '2', stock: 15, warehouseStock: 40, price: 8500 },
      { size: 'L', sizeInternal: '2.5', stock: 8, warehouseStock: 25, price: 8700 }
    ]
  },
  {
    id: 'NM-WF-102',
    name: 'Pure Raw Silk Peshwas',
    category: Collection.WinterFormals,
    price: 24500,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=300&q=80',
    description: 'Traditional raw silk floor-length peshwas with hand-worked detailing.',
    brand: 'NiaMia',
    createdAt: nowIso,
    sizes: [
      { size: 'S', sizeInternal: '1.5', stock: 2, warehouseStock: 5, price: 24500 },
      { size: 'M', sizeInternal: '2', stock: 3, warehouseStock: 8, price: 24500 }
    ]
  },
  {
    id: 'NM-L25-501',
    name: 'Digital Print Lawn Set',
    category: Collection.LawnVol2_2025,
    price: 6500,
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=300&q=80',
    description: 'Premium lawn 3-piece set with vibrant digital floral patterns.',
    brand: 'NiaMia',
    createdAt: nowIso,
    sizes: [
      { size: 'XS', sizeInternal: '1', stock: 20, warehouseStock: 100, price: 6500 },
      { size: 'S', sizeInternal: '1.5', stock: 45, warehouseStock: 200, price: 6500 },
      { size: 'M', sizeInternal: '2', stock: 40, warehouseStock: 180, price: 6500 },
      { size: 'L', sizeInternal: '2.5', stock: 25, warehouseStock: 90, price: 6500 }
    ]
  }
];