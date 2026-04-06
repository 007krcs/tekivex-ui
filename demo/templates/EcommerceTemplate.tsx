import { useState, useEffect } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxButton, TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter,
  TkxBadge, TkxInput, TkxProgress, TkxToggle, TkxAlert, TkxTabs,
  TkxTabList, TkxTab, TkxTabPanels, TkxTabPanel, TkxAvatar, TkxTable,
  TkxDivider, TkxSkeleton, TkxTooltip, TkxModal, tkx, cx
} from '@tekivex/ui';

interface Props { theme: ThemeTokens }

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  stock: 'in' | 'low' | 'out';
  emoji: string;
  bg: string;
  description: string;
  colors: string[];
  sizes: string[];
  isFlashDeal?: boolean;
  discountPct?: number;
}

const PRODUCTS: Product[] = [
  {
    id: 1, name: 'ProSound Wireless Headphones', brand: 'SonicWave', category: 'electronics',
    price: 89.99, originalPrice: 149.99, rating: 4.8, reviews: 2341,
    stock: 'in', emoji: '🎧', bg: '#6366f1',
    description: '40-hour battery life with active noise cancellation. Foldable design, premium 40mm drivers, and multipoint Bluetooth for seamless device switching.',
    colors: ['Black', 'White', 'Midnight Blue'], sizes: [],
    isFlashDeal: true, discountPct: 40,
  },
  {
    id: 2, name: 'UltraView 4K Monitor 27"', brand: 'ViewCraft', category: 'electronics',
    price: 399.00, rating: 4.6, reviews: 876,
    stock: 'in', emoji: '🖥️', bg: '#0ea5e9',
    description: 'IPS panel, 144Hz refresh rate, 1ms response time. Perfect for creative work and gaming. USB-C 90W charging included.',
    colors: ['Space Gray', 'Matte Black'], sizes: [],
  },
  {
    id: 3, name: 'ErgoFlex Office Chair', brand: 'ComfortPro', category: 'home',
    price: 299.00, originalPrice: 379.00, rating: 4.7, reviews: 1102,
    stock: 'low', emoji: '🪑', bg: '#10b981',
    description: 'Lumbar support, adjustable armrests, and breathable mesh back. Designed for 8+ hour comfort with tilt tension control.',
    colors: ['Black', 'Gray'], sizes: [],
    isFlashDeal: true, discountPct: 21,
  },
  {
    id: 4, name: 'Running Pulse Pro Sneakers', brand: 'TrailMax', category: 'sports',
    price: 124.95, rating: 4.5, reviews: 3208,
    stock: 'in', emoji: '👟', bg: '#f59e0b',
    description: 'Carbon fiber plate, responsive foam midsole, and engineered mesh upper. Built for speed over long distances.',
    colors: ['Red', 'Blue', 'Black'], sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
  },
  {
    id: 5, name: 'TypeMaster Mechanical Keyboard', brand: 'KeyLab', category: 'electronics',
    price: 169.00, originalPrice: 199.00, rating: 4.9, reviews: 4572,
    stock: 'in', emoji: '⌨️', bg: '#8b5cf6',
    description: 'Hot-swap switches, per-key RGB, aluminum frame. Available with Cherry MX Red, Blue, or Brown switches.',
    colors: ['Silver', 'Space Gray'], sizes: [],
    isFlashDeal: true, discountPct: 15,
  },
  {
    id: 6, name: 'SmartFit Fitness Tracker', brand: 'PulseBand', category: 'sports',
    price: 59.99, rating: 4.3, reviews: 892,
    stock: 'out', emoji: '⌚', bg: '#ef4444',
    description: 'Heart rate, SpO2, sleep tracking, and 7-day battery. Water-resistant to 50m with GPS and 20+ workout modes.',
    colors: ['Black', 'Rose Gold', 'Navy'], sizes: ['S/M', 'L/XL'],
  },
];

