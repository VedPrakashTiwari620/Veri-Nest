import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Avatar, StatusBadge, Modal, SearchInput } from '../components/UI';
import { toast } from '../components/UI';
import { getFeed, addFeedPost } from '../services/firestoreService';

export default function FeedPage() {
  const [posts, setPosts]       = useState([]);

  useEffect(() => { getFeed().then(setPosts); }, []);
  const [newPost, setNewPost]   = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');

  const handleLike = (id) => {
    setPosts(p => p.map(post => post.id === id ? { ...post, likes: post.likes + 1 } : post));
  };
  const handlePost = () => {
    if (!newPost.trim()) return;
    const p = {
      id: `FEED${Date.now()}`, author:'You', avatar:'ME', type:'post',
      content: newPost, time:'Just now', likes:0, comments:0, pinned:false,
    };
    setPosts(prev => [p, ...prev]);
    setNewPost('');
    toast.success('Post published!');
  };

  const filtered = posts.filter(p => {
    const matchSearch = p.content.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.type === filter;
    return matchSearch && matchFilter;
  });

  const typeIcon = { announcement:'📢', post:'💬', alert:'⚠️' };
  const typeColor = { announcement:'rgba(108,99,255,0.1)', post:'transparent', alert:'rgba(255,217,61,0.06)' };

  return (
    <Layout title="Community Feed" subtitle="Stay connected with your neighbours">
      {/* Post Composer */}
      <div className="card" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <Avatar name="You" size="md" />
          <div style={{ flex:1 }}>
            <textarea className="input-field" style={{ resize:'none', minHeight:80, width:'100%' }}
              placeholder="Share something with your community…"
              value={newPost} onChange={e => setNewPost(e.target.value)} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
              <div style={{ display:'flex', gap:8 }}>
                {['📷 Photo','📊 Poll','📎 Attach'].map(a => (
                  <button key={a} className="btn btn-secondary btn-sm" onClick={() => toast.info('Feature coming soon!')}>{a}</button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={!newPost.trim()}>Post</button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:8 }}>
          {['all','announcement','post','alert'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn btn-sm"
              style={{ background: filter===f ? 'rgba(108,99,255,0.2)' : 'var(--bg-card2)',
                border: `1px solid ${filter===f ? 'var(--primary)' : 'var(--border)'}`,
                color: filter===f ? 'var(--primary-light)' : 'var(--text-secondary)', textTransform:'capitalize' }}>
              {f === 'all' ? '🌐 All' : f === 'announcement' ? '📢 Announcements' : f === 'post' ? '💬 Posts' : '⚠️ Alerts'}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search feed…" />
      </div>

      {/* Posts */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {filtered.map(post => (
          <div key={post.id} className="card animate-fade" style={{ background: typeColor[post.type] || 'transparent' }}>
            {post.pinned && (
              <div style={{ fontSize:11, color:'var(--primary-light)', fontWeight:700, marginBottom:8, display:'flex', alignItems:'center', gap:4 }}>
                📌 Pinned Announcement
              </div>
            )}
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{
                width:42, height:42, borderRadius:'50%', background:'var(--gradient-primary)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, flexShrink:0,
              }}>{post.avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>{post.author}</span>
                  <span style={{ fontSize:18 }}>{typeIcon[post.type]}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:'auto' }}>{post.time}</span>
                </div>
                <p style={{ fontSize:14, lineHeight:1.6, color:'var(--text-primary)', whiteSpace:'pre-line' }}>{post.content}</p>
                <div style={{ display:'flex', gap:16, marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                  <button onClick={() => handleLike(post.id)} className="btn btn-ghost btn-sm" style={{ gap:4 }}>
                    ❤️ {post.likes}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ gap:4 }}>
                    💬 {post.comments}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => toast.info('Link copied!')}>
                    🔗 Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
            <div style={{ fontSize:48 }}>📭</div>
            <div style={{ marginTop:12 }}>No posts found</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
