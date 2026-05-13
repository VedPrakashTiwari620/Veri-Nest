import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, DemoBadge } from './UI';

const NAV = [
  { path: '/dashboard',    icon: '🏠', label: 'Dashboard'         },
  { path: '/feed',         icon: '📰', label: 'Community Feed'    },
  { path: '/visitors',     icon: '🚪', label: 'Visitors'          },
  { path: '/complaints',   icon: '🔧', label: 'Complaints'        },
  { path: '/marketplace',  icon: '🛒', label: 'Marketplace'       },
  { path: '/events',       icon: '🎉', label: 'Events'            },
  { path: '/ai-assistant', icon: '🤖', label: 'AI Assistant'      },
  { path: '/profile',      icon: '👤', label: 'My Profile'        },
];
const ADMIN_NAV = [
  { path: '/admin',            icon: '⚙️',  label: 'Admin Panel'      },
  { path: '/admin/residents',  icon: '👥',  label: 'Residents'        },
  { path: '/admin/analytics',  icon: '📊',  label: 'Analytics'        },
  { path: '/admin/announcements', icon: '📢', label: 'Announcements'  },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {open && <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99,backdropFilter:'blur(2px)' }} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:42, height:42, borderRadius:12, background:'var(--gradient-primary)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
              boxShadow:'0 4px 15px rgba(108,99,255,0.4)'
            }}>🏘️</div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, letterSpacing:'-0.5px' }}>Veri<span style={{ color:'var(--primary)' }}>Nest</span></div>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:500 }}>SMART COMMUNITY</div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding:'12px 16px', margin:'8px', background:'var(--bg-card2)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Avatar name={user?.name} size="sm" />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'capitalize' }}>{user?.role} · {user?.flat}</div>
            </div>
            {user?.verified && <span title="Verified">✅</span>}
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, letterSpacing:'1px', padding:'8px 14px 4px', textTransform:'uppercase' }}>Main</div>
          {NAV.map(n => (
            <NavLink key={n.path} to={n.path} onClick={onClose}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span style={{ fontSize:16 }}>{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, letterSpacing:'1px', padding:'16px 14px 4px', textTransform:'uppercase' }}>Admin</div>
              {ADMIN_NAV.map(n => (
                <NavLink key={n.path} to={n.path} onClick={onClose}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <span style={{ fontSize:16 }}>{n.icon}</span>
                  <span>{n.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item" style={{ width:'100%', color:'var(--danger)', border:'none', background:'none' }}>
            <span style={{ fontSize:16 }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <DemoBadge />
    </>
  );
}
