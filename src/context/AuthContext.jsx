import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vn_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const sendOTP = async (mobile) => {
    await new Promise(r => setTimeout(r, 1200));
    const found = MOCK_USERS.find(u => u.mobile === mobile);
    if (found) {
      return { success: true, testMode: true, isKnown: true, message: 'OTP sent successfully' };
    }
    // New user - generate random 6-digit OTP and store in sessionStorage
    const generatedOTP = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem(`otp_${mobile}`, generatedOTP);
    return { success: true, testMode: true, isKnown: false, generatedOTP, message: 'OTP sent successfully' };
  };

  const verifyOTP = async (mobile, otp) => {
    await new Promise(r => setTimeout(r, 1000));
    const found = MOCK_USERS.find(u => u.mobile === mobile && u.otp === otp);
    if (found) {
      const userData = {
        ...found,
        token: `jwt_mock_${Date.now()}`,
        loginTime: new Date().toISOString(),
        isNewUser: false,
      };
      return { success: true, user: userData };
    }
    const stored = sessionStorage.getItem(`otp_${mobile}`);
    if (stored && stored === otp) {
      sessionStorage.removeItem(`otp_${mobile}`);
      const userData = {
        mobile,
        role: 'resident',
        name: null,
        residentId: `RES_${mobile.slice(-4)}_${Date.now().toString().slice(-4)}`,
        flat: null,
        tower: null,
        token: `jwt_mock_${Date.now()}`,
        loginTime: new Date().toISOString(),
        isNewUser: true,
        verified: false,
      };
      return { success: true, user: userData, isNewUser: true };
    }
    return { success: false, message: 'Invalid OTP. Please try again.' };
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('vn_user', JSON.stringify(userData));
  };

  const logout = () => {
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
