import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { useAuth } from './_app';

export default function Account() {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();

  if (user) {
    return (
      <>
        <Head><title>Account — SCENTLUX</title></Head>
        <Navbar />
        <div style={{ paddingTop: 70, minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 420, padding: '3rem', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✦</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#F5F0E8', marginBottom: '0.5rem' }}>
              Welcome, {user.name}
            </div>
            <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.4)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              {user.email}
            </div>
            <div style={{ display: 'inline-block', marginBottom: '2rem', padding: '0.25rem 0.75rem', background: user.role === 'admin' ? 'rgba(201,168,76,0.15)' : 'rgba(100,200,100,0.1)', border: `1px solid ${user.role === 'admin' ? 'rgba(201,168,76,0.4)' : 'rgba(100,200,100,0.3)'}` }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: user.role === 'admin' ? '#C9A84C' : '#90e890', textTransform: 'uppercase' }}>
                {user.role}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user.role === 'admin' && (
                <button className="btn-gold" onClick={() => router.push('/admin')}>Go to Admin Panel</button>
              )}
              <button className="btn-outline-gold" onClick={() => router.push('/shop')}>Shop Now</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? { email: form.email, password: form.password } : form;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else if (mode === 'login') {
        login(data.user);
        router.push(data.user.role === 'admin' ? '/admin' : '/shop');
      } else {
        setSuccess(data.message);
        setMode('login');
        setForm({ name: '', email: form.email, password: '' });
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Head><title>Account — SCENTLUX</title></Head>
      <Navbar />
      <div style={{
        paddingTop: 70, minHeight: '100vh', background: '#0A0A0A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="animate-fade-in" style={{ width: '100%', maxWidth: 440, margin: '2rem', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', padding: '3rem' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img src="/logo.webp" alt="ShiningMore" style={{ height: 70, width: 'auto' }} />
          </div>

          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '2rem', border: '1px solid rgba(201,168,76,0.15)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  padding: '0.85rem',
                  background: mode === m ? 'rgba(201,168,76,0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: mode === m ? '2px solid #C9A84C' : '2px solid transparent',
                  color: mode === m ? '#C9A84C' : 'rgba(245,240,232,0.4)',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >{m === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          {/* Messages */}
          {error && (
            <div style={{ background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.3)', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: '#f88' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(50,200,100,0.1)', border: '1px solid rgba(50,200,100,0.3)', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: '#8ef' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                <input
                  className="input-dark"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>
            )}
            <div>
              <label style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
              <input
                className="input-dark"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input
                className="input-dark"
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder={mode === 'register' ? 'Minimum 6 characters' : '••••••••'}
                required
              />
            </div>

            <button type="submit" className="btn-gold shine-hover" style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '0.75rem' }} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'register' && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)', fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,232,0.4)', lineHeight: 1.7, textAlign: 'center' }}>
              ℹ New accounts require admin approval before access is granted.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
