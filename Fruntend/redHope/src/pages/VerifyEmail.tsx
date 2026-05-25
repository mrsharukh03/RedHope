import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { MailCheck, Key, ArrowRight, Loader2, Mail, RefreshCw } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  /* ── Resolve email from URL param → localStorage → empty (user types it) ── */
  const emailFromUrl = searchParams.get('email') || '';
  const emailFromStorage = localStorage.getItem('redhope_user_email') || '';
  const initialEmail = emailFromUrl || emailFromStorage;

  const [token, setToken]           = useState('');
  const [email, setEmail]           = useState(initialEmail);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess]   = useState(false);

  /* ── 60-second cooldown after each resend ── */
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  /* ── Verify token ── */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      showToast('Please enter the verification code.', 'error');
      return;
    }
    setIsVerifying(true);
    try {
      await authAPI.emailVerify({ token: token.trim() });
      setIsSuccess(true);
      showToast('Email verified successfully! You can now log in.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Verification failed. Please check the code.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  /* ── Resend email ── */
  const handleResend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      showToast('Please enter your email address to resend the code.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (cooldown > 0) return;

    setIsResending(true);
    try {
      await authAPI.resendEmail({ email: trimmed });
      showToast(`Verification code sent to ${trimmed}!`, 'success');
      localStorage.setItem('redhope_user_email', trimmed);   // save for next time
      setCooldown(60);                                        // 60s cooldown
    } catch (err: any) {
      showToast(err.message || 'Failed to resend verification code.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  /* ════════════════ SUCCESS STATE ════════════════ */
  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden red-gradient-bg">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-neutral-850 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center">
              <MailCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-neutral-100">Verification Complete!</h2>
            <p className="text-sm text-neutral-400">
              Your email has been verified. You can now log in and access all RedHope services.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ════════════════ MAIN STATE ════════════════ */
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden red-gradient-bg">
      <div className="absolute top-1/4 left-1/2 w-[350px] h-[350px] bg-blood-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-neutral-850 shadow-2xl relative z-10">

        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-blood-950/60 border border-blood-500/20 flex items-center justify-center">
              <MailCheck className="w-6 h-6 text-blood-500" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-100">Verify Your Email</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Enter the verification code we sent to your email.<br />
            If you didn't receive it, you can resend it below.
          </p>
        </div>

        {/* Verify form */}
        <form onSubmit={handleVerify} className="space-y-5">
          {/* Token input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Verification Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="w-4 h-4 text-neutral-500" />
              </div>
              <input
                type="text"
                required
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Enter code from email"
                className="block w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all text-center tracking-[0.35em] font-mono text-lg"
                autoComplete="one-time-code"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blood-600 hover:bg-blood-700 disabled:bg-blood-800/80 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            {isVerifying
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              : 'Verify Account'
            }
          </button>
        </form>

        {/* ── Resend section ── */}
        <div className="mt-8 pt-6 border-t border-neutral-850 space-y-4">
          <p className="text-xs text-neutral-400 text-center">Didn't receive the code? Enter your email and resend.</p>

          {/* Email input for resend */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-4 h-4 text-neutral-500" />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="block w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-blood-500 transition-all"
            />
          </div>

          {/* Resend button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-blood-600/40 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-300 hover:text-blood-400 text-sm font-bold rounded-xl transition-all duration-200"
          >
            {isResending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
            ) : cooldown > 0 ? (
              <><RefreshCw className="w-4 h-4" /> Resend in {cooldown}s</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> Resend Verification Email</>
            )}
          </button>

          {cooldown > 0 && (
            <p className="text-[10px] text-neutral-600 text-center">
              Please wait before requesting another code.
            </p>
          )}
        </div>

        {/* Back to login */}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
