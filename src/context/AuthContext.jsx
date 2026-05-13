import { createContext, useContext, useState, useEffect } from 'react';
import { auth, isConfigured } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      // Fallback for demo mode
      const stored = localStorage.getItem('vn_user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
      setLoading(false);
      return;
    }

    // Real Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const stored = localStorage.getItem('vn_user');
        let localData = stored ? JSON.parse(stored) : {};
        setUser({
          ...localData,
          uid: firebaseUser.uid,
          mobile: firebaseUser.phoneNumber?.replace('+91', '') || localData.mobile,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendOTP = async (mobile, recaptchaContainerId = 'recaptcha-container') => {
    if (!isConfigured) return { success: false, message: 'Firebase not configured' };
    
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
      
      const confirmationResult = await signInWithPhoneNumber(auth, `+91${mobile}`, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.message };
    }
  };

  const verifyOTP = async (mobile, otp) => {
    if (!isConfigured) return { success: false, message: 'Firebase not configured' };

    try {
      if (!window.confirmationResult) throw new Error("No OTP requested");
      const result = await window.confirmationResult.confirm(otp);
      
      const userData = {
        mobile,
        uid: result.user.uid,
        role: 'resident',
        residentId: `RES_${mobile.slice(-4)}`,
        isNewUser: true, // You can check Firestore here if they exist
        verified: false,
      };
      return { success: true, user: userData, isNewUser: true };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('vn_user', JSON.stringify(userData));
  };

  const logout = async () => {
    if (isConfigured) await signOut(auth);
    setUser(null);
    localStorage.removeItem('vn_user');
    localStorage.removeItem('vn_verified');
  };

  const updateProfile = (profileData) => {
    const updated = { ...user, ...profileData, isNewUser: false };
    setUser(updated);
    localStorage.setItem('vn_user', JSON.stringify(updated));
  };

  const setVerified = (verificationData) => {
    const updated = { ...user, verified: true, trustScore: verificationData.trustScore, verificationData };
    setUser(updated);
    localStorage.setItem('vn_user', JSON.stringify(updated));
    localStorage.setItem('vn_verified', 'true');
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