const REVIEWS = [
  {
    name: 'Marcus Johnson', avatar: 'MJ', color: 'primary' as const,
    date: 'March 14, 2026', rating: 5,
    text: 'Absolutely blown away by the build quality. Arrived in two days, packaging was immaculate, and the product exceeded every expectation. Will be ordering again.',
    helpful: 47,
  },
  {
    name: 'Priya Sharma', avatar: 'PS', color: 'success' as const,
    date: 'March 3, 2026', rating: 4,
    text: 'Great selection and fast shipping. One item arrived slightly dented but customer service resolved it within the hour. Really impressive support team.',
    helpful: 31,
  },
  {
    name: 'Carlos Rivera', avatar: 'CR', color: 'warning' as const,
    date: 'February 19, 2026', rating: 5,
    text: 'The flash deal savings were real — I saved $80 on the headphones. Quality matches the description exactly. Highly recommend this store.',
    helpful: 62,
  },
];

const RATING_DIST = [
  { stars: 5, pct: 68 },
  { stars: 4, pct: 19 },
  { stars: 3, pct: 8 },
  { stars: 2, pct: 3 },
  { stars: 1, pct: 2 },
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i < Math.floor(rating) ? '#f59e0b' : i < rating ? '#f59e0b' : '#d1d5db'}
          style={{ opacity: i < rating && i >= Math.floor(rating) ? 0.5 : 1 }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function CartIcon({ count }: { count: number }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {count > 0 && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          background: '#ef4444', color: '#fff',
          borderRadius: '9999px', width: 16, height: 16,
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{count}</span>
      )}
    </div>
  );
}

function StockBadge({ stock }: { stock: Product['stock'] }) {
  if (stock === 'in') return <TkxBadge color="success" variant="subtle" size="sm">In Stock</TkxBadge>;
  if (stock === 'low') return <TkxBadge color="warning" variant="subtle" size="sm">Low Stock</TkxBadge>;
  return <TkxBadge color="danger" variant="subtle" size="sm">Out of Stock</TkxBadge>;
}

