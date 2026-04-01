import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { useAuth, useCart } from './_app';

export default function Cart() {
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [step, setStep] = useState('cart'); // cart | qris | done
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const formatPrice = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p);

  const handleCheckout = async () => {
    if (!user) { router.push('/account'); return; }
    setStep('qris');
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const items = cart.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price }));
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        clearCart();
        setStep('done');
      } else {
        alert('Transaction failed. Please try again.');
      }
    } catch (err) {
      alert('Error processing payment.');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <>
        <Head><title>Cart — SCENTLUX</title></Head>
        <Navbar />
        <div style={{ paddingTop: 70, minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#F5F0E8' }}>Sign in to view your cart</div>
          <button className="btn-gold" onClick={() => router.push('/account')}>Sign In</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Cart — SCENTLUX</title></Head>
      <Navbar />
      <div style={{ paddingTop: 70, minHeight: '100vh', background: '#0A0A0A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>

          {/* Step: Cart */}
          {step === 'cart' && (
            <>
              <div style={{ marginBottom: '2.5rem' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Selection</p>
                <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, color: '#F5F0E8' }}>Shopping Cart</h1>
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', border: '1px solid rgba(201,168,76,0.1)' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'rgba(245,240,232,0.3)', marginBottom: '1.5rem' }}>Your cart is empty</div>
                  <button className="btn-gold" onClick={() => router.push('/shop')}>Explore Collection</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(201,168,76,0.1)' }}>
                    {/* Header */}
                    <div style={{ background: '#0A0A0A', display: 'grid', gridTemplateColumns: '1fr 120px 120px 60px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                      {['Product', 'Price', 'Quantity', ''].map(h => (
                        <div key={h} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase' }}>{h}</div>
                      ))}
                    </div>
                    {cart.map(item => (
                      <CartItem key={item.id} item={item} onRemove={removeFromCart} onUpdateQty={updateQuantity} formatPrice={formatPrice} />
                    ))}
                  </div>

                  {/* Summary */}
                  <div style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', position: 'sticky', top: 90 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#F5F0E8', marginBottom: '1.5rem' }}>Order Summary</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(245,240,232,0.6)' }}>
                          <span>{item.name} ×{item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(245,240,232,0.6)', textTransform: 'uppercase' }}>Total</span>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#C9A84C' }}>{formatPrice(total)}</span>
                      </div>
                    </div>
                    <button className="btn-gold shine-hover" style={{ width: '100%', padding: '1rem', fontSize: '0.75rem' }} onClick={handleCheckout}>
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step: QRIS */}
          {step === 'qris' && (
            <div className="animate-fade-in" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Payment</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: '#F5F0E8', marginBottom: '0.5rem' }}>Scan to Pay</h2>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'rgba(245,240,232,0.4)', marginBottom: '2.5rem' }}>
                Scan the QRIS code below using your mobile banking or e-wallet app
              </p>

              {/* QRIS Box */}
              <div style={{
                background: '#fff',
                padding: '1.5rem',
                display: 'inline-block',
                border: '1px solid rgba(201,168,76,0.3)',
                marginBottom: '2rem',
                boxShadow: '0 0 60px rgba(201,168,76,0.1)',
              }}>
                {/* QR Code SVG Simulation */}
                <div style={{ width: 220, height: 220, position: 'relative' }}>
                  <svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
                    {/* QR background */}
                    <rect width="220" height="220" fill="white"/>
                    {/* Corner squares */}
                    <rect x="10" y="10" width="60" height="60" fill="none" stroke="#0A0A0A" strokeWidth="5"/>
                    <rect x="20" y="20" width="40" height="40" fill="#0A0A0A"/>
                    <rect x="150" y="10" width="60" height="60" fill="none" stroke="#0A0A0A" strokeWidth="5"/>
                    <rect x="160" y="20" width="40" height="40" fill="#0A0A0A"/>
                    <rect x="10" y="150" width="60" height="60" fill="none" stroke="#0A0A0A" strokeWidth="5"/>
                    <rect x="20" y="160" width="40" height="40" fill="#0A0A0A"/>
                    {/* Data dots simulation */}
                    {[80,95,110,125,140].map(x =>
                      [80,95,110,125,140].map(y => (
                        Math.sin(x * y) > 0.2 ? <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" fill="#0A0A0A"/> : null
                      ))
                    )}
                    {[30,45,60].map(x =>
                      [90,105,120,135].map(y => (
                        Math.cos(x + y) > 0 ? <rect key={`small-${x}-${y}`} x={x} y={y} width="8" height="8" fill="#0A0A0A"/> : null
                      ))
                    )}
                    {[170,185,200].map(x =>
                      [80,95,110,125,140].map(y => (
                        Math.tan(x * 0.1 + y * 0.05) > 0 ? <rect key={`r-${x}-${y}`} x={x} y={y} width="8" height="8" fill="#0A0A0A"/> : null
                      ))
                    )}
                    {/* Center logo area */}
                    <rect x="95" y="95" width="30" height="30" fill="white"/>
                    <text x="110" y="115" textAnchor="middle" fontSize="16">💳</text>
                  </svg>
                </div>
                <div style={{ marginTop: '0.75rem', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: '#0A0A0A', letterSpacing: '0.1em', textAlign: 'center' }}>
                  QRIS • SCENTLUX
                </div>
              </div>

              {/* Amount */}
              <div style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', padding: '1.25rem 2rem', marginBottom: '2rem' }}>
                <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Total Amount</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#C9A84C' }}>{formatPrice(total)}</div>
              </div>

              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(245,240,232,0.4)', marginBottom: '2rem', lineHeight: 1.6 }}>
                After completing payment, click the button below to confirm your order.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-outline-gold" style={{ padding: '0.85rem 2rem', fontSize: '0.75rem' }} onClick={() => setStep('cart')}>
                  Back to Cart
                </button>
                <button
                  className="btn-gold shine-hover"
                  style={{ padding: '0.85rem 2.5rem', fontSize: '0.75rem' }}
                  onClick={handleConfirmPayment}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Payment Done — Confirm Order'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="animate-fade-in" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Order Confirmed</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, color: '#F5F0E8', marginBottom: '1rem' }}>Thank You</h2>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'rgba(245,240,232,0.5)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                Your order has been confirmed. Your fragrances will be carefully prepared and dispatched soon.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-gold" onClick={() => router.push('/shop')}>Continue Shopping</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CartItem({ item, onRemove, onUpdateQty, formatPrice }) {
  return (
    <div style={{ background: '#0A0A0A', display: 'grid', gridTemplateColumns: '1fr 120px 120px 60px', gap: '1rem', padding: '1.25rem 1.5rem', alignItems: 'center', borderBottom: '1px solid rgba(201,168,76,0.07)' }}>
      {/* Product info */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ width: 60, height: 60, background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', flexShrink: 0, overflow: 'hidden' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🌸</div>
          )}
        </div>
        <div>
          <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase' }}>{item.brand}</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#F5F0E8' }}>{item.name}</div>
          {item.size_ml && <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: 'rgba(245,240,232,0.3)' }}>{item.size_ml}ml</div>}
        </div>
      </div>

      {/* Price */}
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: '#C9A84C' }}>
        {formatPrice(item.price)}
      </div>

      {/* Quantity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
          style={{ width: 28, height: 28, background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >−</button>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: '#F5F0E8', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
          style={{ width: 28, height: 28, background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >+</button>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        style={{ background: 'transparent', border: 'none', color: 'rgba(245,240,232,0.25)', cursor: 'pointer', fontSize: '1.2rem', transition: 'color 0.3s', textAlign: 'center' }}
        onMouseEnter={e => e.target.style.color = '#e88'}
        onMouseLeave={e => e.target.style.color = 'rgba(245,240,232,0.25)'}
        title="Remove"
      >✕</button>
    </div>
  );
}
