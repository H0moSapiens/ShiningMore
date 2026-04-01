import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Head>
        <title>SCENTLUX — Maison de Parfum</title>
        <meta name="description" content="Discover rare and exquisite perfumes" />
      </Head>
      <Navbar />

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 60% 50%, rgba(201,168,76,0.07) 0%, transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.05) 0%, transparent 50%), #0A0A0A',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '15%', right: '8%', width: 1, height: '40%', background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.3), transparent)' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: '20%', height: 1, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)' }} />
          <div style={{ position: 'absolute', top: '30%', left: '5%', fontFamily: 'Cormorant Garamond, serif', fontSize: '6rem', color: 'rgba(201,168,76,0.04)', fontWeight: 300, letterSpacing: '0.5em', userSelect: 'none' }}>
            PARFUM
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', paddingTop: 70, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%' }}>
          <div className="animate-fade-in">
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              — The Art of Scent
            </p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(3rem, 5vw, 5.5rem)', fontWeight: 300, lineHeight: 1.05, color: '#F5F0E8', marginBottom: '1.5rem' }}>
              Where Fragrance<br />
              <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Becomes Memory</em>
            </h1>
            <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, color: 'rgba(245,240,232,0.55)', maxWidth: 420, lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              Curated from the world's finest perfumers. Each bottle holds a story waiting to become yours.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/shop">
                <button className="btn-gold" style={{ fontSize: '0.75rem', padding: '0.9rem 2.5rem' }}>
                  Explore Collection
                </button>
              </Link>
              <Link href="/account">
                <button className="btn-outline-gold" style={{ fontSize: '0.75rem', padding: '0.9rem 2.5rem' }}>
                  Join The House
                </button>
              </Link>
            </div>
          </div>

          {/* Visual side */}
          <div className="animate-fade-in stagger-2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 380, height: 480 }}>
              {/* Background circle */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 320, height: 320, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
                border: '1px solid rgba(201,168,76,0.15)',
              }} />
              {/* Main image */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 220, height: 320,
                background: 'linear-gradient(145deg, #1A1A1A, #2A2A2A)',
                border: '1px solid rgba(201,168,76,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(201,168,76,0.08)',
              }}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌹</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', color: '#C9A84C', fontSize: '1.2rem', letterSpacing: '0.2em' }}>N°01</div>
                  <div style={{ fontFamily: 'Jost, sans-serif', color: 'rgba(245,240,232,0.4)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '0.5rem' }}>Signature</div>
                </div>
              </div>
              {/* Floating tag */}
              <div style={{
                position: 'absolute', bottom: 40, right: 10,
                background: 'rgba(26,26,26,0.9)', border: '1px solid rgba(201,168,76,0.3)',
                padding: '0.75rem 1rem', backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>New Arrivals</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#C9A84C' }}>8 fragrances</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section style={{ background: '#111', borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '2rem 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {['Oriental', 'Floral', 'Fresh', 'Woody', 'Musk'].map(cat => (
            <Link key={cat} href={`/shop?category=${cat}`} style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', transition: 'color 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#C9A84C'}
                onMouseLeave={e => e.target.style.color = 'rgba(245,240,232,0.5)'}
              >{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(201,168,76,0.1)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#C9A84C', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>SCENTLUX</div>
        <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)', letterSpacing: '0.2em' }}>© 2025 MAISON DE PARFUM</div>
      </footer>
    </>
  );
}
