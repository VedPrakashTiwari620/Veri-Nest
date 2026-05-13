import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/UI';

import LoginPage            from './pages/LoginPage';
import VerifyPage           from './pages/VerifyPage';
import DashboardPage        from './pages/DashboardPage';
import FeedPage             from './pages/FeedPage';
import VisitorsPage         from './pages/VisitorsPage';
import ComplaintsPage       from './pages/ComplaintsPage';
import MarketplacePage      from './pages/MarketplacePage';
import EventsPage           from './pages/EventsPage';
import AIAssistantPage      from './pages/AIAssistantPage';
import ProfilePage          from './pages/ProfilePage';
import ProfileSetupPage     from './pages/ProfileSetupPage';
import AdminPanelPage       from './pages/admin/AdminPanelPage';
import AdminResidentsPage   from './pages/admin/AdminResidentsPage';
import AdminAnalyticsPage   from './pages/admin/AdminAnalyticsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-dark)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🏘️</div>
        <div style={{ fontSize:14, color:'var(--text-muted)' }}>Loading Veri-Nest…</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"  element={user ? (user.isNewUser ? <Navigate to="/profile-setup" /> : <Navigate to="/dashboard" />) : <LoginPage />} />
      <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
      <Route path="/verify" element={<ProtectedRoute><VerifyPage /></ProtectedRoute>} />

      <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/feed"         element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/visitors"     element={<ProtectedRoute><VisitorsPage /></ProtectedRoute>} />
      <Route path="/complaints"   element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
      <Route path="/marketplace"  element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
      <Route path="/events"       element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      <Route path="/admin"               element={<ProtectedRoute requireAdmin><AdminPanelPage /></ProtectedRoute>} />
      <Route path="/admin/residents"     element={<ProtectedRoute requireAdmin><AdminResidentsPage /></ProtectedRoute>} />
      <Route path="/admin/analytics"     element={<ProtectedRoute requireAdmin><AdminAnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute requireAdmin><AdminAnnouncementsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ToastContainer />
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}
