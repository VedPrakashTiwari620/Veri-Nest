/**
 * Liveness AI v5 — Anti-spoof grade
 * Uses BlazeFace detection PROBABILITY for blink (drops when eyes close)
 * Photo on screen: probability stays constant → blink NOT detected
 * Head turn: reliable nose-yaw from 6 landmarks
 * Mouth motion: only counted during smile challenge with high threshold
 */

import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

let model = null;
let modelLoading = false;

export async function loadModel() {
  if (model) return model;
  if (modelLoading) {
    while (modelLoading) await new Promise(r => setTimeout(r, 100));
    return model;
  }
  modelLoading = true;
  try {
    await tf.setBackend('webgl');
    await tf.ready();
    model = await blazeface.load();
    console.log('✅ BlazeFace WebGL');
  } catch {
    try {
      await tf.setBackend('cpu');
      await tf.ready();
      model = await blazeface.load();
      console.log('✅ BlazeFace CPU');
    } catch (e) {
      console.error('Model load failed', e);
    }
  } finally {
    modelLoading = false;
  }
  return model;
}

// Mouth region pixel diff for smile detection
const _mouthPrev = { data: null };

function mouthRegionDiff(ctx, x1, y1, fw, fh, vw, vh) {
  const mx = Math.max(0, Math.floor(x1 + fw * 0.25));
  const my = Math.max(0, Math.floor(y1 + fh * 0.62));
  const mw = Math.min(Math.floor(fw * 0.50), vw - mx);
  const mh = Math.min(Math.floor(fh * 0.22), vh - my);
  if (mw < 2 || mh < 2) return 0;

  let curr;
  try { curr = ctx.getImageData(mx, my, mw, mh).data; } catch { return 0; }

  const prev = _mouthPrev.data;
  _mouthPrev.data = curr.slice();
  if (!prev || prev.length !== curr.length) return 0;

  let diff = 0;
  for (let i = 0; i < curr.length; i += 4) {
    diff += Math.abs(curr[i]   - prev[i]);
    diff += Math.abs(curr[i+1] - prev[i+1]);
    diff += Math.abs(curr[i+2] - prev[i+2]);
  }
  return diff / (curr.length / 4 * 3); // avg per pixel
}

export function resetMotion() {
  _mouthPrev.data = null;
}

// ─── analyzeFrame ───────────────────────────────────────────────────
export async function analyzeFrame(videoEl, offscreenCanvas) {
  if (!model || !videoEl || videoEl.readyState < 2) return null;
  const vw = videoEl.videoWidth;
  const vh = videoEl.videoHeight;
  if (!vw || !vh) return null;

  let ctx = null;
  if (offscreenCanvas) {
    offscreenCanvas.width  = vw;
    offscreenCanvas.height = vh;
    ctx = offscreenCanvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0);
  }

  try {
    // returnTensors=false, flipHorizontal=false, annotateBoxes=false
    const preds = await model.estimateFaces(videoEl, false);

    if (!preds.length) {
      // No face detected — useful signal (eyes fully closed = face may disappear)
      return { faceDetected: false, prob: 0 };
    }

    const face  = preds[0];
    const prob  = Array.isArray(face.probability) ? face.probability[0] : face.probability;
    const [x1, y1] = face.topLeft;
    const [x2, y2] = face.bottomRight;
    const fw = x2 - x1, fh = y2 - y1;

    // landmarks: rightEye[0], leftEye[1], nose[2], mouth[3]
    const lm = face.landmarks;
    const nose   = lm[2];
    const eyeMidX = (lm[0][0] + lm[1][0]) / 2;
    const yaw     = (nose[0] - eyeMidX) / fw; // negative=left, positive=right

    // Mouth motion (for smile challenge only)
    let mouthMotion = 0;
    if (ctx) {
      mouthMotion = mouthRegionDiff(ctx, x1, y1, fw, fh, vw, vh);
    }

    return {
      faceDetected: true,
      prob,                          // KEY: drops when eyes close (blink)
      yaw,
      lookingLeft:  yaw < -0.09,     // stricter threshold
      lookingRight: yaw >  0.09,
      mouthMotion,
    };
  } catch (e) {
    console.warn('analyzeFrame err:', e);
    return null;
  }
}

export function computeLivenessScore({ blinks, smileDetected, headMoved }) {
  let s = 30;
  s += Math.min(blinks, 2) * 25;   // 25 pts per blink, max 50
  s += smileDetected ? 12 : 0;
  s += headMoved     ?  8 : 0;
  return Math.min(s, 100);
}
