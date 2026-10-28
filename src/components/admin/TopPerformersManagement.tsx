import React, { useState, useRef } from 'react';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Layers,
  AlertTriangle,
  User,
  Upload,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { TopPerformerEntry } from '../../types/lms';
import { uploadImageFile, validateImageFile } from '../../lib/storageUtils';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

export const TopPerformersManagement: React.FC = () => {
  const { topPerformers, createTopPerformer, updateTopPerformer, deleteTopPerformer } = useLms();
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Modal State - Note: "Display Rank" is intentionally removed from the interface
  const [performerModal, setPerformerModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    id?: string;
    employee_name: string;
    employee_title: string;
    department: string;
    channel: 'Alliance Channel' | 'Bancassurance Channel' | 'Corporate Channel';
    achievement_title: string;
    achievement_description: string;
    image_url: string;
    recognition_period: string;
    month_index: number;
    status: 'draft' | 'published';
  }>({
    isOpen: false,
    isEditing: false,
    employee_name: '',
    employee_title: '',
    department: '',
    channel: 'Alliance Channel',
    achievement_title: '',
    achievement_description: '',
    image_url: '',
    recognition_period: 'October 2026',
    month_index: 10,
    status: 'published',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  useBodyScrollLock(performerModal.isOpen || deleteConfirm.isOpen);

  const filtered = topPerformers.filter((tp) => {
    const matchesSearch =
      tp.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tp.achievement_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'all' || tp.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || tp.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleOpenCreate = () => {
    setUploadError(null);
    setUploadSuccessMsg(null);
    setPerformerModal({
      isOpen: true,
      isEditing: false,
      employee_name: '',
      employee_title: 'Senior Life Protection Advisor',
      department: 'Central Regional Agency',
      channel: 'Alliance Channel',
      achievement_title: 'Excellence in Customer Advisory & Policy Growth',
      achievement_description:
        'Achieved outstanding client satisfaction scores while protecting over 80 families in regional outreach initiatives.',
      image_url:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      recognition_period: 'October 2026',
      month_index: 10,
      status: 'published',
    });
  };

  const handleOpenEdit = (tp: TopPerformerEntry) => {
    setUploadError(null);
    setUploadSuccessMsg(null);
    setPerformerModal({
      isOpen: true,
      isEditing: true,
      id: tp.id,
      employee_name: tp.employee_name,
      employee_title: tp.employee_title,
      department: tp.department,
      channel: tp.channel,
      achievement_title: tp.achievement_title,
      achievement_description: tp.achievement_description,
      image_url: tp.image_url,
      recognition_period: tp.recognition_period,
      month_index: tp.month_index,
      status: tp.status,
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccessMsg(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadImageFile(file, 'top-performers');
      if (res.success && res.url) {
        setPerformerModal((prev) => ({ ...prev, image_url: res.url! }));
        setUploadSuccessMsg('Performer photo uploaded directly to Supabase Storage!');
      } else {
        setUploadError(res.error || 'Upload failed. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg || 'An error occurred during image upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (performerModal.isEditing && performerModal.id) {
      await updateTopPerformer(performerModal.id, {
        employee_name: performerModal.employee_name,
        employee_title: performerModal.employee_title,
        department: performerModal.department,
        channel: performerModal.channel,
        achievement_title: performerModal.achievement_title,
        achievement_description: performerModal.achievement_description,
        image_url: performerModal.image_url,
        recognition_period: performerModal.recognition_period,
        month_index: Number(performerModal.month_index),
        status: performerModal.status,
      });
    } else {
      await createTopPerformer({
        employee_name: performerModal.employee_name,
        employee_title: performerModal.employee_title,
        department: performerModal.department,
        channel: performerModal.channel,
        achievement_title: performerModal.achievement_title,
        achievement_description: performerModal.achievement_description,
        image_url: performerModal.image_url,
        recognition_period: performerModal.recognition_period,
        month_index: Number(performerModal.month_index),
        status: performerModal.status,
      });
    }
    setPerformerModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleTogglePublish = async (tp: TopPerformerEntry) => {
    const newStatus = tp.status === 'published' ? 'draft' : 'published';
    await updateTopPerformer(tp.id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-[#176B98]" />
            <span>Top Performer Recognition Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, and recognize monthly outstanding advisors across Alliance, Bancassurance, and Corporate channels.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Recognize Top Performer</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by advisor name, branch, or achievement headline..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98] font-semibold"
          >
            <option value="all">All Distribution Channels</option>
            <option value="Alliance Channel">Alliance Channel</option>
            <option value="Bancassurance Channel">Bancassurance Channel</option>
            <option value="Corporate Channel">Corporate Channel</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98] font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Grid of Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tp) => {
          const isPublished = tp.status === 'published';
          return (
            <div
              key={tp.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden text-left ${
                isPublished ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div>
                {/* Performer Card Banner */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={tp.image_url}
                    alt={tp.employee_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#176B98] text-white shadow-xs">
                      {tp.channel}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                      {tp.recognition_period}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    {tp.employee_name}
                  </h3>
                  <p className="text-xs font-semibold text-[#176B98]">
                    {tp.employee_title} · {tp.department}
                  </p>
                  <p className="text-xs font-bold text-slate-800 pt-1">{tp.achievement_title}</p>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {tp.achievement_description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleTogglePublish(tp)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    isPublished
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{isPublished ? 'Published' : 'Draft'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(tp)}
                    title="Edit Top Performer"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: tp.id, name: tp.employee_name })}
                    title="Delete Top Performer"
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PERFORMER MODAL */}
      {performerModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900">
              {performerModal.isEditing ? 'Edit Top Performer' : 'Recognize New Top Performer'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Name</label>
              <input
                type="text"
                value={performerModal.employee_name}
                onChange={(e) => setPerformerModal((prev) => ({ ...prev, employee_name: e.target.value }))}
                placeholder="e.g. Daw May Thu Khaing"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={performerModal.employee_title}
                  onChange={(e) => setPerformerModal((prev) => ({ ...prev, employee_title: e.target.value }))}
                  placeholder="e.g. Senior Agency Leader"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch</label>
                <input
                  type="text"
                  value={performerModal.department}
                  onChange={(e) => setPerformerModal((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g. Mandalay Central Agency"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
                <select
                  value={performerModal.channel}
                  onChange={(e) => setPerformerModal((prev) => ({ ...prev, channel: e.target.value as any }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none font-semibold"
                >
                  <option value="Alliance Channel">Alliance Channel</option>
                  <option value="Bancassurance Channel">Bancassurance Channel</option>
                  <option value="Corporate Channel">Corporate Channel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recognition Period</label>
                <input
                  type="text"
                  value={performerModal.recognition_period}
                  onChange={(e) => setPerformerModal((prev) => ({ ...prev, recognition_period: e.target.value }))}
                  placeholder="e.g. October 2026"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Achievement Headline</label>
              <input
                type="text"
                value={performerModal.achievement_title}
                onChange={(e) => setPerformerModal((prev) => ({ ...prev, achievement_title: e.target.value }))}
                placeholder="e.g. Top Life Advisor — Highest Policy Retention"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Achievement Description</label>
              <textarea
                rows={3}
                value={performerModal.achievement_description}
                onChange={(e) => setPerformerModal((prev) => ({ ...prev, achievement_description: e.target.value }))}
                placeholder="Specific metric milestones, persistency rate, family protection outreach..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            {/* Direct Device Image Upload with Supabase Storage */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700">
                Performer Photo (Upload from Device or enter URL)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageFileUpload}
                className="hidden"
              />

              {uploadError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {performerModal.image_url ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={performerModal.image_url}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 shadow-2xs"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Photo attached
                    </p>
                    <p className="text-[11px] text-slate-400 truncate font-mono">
                      {performerModal.image_url}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-2.5 py-1 rounded bg-[#176B98] text-white text-[11px] font-semibold hover:bg-[#12567a] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        {isUploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        <span>Change Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPerformerModal((prev) => ({ ...prev, image_url: '' }))}
                        className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-300 hover:border-[#176B98] bg-sky-50/50 hover:bg-sky-50 transition-colors rounded-xl p-4 text-center cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-[#176B98] border border-sky-200 shadow-2xs flex items-center justify-center mx-auto">
                    {isUploading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {isUploading ? 'Uploading to Supabase Storage...' : 'Upload Performer Photo from Device'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WebP (Max 5 MB)
                    </p>
                  </div>
                </div>
              )}

              <input
                type="text"
                value={performerModal.image_url}
                onChange={(e) => setPerformerModal((prev) => ({ ...prev, image_url: e.target.value }))}
                placeholder="Or enter image URL (https://...)"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="performer_published"
                checked={performerModal.status === 'published'}
                onChange={(e) =>
                  setPerformerModal((prev) => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))
                }
                className="rounded border-slate-300 text-[#176B98] focus:ring-[#176B98]"
              />
              <label htmlFor="performer_published" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Publish immediately to User Panel Top Performer cards
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPerformerModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!performerModal.employee_name.trim() || isUploading}
                className="px-4 py-2 rounded-lg bg-[#176B98] hover:bg-[#12567a] text-white font-semibold text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {performerModal.isEditing ? 'Save Changes' : 'Save to Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Top Performer Entry</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Are you sure you want to delete the recognition entry for "{deleteConfirm.name}"?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteTopPerformer(deleteConfirm.id);
                  setDeleteConfirm({ isOpen: false, id: '', name: '' });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
