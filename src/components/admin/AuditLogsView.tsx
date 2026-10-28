import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Shield,
  BookOpen,
  Layers,
  UserX,
  UserCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { EntityType, AuditAction } from '../../types/lms';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useLms();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<'all' | EntityType>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target_user_name && log.target_user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;

    return matchesSearch && matchesEntity;
  });

  const getActionBadgeColor = (action: AuditAction) => {
    if (action === 'user_status_changed') return 'bg-red-100 text-red-800 border-red-200';
    if (action === 'course_assigned' || action === 'channel_granted')
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action === 'course_revoked' || action === 'channel_revoked')
      return 'bg-amber-100 text-amber-800 border-amber-200';
    if (action.includes('created')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#176B98]" />
          <span>Administrative Audit Trail & Security Logs</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable history of all permission grants, account suspensions, role promotions, and curriculum alterations stored in Supabase.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by administrator, target user, or action details..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176B98] bg-slate-50/50"
          />
        </div>

        {/* Entity Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Category:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#176B98]"
          >
            <option value="all">All Categories</option>
            <option value="user">User Accounts</option>
            <option value="course">Courses</option>
            <option value="channel">Channels</option>
            <option value="access">Access Matrix</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F3F8FB] text-[#176B98] font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Administrator</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Target Employee</th>
                <th className="px-5 py-3.5">Audit Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Admin Name */}
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {log.admin_name}
                    </td>

                    {/* Action Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Target User */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {log.target_user_name ? (
                        <span className="font-semibold text-slate-800">{log.target_user_name}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="px-5 py-3.5 text-slate-600 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
