import React, { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import { SkillDevelopmentResource, SkillCategory } from '../../types/lms';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';
import { formatBytes } from '../../lib/storageUtils';
import {
  Compass,
  Play,
  FileText,
  ExternalLink,
  Search,
  Clock,
  HardDrive,
  X,
  BookOpen,
  Eye,
  CheckCircle2,
  Globe,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { PdfThumbnail } from '../common/PdfThumbnail';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { SkillVideoPlayerModal } from './SkillVideoPlayerModal';
import { ExternalLinkModal } from './ExternalLinkModal';
import { SkillQuizModal } from './SkillQuizModal';

export const SkillDevelopmentPage: React.FC = () => {
  const { getPublishedSkillCategories, getPublishedSkillResources, getLessonProgress } = useLms();
  const publishedCategories = getPublishedSkillCategories();
  const publishedResources = getPublishedSkillResources();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'pdf' | 'link'>('all');

  // Selected modals
  const [selectedVideoResource, setSelectedVideoResource] = useState<SkillDevelopmentResource | null>(null);
  const [selectedPdfResource, setSelectedPdfResource] = useState<SkillDevelopmentResource | null>(null);
  const [selectedLinkResource, setSelectedLinkResource] = useState<SkillDevelopmentResource | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [quizCategoryTarget, setQuizCategoryTarget] = useState<{ id?: string; name: string } | null>(null);

  // Lock body scroll when any viewer modal is open
  useBodyScrollLock(!!selectedVideoResource || !!selectedPdfResource || !!selectedLinkResource || isQuizModalOpen);

  // Filter resources based on category, format tab, and search query
  const filteredResources = useMemo(() => {
    let list = publishedResources;

    // Filter by selected category
    if (selectedCategory !== 'all') {
      list = list.filter(
        (r) =>
          (r.category_id && r.category_id === selectedCategory) ||
          r.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          r.topic?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by format tab
    if (activeTab !== 'all') {
      list = list.filter((r) => r.content_type === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.category?.toLowerCase().includes(q) ||
          r.topic?.toLowerCase().includes(q) ||
          (r.instructor_name && r.instructor_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [publishedResources, selectedCategory, activeTab, searchQuery]);

  const videoCount = publishedResources.filter((r) => r.content_type === 'video').length;
  const pdfCount = publishedResources.filter((r) => r.content_type === 'pdf').length;
  const linkCount = publishedResources.filter((r) => r.content_type === 'link').length;

  return (
    <div className="space-y-8 py-4 text-left">
      {/* 1. Page Header Banner (Adhering to zero-pill discipline and matching Licence Training design) */}
      <div className="bg-gradient-to-r from-[#176B98]/12 via-[#176B98]/6 to-white dark:from-[#0E2035] dark:via-[#10243C] dark:to-[#0B131E] p-6 sm:p-8 rounded-3xl border border-[#176B98]/15 dark:border-[#1E426D] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            {/* Zero-pill unboxed kicker */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#176B98] dark:text-[#38bdf8] uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
              <span>Professional Capabilities & Enterprise Skills Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight">
              Skill Development Library
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Master business English communications, Microsoft Excel automation, executive leadership coaching, and digital operating workflows. Stream high-definition lessons, review handbooks with personalized watermarks, or explore curated external reference materials.
            </p>
          </div>

          {/* Quick Stats Counters */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/95 dark:bg-[#10243C] backdrop-blur-xs px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-[#1E426D] shadow-2xs text-center min-w-[95px]">
              <span className="block text-2xl font-extrabold text-[#176B98] dark:text-[#38bdf8] tabular-nums">
                {publishedResources.length}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Classes
              </span>
            </div>
            <div className="bg-white/95 dark:bg-[#10243C] backdrop-blur-xs px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-[#1E426D] shadow-2xs text-center min-w-[95px]">
              <span className="block text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {videoCount}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Video Modules
              </span>
            </div>
          </div>
        </div>

        {/* 2. Category Filter Pills Bar */}
        <div className="mt-8 pt-6 border-t border-[#176B98]/15 dark:border-[#1E426D] space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8]" />
              <span>Categories:</span>
            </span>

            {/* All Categories Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#122842] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E426D] hover:bg-slate-50 dark:hover:bg-[#153252] hover:text-[#176B98] dark:hover:text-[#38bdf8]'
              }`}
            >
              All Categories ({publishedCategories.length})
            </button>

            {/* Dynamic Published Categories from Admin */}
            {publishedCategories.map((cat) => {
              const count = publishedResources.filter(
                (r) => r.category_id === cat.id || r.category === cat.name || r.topic === cat.name
              ).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                      : 'bg-white dark:bg-[#122842] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E426D] hover:bg-slate-50 dark:hover:bg-[#153252] hover:text-[#176B98] dark:hover:text-[#38bdf8]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* 3. Format Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            {/* Format Tabs */}
            <div className="inline-flex p-1 bg-white dark:bg-[#10243C] rounded-xl border border-slate-200 dark:border-[#1E426D] shadow-2xs shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8]'
                }`}
              >
                All Materials ({publishedResources.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'video'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8]'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Videos ({videoCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pdf'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Handbooks ({pdfCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'link'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8]'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>External Links ({linkCount})</span>
              </button>
            </div>

            {/* Action & Search Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  const targetCat = publishedCategories.find(
                    (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
                  );
                  setQuizCategoryTarget({
                    id: targetCat?.id,
                    name: targetCat?.name || (selectedCategory !== 'all' ? selectedCategory : 'Business English'),
                  });
                  setIsQuizModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#176B98] to-[#1F8ECA] hover:from-[#12587d] hover:to-[#176B98] text-white text-xs font-bold transition-all shadow-xs hover:shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
                title="Test your knowledge with the Skill Assessment Quiz"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Take Assessment Quiz</span>
              </button>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search classes or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-[#122842] text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#1E426D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]/30 focus:border-[#176B98] transition-all shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Content Grid */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] max-w-md mx-auto my-8 shadow-card-elevated">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No classes match your search</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {searchQuery
              ? `No classes found matching "${searchQuery}". Reset filters or search for another skill.`
              : 'There are currently no published resources in this category.'}
          </p>
          {(searchQuery || selectedCategory !== 'all' || activeTab !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveTab('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-[#176B98] dark:text-[#38bdf8] bg-[#F3F8FB] dark:bg-[#153252] hover:bg-[#176B98] hover:text-white dark:hover:bg-[#176B98] rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredResources.map((resource) => {
            const isVideo = resource.content_type === 'video';
            const isPdf = resource.content_type === 'pdf';
            const isLink = resource.content_type === 'link';
            const displayDuration = resource.video_duration || resource.duration;
            const displaySize = resource.file_size_formatted || (resource.file_size_bytes ? formatBytes(resource.file_size_bytes) : undefined);
            const displayCategory = resource.category || resource.topic || 'Skill Development';

            // User progress synchronization
            const progress = getLessonProgress(resource.id);
            const progressPercentage = Math.min(100, Math.max(0, progress?.progress_percentage || 0));
            const isCompleted = progress?.completion_status === 'completed' || progressPercentage >= 95;

            return (
              <div
                key={resource.id}
                className="bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200 dark:border-[#1E426D] shadow-card-elevated hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 text-left"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                  {isPdf ? (
                    /* PDF: Render real first page preview without placeholder images */
                    <PdfThumbnail
                      fileUrl={resource.file_url || resource.content_url || ''}
                      title={resource.title}
                      aspectClass="aspect-16/9"
                    />
                  ) : resource.thumbnail_url ? (
                    <img
                      src={resource.thumbnail_url}
                      alt={resource.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-[#176B98] text-white p-4">
                      {isVideo && <Play className="w-10 h-10 text-white/80" />}
                      {isLink && <ExternalLink className="w-10 h-10 text-white/80" />}
                      <span className="text-[10px] font-bold mt-2 text-white/70 tracking-widest uppercase">
                        {displayCategory}
                      </span>
                    </div>
                  )}

                  {/* Scrim overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Left Format Label */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs flex items-center gap-1 ${
                        isVideo
                          ? 'bg-[#176B98]/90 text-white'
                          : isPdf
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-sky-600/90 text-white'
                      }`}
                    >
                      {isVideo && (
                        <>
                          <Play className="w-3 h-3 fill-white" />
                          <span>Video Lesson</span>
                        </>
                      )}
                      {isPdf && (
                        <>
                          <FileText className="w-3 h-3" />
                          <span>PDF Handbook</span>
                        </>
                      )}
                      {isLink && (
                        <>
                          <ExternalLink className="w-3 h-3" />
                          <span>External Resource</span>
                        </>
                      )}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-white/95">
                      {displayCategory}
                    </span>
                  </div>

                  {/* Top Right Video Completion / Progress Indicator (Synchronized with Player & Supabase) */}
                  {isVideo && (
                    <div className="absolute top-3 right-3 z-10">
                      {isCompleted ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold backdrop-blur-md bg-emerald-600/95 text-white shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Completed</span>
                        </span>
                      ) : progressPercentage > 0 ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold backdrop-blur-md bg-[#176B98]/90 text-white shadow-xs flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-sky-300" />
                          <span>{progressPercentage}% Watched</span>
                        </span>
                      ) : null}
                    </div>
                  )}

                  {/* Play Action Overlay for Videos (Watch in LMS) */}
                  {isVideo && (
                    <button
                      type="button"
                      onClick={() => setSelectedVideoResource(resource)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn"
                      aria-label={`Watch ${resource.title} in LMS`}
                    >
                      <div className="w-13 h-13 rounded-full bg-[#176B98]/90 hover:bg-[#176B98] text-white flex items-center justify-center shadow-xl group-hover/btn:scale-115 transition-all duration-300 ring-4 ring-white/20">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </button>
                  )}

                  {/* Preview Action Overlay for PDFs (Open in Full LMS Viewer) */}
                  {isPdf && (
                    <button
                      type="button"
                      onClick={() => setSelectedPdfResource(resource)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn opacity-85 hover:opacity-100 transition-opacity"
                      aria-label={`Open and preview ${resource.title} in LMS`}
                    >
                      <div className="w-11 h-11 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xl group-hover/btn:scale-115 transition-all duration-300 ring-4 ring-white/20">
                        <Eye className="w-5 h-5 ml-0.5" />
                      </div>
                    </button>
                  )}

                  {/* Open Action Overlay for External Links */}
                  {isLink && (
                    <button
                      type="button"
                      onClick={() => setSelectedLinkResource(resource)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn opacity-85 hover:opacity-100 transition-opacity"
                      aria-label={`Open external resource ${resource.title}`}
                    >
                      <div className="w-11 h-11 rounded-full bg-sky-600/90 hover:bg-sky-600 text-white flex items-center justify-center shadow-xl group-hover/btn:scale-115 transition-all duration-300 ring-4 ring-white/20">
                        <ExternalLink className="w-5 h-5 ml-0.5" />
                      </div>
                    </button>
                  )}

                  {/* Bottom Duration & Size Indicators */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
                    {isVideo && displayDuration && (
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>{displayDuration}</span>
                      </span>
                    )}
                    {isPdf && displaySize && (
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 font-mono">
                        <HardDrive className="w-3 h-3 text-emerald-400" />
                        <span>{displaySize}</span>
                      </span>
                    )}
                    {isLink && (
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                        <Globe className="w-3 h-3 text-sky-300" />
                        <span>External Link</span>
                      </span>
                    )}
                  </div>

                  {/* Module sequence badge */}
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-mono">
                      Class #{resource.display_order}
                    </span>
                  </div>

                  {/* Video Progress Bar Strip along thumbnail bottom edge */}
                  {isVideo && progressPercentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 overflow-hidden z-20">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-[#176B98] to-[#25A9D2]'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Card Title, Summary, & Instructor Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3
                      onClick={() => {
                        if (isVideo) setSelectedVideoResource(resource);
                        else if (isPdf) setSelectedPdfResource(resource);
                        else setSelectedLinkResource(resource);
                      }}
                      className="text-base font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight group-hover:text-[#12567a] dark:group-hover:text-[#7dd3fc] transition-colors leading-snug cursor-pointer line-clamp-2"
                    >
                      {resource.title}
                    </h3>

                    {resource.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {/* Instructor Attribution & Category */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {resource.instructor_avatar ? (
                        <img
                          src={resource.instructor_avatar}
                          alt={resource.instructor_name || 'Instructor'}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-[#1E426D]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8] flex items-center justify-center font-bold text-xs shrink-0">
                          {resource.instructor_name
                            ? resource.instructor_name.slice(0, 2).toUpperCase()
                            : 'KB'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {resource.instructor_name && !/KBZ\s*Life\s*Academy/i.test(resource.instructor_name)
                            ? resource.instructor_name
                            : 'KBZ Life Insurance'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {resource.instructor_title && !/KBZ\s*Life\s*Academy/i.test(resource.instructor_title)
                            ? resource.instructor_title
                            : 'KBZ Life Insurance · Learning & Development'}
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-[#F3F8FB] dark:bg-[#122842] border border-[#176B98]/20 dark:border-[#1E426D] text-[#176B98] dark:text-[#38bdf8] text-[11px] font-bold shrink-0">
                      {displayCategory}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          5. MODALS: VIDEO PLAYER, PDF VIEWER, AND EXTERNAL LINK VIEWER
          ========================================================================= */}
      {/* Video Player Modal with Watermark & Anti-Download Protection */}
      {selectedVideoResource && (
        <SkillVideoPlayerModal
          resource={selectedVideoResource}
          onClose={() => setSelectedVideoResource(null)}
        />
      )}

      {/* PDF Viewer Modal with Watermark, Zoom, Page Nav & No Download Button */}
      {selectedPdfResource && (
        <PdfViewerModal
          isOpen={true}
          onClose={() => setSelectedPdfResource(null)}
          fileUrl={selectedPdfResource.file_url || selectedPdfResource.content_url || ''}
          title={selectedPdfResource.title}
          subtitle={`${selectedPdfResource.category || selectedPdfResource.topic || 'Skill Development'} · Handbook`}
          fileName={selectedPdfResource.file_name}
          watermarkContextLabel="KBZLIFE SKILL DEVELOPMENT"
        />
      )}

      {/* External Link Destination Modal (Clear identification, no watermark claim) */}
      {selectedLinkResource && (
        <ExternalLinkModal
          resource={selectedLinkResource}
          onClose={() => setSelectedLinkResource(null)}
        />
      )}

      {/* Skill Quiz Assessment Modal */}
      {isQuizModalOpen && (
        <SkillQuizModal
          isOpen={true}
          onClose={() => setIsQuizModalOpen(false)}
          categoryId={quizCategoryTarget?.id}
          categoryName={quizCategoryTarget?.name || 'Skill Assessment'}
        />
      )}
    </div>
  );
};
