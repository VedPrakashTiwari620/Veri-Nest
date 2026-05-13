import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let model = null;

export async function loadModel() {
  if (model) return model;
  await tf.setBackend('webgl');
  await tf.ready();
  model = await faceLandmarksDetection.createDetector(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    { runtime: 'tfjs', refineLandmarks: true, maxFaces: 1 }
  );
  return model;
}

// Eye Aspect Ratio — blink detection
// Left eye landmarks: 159, 145, 33, 133  Right: 386, 374, 362, 263
function eyeAspectRatio(landmarks, indices) {
  const [p1, p2, p3, p4] = indices.map(i => landmarks[i]);
  const vert = Math.hypot(p2.x - p4.x, p2.y - p4.y);
  const horiz = Math.hypot(p1.x - p3.x, p1.y - p3.y);
  return vert / (horiz + 1e-6);
}

// Mouth Aspect Ratio — smile/open mouth
function mouthAspectRatio(landmarks) {
  const top = landmarks[13], bot = landmarks[14];
  const left = landmarks[61], right = landmarks[291];
  const vert = Math.hypot(top.x - bot.x, top.y - bot.y);
  const horiz = Math.hypot(left.x - right.x, left.y - right.y);
  return vert / (horiz + 1e-6);
}

// Head pose — nose tip vs face center
function headPose(landmarks) {
  const nose = landmarks[1];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const faceCenter = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
  return { yaw: nose.x - faceCenter.x, pitch: nose.y - faceCenter.y };
}

export async function analyzeFrame(videoEl) {
  if (!model || !videoEl || videoEl.readyState < 2) return null;
  try {
    const faces = await model.estimateFaces(videoEl);
    if (!faces.length) return { faceDetected: false };
    const lm = faces[0].keypoints;

    const leftEAR  = eyeAspectRatio(lm, [159, 145, 33, 133]);
    const rightEAR = eyeAspectRatio(lm, [386, 374, 362, 263]);
    const avgEAR   = (leftEAR + rightEAR) / 2;
    const mar      = mouthAspectRatio(lm);
    const pose     = headPose(lm);

    return {
      faceDetected: true,
      eyesClosed:   avgEAR < 0.2,
      ear:          avgEAR,
      smiling:      mar > 0.04,
      mar,
      yaw:          pose.yaw,
      pitch:        pose.pitch,
      lookingLeft:  pose.yaw < -8,
      lookingRight: pose.yaw > 8,
    };
  } catch {
    return null;
  }
}

export function computeLivenessScore({ blinks, smiles, headMoves }) {
  let score = 40;
  score += Math.min(blinks, 3) * 15;   // up to 45 pts for blinks
  score += smiles ? 10 : 0;
  score += headMoves ? 5 : 0;
  return Math.min(score, 100);
}
