import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { StatusBadge, Modal, SearchInput } from '../components/UI';
import { toast } from '../components/UI';
import { getVisitors, addVisitor } from '../services/firestoreService';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState([]);

  useEffect(() => { getVisitors().then(setVisitors); }, []);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', type:'guest', date:'', time:'' });

  const handleAdd = () => {
    if (!form.name || !form.date || !form.time) { toast.error('Fill all required fields'); return; }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const v = {
      id: `VIS${Date.now()}`, name: form.name, visiting:'You', flat: 'A-203',
      otp, time: form.time, date: form.date, status:'Approved', type: form.type,
    };
    setVisitors(p => [v, ...p]);
    setShowModal(false);
    setForm({ name:'', type:'guest', date:'', time:'' });
    toast.success(`Visitor pre-approved! OTP: ${otp}`);
  };

  const filtered = visitors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.visiting.toLowerCase().includes(search.toLowerCase())
  );

  const typeIcon = { guest:'👤', delivery:'📦', service:'🔧' };
  const statusColor = { Inside:'var(--success)', Approved:'var(--primary)', Exited:'var(--text-muted)' };

  return (
    <Layout
      title="Visitor Management" subtitle="Control and track all visitors to your home"
      actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Pre-Approve Visitor</button>}
    >
      {/* Stats */}
      <div className="grid-3" style={{ marginBottom:24 }}>
        {[
          { label:'Inside Now',       value: visitors.filter(v=>v.status==='Inside').length,   icon:'🏠', color:'var(--success)'  },
          { label:'Today Approved',   value: visitors.filter(v=>v.status==='Approved').length,  icon:'✅', color:'var(--primary)'  },
          { label:'Total This Week',  value: visitors.length,                                   icon:'📊', color:'var(--secondary)'},
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{s.label}</span>
              <span style={{ fontSize:24 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search visitors…" />
      </div>

      {/* Visitor Cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.map(v => (
          <div key={v.id} className="card" style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{
              width:48, height:48, borderRadius:14, background:`rgba(108,99,255,0.15)`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0,
            }}>{typeIcon[v.type]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{v.name}</div>
              <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:2 }}>
                Visiting: {v.visiting} · Flat {v.flat}
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                {v.date} · {v.time}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
              <StatusBadge status={v.status} />
              <div style={{
                background:'var(--bg-card2)', border:'1px dashed var(--border)',
                borderRadius:'var(--radius-sm)', padding:'4px 10px', fontSize:16,
                fontWeight:800, letterSpacing:2, color:'var(--primary-light)',
              }}>OTP: {v.otp}</div>
            </div>
            {v.status === 'Approved' && (
              <button className="btn btn-success btn-sm" onClick={() => {
                setVisitors(p => p.map(x => x.id === v.id ? { ...x, status:'Inside' } : x));
                toast.success(`${v.name} checked in`);
              }}>Check In</button>
            )}
            {v.status === 'Inside' && (
              <button className="btn btn-secondary btn-sm" onClick={() => {
                setVisitors(p => p.map(x => x.id === v.id ? { ...x, status:'Exited' } : x));
                toast.info(`${v.name} checked out`);
              }}>Check Out</button>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Pre-Approve Visitor">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="input-group">
            <label className="input-label">Visitor Name *</label>
            <input className="input-field" placeholder="Full name" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Visitor Type</label>
            <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="guest">👤 Guest</option>
              <option value="delivery">📦 Delivery</option>
              <option value="service">🔧 Service</option>
            </select>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Date *</label>
              <input className="input-field" type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Time *</label>
              <input className="input-field" type="time" value={form.time}
                onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary w-full" onClick={handleAdd}>Generate OTP & Approve</button>
        </div>
      </Modal>
    </Layout>
  );
}
