import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  MOCK_CUSTOMERS,
  generateOrderId,
  calcOrderSubtotal,
  calcPointsEarned,
  calcPointsDiscount,
  type Product,
  type Coupon,
  type CartItem,
  type CompletedOrder,
  type CustomerProfile,
  type Outlet,
} from '@/lib/mock-data';

interface AnalyticsState {
  todayRevenue: number;
  todayOrders: number;
  totalRevenue: number;
  totalOrders: number;
  pointsIssued: number;
  pointsRedeemed: number;
  topSelling: { name: string; count: number; emoji: string }[];
  paymentDist: { method: string; count: number; total: number }[];
}

interface StoreContextValue {
  products: Product[];
  setProducts: (p: Product[]) => void;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  coupons: Coupon[];
  setCoupons: (c: Coupon[]) => void;
  addCoupon: (c: Coupon) => void;
  updateCoupon: (id: string, c: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  orders: CompletedOrder[];
  addOrder: (items: CartItem[], customer: CustomerProfile | null, paymentMethod: string, outlet: string, couponCode: string, couponDiscount: number, pointsRedeemed: number) => CompletedOrder;
  customers: CustomerProfile[];
  analytics: AnalyticsState;
  todayLog: { time: string; phone: string; bill: string; points: number; type: 'Earned' | 'Redeemed'; outlet: Outlet }[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS.map(p => ({ ...p })));
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS.map(c => ({ ...c })));
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const customers = MOCK_CUSTOMERS;

  const addProduct = useCallback((p: Product) => {
    setProducts(prev => [...prev, p]);
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }, []);

  const addCoupon = useCallback((c: Coupon) => {
    setCoupons(prev => [...prev, c]);
  }, []);

  const updateCoupon = useCallback((id: string, patch: Partial<Coupon>) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  }, []);

  const addOrder = useCallback((
    items: CartItem[],
    customer: CustomerProfile | null,
    paymentMethod: string,
    outlet: string,
    couponCode: string,
    couponDiscount: number,
    pointsRedeemed: number,
  ): CompletedOrder => {
    const subtotal = calcOrderSubtotal(items);
    const gst = Math.round(subtotal * 0.05);
    const pointsDiscount = calcPointsDiscount(pointsRedeemed);
    const total = Math.max(0, subtotal + gst - couponDiscount - pointsDiscount);
    const pointsEarned = calcPointsEarned(total);
    const order: CompletedOrder = {
      id: generateOrderId(),
      customer: customer ? { phone: customer.phone, name: customer.name } : null,
      items,
      subtotal,
      gst,
      couponCode,
      couponDiscount,
      pointsRedeemed,
      pointsDiscount,
      total,
      paymentMethod,
      outlet,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
      pointsEarned,
    };
    setOrders(prev => [order, ...prev]);
    return order;
  }, []);

  const analytics: AnalyticsState = (() => {
    const todayOrders = orders.length;
    const todayRevenue = orders.reduce((s, o) => s + o.total, 0);

    const topMap = new Map<string, { count: number; emoji: string }>();
    for (const o of orders) {
      for (const item of o.items) {
        const existing = topMap.get(item.name) || { count: 0, emoji: item.emoji };
        existing.count += item.quantity;
        topMap.set(item.name, existing);
      }
    }
    const topSelling = [...topMap.entries()]
      .map(([name, v]) => ({ name, count: v.count, emoji: v.emoji }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const payMap = new Map<string, { count: number; total: number }>();
    for (const o of orders) {
      const existing = payMap.get(o.paymentMethod) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += o.total;
      payMap.set(o.paymentMethod, existing);
    }
    const paymentDist = [...payMap.entries()]
      .map(([method, v]) => ({ method, count: v.count, total: v.total }))
      .sort((a, b) => b.count - a.count);

    return {
      todayRevenue,
      todayOrders,
      totalRevenue: todayRevenue,
      totalOrders: todayOrders,
      pointsIssued: orders.reduce((s, o) => s + o.pointsEarned, 0),
      pointsRedeemed: orders.reduce((s, o) => s + o.pointsRedeemed, 0),
      topSelling,
      paymentDist,
    };
  })();

  const todayLog = orders.map(o => ({
    time: o.timestamp,
    phone: o.customer?.phone ?? 'Walk-in',
    bill: `₹${o.total.toLocaleString('en-IN')}`,
    points: o.pointsEarned,
    type: 'Earned' as const,
    outlet: o.outlet as Outlet,
  }));

  return (
    <StoreContext.Provider value={{
      products, setProducts, addProduct, updateProduct,
      coupons, setCoupons, addCoupon, updateCoupon, deleteCoupon,
      orders, addOrder, customers, analytics, todayLog,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
