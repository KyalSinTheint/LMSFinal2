import React, { useState, useRef } from 'react';
import { useLms } from '../../context/LmsContext';
import { LdTeamMember, LdMemberType, HodMotto } from '../../types/lms';
import {
  Users,
  Quote,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Camera,
  CheckCircle2,
  X,
  Search,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  Building2,
  Sparkles,
} from 'lucide-react';
import { validateImageFile } from '../../lib/storageUtils';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

export const TeamManagement: React.FC = () => {
  const {
    hodMotto,
    teamMembers,
    updateHodMotto,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    reorderTeamMembers,
  } = useLms();

  // Active sub-view: 'members' | 'motto'
  const [activeAdminSubtab, setActiveAdminSubtab] = useState<'members' | 'motto'>('members');

  // Search & Filters for Team Members
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | LdMemberType>('all');

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LdTeamMember | null>(null);
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Learning & Development');
  const [memberType, setMemberType] = useState<LdMemberType>('team_member');
  const [photoUrl, setPhotoUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input ref for member photo upload
  const memberFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal
  const [memberToDelete, setMemberToDelete] = useState<LdTeamMember | null>(null);

  useBodyScrollLock(isModalOpen || !!memberToDelete);

  // HOD Motto Form State
  const [mottoText, setMottoText] = useState(hodMotto.motto_text || '');
  const [hodName, setHodName] = useState(hodMotto.hod_name || 'Daw Khin Thida');
  const [hodTitle, setHodTitle] = useState(
    hodMotto.hod_title || 'Head of Learning & Development, KBZLife Insurance'
  );
  const [hodPhotoUrl, setHodPhotoUrl] = useState(hodMotto.photo_url || '');
  const [hodContext, setHodContext] = useState(
    hodMotto.statement_context || 'Leadership guidance for continuous professional growth and capability development.'
  );
  const [hodIsPublished, setHodIsPublished] = useState(hodMotto.is_published ?? true);
  const [isSavingMotto, setIsSavingMotto] = useState(false);
  const hodFileInputRef = useRef<HTMLInputElement>(null);

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingMember(null);
    setFullName('');
    setPosition('');
    setDepartment('Learning & Development');
    setMemberType('team_member');
    setPhotoUrl('');
    setDisplayOrder(teamMembers.length + 1);
    setIsPublished(true);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (member: LdTeamMember) => {
    setEditingMember(member);
    setFullName(member.full_name);
    setPosition(member.position);
    setDepartment(member.department || 'Learning & Development');
    setMemberType(member.member_type);
    setPhotoUrl(member.photo_url || member.photo_path || '');
    setDisplayOrder(member.display_order);
    setIsPublished(member.is_published);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Handle direct file upload for Member Photo
  const handleMemberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle direct file upload for HOD Photo
  const handleHodPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error || 'Invalid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setHodPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Member (Create or Update)
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !position.trim()) {
      alert('Please provide full name and position.');
      return;
    }

    if (editingMember) {
      await updateTeamMember(editingMember.id, {
        full_name: fullName.trim(),
        position: position.trim(),
        department: department.trim() || 'Learning & Development',
        member_type: memberType,
        photo_url: photoUrl.trim() || undefined,
        display_order: Number(displayOrder) || 1,
        is_published: isPublished,
      });
    } else {
      await createTeamMember({
        full_name: fullName.trim(),
        position: position.trim(),
        department: department.trim() || 'Learning & Development',
        member_type: memberType,
        photo_url: photoUrl.trim() || undefined,
        display_order: Number(displayOrder) || teamMembers.length + 1,
        is_published: isPublished,
      });
    }

    setIsModalOpen(false);
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    await deleteTeamMember(memberToDelete.id);
    setMemberToDelete(null);
  };

  // Reorder Members Move Up / Down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedMembers.length) return;

    const newOrder = [...sortedMembers];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    await reorderTeamMembers(newOrder.map((m) => m.id));
  };

  // Save HOD Motto
  const handleSaveHodMotto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMotto(true);
    try {
      await updateHodMotto({
        motto_text: mottoText.trim(),
        hod_name: hodName.trim(),
        hod_title: hodTitle.trim(),
        photo_url: hodPhotoUrl.trim() || undefined,
        statement_context: hodContext.trim(),
        is_published: hodIsPublished,
      });
    } finally {
      setIsSavingMotto(false);
    }
  };

  // Sorted & Filtered list of members
  const sortedMembers = [...teamMembers].sort((a, b) => a.display_order - b.display_order);

  const filteredMembers = sortedMembers.filter((member) => {
    if (filterType !== 'all' && member.member_type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = member.full_name.toLowerCase().includes(q);
      const matchPosition = member.position.toLowerCase().includes(q);
      const matchDept = member.department.toLowerCase().includes(q);
      return matchName || matchPosition || matchDept;
    }
    return true;
  });

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#176B98] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-[#176B98]" />
            <span>Learning & Development Hub Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            L&D Team & HOD Motto Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the Head of Department's leadership motto and maintain team member and intern cards shown in the Learning & Development Hub.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveAdminSubtab('members')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAdminSubtab === 'members'
                ? 'bg-white text-[#176B98] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Members ({teamMembers.length})</span>
          </button>
          <button
            onClick={() => setActiveAdminSubtab('motto')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAdminSubtab === 'motto'
                ? 'bg-white text-[#176B98] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>HOD Motto</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: TEAM MEMBERS MANAGEMENT                                */}
      {/* ------------------------------------------------------------- */}
      {activeAdminSubtab === 'members' && (
        <div className="space-y-6">
          {/* Action & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team members by name, position..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Type */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-white text-[#176B98] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({teamMembers.length})
                </button>
                <button
                  onClick={() => setFilterType('team_member')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterType === 'team_member'
                      ? 'bg-white text-[#176B98] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Team Members ({teamMembers.filter((m) => m.member_type === 'team_member').length})
                </button>
                <button
                  onClick={() => setFilterType('intern')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterType === 'intern'
                      ? 'bg-white text-[#176B98] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Interns ({teamMembers.filter((m) => m.member_type === 'intern').length})
                </button>
              </div>
            </div>

            {/* Add Person Button */}
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member or Intern</span>
            </button>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
                <thead className="bg-[#F3F8FB] text-[#176B98] font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5 w-16 text-center">Order</th>
                    <th className="px-4 py-3.5">Person</th>
                    <th className="px-4 py-3.5">Position & Role</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                        No team members or interns found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === filteredMembers.length - 1;

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Reorder Arrows */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleMove(idx, 'up')}
                                disabled={isFirst}
                                title="Move up"
                                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono text-xs font-bold text-slate-500 w-4">
                                {member.display_order}
                              </span>
                              <button
                                onClick={() => handleMove(idx, 'down')}
                                disabled={isLast}
                                title="Move down"
                                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Person Name & Avatar */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {member.photo_url || member.photo_path ? (
                                <img
                                  src={member.photo_url || member.photo_path}
                                  alt={member.full_name}
                                  className="w-10 h-10 rounded-xl object-cover object-top border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-[#F3F8FB] text-[#176B98] border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                                  {member.full_name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {member.full_name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  ID: {member.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800">{member.position}</span>
                          </td>

                          {/* Department */}
                          <td className="px-4 py-3">
                            <span className="text-slate-600">
                              {member.department || 'Learning & Development'}
                            </span>
                          </td>

                          {/* Member Type */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                member.member_type === 'intern'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-sky-50 text-[#176B98] border border-sky-200/80'
                              }`}
                            >
                              {member.member_type === 'intern' ? (
                                <>
                                  <GraduationCap className="w-3 h-3" />
                                  <span>Intern</span>
                                </>
                              ) : (
                                <>
                                  <Briefcase className="w-3 h-3" />
                                  <span>Team Member</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Published Status Toggle */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() =>
                                updateTeamMember(member.id, { is_published: !member.is_published })
                              }
                              title={member.is_published ? 'Click to Unpublish' : 'Click to Publish'}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                member.is_published
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {member.is_published ? (
                                <>
                                  <Eye className="w-3 h-3 text-emerald-600" />
                                  <span>Published</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 text-slate-400" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(member)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-[#176B98] hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Person Details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setMemberToDelete(member)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Person"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredMembers.length} of {teamMembers.length} records</span>
              <span>Click reorder arrows to change presentation sequence</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: HOD MOTTO MANAGEMENT                                  */}
      {/* ------------------------------------------------------------- */}
      {activeAdminSubtab === 'motto' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card-elevated space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Head of Department (HOD) Leadership Motto
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit the HOD's motto statement displayed at the top of the Learning and Development Hub. If left blank or unpublished, the motto card is gracefully hidden from users.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hodIsPublished}
                  onChange={(e) => setHodIsPublished(e.target.checked)}
                  className="rounded border-slate-300 text-[#176B98] focus:ring-[#176B98] w-4 h-4"
                />
                <span>Published to Users</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSaveHodMotto} className="space-y-6">
            {/* Motto Text Block */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                HOD's Official Motto Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={mottoText}
                onChange={(e) => setMottoText(e.target.value)}
                placeholder="Enter the Head of Department's inspirational leadership guidance..."
                className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900 leading-relaxed font-sans"
              />
              <p className="text-[11px] text-slate-400">
                Appears inside quotation marks in the prominent HOD section banner.
              </p>
            </div>

            {/* Two Column Grid for HOD details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Head of Department Name
                </label>
                <input
                  type="text"
                  value={hodName}
                  onChange={(e) => setHodName(e.target.value)}
                  placeholder="e.g. Daw Khin Thida"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Job Title & Organization
                </label>
                <input
                  type="text"
                  value={hodTitle}
                  onChange={(e) => setHodTitle(e.target.value)}
                  placeholder="e.g. Head of Learning & Development, KBZLife Insurance"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900"
                />
              </div>
            </div>

            {/* Context description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Statement Subtitle / Context Note
              </label>
              <input
                type="text"
                value={hodContext}
                onChange={(e) => setHodContext(e.target.value)}
                placeholder="e.g. Leadership statement for all KBZLife operational and advisory employees nationwide."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900"
              />
            </div>

            {/* HOD Photo Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                HOD Portrait Photo
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {hodPhotoUrl ? (
                    <img
                      src={hodPhotoUrl}
                      alt={hodName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={hodFileInputRef}
                      onChange={handleHodPhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => hodFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo from Device</span>
                    </button>
                    {hodPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setHodPhotoUrl('')}
                        className="px-3 py-2 text-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={hodPhotoUrl}
                    onChange={(e) => setHodPhotoUrl(e.target.value)}
                    placeholder="Or enter image URL: https://..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSavingMotto}
                className="px-6 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSavingMotto ? 'Saving Changes...' : 'Save HOD Motto'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT TEAM MEMBER                                 */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#176B98] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingMember ? 'Edit Team Member Details' : 'Add New Member or Intern'}
                  </h3>
                  <p className="text-[11px] text-sky-100">
                    Shown in the Learning & Development Hub team collection.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMember} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Photo Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      ref={memberFileInputRef}
                      onChange={handleMemberPhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => memberFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device</span>
                      </button>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Or enter image URL: https://..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                    {uploadError && (
                      <p className="text-[11px] text-red-600 font-semibold">{uploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Daw Khin Thida"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900"
                />
              </div>

              {/* Position / Job Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Position / Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Instructional Designer & Multimedia Lead"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900"
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Learning & Development"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900"
                />
              </div>

              {/* Member Type & Display Order */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Role Category
                  </label>
                  <select
                    value={memberType}
                    onChange={(e) => setMemberType(e.target.value as LdMemberType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-800"
                  >
                    <option value="team_member">Team Member</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Display Order #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Published checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-slate-300 text-[#176B98] focus:ring-[#176B98] w-4 h-4"
                  />
                  <span>Published to Users</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6 mt-0.5">
                  When published, this card is visible to learners in the Learning & Development Hub.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingMember ? 'Update Person' : 'Save Person'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE CONFIRMATION                                    */}
      {/* ------------------------------------------------------------- */}
      {memberToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overscroll-contain"
          onClick={() => setMemberToDelete(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Delete {memberToDelete.full_name}?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove <strong>{memberToDelete.full_name}</strong> ({memberToDelete.position})?
                This action is immediate. Other cards in the team collection will remain intact.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
