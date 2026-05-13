import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { TrustScoreRing, StatusBadge, Modal } from '../components/UI';
import { toast } from '../components/UI';
import { getComplaints, getVisitors } from '../services/firestoreService';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || 'resident@verinest.com');
  const [myComplaints, setMyComplaints] = useState([]);
  const [myVisitors, setMyVisitors] = useState([]);

  useEffect(() => {
    getComplaints().then(c => setMyComplaints(c.slice(0, 3)));
    getVisitors().then(v => setMyVisitors(v.filter(x => x.visiting === (user?.name || 'Test UserName')).slice(0, 3)));
  }, [user]);

  const handleSave = () => {
    toast.success('Profile updated!');
    setEditModal(false);
  };

  return (
    <Layout title="My Profile" subtitle="Your resident identity and settings">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile Card */}
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              margin: '0 auto 16px', fontWeight: 700, border: '3px solid var(--primary)',
              boxShadow: '0 0 24px rgba(108,99,255,0.4)',
            }}>
              {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'RS'}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'capitalize' }}>{user?.role}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              <StatusBadge status={user?.verified ? 'Verified' : 'Pending'} />
              <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)', fontSize: 11, fontWeight: 600, border: '1px solid rgba(108,99,255,0.3)' }}>
                #{user?.residentId}
              </span>
            </div>
            <TrustScoreRing score={user?.trustScore || 96} />
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary w-full btn-sm" onClick={() => setEditModal(true)}>✏️ Edit Profile</button>
            </div>
          </div>

          {/* Info Card */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>📋 Resident Info</div>
            {[
              ['🏠', 'Flat', user?.flat || 'A-203'],
              ['🏢', 'Tower', user?.tower || 'A'],
              ['📱', 'Mobile', user?.mobile ? `+91 ${user.mobile}` : '+91 9876577267'],
              ['🏙️', 'Society', 'Green Valley Residency'],
              ['📅', 'Member Since', '15 Jan 2024'],
            ].map(([icon, label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{icon} {label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Verification Status */}
          <div className="card" style={{ border: '1px solid rgba(107,203,119,0.3)', background: 'rgba(107,203,119,0.04)' }}>
            <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, color: 'var(--success)' }}>🛡️ Verification</div>
            {[
              ['📍', 'GPS Verified', '✅'],
              ['🤳', 'Liveness Check', '✅'],
              ['🪪', 'Aadhaar Matched', '✅'],
              ['📱', 'Device Trusted', '✅'],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{icon} {label}</span>
                <span>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* My Complaints */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔧 My Complaints</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/complaints')}>View All</button>
            </div>
            {myComplaints.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.type}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.date}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>

          {/* My Visitors */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🚪 Recent Visitors</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/visitors')}>View All</button>
            </div>
            {myVisitors.length ? myVisitors.map(v => (
              <div key={v.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 22 }}>{v.type === 'delivery' ? '📦' : v.type === 'service' ? '🔧' : '👤'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.date} · {v.time}</div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            )) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No visitors yet</div>}
          </div>

          {/* Settings */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>⚙️ Settings & Privacy</div>
            {[
              { icon: '🔔', label: 'Push Notifications', toggle: true },
              { icon: '📧', label: 'Email Alerts', toggle: true },
              { icon: '👁️', label: 'Profile Visible to Residents', toggle: true },
              { icon: '📍', label: 'Location Services', toggle: false },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13 }}>{s.icon} {s.label}</span>
                <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={s.toggle} style={{ display: 'none' }} />
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 12,
                    background: s.toggle ? 'var(--primary)' : 'var(--bg-card2)',
                    border: '1px solid var(--border)', transition: 'var(--transition)',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: s.toggle ? 22 : 2,
                      width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)',
                    }} />
                  </div>
                </label>
              </div>
            ))}
            <button className="btn btn-danger w-full" style={{ marginTop: 16 }} onClick={() => { logout(); navigate('/login'); }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleSave}>Save Changes</button>
        </div>
      </Modal>
    </Layout>
  );
}
