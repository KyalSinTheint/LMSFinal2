import React, { useState, useRef, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Upload,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  FileCheck,
  Check,
  Tag,
  Calendar,
  Building2,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Loader2,
  Globe,
  Lock,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import {
  CompanyBulletinItem,
  BulletinCategory,
} from '../../types/lms';
import { uploadLargeFileChunked, formatBytes } from '../../lib/storageUtils';
import { PdfViewerModal } from '../common/PdfViewerModal';

const AVAILABLE_SAMPLE_PDFS = [
  {
    name: 'Fair Market Conduct Manual (Governance & Customer Protection)',
    url: '/uploads/Fair_Market_Conduct_Manual.pdf',
    fileName: 'Fair_Market_Conduct_Manual.pdf',
    size: '2.4 MB',
  },
  {
    name: 'KBZLife AML / CFT Compliance Handbook 2026',
    url: '/uploads/KBZLife_AML_CFT_Compliance_2026.pdf',
    fileName: 'KBZLife_AML_CFT_Compliance_2026.pdf',
    size: '3.1 MB',
  },
  {
    name: 'Frontline Professional Business & Customer Advisory',
    url: '/uploads/Everyday_Business_English_Frontline.pdf',
    fileName: 'Everyday_Business_English_Frontline.pdf',
    size: '1.8 MB',
  },
  {
    name: 'KBZLife Financial Automation & Reporting Handbook',
    url: '/uploads/KBZLife_Excel_Automation_Handbook.pdf',
    fileName: 'KBZLife_Excel_Automation_Handbook.pdf',
    size: '4.2 MB',
  },
];

export const CompanyBulletinManagement: React.FC = () => {
  const { companyBulletins, createBulletin, updateBulletin, deleteBulletin, currentUser } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState<CompanyBulletinItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activePdfPreview, setActivePdfPreview] = useState<CompanyBulletinItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<BulletinCategory>('Announcement');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formFileSize, setFormFileSize] = useState<number>(0);
  const [formFormattedSize, setFormFormattedSize] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formPriority, setFormPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [formTagsString, setFormTagsString] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Upload progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered List
  const filteredList = useMemo(() => {
    return companyBulletins.filter((item) => {
      if (selectedStatus === 'published' && !item.published && item.status !== 'published') return false;
      if (selectedStatus === 'draft' && (item.published || item.status === 'published')) return false;
      if (selectedCategory !== 'all' && item.category.toLowerCase() !== selectedCategory.toLowerCase())
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
          (item.department && item.department.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [companyBulletins, selectedStatus, selectedCategory, searchQuery]);

  // Open Editor for Creating New
  const handleOpenCreateModal = () => {
    setEditingBulletin(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Announcement');
    // Default to the official Fair Market Conduct Manual sample PDF
    setFormPdfUrl('/uploads/Fair_Market_Conduct_Manual.pdf');
    setFormFileName('Fair_Market_Conduct_Manual.pdf');
    setFormFileSize(2450000);
    setFormFormattedSize('2.4 MB');
    setFormDepartment('Corporate Communications');
    setFormPriority('normal');
    setFormTagsString('announcement, company memo, all staff');
    setFormIsPublished(true);
    setUploadError(null);
    setIsEditorOpen(true);
  };

  // Open Editor for Editing Existing
  const handleOpenEditModal = (item: CompanyBulletinItem) => {
    setEditingBulletin(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormCategory(item.category);
    setFormPdfUrl(item.pdf_url);
    setFormFileName(item.file_name || 'document.pdf');
    setFormFileSize(item.file_size || 0);
    setFormFormattedSize(item.formatted_file_size || 'PDF Document');
    setFormDepartment(item.department || '');
    setFormPriority(item.priority || 'normal');
    setFormTagsString(item.tags ? item.tags.join(', ') : '');
    setFormIsPublished(item.published || item.status === 'published');
    setUploadError(null);
    setIsEditorOpen(true);
  };

  // Handle PDF file selection from computer
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF documents (.pdf) are supported for bulletin announcements.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(10);

      const result = await uploadLargeFileChunked(
        file,
        'bulletins',
        (pct) => setUploadProgress(pct)
      );

      if (result.success && result.url) {
        setFormPdfUrl(result.url);
        setFormFileName(result.fileName || file.name);
        setFormFileSize(result.size || file.size);
        setFormFormattedSize(formatBytes(result.size || file.size));
        setUploadProgress(100);
      } else {
        setUploadError(result.error || 'Failed to upload PDF file. Please try again.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error occurred during PDF upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Save or Update Bulletin
  const handleSaveBulletin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setUploadError('Announcement Title is required.');
      return;
    }
    if (!formDescription.trim()) {
      setUploadError('Announcement Description is required.');
      return;
    }
    if (!formPdfUrl.trim()) {
      setUploadError('A valid PDF document must be selected or uploaded.');
      return;
    }

    const tagsArray = formTagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (editingBulletin) {
      // Update
      await updateBulletin(editingBulletin.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        pdf_url: formPdfUrl.trim(),
        file_name: formFileName,
        file_size: formFileSize,
        formatted_file_size: formFormattedSize,
        department: formDepartment.trim(),
        priority: formPriority,
        tags: tagsArray,
        published: formIsPublished,
        status: formIsPublished ? 'published' : 'draft',
      });
    } else {
      // Create
      await createBulletin({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        pdf_url: formPdfUrl.trim(),
        file_name: formFileName,
        file_size: formFileSize,
        formatted_file_size: formFormattedSize,
        department: formDepartment.trim() || 'Corporate Communications',
        priority: formPriority,
        tags: tagsArray,
        published: formIsPublished,
        status: formIsPublished ? 'published' : 'draft',
        published_at: new Date().toISOString(),
        author_id: currentUser.id,
        author_name: currentUser.full_name,
        verified: true,
      });
    }

    setIsEditorOpen(false);
  };

  // Delete Announcement
  const handleDelete = async (id: string) => {
    await deleteBulletin(id);
    setDeleteConfirmId(null);
  };

  // Quick Toggle Publish Status
  const handleTogglePublish = async (item: CompanyBulletinItem) => {
    const nextStatus = !item.published;
    await updateBulletin(item.id, {
      published: nextStatus,
      status: nextStatus ? 'published' : 'draft',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Company Bulletin Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#176B98]/10 text-[#176B98]">
              {companyBulletins.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish, edit, and manage official PDF announcements, sales campaigns, and policy notices.
            Changes automatically propagate to all authorized learners in the User Panel.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Announcement</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Published Active</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">
              {companyBulletins.filter((b) => b.published || b.status === 'published').length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Live in User Panel
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Campaigns</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">
              {companyBulletins.filter((b) => b.category === 'Campaign').length}
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Agency & Bank
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Policy Memos</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">
              {companyBulletins.filter((b) => b.category === 'Policy Memo').length}
            </span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Mandatory Read
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Drafts / Pending</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">
              {companyBulletins.filter((b) => !b.published && b.status !== 'published').length}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Hidden from Users
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, reference number, or tag..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#176B98]/20"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#176B98]/20"
          >
            <option value="all">All Categories</option>
            <option value="Campaign">Campaigns</option>
            <option value="Policy Memo">Policy Memos</option>
            <option value="Announcement">Announcements</option>
            <option value="Notice">Notices</option>
            <option value="Incentive">Incentives</option>
          </select>
        </div>
      </div>

      {/* Bulletins List Table / Cards */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-800">No announcements match your search</p>
          <p className="text-xs text-slate-500">
            Click "Publish New Announcement" above to upload a PDF and broadcast a corporate bulletin.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredList.map((item) => {
              const isLive = item.published || item.status === 'published';

              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Icon + Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#176B98]/10 text-[#176B98] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#176B98]" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isLive ? 'Published' : 'Draft'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>

                        {item.priority === 'urgent' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-red-100 text-red-700">
                            URGENT
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 hover:text-[#176B98] transition-colors leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-slate-600">{item.file_name || 'document.pdf'}</span>
                          {item.formatted_file_size && (
                            <span className="text-slate-400">({item.formatted_file_size})</span>
                          )}
                        </span>

                        {item.department && <span>• {item.department}</span>}
                        <span>• {new Date(item.published_at || item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Toolbar */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* View PDF in In-App Reader */}
                    <button
                      onClick={() => setActivePdfPreview(item)}
                      className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="View PDF Document"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">View PDF</span>
                    </button>

                    {/* Quick Toggle Live/Draft */}
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isLive
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                      title={isLive ? 'Unpublish Announcement' : 'Publish to User Panel'}
                    >
                      {isLive ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isLive ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#176B98]/10 hover:bg-[#176B98] text-[#176B98] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Edit Announcement"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200/60"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          CREATE / EDIT ANNOUNCEMENT MODAL
          ===================================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#176B98] text-white flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingBulletin ? 'Edit Announcement' : 'Publish New Announcement'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Upload official PDF documents and configure public announcement details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulletin} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Q4 2026 Nationwide Sales Campaign: Accelerate to Zenith"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide a concise 2-3 sentence overview describing the purpose, key directives, and target audience..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                />
              </div>

              {/* Row: Category + Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as BulletinCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#176B98]/20"
                  >
                    <option value="Campaign">Campaign</option>
                    <option value="Policy Memo">Policy Memo</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Notice">Notice</option>
                    <option value="Incentive">Incentive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#176B98]/20"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent / Critical</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Issuing Department
                </label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="e.g. Sales & Agency Directorate"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B98]/20"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tag Pills (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formTagsString}
                  onChange={(e) => setFormTagsString(e.target.value)}
                  placeholder="e.g. campaign, q4 target, bancassurance, incentives"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B98]/20"
                />
              </div>

              {/* =====================================================================
                  PDF UPLOAD & FILE PICKER
                  ===================================================================== */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#176B98]" />
                    <span>PDF Document Attachment *</span>
                  </label>
                  {formPdfUrl && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Document Attached</span>
                    </span>
                  )}
                </div>

                {/* Upload from Computer */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-[#176B98] border border-[#176B98]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? `Uploading (${uploadProgress}%)...` : 'Upload PDF from Device'}</span>
                  </button>

                  <span className="text-xs text-slate-400 text-center sm:text-left">
                    or select from standard corporate handbooks below:
                  </span>
                </div>

                {/* Quick Sample Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {AVAILABLE_SAMPLE_PDFS.map((sample) => {
                    const isSelected = formPdfUrl === sample.url;
                    return (
                      <button
                        type="button"
                        key={sample.url}
                        onClick={() => {
                          setFormPdfUrl(sample.url);
                          setFormFileName(sample.fileName);
                          setFormFormattedSize(sample.size);
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#176B98] text-white border-[#176B98] shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate">{sample.name}</p>
                          <p className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {sample.size}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {/* Display Current Selected PDF */}
                {formPdfUrl && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-4 h-4 text-[#176B98] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-slate-900 truncate">
                          {formFileName || 'document.pdf'}
                        </p>
                        <p className="text-[10px] text-slate-500">{formFormattedSize || 'PDF Document'}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActivePdfPreview({
                          id: 'preview',
                          title: formTitle || 'Preview Document',
                          description: formDescription,
                          category: formCategory,
                          pdf_url: formPdfUrl,
                          file_name: formFileName,
                          published: true,
                          status: 'published',
                          published_at: new Date().toISOString(),
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Publish to User Panel Immediately</p>
                  <p className="text-[11px] text-slate-500">
                    If checked, this announcement will be instantly accessible to all regular users.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#176B98]"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingBulletin ? 'Save Changes' : 'Publish Announcement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION MODAL
          ===================================================================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Delete Announcement?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this bulletin? It will be permanently removed from both
                the Admin Console and the User Panel.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PDF PREVIEW MODAL (View-Only, Watermarked)
          ===================================================================== */}
      {activePdfPreview && (
        <PdfViewerModal
          isOpen={!!activePdfPreview}
          onClose={() => setActivePdfPreview(null)}
          fileUrl={activePdfPreview.pdf_url}
          title={activePdfPreview.title}
          subtitle={`Admin Document Preview · ${activePdfPreview.category}`}
          fileName={activePdfPreview.file_name}
          watermarkContextLabel="CONFIDENTIAL ADMIN PREVIEW"
        />
      )}
    </div>
  );
};
