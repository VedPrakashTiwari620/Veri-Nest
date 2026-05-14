/**
 * Liveness AI Service v3
 * BlazeFace for face/head detection
 * Eye-region pixel motion for blink detection (works with BlazeFace 6 landmarks)
 * Mouth-region pixel motion for smile detection
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
    console.log('✅ BlazeFace loaded (WebGL)');
  } catch {
    try {
      await tf.setBackend('cpu');
      await tf.ready();
      model = await blazeface.load();
      console.log('✅ BlazeFace loaded (CPU)');
    } catch (e) {
      console.error('BlazeFace load failed:', e);
    }
  } finally {
    modelLoading = false;
  }
  return model;
}

// ─── Per-region motion tracker ─────────────────────────────────────
const regionHistory = {};

function getRegionMotion(ctx, key, x, y, w, h) {
  if (w <= 0 || h <= 0) return 0;
  let curr;
  try { curr = ctx.getImageData(x, y, w, h); } catch { return 0; }

  const prev = regionHistory[key];
  regionHistory[key] = curr.data.slice();

  if (!prev || prev.length !== curr.data.length) return 0;

  let diff = 0;
  for (let i = 0; i < curr.data.length; i += 4) {
    diff += Math.abs(curr.data[i]   - prev[i]);
    diff += Math.abs(curr.data[i+1] - prev[i+1]);
    diff += Math.abs(curr.data[i+2] - prev[i+2]);
  }
  return diff / (curr.data.length / 4 * 3); // avg diff per pixel (0-255)
}

// ─── Main frame analyser ────────────────────────────────────────────
export async function analyzeFrame(videoEl, overlayCanvas) {
  if (!model || !videoEl || videoEl.readyState < 2) return null;
  const vw = videoEl.videoWidth;
  const vh = videoEl.videoHeight;
  if (!vw || !vh) return null;

  // Draw current frame to overlay canvas
  let ctx = null;
  if (overlayCanvas) {
    overlayCanvas.width  = vw;
    overlayCanvas.height = vh;
    ctx = overlayCanvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0);
  }

  try {
    const preds = await model.estimateFaces(videoEl, false);
    if (!preds.length) return { faceDetected: false };

    const face = preds[0];
    const [x1, y1] = face.topLeft;
    const [x2, y2] = face.bottomRight;
    const faceW = x2 - x1;
    const faceH = y2 - y1;

    // BlazeFace landmarks: [rightEye, leftEye, nose, mouth, rightEar, leftEar]
    const lm = face.landmarks;
    const rightEye = lm[0]; // [x, y]
    const leftEye  = lm[1];
    const nose     = lm[2];
    const mouth    = lm[3];

    // ── Head yaw (horizontal turn) ───────────────────────────────
    const eyeMidX = (leftEye[0] + rightEye[0]) / 2;
    const yaw = (nose[0] - eyeMidX) / faceW;

    // ── Eye-region motion (blink) ────────────────────────────────
    let eyeMotion = 0;
    if (ctx) {
      const eyeRegionH = Math.max(4, Math.floor(faceH * 0.18));
      const eyeRegionW = Math.max(4, Math.floor(faceW * 0.70));
      const eyeRegionX = Math.max(0, Math.floor(x1 + faceW * 0.15));
      // Eyes sit in the upper ~35% of the face bounding box
      const eyeRegionY = Math.max(0, Math.floor(y1 + faceH * 0.20));

      eyeMotion = getRegionMotion(
        ctx, 'eyes',
        eyeRegionX, eyeRegionY,
        Math.min(eyeRegionW, vw - eyeRegionX),
        Math.min(eyeRegionH, vh - eyeRegionY),
      );
    }

    // ── Mouth-region motion (smile / open mouth) ─────────────────
    let mouthMotion = 0;
    if (ctx) {
      const mRegionH = Math.max(4, Math.floor(faceH * 0.18));
      const mRegionW = Math.max(4, Math.floor(faceW * 0.50));
      const mRegionX = Math.max(0, Math.floor(mouth[0] - mRegionW / 2));
      const mRegionY = Math.max(0, Math.floor(mouth[1] - mRegionH / 2));

      mouthMotion = getRegionMotion(
        ctx, 'mouth',
        mRegionX, mRegionY,
        Math.min(mRegionW, vw - mRegionX),
        Math.min(mRegionH, vh - mRegionY),
      );
    }

    return {
      faceDetected:  true,
      eyeMotion,                  // >6 = blink (significant eyelid movement)
      mouthMotion,                // >8 = mouth movement / smile
      yaw,                        // <-0.06 left, >0.06 right
      lookingLeft:   yaw < -0.06,
      lookingRight:  yaw >  0.06,
      probability:   face.probability[0],
    };
  } catch (e) {
    console.warn('analyzeFrame error:', e);
    return null;
  }
}

// ─── Score ──────────────────────────────────────────────────────────
export function computeLivenessScore({ blinks, smileDetected, headMoved }) {
  let score = 30;
  score += Math.min(blinks, 3) * 18;   // up to 54 pts
  score += smileDetected ? 10 : 0;
  score += headMoved     ?  6 : 0;
  return Math.min(score, 100);
}

export function resetMotion() {
  Object.keys(regionHistory).forEach(k => delete regionHistory[k]);
}
