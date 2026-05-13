import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { StatCard, Avatar, StatusBadge, TrustScoreRing } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { getVisitors, getComplaints, getFeed, getSociety, getEvents } from '../services/firestoreService';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const weekData = [
  { day:'Mon', visitors:24 },{ day:'Tue', visitors:18 },{ day:'Wed', visitors:32 },
  { day:'Thu', visitors:28 },{ day:'Fri', visitors:41 },{ day:'Sat', visitors:55 },{ day:'Sun', visitors:38 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feed, setFeed] = useState([]);
  const [events, setEvents] = useState([]);
  const [society, setSociety] = useState({ emergencyContacts: [] });

  useEffect(() => {
    getVisitors().then(setVisitors);
    getComplaints().then(setComplaints);
    getFeed().then(setFeed);
    getEvents().then(setEvents);
    getSociety().then(setSociety);
  }, []);

  const todayVisitors = visitors.filter(v => v.status === 'Inside' || v.status === 'Approved');
  const openComplaints = complaints.filter(c => c.status === 'Open');

  const QUICK_ACTIONS = [
    { icon:'🚨', label:'SOS Alert',      color:'#ff4757', action: () => alert('🚨 SOS ALERT SENT! Security has been notified.') },
    { icon:'🚪', label:'Invite Visitor', color:'#6c63ff', action: () => navigate('/visitors') },
    { icon:'🔧', label:'New Complaint',  color:'#ffd93d', action: () => navigate('/complaints') },
    { icon:'🤖', label:'AI Assistant',   color:'#00d4aa', action: () => navigate('/ai-assistant') },
    { icon:'📦', label:'Marketplace',    color:'#ff6b6b', action: () => navigate('/marketplace') },
    { icon:'🎉', label:'Events',         color:'#a55eea', action: () => navigate('/events') },
  ];

  return (
    <Layout
      title={`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${user?.name?.split(' ')[0]} 👋`}
      subtitle={`Green Valley Residency · ${new Date().toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric' })}`}
    >
      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard icon="🏠" label="Your Flat"       value={user?.flat || 'A-203'} />
        <StatCard icon="🛡️" label="Trust Score"     value={user?.trustScore || 96} change="Excellent" changeType="up" />
        <StatCard icon="🚪" label="Today's Visitors" value={todayVisitors.length}  change="2 inside" changeType="up" />
        <StatCard icon="🔧" label="Open Complaints"  value={openComplaints.length} change="2 pending" changeType="down" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        {/* Visitor trend chart */}
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>📈 Visitor Trends (This Week)</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/visitors')}>View All</button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
              <Area type="monotone" dataKey="visitors" stroke="#6c63ff" fill="url(#vg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trust Score + Society Info */}
        <div className="card" style={{ display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>🛡️ Your Verification Status</div>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <TrustScoreRing score={user?.trustScore || 96} />
            <div style={{ flex:1 }}>
              {[
                ['GPS Verified', '✅'],
                ['Liveness', '✅'],
                ['Aadhaar Match', '✅'],
                ['Device Trust', '✅'],
              ].map(([label, icon]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                  <span style={{ color:'var(--text-secondary)' }}>{label}</span>
                  <span>{icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom:24 }}>
        <div style={{ fontWeight:700, marginBottom:16 }}>⚡ Quick Actions</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={a.action} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              background:'var(--bg-card2)', border:'1px solid var(--border)',
              borderRadius:'var(--radius-md)', padding:'14px 20px',
              cursor:'pointer', transition:'var(--transition)', flex:'1', minWidth:80,
            }} onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
               onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <span style={{ fontSize:28 }}>{a.icon}</span>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        {/* Community Feed Preview */}
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>📰 Community Feed</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/feed')}>View All</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {feed.slice(0, 3).map(post => (
              <div key={post.id} style={{ display:'flex', gap:10, padding:'10px', background:'var(--bg-card2)', borderRadius:'var(--radius-sm)' }}>
                <div style={{
                  width:32, height:32, borderRadius:'50%', background:'var(--gradient-primary)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0,
                }}>{post.avatar}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{post.author}</div>
                  <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>🎉 Upcoming Events</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View All</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {events.slice(0,3).map(ev => (
              <div key={ev.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'10px', background:'var(--bg-card2)', borderRadius:'var(--radius-sm)' }}>
                <div style={{ textAlign:'center', minWidth:40 }}>
                  <div style={{ fontSize:11, color:'var(--primary-light)', fontWeight:700 }}>{ev.date.split('-')[2]}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)' }}>{new Date(ev.date).toLocaleString('default', { month:'short' })}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{ev.title}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{ev.time} · {ev.venue}</div>
                </div>
                <StatusBadge status={ev.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="card" style={{ border:'1px solid rgba(255,71,87,0.2)', background:'rgba(255,71,87,0.03)' }}>
        <div style={{ fontWeight:700, marginBottom:14, color:'var(--danger)' }}>🚨 Emergency Contacts</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {(society.emergencyContacts || []).map(c => (
            <a key={c.name} href={`tel:${c.number}`} style={{
              display:'flex', alignItems:'center', gap:8, padding:'10px 16px',
              background:'rgba(255,71,87,0.08)', border:'1px solid rgba(255,71,87,0.2)',
              borderRadius:'var(--radius-full)', fontSize:13, fontWeight:500, textDecoration:'none',
              transition:'var(--transition)', flex:'1', minWidth:140,
            }}>
              <span>{c.type==='security'?'🔐':c.type==='fire'?'🔥':c.type==='medical'?'🏥':c.type==='police'?'👮':'📞'}</span>
              <div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.name}</div>
                <div style={{ fontWeight:700, color:'var(--danger)' }}>{c.number}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
