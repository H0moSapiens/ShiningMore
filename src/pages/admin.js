import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { useAuth } from './_app';

const TABS = ['Users', 'Products', 'Transactions', 'Add Product', 'Database Export'];

export default function Admin() {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Users');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.replace('/account');
  }, [user, authLoading]);

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', color: '#C9A84C', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Admin Panel — SCENTLUX</title></Head>
      <Navbar />
      <div style={{ paddingTop: 70, minHeight: '100vh', background: '#0A0A0A' }}>
        <div style={{ background: '#111', borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '2rem 2rem 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Administration</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: '#F5F0E8', marginBottom: '1.5rem' }}>Control Panel</h1>
            <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(201,168,76,0.1)', overflowX: 'auto' }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.9rem 1.5rem', background: 'transparent', border: 'none', whiteSpace: 'nowrap',
                    borderBottom: activeTab === tab ? '2px solid #C9A84C' : '2px solid transparent',
                    color: activeTab === tab ? '#C9A84C' : 'rgba(245,240,232,0.4)',
                    fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em',
                    textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
                  }}
                >{tab}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 2rem' }}>
          {activeTab === 'Users' && <UsersTab />}
          {activeTab === 'Products' && <ProductsTab />}
          {activeTab === 'Transactions' && <TransactionsTab />}
          {activeTab === 'Add Product' && <AddProductTab />}
          {activeTab === 'Database Export' && <DatabaseExportTab />}
        </div>
      </div>
    </>
  );
}

