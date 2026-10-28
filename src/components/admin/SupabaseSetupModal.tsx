import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { testSupabaseConnection, getSupabaseConfig } from '../../lib/supabase';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  const { isSupabaseLive, refreshData } = useLms();
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const config = getSupabaseConfig();

  const handleCopySql = () => {
    const sqlUrl = '/supabase/migrations/20261021_init_kbzlife_lms.sql';
    fetch(sqlUrl)
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        navigator.clipboard.writeText('-- Run supabase/migrations/20261021_init_kbzlife_lms.sql in your Supabase SQL editor');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setTesting(false);
    if (res.success) {
      refreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#003366] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Supabase PostgreSQL Integration</h2>
              <p className="text-xs text-sky-200">Database synchronization, RLS security & audit logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isSupabaseLive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isSupabaseLive ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-sm">
                {isSupabaseLive
                  ? 'Connected to Live Supabase Project'
                  : 'Operating in High-Fidelity Reactive Storage Mode'}
              </h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isSupabaseLive
                  ? 'All changes are actively synchronized with your Supabase PostgreSQL database with Row Level Security (RLS) enforcement.'
                  : 'Currently operating with the built-in local database engine. All administrator updates (user status, course assignments, channel access, and audit logs) are persisted and immediately reflected across the User Panel.'}
              </p>
            </div>
          </div>

          {/* Environment Variables Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Required Environment Variables</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="font-mono font-semibold text-[#00529B]">VITE_SUPABASE_URL</span>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {config.url ? config.url : 'Not set in .env'}
                </p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="font-mono font-semibold text-[#00529B]">VITE_SUPABASE_ANON_KEY</span>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {config.anonKey ? '••••••••••••••••' : 'Not set in .env'}
                </p>
              </div>
            </div>
          </div>

          {/* SQL Migration Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Database Schema & RLS Migration
              </h4>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00529B] hover:bg-[#003366] text-white text-xs font-medium cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy Migration SQL'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The migration file <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#00529B]">supabase/migrations/20261021_init_kbzlife_lms.sql</code> configures the 7 normalized tables (<code className="text-slate-800">profiles, courses, channels, course_enrollments, channel_access, learning_progress, admin_audit_logs</code>), secure RLS policies, trigger procedures, and initial KBZLife content.
            </p>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Verifying...' : 'Test Supabase Connection'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#00529B] hover:underline font-semibold"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
