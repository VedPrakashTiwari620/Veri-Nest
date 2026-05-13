import { useState } from 'react';
import Layout from '../../components/Layout';
import { StatCard, StatusBadge, SearchInput, Avatar, Modal } from '../../components/UI';
import { toast } from '../../components/UI';
import { MOCK_RESIDENTS } from '../../data/mockData';

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState(MOCK_RESIDENTS);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected]   = useState(null);

  const filtered = residents.filter(r => {
    const m = r.name.toLowerCase().includes(search.toLowerCase()) || r.flat.toLowerCase().includes(search.toLowerCase());
    const f = filter === 'all' || r.status.toLowerCase() === filter;
    return m && f;
  });

  const handleAction = (id, action) => {
    setResidents(p => p.map(r => r.id === id ? { ...r, status: action === 'suspend' ? 'Suspended' : 'Verified', verified: action !== 'suspend' } : r));
    toast.success(`Resident ${action}ed successfully`);
    setSelected(null);
  };

  return (
    <Layout title="Resident Management" subtitle="View, verify, and manage all residents">
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard icon="👥" label="Total Residents"    value={residents.length} />
        <StatCard icon="✅" label="Verified"           value={residents.filter(r=>r.status==='Verified').length}   change="↑ 5 this month" changeType="up" />
        <StatCard icon="⏳" label="Pending Approval"  value={residents.filter(r=>r.status==='Pending').length} />
        <StatCard icon="🚫" label="Suspended"          value={residents.filter(r=>r.status==='Suspended').length} />
      </div>

      {/* Filters */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:8 }}>
          {[['all','All'],['verified','Verified'],['pending','Pending'],['suspended','Suspended']].map(([val,lbl]) => (
            <button key={val} onClick={() => setFilter(val)} className="btn btn-sm"
              style={{ background: filter===val?'rgba(108,99,255,0.2)':'var(--bg-card2)',
                border:`1px solid ${filter===val?'var(--primary)':'var(--border)'}`,
                color: filter===val?'var(--primary-light)':'var(--text-secondary)' }}>{lbl}</button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search residents…" />
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Resident</th><th>Flat</th><th>Tower</th><th>Status</th><th>Trust Score</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Avatar name={r.name} size="sm" />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{r.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{r.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight:600 }}>{r.flat}</td>
                <td>Tower {r.tower}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:60, height:4, background:'var(--bg-card2)', borderRadius:'var(--radius-full)', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${r.trustScore}%`, background: r.trustScore>=80?'var(--success)':r.trustScore>=60?'var(--warning)':'var(--danger)' }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:600 }}>{r.trustScore}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    {r.status === 'Pending' && (
                      <button className="btn btn-success btn-sm" onClick={() => handleAction(r.id, 'verify')}>✓ Verify</button>
                    )}
                    {r.status !== 'Suspended' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleAction(r.id, 'suspend')}>Suspend</button>
                    )}
                    {r.status === 'Suspended' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleAction(r.id, 'verify')}>Restore</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