/* ─── Database Export Tab ─── */
function DatabaseExportTab() {
  const SHEETS = [
    { key: 'users', label: 'Users', icon: '👤' },
    { key: 'products', label: 'Products', icon: '🌸' },
    { key: 'transactions', label: 'Transactions', icon: '💳' },
    { key: 'transaction_items', label: 'Order Items', icon: '📦' },
  ];

  const [activeSheet, setActiveSheet] = useState('users');
  const [tableData, setTableData] = useState({ data: [], columns: [] });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async (sheet) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/export?sheet=${sheet}`);
      const json = await res.json();
      setTableData({ data: json.data || [], columns: json.columns || [] });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(activeSheet); }, [activeSheet, fetchData]);

  const formatHeader = (col) => col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const buildWorkbook = async (XLSX, sheetResults) => {
    const wb = XLSX.utils.book_new();
    for (const sheet of sheetResults) {
      const rows = sheet.data || [];
      const cols = sheet.columns || [];
      const wsData = [cols.map(formatHeader), ...rows.map(row => cols.map(col => row[col] ?? ''))];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = cols.map(col => ({ wch: Math.min(Math.max(formatHeader(col).length + 4, 12), 50) }));
      XLSX.utils.book_append_sheet(wb, ws, sheet.label);
    }
    // Summary sheet
    const summaryData = [
      ['SCENTLUX — Database Export'],
      ['Generated:', new Date().toLocaleString('id-ID')],
      [''],
      ['Table', 'Records'],
      ...sheetResults.map(s => [s.label, s.data?.length ?? 0]),
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    return wb;
  };

  const exportAll = async () => {
    setExporting(true);
    try {
      const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
      const sheetResults = await Promise.all(
        SHEETS.map(s => fetch(`/api/admin/export?sheet=${s.key}`).then(r => r.json()).then(d => ({ ...s, ...d })))
      );
      const wb = await buildWorkbook(XLSX, sheetResults);
      XLSX.writeFile(wb, `scentlux_database_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) { console.error(err); alert('Export failed.'); }
    setExporting(false);
  };

  const exportCurrent = async () => {
    setExporting(true);
    try {
      const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
      const currentSheet = SHEETS.find(s => s.key === activeSheet);
      const wb = await buildWorkbook(XLSX, [{ ...currentSheet, ...tableData }]);
      XLSX.writeFile(wb, `scentlux_${activeSheet}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) { console.error(err); alert('Export failed.'); }
    setExporting(false);
  };

  const fmtCell = (col, val) => {
    if (col.includes('price') || col.includes('amount') || col.includes('total') || col === 'subtotal')
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    return String(val ?? '—');
  };

  const cellColor = (col, val) => {
    if (col === 'id' || col.endsWith('_id')) return 'rgba(201,168,76,0.6)';
    if (col.includes('price') || col.includes('amount') || col.includes('total') || col === 'subtotal') return '#C9A84C';
    if (col === 'role') {
      if (val === 'admin') return '#C9A84C';
      if (val === 'user') return '#90e890';
      if (val === 'pending') return '#e8b860';
      return '#f88';
    }
    if (col === 'stock') return Number(val) < 5 ? '#f88' : '#90e890';
    return 'rgba(245,240,232,0.78)';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#F5F0E8', fontWeight: 300, marginBottom: '0.3rem' }}>Database Export</h2>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(245,240,232,0.4)' }}>Preview tables and download as Excel</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-outline-gold" style={{ padding: '0.65rem 1.4rem', fontSize: '0.7rem' }} onClick={exportCurrent} disabled={exporting || loading}>
            {exporting ? 'Exporting...' : `⬇ Export This Sheet`}
          </button>
          <button className="btn-gold shine-hover" style={{ padding: '0.65rem 1.6rem', fontSize: '0.7rem' }} onClick={exportAll} disabled={exporting || loading}>
            {exporting ? 'Exporting...' : '⬇ Export All Tables (.xlsx)'}
          </button>
        </div>
      </div>

      {/* Sheet Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {SHEETS.map(s => (
          <button key={s.key} onClick={() => setActiveSheet(s.key)}
            style={{
              padding: '0.6rem 1.25rem',
              background: activeSheet === s.key ? 'rgba(201,168,76,0.12)' : 'transparent',
              border: `1px solid ${activeSheet === s.key ? '#C9A84C' : 'rgba(201,168,76,0.2)'}`,
              color: activeSheet === s.key ? '#C9A84C' : 'rgba(245,240,232,0.5)',
              fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em',
              cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            <span>{s.icon}</span> {s.label}
            {!loading && activeSheet === s.key && (
              <span style={{ marginLeft: '0.25rem', background: 'rgba(201,168,76,0.2)', padding: '0.1rem 0.45rem', fontSize: '0.6rem', borderRadius: 2 }}>
                {tableData.data.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid rgba(201,168,76,0.15)', overflow: 'auto', maxHeight: '60vh' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,240,232,0.3)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem' }}>Loading data...</div>
        ) : tableData.data.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,240,232,0.3)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem' }}>No records found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ background: '#111', borderBottom: '2px solid rgba(201,168,76,0.25)' }}>
                {tableData.columns.map(col => (
                  <th key={col} style={{ padding: '0.85rem 1.1rem', textAlign: 'left', fontFamily: 'Jost, sans-serif', fontSize: '0.62rem', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap', borderRight: '1px solid rgba(201,168,76,0.08)' }}>
                    {formatHeader(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.data.map((row, i) => (
                <tr key={i}
                  style={{ background: i % 2 === 0 ? '#0A0A0A' : '#0d0d0d', borderBottom: '1px solid rgba(201,168,76,0.06)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#0A0A0A' : '#0d0d0d'}
                >
                  {tableData.columns.map(col => (
                    <td key={col} style={{ padding: '0.8rem 1.1rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: cellColor(col, row[col]), whiteSpace: col === 'description' ? 'normal' : 'nowrap', maxWidth: col === 'description' ? 280 : 'none', overflow: 'hidden', textOverflow: 'ellipsis', borderRight: '1px solid rgba(201,168,76,0.05)' }}>
                      {fmtCell(col, row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!loading && tableData.data.length > 0 && (
        <div style={{ marginTop: '0.75rem', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)', textAlign: 'right' }}>
          Showing {tableData.data.length} records
        </div>
      )}
    </div>
  );
}

/* ─── Users Tab ─── */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetch_ = () => { setLoading(true); fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false); }); };
  useEffect(fetch_, []);
  const updateRole = async (userId, role) => { await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) }); fetch_(); };
  const rs = (role) => {
    if (role === 'admin') return { bg: 'rgba(201,168,76,0.15)', border: 'rgba(201,168,76,0.4)', text: '#C9A84C' };
    if (role === 'user') return { bg: 'rgba(50,200,100,0.1)', border: 'rgba(50,200,100,0.3)', text: '#90e890' };
    if (role === 'pending') return { bg: 'rgba(200,150,50,0.1)', border: 'rgba(200,150,50,0.3)', text: '#e8b860' };
    return { bg: 'rgba(200,50,50,0.1)', border: 'rgba(200,50,50,0.3)', text: '#f88' };
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#F5F0E8', fontWeight: 300 }}>All Users</h2>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.4)' }}>{users.length} accounts</span>
      </div>
      {loading ? <Loader /> : (
        <div style={{ border: '1px solid rgba(201,168,76,0.15)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead><tr style={{ background: '#111', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>{['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', fontWeight: 400 }}>{h}</th>)}</tr></thead>
            <tbody>{users.map((u, i) => { const rc = rs(u.role); return (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(201,168,76,0.07)', background: i % 2 === 0 ? '#0A0A0A' : '#0f0f0f' }}>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: '#F5F0E8' }}>{u.name}</td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'rgba(245,240,232,0.5)' }}>{u.email}</td>
                <td style={{ padding: '1rem 1.25rem' }}><span style={{ padding: '0.2rem 0.7rem', background: rc.bg, border: `1px solid ${rc.border}`, fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', color: rc.text, textTransform: 'uppercase' }}>{u.role}</span></td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.35)' }}>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  {u.role !== 'admin' && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {u.role === 'pending' && <><ActionBtn label="Approve" color="#90e890" onClick={() => updateRole(u.id, 'user')} /><ActionBtn label="Reject" color="#f88" onClick={() => updateRole(u.id, 'rejected')} /></>}
                    {u.role === 'user' && <ActionBtn label="Revoke" color="#f88" onClick={() => updateRole(u.id, 'pending')} />}
                    {u.role === 'rejected' && <ActionBtn label="Re-approve" color="#90e890" onClick={() => updateRole(u.id, 'user')} />}
                  </div>}
                </td>
              </tr>
            );})}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Products Tab ─── */
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const fmt = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p);
  useEffect(() => { fetch('/api/products').then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false); }); }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#F5F0E8', fontWeight: 300 }}>Product Inventory</h2>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.4)' }}>{products.length} products</span>
      </div>
      {loading ? <Loader /> : (
        <div style={{ border: '1px solid rgba(201,168,76,0.15)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead><tr style={{ background: '#111', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>{['Product', 'Brand', 'Category', 'Price', 'Stock'].map(h => <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', fontWeight: 400 }}>{h}</th>)}</tr></thead>
            <tbody>{products.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(201,168,76,0.07)', background: i % 2 === 0 ? '#0A0A0A' : '#0f0f0f' }}>
                <td style={{ padding: '1rem 1.25rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>{p.image_url && <img src={p.image_url} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', border: '1px solid rgba(201,168,76,0.2)' }} />}<span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: '#F5F0E8' }}>{p.name}</span></div></td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'rgba(245,240,232,0.5)' }}>{p.brand}</td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(201,168,76,0.7)' }}>{p.category}</td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#C9A84C' }}>{fmt(p.price)}</td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: p.stock < 5 ? '#f88' : '#90e890' }}>{p.stock}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Transactions Tab ─── */
function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const fmt = (p) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p);
  useEffect(() => { fetch('/api/transactions').then(r => r.json()).then(d => { setTransactions(d.transactions || []); setLoading(false); }); }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#F5F0E8', fontWeight: 300 }}>All Transactions</h2>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.4)' }}>{transactions.length} orders</span>
      </div>
      {loading ? <Loader /> : transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(245,240,232,0.3)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>No transactions yet</div>
      ) : (
        <div style={{ border: '1px solid rgba(201,168,76,0.15)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead><tr style={{ background: '#111', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>{['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'].map(h => <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', fontWeight: 400 }}>{h}</th>)}</tr></thead>
            <tbody>{transactions.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: '1px solid rgba(201,168,76,0.07)', background: i % 2 === 0 ? '#0A0A0A' : '#0f0f0f' }}>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'rgba(201,168,76,0.7)' }}>#{t.id}</td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: '#F5F0E8' }}>{t.user_name}</td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(245,240,232,0.4)' }}>{t.user_email}</td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: '#C9A84C' }}>{fmt(t.total_amount)}</td>
                <td style={{ padding: '1rem 1.25rem' }}><span style={{ padding: '0.2rem 0.7rem', background: 'rgba(50,200,100,0.1)', border: '1px solid rgba(50,200,100,0.3)', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', color: '#90e890', textTransform: 'uppercase' }}>{t.status}</span></td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.35)' }}>{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Add Product Tab ─── */
function AddProductTab() {
  const [form, setForm] = useState({ name: '', brand: '', description: '', price: '', stock: '', image_url: '', category: 'Floral', size_ml: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock), size_ml: parseInt(form.size_ml) }) });
    const data = await res.json();
    if (res.ok) { setMsg({ type: 'success', text: `"${data.product.name}" added!` }); setForm({ name: '', brand: '', description: '', price: '', stock: '', image_url: '', category: 'Floral', size_ml: '' }); }
    else setMsg({ type: 'error', text: data.message });
    setLoading(false);
  };
  const field = (label, key, type = 'text', opts = {}) => (
    <div>
      <label style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>{label}</label>
      <input className="input-dark" type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} {...opts} />
    </div>
  );
  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#F5F0E8', fontWeight: 300, marginBottom: '2rem' }}>Add New Fragrance</h2>
      {msg && <div style={{ padding: '1rem', marginBottom: '1.5rem', background: msg.type === 'success' ? 'rgba(50,200,100,0.1)' : 'rgba(200,50,50,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(50,200,100,0.3)' : 'rgba(200,50,50,0.3)'}`, color: msg.type === 'success' ? '#90e890' : '#f88', fontFamily: 'Jost, sans-serif', fontSize: '0.82rem' }}>{msg.text}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {field('Fragrance Name', 'name', 'text', { required: true, placeholder: 'e.g. Midnight Oud' })}
          {field('Brand', 'brand', 'text', { placeholder: 'e.g. Maison Noir' })}
        </div>
        <div>
          <label style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Description</label>
          <textarea className="input-dark" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the fragrance..." style={{ resize: 'vertical', fontFamily: 'Jost, sans-serif' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
          {field('Price (IDR)', 'price', 'number', { required: true, placeholder: '1500000', min: 0 })}
          {field('Stock', 'stock', 'number', { placeholder: '25', min: 0 })}
          {field('Size (ml)', 'size_ml', 'number', { placeholder: '50', min: 0 })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Category</label>
            <select className="input-dark" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {['Oriental', 'Floral', 'Fresh', 'Woody', 'Musk'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {field('Image URL', 'image_url', 'url', { placeholder: 'https://...' })}
        </div>
        <button type="submit" className="btn-gold shine-hover" style={{ padding: '1rem', fontSize: '0.75rem', alignSelf: 'flex-start', minWidth: 200 }} disabled={loading}>
          {loading ? 'Adding...' : 'Add Fragrance'}
        </button>
      </form>
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  return <button onClick={onClick} style={{ padding: '0.3rem 0.75rem', background: 'transparent', border: `1px solid ${color}40`, color, fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = `${color}20`} onMouseLeave={e => e.target.style.background = 'transparent'}>{label}</button>;
}

function Loader() {
  return <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,240,232,0.3)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}>Loading...</div>;
}
