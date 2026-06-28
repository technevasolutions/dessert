import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingCart, TicketCheck, ScrollText, Phone,
  CheckCircle2, Send, Store, TrendingUp, TrendingDown,
  Search, Plus, Minus, Trash2, CreditCard, Smartphone, Wallet,
  Landmark, QrCode, Download, Share2, Loader2,
  Gift, Hash, User, Star, Award, Zap,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import {
  OUTLETS, CUSTOMER,
  calcItemSubtotal, calcOrderSubtotal, calcPointsDiscount,
  type Outlet, type CustomerProfile, type CartItem,
} from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: Wallet },
  { id: 'gpay', label: 'GPay', icon: Smartphone },
  { id: 'upi', label: 'UPI', icon: QrCode },
  { id: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { id: 'debit-card', label: 'Debit Card', icon: Landmark },
];

const POINTS_REDEEM_OPTIONS = [
  { label: '100 pts', value: 100 },
  { label: '200 pts', value: 200 },
  { label: 'Maximum', value: -1 },
];

export function StaffDashboard() {
  const { products, coupons, addOrder, customers, todayLog, analytics } = useStore();

  const [tab, setTab] = useState('pos');
  const [outlet, setOutlet] = useState<Outlet>('Besant Nagar');

  // Customer
  const [searchPhone, setSearchPhone] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<CustomerProfile | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Points redeem
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('');

  // Order flow
  const [orderFlowStep, setOrderFlowStep] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{
    id: string; total: number; paymentMethod: string;
    pointsEarned: number; pointsRedeemed: number;
    customerName: string; remainingPoints: number;
    subtotal: number; gst: number; couponDiscount: number;
    pointsDiscount: number; items: CartItem[];
  } | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Validate Redemption
  const [valPhone, setValPhone] = useState('');
  const [valCode, setValCode] = useState('');
  const [validated, setValidated] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const availablePoints = foundCustomer ? foundCustomer.totalPoints : 0;

  const subtotal = useMemo(() => calcOrderSubtotal(cart), [cart]);
  const gst = Math.round(subtotal * 0.05);
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const pointsDiscount = calcPointsDiscount(pointsToRedeem);
  const grandTotal = Math.max(0, subtotal + gst - couponDiscount - pointsDiscount);
  const validCoupons = coupons.filter(c => c.status === 'Active');

  function handleSearchCustomer() {
    const cleaned = searchPhone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    const customer = customers.find(c => c.phone === cleaned);
    if (customer) {
      setFoundCustomer(customer);
      toast.success(`${customer.name} found`);
    } else {
      setFoundCustomer(null);
      toast.error('Customer not found. They can still order as walk-in.');
    }
  }

  function addToCart(product: typeof products[0]) {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        emoji: product.emoji,
      }];
    });
    toast.success(`${product.name} added`);
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      const newQty = item.quantity + delta;
      return newQty <= 0 ? { ...item, quantity: 0 } : { ...item, quantity: newQty };
    }).filter(item => item.quantity > 0));
  }

  function removeItem(productId: string) {
    setCart(prev => prev.filter(item => item.productId !== productId));
  }

  function handleApplyCoupon() {
    const c = validCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase().trim());
    if (!c) {
      toast.error('Invalid coupon code');
      return;
    }
    if (subtotal < c.minPurchase) {
      toast.error(`Minimum purchase of ₹${c.minPurchase} required`);
      return;
    }
    const discount = c.discountType === 'percentage'
      ? Math.round(subtotal * c.discount / 100)
      : c.discount;
    setAppliedCoupon({ code: c.code, discount });
    toast.success(`Coupon "${c.code}" applied!`);
  }

  function handleRedeemPoints(pts: number) {
    const redeem = pts === -1 ? availablePoints : pts;
    if (redeem < 100) {
      toast.error('Minimum 100 points to redeem');
      return;
    }
    if (redeem > availablePoints) {
      toast.error('Not enough points');
      return;
    }
    const maxDiscount = subtotal + gst - (appliedCoupon?.discount ?? 0);
    const disc = calcPointsDiscount(redeem);
    if (disc > maxDiscount) {
      toast.error('Discount exceeds bill amount');
      return;
    }
    setPointsToRedeem(redeem);
    toast.success(`${redeem} pts redeemed = ₹${disc} off`);
  }

  function handlePlaceOrder() {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!paymentMethod) {
      toast.error('Select a payment method');
      return;
    }
    if (!outlet) {
      toast.error('Select an outlet');
      return;
    }

    const order = addOrder(
      cart,
      foundCustomer,
      paymentMethod,
      outlet,
      appliedCoupon?.code ?? '',
      couponDiscount,
      pointsToRedeem,
    );

    const remainingPts = foundCustomer
      ? foundCustomer.totalPoints - pointsToRedeem + order.pointsEarned
      : order.pointsEarned;

    setCompletedOrder({
      id: order.id,
      total: order.total,
      paymentMethod: PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label ?? paymentMethod,
      pointsEarned: order.pointsEarned,
      pointsRedeemed: order.pointsRedeemed,
      customerName: foundCustomer?.name ?? 'Walk-in Customer',
      remainingPoints: remainingPts,
      subtotal: order.subtotal,
      gst: order.gst,
      couponDiscount: order.couponDiscount,
      pointsDiscount: order.pointsDiscount,
      items: [...order.items],
    });

    setOrderFlowStep('preparing');
    animateOrderFlow();
  }

  function animateOrderFlow() {
    const steps = ['preparing', 'payment', 'loyalty', 'whatsapp', 'done'];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        setOrderFlowStep(null);
        setShowReceipt(true);
        toast.success('Order completed!');
        return;
      }
      setOrderFlowStep(steps[i]);
    }, 800);
  }

  function resetPOS() {
    setCart([]);
    setFoundCustomer(null);
    setSearchPhone('');
    setCouponCode('');
    setAppliedCoupon(null);
    setPointsToRedeem(0);
    setPaymentMethod('');
    setCompletedOrder(null);
    setShowReceipt(false);
  }

  // Validate Redemption
  function handleValidate() {
    if (valPhone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    if (valCode.length < 6) {
      toast.error('Enter the 6-digit redemption code');
      return;
    }
    setValidated(true);
    setConfirmed(false);
  }

  function handleConfirmRedemption() {
    setConfirmed(true);
    toast.success('Redemption confirmed', {
      description: '100 pts redeemed · WhatsApp receipt sent ✓',
    });
  }

  const flowSteps = [
    { key: 'preparing', label: 'Preparing Order...', icon: Loader2 },
    { key: 'payment', label: 'Payment Successful', icon: CheckCircle2 },
    { key: 'loyalty', label: 'Loyalty Updated', icon: Award },
    { key: 'whatsapp', label: 'WhatsApp Sent', icon: Send },
    { key: 'done', label: 'Order Completed', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-cream bg-grain">
      <header className="sticky top-0 z-30 border-b border-maroon/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="hidden rounded-full bg-maroon/10 px-2.5 py-0.5 text-xs font-medium text-maroon sm:inline">
              Staff Console
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Store className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Outlet:</span>
            <Select value={outlet} onValueChange={(v) => setOutlet(v as Outlet)}>
              <SelectTrigger className="h-7 border-maroon/15 bg-transparent px-2 text-xs text-ink">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTLETS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Tabs value={tab} onValueChange={setTab} className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <TabsList className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0">
              {[
                { id: 'pos', label: 'POS Ordering', icon: ShoppingCart },
                { id: 'validate', label: 'Validate Redemption', icon: TicketCheck },
                { id: 'log', label: "Today's Log", icon: ScrollText },
              ].map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="justify-start gap-2.5 rounded-lg border border-transparent px-3 py-2.5 text-sm data-[state=active]:border-maroon/15 data-[state=active]:bg-cream-50 data-[state=active]:shadow-sm"
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="min-w-0">
            {/* PANEL 1 — POS Ordering */}
            <TabsContent value="pos" className="mt-0 animate-fade-in">
              {/* Customer Info Section */}
              <Card className="mb-6 border-maroon/15 bg-cream-50/60 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-maroon" />
                    <CardTitle className="font-display text-lg text-maroon">Customer Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <Input
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Customer phone number"
                        className="border-maroon/20 bg-cream pl-10"
                        inputMode="tel"
                      />
                    </div>
                    <Button onClick={handleSearchCustomer} className="bg-maroon hover:bg-maroon-700">
                      <Search className="mr-1.5 h-4 w-4" />
                      Search
                    </Button>
                  </div>

                  {foundCustomer && (
                    <div className="mt-4 grid gap-3 rounded-xl border border-maroon/15 bg-gradient-to-r from-maroon/5 to-gold/5 p-4 animate-scale-in sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-ink-muted">Name</p>
                        <p className="font-semibold text-ink">{foundCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Membership</p>
                        <p className="font-semibold text-gold-600">{foundCustomer.membershipTier}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Current Points</p>
                        <p className="font-semibold text-maroon">
                          {foundCustomer.totalPoints.toLocaleString('en-IN')} pts
                          <span className="ml-1 text-xs font-normal text-ink-muted">
                            Worth ₹{foundCustomer.pointsValue}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Available Discount</p>
                        <p className="font-semibold text-green-700">{foundCustomer.availableDiscount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Birthday</p>
                        <p className="text-ink">{foundCustomer.birthday}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Lifetime Spend</p>
                        <p className="text-ink">₹{foundCustomer.lifetimeSpend.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Favourite Dessert</p>
                        <p className="text-ink">{foundCustomer.favouriteDessert}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Last Visit</p>
                        <p className="text-ink">{foundCustomer.lastVisit}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Main POS Layout */}
              <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                {/* LEFT — Menu Grid */}
                <div>
                  <h3 className="mb-3 font-display text-xl text-maroon">Menu</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {products.filter(p => p.available).map((product) => (
                      <Card
                        key={product.id}
                        className={cn(
                          'group overflow-hidden border-maroon/15 bg-cream-50/60 shadow-sm transition-all duration-200 hover:shadow-md',
                          !product.available && 'opacity-50'
                        )}
                      >
                        <div className="flex items-center justify-center bg-gradient-to-br from-gold/10 to-maroon/5 py-4 text-4xl">
                          <span className="drop-shadow-sm">{product.emoji}</span>
                        </div>
                        <CardContent className="p-3">
                          <div className="mb-2">
                            <h4 className="font-display text-base font-semibold text-maroon">{product.name}</h4>
                            <p className="font-display text-sm font-bold text-gold-600">₹{product.price}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 border-maroon/20 p-0"
                              onClick={() => {
                                const existing = cart.find(item => item.productId === product.id);
                                if (existing && existing.quantity > 0) {
                                  updateQty(product.id, -1);
                                }
                              }}
                              disabled={!cart.find(item => item.productId === product.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="flex h-8 min-w-[2rem] items-center justify-center text-sm font-semibold text-ink">
                              {cart.find(item => item.productId === product.id)?.quantity ?? 0}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 border-maroon/20 p-0"
                              onClick={() => addToCart(product)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* RIGHT — Cart + Payment */}
                <div className="space-y-4">
                  {/* Cart */}
                  <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-maroon" />
                          <CardTitle className="font-display text-lg text-maroon">Cart</CardTitle>
                        </div>
                        {cart.length > 0 && (
                          <Badge variant="outline" className="border-maroon/20 text-maroon">
                            {cart.reduce((s, i) => s + i.quantity, 0)} items
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {cart.length === 0 ? (
                        <p className="py-8 text-center text-sm text-ink-muted">Cart is empty. Add items from the menu.</p>
                      ) : (
                        <div className="space-y-2">
                          {cart.map(item => {
                            const subtotal = calcItemSubtotal(item);
                            return (
                              <div key={item.productId} className="flex items-center gap-2 rounded-lg border border-maroon/10 bg-cream-100/50 px-3 py-2">
                                <span className="text-lg">{item.emoji}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                                  <p className="text-xs text-ink-muted">₹{item.price} × {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-ink-muted hover:text-maroon"
                                    onClick={() => updateQty(item.productId, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-ink-muted hover:text-maroon"
                                    onClick={() => updateQty(item.productId, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="w-16 text-right text-sm font-semibold text-ink">₹{subtotal}</p>
                                <Button size="sm" variant="ghost" className="h-6 w-6 shrink-0 p-0 text-red-500"
                                  onClick={() => removeItem(item.productId)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Coupon */}
                  {cart.length > 0 && (
                    <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-maroon" />
                          <CardTitle className="font-display text-base text-maroon">Coupon Code</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase().slice(0, 15))}
                            placeholder="Enter code"
                            className="border-maroon/20 bg-cream font-mono text-xs uppercase"
                          />
                          <Button
                            size="sm"
                            onClick={handleApplyCoupon}
                            className="bg-maroon hover:bg-maroon-700"
                            disabled={!!appliedCoupon}
                          >
                            Apply
                          </Button>
                        </div>
                        {appliedCoupon && (
                          <div className="mt-2 flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs">
                            <span className="text-green-700">{appliedCoupon.code}</span>
                            <span className="font-semibold text-green-700">-₹{appliedCoupon.discount}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Redeem Points */}
                  {foundCustomer && cart.length > 0 && (
                    <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-maroon" />
                          <CardTitle className="font-display text-base text-maroon">Redeem Rewards</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3 rounded-lg border border-gold/30 bg-gold-50/60 px-3 py-2">
                          <p className="text-xs text-ink-muted">Current Points</p>
                          <p className="font-display text-lg font-semibold text-maroon">
                            {availablePoints.toLocaleString('en-IN')} pts
                            <span className="ml-1 text-sm font-normal text-ink-muted">
                              Worth ₹{Math.floor(availablePoints / 10)}
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {POINTS_REDEEM_OPTIONS.map(opt => (
                            <Button
                              key={opt.label}
                              size="sm"
                              variant={pointsToRedeem === (opt.value === -1 ? availablePoints : opt.value) ? 'default' : 'outline'}
                              className={cn(
                                'flex-1 text-xs',
                                pointsToRedeem === (opt.value === -1 ? availablePoints : opt.value)
                                  ? 'bg-maroon text-cream'
                                  : 'border-maroon/20 text-maroon hover:bg-maroon/5'
                              )}
                              onClick={() => handleRedeemPoints(opt.value)}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                        {pointsToRedeem > 0 && (
                          <div className="mt-2 text-center text-xs text-green-700">
                            -₹{calcPointsDiscount(pointsToRedeem)} off
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Order Totals */}
                  {cart.length > 0 && (
                    <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
                      <CardContent className="pt-4">
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between text-ink-muted">
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                          </div>
                          <div className="flex justify-between text-ink-muted">
                            <span>GST (5%)</span>
                            <span>₹{gst}</span>
                          </div>
                          {couponDiscount > 0 && (
                            <div className="flex justify-between text-green-700">
                              <span>Coupon ({appliedCoupon?.code})</span>
                              <span>-₹{couponDiscount}</span>
                            </div>
                          )}
                          {pointsDiscount > 0 && (
                            <div className="flex justify-between text-green-700">
                              <span>Points Discount</span>
                              <span>-₹{pointsDiscount}</span>
                            </div>
                          )}
                          <div className="border-t border-maroon/10 pt-1.5">
                            <div className="flex justify-between font-display text-lg font-semibold text-maroon">
                              <span>Total</span>
                              <span>₹{grandTotal}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Methods */}
                  {cart.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Payment Method</p>
                      <div className="grid grid-cols-5 gap-2">
                        {PAYMENT_METHODS.map(pm => {
                          const Icon = pm.icon;
                          const selected = paymentMethod === pm.id;
                          return (
                            <button
                              key={pm.id}
                              onClick={() => setPaymentMethod(pm.id)}
                              className={cn(
                                'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all',
                                selected
                                  ? 'border-maroon bg-maroon/5 text-maroon shadow-sm'
                                  : 'border-maroon/10 bg-cream-50/60 text-ink-muted hover:border-maroon/30 hover:text-ink'
                              )}
                            >
                              <Icon className={cn('h-5 w-5', selected && 'text-maroon')} />
                              <span className="text-[10px] font-medium">{pm.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Place Order */}
                  {cart.length > 0 && (
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!paymentMethod || orderFlowStep !== null}
                      className="h-14 w-full bg-maroon text-lg font-semibold hover:bg-maroon-700 disabled:opacity-50"
                    >
                      <Zap className="mr-2 h-5 w-5" />
                      Place Order · ₹{grandTotal}
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* PANEL 2 — Validate Redemption */}
            <TabsContent value="validate" className="mt-0 animate-fade-in">
              <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TicketCheck className="h-5 w-5 text-maroon" />
                    <CardTitle className="font-display text-xl text-maroon">Validate a Redemption</CardTitle>
                  </div>
                  <CardDescription>Confirm the code and points before applying the discount.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Customer phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                        <Input
                          value={valPhone}
                          onChange={(e) => setValPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile"
                          className="border-maroon/20 bg-cream pl-10"
                          inputMode="tel"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Redemption code</label>
                      <Input
                        value={valCode}
                        onChange={(e) => setValCode(e.target.value.toUpperCase().slice(0, 6))}
                        placeholder="6-digit code"
                        className="border-maroon/20 bg-cream font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  <Button onClick={handleValidate} variant="outline" className="border-maroon/30 text-maroon hover:bg-maroon/5">
                    Validate
                  </Button>

                  {validated && !confirmed && (
                    <div className="rounded-xl border border-maroon/15 bg-cream-100/50 p-5 animate-scale-in">
                      <div className="mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-display text-lg font-semibold text-maroon">Code valid</span>
                      </div>
                      <dl className="grid gap-3 sm:grid-cols-2">
                        {[
                          ['Customer', CUSTOMER.name],
                          ['Current points', `${CUSTOMER.totalPoints.toLocaleString('en-IN')} pts`],
                          ['Redeeming', '100 pts = ₹10 off'],
                          ['Remaining after', '1,140 pts'],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2">
                            <dt className="text-sm text-ink-muted">{k}</dt>
                            <dd className="text-sm font-semibold text-ink">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-5 flex gap-3">
                        <Button onClick={handleConfirmRedemption} className="flex-1 bg-maroon hover:bg-maroon-700">
                          Confirm Redemption
                        </Button>
                        <Button variant="outline" onClick={() => { setValidated(false); setValCode(''); }}
                          className="border-maroon/30 text-maroon hover:bg-maroon/5">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {confirmed && (
                    <div className="flex items-start gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3.5 text-sm text-green-800 animate-scale-in">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      <div>
                        <p className="font-semibold">Redemption confirmed</p>
                        <p className="text-green-700">100 pts redeemed · WhatsApp receipt sent ✓</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PANEL 3 — Today's Log */}
            <TabsContent value="log" className="mt-0 animate-fade-in">
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-maroon/15 bg-gradient-to-r from-maroon/5 to-gold/5 px-4 py-3">
                <ScrollText className="h-5 w-5 text-maroon" />
                <span className="text-sm font-medium text-ink">
                  Today: {analytics.todayOrders} orders
                </span>
                <span className="text-ink-muted">·</span>
                <span className="inline-flex items-center gap-1 text-sm text-green-700">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {analytics.pointsIssued} pts earned
                </span>
                <span className="text-ink-muted">·</span>
                <span className="inline-flex items-center gap-1 text-sm text-amber-700">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {analytics.pointsRedeemed} pts redeemed
                </span>
              </div>

              <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
                <CardContent className="px-0 sm:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-maroon/10 hover:bg-transparent">
                        {['Time', 'Phone', 'Bill', 'Points', 'Type', 'Outlet'].map((h) => (
                          <TableHead key={h} className={cn('text-ink-muted first:pl-6 last:pr-6 sm:first:pl-0 sm:last:pr-0')}>
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayLog.map((t, i) => (
                        <TableRow key={i} className={cn('border-maroon/5 last:border-0', t.type === 'Earned' ? 'bg-green-50/50 hover:bg-green-50/80' : 'bg-amber-50/50 hover:bg-amber-50/80')}>
                          <TableCell className="pl-6 font-medium text-ink sm:pl-0">{t.time}</TableCell>
                          <TableCell className="font-mono text-xs text-ink-muted">{t.phone}</TableCell>
                          <TableCell className="text-right text-ink">{t.bill}</TableCell>
                          <TableCell className="text-right font-semibold">
                            <span className={t.points > 0 ? 'text-green-700' : 'text-amber-700'}>
                              {t.points > 0 ? '+' : ''}{t.points}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(t.type === 'Earned' ? 'border-green-300 bg-green-100/60 text-green-700' : 'border-amber-300 bg-amber-100/60 text-amber-700')}>
                              {t.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-6 text-ink-muted sm:pr-0">{t.outlet}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* ─── ORDER FLOW ANIMATION DIALOG ─── */}
        <Dialog open={orderFlowStep !== null} onOpenChange={() => {}}>
          <DialogContent className="max-w-sm border-maroon/15 bg-cream-50" hideClose>
            <DialogHeader>
              <DialogTitle className="text-center font-display text-xl text-maroon">Processing Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-6">
              {flowSteps.map((step) => {
                const isActive = orderFlowStep === step.key;
                const isDone = flowSteps.findIndex(s => s.key === orderFlowStep) > flowSteps.findIndex(s => s.key === step.key) || (orderFlowStep === 'done' && step.key === 'done');
                const Icon = step.icon;
                return (
                  <div key={step.key} className={cn('flex items-center gap-3 transition-all duration-300', isActive ? 'opacity-100 scale-100' : isDone ? 'opacity-60' : 'opacity-30')}>
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      isDone ? 'bg-green-100 text-green-700' : isActive ? 'bg-maroon text-cream' : 'bg-maroon/10 text-ink-muted'
                    )}>
                      {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={cn('text-sm font-medium', isDone ? 'text-green-700' : isActive ? 'text-ink' : 'text-ink-muted')}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* ─── ORDER SUCCESS & RECEIPT ─── */}
        <Dialog open={showReceipt && !!completedOrder} onOpenChange={(o) => { if (!o) { setShowReceipt(false); } }}>
          <DialogContent className="max-w-lg border-maroon/15 bg-cream-50">
            <DialogHeader>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-center font-display text-2xl text-maroon">Order Successful</DialogTitle>
              <DialogDescription className="text-center">
                {completedOrder && (
                  <span className="font-mono text-sm font-semibold text-ink">Order ID: {completedOrder.id}</span>
                )}
              </DialogDescription>
            </DialogHeader>

            {completedOrder && (
              <div className="space-y-4">
                {/* Receipt */}
                <div className="rounded-xl border border-maroon/15 bg-cream-100/50 p-5">
                  <div className="mb-3 text-center">
                    <Logo size="lg" />
                    <p className="text-xs text-ink-muted">Digital Receipt</p>
                  </div>

                  <div className="space-y-1.5 border-b border-maroon/10 pb-3 text-sm">
                    <p className="flex justify-between">
                      <span className="text-ink-muted">Order</span>
                      <span className="font-mono font-semibold text-ink">{completedOrder.id}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-ink-muted">Customer</span>
                      <span className="font-semibold text-ink">{completedOrder.customerName}</span>
                    </p>
                  </div>

                  <div className="border-b border-maroon/10 py-3">
                    {completedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-ink">{item.emoji} {item.name} × {item.quantity}</span>
                        <span className="text-ink-muted">₹{calcItemSubtotal(item)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 pt-3 text-sm">
                    <div className="flex justify-between text-ink-muted">
                      <span>Subtotal</span>
                      <span>₹{completedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-ink-muted">
                      <span>GST (5%)</span>
                      <span>₹{completedOrder.gst}</span>
                    </div>
                    {completedOrder.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Coupon</span>
                        <span>-₹{completedOrder.couponDiscount}</span>
                      </div>
                    )}
                    {completedOrder.pointsDiscount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Redeemed Points</span>
                        <span>-₹{completedOrder.pointsDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-maroon/10 pt-1.5 font-display text-lg font-semibold text-maroon">
                      <span>Final Amount</span>
                      <span>₹{completedOrder.total}</span>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-green-300 bg-green-50/60 p-3 text-xs">
                    <p className="flex justify-between text-green-700">
                      <span>Points Earned</span>
                      <span className="font-semibold">+{completedOrder.pointsEarned} pts</span>
                    </p>
                    <p className="flex justify-between text-amber-700">
                      <span>Points Redeemed</span>
                      <span className="font-semibold">-{completedOrder.pointsRedeemed} pts</span>
                    </p>
                    <p className="flex justify-between text-ink">
                      <span>Remaining Points</span>
                      <span className="font-semibold">{completedOrder.remainingPoints.toLocaleString('en-IN')} pts</span>
                    </p>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-green-700">
                    <p className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Receipt Sent · WhatsApp ✓</p>
                    <p className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Loyalty Updated ✓</p>
                  </div>

                  {/* QR Placeholder */}
                  <div className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-maroon/20 bg-cream">
                    <QrCode className="h-10 w-10 text-ink-muted" />
                  </div>
                  <p className="mt-1 text-center text-[10px] text-ink-muted">Scan to view receipt</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-maroon/20 text-maroon hover:bg-maroon/5"
                    onClick={() => { toast.success('Receipt downloaded'); }}>
                    <Download className="mr-1.5 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1 border-green-400/40 text-green-700 hover:bg-green-50"
                    onClick={() => { toast.success('Receipt shared on WhatsApp'); }}>
                    <Share2 className="mr-1.5 h-4 w-4" />
                    Share WhatsApp
                  </Button>
                </div>

                <Button onClick={resetPOS} className="w-full bg-maroon hover:bg-maroon-700">
                  New Order
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
