import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { MailCheck, Key, ArrowRight, Loader2 } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { showToast } = useToast();

  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Please enter the verification code', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      await authAPI.emailVerify({ token });
      setIsSuccess(true);
      showToast('Email verified successfully! You can now log in.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Verification failed. Please check the code.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast('No email found in query parameters.', 'error');
      return;
    }

    setIsResending(true);
    try {
      await authAPI.resendEmail({ email });
      showToast('Verification code resent successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to resend verification code.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden red-gradient-bg">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-neutral-850 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MailCheck className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-neutral-100">Verification Complete!</h2>
            <p className="text-sm text-neutral-400">Your email has been verified. You can now access all services on RedHope.</p>
          </div>
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden red-gradient-bg">
      <div className="absolute top-1/4 left-1/2 w-[350px] h-[350px] bg-blood-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-neutral-850 shadow-2xl relative z-10 text-center">
        <div className="space-y-3 mb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-blood-950/60 border border-blood-500/20 flex items-center justify-center text-blood-500">
              <MailCheck className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-100">Verify Your Email</h2>
          <p className="text-xs text-neutral-400">
            We sent a verification code to <span className="font-bold text-neutral-200">{email || 'your email'}</span>.
            Please enter it below to complete registration.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-neutral-300">Verification Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Key className="w-4 h-4 ml-1.5" />
              </div>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter verification code"
                className="block w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all text-center tracking-widest font-mono text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 disabled:bg-blood-800/80 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-850 flex flex-col items-center gap-2 text-xs">
          <span className="text-neutral-400">Didn't receive the code?</span>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-blood-400 hover:text-blood-300 font-bold transition-colors disabled:text-neutral-500 flex items-center gap-1.5"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default VerifyEmail;
