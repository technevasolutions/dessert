// Hardcoded mock data for the Tempt. demo. No backend, no API calls.

export type Role = 'customer' | 'staff' | 'admin';

export const BRAND = {
  name: 'Tempt.',
  tagline: 'Every rupee you spend, sweetens the deal',
  phone: '+91 98849 78887',
  email: 'Tempt.tbc@gmail.com',
  instagram: '@tempt_desserts',
  instagramUrl: 'https://instagram.com/tempt_desserts',
  city: 'Chennai',
  gstin: '33AAWFT3154E1Z1',
  founded: 'March 2024',
  founders: 'Nikhil Shivanand & Akshay Sunil',
};

export const STORY_BODY =
  'Tempt began as a humble dessert cart in Chennai in March 2024, founded by two 26-year-old self-made entrepreneurs — Nikhil Shivanand and Akshay Sunil. What started as a simple idea has grown into one of Chennai\'s most-loved dessert destinations. Our signature Brocolate quickly became a viral hit. Today we\'re across Annanagar, Besant Nagar, and Chamiers Road — with more on the way.';

export const STORY_QUOTE = 'From our kitchen to your heart.';

export const WHY_TEMPT = [
  { icon: '🤍', title: 'Made with Love', desc: 'Every batch crafted by hand with care and passion' },
  { icon: '🌿', title: '100% Natural', desc: 'No artificial colors, flavors, or preservatives' },
  { icon: '⭐', title: 'Premium Quality', desc: 'Only the finest ingredients make it into our creations' },
];

export const REWARD_STEPS = [
  'Visit any Tempt. outlet',
  'Share your phone number at the counter',
  'Earn 1 pt per ₹10 spent. Redeem 100 pts = ₹10 off',
];

export type Branch = {
  name: string;
  address: string;
};

export const BRANCHES: Branch[] = [
  { name: 'Annanagar', address: 'Plot 23, 2nd Ave, Anna Nagar, Chennai' },
  { name: 'Besant Nagar', address: "12 Elliot's Beach Rd, Besant Nagar, Chennai" },
  { name: 'Chamiers Road', address: '45 Chamiers Rd, R.A. Puram, Chennai' },
];

export const OUTLETS = ['Annanagar', 'Besant Nagar', 'Chamiers Road'] as const;
export type Outlet = (typeof OUTLETS)[number];

export const CUSTOMER = {
  name: 'Priya S.',
  phone: '98XX XXX XX21',
  phoneMasked: '98XX...X021',
  totalPoints: 1240,
  pointsValue: 124,
  expiringPoints: 320,
  expiryDate: '15 Aug 2025',
};

export type PointsEntry = {
  date: string;
  description: string;
  points: number;
};

export const POINTS_HISTORY: PointsEntry[] = [
  { date: '12 Jun', description: 'Purchase ₹680', points: 68 },
  { date: '05 Jun', description: 'Purchase ₹450', points: 45 },
  { date: '28 May', description: 'Redeemed', points: -100 },
  { date: '20 May', description: 'Purchase ₹1,270', points: 127 },
];

export type MenuItem = {
  name: string;
  price: number;
  emoji: string;
  blurb: string;
};

export const MENU: MenuItem[] = [
  { name: 'Biscoff Brocolate', price: 199, emoji: '🍪', blurb: 'White choco chip vanilla bites drenched in silky gourmet biscoff sauce' },
  { name: 'Death By Chocolate', price: 219, emoji: '🍫', blurb: 'Choco chip brownie bites with scoops of chocolate ice cream & silky chocolate sauce' },
  { name: 'Smoothic', price: 179, emoji: '🥤', blurb: 'Is it a smoothie or a milkshake? A creamy, dreamy blend you have to taste to believe' },
  { name: 'Premium Hot Chocolate', price: 149, emoji: '☕', blurb: 'Rich, velvety hot chocolate made from the finest cocoa' },
  { name: 'Almond Crunch Cup', price: 229, emoji: '🥮', blurb: 'Crunchy roasted almonds layered with our signature ice cream' },
  { name: 'KitKat Sundae', price: 239, emoji: '🍨', blurb: 'KitKat fingers nestled in creamy sundae with chocolate drizzle' },
];

export type TodayTxn = {
  time: string;
  phone: string;
  bill: string;
  points: number;
  type: 'Earned' | 'Redeemed';
  outlet: Outlet;
};

