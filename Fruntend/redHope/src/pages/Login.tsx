import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Heart, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const role = await login({ email, password });
      // Redirect based on actual role fetched from backend
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      // Toast message is handled by the AuthContext provider
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden red-gradient-bg">
      <div className="absolute top-1/4 left-1/2 w-[350px] h-[350px] bg-blood-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-neutral-850 shadow-2xl relative z-10 transition-all duration-300">
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-blood-950/60 border border-blood-500/20 flex items-center justify-center text-blood-500">
              <Heart className="w-6 h-6 fill-blood-600" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-100 uppercase tracking-wide">
            Welcome back to Red<span className="text-blood-500">Hope</span>
          </h2>
          <p className="text-xs text-neutral-400">Enter your credentials to manage your requests and donations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-neutral-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex.items-center flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4 ml-1.5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-300">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-blood-400 hover:text-blood-300 transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4 ml-1.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 disabled:bg-blood-800/80 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blood-600/20 hover:shadow-blood-600/40 transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-850 text-center">
          <p className="text-xs text-neutral-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blood-400 hover:text-blood-300 font-bold transition-colors">
              Sign Up As Donor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
