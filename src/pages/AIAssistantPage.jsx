import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { CHATBOT_RESPONSES } from '../data/mockData';

const SUGGESTIONS = ['Book plumber','Visitor status','Upcoming event','Emergency contacts','My complaints','Announcements','Marketplace listings'];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { from:'bot', text:'👋 Hello! I\'m **VeriBot**, your AI community assistant.\n\nAsk me about visitors, complaints, events, emergencies and more!', time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const getResponse = (text) => {
    const lower = text.toLowerCase().trim();
    for (const [key, val] of Object.entries(CHATBOT_RESPONSES)) {
      if (key !== 'default' && lower.includes(key)) return val;
    }
    return CHATBOT_RESPONSES['default'];
  };

  const send = async (msg = input) => {
    if (!msg.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    setMessages(p => [...p, { from:'user', text: msg, time }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const res = getResponse(msg);
    setMessages(p => [...p, { from:'bot', text: res.text, time, action: res.action }]);
    setLoading(false);
  };

  const renderText = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  return (
    <Layout title="AI Assistant" subtitle="VeriBot — Your 24/7 Smart Community Helper">
      <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 160px)', maxWidth:720, margin:'0 auto' }}>
        {/* Chat window */}
        <div style={{
          flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12,
          padding:20, background:'var(--bg-card)', borderRadius:'var(--radius-xl)',
          border:'1px solid var(--border)', marginBottom:16,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-end', justifyContent: m.from==='user' ? 'flex-end' : 'flex-start' }}>
              {m.from === 'bot' && (
                <div style={{
                  width:36, height:36, borderRadius:10, background:'var(--gradient-primary)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
                }}>🤖</div>
              )}
              <div style={{ maxWidth:'75%' }}>
                <div style={{
                  padding:'12px 16px', borderRadius: m.from==='user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: m.from==='user' ? 'var(--gradient-primary)' : 'var(--bg-card2)',
                  border: m.from==='bot' ? '1px solid var(--border)' : 'none',
                  fontSize:14, lineHeight:1.6, color:'var(--text-primary)',
                }} dangerouslySetInnerHTML={{ __html: renderText(m.text) }} />
                {m.action === 'sos' && (
                  <div style={{ marginTop:8, padding:'8px 12px', background:'rgba(255,71,87,0.15)', border:'1px solid rgba(255,71,87,0.3)', borderRadius:'var(--radius-md)', fontSize:12, color:'var(--danger)' }}>
                    🚨 Security team notified at 9876500001
                  </div>
                )}
                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4, textAlign: m.from==='user' ? 'right' : 'left' }}>{m.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
              <div style={{ padding:'12px 16px', background:'var(--bg-card2)', borderRadius:'4px 18px 18px 18px', border:'1px solid var(--border)', display:'flex', gap:6, alignItems:'center' }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width:6, height:6, borderRadius:'50%', background:'var(--primary)', animation:`blink 1.2s ease-in-out ${j*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} className="btn btn-sm btn-secondary" style={{ fontSize:11 }}>
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ display:'flex', gap:10 }}>
          <input className="input-field" style={{ flex:1 }} placeholder="Ask VeriBot anything…"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}
            style={{ padding:'14px 20px', flexShrink:0 }}>
            {loading ? <Spinner size={18} color="#fff" /> : '➤'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
