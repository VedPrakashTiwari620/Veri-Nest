/**
 * Liveness AI Service
 * Uses BlazeFace (Google) for face detection +
 * Canvas frame-differencing for real blink/motion detection
 * Reliable in all browsers, no MediaPipe dependency
 */

import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

let model = null;
let modelLoading = false;

export async function loadModel() {
  if (model) return model;
  if (modelLoading) {
    // Wait for existing load to finish
    while (modelLoading) await new Promise(r => setTimeout(r, 100));
    return model;
  }
  modelLoading = true;
  try {
    await tf.setBackend('webgl');
    await tf.ready();
    model = await blazeface.load();
    console.log('✅ BlazeFace model loaded');
  } catch (e) {
    console.warn('WebGL failed, trying CPU:', e);
    await tf.setBackend('cpu');
    await tf.ready();
    model = await blazeface.load();
    console.log('✅ BlazeFace loaded (CPU mode)');
  } finally {
    modelLoading = false;
  }
  return model;
}

// ─── Frame differencing for motion / blink detection ───────────────
let prevFrame = null;

export function detectMotion(canvas, regionY = 0, regionH = 1.0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const rY = Math.floor(h * regionY);
  const rH = Math.floor(h * regionH);
  const curr = ctx.getImageData(0, rY, w, rH);

  if (!prevFrame || prevFrame.length !== curr.data.length) {
    prevFrame = curr.data.slice();
    return 0;
  }

  let diff = 0;
  for (let i = 0; i < curr.data.length; i += 4) {
    diff += Math.abs(curr.data[i] - prevFrame[i]);       // R
    diff += Math.abs(curr.data[i + 1] - prevFrame[i + 1]); // G
    diff += Math.abs(curr.data[i + 2] - prevFrame[i + 2]); // B
  }
  prevFrame = curr.data.slice();
  const pixels = w * rH;
  return diff / (pixels * 3); // 0-255 average diff per pixel
}

// ─── Analyse a single video frame ──────────────────────────────────
export async function analyzeFrame(videoEl, overlayCanvas) {
  if (!model || !videoEl || videoEl.readyState < 2) return null;
  if (!videoEl.videoWidth) return null;

  // Draw frame to overlay canvas for motion detection
  if (overlayCanvas) {
    overlayCanvas.width  = videoEl.videoWidth;
    overlayCanvas.height = videoEl.videoHeight;
    overlayCanvas.getContext('2d').drawImage(videoEl, 0, 0);
  }

  try {
    const predictions = await model.estimateFaces(videoEl, false);
    if (!predictions.length) return { faceDetected: false };

    const face = predictions[0];
    const [, y1] = face.topLeft;
    const [, y2] = face.bottomRight;
    const faceH = y2 - y1;
    const faceW = (face.bottomRight[0] - face.topLeft[0]);

    // Landmarks: [rightEye, leftEye, nose, mouth, rightEar, leftEar]
    const landmarks = face.landmarks;
    const rightEye = landmarks[0];
    const leftEye  = landmarks[1];
    const mouth    = landmarks[3];

    // Eye openness proxy: distance between pupils / face height
    const eyeDist = Math.hypot(leftEye[0] - rightEye[0], leftEye[1] - rightEye[1]);
    const eyeRatio = eyeDist / faceH; // higher = eyes more open

    // Head yaw proxy: nose horizontal offset from eye midpoint
    const eyeMidX = (leftEye[0] + rightEye[0]) / 2;
    const nose    = landmarks[2];
    const yaw     = (nose[0] - eyeMidX) / faceW; // -0.5 left, +0.5 right

    // Motion in upper face region (blink proxy)
    let motionScore = 0;
    if (overlayCanvas) {
      const relY = (y1 / videoEl.videoHeight);
      const relH = (faceH / videoEl.videoHeight) * 0.5; // top half of face
      motionScore = detectMotion(overlayCanvas, relY, relH);
    }

    return {
      faceDetected: true,
      eyeRatio,                   // ~0.3+ = eyes open, <0.2 = blink
      blinkMotion: motionScore,   // >8 = significant eye movement
      yaw,                        // <-0.06 = left, >0.06 = right
      lookingLeft:  yaw < -0.06,
      lookingRight: yaw > 0.06,
      mouth,
      probability: face.probability[0],
    };
  } catch (e) {
    console.warn('analyzeFrame error:', e);
    return null;
  }
}

// ─── Compute final liveness score ──────────────────────────────────
export function computeLivenessScore({ blinks, smileDetected, headMoved }) {
  let score = 30;
  score += Math.min(blinks, 3) * 18;   // max 54 from blinks
  score += smileDetected ? 10 : 0;
  score += headMoved ? 6 : 0;
  return Math.min(score, 100);
}

export function resetMotion() {
  prevFrame = null;
}