export function EcommerceTemplate({ theme }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState<{ product: Product; qty: number }[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalColor, setModalColor] = useState('');
  const [modalSize, setModalSize] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [countdown, setCountdown] = useState({ h: 3, m: 47, s: 22 });
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 3; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const shipping = cartSubtotal >= 50 ? 0 : 5.99;

  function addToCart(product: Product, qty = 1) {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
    setShowCart(true);
  }

  function removeFromCart(id: number) {
    setCartItems(prev => prev.filter(i => i.product.id !== id));
  }

  function openModal(product: Product) {
    setModalProduct(product);
    setModalQty(1);
    setModalColor(product.colors[0] || '');
    setModalSize(product.sizes[0] || '');
  }

  const filtered = PRODUCTS
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => !inStockOnly || p.stock !== 'out')
    .filter(p => !minPrice || p.price >= Number(minPrice))
    .filter(p => !maxPrice || p.price <= Number(maxPrice))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.id - a.id;
    });

  const flashDeals = PRODUCTS.filter(p => p.isFlashDeal);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{ background: theme.background, color: theme.text, fontFamily: 'inherit', minHeight: '100vh' }}>

      {/* ─── HEADER ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: theme.surface + 'f4',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.border}`,
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', height: 64, gap: 16,
        }}>
          <div style={{ marginRight: 'auto' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: theme.text, letterSpacing: '-0.03em' }}>
              Nex<span style={{ color: theme.primary }}>Store</span>
            </div>
            <div style={{ fontSize: 10, color: theme.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: -2 }}>
              Premium Essentials
            </div>
          </div>

          <div style={{ flex: '0 1 340px' }}>
            <TkxInput
              placeholder="Search products, brands, categories…"
              size="sm"
              startAddon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              }
            />
          </div>

          <TkxTooltip content={`${cartCount} item${cartCount !== 1 ? 's' : ''} in cart`}>
            <TkxButton variant="ghost" size="sm" onClick={() => setShowCart(!showCart)} style={{ position: 'relative' }}>
              <CartIcon count={cartCount} />
            </TkxButton>
          </TkxTooltip>

          <TkxButton variant="outline" size="sm">Sign In</TkxButton>
          <TkxButton color="primary" size="sm">Sign Up</TkxButton>
        </div>
      </header>

      {/* ─── PROMO ALERT ─── */}
      <div style={{ maxWidth: 1100, margin: '16px auto 0', padding: '0 24px' }}>
        <TkxAlert color="info" style={{ borderRadius: 10 }}>
          🎉 Free shipping on orders over $50 — Use code <strong>FREESHIP</strong> at checkout
        </TkxAlert>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* ─── CATEGORY TABS ─── */}
        <div style={{ marginTop: 28 }}>
          <TkxTabs value={activeCategory} onChange={setActiveCategory}>
            <TkxTabList>
              {[
                { value: 'all', label: 'All Products' },
                { value: 'electronics', label: '💻 Electronics' },
                { value: 'clothing', label: '👕 Clothing' },
                { value: 'home', label: '🏠 Home & Garden' },
                { value: 'sports', label: '🏃 Sports' },
                { value: 'books', label: '📚 Books' },
              ].map(tab => (
                <TkxTab key={tab.value} value={tab.value}>{tab.label}</TkxTab>
              ))}
            </TkxTabList>
          </TkxTabs>
        </div>

        {/* ─── FILTERS ROW ─── */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: filtersOpen ? 16 : 0 }}>
            <TkxButton
              variant={filtersOpen ? 'solid' : 'outline'}
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {filtersOpen ? '✕' : '⚙'} Filters
            </TkxButton>
            {!filtersOpen && (
              <span style={{ fontSize: 13, color: theme.textMuted }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>

          {filtersOpen && (
            <TkxCard style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <TkxInput label="Min Price ($)" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} size="sm" style={{ width: 110 }} />
                  <span style={{ fontSize: 18, color: theme.textMuted, paddingBottom: 6 }}>—</span>
                  <TkxInput label="Max Price ($)" placeholder="999" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} size="sm" style={{ width: 110 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TkxToggle
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    label="In Stock Only"
                    size="sm"
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, alignSelf: 'center' }}>Sort:</span>
                  {[
                    { key: 'newest', label: 'Newest' },
                    { key: 'price-asc', label: 'Price ↑' },
                    { key: 'price-desc', label: 'Price ↓' },
                    { key: 'rating', label: 'Top Rated' },
                  ].map(opt => (
                    <TkxButton
                      key={opt.key}
                      size="sm"
                      variant={sortBy === opt.key ? 'solid' : 'outline'}
                      color={sortBy === opt.key ? 'primary' : undefined}
                      onClick={() => setSortBy(opt.key as typeof sortBy)}
                    >
                      {opt.label}
                    </TkxButton>
                  ))}
                </div>
              </div>
            </TkxCard>
          )}
        </div>

        {/* ─── MAIN LAYOUT (products + cart sidebar) ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: showCart && cartCount > 0 ? '1fr 320px' : '1fr', gap: 28, marginTop: 28 }}>

          {/* Product Grid */}
          <div>
            {filtered.length === 0 ? (
              <TkxAlert color="info" title="No products found">
                Try adjusting your filters or switching category.
              </TkxAlert>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {filtered.map(product => (
                  <TkxCard key={product.id} isHoverable style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Image area */}
                    <div style={{
                      height: 180, background: product.bg + '22',
                      borderRadius: '10px 10px 0 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 72, position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {product.isFlashDeal && (
                        <div style={{
                          position: 'absolute', top: 12, left: 12,
                          background: '#ef4444', color: '#fff',
                          borderRadius: 6, padding: '3px 8px',
                          fontSize: 11, fontWeight: 800, letterSpacing: '0.04em',
                        }}>
                          SALE -{product.discountPct}%
                        </div>
                      )}
                      {product.emoji}
                    </div>

                    <TkxCardBody style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <TkxBadge variant="outline" size="sm">{product.brand}</TkxBadge>
                        <StockBadge stock={product.stock} />
                      </div>

                      <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, lineHeight: 1.3 }}>
                        {product.name}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarRating rating={product.rating} />
                        <span style={{ fontSize: 12, color: theme.textMuted }}>({product.reviews.toLocaleString()})</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span style={{ fontSize: 14, color: theme.textMuted, textDecoration: 'line-through' }}>
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                        {product.originalPrice && (
                          <TkxBadge color="success" variant="subtle" size="sm">
                            Save ${(product.originalPrice - product.price).toFixed(2)}
                          </TkxBadge>
                        )}
                      </div>
                    </TkxCardBody>

                    <TkxCardFooter>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <TkxButton
                          color="primary"
                          size="sm"
                          style={{ flex: 1 }}
                          disabled={product.stock === 'out'}
                          onClick={() => addToCart(product)}
                        >
                          {product.stock === 'out' ? 'Sold Out' : '+ Add to Cart'}
                        </TkxButton>
                        <TkxButton
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(product)}
                        >
                          Quick View
                        </TkxButton>
                      </div>
                    </TkxCardFooter>
                  </TkxCard>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {showCart && cartCount > 0 && (
            <div>
              <TkxCard style={{ position: 'sticky', top: 80 }}>
                <TkxCardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Your Cart ({cartCount})</span>
                    <TkxButton variant="ghost" size="sm" onClick={() => setShowCart(false)}>✕</TkxButton>
                  </div>
                </TkxCardHeader>
                <TkxCardBody style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto' }}>
                  {cartItems.map(({ product, qty }) => (
                    <div key={product.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, background: product.bg + '22',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, flexShrink: 0,
                      }}>
                        {product.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: 12, color: theme.textMuted }}>
                          {qty} × ${product.price.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 2, textAlign: 'right' }}>
                          ${(product.price * qty).toFixed(2)}
                        </div>
                        <TkxButton variant="ghost" size="sm" onClick={() => removeFromCart(product.id)} style={{ padding: '0 4px', color: theme.textMuted }}>
                          remove
                        </TkxButton>
                      </div>
                    </div>
                  ))}
                </TkxCardBody>
                <TkxDivider />
                <TkxCardBody style={{ paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: 'Subtotal', value: `$${cartSubtotal.toFixed(2)}` },
                      { label: 'Shipping', value: shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}` },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.textMuted }}>
                        <span>{row.label}</span>
                        <span style={{ color: row.value === 'FREE' ? '#10b981' : undefined, fontWeight: row.value === 'FREE' ? 700 : undefined }}>{row.value}</span>
                      </div>
                    ))}
                    <TkxDivider />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: theme.text }}>
                      <span>Total</span>
                      <span>${(cartSubtotal + shipping).toFixed(2)}</span>
                    </div>
                  </div>
                  {cartSubtotal < 50 && (
                    <TkxAlert color="info" style={{ marginBottom: 12, fontSize: 12 }}>
                      Add ${(50 - cartSubtotal).toFixed(2)} more for free shipping!
                    </TkxAlert>
                  )}
                  <TkxButton color="primary" style={{ width: '100%' }}>
                    Checkout →
                  </TkxButton>
                </TkxCardBody>
              </TkxCard>
            </div>
          )}
        </div>

        {/* ─── FLASH DEALS ─── */}
        <section style={{ marginTop: 60, paddingTop: 48, borderTop: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: theme.text, letterSpacing: '-0.03em', margin: 0 }}>
                  ⚡ Flash Deals
                </h2>
                <TkxBadge color="danger" variant="subtle">Limited Time</TkxBadge>
              </div>
              <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 4 }}>Ending soon — don't miss out</p>
            </div>
            <div style={{
              display: 'flex', gap: 6, alignItems: 'center',
              background: '#ef444418', border: '1px solid #ef444435',
              borderRadius: 10, padding: '8px 16px',
            }}>
              <span style={{ fontSize: 12, color: theme.textMuted, marginRight: 4 }}>Ends in</span>
              {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((unit, i, arr) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    background: '#ef4444', color: '#fff',
                    borderRadius: 6, padding: '4px 8px',
                    fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                    minWidth: 36, textAlign: 'center',
                  }}>
                    {unit}
                  </span>
                  {i < arr.length - 1 && <span style={{ color: '#ef4444', fontWeight: 800 }}>:</span>}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {flashDeals.map(product => (
              <TkxCard key={product.id} isHoverable style={{ display: 'flex', flexDirection: 'column', border: `1.5px solid #ef444440` }}>
                <div style={{
                  height: 150, background: product.bg + '1a',
                  borderRadius: '10px 10px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 60, position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: '#ef4444', color: '#fff',
                    borderRadius: 6, padding: '3px 10px',
                    fontSize: 13, fontWeight: 800,
                  }}>
                    -{product.discountPct}%
                  </div>
                  {product.emoji}
                </div>
                <TkxCardBody style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 8 }}>{product.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span style={{ fontSize: 14, color: theme.textMuted, textDecoration: 'line-through' }}>
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <TkxProgress value={60} color="danger" size="sm" />
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>Selling fast — limited units left</div>
                </TkxCardBody>
                <TkxCardFooter>
                  <TkxButton color="danger" size="sm" style={{ width: '100%' }} onClick={() => addToCart(product)}>
                    Grab Deal
                  </TkxButton>
                </TkxCardFooter>
              </TkxCard>
            ))}
          </div>
        </section>

        {/* ─── REVIEWS ─── */}
        <section style={{ marginTop: 60, paddingTop: 48, borderTop: `1px solid ${theme.border}` }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: theme.text, letterSpacing: '-0.03em', marginBottom: 32 }}>
            Customer Reviews
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'start', flexWrap: 'wrap' }}>
            <TkxCard>
              <TkxCardBody style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: theme.text, letterSpacing: '-0.04em', lineHeight: 1 }}>4.6</div>
                <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12 }}>out of 5</div>
                <StarRating rating={4.6} size={20} />
                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 6 }}>Based on 9,991 reviews</div>
                <TkxDivider />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {RATING_DIST.map(row => (
                    <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: theme.textMuted, width: 24, textAlign: 'right', flexShrink: 0 }}>{row.stars}★</span>
                      <TkxProgress value={row.pct} color="warning" size="sm" style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: theme.textMuted, width: 28, flexShrink: 0 }}>{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </TkxCardBody>
            </TkxCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {REVIEWS.map((review, i) => (
                <TkxCard key={i}>
                  <TkxCardBody>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TkxAvatar name={review.name} color={review.color} size="sm" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{review.name}</div>
                          <div style={{ fontSize: 12, color: theme.textMuted }}>{review.date}</div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.65, marginBottom: 12 }}>{review.text}</p>
                    <div style={{ fontSize: 12, color: theme.textMuted }}>
                      <span>Helpful? </span>
                      <TkxButton variant="ghost" size="sm" style={{ fontSize: 12, padding: '0 6px' }}>👍 Yes ({review.helpful})</TkxButton>
                      <TkxButton variant="ghost" size="sm" style={{ fontSize: 12, padding: '0 6px' }}>👎 No</TkxButton>
                    </div>
                  </TkxCardBody>
                </TkxCard>
              ))}
            </div>
          </div>
        </section>

        {/* ─── NEWSLETTER ─── */}
        <section style={{ marginTop: 60, marginBottom: 60 }}>
          <TkxCard style={{
            background: `linear-gradient(135deg, ${theme.primary}18, ${theme.primary}06)`,
            border: `1.5px solid ${theme.primary}30`,
            textAlign: 'center',
            padding: '48px 24px',
          }}>
            <TkxCardBody>
              <TkxBadge color="primary" variant="subtle" style={{ marginBottom: 16 }}>Newsletter</TkxBadge>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: theme.text, letterSpacing: '-0.03em', marginBottom: 10 }}>
                Get 10% Off Your First Order
              </h2>
              <p style={{ fontSize: 15, color: theme.textMuted, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
                Subscribe for exclusive deals, early access to flash sales, and curated picks delivered weekly.
              </p>

              {newsletterSubmitted ? (
                <TkxAlert color="success" title="You're in!" style={{ maxWidth: 440, margin: '0 auto' }}>
                  Check your inbox — your 10% off code is on its way.
                </TkxAlert>
              ) : (
                <div style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap' }}>
                  <TkxInput
                    placeholder="your@email.com"
                    type="email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <TkxButton
                    color="primary"
                    onClick={() => setNewsletterSubmitted(true)}
                    disabled={!newsletterEmail.includes('@')}
                  >
                    Subscribe
                  </TkxButton>
                </div>
              )}
              <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 12 }}>
                No spam. Unsubscribe any time.
              </p>
            </TkxCardBody>
          </TkxCard>
        </section>

      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ borderTop: `1px solid ${theme.border}`, padding: '20px 24px', textAlign: 'center', background: theme.surface }}>
        <span style={{ fontSize: 13, color: theme.textMuted }}>
          © 2026 NexStore · Free shipping over $50 · 30-day returns · Secure checkout
        </span>
      </div>

      {/* ─── PRODUCT QUICK VIEW MODAL ─── */}
      {modalProduct && (
        <TkxModal
          isOpen={modalProduct !== null}
          onClose={() => setModalProduct(null)}
          title={modalProduct.name}
          size="lg"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
            <div style={{
              height: 200, background: modalProduct.bg + '22',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 80,
            }}>
              {modalProduct.emoji}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <TkxBadge variant="outline" size="sm">{modalProduct.brand}</TkxBadge>
                  <StockBadge stock={modalProduct.stock} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <StarRating rating={modalProduct.rating} />
                  <span style={{ fontSize: 12, color: theme.textMuted }}>({modalProduct.reviews.toLocaleString()} reviews)</span>
                </div>
                <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.65, margin: 0 }}>
                  {modalProduct.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: theme.text }}>${modalProduct.price.toFixed(2)}</span>
                {modalProduct.originalPrice && (
                  <span style={{ fontSize: 16, color: theme.textMuted, textDecoration: 'line-through' }}>
                    ${modalProduct.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {modalProduct.colors.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Color: {modalColor}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {modalProduct.colors.map(c => (
                      <TkxButton
                        key={c}
                        size="sm"
                        variant={modalColor === c ? 'solid' : 'outline'}
                        color={modalColor === c ? 'primary' : undefined}
                        onClick={() => setModalColor(c)}
                      >
                        {c}
                      </TkxButton>
                    ))}
                  </div>
                </div>
              )}

              {modalProduct.sizes.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Size: {modalSize}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {modalProduct.sizes.map(s => (
                      <TkxButton
                        key={s}
                        size="sm"
                        variant={modalSize === s ? 'solid' : 'outline'}
                        color={modalSize === s ? 'primary' : undefined}
                        onClick={() => setModalSize(s)}
                      >
                        {s}
                      </TkxButton>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Quantity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <TkxButton
                    variant="outline"
                    size="sm"
                    onClick={() => setModalQty(q => Math.max(1, q - 1))}
                    style={{ width: 36, padding: 0 }}
                  >
                    −
                  </TkxButton>
                  <span style={{ fontSize: 16, fontWeight: 700, width: 28, textAlign: 'center' }}>{modalQty}</span>
                  <TkxButton
                    variant="outline"
                    size="sm"
                    onClick={() => setModalQty(q => q + 1)}
                    style={{ width: 36, padding: 0 }}
                  >
                    +
                  </TkxButton>
                  <span style={{ fontSize: 13, color: theme.textMuted, marginLeft: 8 }}>
                    = ${(modalProduct.price * modalQty).toFixed(2)}
                  </span>
                </div>
              </div>

              <TkxButton
                color="primary"
                size="lg"
                disabled={modalProduct.stock === 'out'}
                onClick={() => {
                  addToCart(modalProduct, modalQty);
                  setModalProduct(null);
                }}
                style={{ width: '100%' }}
              >
                {modalProduct.stock === 'out' ? 'Out of Stock' : `Add ${modalQty} to Cart — $${(modalProduct.price * modalQty).toFixed(2)}`}
              </TkxButton>
            </div>
          </div>
        </TkxModal>
      )}
    </div>
  );
}
