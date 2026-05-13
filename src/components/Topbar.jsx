import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, subtitle, onMenuClick, actions }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="topbar">
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <button onClick={onMenuClick} style={{ display:'none', background:'none', fontSize:22, color:'var(--text-primary)' }}
          className="menu-btn">☰</button>
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="topbar-actions">
        {actions}
        {/* Notification Bell */}
        <div style={{ position:'relative' }}>
          <button onClick={() => setNotifOpen(p => !p)} style={{
            width:40, height:40, borderRadius:'50%', background:'var(--bg-card2)',
            border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
          }}>
            🔔
            <span style={{
              position:'absolute', top:6, right:6, width:8, height:8,
              background:'var(--danger)', borderRadius:'50%', border:'2px solid var(--bg-dark)',
            }} />
          </button>
          {notifOpen && (
            <div style={{
              position:'absolute', top:48, right:0, width:320, background:'var(--bg-card)',
              border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden',
              boxShadow:'var(--shadow-lg)', zIndex:200,
            }}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', fontSize:14, fontWeight:700 }}>Notifications</div>
              {[
                { icon:'🚪', text:'Swiggy Delivery is at the gate', time:'10:30 AM', unread:true },
                { icon:'🔧', text:'Complaint CMP002 is In Progress', time:'09:15 AM', unread:true },
                { icon:'📢', text:'Water supply maintenance tomorrow', time:'Yesterday', unread:false },
                { icon:'🎉', text:'Yoga Camp tomorrow at 7 AM', time:'Yesterday', unread:false },
              ].map((n, i) => (
                <div key={i} style={{
                  padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start',
                  borderBottom:'1px solid var(--border)', background: n.unread ? 'rgba(108,99,255,0.04)' : 'transparent',
                  cursor:'pointer', transition:'var(--transition)',
                }}>
                  <span style={{ fontSize:18 }}>{n.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, lineHeight:1.4 }}>{n.text}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{n.time}</div>
                  </div>
                  {n.unread && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0, marginTop:4 }} />}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Avatar */}
        <button onClick={() => navigate('/profile')} style={{ background:'none', border:'none', cursor:'pointer' }}>
          <Avatar name={user?.name} />
        </button>
      </div>

      <style>{`
        @media(max-width:900px){.menu-btn{display:flex!important;}}
      `}</style>
    </div>
  );
}
