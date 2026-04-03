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
            <img src="/logo.webp" alt="ShiningMore" style={{ height: 100, width: 'auto' }} />
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
