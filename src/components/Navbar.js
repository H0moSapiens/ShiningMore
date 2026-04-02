import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth, useCart } from '../pages/_app';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(201,168,76,0.15)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* SM Monogram SVG */}
            <svg width="38" height="38" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8CC80"/>
                  <stop offset="50%" stopColor="#C9A84C"/>
                  <stop offset="100%" stopColor="#A07830"/>
                </linearGradient>
                <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E0E0E0"/>
                  <stop offset="100%" stopColor="#A0A0A0"/>
                </linearGradient>
              </defs>
              {/* Outer silver block */}
              <rect x="5" y="10" width="90" height="65" rx="6" fill="url(#silverGrad)" opacity="0.9"/>
              {/* Gold inner fill */}
              <rect x="12" y="16" width="76" height="53" rx="4" fill="url(#goldGrad)"/>
              {/* S shape */}
              <path d="M18 25 Q18 18 28 18 Q38 18 38 26 Q38 34 28 36 Q18 38 18 46 Q18 54 30 54 Q40 54 40 46" fill="none" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round"/>
              {/* M shape */}
              <path d="M48 54 L48 20 L64 40 L80 20 L80 54" fill="none" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Sparkle top-left */}
              <path d="M3 8 L5 3 L7 8 L5 13 Z" fill="#E8CC80" opacity="0.9"/>
              {/* Sparkle bottom-right */}
              <path d="M93 72 L96 66 L99 72 L96 78 Z" fill="#E8CC80" opacity="0.9"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 400, background: 'linear-gradient(135deg, #E8CC80, #C9A84C, #A07830)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>ShiningMore</span>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.5rem', letterSpacing: '0.35em', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', marginTop: 1 }}>Maison de Parfum</span>
            </div>
          </div>
        </Link>

        {/* Center Nav */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <NavLink href="/shop" active={router.pathname === '/shop'}>Collection</NavLink>
          {user && <NavLink href="/cart" active={router.pathname === '/cart'}>
            Cart {cartCount > 0 && <span style={{ background: '#C9A84C', color: '#0A0A0A', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, marginLeft: 6 }}>{cartCount}</span>}
          </NavLink>}
          {user?.role === 'admin' && <NavLink href="/admin" active={router.pathname.startsWith('/admin')}>Admin</NavLink>}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'rgba(245,240,232,0.6)', fontSize: '0.8rem', fontFamily: 'Jost, sans-serif' }}>
                {user.name}
              </span>
              <button onClick={logout} className="btn-outline-gold" style={{ padding: '0.5rem 1.2rem', fontSize: '0.7rem' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/account">
              <button className="btn-gold" style={{ padding: '0.5rem 1.4rem', fontSize: '0.7rem' }}>
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, active }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <span style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.75rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: active ? '#C9A84C' : 'rgba(245,240,232,0.7)',
        transition: 'color 0.3s',
        display: 'flex', alignItems: 'center',
      }}>{children}</span>
    </Link>
  );
}
