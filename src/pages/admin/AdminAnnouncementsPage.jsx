import { useState } from 'react';
import Layout from '../../components/Layout';
import { Modal } from '../../components/UI';
import { toast } from '../../components/UI';

const INITIAL = [
  { id:'ANN001', title:'Water Supply Maintenance', body:'Water supply will be shut down tomorrow (May 14) from 10 AM to 2 PM. Please store water.', date:'2026-05-13', status:'Published', pushed:true },
  { id:'ANN002', title:'Society Meeting',          body:'Monthly society meeting on April 15 at 6 PM in the clubhouse. All residents must attend.', date:'2026-04-10', status:'Published', pushed:true },
  { id:'ANN003', title:'Parking Rules Updated',    body:'No parking in fire lane after 8 PM. Vehicles will be towed.', date:'2026-05-12', status:'Draft', pushed:false },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(INITIAL);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', body:'', date: new Date().toISOString().split('T')[0] });

  const handleAdd = () => {
    if (!form.title || !form.body) { toast.error('Fill all fields'); return; }
    const a = { id:`ANN${Date.now()}`, ...form, status:'Draft', pushed:false };
    setAnnouncements(p => [a, ...p]);
    setShowModal(false);
    setForm({ title:'', body:'', date: new Date().toISOString().split('T')[0] });
    toast.success('Announcement created as Draft');
  };

  const handlePublish = (id) => {
    setAnnouncements(p => p.map(a => a.id === id ? { ...a, status:'Published' } : a));
    toast.success('Announcement published!');
  };

  const handlePush = (id) => {
    setAnnouncements(p => p.map(a => a.id === id ? { ...a, pushed:true } : a));
    toast.success('Push notification sent to all residents!');
  };

  const handleDelete = (id) => {
    setAnnouncements(p => p.filter(a => a.id !== id));
    toast.info('Announcement deleted');
  };

  return (
    <Layout title="Announcements" subtitle="Create and publish community announcements"
      actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ New Announcement</button>}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {announcements.map(a => (
          <div key={a.id} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{a.title}</h3>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>📅 {a.date}</div>
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{
                  padding:'3px 10px', borderRadius:'var(--radius-full)', fontSize:11, fontWeight:600,
                  background: a.status==='Published' ? 'rgba(107,203,119,0.15)' : 'rgba(255,217,61,0.15)',
                  color: a.status==='Published' ? 'var(--success)' : 'var(--warning)',
                  border: `1px solid ${a.status==='Published' ? 'rgba(107,203,119,0.3)' : 'rgba(255,217,61,0.3)'}`,
                }}>{a.status}</span>
                {a.pushed && <span style={{ fontSize:11, color:'var(--secondary)' }}>📲 Pushed</span>}
              </div>
            </div>
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:14 }}>{a.body}</p>
            <div style={{ display:'flex', gap:8 }}>
              {a.status === 'Draft' && (
                <button className="btn btn-success btn-sm" onClick={() => handlePublish(a.id)}>Publish</button>
              )}
              {a.status === 'Published' && !a.pushed && (
                <button className="btn btn-primary btn-sm" onClick={() => handlePush(a.id)}>📲 Send Push</button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="📢 New Announcement">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="input-group">
            <label className="input-label">Title *</label>
            <input className="input-field" placeholder="Announcement title" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Message *</label>
            <textarea className="input-field" style={{ resize:'vertical', minHeight:100 }} value={form.body}
              placeholder="Write your announcement…"
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Date</label>
            <input className="input-field" type="date" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleAdd}>Create Announcement</button>
        </div>
      </Modal>
    </Layout>
  );
}
