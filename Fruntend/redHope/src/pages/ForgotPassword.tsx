import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { Heart, Mail, Key, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1); // 1 = Request, 2 = Reset
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.forgetPassword({ email });
      showToast('Reset instructions sent to your email!', 'success');
      setStep(2);
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset email.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.resetPassword({ token, password });
      setResetSuccess(true);
      showToast('Password reset successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password. Please check your token.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden red-gradient-bg">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-neutral-850 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-neutral-100">Password Changed!</h2>
            <p className="text-sm text-neutral-400">Your password has been successfully updated. You can now use your new password to sign in.</p>
          </div>
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden red-gradient-bg">
      <div className="absolute top-1/4 left-1/2 w-[350px] h-[350px] bg-blood-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-neutral-850 shadow-2xl relative z-10">
        
        {step === 1 ? (
          /* Step 1: Request Reset */
          <div>
            <div className="text-center space-y-3 mb-8">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-2xl bg-blood-950/60 border border-blood-500/20 flex items-center justify-center text-blood-500">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-100">Reset Password</h2>
              <p className="text-xs text-neutral-400">Enter your email and we'll send you a verification code to reset your password</p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-5">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-neutral-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 disabled:bg-blood-800/80 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-850 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <Link to="/login" className="hover:text-neutral-200 transition-colors flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Step 2: Reset Form */
          <div>
            <div className="text-center space-y-3 mb-8">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-2xl bg-blood-950/60 border border-blood-500/20 flex items-center justify-center text-blood-500">
                  <Key className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-100">Set New Password</h2>
              <p className="text-xs text-neutral-400">Enter the verification code sent to your email and your new password</p>
            </div>

            <form onSubmit={handleExecuteReset} className="space-y-4">
              {/* Code */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-neutral-300">Reset Code / Token</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Key className="w-4 h-4 ml-1.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter reset code"
                    className="block w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all font-mono tracking-widest text-center"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-neutral-300">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4 ml-1.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="block w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-neutral-300">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4 ml-1.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="block w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 disabled:bg-blood-800/80 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-850 flex items-center justify-center gap-4 text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-neutral-200 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
