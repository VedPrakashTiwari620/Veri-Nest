import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Modal, SearchInput, StatusBadge } from '../components/UI';
import { toast } from '../components/UI';
import { getMarketplace, addMarketItem } from '../services/firestoreService';

const CATEGORIES = ['All','Furniture','Appliance','Sports','Books','Electronics','Other'];

export default function MarketplacePage() {
  const [items, setItems]       = useState([]);

  useEffect(() => { getMarketplace().then(setItems); }, []);
  const [search, setSearch]     = useState('');
  const [cat, setCat]           = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm]         = useState({ title:'', price:'', category:'Furniture', description:'' });

  const handleAdd = () => {
    if (!form.title || !form.price) { toast.error('Fill all required fields'); return; }
    const item = {
      id: `MKT${Date.now()}`, ...form, price: Number(form.price),
      seller:'You', flat:'A-203', status:'Available',
      date: new Date().toISOString().split('T')[0],
    };
    setItems(p => [item, ...p]);
    setShowModal(false);
    setForm({ title:'', price:'', category:'Furniture', description:'' });
    toast.success('Item listed successfully!');
  };

  const filtered = items.filter(i => {
    const m = i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    const c = cat === 'All' || i.category === cat;
    return m && c;
  });

  const CAT_ICONS = { Furniture:'🛋️', Appliance:'📱', Sports:'⚽', Books:'📚', Electronics:'💻', Other:'📦' };

  return (
    <Layout
      title="Marketplace" subtitle="Buy, sell & trade within your community"
      actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ List Item</button>}
    >
      {/* Category Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', overflowX:'auto', paddingBottom:4 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className="btn btn-sm"
            style={{ whiteSpace:'nowrap', background: cat===c?'rgba(108,99,255,0.2)':'var(--bg-card2)',
              border:`1px solid ${cat===c?'var(--primary)':'var(--border)'}`,
              color: cat===c?'var(--primary-light)':'var(--text-secondary)' }}>
            {CAT_ICONS[c] || '🌐'} {c}
          </button>
        ))}
        <div style={{ marginLeft:'auto' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search items…" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid-3">
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ cursor:'pointer', position:'relative' }}
            onClick={() => setShowDetail(item)}>
            <div style={{ fontSize:40, textAlign:'center', marginBottom:12,
              background:'var(--bg-card2)', borderRadius:'var(--radius-md)', padding:'20px 0' }}>
              {CAT_ICONS[item.category] || '📦'}
            </div>
            {item.status === 'Sold' && (
              <div style={{
                position:'absolute', top:12, right:12, background:'rgba(255,71,87,0.9)',
                color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:'var(--radius-full)',
              }}>SOLD</div>
            )}
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{item.title}</div>
            <div style={{ fontSize:20, fontWeight:800, color:'var(--secondary)', marginBottom:8 }}>₹{item.price.toLocaleString('en-IN')}</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.description}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:'var(--text-muted)', marginTop:8 }}>
              <span>🏠 {item.flat}</span>
              <span>{item.date}</span>
            </div>
            {item.status === 'Available' && (
              <button className="btn btn-primary btn-sm w-full" style={{ marginTop:12 }}
                onClick={e => { e.stopPropagation(); toast.success(`Message sent to ${item.seller}!`); }}>
                💬 Contact Seller
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'var(--text-muted)' }}>
            <div style={{ fontSize:48 }}>🛒</div>
            <div style={{ marginTop:12 }}>No items found</div>
          </div>
        )}
      </div>

      {/* List Item Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="📦 List New Item">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="input-group">
            <label className="input-label">Item Title *</label>
            <input className="input-field" placeholder="e.g. Wooden Study Table" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Price (₹) *</label>
              <input className="input-field" type="number" placeholder="2500" value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea className="input-field" style={{ resize:'vertical', minHeight:80 }}
              placeholder="Describe your item…" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleAdd}>List Item</button>
        </div>
      </Modal>

      {/* Detail Modal */}
      {showDetail && (
        <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail.title}>
          <div style={{ textAlign:'center', fontSize:60, marginBottom:16 }}>{CAT_ICONS[showDetail.category]}</div>
          <div style={{ fontSize:28, fontWeight:800, color:'var(--secondary)', marginBottom:8 }}>₹{showDetail.price.toLocaleString('en-IN')}</div>
          <StatusBadge status={showDetail.status} />
          <p style={{ color:'var(--text-secondary)', margin:'16px 0', lineHeight:1.6 }}>{showDetail.description}</p>
          <div style={{ background:'var(--bg-card2)', borderRadius:'var(--radius-md)', padding:12, marginBottom:16 }}>
            <div style={{ fontSize:13 }}>🏠 Flat {showDetail.flat} · {showDetail.seller}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>Listed on {showDetail.date}</div>
          </div>
          {showDetail.status === 'Available' && (
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={() => { toast.success(`Message sent to ${showDetail.seller}!`); setShowDetail(null); }}>💬 Message Seller</button>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => { toast.info('Offer sent!'); setShowDetail(null); }}>💰 Make Offer</button>
            </div>
          )}
        </Modal>
      )}
    </Layout>
  );
}
