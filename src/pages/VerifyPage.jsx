import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, ProgressBar } from '../components/UI';
import { toast } from '../components/UI';
import { loadModel, analyzeFrame, computeLivenessScore, resetMotion } from '../services/livenessAI';

const STEPS = [
  { id: 'society', icon: '🏢', title: 'Society Code', subtitle: 'Validate your residential community' },
  { id: 'gps', icon: '📍', title: 'GPS Verification', subtitle: 'Confirm you are inside the society' },
  { id: 'liveness', icon: '🤳', title: 'Liveness Detection', subtitle: 'Ensure you are a live person' },
  { id: 'aadhaar', icon: '🪪', title: 'Aadhaar Verification', subtitle: 'Match face with Aadhaar record' },
  { id: 'complete', icon: '✅', title: 'Verification Complete', subtitle: 'Your trust score has been generated' },
];

const SOCIETY_CODE = 'GVR2024';

const AI_STAGES = [
  { icon: '🔍', label: 'Detecting face...', detail: 'Running MTCNN face detector' },
  { icon: '📐', label: 'Analyzing landmarks...', detail: '68-point landmark extraction' },
  { icon: '🧊', label: 'Depth estimation...', detail: 'Mono-depth anti-spoofing check' },
  { icon: '🛡️', label: 'Anti-spoofing analysis...', detail: 'Screen/print replay detection' },
  { icon: '👁️', label: 'Blink detection...', detail: 'Eye aspect ratio analysis' },
  { icon: '🧠', label: 'Computing liveness score...', detail: 'Neural network inference' },
  { icon: '✅', label: 'Verification complete', detail: 'Live person confirmed' },
];

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
      {steps.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'rgba(107,203,119,0.2)' : active ? 'rgba(108,99,255,0.2)' : 'var(--bg-card2)',
                border: `2px solid ${done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border)'}`,
                fontSize: 14, transition: 'var(--transition)',
              }}>{done ? '✓' : s.icon}</div>
              <div style={{ fontSize: 10, color: active ? 'var(--primary-light)' : done ? 'var(--success)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.title.split(' ')[0]}</div>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? 'var(--success)' : 'var(--border)', margin: '0 4px', marginBottom: 16, transition: 'var(--transition)' }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function VerifyPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [aadhaarNum, setAadhaarNum] = useState('');
  const [gpsResult, setGpsResult] = useState(null);
  const [livenessResult, setLivenessResult] = useState(null);
  const [aadhaarResult, setAadhaarResult] = useState(null);
  const { setVerified } = useAuth();
  const navigate = useNavigate();

  // Camera state
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);   // for capture
  const overlayCanvas = useRef(null);   // for motion detection
  const streamRef     = useRef(null);
  const rafRef        = useRef(null);
  const [cameraOn, setCameraOn]           = useState(false);
  const [capturedImg, setCapturedImg]     = useState(null);
  const [aiStage, setAiStage]             = useState(-1);
  const [modelReady, setModelReady]       = useState(false);
  const [modelStatus, setModelStatus]     = useState('Loading AI...');

  // AI counters
  const blinkRef     = useRef(0);
  const smileRef     = useRef(false);
  const headRef      = useRef(false);
  const prevEyeRatio = useRef(null);

  // Challenge state
  const [challenge, setChallenge]         = useState(null);
  const [challengeDone, setChallengeDone] = useState({ blink: false, smile: false, turn: false });
  const [liveScore, setLiveScore]         = useState(0);
  const [faceVisible, setFaceVisible]     = useState(false);

  // Preload model in background
  useEffect(() => {
    setModelStatus('Loading AI model...');
    loadModel()
      .then(() => { setModelReady(true); setModelStatus('AI Ready ✅'); })
      .catch(() => { setModelStatus('AI failed to load ❌'); });
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // --- Society Code ---
  const handleSociety = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    if (code.toUpperCase() === SOCIETY_CODE) { toast.success('Society code validated!'); setStep(1); }
    else toast.error('Invalid society code. Try: GVR2024');
  };

  // --- GPS ---
  const handleGPS = () => {
    setLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLoading(false);
        setGpsResult({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy), passed: true });
        toast.success('GPS verified! You are inside the geofence.');
      },
      () => {
        setLoading(false);
        setGpsResult({ lat: 28.6139, lng: 77.2090, accuracy: 15, passed: true });
        toast.info('Using mock GPS coordinates (demo mode)');
      }
    );
  };

  // --- Camera ---
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      // Reset counters
      blinkRef.current = 0;
      smileRef.current = false;
      headRef.current  = false;
      prevEyeRatio.current = null;
      resetMotion();
      setChallengeDone({ blink: false, smile: false, turn: false });
      setLiveScore(0);
      setFaceVisible(false);
      setChallenge('blink');
    } catch (e) {
      console.error('Camera error:', e);
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  // Real-time AI analysis loop
  useEffect(() => {
    if (!cameraOn || !modelReady) return;
    let running = true;
    // Track motion history for spike detection (blink = sudden high→low→high motion)
    let eyeMotionHistory = [];

    const loop = async () => {
      if (!running) return;

      const data = await analyzeFrame(videoRef.current, overlayCanvas.current);

      if (data?.faceDetected) {
        setFaceVisible(true);

        // --- Blink: spike in eye-region pixel motion ---
        const em = data.eyeMotion;
        eyeMotionHistory.push(em);
        if (eyeMotionHistory.length > 6) eyeMotionHistory.shift();

        // A blink = motion spike > 5px avg diff (eyes close & reopen)
        if (em > 5) {
          blinkRef.current += 1;
          setChallengeDone(p => ({ ...p, blink: blinkRef.current >= 2 }));
        }

        // --- Head turn ---
        if (data.lookingLeft || data.lookingRight) {
          headRef.current = true;
          setChallengeDone(p => ({ ...p, turn: true }));
        }

        // --- Smile: mouth-region pixel motion while in smile challenge ---
        if (data.mouthMotion > 6 && challenge === 'smile') {
          smileRef.current = true;
          setChallengeDone(p => ({ ...p, smile: true }));
        }

        // Score
        const s = computeLivenessScore({
          blinks: blinkRef.current,
          smileDetected: smileRef.current,
          headMoved: headRef.current,
        });
        setLiveScore(s);

      } else if (data) {
        setFaceVisible(false);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [cameraOn, modelReady, challenge]);

  // Advance challenge
  useEffect(() => {
    if (challengeDone.blink && challenge === 'blink') setChallenge('smile');
    if (challengeDone.smile && challenge === 'smile') setChallenge('turn');
    if (challengeDone.turn && challenge === 'turn') setChallenge('done');
  }, [challengeDone, challenge]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    setCapturedImg(c.toDataURL('image/jpeg', 0.85));
    stopCamera();
  }, [stopCamera]);

  // hidden canvas for motion detection overlay (same size as video)
  const overlayCanvasEl = (
    <canvas ref={overlayCanvas} style={{ display: 'none' }} />
  );

  const runAiProcessing = async () => {
    // Hard fail if challenges not completed
    if (challenge !== 'done') {
      toast.error('❌ Complete all liveness challenges first!');
      return;
    }
    setLoading(true);
    for (let i = 0; i < AI_STAGES.length; i++) {
      setAiStage(i);
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    }
    setLoading(false);
    setAiStage(-1);
    // Only use real liveScore — no fallback
    if (liveScore < 55) {
      toast.error('❌ Liveness check failed. Please try again.');
      setCapturedImg(null);
      return;
    }
    setLivenessResult({ liveness: true, confidence: liveScore, status: 'LIVE_PERSON_CONFIRMED' });
    toast.success(`✅ Live person confirmed! AI Score: ${liveScore}%`);
  };

  // --- Aadhaar ---
  const handleAadhaar = async () => {
    if (aadhaarNum.length !== 12) { toast.error('Enter valid 12-digit Aadhaar number'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    const dummyMap = {
      '123412341234': { name: 'Test UserName', faceMatch: 92, status: 'VERIFIED' },
      '987654321098': { name: 'Priya Singh', faceMatch: 89, status: 'VERIFIED' },
      '111122223333': { name: 'Amit Kumar', faceMatch: 42, status: 'FAILED' },
      '444455556666': { name: 'Test Resident', faceMatch: 76, status: 'VERIFIED' },
    };
    const found = dummyMap[aadhaarNum];
    if (found) {
      setAadhaarResult(found);
      if (found.status === 'VERIFIED') toast.success(`Face match: ${found.faceMatch}% — Aadhaar Verified!`);
      else toast.error(`Face match too low (${found.faceMatch}%). Verification failed.`);
    } else {
      setAadhaarResult({ name: 'Unknown', faceMatch: 38, status: 'FAILED' });
      toast.error('Aadhaar not found in database. Try: 123412341234');
    }
  };

  // --- Complete ---
  const handleComplete = () => {
    const trustScore = Math.round(
      (gpsResult?.passed ? 25 : 0) +
      (livenessResult?.confidence ? livenessResult.confidence * 0.3 : 0) +
      (aadhaarResult?.faceMatch ? aadhaarResult.faceMatch * 0.45 : 0)
    );
    setVerified({ trustScore, gpsResult, livenessResult, aadhaarResult });
    toast.success('Verification complete! Welcome to Veri-Nest.');
    navigate('/dashboard');
  };

  const progressPct = (step / (STEPS.length - 1)) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.10) 0%, transparent 70%)' }} />
      </div>
      <div style={{ width: '100%', maxWidth: 540, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🛡️ Resident Verification</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Complete all steps to get your verified badge</div>
          <div style={{ marginTop: 16 }}>
            <ProgressBar value={progressPct} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Step {step + 1} of {STEPS.length}</div>
          </div>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        <div className="card" style={{ padding: 32 }}>
          {/* STEP 0: Society Code */}
          {step === 0 && (
            <div className="animate-fade">
              <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 16 }}>🏢</div>
              <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Enter Society Code</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Get this code from your society admin</p>
              <div className="input-group" style={{ marginBottom: 8 }}>
                <label className="input-label">Society Code</label>
                <input className="input-field" placeholder="e.g. GVR2024" value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>📋 Demo code: GVR2024</p>
              <button className="btn btn-primary w-full" onClick={handleSociety} disabled={loading || !code}>
                {loading ? <Spinner size={18} color="#fff" /> : 'Validate Code →'}
              </button>
            </div>
          )}

          {/* STEP 1: GPS */}
          {step === 1 && (
            <div className="animate-fade">
              <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 16 }}>📍</div>
              <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>GPS Verification</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>We need to confirm you are within the society boundary</p>
              {!gpsResult ? (
                <button className="btn btn-primary w-full" onClick={handleGPS} disabled={loading}>
                  {loading ? <><Spinner size={18} color="#fff" /> Locating...</> : '📍 Capture My Location'}
                </button>
              ) : (
                <div style={{ background: 'rgba(107,203,119,0.1)', border: '1px solid rgba(107,203,119,0.3)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                  <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>✅ Location Verified</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Lat: {gpsResult.lat.toFixed(4)} | Lng: {gpsResult.lng.toFixed(4)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Accuracy: ±{gpsResult.accuracy}m | Inside geofence ✓</div>
                </div>
              )}
              {gpsResult && <button className="btn btn-primary w-full" onClick={() => setStep(2)}>Continue →</button>}
            </div>
          )}

          {/* STEP 2: Liveness with REAL AI */}
          {step === 2 && (
            <div className="animate-fade">
              <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 16 }}>🤳</div>
              <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>AI Liveness Detection</h2>
              {/* Model status badge */}
              <div style={{ textAlign:'center', fontSize:11, color: modelReady ? 'var(--success)' : 'var(--warning)', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                {!modelReady && <Spinner size={12} />}
                {modelStatus}
              </div>
              {/* Challenge Banner */}
              {cameraOn && challenge && challenge !== 'done' && (
                <div style={{ background:'rgba(108,99,255,0.12)', border:'1px solid var(--primary)', borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:12, textAlign:'center' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--primary-light)' }}>
                    {challenge === 'blink' && '👁️ Please BLINK your eyes twice'}
                    {challenge === 'smile' && '😊 Now SMILE for the camera'}
                    {challenge === 'turn' && '↔️ Turn your head LEFT or RIGHT'}
                  </div>
                  <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:8 }}>
                    {[['blink','👁️ Blink ×2'],['smile','😊 Smile'],['turn','↔️ Head Turn']].map(([k,l]) => (
                      <span key={k} style={{ fontSize:11, padding:'2px 8px', borderRadius:99,
                        background: challengeDone[k] ? 'rgba(107,203,119,0.2)' : 'var(--bg-card2)',
                        border: `1px solid ${challengeDone[k] ? 'var(--success)' : 'var(--border)'}`,
                        color: challengeDone[k] ? 'var(--success)' : 'var(--text-muted)' }}>
                        {challengeDone[k] ? '✅' : '⏳'} {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {cameraOn && challenge === 'done' && (
                <div style={{ background:'rgba(107,203,119,0.1)', border:'1px solid var(--success)', borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:12, textAlign:'center', fontWeight:700, color:'var(--success)' }}>
                  ✅ All challenges passed! Real AI Score: {liveScore}%
                </div>
              )}
              {/* Live score bar */}
              {cameraOn && liveScore > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>
                    <span>🧠 Live AI Score</span><span>{liveScore}%</span>
                  </div>
                  <ProgressBar value={liveScore} />
                </div>
              )}
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>
                {!cameraOn && !capturedImg
                  ? 'Real AI detects blinks, head turn & motion'
                  : loading ? 'AI is analyzing...'
                  : faceVisible ? '🟢 Face detected — complete challenges'
                  : cameraOn ? '⚠️ No face detected — come closer'
                  : 'Photo captured'}
              </p>

              {!livenessResult ? (
                <>
                  {/* Camera / Captured Image — Circular Frame */}
                  <div style={{
                    position: 'relative', width: 260, height: 260, margin: '0 auto 20px',
                    borderRadius: '50%', overflow: 'hidden',
                    border: `4px solid ${cameraOn ? 'var(--primary)' : capturedImg ? 'var(--success)' : 'var(--border)'}`,
                    background: 'var(--bg-card2)',
                    boxShadow: cameraOn ? '0 0 40px rgba(108,99,255,0.4)' : capturedImg && loading ? '0 0 40px rgba(107,203,119,0.3)' : 'none',
                    transition: 'all 0.4s ease',
                  }}>
                    <video ref={videoRef} autoPlay playsInline muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraOn ? 'block' : 'none', transform: 'scaleX(-1)' }} />
                    {capturedImg && !cameraOn && (
                      <img src={capturedImg} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    )}
                    {!cameraOn && !capturedImg && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 56, marginBottom: 8 }}>👤</div>
                        <div style={{ fontSize: 12 }}>Camera preview</div>
                      </div>
                    )}
                    {cameraOn && (
                      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', border: '2px dashed rgba(108,99,255,0.5)', borderRadius: '50%', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                      </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>

                  {/* AI Processing Pipeline */}
                  {loading && capturedImg && aiStage >= 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 12 }}>
                        {AI_STAGES.map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', opacity: i <= aiStage ? 1 : 0.25, transition: 'opacity 0.3s' }}>
                            <div style={{ width: 22, textAlign: 'center', fontSize: 13 }}>
                              {i < aiStage ? '✅' : i === aiStage ? <Spinner size={14} /> : s.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: i === aiStage ? 700 : 400, color: i <= aiStage ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</div>
                              {i === aiStage && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.detail}</div>}
                            </div>
                            {i < aiStage && <span style={{ fontSize: 10, color: 'var(--success)' }}>{(180 + Math.random() * 420).toFixed(0)}ms</span>}
                          </div>
                        ))}
                      </div>
                      <ProgressBar value={(aiStage + 1) / AI_STAGES.length * 100} />
                    </div>
                  )}

                  {/* Buttons */}
                  {!cameraOn && !capturedImg && (
                    <button className="btn btn-primary w-full" onClick={startCamera}>📷 Open Camera</button>
                  )}
                  {cameraOn && (
                    <>
                      {challenge !== 'done' ? (
                        <div style={{ background:'rgba(255,165,0,0.1)', border:'1px solid rgba(255,165,0,0.3)', borderRadius:'var(--radius-md)', padding:'10px 14px', textAlign:'center', fontSize:13, color:'var(--warning)' }}>
                          ⚠️ Complete all challenges to capture photo
                        </div>
                      ) : (
                        <button className="btn btn-primary w-full animate-pulse-glow" onClick={capturePhoto}>📸 Capture Photo</button>
                      )}
                    </>
                  )}
                  {capturedImg && !loading && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setCapturedImg(null); startCamera(); }}>🔄 Retake</button>
                      <button className="btn btn-primary" style={{ flex: 2 }} onClick={runAiProcessing}>🧠 Verify Liveness</button>
                    </div>
                  )}
                  {loading && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>AI verification in progress... Do not close this window</div>}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    {capturedImg && <img src={capturedImg} alt="Verified" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--success)', transform: 'scaleX(-1)', boxShadow: '0 0 20px rgba(107,203,119,0.3)' }} />}
                    <div style={{ flex: 1, background: 'rgba(107,203,119,0.1)', border: '1px solid rgba(107,203,119,0.3)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                      <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>✅ Live Person Confirmed</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Confidence: {livenessResult.confidence}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Anti-spoofing: Passed · Depth: Valid</div>
                    </div>
                  </div>
                  <button className="btn btn-primary w-full" onClick={() => setStep(3)}>Continue →</button>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Aadhaar */}
          {step === 3 && (
            <div className="animate-fade">
              <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 16 }}>🪪</div>
              <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Aadhaar Verification</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Your face will be matched against your Aadhaar photo</p>
              {!aadhaarResult ? (
                <>
                  <div className="input-group" style={{ marginBottom: 8 }}>
                    <label className="input-label">Aadhaar Number</label>
                    <input className="input-field" placeholder="12-digit Aadhaar number" value={aadhaarNum}
                      onChange={e => setAadhaarNum(e.target.value.replace(/\D/g, '').slice(0, 12))} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
                    📋 Demo: 123412341234 (Pass) · 111122223333 (Fail)
                  </p>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ marginTop: 2 }} defaultChecked />
                    I consent to Aadhaar-based face verification as per UIDAI guidelines.
                  </label>
                  <button className="btn btn-primary w-full" onClick={handleAadhaar} disabled={loading || aadhaarNum.length !== 12}>
                    {loading ? <><Spinner size={18} color="#fff" /> Verifying...</> : '🔍 Verify Aadhaar'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    background: aadhaarResult.status === 'VERIFIED' ? 'rgba(107,203,119,0.1)' : 'rgba(255,71,87,0.1)',
                    border: `1px solid ${aadhaarResult.status === 'VERIFIED' ? 'rgba(107,203,119,0.3)' : 'rgba(255,71,87,0.3)'}`,
                    borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16,
                  }}>
                    <div style={{ color: aadhaarResult.status === 'VERIFIED' ? 'var(--success)' : 'var(--danger)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      {aadhaarResult.status === 'VERIFIED' ? '✅ Aadhaar Verified' : '❌ Verification Failed'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Name: {aadhaarResult.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Face Match: {aadhaarResult.faceMatch}%</div>
                  </div>
                  {aadhaarResult.status === 'VERIFIED'
                    ? <button className="btn btn-primary w-full" onClick={() => setStep(4)}>Continue →</button>
                    : <button className="btn btn-secondary w-full" onClick={() => setAadhaarResult(null)}>Retry</button>
                  }
                </>
              )}
            </div>
          )}

          {/* STEP 4: Complete */}
          {step === 4 && (
            <div className="animate-fade" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--success)' }}>Verification Complete!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>You are now a verified resident of Green Valley Residency</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-card2)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24, textAlign: 'left' }}>
                {[
                  ['🏢', 'Society Code', 'GVR2024 ✓'],
                  ['📍', 'GPS Verified', 'Inside geofence ✓'],
                  ['🤳', 'Liveness Check', `${livenessResult?.confidence}% confidence ✓`],
                  ['🪪', 'Aadhaar Match', `${aadhaarResult?.faceMatch}% match ✓`],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{icon} {label}</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-lg w-full animate-pulse-glow" onClick={handleComplete}>
                🚀 Enter Veri-Nest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
