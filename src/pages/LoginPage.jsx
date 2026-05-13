import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OTPInput, Spinner } from '../components/UI';
import { toast } from '../components/UI';

const SLIDE_DATA = [
  { icon: '🏘️', title: 'Smart Community Living', subtitle: 'AI-powered verification and management for your residential society.' },
  { icon: '🛡️', title: 'Secure & Verified',       subtitle: 'Face recognition, liveness detection and GPS verification for every resident.' },
  { icon: '🤖', title: 'AI-Powered Assistant',    subtitle: 'Your 24/7 community bot for complaints, visitors, events and more.' },
];

export default function LoginPage() {
  const [stage, setStage]     = useState('intro');   // intro | phone | otp
  const [slide, setSlide]     = useState(0);
  const [mobile, setMobile]   = useState('');
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer]     = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState(null); // For new users
  const [isKnownUser, setIsKnownUser] = useState(true);
  const { sendOTP, verifyOTP, login } = useAuth();
  const navigate = useNavigate();

  // Slide auto-advance
  useEffect(() => {
    if (stage !== 'intro') return;
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDE_DATA.length), 3000);
    return () => clearInterval(t);
  }, [stage]);

  // OTP countdown
  useEffect(() => {
    if (stage !== 'otp') return;
    setTimer(30); setCanResend(false);
    const t = setInterval(() => {
      setTimer(p => { if (p <= 1) { clearInterval(t); setCanResend(true); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [stage]);

  const handleSendOTP = async () => {
    if (mobile.length !== 10) { toast.error('Enter valid 10-digit mobile number'); return; }
    setLoading(true);
    const res = await sendOTP(mobile);
    setLoading(false);
    if (res.success) {
      setIsKnownUser(!!res.isKnown);
      if (res.generatedOTP) setGeneratedOTP(res.generatedOTP);
      else setGeneratedOTP(null);
      toast.success('OTP sent successfully!');
      setStage('otp');
    } else toast.error(res.message || 'Failed to send OTP');
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    const res = await verifyOTP(mobile, otp);
    setLoading(false);
    if (res.success) {
      login(res.user);
      if (res.isNewUser || res.user.isNewUser) {
        toast.success('Welcome to Veri-Nest! Let\'s set up your profile.');
        navigate('/profile-setup');
      } else {
        toast.success(`Welcome back, ${res.user.name}!`);
        const verified = localStorage.getItem('vn_verified');
        navigate(verified ? '/dashboard' : '/verify');
      }
    } else toast.error(res.message || 'Invalid OTP');
  };

  const cur = SLIDE_DATA[slide];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--gradient-hero)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      {/* Background orbs */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,170,0.10) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            width:72, height:72, borderRadius:20, background:'var(--gradient-primary)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            fontSize:32, marginBottom:16, boxShadow:'0 8px 32px rgba(108,99,255,0.4)',
          }} className="animate-float">🏘️</div>
          <div style={{ fontSize:32, fontWeight:900, letterSpacing:'-1px' }}>
            Veri<span style={{ color:'var(--primary)' }}>Nest</span>
          </div>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>Smart Community Platform</div>
        </div>

        <div className="card" style={{ padding:32 }}>
          {/* Intro Stage */}
          {stage === 'intro' && (
            <div className="animate-fade" style={{ textAlign:'center' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>{cur.icon}</div>
              <h2 style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>{cur.title}</h2>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.6, marginBottom:24 }}>{cur.subtitle}</p>
              {/* Slide dots */}
              <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:32 }}>
                {SLIDE_DATA.map((_, i) => (
                  <div key={i} onClick={() => setSlide(i)} style={{
                    width: i === slide ? 20 : 6, height:6, borderRadius:'var(--radius-full)',
                    background: i === slide ? 'var(--primary)' : 'var(--border)', transition:'var(--transition)', cursor:'pointer',
                  }} />
                ))}
              </div>
              <button className="btn btn-primary btn-lg w-full" onClick={() => setStage('phone')}>
                Get Started 🚀
              </button>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:16 }}>
                🔐 Demo Mode · Mock Verification Enabled
              </p>
            </div>
          )}

          {/* Phone Stage */}
          {stage === 'phone' && (
            <div className="animate-fade">
              <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Enter Mobile Number</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:24 }}>We'll send you a real OTP via SMS</p>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <div style={{
                  padding:'0 14px', background:'var(--bg-card2)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', gap:6,
                  fontSize:14, fontWeight:600, whiteSpace:'nowrap',
                }}>🇮🇳 +91</div>
                <input className="input-field" style={{ flex:1 }} placeholder="Mobile number"
                  value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,'').slice(0,10))}
                  onKeyDown={e => e.key === 'Enter' && handleSendOTP()} type="tel" />
              </div>
              
              <div id="recaptcha-container" style={{ margin: '10px 0', display: 'flex', justifyContent: 'center' }}></div>
              
              <button className="btn btn-primary w-full" onClick={handleSendOTP} disabled={loading || mobile.length !== 10}>
                {loading ? <Spinner size={18} color="#fff" /> : 'Send OTP →'}
              </button>
              <button className="btn btn-ghost w-full" style={{ marginTop:8 }} onClick={() => setStage('intro')}>← Back</button>
            </div>
          )}

          {/* OTP Stage */}
          {stage === 'otp' && (
            <div className="animate-fade">
              <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Verify OTP</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:8 }}>
                Sent to +91 {mobile}
              </p>
              {generatedOTP && (
                <div style={{
                  background:'rgba(107,203,119,0.1)', border:'1px solid rgba(107,203,119,0.3)',
                  borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:20,
                  display:'flex', alignItems:'center', gap:8,
                }}>
                  <span style={{ fontSize:22 }}>🆕</span>
                  <div>
                    <div style={{ fontSize:12, color:'var(--success)', fontWeight:700 }}>New User Detected</div>
                    <div style={{ fontSize:16, fontWeight:800, letterSpacing:4, color:'var(--text-primary)' }}>{generatedOTP}</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)' }}>Use this OTP to register (Demo Mode)</div>
                  </div>
                </div>
              )}
              <OTPInput value={otp} onChange={setOtp} length={6} />
              <div style={{ textAlign:'center', margin:'16px 0' }}>
                {canResend
                  ? <button className="btn btn-ghost" onClick={() => { setOtp(''); handleSendOTP(); }}>Resend OTP</button>
                  : <span style={{ fontSize:13, color:'var(--text-muted)' }}>Resend in {timer}s</span>
                }
              </div>
              <button className="btn btn-primary w-full" onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                {loading ? <Spinner size={18} color="#fff" /> : 'Verify & Login ✓'}
              </button>
              <button className="btn btn-ghost w-full" style={{ marginTop:8 }} onClick={() => { setStage('phone'); setOtp(''); }}>← Change Number</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
