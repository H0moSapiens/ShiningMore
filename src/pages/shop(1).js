import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { useAuth, useCart } from './_app';

const CATEGORIES = ['All', 'Oriental', 'Floral', 'Fresh', 'Woody', 'Musk'];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (router.query.category) setActiveCategory(router.query.category);
  }, [router.query.category]);

  useEffect(() => {
    setLoading(true);
    const url = activeCategory === 'All' ? '/api/products' : `/api/products?category=${activeCategory}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false); });
  }, [activeCategory]);

  const handleAddToCart = (product) => {
    if (!user) { router.push('/account'); return; }
    if (user.role === 'pending') { showToast('Your account is pending approval.', 'warn'); return; }
    addToCart(product);
    showToast(`${product.name} added to cart`, 'success');
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatPrice = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p);

  return (
    <>
      <Head><title>Collection — SCENTLUX</title></Head>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          background: toast.type === 'success' ? 'rgba(201,168,76,0.15)' : 'rgba(180,50,50,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(201,168,76,0.5)' : 'rgba(180,50,50,0.5)'}`,
          color: toast.type === 'success' ? '#C9A84C' : '#e88',
          padding: '1rem 1.5rem',
          backdropFilter: 'blur(10px)',
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.85rem',
          animation: 'fadeIn 0.3s ease',
          maxWidth: 300,
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ paddingTop: 70, minHeight: '100vh', background: '#0A0A0A' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '3rem 2rem 2rem' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Explore
            </p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', fontWeight: 300, color: '#F5F0E8' }}>
              The Collection
            </h1>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '1.25rem 2rem' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '0.5rem 1.25rem',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? '#C9A84C' : 'rgba(201,168,76,0.2)',
                  background: activeCategory === cat ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: activeCategory === cat ? '#C9A84C' : 'rgba(245,240,232,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 2rem' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ background: '#1A1A1A', height: 420, border: '1px solid rgba(201,168,76,0.1)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'rgba(245,240,232,0.3)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
              No fragrances found
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} formatPrice={formatPrice} delay={i * 0.05} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, onAddToCart, formatPrice, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="product-card animate-fade-in"
      style={{ animationDelay: `${delay}s`, opacity: 0, cursor: 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div style={{
        height: 220,
        background: 'linear-gradient(145deg, #1A1A1A, #222)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
      }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ fontSize: '4rem' }}>🌸</div>
        )}
        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(10,10,10,0.8)',
          border: '1px solid rgba(201,168,76,0.3)',
          padding: '0.25rem 0.6rem',
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          backdropFilter: 'blur(8px)',
        }}>{product.category}</div>
        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase' }}>Sold Out</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          {product.brand}
        </div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#F5F0E8', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          {product.name}
        </div>
        {product.size_ml && (
          <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: 'rgba(245,240,232,0.3)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
            {product.size_ml}ml
          </div>
        )}
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(245,240,232,0.45)', lineHeight: 1.6, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: '#C9A84C' }}>
            {formatPrice(product.price)}
          </div>
          <button
            className="btn-gold shine-hover"
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.65rem' }}
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
          </button>
        </div>
        <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', color: 'rgba(245,240,232,0.25)', marginTop: '0.75rem', letterSpacing: '0.1em' }}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </div>
      </div>
    </div>
  );
}
