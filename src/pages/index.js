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
      <div style={{ marginBottom: '1.5rem' }}>
        <img src="/logo.webp" alt="ShiningMore" style={{ height: 100, width: 'auto' }} />
      </div>

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
        <img src="/logo.webp" alt="ShiningMore" style={{ height: 100, width: 'auto', marginBottom: '0.5rem' }} />
      </footer>
    </>
  );
}
