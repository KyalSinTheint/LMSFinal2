import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Activity,
  Newspaper,
  Film,
  Award,
  Sparkles,
  Package,
  Bell,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { AdminTabId } from './AdminLayout';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTabId) => void;
  onOpenSupabaseModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenSupabaseModal,
}) => {
  const { getStats, auditLogs, profiles, isSupabaseLive, companyBulletins } = useLms();
  const stats = getStats();

  const recentLogs = auditLogs.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Database Banner */}
      <div className="bg-gradient-to-r from-[#176B98] to-[#12567a] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 mb-4 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isSupabaseLive ? 'Supabase Live Sync Connected' : 'Local Persistence Engine Active'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            KBZLife LMS Administration Center
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
            Centralized control for employee account approvals, user permissions, company announcements, executive broadcast videos, and audit compliance across KBZLife Insurance.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('users')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#176B98] text-xs font-bold hover:bg-[#F3F8FB] transition-colors shadow-xs cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#176B98]" />
              <span>User Approvals & Management</span>
            </button>
            <button
              onClick={() => onNavigateTab('access')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>User Permissions & Access</span>
            </button>
            <button
              onClick={() => onNavigateTab('bulletin')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer border border-white/20 shadow-xs"
            >
              <Bell className="w-4 h-4 text-sky-200" />
              <span>Company Bulletin ({companyBulletins.length})</span>
            </button>
            <button
              onClick={() => onNavigateTab('products')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer border border-white/20 shadow-xs"
            >
              <Package className="w-4 h-4 text-sky-200" />
              <span>Product Knowledge Hub ({stats.totalProducts || 0})</span>
            </button>
            <button
              onClick={() => onNavigateTab('license-training')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-[#176B98] text-white text-xs font-bold transition-colors cursor-pointer border border-white/20 shadow-xs"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>License Training ({stats.totalLicenseLessons})</span>
            </button>
            <button
              onClick={() => onNavigateTab('news')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Newspaper className="w-4 h-4 text-white" />
              <span>Company News</span>
            </button>
            <button
              onClick={() => onNavigateTab('team')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-white" />
              <span>L&D Team & Motto</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-xl" />
      </div>

      {/* Database Statistics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#176B98]" />
            <span>Admin Control Metrics</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Real-Time State (Profiles, Approvals, News, Videos, Top Performers)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* Total Registered Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Total Users</span>
              <div className="p-2 rounded-xl bg-[#F3F8FB] text-[#176B98]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Registered in LMS</span>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Pending Approvals</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600">
              {profiles.filter((p) => p.account_status === 'pending').length}
            </p>
            <span className="text-[11px] text-amber-700/80 mt-1 block">Awaiting review</span>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Active Users</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600">{stats.activeUsers}</p>
            <span className="text-[11px] text-emerald-700/80 mt-1 block">Approved & Active</span>
          </div>

          {/* Inactive or Suspended */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Suspended</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-red-600">{stats.inactiveOrSuspendedUsers}</p>
            <span className="text-[11px] text-red-700/80 mt-1 block">Access restricted</span>
          </div>

          {/* Company News Articles */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Company News</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Newspaper className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalNews}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Gazette articles</span>
          </div>

          {/* Company Videos */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Broadcast Videos</span>
              <div className="p-2 rounded-xl bg-[#F3F8FB] text-[#176B98]">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalVideos}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Playable updates</span>
          </div>

          {/* License Training Lessons */}
          <div
            onClick={() => onNavigateTab('license-training')}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs cursor-pointer hover:border-[#176B98] hover:bg-[#F3F8FB]/80 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium group-hover:text-[#176B98] transition-colors">License Lessons</span>
              <div className="p-2 rounded-xl bg-amber-50 group-hover:bg-[#176B98] text-amber-700 group-hover:text-white transition-colors">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 group-hover:text-[#176B98] transition-colors">{stats.totalLicenseLessons}</p>
            <span className="text-[11px] text-amber-700 group-hover:text-[#176B98] font-semibold mt-1 block transition-colors">Videos & Handbooks</span>
          </div>

          {/* Skill Development Materials & Categories */}
          <div
            onClick={() => onNavigateTab('skill-development')}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs cursor-pointer hover:border-[#176B98]/40 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Skill Development</span>
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalSkillResources || 0}</p>
            <span className="text-[11px] text-cyan-700 font-semibold mt-1 block">
              {stats.totalSkillCategories || 0} Categories · Videos, PDFs & Links
            </span>
          </div>

          {/* Product Knowledge Hub */}
          <div
            onClick={() => onNavigateTab('products')}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs cursor-pointer hover:border-[#176B98]/40 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Product Knowledge</span>
              <div className="p-2 rounded-xl bg-sky-50 text-[#176B98]">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalProducts || 0}</p>
            <span className="text-[11px] text-[#176B98] font-semibold mt-1 block">
              Insurance Products & Quizzes
            </span>
          </div>

          {/* L&D Team & Interns */}
          <div
            onClick={() => onNavigateTab('team')}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs cursor-pointer hover:border-[#176B98]/40 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">L&D Team</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalTeamMembers}</p>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Staff & Interns</span>
          </div>

          {/* Company Bulletin Announcements */}
          <div
            onClick={() => onNavigateTab('bulletin')}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs cursor-pointer hover:border-[#176B98]/40 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Company Bulletin</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{companyBulletins.length}</p>
            <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
              Campaigns, Notices & Memos
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Recent Administrative Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Recent Activity and Changes */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#176B98]" />
                <span>Recent Administrative Activity & Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every permission grant, suspension, and course assignment is logged in Supabase
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('audit-logs')}
              className="text-xs font-semibold text-[#176B98] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => {
              const isSuspension = log.action === 'user_status_changed' && log.details.includes('SUSPENDED');
              const isAssignment = log.action === 'course_assigned' || log.action === 'channel_granted';
              const isRevocation = log.action === 'course_revoked' || log.action === 'channel_revoked';

              return (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          isSuspension
                            ? 'bg-red-100 text-red-800'
                            : isAssignment
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRevocation
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold text-slate-800">
                        By {log.admin_name}
                      </span>
                      {log.target_user_name && (
                        <span className="text-slate-500">
                          → Target: <strong className="text-slate-700">{log.target_user_name}</strong>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1/3): Quick User Overview & Security Posture */}
        <div className="space-y-6">
          {/* User Status Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#176B98]" />
              <span>Security & Access Governance</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Active Accounts:</span>
                <span className="font-bold text-emerald-600">
                  {stats.activeUsers} ({Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${(stats.activeUsers / (stats.totalUsers || 1)) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-slate-600">Suspended / Inactive:</span>
                <span className="font-bold text-red-600">
                  {stats.inactiveOrSuspendedUsers} ({Math.round((stats.inactiveOrSuspendedUsers / (stats.totalUsers || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full transition-all"
                  style={{ width: `${(stats.inactiveOrSuspendedUsers / (stats.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              When an administrator suspends an account, access to all protected course materials and channels is automatically revoked at the database layer (RLS enforced).
            </div>
          </div>

          {/* Quick User List Shortcut */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Managed Profiles</h4>
              <button
                onClick={() => onNavigateTab('users')}
                className="text-xs text-[#176B98] font-semibold hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {profiles.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                      alt={p.full_name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{p.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.department || p.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      p.account_status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {p.account_status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
