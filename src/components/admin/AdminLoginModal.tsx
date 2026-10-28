import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Mail,
  KeyRound,
  Sparkles,
  X,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  useBodyScrollLock(isOpen);
  const { loginWithCredentials, changePassword, requestPasswordReset } = useLms();

  const [mode, setMode] = useState<'login' | 'forgot' | 'first-change'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // First-change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password email
  const [resetEmail, setResetEmail] = useState('admin@kbzlife.com');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await loginWithCredentials(identifier, password);
    setIsLoading(false);

    if (result.success) {
      if (result.mustChangePassword) {
        setMode('first-change');
        setSuccessMessage('Temporary credentials verified. Please set your permanent administrator password.');
      } else {
        onSuccess();
        onClose();
      }
    } else {
      setErrorMessage(result.message || 'Invalid username or password.');
    }
  };

  const handleFirstTimeChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    const result = await changePassword(password, newPassword);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Permanent password successfully established.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setErrorMessage(result.message || 'Failed to update password.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await requestPasswordReset(resetEmail);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(
        result.isConfigured
          ? `Password reset link delivered to ${resetEmail}. Check your inbox.`
          : `Password reset link generated and recorded in system audit log.`
      );
    } else {
      setErrorMessage(result.message || 'Could not process password reset.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="bg-[#176B98] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-white mb-3 border border-white/20 shadow-xs">
            <Shield className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {mode === 'login' && 'KBZLIFE LMS Administrator Login'}
            {mode === 'first-change' && 'Mandatory First-Login Password Change'}
            {mode === 'forgot' && 'Reset Administrator Password'}
          </h2>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            {mode === 'login' && 'Authenticate with your administrator credentials or bootstrap account.'}
            {mode === 'first-change' && 'Protect your portal by replacing the default temporary credentials.'}
            {mode === 'forgot' && 'Send a secure reset link to your verified corporate email address.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Status alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Quick Fill Helper for Tester */}
              <div className="p-3 rounded-xl bg-[#F3F8FB] border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#176B98]">Initial Development Credentials:</span>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    User: <code>admin</code> · Pass: <code>admin123</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('admin');
                    setPassword('admin123');
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#176B98] text-white text-[10px] font-bold hover:bg-[#12567a] transition-colors cursor-pointer"
                >
                  Quick Fill
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin or name@kbzlife.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] font-bold text-[#176B98] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In as Administrator'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* MODE 2: FIRST TIME PASSWORD CHANGE */}
          {mode === 'first-change' && (
            <form onSubmit={handleFirstTimeChangePassword} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Policy Requirement:</strong> You must create a new private password before accessing administrative features.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Permanent Password (min 6 characters)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Saving...' : 'Set Permanent Password & Enter'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@kbzlife.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
