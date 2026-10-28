import React, { useState, useEffect } from 'react';
import { useLms } from '../context/LmsContext';
import { CompanyVideoItem } from '../types/lms';
import {
  Video,
  Play,
  Calendar,
  ExternalLink,
  X,
  Film,
  AlertCircle,
  Search,
} from 'lucide-react';
import { parseVideoUrl } from '../lib/videoUtils';

interface CompanyUpdateVideoPageProps {
  onBackToOverview?: () => void;
}

export const CompanyUpdateVideoPage: React.FC<CompanyUpdateVideoPageProps> = () => {
  const { getPublishedVideos } = useLms();
  const publishedVideos = getPublishedVideos();

  const [activeVideo, setActiveVideo] = useState<CompanyVideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lock background scroll when video player modal is open
  useEffect(() => {
    if (!activeVideo) return;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideo]);

  // Case-insensitive search filtering across video title and description
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredVideos = trimmedQuery
    ? publishedVideos.filter((v) => {
        const titleMatch = v.title.toLowerCase().includes(trimmedQuery);
        const descMatch = v.description
          ? v.description.toLowerCase().includes(trimmedQuery)
          : false;
        return titleMatch || descMatch;
      })
    : publishedVideos;

  return (
    <div className="py-12 lg:py-16 bg-light-blue-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Minimalist Compact Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-[#1E426D] text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#176B98] dark:text-[#38BDF8] uppercase tracking-wider">
              <Film className="w-4 h-4 text-[#176B98] dark:text-[#38BDF8]" />
              <span>Broadcast Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#176B98] dark:text-[#38BDF8] tracking-tight">
              Company Update Videos
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Internal video broadcasts, executive communications, and employee development briefings playable directly in the KBZLife LMS.
            </p>
          </div>

          {/* Compact, Minimalist Video Search Bar (Replaces Category Pills) */}
          <div className="w-full md:w-72 relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#737373] dark:text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] rounded-xl text-slate-800 dark:text-slate-100 placeholder-[#737373] dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176B98] focus:border-transparent shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 p-1 text-[#737373] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-[#153252] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {trimmedQuery && (
              <p className="text-[11px] text-[#737373] dark:text-slate-400 mt-1 text-right">
                {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} found
              </p>
            )}
          </div>
        </div>

        {/* Video Cards Grid */}
        {filteredVideos.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200 dark:border-[#1E426D] max-w-md mx-auto shadow-2xs">
            <Video className="w-12 h-12 text-[#737373] dark:text-slate-400 opacity-60 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {searchQuery ? 'No matching videos found' : 'No company update videos available.'}
            </h3>
            <p className="text-xs text-[#737373] dark:text-slate-400 mt-1">
              {searchQuery
                ? `No videos match "${searchQuery}". Try searching with a different term.`
                : 'Internal broadcasts and leadership recordings will be listed here once published.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[#176B98] text-white hover:bg-[#135A80] transition-colors cursor-pointer"
              >
                Clear Search Query
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => {
              const parsed = parseVideoUrl(video.video_url);
              const thumbnail =
                video.thumbnail_url ||
                parsed.thumbnailUrl ||
                (parsed.videoId && parsed.provider === 'youtube'
                  ? `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`
                  : null);

              return (
                <div
                  key={video.id}
                  className="bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200/90 dark:border-[#1E426D] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#176B98]/40 dark:hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between group text-left"
                >
                  <div>
                    {/* Video Thumbnail Area with Play Overlay */}
                    <div
                      onClick={() => setActiveVideo(video)}
                      className="aspect-16/9 bg-slate-900 relative overflow-hidden cursor-pointer flex items-center justify-center group"
                    >
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={video.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#176B98] flex items-center justify-center">
                          <Film className="w-10 h-10 text-white/50" />
                        </div>
                      )}

                      {/* Dark gradient scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                      {/* Play Button Icon */}
                      <div className="absolute w-14 h-14 rounded-full bg-[#176B98] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#135A80] transition-all">
                        <Play className="w-6 h-6 ml-1 fill-white text-white" />
                      </div>

                      {/* Duration Tag if supplied */}
                      {video.duration && (
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white font-mono text-[11px] font-semibold">
                          {video.duration}
                        </div>
                      )}

                      {/* Category Tag */}
                      {video.category && (
                        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[#176B98] text-[10px] font-bold uppercase tracking-wider">
                          {video.category}
                        </div>
                      )}
                    </div>

                    {/* Information Area */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {video.published_at
                            ? new Date(video.published_at).toLocaleDateString()
                            : new Date(video.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3
                        onClick={() => setActiveVideo(video)}
                        className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#176B98] dark:group-hover:text-[#38BDF8] transition-colors leading-snug cursor-pointer line-clamp-2"
                      >
                        {video.title}
                      </h3>

                      {video.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 mt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#1E426D] pt-3">
                    <button
                      onClick={() => setActiveVideo(video)}
                      className="font-bold text-[#176B98] dark:text-[#38BDF8] hover:text-[#135A80] dark:hover:text-[#7DD3FC] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#176B98] dark:fill-[#38BDF8]" />
                      <span>Watch Video</span>
                    </button>

                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#737373] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                      title="Open source URL in new tab"
                    >
                      <span>Direct Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EMBEDDED GENUINELY PLAYABLE VIDEO MODAL PLAYER WITH SCROLL-LOCK */}
        {activeVideo && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveVideo(null);
            }}
          >
            <div
              className="bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-800 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200">
                    KBZLife Internal Broadcast Player
                  </span>
                  {activeVideo.category && (
                    <span className="text-[10px] uppercase font-bold text-white bg-[#176B98] px-2 py-0.5 rounded">
                      {activeVideo.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close video player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Responsive Player Area (YouTube / Vimeo / Direct HTML5 Video / Safe Fallback) */}
              <div className="aspect-16/9 w-full bg-black relative">
                {(() => {
                  const parsed = parseVideoUrl(activeVideo.video_url);

                  // 1. YouTube Player
                  if (parsed.provider === 'youtube' && parsed.videoId) {
                    return (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${parsed.videoId}?autoplay=1&rel=0&modestbranding=1`}
                        title={activeVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  }

                  // 2. Vimeo Player
                  if (parsed.provider === 'vimeo' && parsed.videoId) {
                    return (
                      <iframe
                        className="w-full h-full"
                        src={`https://player.vimeo.com/video/${parsed.videoId}?autoplay=1&dnt=1`}
                        title={activeVideo.title}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }

                  // 3. Direct HTML5 Video (MP4 / WebM / Supabase Storage)
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

                  // 4. Safe Error / Fallback with direct link
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950">
                      <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                      <h4 className="text-base font-bold mb-1">Direct Embed Restricted</h4>
                      <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                        This video host restricts in-frame embedding or requires dedicated portal authentication. You can open and stream the broadcast directly in a secure new tab.
                      </p>
                      <a
                        href={activeVideo.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-[#176B98] hover:bg-[#135A80] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-md"
                      >
                        <span>Open Video in New Tab</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })()}
              </div>

              {/* Video Info under Player */}
              <div className="p-6 bg-slate-900 text-white space-y-3">
                <h2 id="video-modal-title" className="text-lg sm:text-xl font-bold leading-tight">
                  {activeVideo.title}
                </h2>
                {activeVideo.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeVideo.description}
                  </p>
                )}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    {activeVideo.category && <span>Category: {activeVideo.category}</span>}
                    {activeVideo.duration && <span>Duration: {activeVideo.duration}</span>}
                    <span>
                      Published:{' '}
                      {activeVideo.published_at
                        ? new Date(activeVideo.published_at).toLocaleDateString()
                        : new Date(activeVideo.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <a
                    href={activeVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 font-medium"
                  >
                    <span>External Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