export const TODAY_LOG: TodayTxn[] = [
  { time: '7:42pm', phone: '98XX...X021', bill: '₹680', points: 68, type: 'Earned', outlet: 'Besant Nagar' },
  { time: '6:15pm', phone: '91XX...X447', bill: '–', points: -100, type: 'Redeemed', outlet: 'Annanagar' },
  { time: '5:03pm', phone: '87XX...X312', bill: '₹1,270', points: 127, type: 'Earned', outlet: 'Chamiers Road' },
  { time: '3:30pm', phone: '99XX...X889', bill: '₹450', points: 45, type: 'Earned', outlet: 'Besant Nagar' },
];

export const TODAY_SUMMARY = {
  transactions: 12,
  earned: 847,
  redeemed: 200,
};

export const ADMIN_STATS = [
  { label: 'Total Members', value: '1,284', sub: 'across 3 outlets' },
  { label: 'Points in Circulation', value: '94,320', sub: 'pts' },
  { label: 'Redeemed This Month', value: '8,400', sub: 'pts' },
  { label: 'Revenue Influenced', value: '₹2,14,500', sub: 'this month' },
];

export type AutomationCard = {
  id: string;
  title: string;
  description: string;
  trigger?: string;
  on: boolean;
  message: string;
};

export const AUTOMATIONS: AutomationCard[] = [
  {
    id: 'points-added',
    title: 'Points Added Confirmation',
    description: 'Sent instantly when a customer earns points at the counter.',
    on: true,
    message:
      "Hi {name}! 🎉 You've earned {points} pts at Tempt. {outlet}. Total: {total_pts} pts. Worth ₹{value} off! Visit us again 🍫",
  },
  {
    id: 'expiry-reminder',
    title: 'Points Expiry Reminder',
    description: 'Nudge customers before their points melt away.',
    trigger: '7 days before expiry',
    on: true,
    message:
      'Hey {name}! ⏰ {expiring_pts} of your Tempt. points expire on {date}. Redeem them before they melt away! 🍨',
  },
  {
    id: 'birthday-wish',
    title: 'Birthday Wish',
    description: 'A sweet surprise on their special day.',
    trigger: 'On birthday',
    on: true,
    message:
      'Happy Birthday {name}! 🎂 Treat yourself — your Tempt. loyalty points are waiting. Show this at the counter for a sweet surprise! 🎁',
  },
];

export const MESSAGE_VARIABLES = [
  '{name}',
  '{points}',
  '{total_pts}',
  '{value}',
  '{outlet}',
  '{expiring_pts}',
  '{date}',
];

export type Member = {
  name: string;
  phone: string;
  points: number;
  lastVisit: string;
  joined: string;
  status: 'Active' | 'At Risk';
};

export const MEMBERS: Member[] = [
  { name: 'Priya S.', phone: '98XX...X021', points: 1240, lastVisit: '12 Jun 2025', joined: 'Mar 2025', status: 'Active' },
  { name: 'Arjun M.', phone: '91XX...X447', points: 340, lastVisit: '05 Jun 2025', joined: 'Apr 2025', status: 'Active' },
  { name: 'Sneha R.', phone: '87XX...X312', points: 2810, lastVisit: '28 May 2025', joined: 'Jan 2025', status: 'Active' },
  { name: 'Vikram T.', phone: '99XX...X889', points: 80, lastVisit: '10 May 2025', joined: 'May 2025', status: 'At Risk' },
];

export const POINTS_CONFIG = {
  earningRule: '₹10 spent = 1 point',
  earningRate: 10,
  minPurchase: 300,
  expiryDays: 90,
  redemption: '100 pts = ₹10 off',
};

export type OutletPerf = {
  outlet: Outlet;
  transactions: number;
  pointsIssued: string;
  redemptions: number;
};

export const OUTLET_PERF: OutletPerf[] = [
  { outlet: 'Besant Nagar', transactions: 487, pointsIssued: '42,300 pts', redemptions: 38 },
  { outlet: 'Annanagar', transactions: 391, pointsIssued: '34,100 pts', redemptions: 29 },
  { outlet: 'Chamiers Road', transactions: 312, pointsIssued: '17,920 pts', redemptions: 19 },
];

// Earning rule: ₹1 spent = 0.1 pts (i.e. ₹10 = 1 pt), min ₹300 to earn.
export function calcEarnedPoints(bill: number): number {
  if (!bill || bill < 300) return 0;
  return Math.round(bill * 0.1);
}

// ─── Extended Types for POS System ───────────────────────────────────────

export interface CustomerProfile {
  phone: string;
  name: string;
  totalPoints: number;
  pointsValue: number;
  membershipTier: string;
  birthday: string;
  lifetimeSpend: number;
  favouriteDessert: string;
  availableDiscount: string;
  lastVisit: string;
}

