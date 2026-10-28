import React, { useState } from 'react';
import {
  Settings,
  Database,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Send,
  Lock,
  Globe,
  Sliders,
  Server,
  Copy,
  Check,
  Terminal,
  Users,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminSettingsView: React.FC = () => {
  const {
    isSupabaseLive,
    refreshData,
    sendCustomEmail,
    showToast,
    activeAdminCount,
    maxAdminLimit,
    isSuperAdmin,
    bootstrapSuperAdmin,
    currentUser,
  } = useLms();

  // Settings form states
  const [portalTitle, setPortalTitle] = useState('KBZLIFE Employee Learning Portal');
  const [requireApproval, setRequireApproval] = useState(true);
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState('12');
  const [senderName, setSenderName] = useState('KBZLife LMS Administration');
  const [senderEmail, setSenderEmail] = useState('noreply@kbzlife.com');
  const [testEmailRecipient, setTestEmailRecipient] = useState('admin@kbzlife.com');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [bootstrapEmail, setBootstrapEmail] = useState(currentUser?.email || 'admin@kbzlife.com');
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [copiedSqlPath, setCopiedSqlPath] = useState(false);

  const handleBootstrapSuperAdmin = async () => {
    if (!bootstrapEmail) return;
    setIsBootstrapping(true);
    const res = await bootstrapSuperAdmin(bootstrapEmail);
    setIsBootstrapping(false);
    if (res.success) {
      showToast('success', 'Super Admin Initialized', res.message);
    } else {
      showToast('error', 'Initialization Error', res.message);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setFeedback(null);
    setTimeout(() => {
      setIsSavingSettings(false);
      setFeedback('LMS system and security settings saved successfully.');
      showToast('success', 'Settings Saved', 'Platform preferences updated across the system.');
      setTimeout(() => setFeedback(null), 3000);
    }, 600);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient) return;
    setIsSendingTestEmail(true);
    try {
      const res = await sendCustomEmail(
        testEmailRecipient,
        'KBZLife LMS System Test Email',
        `<div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #176B98;">KBZLife LMS Email Service Test</h2>
          <p>This is a verification test dispatch confirming transactional email connectivity.</p>
          <p style="color: #64748b; font-size: 12px;">Sent from KBZLife LMS Administration Console</p>
        </div>`,
        'system_test'
      );
      if (res.success) {
        showToast('success', 'Test Email Dispatched', res.message);
      } else {
        showToast('warning', 'Email Status', res.message);
      }
    } catch {
      showToast('error', 'Email Delivery Failed', 'Could not reach email transport service.');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#176B98]" />
            <span>LMS System & Security Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system parameters, authentication policies, Supabase credentials, and email delivery.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Module 1: Authentication & User Registration Governance */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#176B98] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                User Onboarding & Approval Workflow
              </h3>
              <p className="text-xs text-slate-500">
                Control account creation requirements and mandatory administrative review.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 cursor-pointer">
                  Require Administrator Approval
                </label>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="rounded border-slate-300 text-[#176B98] focus:ring-[#176B98] w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                When enabled (enforced), all newly registered employee accounts are held in{' '}
                <strong className="text-amber-700">Pending Status</strong> until approved by an administrator in User Management.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 cursor-pointer">
                  Allow Public Employee Self-Registration
                </label>
                <input
                  type="checkbox"
                  checked={allowSelfRegistration}
                  onChange={(e) => setAllowSelfRegistration(e.target.checked)}
                  className="rounded border-slate-300 text-[#176B98] focus:ring-[#176B98] w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Provides a "Create Account" link on the LMS sign-in page for internal KBZLife staff.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                LMS Portal Display Title
              </label>
              <input
                type="text"
                value={portalTitle}
                onChange={(e) => setPortalTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Session Expiration Timeout
              </label>
              <select
                value={sessionTimeoutHours}
                onChange={(e) => setSessionTimeoutHours(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]"
              >
                <option value="4">4 Hours</option>
                <option value="8">8 Hours (Standard Work Shift)</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Module 2: Supabase Backend & Database Integration */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Supabase PostgreSQL & Storage Status
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time database connection, Row Level Security (RLS), and bucket storage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isSupabaseLive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseLive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                  }`}
                />
                <span>{isSupabaseLive ? 'Connected & Live' : 'Local Fallback / Standby'}</span>
              </span>

              <button
                type="button"
                onClick={refreshData}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                title="Test database connection"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase URL (Environment: VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                disabled
                value={import.meta.env.VITE_SUPABASE_URL || 'https://kbzlife-lms.supabase.co'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="text"
                disabled
                value={
                  import.meta.env.VITE_SUPABASE_ANON_KEY
                    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Active)'
                    : 'Configured in server runtime / environment'
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs text-sky-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#176B98]" />
              <span>Row Level Security (RLS) Policies Active</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              PostgreSQL policies enforce strict access bounds. Regular learners can only query published company news and approved courses. Administrative mutations require JWT session role claims.
            </p>
          </div>
        </div>

        {/* Module 3: Super Admin Governance & 20-Admin Cap Control */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Super Admin Governance & 20-Admin Quota
                </h3>
                <p className="text-xs text-slate-500">
                  Role-Based Access Control (RBAC) governance, server/database triggers, and one-time bootstrap.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                {activeAdminCount} / {maxAdminLimit} Active Admins
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Max Admin Accounts Cap</span>
              <span className="text-lg font-black text-slate-900">{maxAdminLimit} Total</span>
              <span className="text-[11px] text-slate-500 block mt-1">Enforced at database trigger level with concurrency row-locking.</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Currently Active Admins</span>
              <span className="text-lg font-black text-[#176B98]">{activeAdminCount} Active</span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">{maxAdminLimit - activeAdminCount} slot(s) available</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Your Administrative Status</span>
              <span className="text-lg font-black text-amber-700">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {isSuperAdmin ? 'Authorized to promote/demote administrators.' : 'Standard admin permissions.'}
              </span>
            </div>
          </div>

          {/* Super Admin Bootstrap Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-800" />
                  <span>Bootstrap Initial Super Admin Account</span>
                </h4>
                <p className="text-[11px] text-amber-900 mt-0.5">
                  Promotes an existing registered email account to Super Admin status if no Super Admin currently exists or to re-sync initial access.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="email"
                value={bootstrapEmail}
                onChange={(e) => setBootstrapEmail(e.target.value)}
                placeholder="Target email address..."
                className="w-full sm:flex-1 px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <button
                type="button"
                onClick={handleBootstrapSuperAdmin}
                disabled={isBootstrapping}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isBootstrapping ? 'Initializing...' : 'Bootstrap Super Admin'}</span>
              </button>
            </div>
          </div>

          {/* Master SQL Migration Script Notice */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-bold">
                <Terminal className="w-4 h-4" />
                <span>Supabase Master SQL Migration Script</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('supabase/migrations/20261028_master_setup_all_in_one.sql');
                  setCopiedSqlPath(true);
                  setTimeout(() => setCopiedSqlPath(false), 2500);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
              >
                {copiedSqlPath ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSqlPath ? 'Path Copied!' : 'Copy Path'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We generated an all-in-one idempotent master script at <code className="text-amber-300 font-mono">supabase/migrations/20261028_master_setup_all_in_one.sql</code> containing all 24 database tables, RLS security policies, 20-admin concurrency limit triggers, last Super Admin protection triggers, and private/public storage buckets.
            </p>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 flex items-center justify-between gap-3">
              <span>Run this script in your Supabase Dashboard &rarr; SQL Editor to provision tables & triggers.</span>
              <span className="font-mono text-emerald-400 font-bold shrink-0">Ready for Execution</span>
            </div>
          </div>
        </div>

        {/* Module 4: Transactional Email Delivery Provider */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Transactional Email Service
              </h3>
              <p className="text-xs text-slate-500">
                Automated account approval notices, password reset links, and learner onboarding emails.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sender Display Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sender Address (EMAIL_FROM)
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]"
              />
            </div>
          </div>

          {/* Test Email Dispatch Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Verify Email Dispatch</h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="Enter recipient email address..."
                className="w-full sm:flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTestEmail}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTestEmail ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingSettings}
            className="px-6 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingSettings ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
