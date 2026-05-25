import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';
import { ShieldCheck, Heart, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Settings, Bell, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  /* ── poll unread count silently every 30s ── */
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationAPI.getUnread();
      setUnreadCount(Array.isArray(data) ? data.length : 0);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [fetchUnreadCount]);

  /* close menu on route change */
  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const navLinkClass = (path: string) =>
    `text-sm font-semibold transition-all duration-200 hover:text-blood-500 ${
      isActive(path) ? 'text-blood-500 text-glow' : 'text-neutral-300'
    }`;

  /* ── Theme Toggle ── */
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-200 ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 hover:border-amber-500/40 hover:bg-amber-950/20 text-neutral-400 hover:text-amber-400'
          : 'bg-neutral-900 border-neutral-800 hover:border-sky-500/40 hover:bg-sky-950/20 text-neutral-400 hover:text-sky-400'
      }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );

  /* ── Bell Button (navigates to /notifications) ── */
  const BellButton = ({ small = false }: { small?: boolean }) => (
    <button
      onClick={() => navigate('/notifications')}
      className={`relative rounded-xl border transition-all duration-200 ${small ? 'p-1.5' : 'p-2'} ${
        isActive('/notifications')
          ? 'bg-blood-950/40 border-blood-600/50 text-blood-400'
          : 'bg-neutral-900 border-neutral-800 hover:border-blood-600/40 hover:bg-blood-950/20 text-neutral-400 hover:text-blood-400'
      }`}
      title="Notifications"
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blood-600 border-2 border-neutral-950 text-white text-[8px] font-extrabold flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-neutral-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-8 h-8 text-blood-600 fill-blood-600 animate-pulse-slow" />
              <div className="absolute inset-0 bg-blood-600 blur-md opacity-30 rounded-full group-hover:opacity-60 transition-opacity" />
            </div>
            <span className="text-xl font-extrabold tracking-wider text-neutral-100 uppercase">
              Red<span className="text-blood-500">Hope</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={navLinkClass('/')}>Home</Link>

            {isAuthenticated ? (
              <>
                {/* USER tabs: Dashboard + My Profile */}
                {!isAdmin && (
                  <>
                    <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
                    <Link to="/profile" className={navLinkClass('/profile')}>My Profile</Link>
                  </>
                )}

                {/* ADMIN tab */}
                {isAdmin && (
                  <Link to="/admin" className={`text-sm font-bold transition-all duration-200 hover:text-amber-400 flex items-center gap-1.5 ${
                    isActive('/admin') ? 'text-amber-400' : 'text-neutral-300'
                  }`}>
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-4 border-l border-neutral-800">
                  <ThemeToggle />
                  <BellButton />

                  {/* Avatar */}
                  <div className="flex items-center gap-2.5 pl-1">
                    {user?.profile?.profileUrl ? (
                      <img src={user.profile.profileUrl} alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border-2 border-blood-600/50 shadow-md" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blood-950/80 border border-blood-500/30 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-blood-400" />
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-neutral-200 line-clamp-1 max-w-[120px]">{user?.name}</span>
                      <span className="text-[10px] text-neutral-400">
                        {isAdmin ? '🛡️ Admin' : (user?.profile?.bloodGroup || 'Not set')}
                      </span>
                    </div>
                  </div>

                  <button onClick={handleLogout}
                    className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-blood-600/50 hover:bg-blood-950/30 text-neutral-400 hover:text-blood-400 transition-all duration-200"
                    title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-neutral-200 hover:text-white transition-colors">Log In</Link>
                <Link to="/signup"
                  className="px-5 py-2.5 text-sm font-bold bg-blood-600 hover:bg-blood-700 text-white rounded-xl shadow-lg shadow-blood-600/25 transition-all duration-200 hover:-translate-y-0.5">
                  Join as Donor
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right icons */}
          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle />
            {isAuthenticated && <BellButton small />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-900 bg-neutral-950/95 backdrop-blur-lg animate-slide-in">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-semibold ${isActive('/') ? 'bg-blood-950/30 text-blood-500 border-l-4 border-blood-500' : 'text-neutral-300 hover:bg-neutral-900'}`}>
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {/* USER-only mobile links */}
                {!isAdmin && (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-3 rounded-lg text-base font-semibold ${isActive('/dashboard') ? 'bg-blood-950/30 text-blood-500 border-l-4 border-blood-500' : 'text-neutral-300 hover:bg-neutral-900'}`}>
                      <div className="flex items-center gap-2"><LayoutDashboard className="w-5 h-5" /> Dashboard</div>
                    </Link>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-3 rounded-lg text-base font-semibold ${isActive('/profile') ? 'bg-blood-950/30 text-blood-500 border-l-4 border-blood-500' : 'text-neutral-300 hover:bg-neutral-900'}`}>
                      <div className="flex items-center gap-2"><Settings className="w-5 h-5" /> My Profile</div>
                    </Link>
                  </>
                )}

                {/* ADMIN-only mobile link */}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-3 rounded-lg text-base font-semibold ${isActive('/admin') ? 'bg-amber-950/30 text-amber-400 border-l-4 border-amber-500' : 'text-neutral-300 hover:bg-neutral-900'}`}>
                    <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-400" /> Admin Panel</div>
                  </Link>
                )}

                {/* Notifications — both USER and ADMIN */}
                <Link to="/notifications" onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-semibold ${isActive('/notifications') ? 'bg-blood-950/30 text-blood-500 border-l-4 border-blood-500' : 'text-neutral-300 hover:bg-neutral-900'}`}>
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blood-600 text-white text-[10px] font-extrabold">{unreadCount}</span>
                    )}
                  </div>
                </Link>

                <div className="pt-4 pb-2 border-t border-neutral-900 mt-4 px-3">
                  <div className="flex items-center gap-3 mb-4">
                    {user?.profile?.profileUrl ? (
                      <img src={user.profile.profileUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-blood-500" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blood-950 border border-blood-500/20 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blood-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-neutral-200">{user?.name}</div>
                      <div className="text-xs text-neutral-400">Group: {user?.profile?.bloodGroup || 'Not set'}</div>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blood-950/40 hover:bg-blood-900/40 border border-blood-800/40 hover:border-blood-600 text-blood-400 font-bold transition-all duration-200">
                    <LogOut className="w-5 h-5" /> Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t border-neutral-900 mt-4 px-3 space-y-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3 text-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 font-bold transition-all duration-200">
                  Log In
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3 text-center rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-bold shadow-lg shadow-blood-600/20 transition-all duration-200">
                  Join as Donor
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
