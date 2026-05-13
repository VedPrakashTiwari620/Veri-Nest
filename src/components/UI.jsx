import { useState, useEffect, useRef } from 'react';

// ---- Toast System ----
let toastListeners = [];
export const toast = {
  _emit: (t) => toastListeners.forEach(fn => fn(t)),
  success: (msg) => toast._emit({ type: 'success', msg, id: Date.now() }),
  error:   (msg) => toast._emit({ type: 'error',   msg, id: Date.now() }),
  info:    (msg) => toast._emit({ type: 'info',    msg, id: Date.now() }),
  warning: (msg) => toast._emit({ type: 'warning', msg, id: Date.now() }),
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const fn = (t) => {
      setToasts(p => [...p, t]);
      setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3500);
    };
    toastListeners.push(fn);
    return () => { toastListeners = toastListeners.filter(f => f !== fn); };
  }, []);
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{icons[t.type]}</span>
          <span style={{ fontSize: 13, flex: 1 }}>{t.msg}</span>
          <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
            style={{ background: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      ))}
    </div>
  );
};

// ---- Spinner ----
export const Spinner = ({ size = 24, color = 'var(--primary)' }) => (
  <div style={{ width: size, height: size, border: `2px solid var(--border)`, borderTop: `2px solid ${color}`, borderRadius: '50%' }} className="animate-spin" />
);

// ---- Demo Mode Badge ----
export const DemoBadge = () => (
  <div className="demo-badge">
    <div className="demo-dot" />
    DEMO MODE · MOCK VERIFICATION ENABLED
  </div>
);

// ---- Avatar ----
export const Avatar = ({ name, size = 'md', img }) => {
  const cls = size === 'sm' ? 'avatar avatar-sm' : size === 'lg' ? 'avatar avatar-lg' : size === 'xl' ? 'avatar avatar-xl' : 'avatar';
  const safeName = name || '';
  const initials = safeName.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  return img ? <img src={img} className={cls} alt={safeName} style={{ objectFit: 'cover' }} /> : <div className={cls}>{initials}</div>;
};

// ---- Badge ----
export const Badge = ({ children, type = 'primary' }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);

// ---- Status Badge ----
export const StatusBadge = ({ status }) => {
  const map = {
    Verified: 'success', verified: 'success', VERIFIED: 'success', Inside: 'success',
    Pending: 'warning',  pending: 'warning',  Open: 'warning', Planning: 'warning', Upcoming: 'primary',
    Failed: 'danger',    failed: 'danger',     FAILED: 'danger', Suspended: 'danger', Exited: 'secondary',
    'In Progress': 'primary', Approved: 'success', Resolved: 'secondary', Sold: 'secondary', Open: 'warning',
  };
  return <Badge type={map[status] || 'primary'}>{status}</Badge>;
};

// ---- Progress Bar ----
export const ProgressBar = ({ value, max = 100, color }) => (
  <div className="progress-bar">
    <div className="progress-fill" style={{ width: `${(value / max) * 100}%`, ...(color ? { background: color } : {}) }} />
  </div>
);

// ---- Modal ----
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ---- Stat Card ----
export const StatCard = ({ icon, label, value, change, changeType = 'up', color = 'var(--primary)' }) => (
  <div className="stat-card animate-fade">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div className="stat-value" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
    {change && <div className={`stat-change ${changeType}`}>{changeType === 'up' ? '↑' : '↓'} {change}</div>}
  </div>
);

// ---- Search Input ----
export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div style={{ position: 'relative' }}>
    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
    <input className="input-field" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} style={{ paddingLeft: 38, width: 240 }} />
  </div>
);

// ---- Empty State ----
export const EmptyState = ({ icon = '📭', title = 'Nothing here', subtitle }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{title}</div>
    {subtitle && <div style={{ fontSize: 13 }}>{subtitle}</div>}
  </div>
);

// ---- OTP Input ----
export const OTPInput = ({ value, onChange, length = 6 }) => {
  const refs = Array.from({ length }, () => useRef());
  const vals = value.split('');
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) refs[i - 1].current?.focus();
  };
  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const newVals = [...vals];
    newVals[i] = v.slice(-1);
    onChange(newVals.join(''));
    if (v && i < length - 1) refs[i + 1].current?.focus();
  };
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={refs[i]} maxLength={1} value={vals[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{
            width: 52, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700,
            background: 'var(--bg-card2)', border: `2px solid ${vals[i] ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', transition: 'var(--transition)',
          }} />
      ))}
    </div>
  );
};

// ---- Trust Score Ring ----
export const TrustScoreRing = ({ score }) => {
  const r = 54, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 80 ? '#6bcb77' : score >= 60 ? '#ffd93d' : '#ff4757';
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-card2)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color }}>{score}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Trust Score</div>
      </div>
    </div>
  );
};
