import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronDown,
  Phone,
  Gift,
  Clock,
  TrendingUp,
  TrendingDown,
  MapPin,
  Instagram,
  Mail,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import {
  BRAND,
  STORY_BODY,
  STORY_QUOTE,
  WHY_TEMPT,
  REWARD_STEPS,
  BRANCHES,
  MENU,
  CUSTOMER,
  POINTS_HISTORY,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function CustomerPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [phone, setPhone] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemPts, setRedeemPts] = useState(100);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const menuRef = useRef<HTMLElement>(null);
  const rewardsRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const branchesRef = useRef<HTMLElement>(null);

  const redeemValue = Math.floor(redeemPts / 10);

  function scrollTo(ref: React.RefObject<HTMLElement>) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleLogin() {
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    setLoggedIn(true);
    toast.success('Welcome back, Priya!', {
      description: 'Your Tempt. rewards are ready.',
    });
  }

  function handleRedeem() {
    if (redeemCode.length < 4) {
      toast.error('Enter the redemption code from staff');
      return;
    }
    if (redeemPts < 100) {
      toast.error('Minimum 100 points to redeem');
      return;
    }
    setRedeemed(true);
    toast.success('Redemption requested!', {
      description: `${redeemPts} pts = ₹${redeemValue} off. Show this at the counter.`,
    });
  }

  return (
    <div className="min-h-screen bg-cream bg-grain">
      {/* ───────────── HERO ───────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream to-cream-200/50" />
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-maroon/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-cream/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-600 backdrop-blur">
            <Star className="h-3 w-3 fill-gold" />
            Est. {BRAND.founded} · {BRAND.city}
          </span>

          <Logo size="xl" className="text-[80px] leading-none sm:text-[96px]" />

          <p className="mt-6 font-display text-lg italic text-ink-muted sm:text-2xl">
            Hand-crafted Desserts &amp; Ice Cream · Chennai
          </p>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => scrollTo(menuRef)}
              variant="outline"
              className="h-12 border-maroon bg-transparent px-8 text-base text-maroon hover:bg-maroon hover:text-cream"
            >
              Our Menu
            </Button>
            <Button
              onClick={() => scrollTo(rewardsRef)}
              className="h-12 bg-maroon px-8 text-base hover:bg-maroon-700"
            >
              My Rewards
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <button
          onClick={() => scrollTo(menuRef)}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-ink-muted transition-colors hover:text-maroon"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-7 w-7 animate-bounce" />
        </button>
      </section>

      {/* ───────────── SIGNATURE DESSERTS ───────────── */}
      <section ref={menuRef} className="scroll-mt-4 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              The Collection
            </p>
            <h2 className="font-display text-4xl text-maroon sm:text-5xl">
              Signature Desserts
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-muted">
              Each creation is a masterpiece, crafted with passion and the finest
              ingredients
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MENU.map((item) => (
              <article
                key={item.name}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-gold/15 to-maroon/10 text-6xl transition-transform duration-500 group-hover:scale-[1.03]">
                  <span className="drop-shadow-sm">{item.emoji}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-bold text-maroon">
                    {item.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                    {item.blurb}
                  </p>
                  <p className="mt-4 font-display text-lg font-bold text-gold-600">
                    ₹{item.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── OUR STORY ───────────── */}
      <section
        ref={storyRef}
        className="scroll-mt-4 bg-[#F0E8DF] px-6 py-24"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Our Story
            </p>
            <h2 className="font-display text-4xl text-maroon sm:text-5xl">
              A Taste of Tempt
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink">{STORY_BODY}</p>
            <p className="mt-6 text-sm text-ink-muted">
              Founded by {BRAND.founders}
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-maroon via-maroon-700 to-gold-600 shadow-lg">
            <div className="absolute inset-0 bg-grain-gold opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <p className="text-center font-display text-3xl italic leading-snug text-cream sm:text-4xl">
                {STORY_QUOTE}
              </p>
            </div>
            <div className="absolute bottom-6 right-6">
              <Logo size="sm" tone="cream" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── WHY TEMPT ───────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl text-maroon sm:text-5xl">
              Why Tempt.
            </h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {WHY_TEMPT.map((f) => (
              <div key={f.title} className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream-200 text-3xl">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-maroon">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── TEMPT. REWARDS ───────────── */}
      <section
        ref={rewardsRef}
        className="scroll-mt-4 bg-[#F0E8DF] px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Loyalty
            </p>
            <h2 className="font-display text-4xl text-maroon sm:text-5xl">
              Tempt. Rewards
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-ink-muted">
              Earn points every visit. Redeem for discounts. It&apos;s that sweet.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* LEFT — login or dashboard */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              {!loggedIn ? (
                <div>
                  <h3 className="font-display text-2xl text-maroon">
                    Enter your phone number
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    to view your points
                  </p>
                  <div className="mt-6 space-y-4">
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your registered phone number"
                        className="h-12 border-maroon/20 bg-cream pl-11 text-base"
                        inputMode="tel"
                      />
                    </div>
                    <Button
                      onClick={handleLogin}
                      className="h-12 w-full bg-maroon text-base hover:bg-maroon-700"
                    >
                      View My Rewards
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-center text-xs text-ink-muted">
                      No app download needed. Just your number.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl text-maroon">
                      Welcome back, Priya! 🍫
                    </h3>
                    <span className="text-xs text-ink-muted">{CUSTOMER.phone}</span>
                  </div>

                  <div className="mt-6 rounded-xl bg-gradient-to-br from-maroon to-maroon-700 p-6 text-cream">
                    <p className="text-xs uppercase tracking-wide text-cream/70">
                      Your balance
                    </p>
                    <p className="mt-1 font-display text-5xl font-semibold text-gold">
                      {CUSTOMER.totalPoints.toLocaleString('en-IN')}
                      <span className="ml-2 text-xl text-cream/60">pts</span>
                    </p>
                    <p className="mt-2 text-cream/80">
                      Worth{' '}
                      <span className="font-semibold text-gold">
                        ₹{CUSTOMER.pointsValue} off
                      </span>{' '}
                      your next visit
                    </p>
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50/80 px-4 py-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">
                        {CUSTOMER.expiringPoints} pts
                      </span>{' '}
                      expire on{' '}
                      <span className="font-semibold">
                        {CUSTOMER.expiryDate}
                      </span>
                      . Redeem before they melt away.
                    </p>
                  </div>

                  {/* Mini transaction table */}
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Recent visits
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-maroon/10 hover:bg-transparent">
                          <TableHead className="text-ink-muted">Date</TableHead>
                          <TableHead className="text-ink-muted">
                            Description
                          </TableHead>
                          <TableHead className="text-right text-ink-muted">
                            Points
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {POINTS_HISTORY.map((row, i) => {
                          const positive = row.points > 0;
                          return (
                            <TableRow
                              key={i}
                              className="border-maroon/5 last:border-0"
                            >
                              <TableCell className="font-medium text-ink">
                                {row.date}
                              </TableCell>
                              <TableCell className="text-ink-muted">
                                {row.description}
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 font-semibold',
                                    positive
                                      ? 'text-green-700'
                                      : 'text-amber-700'
                                  )}
                                >
                                  {positive ? (
                                    <TrendingUp className="h-3.5 w-3.5" />
                                  ) : (
                                    <TrendingDown className="h-3.5 w-3.5" />
                                  )}
                                  {positive ? '+' : ''}
                                  {row.points}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <Button
                    onClick={() => setShowRedeem((s) => !s)}
                    className="mt-6 w-full bg-maroon hover:bg-maroon-700"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Redeem Points
                  </Button>

                  {showRedeem && (
                    <div className="mt-4 space-y-4 rounded-xl border border-maroon/15 bg-cream-50 p-5 animate-scale-in">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
                          Redemption code from staff
                        </label>
                        <Input
                          value={redeemCode}
                          onChange={(e) =>
                            setRedeemCode(
                              e.target.value.toUpperCase().slice(0, 6)
                            )
                          }
                          placeholder="e.g. TM4X9A"
                          className="border-maroon/20 bg-cream font-mono tracking-widest"
                        />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                            Points to redeem
                          </label>
                          <span className="font-display text-lg font-semibold text-maroon">
                            {redeemPts} pts
                          </span>
                        </div>
                        <Slider
                          value={[redeemPts]}
                          onValueChange={(v) => setRedeemPts(v[0])}
                          min={100}
                          max={CUSTOMER.totalPoints}
                          step={10}
                          className="[&_[data-range]]:bg-maroon [&_[data-track]]:bg-maroon/15"
                        />
                        <div className="mt-1 flex justify-between text-[11px] text-ink-muted">
                          <span>Min 100</span>
                          <span>
                            Max{' '}
                            {CUSTOMER.totalPoints.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-gold/30 bg-gold-50/60 px-4 py-2.5">
                        <span className="text-sm text-ink">You get</span>
                        <span className="font-display text-lg font-semibold text-maroon">
                          ₹{redeemValue} off
                        </span>
                      </div>
                      <Button
                        onClick={handleRedeem}
                        className="w-full bg-maroon hover:bg-maroon-700"
                      >
                        Confirm Redemption
                      </Button>
                      {redeemed && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 animate-scale-in">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-cream">
                            ✓
                          </span>
                          {redeemPts} pts = ₹{redeemValue} off. Show this at the
                          counter.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — how it works */}
            <div className="flex flex-col justify-center">
              <h3 className="font-display text-2xl text-maroon">How it works</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Three sweet steps to earning rewards.
              </p>
              <ol className="mt-8 space-y-7">
                {REWARD_STEPS.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-maroon font-display text-lg font-semibold text-cream">
                      {i + 1}
                    </span>
                    <div className="pt-1.5">
                      <p className="text-base text-ink">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10 rounded-xl border border-gold/30 bg-gold-50/50 px-5 py-4">
                <p className="text-sm text-ink">
                  <span className="font-semibold text-maroon">
                    Already a member?
                  </span>{' '}
                  Just share your phone number at the counter next time you visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── OUR BRANCHES ───────────── */}
      <section ref={branchesRef} className="scroll-mt-4 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Find Us
            </p>
            <h2 className="font-display text-4xl text-maroon sm:text-5xl">
              Our Branches
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {BRANCHES.map((b) => (
              <div
                key={b.name}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-1.5 bg-maroon" />
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold-600" />
                    <h3 className="font-display text-xl font-bold text-maroon">
                      {b.name}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {b.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="bg-[#3A0F0F] text-cream">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div>
              <Logo size="lg" tone="cream" />
              <p className="mt-3 max-w-xs text-sm text-cream/60">
                Hand-crafted desserts &amp; ice cream. Made with love in Chennai.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {[
                ['Menu', menuRef],
                ['Our Story', storyRef],
                ['Branches', branchesRef],
              ].map(([label, ref]) => (
                <button
                  key={label as string}
                  onClick={() => scrollTo(ref as React.RefObject<HTMLElement>)}
                  className="text-cream/70 transition-colors hover:text-gold"
                >
                  {label as string}
                </button>
              ))}
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cream/70 transition-colors hover:text-gold"
              >
                Instagram
              </a>
            </nav>

            <div className="text-sm text-cream/70">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gold" />
                {BRAND.phone}
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gold" />
                {BRAND.email}
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Instagram className="h-3.5 w-3.5 text-gold" />
                {BRAND.instagram}
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-cream/10 pt-6 text-center text-xs text-cream/50">
            © 2025 Tempt. All rights reserved · GSTIN: {BRAND.gstin}
          </div>
        </div>
      </footer>
    </div>
  );
}
