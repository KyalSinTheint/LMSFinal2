import React, { useState, useRef } from 'react';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Clock,
  AlertTriangle,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Check,
  Video as VideoIcon,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { CompanyVideoItem } from '../../types/lms';
import { parseVideoUrl } from '../../lib/videoUtils';
import { uploadImageFile, validateImageFile } from '../../lib/storageUtils';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

export const CompanyVideosManagement: React.FC = () => {
  const { companyVideos, createVideo, updateVideo, deleteVideo } = useLms();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Video preview player state for admin testing
  const [activePlayerVideo, setActivePlayerVideo] = useState<CompanyVideoItem | null>(null);

  // File input ref for custom thumbnail upload
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Video Modal State
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    id?: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    category: string;
    display_order: number;
    duration: string;
    status: 'draft' | 'published';
  }>({
    isOpen: false,
    isEditing: false,
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'Leadership Address',
    display_order: 1,
    duration: '12:00',
    status: 'published',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: '',
  });

  useBodyScrollLock(videoModal.isOpen || deleteConfirm.isOpen || !!activePlayerVideo);

  const filtered = companyVideos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setThumbnailError(null);
    setVideoModal({
      isOpen: true,
      isEditing: false,
      title: '',
      description: '',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: '',
      category: 'Leadership Address',
      display_order: companyVideos.length + 1,
      duration: '14:20',
      status: 'published',
    });
  };

  const handleOpenEdit = (v: CompanyVideoItem) => {
    setThumbnailError(null);
    setVideoModal({
      isOpen: true,
      isEditing: true,
      id: v.id,
      title: v.title,
      description: v.description,
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url || '',
      category: v.category,
      display_order: v.display_order,
      duration: v.duration || '10:00',
      status: v.status,
    });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setThumbnailError(validation.error || 'Invalid image file.');
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const res = await uploadImageFile(file, 'video-thumbnails');
      if (res.success && res.url) {
        setVideoModal((prev) => ({ ...prev, thumbnail_url: res.url! }));
      } else {
        setThumbnailError(res.error || 'Failed to upload thumbnail.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setThumbnailError(msg || 'Upload failed.');
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  const handleSave = async (explicitStatus?: 'draft' | 'published') => {
    const finalStatus = explicitStatus || videoModal.status;
    const parsed = parseVideoUrl(videoModal.video_url);

    // If no custom thumbnail was provided, use provider thumbnail if available
    const effectiveThumbnail =
      videoModal.thumbnail_url ||
      parsed.thumbnailUrl ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

    if (videoModal.isEditing && videoModal.id) {
      await updateVideo(videoModal.id, {
        title: videoModal.title.trim(),
        description: videoModal.description.trim(),
        video_url: videoModal.video_url.trim(),
        thumbnail_url: effectiveThumbnail,
        category: videoModal.category,
        display_order: Number(videoModal.display_order),
        duration: videoModal.duration.trim() || '10:00',
        status: finalStatus,
      });
    } else {
      await createVideo({
        title: videoModal.title.trim(),
        description: videoModal.description.trim(),
        video_url: videoModal.video_url.trim(),
        thumbnail_url: effectiveThumbnail,
        category: videoModal.category,
        display_order: Number(videoModal.display_order),
        duration: videoModal.duration.trim() || '10:00',
        status: finalStatus,
      });
    }
    setVideoModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleTogglePublish = async (video: CompanyVideoItem) => {
    const newStatus = video.status === 'published' ? 'draft' : 'published';
    await updateVideo(video.id, { status: newStatus });
  };

  // Real-time parsed details for the current URL in the edit/create modal
  const modalParsedVideo = parseVideoUrl(videoModal.video_url);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Film className="w-5 h-5 text-[#176B98]" />
            <span>Company Update Videos & Broadcasts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage executive communications, leadership briefings, and video streams. Direct playback testing and live synchronization with User Panel.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video Broadcast</span>
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
            placeholder="Search videos by title, category, or description..."
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
            <option value="all">All Videos ({companyVideos.length})</option>
            <option value="published">Published ({companyVideos.filter((v) => v.status === 'published').length})</option>
            <option value="draft">Drafts ({companyVideos.filter((v) => v.status === 'draft').length})</option>
          </select>
        </div>
      </div>

      {/* Videos Grid with Interactive Playback Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((video) => {
          const isPublished = video.status === 'published';
          const parsed = parseVideoUrl(video.video_url);
          const thumb =
            video.thumbnail_url ||
            parsed.thumbnailUrl ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

          return (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-sky-300 transition-all hover:shadow-md text-left"
            >
              <div>
                {/* Clickable Video Thumbnail with Working Play Overlay */}
                <div
                  onClick={() => setActivePlayerVideo(video)}
                  className="relative h-44 w-full overflow-hidden bg-slate-900 group cursor-pointer"
                  title="Click to test video playback"
                >
                  <img
                    src={thumb}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#176B98] group-hover:bg-[#12567a] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                    </div>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#176B98]/90 text-white backdrop-blur-xs">
                      {video.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-xs ${
                        isPublished ? 'bg-emerald-600/90 text-white' : 'bg-slate-700/90 text-white'
                      }`}
                    >
                      {video.status}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs font-mono">
                    {video.duration || '10:00'}
                  </div>

                  {/* Provider Pill */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 text-sky-300 text-[10px] font-bold backdrop-blur-xs capitalize">
                    {parsed.provider}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3
                    onClick={() => setActivePlayerVideo(video)}
                    className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-[#176B98] cursor-pointer"
                  >
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{video.description}</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleTogglePublish(video)}
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
                    onClick={() => setActivePlayerVideo(video)}
                    title="Test Play Video"
                    className="p-1.5 rounded-lg border border-sky-200 text-[#176B98] bg-sky-50 hover:bg-sky-100 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#176B98]" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(video)}
                    title="Edit Video Information"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: video.id, title: video.title })}
                    title="Delete Video"
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

      {/* CREATE / EDIT VIDEO MODAL WITH LIVE PREVIEW */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#176B98] flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {videoModal.isEditing ? 'Edit Company Video Broadcast' : 'Add New Video Broadcast'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter video details and verify playback in real-time before saving.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVideoModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Video Title *</label>
              <input
                type="text"
                value={videoModal.title}
                onChange={(e) => setVideoModal((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. CEO Address: Strategic Vision for Life Protection in Myanmar"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Video URL (YouTube, Vimeo, or Direct MP4) *
                </label>
                <span className="text-[10px] font-semibold text-slate-500">
                  Provider: <span className="text-[#176B98] uppercase font-bold">{modalParsedVideo.provider}</span>
                </span>
              </div>
              <input
                type="text"
                value={videoModal.video_url}
                onChange={(e) => setVideoModal((prev) => ({ ...prev, video_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Accepts standard YouTube links, youtu.be, YouTube Shorts, Vimeo, or direct MP4 URLs.
              </p>
            </div>

            {/* LIVE VIDEO PREVIEW IN ADMIN FORM */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Live Playback Preview Verification
              </label>

              {modalParsedVideo.isEmbeddable ? (
                <div className="aspect-16/9 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                  {modalParsedVideo.provider === 'youtube' && modalParsedVideo.videoId && (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${modalParsedVideo.videoId}?autoplay=0&rel=0`}
                      title="Admin Video Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {modalParsedVideo.provider === 'vimeo' && modalParsedVideo.videoId && (
                    <iframe
                      className="w-full h-full"
                      src={`https://player.vimeo.com/video/${modalParsedVideo.videoId}`}
                      title="Admin Video Preview"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {modalParsedVideo.provider === 'direct' && modalParsedVideo.directPlayableUrl && (
                    <video
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                      src={modalParsedVideo.directPlayableUrl}
                    >
                      <source src={modalParsedVideo.directPlayableUrl} />
                    </video>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>External URL Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    {modalParsedVideo.errorMessage ||
                      'This URL host does not support direct in-frame embedding. A safe "Open Video" button will be provided to learners in the User Panel.'}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={videoModal.category}
                  onChange={(e) => setVideoModal((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                >
                  <option value="Leadership Address">Leadership Address</option>
                  <option value="Training & Ethics">Training & Ethics</option>
                  <option value="Product Foundation">Product Foundation</option>
                  <option value="Operational Updates">Operational Updates</option>
                  <option value="Town Hall Briefing">Town Hall Briefing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration (MM:SS)</label>
                <input
                  type="text"
                  placeholder="e.g. 14:20"
                  value={videoModal.duration}
                  onChange={(e) => setVideoModal((prev) => ({ ...prev, duration: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={videoModal.description}
                onChange={(e) => setVideoModal((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief summary of video contents..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            {/* Custom Thumbnail Upload & Fallback */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Custom Video Thumbnail</label>

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailUpload}
                className="hidden"
                id="video-thumbnail-file-input"
              />

              {thumbnailError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{thumbnailError}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={isUploadingThumbnail}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail File'}</span>
                </button>

                {modalParsedVideo.thumbnailUrl && !videoModal.thumbnail_url && (
                  <button
                    type="button"
                    onClick={() => setVideoModal((prev) => ({ ...prev, thumbnail_url: modalParsedVideo.thumbnailUrl! }))}
                    className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#176B98] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Use Provider Thumbnail
                  </button>
                )}

                {videoModal.thumbnail_url && (
                  <button
                    type="button"
                    onClick={() => setVideoModal((prev) => ({ ...prev, thumbnail_url: '' }))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear custom thumbnail
                  </button>
                )}
              </div>

              {videoModal.thumbnail_url && (
                <div className="mt-2 h-24 w-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={videoModal.thumbnail_url}
                    alt="Thumbnail preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* ACTION BUTTONS: DRAFT VS PUBLISH */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVideoModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={!videoModal.title.trim() || !videoModal.video_url.trim()}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={!videoModal.title.trim() || !videoModal.video_url.trim()}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Publish Video</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL ADMIN PLAYBACK TESTING MODAL */}
      {activePlayerVideo && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-800 text-left">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">
                  Admin Broadcast Verification Player
                </span>
                <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  Status: {activePlayerVideo.status}
                </span>
              </div>
              <button
                onClick={() => setActivePlayerVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-16/9 w-full bg-black relative">
              {(() => {
                const parsed = parseVideoUrl(activePlayerVideo.video_url);

                if (parsed.provider === 'youtube' && parsed.videoId) {
                  return (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${parsed.videoId}?autoplay=1&rel=0`}
                      title={activePlayerVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                if (parsed.provider === 'vimeo' && parsed.videoId) {
                  return (
                    <iframe
                      className="w-full h-full"
                      src={`https://player.vimeo.com/video/${parsed.videoId}?autoplay=1&dnt=1`}
                      title={activePlayerVideo.title}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                if (parsed.provider === 'direct' && parsed.directPlayableUrl) {
                  return (
                    <video
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                      src={parsed.directPlayableUrl}
                    >
                      <source src={parsed.directPlayableUrl} />
                      Your browser does not support the video tag.
                    </video>
                  );
                }

                return (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950">
                    <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                    <h4 className="text-base font-bold mb-1">Direct In-Frame Embed Restricted</h4>
                    <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                      This external video provider restricts iframe embedding or requires dedicated portal sign-in. You can test streaming the video directly in a secure new tab.
                    </p>
                    <a
                      href={activePlayerVideo.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-[#176B98] hover:bg-[#12567a] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-md"
                    >
                      <span>Open Video Source in New Tab</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 bg-slate-900 text-white space-y-2">
              <h2 className="text-lg font-bold">{activePlayerVideo.title}</h2>
              {activePlayerVideo.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{activePlayerVideo.description}</p>
              )}
              <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>Category: {activePlayerVideo.category} · Duration: {activePlayerVideo.duration}</span>
                <a
                  href={activePlayerVideo.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Direct URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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
                <h3 className="font-bold text-base text-slate-900">Delete Video Broadcast</h3>
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
                  await deleteVideo(deleteConfirm.id);
                  setDeleteConfirm({ isOpen: false, id: '', title: '' });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Delete Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