export const MOCK_CUSTOMERS: CustomerProfile[] = [
  { phone: '9884978887', name: 'Priya S.', totalPoints: 1240, pointsValue: 124, membershipTier: 'Gold Member ⭐', birthday: '14 October', lifetimeSpend: 12400, favouriteDessert: 'Death By Chocolate', availableDiscount: '₹124 off', lastVisit: '2 days ago' },
  { phone: '9123456789', name: 'Arjun M.', totalPoints: 340, pointsValue: 34, membershipTier: 'Silver Member', birthday: '2 March', lifetimeSpend: 3400, favouriteDessert: 'Biscoff Brocolate', availableDiscount: '₹34 off', lastVisit: '5 days ago' },
  { phone: '8765432109', name: 'Sneha R.', totalPoints: 2810, pointsValue: 281, membershipTier: 'Platinum Member 💎', birthday: '22 June', lifetimeSpend: 28100, favouriteDessert: 'Premium Hot Chocolate', availableDiscount: '₹281 off', lastVisit: '1 week ago' },
  { phone: '9988776655', name: 'Vikram T.', totalPoints: 80, pointsValue: 8, membershipTier: 'Bronze Member', birthday: '8 December', lifetimeSpend: 800, favouriteDessert: 'KitKat Sundae', availableDiscount: '₹8 off', lastVisit: '2 weeks ago' },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  emoji: string;
  available: boolean;
  featured: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Biscoff Brocolate', description: 'White choco chip vanilla bites drenched in silky gourmet biscoff sauce', category: 'Signature', price: 199, emoji: '🍪', available: true, featured: true },
  { id: 'prod-2', name: 'Death By Chocolate', description: 'Choco chip brownie bites with scoops of chocolate ice cream & silky chocolate sauce', category: 'Signature', price: 219, emoji: '🍫', available: true, featured: true },
  { id: 'prod-3', name: 'Smoothic', description: 'Is it a smoothie or a milkshake? A creamy, dreamy blend you have to taste to believe', category: 'Beverages', price: 179, emoji: '🥤', available: true, featured: true },
  { id: 'prod-4', name: 'Premium Hot Chocolate', description: 'Rich, velvety hot chocolate made from the finest cocoa', category: 'Beverages', price: 149, emoji: '☕', available: true, featured: false },
  { id: 'prod-5', name: 'Almond Crunch Cup', description: 'Crunchy roasted almonds layered with our signature ice cream', category: 'Signature', price: 229, emoji: '🥮', available: true, featured: true },
  { id: 'prod-6', name: 'KitKat Sundae', description: 'KitKat fingers nestled in creamy sundae with chocolate drizzle', category: 'Signature', price: 239, emoji: '🍨', available: true, featured: true },
];

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: number;
  discountType: 'fixed' | 'percentage';
  minPurchase: number;
  expiry: string;
  outlet: string;
  status: 'Active' | 'Inactive';
}

export const INITIAL_COUPONS: Coupon[] = [
  { id: 'coup-1', code: 'WELCOME50', description: '₹50 OFF on first order', discount: 50, discountType: 'fixed', minPurchase: 300, expiry: '31 Dec 2026', outlet: 'All', status: 'Active' },
  { id: 'coup-2', code: 'SWEET20', description: '20% OFF on all desserts', discount: 20, discountType: 'percentage', minPurchase: 500, expiry: '31 Dec 2026', outlet: 'All', status: 'Active' },
  { id: 'coup-3', code: 'BROWNIE10', description: '₹10 OFF on Brownie range', discount: 10, discountType: 'fixed', minPurchase: 199, expiry: '30 Sep 2026', outlet: 'Besant Nagar', status: 'Active' },
  { id: 'coup-4', code: 'GOLD100', description: '₹100 OFF on orders above ₹1000', discount: 100, discountType: 'fixed', minPurchase: 1000, expiry: '31 Dec 2026', outlet: 'All', status: 'Inactive' },
];

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export interface CompletedOrder {
  id: string;
  customer: { phone: string; name: string } | null;
  items: CartItem[];
  subtotal: number;
  gst: number;
  couponCode: string;
  couponDiscount: number;
  pointsRedeemed: number;
  pointsDiscount: number;
  total: number;
  paymentMethod: string;
  outlet: string;
  timestamp: string;
  pointsEarned: number;
}

const ORDER_COUNTER = { value: 125 };

export function generateOrderId(): string {
  ORDER_COUNTER.value += 1;
  const year = new Date().getFullYear();
  return `TMP-${year}-${String(ORDER_COUNTER.value).padStart(5, '0')}`;
}

export function calcItemSubtotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function calcOrderSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + calcItemSubtotal(item), 0);
}

export function calcPointsEarned(amount: number): number {
  return Math.floor(amount / 10);
}

export function calcPointsDiscount(pts: number): number {
  return Math.floor(pts / 10);
}
