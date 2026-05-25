import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';
import type { LoginDTO, SignupDTO, UserProfileUpdateDTO, UserProfileResponseDTO } from '../types';
import { useToast } from '../components/Toast';

interface User {
  name: string;
  email: string;
  profile: UserProfileResponseDTO | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  signup: (details: SignupDTO) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: UserProfileUpdateDTO) => Promise<void>;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  // Check login status on load
  const refreshUserStatus = useCallback(async () => {
    try {
      const response = await authAPI.checkLoginStatus();
      if (response === 'Authenticated') {
        const cachedEmail = localStorage.getItem('redhope_user_email') || '';
        
        let profileData: UserProfileResponseDTO | null = null;
        try {
          profileData = await userAPI.getUserProfile();
        } catch (e) {
          console.error('Failed to fetch user profile from API:', e);
        }

        setUser({
          name: profileData?.name || localStorage.getItem('redhope_user_name') || 'RedHope User',
          email: cachedEmail,
          profile: profileData,
        });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to verify session status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserStatus();
  }, [refreshUserStatus]);

  const login = async (credentials: LoginDTO) => {
    setIsLoading(true);
    try {
      await authAPI.login(credentials);
      
      // Save email and tentative display name to localStorage
      localStorage.setItem('redhope_user_email', credentials.email);
      const username = credentials.email.split('@')[0];
      const displayName = username.charAt(0).toUpperCase() + username.slice(1);
      
      if (!localStorage.getItem('redhope_user_name')) {
        localStorage.setItem('redhope_user_name', displayName);
      }

      await refreshUserStatus();
      showToast('Welcome back to RedHope!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Login failed. Please check credentials.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (details: SignupDTO) => {
    setIsLoading(true);
    try {
      const res = await authAPI.signup(details);
      // Cache details to use after email verification and login
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

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('Network logout failed, clearing local session.');
    } finally {
      localStorage.removeItem('redhope_user_name');
      localStorage.removeItem('redhope_user_email');
      localStorage.removeItem('redhope_user_profile');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      showToast('Logged out successfully.', 'info');
    }
  };

  const updateProfile = async (profileData: UserProfileUpdateDTO) => {
    setIsLoading(true);
    try {
      await userAPI.updateProfile(profileData);
      
      // Refresh profile data from backend
      await refreshUserStatus();
      
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        refreshUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
