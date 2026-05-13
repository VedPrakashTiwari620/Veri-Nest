import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Modal, StatusBadge } from '../components/UI';
import { toast } from '../components/UI';
import { getEvents, addEvent } from '../services/firestoreService';

export default function EventsPage() {
  const [events, setEvents]     = useState([]);

  useEffect(() => { getEvents().then(setEvents); }, []);
  const [showModal, setShowModal] = useState(false);
  const [rsvpMap, setRsvpMap]   = useState({});
  const [form, setForm]         = useState({ title:'', date:'', time:'', venue:'', description:'', capacity:50 });

  const handleRSVP = (id) => {
    if (rsvpMap[id]) { toast.info('Already RSVP\'d!'); return; }
    setRsvpMap(p => ({ ...p, [id]: true }));
    setEvents(p => p.map(e => e.id === id ? { ...e, rsvp: e.rsvp + 1 } : e));
    toast.success('RSVP confirmed! 🎉');
  };

  const handleAdd = () => {
    if (!form.title || !form.date || !form.time || !form.venue) { toast.error('Fill all required fields'); return; }
    const ev = { id:`EVT${Date.now()}`, ...form, capacity:Number(form.capacity), rsvp:0, status:'Open', organizer:'You' };
    setEvents(p => [...p, ev]);
    setShowModal(false);
    setForm({ title:'', date:'', time:'', venue:'', description:'', capacity:50 });
    toast.success('Event created!');
  };

  return (
    <Layout
      title="Events & Activities" subtitle="Community events, RSVP and calendar"
      actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Create Event</button>}
    >
      {/* Stats */}
      <div className="grid-3" style={{ marginBottom:24 }}>
        {[
          { label:'Total Events',    value: events.length,                                   icon:'🎉' },
          { label:'Upcoming',        value: events.filter(e=>e.status==='Upcoming'||e.status==='Open').length, icon:'📅' },
          { label:'Your RSVPs',      value: Object.keys(rsvpMap).length,                     icon:'✅' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{s.label}</span>
              <span style={{ fontSize:24 }}>{s.icon}</span>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid-2">
        {events.map(ev => {
          const pct = Math.round((ev.rsvp / ev.capacity) * 100);
          const isRsvpd = !!rsvpMap[ev.id];
          return (
            <div key={ev.id} className="card animate-fade">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ fontSize:32 }}>
                  {ev.title.includes('Cricket')?'🏏':ev.title.includes('Yoga')?'🧘':ev.title.includes('Holi')?'🎨':ev.title.includes('Diwali')?'🪔':'🎉'}
                </div>
                <StatusBadge status={ev.status} />
              </div>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{ev.title}</h3>
              <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12, lineHeight:1.5 }}>{ev.description}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>
                <div>📅 {new Date(ev.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })} at {ev.time}</div>
                <div>📍 {ev.venue}</div>
                <div>👤 Organized by {ev.organizer}</div>
              </div>
              {/* Capacity bar */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>
                  <span>RSVP: {ev.rsvp}/{ev.capacity}</span>
                  <span>{pct}% filled</span>
                </div>
                <div style={{ height:4, background:'var(--bg-card2)', borderRadius:'var(--radius-full)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background: pct>80?'var(--danger)':pct>50?'var(--warning)':'var(--primary)', borderRadius:'var(--radius-full)', transition:'width 0.5s' }} />
                </div>
              </div>
              <button
                className={`btn w-full btn-sm ${isRsvpd ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => handleRSVP(ev.id)}
                disabled={ev.status === 'Planning'}
              >
                {isRsvpd ? '✅ RSVP\'d' : ev.status === 'Planning' ? '🔜 Coming Soon' : '🎟️ RSVP Now'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="🎉 Create Event">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="input-group">
            <label className="input-label">Event Title *</label>
            <input className="input-field" placeholder="e.g. Society Cricket Match" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
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
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Venue *</label>
              <input className="input-field" placeholder="e.g. Society Ground" value={form.venue}
                onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Capacity</label>
              <input className="input-field" type="number" placeholder="50" value={form.capacity}
                onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea className="input-field" style={{ resize:'vertical', minHeight:80 }} value={form.description}
              placeholder="Event description…"
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleAdd}>Create Event</button>
        </div>
      </Modal>
    </Layout>
  );
}
