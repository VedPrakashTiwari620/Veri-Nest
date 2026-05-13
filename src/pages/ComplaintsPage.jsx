import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { StatusBadge, Modal, SearchInput, Badge } from '../components/UI';
import { toast } from '../components/UI';
import { getComplaints, addComplaint } from '../services/firestoreService';

const PRIORITY_COLOR = { High:'var(--danger)', Medium:'var(--warning)', Low:'var(--success)' };

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => { getComplaints().then(setComplaints); }, []);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ type:'', description:'', priority:'Medium' });

  const handleAdd = () => {
    if (!form.type || !form.description) { toast.error('Fill all fields'); return; }
    const c = {
      id: `CMP${String(Date.now()).slice(-4)}`, type: form.type,
      resident:'You', flat:'A-203', status:'Open',
      priority: form.priority, date: new Date().toISOString().split('T')[0],
      description: form.description,
    };
    setComplaints(p => [c, ...p]);
    setShowModal(false);
    setForm({ type:'', description:'', priority:'Medium' });
    toast.success('Complaint raised! Ticket: ' + c.id);
  };

  const filtered = complaints.filter(c => {
    const m = c.type.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const f = filter === 'all' || c.status.toLowerCase().replace(' ', '-') === filter;
    return m && f;
  });

  const TYPES = ['Water Leakage','Lift Issue','Electricity','Parking','Noise Complaint','Garbage','Security','Other'];

  return (
    <Layout
      title="Complaints & Services" subtitle="Raise and track maintenance requests"
      actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ New Complaint</button>}
    >
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Total', value: complaints.length, icon:'📋' },
          { label:'Open',  value: complaints.filter(c=>c.status==='Open').length, icon:'🔴' },
          { label:'In Progress', value: complaints.filter(c=>c.status==='In Progress').length, icon:'🟡' },
          { label:'Resolved', value: complaints.filter(c=>c.status==='Resolved').length, icon:'🟢' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{s.label}</span>
              <span>{s.icon}</span>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:8 }}>
          {[['all','All'],['open','Open'],['in-progress','In Progress'],['resolved','Resolved']].map(([val,lbl]) => (
            <button key={val} onClick={() => setFilter(val)} className="btn btn-sm"
              style={{ background: filter===val?'rgba(108,99,255,0.2)':'var(--bg-card2)',
                border:`1px solid ${filter===val?'var(--primary)':'var(--border)'}`,
                color: filter===val?'var(--primary-light)':'var(--text-secondary)' }}>{lbl}</button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search complaints…" />
      </div>

      {/* List */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.map(c => (
          <div key={c.id} className="card" style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
            <div style={{
              width:44, height:44, borderRadius:12, flexShrink:0,
              background: c.status==='Resolved' ? 'rgba(107,203,119,0.15)' : c.status==='In Progress' ? 'rgba(108,99,255,0.15)' : 'rgba(255,71,87,0.15)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
            }}>
              {c.type.includes('Water')?'💧':c.type.includes('Lift')?'🛗':c.type.includes('Elec')?'⚡':c.type.includes('Park')?'🚗':c.type.includes('Noise')?'🔊':'🔧'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ fontWeight:700 }}>{c.type}</span>
                <StatusBadge status={c.status} />
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:'var(--radius-full)',
                  background:`${PRIORITY_COLOR[c.priority]}20`, color:PRIORITY_COLOR[c.priority],
                  border:`1px solid ${PRIORITY_COLOR[c.priority]}40` }}>{c.priority}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:'auto' }}>#{c.id}</span>
              </div>
              <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:6 }}>{c.description}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>📅 {c.date} · 🏠 Flat {c.flat}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="🔧 Raise Complaint">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="input-group">
            <label className="input-label">Complaint Type *</label>
            <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="">Select type…</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Priority</label>
            <select className="input-field" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Description *</label>
            <textarea className="input-field" style={{ minHeight:100, resize:'vertical' }} value={form.description}
              placeholder="Describe the issue in detail…"
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleAdd}>Submit Complaint</button>
        </div>
      </Modal>
    </Layout>
  );
}
