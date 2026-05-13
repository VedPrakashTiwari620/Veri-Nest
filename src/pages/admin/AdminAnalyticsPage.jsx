import Layout from '../../components/Layout';
import { StatCard } from '../../components/UI';
import { MOCK_ANALYTICS } from '../../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const COLORS = ['#6c63ff','#00d4aa','#ffd93d','#ff6b6b','#a55eea'];

export default function AdminAnalyticsPage() {
  const { summary, verificationStats, visitorTrends, complaintResolution, trustScoreDistribution } = MOCK_ANALYTICS;
  return (
    <Layout title="Analytics Dashboard" subtitle="Real-time community insights and statistics">
      {/* Summary Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard icon="👥" label="Total Residents"     value={summary.totalResidents}     change="+12 this month" changeType="up"   />
        <StatCard icon="✅" label="Verified"            value={summary.verifiedResidents}  change="86% rate"       changeType="up"   />
        <StatCard icon="🚪" label="Today Visitors"      value={summary.todayVisitors}      change="+3 from avg"    changeType="up"   />
        <StatCard icon="🔧" label="Open Complaints"     value={summary.openComplaints}     change="4 high priority" changeType="down" />
      </div>
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard icon="🛡️" label="Avg Trust Score"    value={summary.avgTrustScore}      change="↑ 3pts"         changeType="up"   />
        <StatCard icon="🚨" label="Fraud Attempts"      value={summary.fraudAttempts}      change="↓ 2 this week"  changeType="up"   />
        <StatCard icon="🎉" label="Upcoming Events"     value={summary.upcomingEvents}                                                />
        <StatCard icon="✅" label="Complaints Resolved" value={summary.resolvedComplaints} change="80% rate"       changeType="up"   />
      </div>

      {/* Verification Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16 }}>📊 Verification Trends</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={verificationStats}>
              <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
              <Bar dataKey="verified" fill="#6c63ff" radius={[4,4,0,0]} name="Verified" />
              <Bar dataKey="pending"  fill="#ffd93d" radius={[4,4,0,0]} name="Pending"  />
              <Bar dataKey="failed"   fill="#ff4757" radius={[4,4,0,0]} name="Failed"   />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trust Score Pie */}
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16 }}>🛡️ Trust Score Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={trustScoreDistribution} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={80} label={({ range }) => range}>
                {trustScoreDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visitor Trends + Complaints */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16 }}>🚪 Weekly Visitor Trends</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={visitorTrends}>
              <defs>
                <linearGradient id="vg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
              <Area type="monotone" dataKey="visitors" stroke="#00d4aa" fill="url(#vg2)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight:700, marginBottom:16 }}>🔧 Complaint Resolution by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={complaintResolution} layout="vertical">
              <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
              <Bar dataKey="open"     fill="#ff4757" radius={[0,4,4,0]} name="Open"     />
              <Bar dataKey="resolved" fill="#6bcb77" radius={[0,4,4,0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
