import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';
import type { LoginDTO, SignupDTO, UserProfileUpdateDTO, UserProfileResponseDTO } from '../types';
import { useToast } from '../components/Toast';

/* ─── Types ─── */
export type UserRole = 'USER' | 'ADMIN';

interface User {
  name: string;
  email: string;
  role: UserRole;           // Real role fetched from GET /api/v1/notifications/role
  profile: UserProfileResponseDTO | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;         // true when role === 'ADMIN'
  isLoading: boolean;
  login: (credentials: LoginDTO) => Promise<UserRole>;   // returns role so caller can redirect
  signup: (details: SignupDTO) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: UserProfileUpdateDTO) => Promise<void>;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ─── Helper: fetch role from backend, fall back gracefully ─── */
async function fetchRoleFromBackend(): Promise<UserRole> {
  try {
    const roleStr = await authAPI.getRole();           // returns "ADMIN" or "USER"
    const clean = (roleStr || '').trim().toUpperCase();
    return clean === 'ADMIN' ? 'ADMIN' : 'USER';
  } catch {
    // If the role API fails, fall back to what's cached in localStorage
    const cached = localStorage.getItem('redhope_user_role');
    return cached === 'ADMIN' ? 'ADMIN' : 'USER';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  /* ── Refresh full session (called on app mount + after login) ── */
  const refreshUserStatus = useCallback(async () => {
    try {
      const statusResponse = await authAPI.checkLoginStatus();

      if (statusResponse === 'Authenticated') {
        // Fetch role and profile in parallel
        const [role, profileData] = await Promise.allSettled([
          fetchRoleFromBackend(),
          userAPI.getUserProfile(),
        ]);

        const resolvedRole: UserRole =
          role.status === 'fulfilled' ? role.value : 'USER';
        const resolvedProfile: UserProfileResponseDTO | null =
          profileData.status === 'fulfilled' ? profileData.value : null;

        // Persist role to localStorage for offline/fallback reads
        localStorage.setItem('redhope_user_role', resolvedRole);

        setUser({
          name: resolvedProfile?.name || localStorage.getItem('redhope_user_name') || 'RedHope User',
          email: localStorage.getItem('redhope_user_email') || '',
          role: resolvedRole,
          profile: resolvedProfile,
        });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshUserStatus(); }, [refreshUserStatus]);

  /* ── Login ── */
  const login = async (credentials: LoginDTO): Promise<UserRole> => {
    setIsLoading(true);
    try {
      await authAPI.login(credentials);

      // Save email
      localStorage.setItem('redhope_user_email', credentials.email);
      const displayName = credentials.email.split('@')[0];
      if (!localStorage.getItem('redhope_user_name')) {
        localStorage.setItem('redhope_user_name', displayName.charAt(0).toUpperCase() + displayName.slice(1));
      }

      // Fetch role + profile after login
      const [role, profileData] = await Promise.allSettled([
        fetchRoleFromBackend(),
        userAPI.getUserProfile(),
      ]);

      const resolvedRole: UserRole = role.status === 'fulfilled' ? role.value : 'USER';
      const resolvedProfile: UserProfileResponseDTO | null =
        profileData.status === 'fulfilled' ? profileData.value : null;

      localStorage.setItem('redhope_user_role', resolvedRole);

      setUser({
        name: resolvedProfile?.name || localStorage.getItem('redhope_user_name') || 'RedHope User',
        email: credentials.email,
        role: resolvedRole,
        profile: resolvedProfile,
      });
      setIsAuthenticated(true);

      showToast(
        resolvedRole === 'ADMIN'
          ? '👋 Welcome Admin! Redirecting to Admin Panel...'
          : 'Welcome back to RedHope!',
        'success'
      );

      return resolvedRole;   // caller uses this to navigate
    } catch (error: any) {
      showToast(error.message || 'Login failed. Please check credentials.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Signup ── */
  const signup = async (details: SignupDTO) => {
    setIsLoading(true);
    try {
      const res = await authAPI.signup(details);
      localStorage.setItem('redhope_user_name', details.name);
      localStorage.setItem('redhope_user_email', details.email);
      showToast(res.message || 'Sign up successful! Please verify your email.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Sign up failed.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Logout ── */
  const logout = async () => {
    setIsLoading(true);
    try { await authAPI.logout(); } catch { /* ignore */ }
    finally {
      localStorage.removeItem('redhope_user_name');
      localStorage.removeItem('redhope_user_email');
      localStorage.removeItem('redhope_user_profile');
      localStorage.removeItem('redhope_user_role');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      showToast('Logged out successfully.', 'info');
    }
  };

  /* ── Update Profile ── */
  const updateProfile = async (profileData: UserProfileUpdateDTO) => {
    setIsLoading(true);
    try {
      await userAPI.updateProfile(profileData);
      await refreshUserStatus();
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isAdmin, isLoading,
      login, signup, logout, updateProfile, refreshUserStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
