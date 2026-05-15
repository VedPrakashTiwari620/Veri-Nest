/**
 * Liveness AI — v4 (production reliable)
 * • BlazeFace for face + head-turn detection
 * • Per-region canvas motion with proper spike+cooldown for blink
 * • Mouth-region motion for smile
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

// Region motion — returns avg pixel diff 0-255
function regionMotion(ctx, key, x, y, w, h) {
  if (w < 2 || h < 2) return 0;
  x = Math.max(0, Math.floor(x));
  y = Math.max(0, Math.floor(y));
  w = Math.floor(w);
  h = Math.floor(h);
  let pixels;
  try { pixels = ctx.getImageData(x, y, w, h).data; } catch { return 0; }

  const cache = regionMotion._cache || (regionMotion._cache = {});
  const prev = cache[key];
  cache[key] = pixels.slice();
  if (!prev || prev.length !== pixels.length) return 0;

  let diff = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    diff += Math.abs(pixels[i]   - prev[i]);
    diff += Math.abs(pixels[i+1] - prev[i+1]);
    diff += Math.abs(pixels[i+2] - prev[i+2]);
  }
  return diff / (pixels.length / 4 * 3);
}

export function resetMotion() {
  regionMotion._cache = {};
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
    const preds = await model.estimateFaces(videoEl, false);
    if (!preds.length) return { faceDetected: false };

    const face  = preds[0];
    const [x1, y1] = face.topLeft;
    const [x2, y2] = face.bottomRight;
    const fw = x2 - x1, fh = y2 - y1;

    // landmarks: rightEye[0], leftEye[1], nose[2], mouth[3]
    const lm   = face.landmarks;
    const nose = lm[2];

    // Head yaw
    const eyeMidX = (lm[0][0] + lm[1][0]) / 2;
    const yaw     = (nose[0] - eyeMidX) / fw;

    let eyeMotion   = 0;
    let mouthMotion = 0;

    if (ctx) {
      // Eye region: upper 30% of face, full width
      const ey = y1 + fh * 0.12;
      const eh = fh * 0.28;
      eyeMotion = regionMotion(ctx, 'eye', x1, ey, fw, eh);

      // Mouth region: lower 30%
      const my = y1 + fh * 0.62;
      const mh = fh * 0.28;
      mouthMotion = regionMotion(ctx, 'mouth', x1, my, fw, mh);
    }

    return {
      faceDetected: true,
      eyeMotion,
      mouthMotion,
      yaw,
      lookingLeft:  yaw < -0.07,
      lookingRight: yaw >  0.07,
      prob: face.probability[0],
    };
  } catch (e) {
    console.warn('analyzeFrame err:', e);
    return null;
  }
}

export function computeLivenessScore({ blinks, smileDetected, headMoved }) {
  let s = 30;
  s += Math.min(blinks, 3) * 18;
  s += smileDetected ? 10 : 0;
  s += headMoved     ?  6 : 0;
  return Math.min(s, 100);
}
