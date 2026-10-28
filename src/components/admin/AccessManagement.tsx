import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Clock,
  UserCheck,
  UserX,
  Shield,
  Lock,
  Unlock,
  Building,
  Key,
  FileText,
  Radio,
  Award,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { Profile, AccountStatus, UserRole } from '../../types/lms';

export const AccessManagement: React.FC = () => {
  const {
    profiles,
    auditLogs,
    updateUserStatus,
    updateUserRole,
    currentUser,
    activeAdminCount,
    maxAdminLimit,
    isSuperAdmin,
  } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(profiles[1]?.id || profiles[0]?.id || '');
  const [selectedUserStatus, setSelectedUserStatus] = useState<AccountStatus>('active');
  const [reasonNote, setReasonNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const selectedUser = profiles.find((p) => p.id === selectedUserId) || profiles[0];

  // Sync state when selected user changes
  React.useEffect(() => {
    if (selectedUser) {
      setSelectedUserStatus(selectedUser.account_status);
      setStatusFeedback(null);
    }
  }, [selectedUserId, selectedUser]);

  const filteredUsers = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.department && p.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveStatusChange = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    setStatusFeedback(null);
    try {
      if (selectedUserStatus !== selectedUser.account_status) {
        await updateUserStatus(
          selectedUser.id,
          selectedUserStatus,
          reasonNote || 'Access Control Center adjustment'
        );
        setStatusFeedback(`Account status successfully updated to ${selectedUserStatus.toUpperCase()}.`);
        setReasonNote('');
      }
    } catch {
      setStatusFeedback('Failed to update user status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRole = async () => {
    if (!selectedUser) return;
    const newRole: UserRole = selectedUser.role === 'admin' ? 'user' : 'admin';
    await updateUserRole(
      selectedUser.id,
      newRole,
      `Administrative role changed from ${selectedUser.role} to ${newRole}`
    );
  };

  const userLogs = auditLogs.filter(
    (l) => l.target_user_id === selectedUser?.id || (selectedUser?.email && l.details.includes(selectedUser.email))
  );

  const isAccessAllowed =
    selectedUser?.account_status === 'active' || selectedUser?.account_status === 'approved';

  return (
    <div className="space-y-6 text-left">
      {/* Top Header & Admin Quota Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#176B98]" />
            <span>User Permissions & Access Status</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated interface for managing employee login authorizations, portal access permissions, account states, and administrative roles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#176B98]" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Admin Account Quota
              </div>
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>{activeAdminCount} / {maxAdminLimit} Active</span>
                <span className="text-[10px] font-semibold text-[#176B98]">
                  ({maxAdminLimit - activeAdminCount} remaining)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: User Selector on Left, Permissions Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (4/12): Users List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Select Employee ({profiles.length})
          </h3>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176B98] bg-slate-50/50"
            />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[550px] pr-1">
            {filteredUsers.map((user) => {
              const isSelected = user.id === selectedUserId;
              const isSuspended = user.account_status === 'suspended';
              const isPending = user.account_status === 'pending';
              const isRejected = user.account_status === 'rejected';

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#176B98] text-white border-[#176B98] shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        user.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                      }
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/20"
                    />
                    <div className="truncate">
                      <p className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {user.full_name}
                      </p>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      isSelected
                        ? isSuspended || isRejected
                          ? 'bg-red-500 text-white'
                          : isPending
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-500 text-white'
                        : isSuspended || isRejected
                        ? 'bg-red-100 text-red-700'
                        : isPending
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.account_status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col (8/12): User Permissions & Access Panel */}
        {selectedUser && (
          <div className="lg:col-span-8 space-y-6">
            {/* User Profile Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      selectedUser.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                    }
                    alt={selectedUser.full_name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#176B98]/20"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{selectedUser.full_name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedUser.email} · {selectedUser.department || 'General Operations'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Role: {selectedUser.role.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {selectedUser.employee_id || 'KBZ-EMP-000'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Status Switcher */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 min-w-[240px]">
                  <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Account Status:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedUserStatus}
                      onChange={(e) => setSelectedUserStatus(e.target.value as AccountStatus)}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#176B98] font-semibold w-full"
                    >
                      <option value="active">Active (Access Granted)</option>
                      <option value="approved">Approved (Access Granted)</option>
                      <option value="pending">Pending (Approval Required)</option>
                      <option value="suspended">Suspended (Access Revoked)</option>
                      <option value="rejected">Rejected (Access Denied)</option>
                    </select>

                    {selectedUserStatus !== selectedUser.account_status && (
                      <button
                        onClick={handleSaveStatusChange}
                        disabled={isUpdating}
                        className="px-3.5 py-2 rounded-lg bg-[#176B98] text-white text-xs font-bold hover:bg-[#12567a] cursor-pointer shadow-xs transition-colors shrink-0 disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>

                  {statusFeedback && (
                    <p className="text-[11px] text-emerald-700 font-semibold animate-fadeIn">
                      {statusFeedback}
                    </p>
                  )}
                </div>
              </div>

              {/* Justification note when modifying */}
              {selectedUserStatus !== selectedUser.account_status && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5 animate-fadeIn">
                  <label className="block text-[11px] font-bold text-amber-900">
                    Status Change Justification Note (Audit Trail):
                  </label>
                  <input
                    type="text"
                    value={reasonNote}
                    onChange={(e) => setReasonNote(e.target.value)}
                    placeholder="e.g. Annual compliance clearance granted / branch restructuring"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                  />
                </div>
              )}

              {/* Live Access Status Indicator */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  isAccessAllowed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : selectedUser.account_status === 'pending'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-red-50/70 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isAccessAllowed
                        ? 'bg-emerald-600 text-white'
                        : selectedUser.account_status === 'pending'
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {isAccessAllowed ? (
                      <Unlock className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      User Panel Access State: {selectedUser.account_status.toUpperCase()}
                    </h4>
                    <p className="text-xs mt-0.5 leading-relaxed">
                      {isAccessAllowed
                        ? 'This employee has authorized clearance to enter the KBZLife Learning Portal and review company materials.'
                        : selectedUser.account_status === 'pending'
                        ? 'Account is pending review. The employee cannot view company content until approved.'
                        : 'Access is currently revoked. Subsequent requests and refreshes will redirect to the Account Restricted screen.'}
                    </p>
                  </div>
                </div>

                {selectedUser.account_status === 'pending' && (
                  <button
                    onClick={() => updateUserStatus(selectedUser.id, 'approved', 'Immediate approval from Access Matrix')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                  >
                    Approve Now
                  </button>
                )}
              </div>

              {/* Role & Permissions Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#176B98]" />
                    <span>Permission Scope & Role Authority</span>
                  </h4>
                  
                  {isSuperAdmin ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Reassign:</span>
                      {selectedUser.role !== 'user' && (
                        <button
                          onClick={() => updateUserRole(selectedUser.id, 'user', 'Super Admin role reallocation')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          User
                        </button>
                      )}
                      {selectedUser.role !== 'admin' && (
                        <button
                          disabled={activeAdminCount >= maxAdminLimit && selectedUser.role === 'user'}
                          onClick={() => updateUserRole(selectedUser.id, 'admin', 'Super Admin role reallocation')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            activeAdminCount >= maxAdminLimit && selectedUser.role === 'user'
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-800 cursor-pointer'
                          }`}
                          title={activeAdminCount >= maxAdminLimit && selectedUser.role === 'user' ? 'Max 20 admin limit reached' : ''}
                        >
                          Admin
                        </button>
                      )}
                      {selectedUser.role !== 'super_admin' && (
                        <button
                          disabled={activeAdminCount >= maxAdminLimit && selectedUser.role === 'user'}
                          onClick={() => updateUserRole(selectedUser.id, 'super_admin', 'Super Admin role reallocation')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            activeAdminCount >= maxAdminLimit && selectedUser.role === 'user'
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer'
                          }`}
                          title={activeAdminCount >= maxAdminLimit && selectedUser.role === 'user' ? 'Max 20 admin limit reached' : ''}
                        >
                          Super Admin
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Role management reserved for Super Admin
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">User Learning Portal</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${isAccessAllowed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {isAccessAllowed ? 'PERMITTED' : 'BLOCKED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Access to employee dashboard, announcements, and development tracks.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Admin Control Console</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        selectedUser.role === 'super_admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : selectedUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {selectedUser.role === 'super_admin'
                          ? 'SUPER ADMIN PRIVILEGED'
                          : selectedUser.role === 'admin'
                          ? 'ADMIN PRIVILEGED'
                          : 'USER RESTRICTED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {selectedUser.role === 'super_admin'
                        ? 'Full governance: role management, 20-admin cap oversight, and system security.'
                        : selectedUser.role === 'admin'
                        ? 'Operational LMS management: review pending accounts, post updates, manage modules.'
                        : 'Standard employee clearance: no access to administrative panels.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Company News Gazette</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${isAccessAllowed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {isAccessAllowed ? 'READ ACCESS' : 'BLOCKED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      View published corporate milestones and operational initiatives.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Executive Broadcasts</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${isAccessAllowed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {isAccessAllowed ? 'PLAYBACK ENABLED' : 'BLOCKED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Play leadership updates and training video recordings.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Audit Log History */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#176B98]" />
                  <span>Administrative Audit History for this Profile ({userLogs.length})</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userLogs.length > 0 ? (
                    userLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{log.details}</p>
                          <span className="text-[10px] text-slate-400">
                            By {log.admin_name} · {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-sky-50 text-[#176B98] border border-sky-100 font-mono text-[10px] rounded font-bold shrink-0">
                          {log.action}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">
                      No administrative changes recorded for this user yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
