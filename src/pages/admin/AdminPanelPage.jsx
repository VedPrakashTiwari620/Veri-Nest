import Layout from '../../components/Layout';
import { StatCard, StatusBadge } from '../../components/UI';
import { MOCK_RESIDENTS, MOCK_VISITORS, MOCK_COMPLAINTS, MOCK_ANALYTICS } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const { summary } = MOCK_ANALYTICS;

  const ADMIN_MODULES = [
    { icon:'👥', title:'Resident Management', sub:'View, verify & suspend', color:'#6c63ff', path:'/admin/residents', count: summary.totalResidents },
    { icon:'📢', title:'Announcements',        sub:'Create & push updates',  color:'#00d4aa', path:'/admin/announcements', count: 3 },
    { icon:'📊', title:'Analytics',            sub:'View trends & reports',  color:'#ffd93d', path:'/admin/analytics', count: null },
    { icon:'🔧', title:'Complaints',           sub:'Assign & resolve',       color:'#ff6b6b', path:'/complaints', count: summary.openComplaints },
    { icon:'🚪', title:'Visitor Logs',         sub:'View all visitor entries',color:'#a55eea', path:'/visitors', count: summary.todayVisitors },
    { icon:'🛡️', title:'Fraud Detection',      sub:'Review suspicious activity',color:'#ff4757', path:'/admin/analytics', count: summary.fraudAttempts },
  ];

  return (
    <Layout title="Admin Panel" subtitle="Society management and control center">
      {/* Summary */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard icon="👥" label="Total Residents"   value={summary.totalResidents} change="+5 this month" changeType="up" />
        <StatCard icon="⏳" label="Pending Approval"  value={summary.pendingVerification} />
        <StatCard icon="🚨" label="Fraud Attempts"    value={summary.fraudAttempts} change="↓ 2 this week" changeType="up" />
        <StatCard icon="📊" label="Avg Trust Score"   value={summary.avgTrustScore} change="↑ 3pts" changeType="up" />
      </div>

      {/* Module Grid */}
      <div style={{ fontWeight:700, marginBottom:16, fontSize:16 }}>⚙️ Admin Modules</div>
      <div className="grid-3" style={{ marginBottom:24 }}>
        {ADMIN_MODULES.map(m => (
          <button key={m.title} onClick={() => navigate(m.path)} style={{
            background:'var(--gradient-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-lg)', padding:20, cursor:'pointer',
            textAlign:'left', transition:'var(--transition)', display:'flex', flexDirection:'column', gap:8,
          }} onMouseEnter={e => e.currentTarget.style.borderColor = m.color}
             onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{
                width:48, height:48, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:22, background:`${m.color}20`, border:`1px solid ${m.color}40`,
              }}>{m.icon}</div>
              {m.count !== null && (
                <div style={{ background:`${m.color}20`, color:m.color, padding:'4px 10px', borderRadius:'var(--radius-full)', fontSize:13, fontWeight:700 }}>
                  {m.count}
                </div>
              )}
            </div>
            <div style={{ fontWeight:700, fontSize:14 }}>{m.title}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>{m.sub}</div>
          </button>
        ))}
      </div>

      {/* Pending Verifications */}
      <div className="card">
        <div style={{ fontWeight:700, marginBottom:16, display:'flex', justifyContent:'space-between' }}>
          <span>⏳ Pending Verifications</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/residents')}>View All</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {MOCK_RESIDENTS.filter(r => r.status === 'Pending').map(r => (
            <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px', background:'var(--bg-card2)', borderRadius:'var(--radius-md)' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, flexShrink:0 }}>
                {r.name.split(' ').map(w=>w[0]).join('')}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{r.name}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Flat {r.flat} · {r.id}</div>
              </div>
              <StatusBadge status={r.status} />
              <button className="btn btn-success btn-sm">Approve</button>
              <button className="btn btn-danger btn-sm">Reject</button>
            </div>
          ))}
          {MOCK_RESIDENTS.filter(r => r.status === 'Pending').length === 0 && (
            <div style={{ color:'var(--text-muted)', fontSize:13, padding:12 }}>No pending verifications 🎉</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
