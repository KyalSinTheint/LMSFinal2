import React from 'react';
import {
  ShieldAlert,
  XCircle,
  LogOut,
  Mail,
  User,
  AlertTriangle,
  ArrowLeft,
  Building,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';

interface AccountRestrictedPageProps {
  onLogout: () => void;
  onNavigateToLogin: () => void;
}

export const AccountRestrictedPage: React.FC<AccountRestrictedPageProps> = ({
  onLogout,
  onNavigateToLogin,
}) => {
  const { currentUser } = useLms();
  const isRejected = currentUser.account_status === 'rejected';

  return (
    <div className="min-h-screen bg-[#EDF4FB] bg-light-blue-pattern flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-[#00529B] selection:text-white">
      {/* Brand Header */}
      <div className="w-full max-w-lg text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-xs border border-sky-100 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black text-sm shadow-inner">
            KBZ
          </div>
          <div className="text-left">
            <h1 className="text-base font-extrabold text-[#003366] tracking-tight leading-none">
              KBZLIFE Insurance
            </h1>
            <p className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider mt-0.5">
              Employee Learning Portal · Access Control
            </p>
          </div>
        </div>
      </div>

      {/* Main Restriction Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl border border-red-200 shadow-xl overflow-hidden text-left">
        {/* Banner */}
        <div className="bg-red-700 text-white p-7 relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white text-red-700 flex items-center justify-center shrink-0 shadow-lg">
              {isRejected ? <XCircle className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                {isRejected ? 'Application Rejected' : 'Account Suspended'}
              </span>
              <h2 className="text-2xl font-black text-white mt-1.5 tracking-tight">
                {isRejected ? 'Registration Not Approved' : 'Account Access Suspended'}
              </h2>
              <p className="text-xs text-red-100 mt-1 leading-relaxed">
                {isRejected
                  ? 'Your application for KBZLife LMS access was reviewed and declined by administration.'
                  : 'Access to learning materials, modules, and internal portals has been temporarily suspended.'}
              </p>
            </div>
          </div>
        </div>

        {/* Details & Explanation */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="bg-red-50/70 rounded-2xl border border-red-200/80 p-4 space-y-2 text-xs text-red-900">
            <h4 className="font-bold flex items-center gap-1.5 text-red-950">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Administrative Notice</span>
            </h4>
            <p className="leading-relaxed">
              {isRejected
                ? 'Your registration did not meet current eligibility requirements for internal employee learning. If you believe this is in error, please contact Human Resources.'
                : 'Your profile has been placed on administrative hold during an annual compliance review or access audit. Course launches and channel certifications are disabled.'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Profile Reference
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">User</span>
                <span className="font-bold text-slate-900">{currentUser.full_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Email</span>
                <span className="font-bold text-slate-900 truncate block">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Department</span>
                <span className="font-bold text-slate-900">{currentUser.department || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Status Code</span>
                <span className="font-bold text-red-700 uppercase">{currentUser.account_status}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <a
              href="mailto:admin@kbzlife.com?subject=KBZLife%20LMS%20Access%20Inquiry"
              className="w-full py-2.5 px-4 rounded-xl bg-[#003366] hover:bg-[#00529B] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-sky-200" />
              <span>Contact LMS Administrator (admin@kbzlife.com)</span>
            </a>

            <button
              onClick={() => {
                onLogout();
                onNavigateToLogin();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out & Return to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
