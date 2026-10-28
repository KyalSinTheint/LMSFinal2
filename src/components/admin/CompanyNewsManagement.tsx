import React, { useState, useRef } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { CompanyNewsArticle } from '../../types/lms';
import { uploadImageFile, validateImageFile } from '../../lib/storageUtils';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

export const CompanyNewsManagement: React.FC = () => {
  const { companyNews, createNews, updateNews, deleteNews } = useLms();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // File input ref for direct computer/mobile image selection
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [newsModal, setNewsModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    id?: string;
    title: string;
    summary: string;
    content: string; // newline separated paragraphs
    cover_image_url: string;
    category: string;
    status: 'draft' | 'published';
    is_featured: boolean;
    author_name: string;
    read_time_minutes: number;
    published_at: string;
  }>({
    isOpen: false,
    isEditing: false,
    title: '',
    summary: '',
    content: '',
    cover_image_url: '',
    category: 'Corporate Milestone',
    status: 'published',
    is_featured: false,
    author_name: 'Internal Communications Desk',
    read_time_minutes: 3,
    published_at: new Date().toISOString().split('T')[0],
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: '',
  });

  useBodyScrollLock(newsModal.isOpen || deleteConfirm.isOpen);

  const filtered = companyNews.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setUploadError(null);
    setUploadSuccessMsg(null);
    setNewsModal({
      isOpen: true,
      isEditing: false,
      title: '',
      summary: '',
      content: '',
      cover_image_url:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      category: 'Corporate Milestone',
      status: 'published',
      is_featured: false,
      author_name: 'Internal Communications Desk',
      read_time_minutes: 3,
      published_at: new Date().toISOString().split('T')[0],
    });
  };

  const handleOpenEdit = (article: CompanyNewsArticle) => {
    setUploadError(null);
    setUploadSuccessMsg(null);
    setNewsModal({
      isOpen: true,
      isEditing: true,
      id: article.id,
      title: article.title,
      summary: article.summary,
      content: article.content.join('\n\n'),
      cover_image_url: article.cover_image_url,
      category: article.category,
      status: article.status,
      is_featured: article.is_featured,
      author_name: article.author_name || 'Internal Communications Desk',
      read_time_minutes: article.read_time_minutes || 3,
      published_at: article.published_at ? article.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
    });
  };

  // Direct image upload from computer or phone file picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const res = await uploadImageFile(file, 'company-news');
      if (res.success && res.url) {
        setNewsModal((prev) => ({ ...prev, cover_image_url: res.url! }));
        setUploadSuccessMsg('Image uploaded directly to Supabase Storage!');
        setTimeout(() => setUploadSuccessMsg(null), 4000);
      } else {
        setUploadError(res.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg || 'Upload failed.');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be re-selected if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setNewsModal((prev) => ({ ...prev, cover_image_url: '' }));
    setUploadSuccessMsg(null);
    setUploadError(null);
  };

  const handleSave = async (explicitStatus?: 'draft' | 'published') => {
    const paragraphs = newsModal.content
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const finalStatus = explicitStatus || newsModal.status;

    if (newsModal.isEditing && newsModal.id) {
      await updateNews(newsModal.id, {
        title: newsModal.title,
        summary: newsModal.summary,
        content: paragraphs.length > 0 ? paragraphs : [newsModal.summary],
        cover_image_url: newsModal.cover_image_url,
        category: newsModal.category,
        status: finalStatus,
        is_featured: newsModal.is_featured,
        author_name: newsModal.author_name,
        read_time_minutes: Number(newsModal.read_time_minutes),
        published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      });
    } else {
      await createNews({
        title: newsModal.title,
        summary: newsModal.summary,
        content: paragraphs.length > 0 ? paragraphs : [newsModal.summary],
        cover_image_url:
          newsModal.cover_image_url ||
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        category: newsModal.category,
        status: finalStatus,
        is_featured: newsModal.is_featured,
        author_name: newsModal.author_name,
        read_time_minutes: Number(newsModal.read_time_minutes),
        published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      });
    }
    setNewsModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleTogglePublish = async (article: CompanyNewsArticle) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    await updateNews(article.id, {
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#176B98]" />
            <span>Company News & Gazette Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, publish news articles, and upload images directly to Supabase Storage. Published articles sync live to the User Panel.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write News Article</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news by title, category, or summary..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176B98] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#176B98]"
          >
            <option value="all">All News ({companyNews.length})</option>
            <option value="published">Published ({companyNews.filter((n) => n.status === 'published').length})</option>
            <option value="draft">Drafts ({companyNews.filter((n) => n.status === 'draft').length})</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((article) => {
          const isPublished = article.status === 'published';

          return (
            <div
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-sky-300 transition-all hover:shadow-md"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#176B98]/90 text-white backdrop-blur-xs">
                      {article.category}
                    </span>
                    {article.is_featured && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-xs ${
                        isPublished ? 'bg-emerald-600/90 text-white' : 'bg-slate-700/90 text-white'
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString()
                        : new Date(article.created_at).toLocaleDateString()}
                    </span>
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    <span>{article.read_time_minutes || 3} min read</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{article.summary}</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleTogglePublish(article)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    isPublished
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{isPublished ? 'Published' : 'Draft (Hidden)'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(article)}
                    title="Edit News Article"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: article.id, title: article.title })}
                    title="Delete News Article"
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

      {/* CREATE / EDIT ARTICLE MODAL WITH DIRECT IMAGE UPLOAD */}
      {newsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#176B98] flex items-center justify-center">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {newsModal.isEditing ? 'Edit Company News Article' : 'Write Company News Article'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct image upload to Supabase Storage with instant synchronization.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNewsModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Article Headline *</label>
              <input
                type="text"
                value={newsModal.title}
                onChange={(e) => setNewsModal((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. KBZLife Expands Bancassurance Advisory Centers..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newsModal.category}
                  onChange={(e) => setNewsModal((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                >
                  <option value="Corporate Milestone">Corporate Milestone</option>
                  <option value="Operations">Operations</option>
                  <option value="Channel Growth">Channel Growth</option>
                  <option value="Compliance">Compliance & Legal</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Author Name / Byline</label>
                <input
                  type="text"
                  value={newsModal.author_name}
                  onChange={(e) => setNewsModal((prev) => ({ ...prev, author_name: e.target.value }))}
                  placeholder="e.g. Internal Communications Desk"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary (Excerpt) *</label>
              <textarea
                rows={2}
                value={newsModal.summary}
                onChange={(e) => setNewsModal((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Concise overview shown in news cards..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Article Content (Separate paragraphs with double Enter)
              </label>
              <textarea
                rows={4}
                value={newsModal.content}
                onChange={(e) => setNewsModal((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Full article paragraphs..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            {/* DIRECT IMAGE UPLOAD SECTION */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Cover Image (Direct File Upload to Supabase Storage) *
              </label>

              {/* Hidden file picker input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                id="news-image-file-input"
              />

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload Success Banner */}
              {uploadSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* Selected Image Preview Box */}
              {newsModal.cover_image_url ? (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 group">
                  <img
                    src={newsModal.cover_image_url}
                    alt="Cover preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-48 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1.5">
                    <FileCheck className="w-3 h-3 text-emerald-400" />
                    <span>Saved in Supabase Storage</span>
                  </div>
                </div>
              ) : (
                /* Empty Upload Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-300 hover:border-[#176B98] bg-sky-50/50 hover:bg-sky-50 transition-colors rounded-2xl p-6 text-center cursor-pointer space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#176B98] border border-sky-200 shadow-2xs flex items-center justify-center mx-auto">
                    {isUploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-[#176B98]" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {isUploading ? 'Uploading to Supabase Storage...' : 'Click to select image from your device'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supported formats: JPG, PNG, WebP (Max 5 MB)
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Browse Device Files</span>
                  </button>
                </div>
              )}

              {/* Optional URL Override for flexibility */}
              <div className="pt-1">
                <details className="text-[11px] text-slate-500 cursor-pointer">
                  <summary className="hover:text-slate-700">Or paste an existing image URL manually</summary>
                  <input
                    type="text"
                    value={newsModal.cover_image_url}
                    onChange={(e) => setNewsModal((prev) => ({ ...prev, cover_image_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1.5 focus:ring-1 focus:ring-[#176B98] focus:outline-none"
                  />
                </details>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_featured"
                checked={newsModal.is_featured}
                onChange={(e) => setNewsModal((prev) => ({ ...prev, is_featured: e.target.checked }))}
                className="rounded border-slate-300 text-[#176B98] focus:ring-[#176B98]"
              />
              <label htmlFor="is_featured" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Mark as Featured Lead Gazette Story
              </label>
            </div>

            {/* ACTION BUTTONS: SAVE AS DRAFT VS PUBLISH */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewsModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={!newsModal.title.trim() || isUploading}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={!newsModal.title.trim() || isUploading}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Publish to Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete News Article</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete "{deleteConfirm.title}" from Supabase?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteNews(deleteConfirm.id);
                  setDeleteConfirm({ isOpen: false, id: '', title: '' });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
