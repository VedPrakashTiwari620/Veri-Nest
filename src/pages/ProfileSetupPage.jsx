import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';
import { toast } from '../components/UI';

const TOWERS = ['A', 'B', 'C', 'D'];
const FLATS_PER_TOWER = [
  '101', '102', '103', '104', '105',
  '201', '202', '203', '204', '205',
  '301', '302', '303', '304', '305',
  '401', '402', '403', '404', '405',
  '501', '502', '503', '504', '505',
  '601', '602', '603', '604', '605',
  '701', '702', '703', '704', '705',
  '801', '802', '803', '804', '805',
  '901', '902', '903', '904', '905',
];

export default function ProfileSetupPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    tower: '',
    flat: '',
    members: '1',
    vehicleNumber: '',
  });

  const handleChange = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.tower || !form.flat) {
      toast.error('Please fill in name, tower and flat number');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // Mock API call
    const flatLabel = `${form.tower}-${form.flat}`;
    updateProfile({
      name: form.name,
      email: form.email || null,
      tower: form.tower,
      flat: flatLabel,
      members: Number(form.members) || 1,
      vehicleNumber: form.vehicleNumber || null,
    });
    setLoading(false);
    toast.success('Profile created successfully! Let\'s verify your identity.');
    navigate('/verify');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--gradient-hero)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.10) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: 'var(--gradient-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 16, boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
          }} className="animate-float">👤</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Welcome to Veri<span style={{ color: 'var(--primary)' }}>Nest</span>!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Set up your resident profile to get started
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <div className="animate-fade">
            {/* Progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              {['Profile Setup', 'Verification', 'Dashboard'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: i === 0 ? 'rgba(108,99,255,0.2)' : 'var(--bg-card2)',
                    border: `2px solid ${i === 0 ? 'var(--primary)' : 'var(--border)'}`,
                    color: i === 0 ? 'var(--primary-light)' : 'var(--text-muted)',
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 11, color: i === 0 ? 'var(--primary-light)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
                  {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />}
                </div>
              ))}
            </div>

            {/* Mobile number display */}
            <div style={{
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mobile Number</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>+91 {user?.mobile}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✅ Verified</span>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input className="input-field" placeholder="e.g. Test UserName"
                  value={form.name} onChange={e => handleChange('name', e.target.value)} />
              </div>

              <div className="input-group">
                <label className="input-label">Email (optional)</label>
                <input className="input-field" type="email" placeholder="e.g. testuser@email.com"
                  value={form.email} onChange={e => handleChange('email', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Select Tower *</label>
                  <select className="input-field" value={form.tower}
                    onChange={e => handleChange('tower', e.target.value)}>
                    <option value="">Choose tower</option>
                    {TOWERS.map(t => <option key={t} value={t}>Tower {t}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Flat Number *</label>
                  <select className="input-field" value={form.flat}
                    onChange={e => handleChange('flat', e.target.value)}
                    disabled={!form.tower}>
                    <option value="">Choose flat</option>
                    {FLATS_PER_TOWER.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Family Members</label>
                  <select className="input-field" value={form.members}
                    onChange={e => handleChange('members', e.target.value)}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Vehicle No. (optional)</label>
                  <input className="input-field" placeholder="e.g. HR 26 AB 1234"
                    value={form.vehicleNumber}
                    onChange={e => handleChange('vehicleNumber', e.target.value.toUpperCase())} />
                </div>
              </div>
            </div>

            {/* Society Info */}
            <div style={{
              background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: 'var(--radius-md)', padding: '12px 14px', marginTop: 20, marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 24 }}>🏢</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Green Valley Residency</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sector 45, Gurugram · Code: GVR2024</div>
              </div>
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 20 }}>
              <input type="checkbox" style={{ marginTop: 2 }} defaultChecked />
              I agree to the Terms of Service and Privacy Policy of Veri-Nest community platform.
            </label>

            {/* Submit */}
            <button className="btn btn-primary btn-lg w-full" onClick={handleSubmit}
              disabled={loading || !form.name || !form.tower || !form.flat}>
              {loading ? <><Spinner size={18} color="#fff" /> Setting up...</> : 'Continue to Verification →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
          🔐 Demo Mode · Your data is stored locally
        </p>
      </div>
    </div>
  );
}
