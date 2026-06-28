import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Users, Coins, IndianRupee,
  MessageCircle, Pencil, Search, ArrowUpDown,
  Store, Save, Sparkles, CalendarClock, Cake,
  Plus, Trash2, Edit3, ToggleLeft, BarChart3,
  ShoppingBag, ClipboardList, Percent,
  EyeOff, Eye, Package,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import {
  AUTOMATIONS, MESSAGE_VARIABLES, MEMBERS, OUTLET_PERF, POINTS_CONFIG,
  type AutomationCard, type Member, type Product, type Coupon,
} from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type SortKey = keyof Member;

export function AdminPanel() {
  const { products, updateProduct, addProduct, coupons, addCoupon, updateCoupon, deleteCoupon, orders, analytics } = useStore();

  const [adminTab, setAdminTab] = useState('dashboard');

  // ─── Existing state ───
  const [automations, setAutomations] = useState<AutomationCard[]>(AUTOMATIONS.map((a) => ({ ...a })));
  const [editing, setEditing] = useState<AutomationCard | null>(null);
  const [draftMsg, setDraftMsg] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [config, setConfig] = useState({
    earningRate: String(POINTS_CONFIG.earningRate),
    minPurchase: String(POINTS_CONFIG.minPurchase),
    expiryDays: String(POINTS_CONFIG.expiryDays),
  });

  // ─── Menu Management state ───
  const [menuDialog, setMenuDialog] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [menuForm, setMenuForm] = useState({ name: '', description: '', category: 'Signature', price: '', emoji: '🍪', available: true, featured: false });

  // ─── Coupon Management state ───
  const [couponDialog, setCouponDialog] = useState<{ open: boolean; coupon?: Coupon }>({ open: false });
  const [couponForm, setCouponForm] = useState({ code: '', description: '', discount: '', discountType: 'fixed' as 'fixed' | 'percentage', minPurchase: '', expiry: '', outlet: 'All', status: 'Active' as 'Active' | 'Inactive' });

  // ─── Recent Orders ───
  const [orderSearch, setOrderSearch] = useState('');

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase();
    const rows = MEMBERS.filter(
      (m) => m.name.toLowerCase().includes(q) || m.phone.toLowerCase().includes(q) || m.status.toLowerCase().includes(q)
    );
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [search, sortKey, sortDir]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.toLowerCase();
    return orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      (o.customer?.name ?? '').toLowerCase().includes(q) ||
      (o.customer?.phone ?? '').toLowerCase().includes(q)
    );
  }, [orderSearch, orders]);

  const avgBill = analytics.totalOrders > 0 ? Math.round(analytics.totalRevenue / analytics.totalOrders) : 0;

  // ─── Automation handlers ───
  function toggleAutomation(id: string) {
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, on: !a.on } : a)));
    const a = automations.find((x) => x.id === id);
    if (a) toast.success(`${a.title} ${a.on ? 'disabled' : 'enabled'}`);
  }

  function openEditor(a: AutomationCard) {
    setEditing(a);
    setDraftMsg(a.message);
  }

  function saveMessage() {
    if (!editing) return;
    setAutomations((prev) => prev.map((a) => (a.id === editing.id ? { ...a, message: draftMsg } : a)));
    toast.success('Message template saved');
    setEditing(null);
  }

  function insertVariable(v: string) {
    setDraftMsg((m) => `${m}${v}`);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function saveConfig() {
    toast.success('Points configuration saved');
  }

  // ─── Menu handlers ───
  function openMenuDialog(product?: Product) {
    if (product) {
      setMenuForm({ name: product.name, description: product.description, category: product.category, price: String(product.price), emoji: product.emoji, available: product.available, featured: product.featured });
      setMenuDialog({ open: true, product });
    } else {
      setMenuForm({ name: '', description: '', category: 'Signature', price: '', emoji: '🍪', available: true, featured: false });
      setMenuDialog({ open: true });
    }
  }

  function saveMenuProduct() {
    if (!menuForm.name || !menuForm.price) {
      toast.error('Name and price are required');
      return;
    }
    const price = Number(menuForm.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Enter a valid price');
      return;
    }
    if (menuDialog.product) {
      updateProduct(menuDialog.product.id, {
        name: menuForm.name,
        description: menuForm.description,
        category: menuForm.category,
        price,
        emoji: menuForm.emoji,
        available: menuForm.available,
        featured: menuForm.featured,
      });
      toast.success('Product updated');
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: menuForm.name,
        description: menuForm.description,
        category: menuForm.category,
        price,
        emoji: menuForm.emoji,
        available: menuForm.available,
        featured: menuForm.featured,
      };
      addProduct(newProduct);
      toast.success('Product added');
    }
    setMenuDialog({ open: false });
  }

  // ─── Coupon handlers ───
  function openCouponDialog(coupon?: Coupon) {
    if (coupon) {
      setCouponForm({ code: coupon.code, description: coupon.description, discount: String(coupon.discount), discountType: coupon.discountType, minPurchase: String(coupon.minPurchase), expiry: coupon.expiry, outlet: coupon.outlet, status: coupon.status });
      setCouponDialog({ open: true, coupon });
    } else {
      setCouponForm({ code: '', description: '', discount: '', discountType: 'fixed', minPurchase: '', expiry: '', outlet: 'All', status: 'Active' });
      setCouponDialog({ open: true });
    }
  }

  function saveCoupon() {
    if (!couponForm.code || !couponForm.discount) {
      toast.error('Code and discount are required');
      return;
    }
    const discount = Number(couponForm.discount);
    if (isNaN(discount) || discount <= 0) {
      toast.error('Enter a valid discount');
      return;
    }
    if (couponDialog.coupon) {
      updateCoupon(couponDialog.coupon.id, {
        code: couponForm.code.toUpperCase(),
        description: couponForm.description,
        discount,
        discountType: couponForm.discountType,
        minPurchase: Number(couponForm.minPurchase) || 0,
        expiry: couponForm.expiry || 'No expiry',
        outlet: couponForm.outlet,
        status: couponForm.status,
      });
      toast.success('Coupon updated');
    } else {
      const newCoupon: Coupon = {
        id: `coup-${Date.now()}`,
        code: couponForm.code.toUpperCase(),
        description: couponForm.description,
        discount,
        discountType: couponForm.discountType,
        minPurchase: Number(couponForm.minPurchase) || 0,
        expiry: couponForm.expiry || 'No expiry',
        outlet: couponForm.outlet,
        status: 'Active',
      };
      addCoupon(newCoupon);
      toast.success('Coupon created');
    }
    setCouponDialog({ open: false });
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'menu', label: 'Menu Management', icon: Package },
    { id: 'coupons', label: 'Coupons', icon: Percent },
    { id: 'orders', label: 'Recent Orders', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-cream bg-grain">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-maroon/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="hidden rounded-full bg-maroon/10 px-2.5 py-0.5 text-xs font-medium text-maroon sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Store className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">All outlets · Chennai</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-maroon">Dashboard</h1>
          <p className="text-sm text-ink-muted">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Admin Tabs */}
        <Tabs value={adminTab} onValueChange={setAdminTab} className="mb-6">
          <TabsList className="bg-cream-100/70 border border-maroon/10 p-1">
            {tabs.map(t => (
              <TabsTrigger key={t.id} value={t.id}
                className="data-[state=active]:bg-maroon data-[state=active]:text-cream data-[state=active]:shadow-sm gap-1.5 px-3 py-1.5 text-sm">
                <t.icon className="h-4 w-4" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* ─── TAB: Dashboard ─── */}
        <TabsContent value="dashboard" className="mt-0 animate-fade-in">
          {/* Stats Row */}
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="group border-maroon/15 bg-cream-50/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/8 text-maroon transition-colors group-hover:bg-maroon group-hover:text-cream">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Today's Revenue</p>
                <p className="mt-1 font-display text-3xl font-semibold text-ink">
                  ₹{analytics.todayRevenue.toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
            <Card className="group border-maroon/15 bg-cream-50/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/8 text-maroon transition-colors group-hover:bg-maroon group-hover:text-cream">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Today's Orders</p>
                <p className="mt-1 font-display text-3xl font-semibold text-ink">{analytics.totalOrders}</p>
              </CardContent>
            </Card>
            <Card className="group border-maroon/15 bg-cream-50/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/8 text-maroon transition-colors group-hover:bg-maroon group-hover:text-cream">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Average Bill</p>
                <p className="mt-1 font-display text-3xl font-semibold text-ink">₹{avgBill.toLocaleString('en-IN')}</p>
              </CardContent>
            </Card>
            <Card className="group border-maroon/15 bg-cream-50/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/8 text-maroon transition-colors group-hover:bg-maroon group-hover:text-cream">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Top Selling</p>
                <p className="mt-1 font-display text-3xl font-semibold text-ink text-ellipsis overflow-hidden whitespace-nowrap">
                  {analytics.topSelling[0]?.name ?? 'N/A'}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Charts & Leaderboards */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Payment Distribution */}
            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-xl text-maroon">Payment Method Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.paymentDist.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-muted">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.paymentDist.map(p => {
                      const pct = analytics.totalOrders > 0 ? Math.round(p.count / analytics.totalOrders * 100) : 0;
                      return (
                        <div key={p.method}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="capitalize text-ink">{p.method}</span>
                            <span className="text-ink-muted">{p.count} orders · ₹{p.total.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-maroon/10">
                            <div className="h-full rounded-full bg-maroon transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Selling Leaderboard */}
            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-xl text-maroon">Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topSelling.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-muted">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topSelling.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-3 rounded-lg border border-maroon/10 bg-cream-100/50 px-3 py-2">
                        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-cream', i === 0 ? 'bg-gold' : i === 1 ? 'bg-ink-muted' : i === 2 ? 'bg-maroon/60' : 'bg-maroon/30')}>
                          {i + 1}
                        </span>
                        <span className="text-lg">{item.emoji}</span>
                        <span className="flex-1 text-sm font-medium text-ink">{item.name}</span>
                        <Badge variant="outline" className="border-maroon/20 text-maroon">{item.count} sold</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Points Progress */}
            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-xl text-maroon">Points Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-ink">Points Issued</span>
                      <span className="font-semibold text-green-700">{analytics.pointsIssued.toLocaleString('en-IN')} pts</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-maroon/10">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(100, (analytics.pointsIssued / Math.max(1, analytics.pointsIssued + analytics.pointsRedeemed)) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-ink">Points Redeemed</span>
                      <span className="font-semibold text-amber-700">{analytics.pointsRedeemed.toLocaleString('en-IN')} pts</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-maroon/10">
                      <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${Math.min(100, (analytics.pointsRedeemed / Math.max(1, analytics.pointsIssued + analytics.pointsRedeemed)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Repeat Customers */}
            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-xl text-maroon">Repeat Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="py-8 text-center text-sm text-ink-muted">Analytics update as orders are placed</p>
              </CardContent>
            </Card>
          </section>

          {/* Existing Features */}

          {/* WHATSAPP AUTOMATIONS */}
          <section className="mb-10">
            <div className="mb-5 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <h2 className="font-display text-2xl text-maroon">WhatsApp Automations</h2>
              <Badge variant="outline" className="border-green-300 text-green-700">Crown feature</Badge>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {automations.map((a) => {
                const Icon = a.id === 'points-added' ? Sparkles : a.id === 'expiry-reminder' ? CalendarClock : Cake;
                return (
                  <Card key={a.id} className={cn('flex flex-col border bg-cream-50/60 shadow-sm transition-all duration-300 hover:shadow-md', a.on ? 'border-maroon/15' : 'border-maroon/10 opacity-70')}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', a.on ? 'bg-green-100 text-green-700' : 'bg-maroon/8 text-ink-muted')}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <CardTitle className="text-base text-maroon">{a.title}</CardTitle>
                            {a.trigger && <p className="text-xs text-ink-muted">{a.trigger}</p>}
                          </div>
                        </div>
                        <Switch checked={a.on} onCheckedChange={() => toggleAutomation(a.id)}
                          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-maroon/15" />
                      </div>
                      <CardDescription className="mt-2">{a.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-3">
                      <div className="rounded-lg border border-maroon/10 bg-cream-100/50 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-ink-muted">Message preview</p>
                        <p className="mt-1 line-clamp-3 text-sm text-ink">{a.message}</p>
                      </div>
                      <Button variant="outline" onClick={() => openEditor(a)}
                        className="w-full border-maroon/25 text-maroon hover:bg-maroon/5">
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Message
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* MEMBERS TABLE */}
          <section className="mb-10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-maroon" />
                <h2 className="font-display text-2xl text-maroon">Members</h2>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, phone, status…" className="border-maroon/20 bg-cream pl-10" />
              </div>
            </div>
            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardContent className="px-0 sm:px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-maroon/10 hover:bg-transparent">
                      {([['name', 'Name'], ['phone', 'Phone'], ['points', 'Points'], ['lastVisit', 'Last Visit'], ['joined', 'Joined'], ['status', 'Status']] as [SortKey, string][]).map(([key, label]) => (
                        <TableHead key={key} className="text-ink-muted first:pl-6 last:pr-6 sm:first:pl-0 sm:last:pr-0">
                          <button onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 transition-colors hover:text-maroon">
                            {label}
                            <ArrowUpDown className={cn('h-3 w-3', sortKey === key ? 'text-maroon' : 'text-ink-muted/50')} />
                          </button>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((m) => (
                      <TableRow key={m.phone} className="border-maroon/5 last:border-0">
                        <TableCell className="pl-6 font-medium text-ink sm:pl-0">{m.name}</TableCell>
                        <TableCell className="font-mono text-xs text-ink-muted">{m.phone}</TableCell>
                        <TableCell className="font-semibold text-ink">{m.points.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-ink-muted">{m.lastVisit}</TableCell>
                        <TableCell className="text-ink-muted">{m.joined}</TableCell>
                        <TableCell className="pr-6 sm:pr-0">
                          <Badge variant="outline" className={cn(m.status === 'Active' ? 'border-green-300 bg-green-100/60 text-green-700' : 'border-amber-300 bg-amber-100/60 text-amber-700')}>{m.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredMembers.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="py-8 text-center text-ink-muted">No members match your search.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* CONFIG + OUTLET PERF */}
          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-gold-600" />
                  <CardTitle className="font-display text-xl text-maroon">Points Configuration</CardTitle>
                </div>
                <CardDescription>Tune how customers earn and redeem. Changes apply program-wide.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Earning rule (₹ spent per point)</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <Input value={config.earningRate} onChange={(e) => setConfig((c) => ({ ...c, earningRate: e.target.value.replace(/\D/g, '') }))} className="border-maroon/20 bg-cream pl-10" inputMode="numeric" />
                    </div>
                    <span className="text-sm text-ink-muted">= 1 point</span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Min purchase to earn (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <Input value={config.minPurchase} onChange={(e) => setConfig((c) => ({ ...c, minPurchase: e.target.value.replace(/\D/g, '') }))} className="border-maroon/20 bg-cream pl-10" inputMode="numeric" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Points expiry (days)</label>
                    <Input value={config.expiryDays} onChange={(e) => setConfig((c) => ({ ...c, expiryDays: e.target.value.replace(/\D/g, '') }))} className="border-maroon/20 bg-cream" inputMode="numeric" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-maroon/10 bg-cream-100/50 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-muted">Redemption rate</p>
                    <p className="text-sm font-medium text-ink">{POINTS_CONFIG.redemption}</p>
                  </div>
                  <Badge variant="outline" className="border-gold/40 text-gold-600">Fixed</Badge>
                </div>
                <Button onClick={saveConfig} className="w-full bg-maroon hover:bg-maroon-700"><Save className="mr-2 h-4 w-4" /> Save Configuration</Button>
              </CardContent>
            </Card>

            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-maroon" />
                  <CardTitle className="font-display text-xl text-maroon">Outlet Performance</CardTitle>
                </div>
                <CardDescription>This month across all outlets</CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-maroon/10 hover:bg-transparent">
                      {['Outlet', 'Transactions', 'Points Issued', 'Redemptions'].map((h, i) => (
                        <TableHead key={h} className={cn('text-ink-muted', i > 0 && 'text-right', i === 0 && 'pl-6 sm:pl-0', i === 3 && 'pr-6 sm:pr-0')}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {OUTLET_PERF.map((o) => (
                      <TableRow key={o.outlet} className="border-maroon/5 last:border-0">
                        <TableCell className="pl-6 font-medium text-ink sm:pl-0">{o.outlet}</TableCell>
                        <TableCell className="text-right text-ink">{o.transactions}</TableCell>
                        <TableCell className="text-right text-ink">{o.pointsIssued}</TableCell>
                        <TableCell className="pr-6 text-right text-ink sm:pr-0">{o.redemptions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        {/* ─── TAB: Menu Management ─── */}
        <TabsContent value="menu" className="mt-0 animate-fade-in">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-maroon" />
              <h2 className="font-display text-2xl text-maroon">Menu Management</h2>
            </div>
            <Button onClick={() => openMenuDialog()} className="bg-maroon hover:bg-maroon-700">
              <Plus className="mr-1.5 h-4 w-4" /> Add Product
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className={cn('border bg-cream-50/60 shadow-sm', product.available ? 'border-maroon/15' : 'border-maroon/10 opacity-60')}>
                <div className="flex items-center justify-center bg-gradient-to-br from-gold/10 to-maroon/5 py-4 text-4xl">
                  <span className="drop-shadow-sm">{product.emoji}</span>
                </div>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-semibold text-maroon">{product.name}</h3>
                      <Badge variant="outline" className={cn('text-xs', product.available ? 'border-green-300 text-green-700' : 'border-red-300 text-red-600')}>
                        {product.available ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted line-clamp-2">{product.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="border-maroon/20 text-maroon text-[10px]">{product.category}</Badge>
                      <span className="font-display text-sm font-bold text-gold-600">₹{product.price}</span>
                      {product.featured && <span className="text-[10px] text-gold">Featured</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-maroon/20 text-maroon hover:bg-maroon/5"
                      onClick={() => openMenuDialog(product)}>
                      <Edit3 className="mr-1 h-3 w-3" /> Edit
                    </Button>
                    <Button size="sm" variant="outline"
                      className={cn('flex-1', product.available ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50')}
                      onClick={() => { updateProduct(product.id, { available: !product.available }); toast.success(`${product.name} ${product.available ? 'disabled' : 'enabled'}`); }}>
                      {product.available ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                      {product.available ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── TAB: Coupons ─── */}
        <TabsContent value="coupons" className="mt-0 animate-fade-in">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-maroon" />
              <h2 className="font-display text-2xl text-maroon">Coupons</h2>
            </div>
            <Button onClick={() => openCouponDialog()} className="bg-maroon hover:bg-maroon-700">
              <Plus className="mr-1.5 h-4 w-4" /> Create Coupon
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => (
              <Card key={c.id} className={cn('border bg-cream-50/60 shadow-sm', c.status === 'Active' ? 'border-maroon/15' : 'border-maroon/10 opacity-60')}>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold text-maroon">{c.code}</span>
                      <Badge variant="outline" className={cn('text-xs', c.status === 'Active' ? 'border-green-300 text-green-700' : 'border-amber-300 text-amber-700')}>
                        {c.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink">{c.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="border-maroon/20 text-maroon text-[10px]">
                        {c.discountType === 'percentage' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                      </Badge>
                      {c.minPurchase > 0 && (
                        <Badge variant="outline" className="border-ink-muted/30 text-ink-muted text-[10px]">
                          Min ₹{c.minPurchase}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-ink-muted/30 text-ink-muted text-[10px]">
                        {c.outlet}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] text-ink-muted">Expires: {c.expiry}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-maroon/20 text-maroon hover:bg-maroon/5"
                      onClick={() => openCouponDialog(c)}>
                      <Edit3 className="mr-1 h-3 w-3" /> Edit
                    </Button>
                    <Button size="sm" variant="outline"
                      className={cn('flex-1', c.status === 'Active' ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-green-200 text-green-700 hover:bg-green-50')}
                      onClick={() => { updateCoupon(c.id, { status: c.status === 'Active' ? 'Inactive' : 'Active' }); toast.success(`Coupon ${c.status === 'Active' ? 'disabled' : 'enabled'}`); }}>
                      <ToggleLeft className="mr-1 h-3 w-3" />
                      {c.status === 'Active' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => { deleteCoupon(c.id); toast.success('Coupon deleted'); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── TAB: Recent Orders ─── */}
        <TabsContent value="orders" className="mt-0 animate-fade-in">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-maroon" />
              <h2 className="font-display text-2xl text-maroon">Recent Orders</h2>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order ID, customer…" className="border-maroon/20 bg-cream pl-10" />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-ink-muted">No orders yet. Orders from Staff POS will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-maroon/15 bg-cream-50/60 shadow-sm">
              <CardContent className="px-0 sm:px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-maroon/10 hover:bg-transparent">
                      {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Outlet', 'Time', 'Status'].map(h => (
                        <TableHead key={h} className="text-ink-muted first:pl-6 last:pr-6 sm:first:pl-0 sm:last:pr-0">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((o) => (
                      <TableRow key={o.id} className="border-maroon/5 last:border-0">
                        <TableCell className="pl-6 font-mono text-xs font-semibold text-maroon sm:pl-0">{o.id}</TableCell>
                        <TableCell className="font-medium text-ink">{o.customer?.name ?? 'Walk-in'}</TableCell>
                        <TableCell className="text-ink-muted">
                          <span className="truncate max-w-[120px] inline-block">{o.items.map(i => `${i.emoji}${i.name}×${i.quantity}`).join(', ')}</span>
                        </TableCell>
                        <TableCell className="font-semibold text-ink">₹{o.total.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="capitalize text-ink-muted">{o.paymentMethod}</TableCell>
                        <TableCell className="text-ink-muted">{o.outlet}</TableCell>
                        <TableCell className="text-ink-muted">{o.timestamp}</TableCell>
                        <TableCell className="pr-6 sm:pr-0">
                          <Badge variant="outline" className="border-green-300 bg-green-100/60 text-green-700">Completed</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </div>

      {/* EDIT MESSAGE MODAL */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl border-maroon/15 bg-cream-50">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-maroon">Edit Message · {editing?.title}</DialogTitle>
            <DialogDescription>Tap a variable chip to insert it. Preview before saving.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_VARIABLES.map((v) => (
                <button key={v} onClick={() => insertVariable(v)}
                  className="rounded-full border border-maroon/20 bg-cream px-2.5 py-1 text-xs font-medium text-maroon transition-colors hover:bg-maroon hover:text-cream">{v}</button>
              ))}
            </div>

            <div>
              <textarea value={draftMsg} onChange={(e) => setDraftMsg(e.target.value)} rows={5}
                className="w-full resize-none rounded-lg border border-maroon/20 bg-cream p-3 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-maroon" />
              <div className="mt-1 flex justify-between text-xs text-ink-muted">
                <span>Variables insert at cursor end</span>
                <span>{draftMsg.length} chars</span>
              </div>
            </div>

            <div className="rounded-lg border border-green-300/60 bg-green-50/60 p-3">
              <p className="mb-1 text-[11px] uppercase tracking-wide text-green-700">WhatsApp preview</p>
              <p className="whitespace-pre-wrap text-sm text-ink">{draftMsg}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} className="border-maroon/25 text-maroon hover:bg-maroon/5">Cancel</Button>
            <Button onClick={saveMessage} className="bg-maroon hover:bg-maroon-700"><Save className="mr-1.5 h-4 w-4" /> Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MENU EDIT DIALOG */}
      <Dialog open={menuDialog.open} onOpenChange={(o) => !o && setMenuDialog({ open: false })}>
        <DialogContent className="max-w-lg border-maroon/15 bg-cream-50">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-maroon">
              {menuDialog.product ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Name</label>
                <Input value={menuForm.name} onChange={(e) => setMenuForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" className="border-maroon/20 bg-cream" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Emoji</label>
                <Input value={menuForm.emoji} onChange={(e) => setMenuForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🍪" className="border-maroon/20 bg-cream" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Description</label>
              <textarea value={menuForm.description} onChange={(e) => setMenuForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full resize-none rounded-lg border border-maroon/20 bg-cream p-3 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-maroon" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Category</label>
                <select value={menuForm.category} onChange={(e) => setMenuForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-maroon/20 bg-cream p-2.5 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-maroon">
                  <option>Signature</option>
                  <option>Beverages</option>
                  <option>Seasonal</option>
                  <option>Specials</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Price (₹)</label>
                <Input value={menuForm.price} onChange={(e) => setMenuForm(f => ({ ...f, price: e.target.value.replace(/\D/g, '').slice(0, 5) }))} placeholder="199" className="border-maroon/20 bg-cream" inputMode="numeric" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={menuForm.available} onChange={(e) => setMenuForm(f => ({ ...f, available: e.target.checked }))}
                  className="h-4 w-4 rounded border-maroon/30 accent-maroon" />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={menuForm.featured} onChange={(e) => setMenuForm(f => ({ ...f, featured: e.target.checked }))}
                  className="h-4 w-4 rounded border-maroon/30 accent-maroon" />
                Featured
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMenuDialog({ open: false })} className="border-maroon/25 text-maroon hover:bg-maroon/5">Cancel</Button>
            <Button onClick={saveMenuProduct} className="bg-maroon hover:bg-maroon-700">
              <Save className="mr-1.5 h-4 w-4" /> {menuDialog.product ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COUPON EDIT DIALOG */}
      <Dialog open={couponDialog.open} onOpenChange={(o) => !o && setCouponDialog({ open: false })}>
        <DialogContent className="max-w-lg border-maroon/15 bg-cream-50">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-maroon">
              {couponDialog.coupon ? 'Edit Coupon' : 'Create Coupon'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Code</label>
                <Input value={couponForm.code} onChange={(e) => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase().slice(0, 15) }))} placeholder="WELCOME50" className="border-maroon/20 bg-cream font-mono uppercase" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Discount</label>
                <Input value={couponForm.discount} onChange={(e) => setCouponForm(f => ({ ...f, discount: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="50" className="border-maroon/20 bg-cream" inputMode="numeric" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Description</label>
              <Input value={couponForm.description} onChange={(e) => setCouponForm(f => ({ ...f, description: e.target.value }))} placeholder="₹50 OFF on first order" className="border-maroon/20 bg-cream" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Discount Type</label>
                <select value={couponForm.discountType} onChange={(e) => setCouponForm(f => ({ ...f, discountType: e.target.value as 'fixed' | 'percentage' }))}
                  className="w-full rounded-lg border border-maroon/20 bg-cream p-2.5 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-maroon">
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Min Purchase</label>
                <Input value={couponForm.minPurchase} onChange={(e) => setCouponForm(f => ({ ...f, minPurchase: e.target.value.replace(/\D/g, '').slice(0, 5) }))} placeholder="300" className="border-maroon/20 bg-cream" inputMode="numeric" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Expiry</label>
                <Input value={couponForm.expiry} onChange={(e) => setCouponForm(f => ({ ...f, expiry: e.target.value }))} placeholder="31 Dec 2026" className="border-maroon/20 bg-cream" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Outlet</label>
                <select value={couponForm.outlet} onChange={(e) => setCouponForm(f => ({ ...f, outlet: e.target.value }))}
                  className="w-full rounded-lg border border-maroon/20 bg-cream p-2.5 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-maroon">
                  <option>All</option>
                  <option>Annanagar</option>
                  <option>Besant Nagar</option>
                  <option>Chamiers Road</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCouponDialog({ open: false })} className="border-maroon/25 text-maroon hover:bg-maroon/5">Cancel</Button>
            <Button onClick={saveCoupon} className="bg-maroon hover:bg-maroon-700">
              <Save className="mr-1.5 h-4 w-4" /> {couponDialog.coupon ? 'Update' : 'Create'} Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
