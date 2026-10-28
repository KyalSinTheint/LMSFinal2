import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Clock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { UserRole, AccountStatus } from '../../types/lms';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword?: () => void;
  onLoginSuccess?: (role?: UserRole, status?: AccountStatus) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const { loginWithCredentials, requestPasswordReset } = useLms();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(identifier.trim(), password);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        onLoginSuccess?.(res.role, res.account_status);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotFeedback(null);
    try {
      const res = await requestPasswordReset(forgotEmail.trim());
      setForgotFeedback(res.message);
    } catch {
      setForgotFeedback('Failed to request password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F8FB] dark:bg-[#0B131E] bg-light-blue-pattern flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-[#176B98] selection:text-white transition-colors">
      {/* Top Brand Masthead */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-white dark:bg-[#10243C] px-4 py-2.5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-[#1E426D] mb-3">
          <img
            src="/assets/aistudio/KBZ_Logo_28e9d8fb.png"
            alt="KBZ LIFE Insurance"
            className="h-10 w-auto object-contain"
          />
          <div className="text-left border-l border-slate-200 dark:border-[#1E426D] pl-3">
            <h1 className="text-base font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight leading-none">
              KBZ LIFE Insurance
            </h1>
            <p className="text-[10px] text-[#737373] dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Employee Learning Portal · LMS
            </p>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] shadow-card-elevated overflow-hidden transition-colors">
        {/* Card Header */}
        <div className="bg-[#176B98] text-white p-6 sm:p-7 text-left relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight text-white">Sign In to Your Account</h2>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              Access your personalized learning curriculum, company updates, and channel modules.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Identifier (Username or Email) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Username or Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. employee username or email"
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E426D] text-xs text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-[#122842] focus:bg-white dark:focus:bg-[#153252] focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98] dark:focus:border-[#38bdf8] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-[#176B98] dark:text-[#38bdf8] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E426D] text-xs text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-[#122842] focus:bg-white dark:focus:bg-[#153252] focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98] dark:focus:border-[#38bdf8] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#176B98] focus:ring-[#176B98]"
                />
                <span>Remember me on this trusted browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Learning Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="pt-4 border-t border-slate-100 dark:border-[#173454] text-center text-xs text-slate-600 dark:text-slate-400">
            <span>Don't have an approved account yet? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-bold text-[#176B98] dark:text-[#38bdf8] hover:underline cursor-pointer"
            >
              Register for LMS Access
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#10243C] rounded-2xl max-w-md w-full border border-slate-200 dark:border-[#1E426D] shadow-2xl p-6 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F3F8FB] dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8] flex items-center justify-center border border-[#176B98]/20 dark:border-[#1E426D]">
                <KeyRound className="w-5 h-5 text-[#176B98] dark:text-[#38bdf8]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Reset Your Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered work email to receive password recovery instructions.
                </p>
              </div>
            </div>

            {forgotFeedback ? (
              <div className="p-3.5 rounded-xl bg-[#F3F8FB] dark:bg-[#153252] border border-[#176B98]/20 dark:border-[#1E426D] text-xs text-slate-700 dark:text-slate-200 space-y-2">
                <p className="font-bold text-[#176B98] dark:text-[#38bdf8]">Request Processed</p>
                <p>{forgotFeedback}</p>
                <button
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotFeedback(null);
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. employee@kbzlife.com"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1E426D] bg-slate-50/50 dark:bg-[#122842] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#153252] focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98] dark:focus:border-[#38bdf8]"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#153252] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {forgotLoading ? 'Submitting...' : 'Send Recovery Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
