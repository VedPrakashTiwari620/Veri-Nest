import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isConfigured } from '../firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Persist auth state ─────────────────────────────────────── */
  useEffect(() => {
    if (!isConfigured) {
      const stored = localStorage.getItem('vn_user');
      if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Merge Firestore profile if it exists
        let profile = {};
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) profile = snap.data();
        } catch {}

        const userData = {
          uid:    firebaseUser.uid,
          mobile: firebaseUser.phoneNumber?.replace('+91', '') || '',
          role:   'resident',
          ...profile,
        };
        setUser(userData);
        localStorage.setItem('vn_user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('vn_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ── Send OTP (real Firebase) ───────────────────────────────── */
  const sendOTP = async (mobile) => {
    if (!isConfigured)
      return { success: false, message: '⚠️ Firebase not configured. Check .env file.' };

    try {
      // Always recreate RecaptchaVerifier to avoid stale state
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });

      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${mobile}`,
        window.recaptchaVerifier,
      );
      window.confirmationResult = confirmation;
      return { success: true };
    } catch (err) {
      console.error('sendOTP error:', err);
      // Cleanup verifier on failure
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = null;
      }
      // Human-readable error messages
      let message = err.message;
      if (err.code === 'auth/unauthorized-domain')
        message = '❌ Domain not authorized in Firebase. Add your URL to Firebase → Auth → Settings → Authorized Domains.';
      else if (err.code === 'auth/too-many-requests')
        message = '⏳ Too many requests. Try again after some time.';
      else if (err.code === 'auth/invalid-phone-number')
        message = '❌ Invalid phone number format.';
      return { success: false, message };
    }
  };

  /* ── Verify OTP ─────────────────────────────────────────────── */
  const verifyOTP = async (mobile, otp) => {
    if (!isConfigured)
      return { success: false, message: '⚠️ Firebase not configured.' };

    if (!window.confirmationResult)
      return { success: false, message: '❌ OTP session expired. Please request OTP again.' };

    try {
      const result = await window.confirmationResult.confirm(otp);
      const uid    = result.user.uid;

      // Check if user already has a profile in Firestore
      let isNewUser = true;
      let profile   = {};
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          isNewUser = false;
          profile   = snap.data();
        }
      } catch {}

      const userData = {
        uid,
        mobile,
        role:   profile.role   || 'resident',
        name:   profile.name   || null,
        flat:   profile.flat   || null,
        tower:  profile.tower  || null,
        avatar: profile.avatar || null,
        residentId: profile.residentId || `RES_${mobile.slice(-4)}`,
        verified:   profile.verified   || false,
        trustScore: profile.trustScore || 0,
        isNewUser,
      };

      // Save / update Firestore profile
      await setDoc(doc(db, 'users', uid), {
        ...userData,
        lastLogin: new Date().toISOString(),
      }, { merge: true });

      return { success: true, user: userData, isNewUser };
    } catch (err) {
      console.error('verifyOTP error:', err);
      let message = 'Invalid OTP. Please try again.';
      if (err.code === 'auth/code-expired')
        message = '⏳ OTP expired. Please request a new one.';
      else if (err.code === 'auth/invalid-verification-code')
        message = '❌ Wrong OTP. Check the SMS and try again.';
      return { success: false, message };
    }
  };

  /* ── Helpers ────────────────────────────────────────────────── */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('vn_user', JSON.stringify(userData));
  };

  const logout = async () => {
    if (isConfigured) { try { await signOut(auth); } catch {} }
    setUser(null);
    localStorage.removeItem('vn_user');
    localStorage.removeItem('vn_verified');
  };

  const updateProfile = async (profileData) => {
    const updated = { ...user, ...profileData, isNewUser: false };
    setUser(updated);
    localStorage.setItem('vn_user', JSON.stringify(updated));
    if (isConfigured && updated.uid) {
      try {
        await setDoc(doc(db, 'users', updated.uid), updated, { merge: true });
      } catch {}
    }
  };

  const setVerified = (verificationData) => {
    const updated = { ...user, verified: true, trustScore: verificationData.trustScore, verificationData };
    setUser(updated);
    localStorage.setItem('vn_user', JSON.stringify(updated));
    localStorage.setItem('vn_verified', 'true');
    if (isConfigured && updated.uid) {
      try { setDoc(doc(db, 'users', updated.uid), updated, { merge: true }); } catch {}
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, verifyOTP, login, logout, setVerified, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
