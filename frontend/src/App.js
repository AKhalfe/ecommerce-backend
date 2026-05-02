import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Quagga from 'quagga';

const API = 'http://localhost:5000/api';

const S = {
  layout: { display:'flex', height:'100vh', fontFamily:"'Segoe UI', sans-serif", background:'#f0f4f8', color:'#1a202c' },
  sidebar: { width:'220px', background:'#1e3a5f', borderRight:'none', display:'flex', flexDirection:'column' },
  sidebarLogo: { padding:'20px', borderBottom:'1px solid rgba(255,255,255,0.1)' },
  navItem: (active) => ({ display:'flex', alignItems:'center', gap:'10px', padding:'10px 20px', fontSize:'13px', color: active ? '#fff' : 'rgba(255,255,255,0.55)', cursor:'pointer', borderLeft: active ? '3px solid #fff' : '3px solid transparent', background: active ? 'rgba(255,255,255,0.15)' : 'transparent', transition:'all 0.15s' }),
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar: { padding:'14px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff' },
  content: { flex:1, overflowY:'auto', padding:'20px 24px', background:'#f0f4f8' },
  card: { background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', marginBottom:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  statCard: { background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  input: { padding:'8px 14px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'7px', color:'#1a202c', fontSize:'13px', outline:'none' },
  btnPrimary: { padding:'8px 16px', background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px', fontWeight:'500' },
  btnGhost: { padding:'8px 16px', background:'#f0f4f8', color:'#64748b', border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  btnDanger: { padding:'5px 10px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'11px', fontWeight:'600' },
  btnEdit: { padding:'5px 10px', background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'11px', fontWeight:'600' },
  btnView: { padding:'5px 10px', background:'#dcfce7', color:'#16a34a', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'11px', fontWeight:'600' },
  th: { padding:'10px 16px', textAlign:'left', color:'#94a3b8', fontWeight:'600', borderBottom:'1px solid #e2e8f0', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px' },
  td: { padding:'10px 16px', color:'#374151', borderBottom:'1px solid #f1f5f9', fontSize:'13px' },
  badge: (c) => ({ display:'inline-block', padding:'2px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', background: c==='admin'?'#fef3c7':c==='customer'?'#dbeafe':'#dcfce7', color: c==='admin'?'#d97706':c==='customer'?'#1d4ed8':'#16a34a' }),
  modal: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modalBox: { background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'28px', width:'460px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' },
};

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'customer' });
  const [cf, setCf] = useState({ email:'', oldPassword:'', newPassword:'', confirmPassword:'' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'register') {
        await axios.post(`${API}/register`, form);
        setSuccess('Account created! Please login.'); setMode('login');
      } else {
        const res = await axios.post(`${API}/login`, form);
        onLogin(res.data.token, res.data.user);
      }
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong'); }
    setLoading(false);
  };

  const handleChange = async () => {
    setError(''); setSuccess('');
    if (cf.newPassword !== cf.confirmPassword) { setError('Passwords do not match'); return; }
    try {
      const r = await axios.post(`${API}/login`, { email: cf.email, password: cf.oldPassword });
      await axios.post(`${API}/change-password`, { oldPassword: cf.oldPassword, newPassword: cf.newPassword }, { headers: { authorization: r.data.token } });
      setSuccess('Password changed! Please login.'); setMode('login');
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
  };

  const inp = { width:'100%', padding:'11px 14px', marginBottom:'12px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'14px', boxSizing:'border-box', background:'#f8fafc', color:'#1a202c', outline:'none' };

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4f8', display:'flex', fontFamily:"'Segoe UI', sans-serif" }}>
      <div style={{ flex:1, background:'linear-gradient(135deg,#1e3a5f,#1565c0,#0d47a1)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px' }}>
        <div style={{ fontSize:'48px', marginBottom:'12px' }}>🏭</div>
        <h1 style={{ color:'#fff', fontSize:'40px', margin:'0 0 12px', fontWeight:'800', lineHeight:1.1 }}>Warehouse<br/><span style={{ color:'#90caf9' }}>Management</span></h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'15px', marginBottom:'40px', lineHeight:1.8 }}>Complete inventory, orders and customer management system.</p>
        {['1,487+ Products across 12 departments','Real-time barcode scanning','Admin and customer portals','Full order history and receipts'].map(f => (
          <div key={f} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
            <div style={{ width:'18px', height:'18px', background:'#90caf9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', flexShrink:0, color:'#1e3a5f', fontWeight:'700' }}>✓</div>
            <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ width:'460px', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', background:'#fff' }}>
        <div style={{ width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ width:'52px', height:'52px', background:'#1e3a5f', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', margin:'0 auto 12px' }}>🏭</div>
            <h2 style={{ color:'#1a202c', fontSize:'20px', margin:'0 0 4px' }}>
              {mode==='login'?'Welcome back':mode==='register'?'Create account':'Reset password'}
            </h2>
            <p style={{ color:'#94a3b8', fontSize:'13px', margin:0 }}>
              {mode==='login'?'Sign in to your account':mode==='register'?'Fill in your details below':'Enter your details below'}
            </p>
          </div>

          {mode==='login' && (
            <div style={{ display:'flex', background:'#f0f4f8', borderRadius:'8px', padding:'4px', marginBottom:'20px' }}>
              {['customer','admin'].map(r => (
                <button key={r} onClick={() => setForm({...form, role:r})}
                  style={{ flex:1, padding:'8px', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px', fontWeight:'600', textTransform:'capitalize', background: form.role===r?(r==='admin'?'#dc2626':'#1e3a5f'):'transparent', color: form.role===r?'#fff':'#94a3b8', transition:'all 0.2s' }}>
                  {r==='admin'?'👑 Admin':'👤 Customer'}
                </button>
              ))}
            </div>
          )}

          {mode==='login' && form.role==='admin' && (
            <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px', fontSize:'12px', color:'#92400e' }}>
              <b>Default Admin:</b> admin@warehouse.com / admin123
            </div>
          )}

          {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', marginBottom:'12px', fontSize:'13px', color:'#dc2626' }}>{error}</div>}
          {success && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'8px', padding:'10px 14px', marginBottom:'12px', fontSize:'13px', color:'#16a34a' }}>{success}</div>}

          {mode==='login' && (
            <>
              <input placeholder="Email address" value={form.email} onChange={e => setForm({...form,email:e.target.value})} style={inp} />
              <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} style={inp} />
              <div style={{ textAlign:'right', marginTop:'-6px', marginBottom:'16px' }}>
                <span onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} style={{ color:'#1e3a5f', cursor:'pointer', fontSize:'12px', fontWeight:'500' }}>Forgot password?</span>
              </div>
              <button onClick={handle} disabled={loading} style={{ width:'100%', padding:'12px', background:form.role==='admin'?'#dc2626':'#1e3a5f', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'14px' }}>
                {loading?'Signing in...':'Sign In →'}
              </button>
              <p style={{ textAlign:'center', fontSize:'13px', color:'#94a3b8', margin:0 }}>
                No account? <span onClick={() => { setMode('register'); setError(''); setSuccess(''); }} style={{ color:'#1e3a5f', cursor:'pointer', fontWeight:'600' }}>Register here</span>
              </p>
            </>
          )}

          {mode==='register' && (
            <>
              <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} style={inp} />
              <input placeholder="Email address" value={form.email} onChange={e => setForm({...form,email:e.target.value})} style={inp} />
              <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} style={inp} />
              <select value={form.role} onChange={e => setForm({...form,role:e.target.value})} style={{...inp,cursor:'pointer'}}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handle} style={{ width:'100%', padding:'12px', background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'14px' }}>
                Create Account
              </button>
              <p style={{ textAlign:'center', fontSize:'13px', color:'#94a3b8', margin:0 }}>
                Have account? <span onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ color:'#1e3a5f', cursor:'pointer', fontWeight:'600' }}>Sign in</span>
              </p>
            </>
          )}

          {mode==='forgot' && (
            <>
              <input placeholder="Your Email" value={cf.email} onChange={e => setCf({...cf,email:e.target.value})} style={inp} />
              <input placeholder="Current Password" type="password" value={cf.oldPassword} onChange={e => setCf({...cf,oldPassword:e.target.value})} style={inp} />
              <input placeholder="New Password" type="password" value={cf.newPassword} onChange={e => setCf({...cf,newPassword:e.target.value})} style={inp} />
              <input placeholder="Confirm New Password" type="password" value={cf.confirmPassword} onChange={e => setCf({...cf,confirmPassword:e.target.value})} style={inp} />
              <button onClick={handleChange} style={{ width:'100%', padding:'12px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'15px', fontWeight:'600', marginBottom:'14px' }}>
                Change Password
              </button>
              <p style={{ textAlign:'center', fontSize:'13px', color:'#94a3b8', margin:0 }}>
                <span onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ color:'#1e3a5f', cursor:'pointer', fontWeight:'600' }}>← Back to Login</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ token, user, onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [addSearch, setAddSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    axios.get(`${API}/orders`, { headers:{ authorization:token } }).then(r => setOrders(r.data));
    axios.get(`${API}/customers`, { headers:{ authorization:token } }).then(r => setCustomers(r.data));
  };

  const totalRevenue = orders.reduce((s,o) => s+o.totalAmount, 0);

  const openEdit = (o) => { setEditOrder(o); setEditItems(o.items.map(i => ({...i}))); setAddSearch(''); setSearchResults([]); };

  const updateQty = (i, qty) => {
    const u = [...editItems];
    u[i].qty = parseInt(qty)||0;
    u[i].total = u[i].price * u[i].qty;
    setEditItems(u);
  };

  const removeItem = (i) => setEditItems(editItems.filter((_,j) => j!==i));

  const saveEdit = async () => {
    const totalAmount = editItems.reduce((s,i) => s+i.total, 0);
    const totalItems = editItems.reduce((s,i) => s+i.qty, 0);
    await axios.put(`${API}/orders/${editOrder._id}`, { items:editItems, totalAmount, totalItems }, { headers:{ authorization:token } });
    alert('Order updated!'); setEditOrder(null); setAddSearch(''); setSearchResults([]); fetchAll();
  };

  const searchProducts = async (q) => {
    setAddSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const res = await axios.get(`${API}/products/search?q=${q}`, { headers:{ authorization:token } });
    setSearchResults(res.data);
    setSearching(false);
  };

  const addItemToOrder = (product) => {
    const exists = editItems.find(i => i.barcode === product.barcode);
    if (exists) {
      setEditItems(editItems.map(i => i.barcode===product.barcode ? {...i, qty:i.qty+1, total:i.price*(i.qty+1)} : i));
    } else {
      setEditItems([...editItems, { name:product.name, barcode:product.barcode, price:product.price, qty:1, total:product.price }]);
    }
    setAddSearch(''); setSearchResults([]);
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    await axios.delete(`${API}/orders/${id}`, { headers:{ authorization:token } });
    fetchAll();
  };

  const filteredOrders = orders.filter(o =>
    o.receiptNo?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { id:'dashboard', icon:'📊', label:'Dashboard' },
    { id:'orders', icon:'📦', label:'Orders', count:orders.length },
    { id:'customers', icon:'👥', label:'Customers', count:customers.length },
  ];

  const SidebarFooter = () => (
    <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
        <div style={{ width:'32px', height:'32px', background:'rgba(255,255,255,0.2)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff' }}>
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ color:'#fff', fontSize:'13px', fontWeight:'500' }}>{user.name}</div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px' }}>Administrator</div>
        </div>
      </div>
      <button onClick={onLogout} style={{ width:'100%', padding:'7px', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'6px', cursor:'pointer', fontSize:'12px' }}>
        Sign Out
      </button>
    </div>
  );

  return (
    <div style={S.layout}>
      <div style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={{ fontSize:'20px', marginBottom:'4px' }}>🏭</div>
          <div style={{ color:'#fff', fontWeight:'700', fontSize:'14px' }}>Warehouse</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>Management System</div>
        </div>
        <nav style={{ padding:'12px 0', flex:1 }}>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setTab(n.id)} style={S.navItem(tab===n.id)}>
              <span style={{ fontSize:'15px' }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.count>0 && <span style={{ marginLeft:'auto', background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:'10px', padding:'1px 6px', borderRadius:'10px' }}>{n.count}</span>}
            </div>
          ))}
        </nav>
        <SidebarFooter />
      </div>

      <div style={S.main}>
        <div style={S.topbar}>
          <div>
            <h1 style={{ color:'#1a202c', fontSize:'17px', fontWeight:'600', margin:0 }}>
              {tab==='dashboard'?'Dashboard Overview':tab==='orders'?'Order Management':'Customer Management'}
            </h1>
            <p style={{ color:'#94a3b8', fontSize:'12px', margin:'2px 0 0' }}>
              {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </p>
          </div>
          <input placeholder="Search orders, customers..." value={search} onChange={e => setSearch(e.target.value)} style={{...S.input, width:'240px'}} />
        </div>

        <div style={S.content}>
          {tab==='dashboard' && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px' }}>
                {[
                  { label:'Total Orders', value:orders.length, color:'#1e3a5f', icon:'📦', sub:'All time' },
                  { label:'Total Revenue', value:`Rs.${totalRevenue.toLocaleString()}`, color:'#16a34a', icon:'💰', sub:'All time' },
                  { label:'Customers', value:customers.length, color:'#d97706', icon:'👥', sub:'Registered' },
                  { label:'Products', value:'1,487', color:'#dc2626', icon:'🛒', sub:'12 departments' },
                ].map(s => (
                  <div key={s.label} style={S.statCard}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                      <div style={{ color:'#94a3b8', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
                      <div style={{ fontSize:'18px' }}>{s.icon}</div>
                    </div>
                    <div style={{ fontSize:'24px', fontWeight:'700', color:s.color, marginBottom:'4px' }}>{s.value}</div>
                    <div style={{ fontSize:'11px', color:'#cbd5e1' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ color:'#1a202c', fontSize:'14px', fontWeight:'600', margin:0 }}>Recent Orders</h3>
                  <button onClick={() => setTab('orders')} style={S.btnGhost}>View All →</button>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr>{['Receipt','Customer','Items','Total','Date','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {orders.slice(0,5).map(o => (
                      <tr key={o._id}>
                        <td style={{...S.td, color:'#1e3a5f', fontWeight:'600'}}>{o.receiptNo}</td>
                        <td style={{...S.td, color:'#1a202c', fontWeight:'500'}}>{o.customer?.name}</td>
                        <td style={S.td}>{o.totalItems} items</td>
                        <td style={{...S.td, color:'#16a34a', fontWeight:'600'}}>Rs.{o.totalAmount}</td>
                        <td style={{...S.td, color:'#94a3b8'}}>{new Date(o.date).toLocaleDateString()}</td>
                        <td style={S.td}>
                          <button onClick={() => setSelectedOrder(o)} style={S.btnView}>View</button>{' '}
                          <button onClick={() => openEdit(o)} style={S.btnEdit}>Edit</button>
                        </td>
                      </tr>
                    ))}
                    {orders.length===0 && <tr><td colSpan="6" style={{...S.td, textAlign:'center', color:'#94a3b8', padding:'30px'}}>No orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab==='orders' && (
            <div style={S.card}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #e2e8f0' }}>
                <h3 style={{ color:'#1a202c', fontSize:'14px', fontWeight:'600', margin:0 }}>All Orders ({filteredOrders.length})</h3>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>{['Receipt No','Customer','Email','Items','Total','Date','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredOrders.length===0 ? (
                    <tr><td colSpan="7" style={{...S.td, textAlign:'center', padding:'30px', color:'#94a3b8'}}>No orders found</td></tr>
                  ) : filteredOrders.map(o => (
                    <tr key={o._id}>
                      <td style={{...S.td, color:'#1e3a5f', fontWeight:'600'}}>{o.receiptNo}</td>
                      <td style={{...S.td, color:'#1a202c', fontWeight:'500'}}>{o.customer?.name}</td>
                      <td style={{...S.td, color:'#94a3b8'}}>{o.customer?.email}</td>
                      <td style={S.td}>{o.totalItems}</td>
                      <td style={{...S.td, color:'#16a34a', fontWeight:'600'}}>Rs.{o.totalAmount}</td>
                      <td style={{...S.td, color:'#94a3b8'}}>{new Date(o.date).toLocaleDateString()} {new Date(o.date).toLocaleTimeString()}</td>
                      <td style={S.td}>
                        <button onClick={() => setSelectedOrder(o)} style={S.btnView}>View</button>{' '}
                        <button onClick={() => openEdit(o)} style={S.btnEdit}>Edit</button>{' '}
                        <button onClick={() => deleteOrder(o._id)} style={S.btnDanger}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab==='customers' && (
            <div style={S.card}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #e2e8f0' }}>
                <h3 style={{ color:'#1a202c', fontSize:'14px', fontWeight:'600', margin:0 }}>All Customers ({customers.length})</h3>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>{['Name','Email','Role','Orders','Spent','Reset Password'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {customers.length===0 ? (
                    <tr><td colSpan="6" style={{...S.td, textAlign:'center', padding:'30px', color:'#94a3b8'}}>No customers yet</td></tr>
                  ) : customers.map(c => {
                    const co = orders.filter(o => o.customer?.email===c.email);
                    const spent = co.reduce((s,o) => s+o.totalAmount, 0);
                    return (
                      <tr key={c._id}>
                        <td style={{...S.td, color:'#1a202c', fontWeight:'600'}}>{c.name}</td>
                        <td style={{...S.td, color:'#94a3b8'}}>{c.email}</td>
                        <td style={S.td}><span style={S.badge(c.role)}>{c.role}</span></td>
                        <td style={S.td}>{co.length}</td>
                        <td style={{...S.td, color:'#16a34a', fontWeight:'600'}}>Rs.{spent}</td>
                        <td style={S.td}>
                          <button style={S.btnEdit} onClick={async () => {
                            const p = prompt(`New password for ${c.name}:`);
                            if (!p || p.length<4) { alert('Too short!'); return; }
                            await axios.post(`${API}/reset-password`, { userId:c._id, newPassword:p }, { headers:{ authorization:token } });
                            alert(`Password reset to: ${p}`);
                          }}>Reset Password</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div>
                <h2 style={{ color:'#1a202c', margin:'0 0 4px', fontSize:'16px' }}>Order Details</h2>
                <p style={{ color:'#1e3a5f', margin:0, fontSize:'13px', fontWeight:'600' }}>{selectedOrder.receiptNo}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background:'#f0f4f8', border:'none', color:'#666', width:'28px', height:'28px', borderRadius:'6px', cursor:'pointer', fontSize:'16px' }}>×</button>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:'8px', padding:'12px', marginBottom:'14px' }}>
              <p style={{ color:'#94a3b8', fontSize:'12px', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Customer Info</p>
              <p style={{ color:'#1a202c', margin:'0 0 2px', fontSize:'13px', fontWeight:'600' }}>{selectedOrder.customer?.name}</p>
              <p style={{ color:'#94a3b8', margin:'0 0 2px', fontSize:'12px' }}>{selectedOrder.customer?.email}</p>
              <p style={{ color:'#94a3b8', margin:0, fontSize:'12px' }}>{new Date(selectedOrder.date).toLocaleString()}</p>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'14px' }}>
              <thead><tr>{['Item','Qty','Price','Total'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {selectedOrder.items.map((item,i) => (
                  <tr key={i}>
                    <td style={S.td}>{item.name}</td>
                    <td style={{...S.td, textAlign:'center'}}>{item.qty}</td>
                    <td style={{...S.td, textAlign:'center'}}>Rs.{item.price}</td>
                    <td style={{...S.td, textAlign:'center', color:'#16a34a', fontWeight:'600'}}>Rs.{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'1px solid #e2e8f0', color:'#1a202c', fontWeight:'700', fontSize:'15px' }}>
              <span>TOTAL</span><span style={{ color:'#16a34a' }}>Rs.{selectedOrder.totalAmount}</span>
            </div>
          </div>
        </div>
      )}

      {editOrder && (
        <div style={S.modal}>
          <div style={{...S.modalBox, width:'540px'}}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div>
                <h2 style={{ color:'#1a202c', margin:'0 0 4px', fontSize:'16px' }}>Edit Order</h2>
                <p style={{ color:'#d97706', margin:0, fontSize:'13px', fontWeight:'600' }}>{editOrder.receiptNo} — {editOrder.customer?.name}</p>
              </div>
              <button onClick={() => { setEditOrder(null); setAddSearch(''); setSearchResults([]); }} style={{ background:'#f0f4f8', border:'none', color:'#666', width:'28px', height:'28px', borderRadius:'6px', cursor:'pointer', fontSize:'16px' }}>×</button>
            </div>

            <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:'8px', padding:'12px', marginBottom:'16px', position:'relative' }}>
              <p style={{ margin:'0 0 8px', fontWeight:'600', fontSize:'13px', color:'#0369a1' }}>➕ Add Item to Order</p>
              <input
                placeholder="Search product by name or barcode..."
                value={addSearch}
                onChange={e => searchProducts(e.target.value)}
                style={{ width:'100%', padding:'8px 12px', borderRadius:'6px', border:'1px solid #bae6fd', fontSize:'13px', boxSizing:'border-box', outline:'none', background:'#fff', color:'#1a202c' }}
              />
              {searching && <p style={{ margin:'4px 0 0', fontSize:'12px', color:'#94a3b8' }}>Searching...</p>}
              {searchResults.length>0 && (
                <div style={{ position:'absolute', left:'12px', right:'12px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'6px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:100, maxHeight:'200px', overflowY:'auto', marginTop:'4px' }}>
                  {searchResults.map(p => (
                    <div key={p._id} onClick={() => addItemToOrder(p)}
                      style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                      <div>
                        <p style={{ margin:0, fontSize:'13px', fontWeight:'600', color:'#1a202c' }}>{p.name}</p>
                        <p style={{ margin:0, fontSize:'11px', color:'#94a3b8' }}>Barcode: {p.barcode} | Stock: {p.stock}</p>
                      </div>
                      <span style={{ color:'#16a34a', fontWeight:'700', fontSize:'13px' }}>Rs.{p.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'14px' }}>
              <thead><tr>{['Item','Price','Qty','Total',''].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {editItems.map((item,i) => (
                  <tr key={i}>
                    <td style={{...S.td, fontSize:'12px', color:'#1a202c'}}>{item.name}</td>
                    <td style={S.td}>Rs.{item.price}</td>
                    <td style={S.td}>
                      <input type="number" value={item.qty} min="1" onChange={e => updateQty(i,e.target.value)}
                        style={{ width:'60px', padding:'4px 8px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'4px', color:'#1a202c', fontSize:'13px' }} />
                    </td>
                    <td style={{...S.td, color:'#16a34a', fontWeight:'600'}}>Rs.{item.total}</td>
                    <td style={S.td}><button onClick={() => removeItem(i)} style={S.btnDanger}>✕ Remove</button></td>
                  </tr>
                ))}
                {editItems.length===0 && <tr><td colSpan="5" style={{...S.td, textAlign:'center', color:'#94a3b8', padding:'20px'}}>No items in order</td></tr>}
              </tbody>
            </table>

            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'1px solid #e2e8f0', marginBottom:'16px', color:'#1a202c', fontWeight:'700', fontSize:'15px' }}>
              <span>NEW TOTAL</span>
              <span style={{ color:'#16a34a' }}>Rs.{editItems.reduce((s,i) => s+i.total, 0)}</span>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={saveEdit} style={{ flex:1, padding:'10px', background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>✓ Save Changes</button>
              <button onClick={() => { setEditOrder(null); setAddSearch(''); setSearchResults([]); }} style={{ flex:1, padding:'10px', background:'#f0f4f8', color:'#666', border:'1px solid #e2e8f0', borderRadius:'8px', cursor:'pointer', fontSize:'14px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerApp({ token, user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('shop');
  const [productView, setProductView] = useState('list');
  const [showReceipt, setShowReceipt] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const scannerRef = useRef(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/products`).then(r => setProducts(r.data));
    fetchMyOrders();
  }, [token]);

  const fetchMyOrders = () => {
    axios.get(`${API}/orders/my`, { headers:{ authorization:token } }).then(r => setMyOrders(r.data));
  };

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = products.filter(p => {
    const mc = selectedCategory==='All' || p.category===selectedCategory;
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || String(p.barcode).includes(search);
    return mc && ms;
  });
  const grouped = categories.filter(c => c!=='All').reduce((acc,cat) => {
    const items = filteredProducts.filter(p => p.category===cat);
    if (items.length>0) acc[cat]=items;
    return acc;
  }, {});

  const addToCart = (p) => {
    const ex = cart.find(i => i._id===p._id);
    if (ex) setCart(cart.map(i => i._id===p._id ? {...i,qty:i.qty+1} : i));
    else setCart([...cart, {...p,qty:1}]);
  };
  const removeFromCart = (id) => setCart(cart.filter(i => i._id!==id));
  const totalAmount = cart.reduce((s,i) => s+i.price*i.qty, 0);
  const totalItems = cart.reduce((s,i) => s+i.qty, 0);
  const now = new Date();
  const receiptNo = 'INV-' + Date.now().toString().slice(-6);

  const handleCheckout = async () => {
    if (cart.length===0) { alert('Cart is empty!'); return; }
    try {
      const order = await axios.post(`${API}/orders`, {
        customer:{ id:user.id, name:user.name, email:user.email },
        items: cart.map(i => ({ name:i.name, barcode:i.barcode, price:i.price, qty:i.qty, total:i.price*i.qty })),
        totalAmount, totalItems, receiptNo
      }, { headers:{ authorization:token } });
      setMyOrders(prev => [order.data, ...prev]);
      setShowReceipt(true);
    } catch { alert('Error saving order'); }
  };

  const handlePrint = () => {
    const w = window.open('','','width=400,height=600');
    w.document.write(`<html><head><title>Receipt</title><style>body{font-family:monospace;font-size:13px;padding:20px;width:300px;margin:auto;}h2{text-align:center;}p{margin:2px 0;}</style></head><body>${receiptRef.current.innerHTML}</body></html>`);
    w.document.close(); w.focus(); w.print(); w.close();
  };

  const startScanner = () => {
    setScanning(true);
    setTimeout(() => {
      Quagga.init({ inputStream:{ type:'LiveStream', target:scannerRef.current, constraints:{ facingMode:'environment' } }, decoder:{ readers:['ean_reader','code_128_reader'] } },
        (err) => { if(err){ console.log(err); return; } Quagga.start(); });
      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        setScanResult(code); Quagga.stop(); setScanning(false);
        const found = products.find(p => p.barcode===code);
        if (found) { addToCart(found); alert('Added: '+found.name); }
        else alert('Not found: '+code);
      });
    }, 500);
  };
  const stopScanner = () => { Quagga.stop(); setScanning(false); };

  const navItems = [
    { id:'shop', icon:'🛒', label:'Shop' },
    { id:'orders', icon:'📦', label:'My Orders', count:myOrders.length },
  ];

  const ProductCard = ({ p }) => (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px 14px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
      <div>
        <p style={{ margin:'0 0 2px', fontWeight:'600', fontSize:'13px', color:'#1a202c' }}>{p.name}</p>
        <p style={{ margin:'0 0 2px', color:'#94a3b8', fontSize:'11px' }}>Barcode: {p.barcode} | Stock: {p.stock}</p>
        <p style={{ margin:0, color:'#16a34a', fontSize:'13px', fontWeight:'700' }}>Rs. {p.price}</p>
      </div>
      <button onClick={() => addToCart(p)} style={{ padding:'7px 14px', background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>+ Add</button>
    </div>
  );

  return (
    <div style={S.layout}>
      <div style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={{ fontSize:'20px', marginBottom:'4px' }}>🏭</div>
          <div style={{ color:'#fff', fontWeight:'700', fontSize:'14px' }}>Warehouse</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>Customer Portal</div>
        </div>
        <nav style={{ padding:'12px 0', flex:1 }}>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setTab(n.id)} style={S.navItem(tab===n.id)}>
              <span style={{ fontSize:'15px' }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.count>0 && <span style={{ marginLeft:'auto', background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:'10px', padding:'1px 6px', borderRadius:'10px' }}>{n.count}</span>}
            </div>
          ))}
        </nav>
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
            <div style={{ width:'32px', height:'32px', background:'rgba(255,255,255,0.2)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff' }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ color:'#fff', fontSize:'13px', fontWeight:'500' }}>{user.name}</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px' }}>Customer</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width:'100%', padding:'7px', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'6px', cursor:'pointer', fontSize:'12px' }}>Sign Out</button>
        </div>
      </div>

      <div style={S.main}>
        <div style={S.topbar}>
          <div>
            <h1 style={{ color:'#1a202c', fontSize:'17px', fontWeight:'600', margin:0 }}>
              {tab==='shop'?'Product Catalogue':'My Order History'}
            </h1>
            <p style={{ color:'#94a3b8', fontSize:'12px', margin:'2px 0 0' }}>Welcome back, {user.name}</p>
          </div>
          {tab==='shop' && (
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{...S.input, width:'200px'}} />
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{...S.input, cursor:'pointer'}}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => setProductView(productView==='list'?'grouped':'list')} style={S.btnGhost}>
                {productView==='list'?'Group View':'List View'}
              </button>
            </div>
          )}
        </div>

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'20px' }}>
            {tab==='shop' && (
              <>
                <div style={{...S.card, padding:'14px 16px', marginBottom:'16px'}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:scanning?'12px':0 }}>
                    <div>
                      <p style={{ margin:0, color:'#1a202c', fontWeight:'600', fontSize:'13px' }}>📷 Barcode Scanner</p>
                      {scanResult && <p style={{ margin:'2px 0 0', color:'#16a34a', fontSize:'12px' }}>Last scanned: {scanResult}</p>}
                    </div>
                    {!scanning
                      ? <button onClick={startScanner} style={{ padding:'7px 16px', background:'#f5f3ff', color:'#7c3aed', border:'1px solid #ddd6fe', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>Start Scanner</button>
                      : <button onClick={stopScanner} style={{ padding:'7px 16px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>Stop Scanner</button>
                    }
                  </div>
                  <div ref={scannerRef} style={{ width:'100%', height:scanning?'260px':'0px', overflow:'hidden', borderRadius:'8px', marginTop:scanning?'10px':0 }} />
                </div>

                {productView==='list' ? (
                  <>
                    <p style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'12px' }}>Showing {filteredProducts.length} products{selectedCategory!=='All'?` in ${selectedCategory}`:''}</p>
                    {filteredProducts.map(p => <ProductCard key={p._id} p={p} />)}
                  </>
                ) : (
                  Object.entries(grouped).map(([cat,items]) => (
                    <div key={cat} style={{ marginBottom:'20px' }}>
                      <div style={{ background:'#1e3a5f', borderRadius:'8px', padding:'10px 14px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ color:'#fff', fontWeight:'700', fontSize:'13px' }}>{cat}</span>
                        <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>{items.length} items</span>
                      </div>
                      {items.map(p => <ProductCard key={p._id} p={p} />)}
                    </div>
                  ))
                )}
              </>
            )}

            {tab==='orders' && (
              <>
                {myOrders.length===0 ? (
                  <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>
                    <div style={{ fontSize:'48px', marginBottom:'12px' }}>📦</div>
                    <p style={{ fontSize:'16px', marginBottom:'16px' }}>No orders yet</p>
                    <button onClick={() => setTab('shop')} style={S.btnPrimary}>Start Shopping →</button>
                  </div>
                ) : myOrders.map(o => (
                  <div key={o._id} style={{...S.card, padding:'16px', marginBottom:'12px'}}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                      <div>
                        <p style={{ margin:'0 0 2px', color:'#1e3a5f', fontWeight:'700', fontSize:'13px' }}>{o.receiptNo}</p>
                        <p style={{ margin:0, color:'#94a3b8', fontSize:'11px' }}>{new Date(o.date).toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ margin:'0 0 2px', color:'#16a34a', fontWeight:'700', fontSize:'16px' }}>Rs.{o.totalAmount}</p>
                        <p style={{ margin:0, color:'#94a3b8', fontSize:'11px' }}>{o.totalItems} items</p>
                      </div>
                    </div>
                    <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:'10px', marginBottom:'10px' }}>
                      {o.items.slice(0,3).map((item,i) => (
                        <p key={i} style={{ margin:'2px 0', fontSize:'12px', color:'#64748b' }}>• {item.name} ×{item.qty} — Rs.{item.total}</p>
                      ))}
                      {o.items.length>3 && <p style={{ margin:'2px 0', fontSize:'12px', color:'#94a3b8' }}>+{o.items.length-3} more items</p>}
                    </div>
                    <button onClick={() => setSelectedOrder(o)} style={S.btnGhost}>View Full Order →</button>
                  </div>
                ))}
              </>
            )}
          </div>

          <div style={{ width:'300px', background:'#fff', borderLeft:'1px solid #e2e8f0', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'16px', borderBottom:'1px solid #e2e8f0' }}>
              <h2 style={{ color:'#1a202c', margin:0, fontSize:'15px', fontWeight:'600' }}>🛒 Cart ({cart.length})</h2>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px' }}>
              {cart.length===0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'#94a3b8' }}>
                  <div style={{ fontSize:'32px', marginBottom:'8px' }}>🛒</div>
                  <p style={{ fontSize:'13px' }}>Cart is empty</p>
                </div>
              ) : cart.map(item => (
                <div key={item._id} style={{ background:'#f8fafc', borderRadius:'8px', padding:'10px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:'0 0 2px', fontSize:'12px', fontWeight:'600', color:'#1a202c' }}>{item.name}</p>
                    <p style={{ margin:0, fontSize:'11px', color:'#94a3b8' }}>Rs.{item.price} × {item.qty} = <span style={{ color:'#16a34a', fontWeight:'600' }}>Rs.{item.price*item.qty}</span></p>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} style={{ background:'#fef2f2', border:'none', color:'#dc2626', width:'22px', height:'22px', borderRadius:'4px', cursor:'pointer', fontSize:'12px', marginLeft:'8px' }}>×</button>
                </div>
              ))}
            </div>
            {cart.length>0 && (
              <div style={{ padding:'14px', borderTop:'1px solid #e2e8f0' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px', fontSize:'12px', color:'#94a3b8' }}>
                  <span>Items</span><span>{totalItems}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'14px', fontSize:'16px', fontWeight:'700', color:'#1a202c' }}>
                  <span>Total</span><span style={{ color:'#16a34a' }}>Rs.{totalAmount}</span>
                </div>
                <button onClick={handleCheckout} style={{ width:'100%', padding:'12px', background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'700' }}>
                  Checkout & Print Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReceipt && (
        <div style={S.modal}>
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'28px', width:'360px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div ref={receiptRef}>
              <h2 style={{ textAlign:'center', margin:'0 0 4px', color:'#1a202c' }}>WAREHOUSE SYSTEM</h2>
              <p style={{ textAlign:'center', color:'#94a3b8', fontSize:'12px', margin:'0 0 12px' }}>Thank you for your purchase!</p>
              <div style={{ borderTop:'1px dashed #e2e8f0', margin:'8px 0' }}></div>
              <p style={{ color:'#64748b', fontSize:'12px', margin:'2px 0' }}>Receipt No: {receiptNo}</p>
              <p style={{ color:'#64748b', fontSize:'12px', margin:'2px 0' }}>Date: {now.toLocaleDateString()}</p>
              <p style={{ color:'#64748b', fontSize:'12px', margin:'2px 0' }}>Time: {now.toLocaleTimeString()}</p>
              <p style={{ color:'#64748b', fontSize:'12px', margin:'2px 0' }}>Customer: {user?.name}</p>
              <div style={{ borderTop:'1px dashed #e2e8f0', margin:'8px 0' }}></div>
              {cart.map(item => (
                <div key={item._id} style={{ marginBottom:'6px' }}>
                  <p style={{ margin:0, fontSize:'12px', color:'#1a202c', fontWeight:'500' }}>{item.name}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#94a3b8' }}>
                    <span>Rs.{item.price} × {item.qty}</span><span style={{ color:'#16a34a' }}>Rs.{item.price*item.qty}</span>
                  </div>
                </div>
              ))}
              <div style={{ borderTop:'1px dashed #e2e8f0', margin:'8px 0' }}></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:'700', fontSize:'15px', color:'#1a202c' }}>
                <span>TOTAL</span><span style={{ color:'#16a34a' }}>Rs.{totalAmount}</span>
              </div>
              <p style={{ textAlign:'center', fontSize:'11px', color:'#94a3b8', marginTop:'10px' }}>*** Thank You — Visit Again! ***</p>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={handlePrint} style={{ flex:1, padding:'10px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>Print Receipt</button>
              <button onClick={() => { setCart([]); setShowReceipt(false); }} style={{ flex:1, padding:'10px', background:'#f0f4f8', color:'#64748b', border:'1px solid #e2e8f0', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>New Sale</button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div>
                <h2 style={{ color:'#1a202c', margin:'0 0 4px', fontSize:'16px' }}>Order Details</h2>
                <p style={{ color:'#1e3a5f', margin:0, fontSize:'13px', fontWeight:'600' }}>{selectedOrder.receiptNo} — {new Date(selectedOrder.date).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background:'#f0f4f8', border:'none', color:'#666', width:'28px', height:'28px', borderRadius:'6px', cursor:'pointer', fontSize:'16px' }}>×</button>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'14px' }}>
              <thead><tr>{['Item','Qty','Price','Total'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {selectedOrder.items.map((item,i) => (
                  <tr key={i}>
                    <td style={S.td}>{item.name}</td>
                    <td style={{...S.td, textAlign:'center'}}>{item.qty}</td>
                    <td style={{...S.td, textAlign:'center'}}>Rs.{item.price}</td>
                    <td style={{...S.td, textAlign:'center', color:'#16a34a', fontWeight:'600'}}>Rs.{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'1px solid #e2e8f0', color:'#1a202c', fontWeight:'700', fontSize:'15px' }}>
              <span>TOTAL</span><span style={{ color:'#16a34a' }}>Rs.{selectedOrder.totalAmount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')||'null'));

  const onLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token); setUser(user);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null); setUser(null);
  };

  if (!token) return <Login onLogin={onLogin} />;
  if (user?.role==='admin') return <AdminDashboard token={token} user={user} onLogout={onLogout} />;
  return <CustomerApp token={token} user={user} onLogout={onLogout} />;
}

export default App;