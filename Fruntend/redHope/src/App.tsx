import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';
import { Loader2 } from 'lucide-react';

/* ─── Loading Spinner ─── */
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-neutral-400 gap-3" style={{ backgroundColor: 'var(--surface-bg)' }}>
    <Loader2 className="w-10 h-10 animate-spin text-blood-500" />
    <span className="text-sm font-semibold tracking-wider">Syncing RedHope session...</span>
  </div>
);

/* ─── ProtectedRoute: must be logged in ─── */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/* ─── UserRoute: logged in AND NOT admin
       Admins who try to visit /dashboard are sent to /admin instead ─── */
const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;   // admin blocked from user pages
  return <>{children}</>;
};

/* ─── AdminRoute: logged in AND must be ADMIN
       Regular users who try /admin are sent to /dashboard ─── */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;  // user blocked from admin
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div
              className="flex flex-col min-h-screen text-neutral-100 selection:bg-blood-600 selection:text-white"
              style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)' }}
            >
              <Navbar />

              <main className="flex-grow">
                <Routes>
                  {/* ── Public ── */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* ── USER-only routes (admins redirected to /admin) ── */}
                  <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />

                  {/* ── Shared protected (both USER and ADMIN can access) ── */}
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />


                  {/* ── ADMIN-only route (users redirected to /dashboard) ── */}
                  <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

                  {/* ── Fallback ── */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-500" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <p>&copy; {new Date().getFullYear()} RedHope Network. All rights reserved. Connecting Donors, Saving Lives.</p>
                </div>
              </footer>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
