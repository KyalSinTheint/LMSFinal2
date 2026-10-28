import React, { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import { LicenseTrainingLesson, LicenseChapter, ChapterStatus } from '../../types/lms';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';
import { formatBytes } from '../../lib/storageUtils';
import {
  Award,
  Play,
  FileText,
  Search,
  Clock,
  HardDrive,
  X,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Lock,
  Unlock,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { PdfThumbnail } from '../common/PdfThumbnail';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { LicenseVideoPlayerModal } from './LicenseVideoPlayerModal';
import { LicenseQuizModal } from './LicenseQuizModal';

export const LicenseTrainingPage: React.FC = () => {
  const {
    licenseChapters,
    getPublishedLicenseLessons,
    getLessonProgress,
    getChapterStatus,
    getChapterMaterialsProgress,
    getOverallLicenseProgress,
    chapterCompletions,
  } = useLms();

  const publishedLessons = getPublishedLicenseLessons();
  const overall = getOverallLicenseProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chapters' | 'all' | 'video' | 'pdf'>('chapters');
  const [selectedVideoLesson, setSelectedVideoLesson] = useState<LicenseTrainingLesson | null>(null);
  const [selectedPdfLesson, setSelectedPdfLesson] = useState<LicenseTrainingLesson | null>(null);
  const [activeQuizChapter, setActiveQuizChapter] = useState<LicenseChapter | null>(null);

  // Lock body scroll when any modal is open
  useBodyScrollLock(!!selectedVideoLesson || !!selectedPdfLesson || !!activeQuizChapter);

  // Filter published chapters sorted by display_order
  const sortedChapters = useMemo(() => {
    return [...licenseChapters]
      .filter((c) => c.is_published)
      .sort((a, b) => a.display_order - b.display_order);
  }, [licenseChapters]);

  // Lessons filtered by format / search
  const filteredLessons = useMemo(() => {
    let list = publishedLessons;

    if (activeTab === 'video') {
      list = list.filter((l) => (l.lesson_type || l.content_type || 'video') === 'video');
    } else if (activeTab === 'pdf') {
      list = list.filter((l) => (l.lesson_type || l.content_type) === 'pdf');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [publishedLessons, activeTab, searchQuery]);

  const videoCount = publishedLessons.filter((l) => (l.lesson_type || l.content_type) === 'video').length;
  const pdfCount = publishedLessons.filter((l) => (l.lesson_type || l.content_type) === 'pdf').length;

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#176B98]/12 via-[#176B98]/6 to-white dark:from-[#0E2035] dark:via-[#10243C] dark:to-[#0B131E] p-6 sm:p-8 rounded-3xl border border-[#176B98]/15 dark:border-[#1E426D] shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            {/* Clean unboxed text kicker adhering to zero-pill discipline */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#176B98] dark:text-[#38bdf8] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
              <span>Official Insurance Licensing & Regulatory Compliance Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight">
              Licence Training Curriculum
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Complete sequentially unlocked regulatory chapters, verify compliance knowledge via interactive chapter assessments, and fulfill statutory certification requirements for KBZLife Insurance Advisory.
            </p>
          </div>

          {/* Overall Training Progress Metric Block */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="bg-white/95 dark:bg-[#10243C] backdrop-blur-xs px-5 py-4 rounded-2xl border border-slate-200 dark:border-[#1E426D] shadow-2xs text-left min-w-[170px]">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Chapters
                </span>
                <span className="text-xs font-mono font-bold text-[#176B98] dark:text-[#38bdf8]">
                  {overall.completedChapters} of {overall.totalChapters}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-[#176B98] dark:text-[#38bdf8] tabular-nums">
                {overall.overallPercentage}%
              </div>
              {/* Progress Mini Track */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-[#153252] rounded-full overflow-hidden mt-2 border border-slate-200/50 dark:border-[#1E426D]">
                <div
                  className="h-full bg-[#176B98] dark:bg-[#38bdf8] transition-all duration-500 rounded-full"
                  style={{ width: `${overall.overallPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-white/95 dark:bg-[#10243C] backdrop-blur-xs px-5 py-4 rounded-2xl border border-slate-200 dark:border-[#1E426D] shadow-2xs text-left min-w-[150px]">
              <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Status
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {overall.isCourseCompleted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">Course Passed</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5 text-[#176B98] dark:text-[#38bdf8] shrink-0" />
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">In Progress</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                {overall.isCourseCompleted
                  ? 'All chapters & quizzes passed'
                  : `${overall.totalChapters - overall.completedChapters} chapter(s) remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher and Search Bar */}
        <div className="mt-8 pt-6 border-t border-[#176B98]/15 dark:border-[#1E426D] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Format Tabs (Chapters Sequential, All, Videos, PDFs) */}
          <div className="inline-flex p-1 bg-white dark:bg-[#10243C] rounded-xl border border-slate-200 dark:border-[#1E426D] shadow-2xs shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('chapters')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chapters'
                  ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sequential Chapters ({sortedChapters.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8]'
              }`}
            >
              All Materials ({publishedLessons.length})
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
          </div>

          {/* Simple Search Bar (Title or Description) */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lessons or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white dark:bg-[#122842] text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#1E426D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]/30 focus:border-[#176B98] transition-all shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
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

      {/* =========================================================================
          VIEW 1: SEQUENTIAL CHAPTERS SYSTEM (DEFAULT LEARNER WORKFLOW)
          ========================================================================= */}
      {activeTab === 'chapters' && (
        <div className="space-y-8">
          {sortedChapters.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] shadow-card-elevated">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Chapters Configured</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                There are currently no active licensing chapters available. Check back soon.
              </p>
            </div>
          ) : (
            sortedChapters.map((chapter, chapterIdx) => {
              const status: ChapterStatus = getChapterStatus(chapter.id);
              const materialsProg = getChapterMaterialsProgress(chapter.id);
              const comp = chapterCompletions[chapter.id];
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';
              const isQuizAvailable = status === 'quiz_available';

              // Get all lessons assigned to this chapter
              const chapterLessons = publishedLessons.filter(
                (l) => l.chapter_id === chapter.id || (!l.chapter_id && chapterIdx === 0)
              );

              return (
                <div
                  key={chapter.id}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isLocked
                      ? 'bg-slate-50/70 dark:bg-[#0B1522] border-slate-200 dark:border-[#1E426D] opacity-80'
                      : isCompleted
                      ? 'bg-white dark:bg-[#10243C] border-emerald-200 dark:border-emerald-800/60 shadow-card-elevated'
                      : 'bg-white dark:bg-[#10243C] border-[#176B98]/30 dark:border-[#1E426D] shadow-card-elevated ring-1 ring-[#176B98]/10 dark:ring-[#38bdf8]/10'
                  }`}
                >
                  {/* Chapter Header */}
                  <div className={`p-6 sm:p-7 border-b ${
                    isLocked
                      ? 'bg-slate-100/60 dark:bg-[#0E2035]/90 border-slate-200 dark:border-[#1E426D]'
                      : isCompleted
                      ? 'bg-emerald-50/40 dark:bg-[#0A261D] border-emerald-100 dark:border-emerald-900/60'
                      : 'bg-sky-50/40 dark:bg-[#0E2238] border-sky-100 dark:border-[#1E426D]'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        {/* Chapter Kickers adhering to zero-pill discipline */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-mono font-extrabold text-[#176B98] dark:text-[#38bdf8] uppercase tracking-wider">
                            Chapter {chapter.chapter_number}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>

                          {/* Status Indicator */}
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              <span>Locked · Pass Chapter {chapter.chapter_number - 1} Quiz to Unlock</span>
                            </span>
                          )}
                          {!isLocked && !isCompleted && !isQuizAvailable && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#176B98] dark:text-[#38bdf8]">
                              <Clock className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8]" />
                              <span>In Progress · Complete All Materials</span>
                            </span>
                          )}
                          {!isLocked && isQuizAvailable && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Materials Completed · Quiz Assessment Ready</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Chapter Passed ({comp?.highest_quiz_score ?? 100}% on quiz)</span>
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                          {chapter.title}
                        </h2>
                        {chapter.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
                            {chapter.description}
                          </p>
                        )}
                      </div>

                      {/* Chapter Quick Stats & Quiz CTA Button */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Materials Progress badge */}
                        <div className="bg-white dark:bg-[#122842] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#1E426D] shadow-2xs text-left">
                          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Materials</div>
                          <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                            {materialsProg.completedCount}/{materialsProg.totalCount} Done ({materialsProg.percentage}%)
                          </div>
                        </div>

                        {/* Chapter Assessment Action Button */}
                        {isLocked ? (
                          <button
                            type="button"
                            disabled
                            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-[#153252] text-slate-400 dark:text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
                            title="Complete previous chapter and pass its assessment to unlock this chapter"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Chapter Locked</span>
                          </button>
                        ) : isCompleted ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveQuizChapter(chapter)}
                              className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-[#0A261D] hover:bg-emerald-100 dark:hover:bg-[#0D3327] text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retake Quiz</span>
                            </button>
                          </div>
                        ) : isQuizAvailable ? (
                          <button
                            type="button"
                            onClick={() => setActiveQuizChapter(chapter)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98 animate-pulse"
                          >
                            <Sparkles className="w-4 h-4 fill-white" />
                            <span>Take Chapter Quiz ({chapter.passing_score || 80}% to pass)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#122842] text-slate-400 dark:text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed border border-slate-200 dark:border-[#1E426D]"
                            title="Complete both the video and distinct PDF pages to unlock the quiz"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            <span>Quiz Locked ({materialsProg.completedCount}/{materialsProg.totalCount} completed)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress track for the chapter materials */}
                    <div className="w-full h-1.5 bg-slate-200/70 dark:bg-[#153252] rounded-full overflow-hidden mt-4">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isQuizAvailable
                            ? 'bg-amber-500'
                            : 'bg-[#176B98] dark:bg-[#38bdf8]'
                        }`}
                        style={{ width: `${materialsProg.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Chapter Lessons List */}
                  <div className="p-6">
                    {chapterLessons.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No learning materials currently assigned to Chapter {chapter.chapter_number}.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {chapterLessons.map((lesson) => {
                          const isVideo = (lesson.lesson_type || lesson.content_type) === 'video';
                          const displayDuration = lesson.video_duration || lesson.duration;
                          const displaySize = lesson.file_size_formatted || (lesson.file_size_bytes ? formatBytes(lesson.file_size_bytes) : undefined);
                          const prog = getLessonProgress(lesson.id);
                          const isComplete = prog.completion_status === 'completed' || prog.progress_percentage >= (isVideo ? 95 : 100);
                          const pct = Math.min(100, Math.max(0, prog.progress_percentage));

                          return (
                            <div
                              key={lesson.id}
                              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                                isLocked
                                  ? 'bg-slate-100/50 dark:bg-[#0B1522] border-slate-200 dark:border-[#1E426D] text-slate-400 dark:text-slate-500'
                                  : 'bg-white dark:bg-[#10243C] border-slate-200 dark:border-[#1E426D] hover:border-[#176B98]/40 dark:hover:border-[#38bdf8]/50 shadow-card-elevated hover:shadow-card-hover'
                              }`}
                            >
                              {/* Top Preview Section */}
                              <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                                {isVideo ? (
                                  lesson.thumbnail_url ? (
                                    <img
                                      src={lesson.thumbnail_url}
                                      alt={lesson.title}
                                      referrerPolicy="no-referrer"
                                      className={`w-full h-full object-cover ${isLocked ? 'grayscale opacity-50' : 'group-hover:scale-105'} transition-all`}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#176B98] text-white p-4">
                                      <Play className="w-10 h-10 text-white/80" />
                                      <span className="text-[10px] font-bold mt-2 text-white/70 tracking-widest">
                                        KBZLIFE ACADEMY
                                      </span>
                                    </div>
                                  )
                                ) : (
                                  <PdfThumbnail
                                    fileUrl={lesson.file_url}
                                    title={lesson.title}
                                    aspectClass="aspect-16/9"
                                  />
                                )}

                                {/* Scrim overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                                {/* Format badge */}
                                <div className="absolute top-3 left-3 z-10">
                                  <span
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs flex items-center gap-1 ${
                                      isVideo
                                        ? 'bg-[#176B98]/90 text-white'
                                        : 'bg-emerald-600/90 text-white'
                                    }`}
                                  >
                                    {isVideo ? (
                                      <>
                                        <Play className="w-3 h-3 fill-white" />
                                        <span>Video Lesson</span>
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="w-3 h-3" />
                                        <span>PDF Handbook</span>
                                      </>
                                    )}
                                  </span>
                                </div>

                                {/* Click action if unlocked */}
                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isVideo) setSelectedVideoLesson(lesson);
                                      else setSelectedPdfLesson(lesson);
                                    }}
                                    className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn"
                                    aria-label={`Open ${lesson.title}`}
                                  >
                                    <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-xl group-hover/btn:scale-115 transition-all duration-300 ring-4 ring-white/20 ${
                                      isVideo ? 'bg-[#176B98]/90 hover:bg-[#176B98]' : 'bg-emerald-600/90 hover:bg-emerald-600'
                                    }`}>
                                      {isVideo ? (
                                        <Play className="w-5 h-5 fill-white ml-0.5" />
                                      ) : (
                                        <Eye className="w-5 h-5 ml-0.5" />
                                      )}
                                    </div>
                                  </button>
                                )}

                                {isLocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-2xs">
                                    <div className="flex flex-col items-center gap-1 text-white/80">
                                      <Lock className="w-6 h-6" />
                                      <span className="text-[11px] font-bold">Chapter Locked</span>
                                    </div>
                                  </div>
                                )}

                                {/* Bottom stats */}
                                <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
                                  {isVideo && displayDuration && (
                                    <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 font-mono">
                                      <Clock className="w-3 h-3 text-sky-400" />
                                      <span>{displayDuration}</span>
                                    </span>
                                  )}
                                  {!isVideo && displaySize && (
                                    <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 font-mono">
                                      <HardDrive className="w-3 h-3 text-emerald-400" />
                                      <span>{displaySize}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Lesson Details */}
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 line-clamp-2">
                                    {lesson.title}
                                  </h3>
                                  {lesson.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                      {lesson.description}
                                    </p>
                                  )}

                                  {/* Synchronized Lesson Progress Bar */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1E426D]">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <div className="flex items-center gap-1.5">
                                        {isComplete ? (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            <span>Completed</span>
                                          </span>
                                        ) : pct > 0 ? (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#176B98] dark:text-[#38bdf8]">
                                            <Clock className="w-3 h-3 text-[#176B98] dark:text-[#38bdf8]" />
                                            <span>In Progress</span>
                                          </span>
                                        ) : (
                                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                            Not Started
                                          </span>
                                        )}
                                      </div>

                                      {/* PDF Pages Detail / Percentage Display */}
                                      <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                                        {!isVideo && prog.total_pages && prog.total_pages > 0 ? (
                                          <span>
                                            Page {prog.last_page || 1}/{prog.total_pages} ({pct}%)
                                          </span>
                                        ) : (
                                          <span className="font-bold">{pct}%</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Progress track */}
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-[#153252] rounded-full overflow-hidden border border-slate-200/50 dark:border-[#1E426D]">
                                      <div
                                        className={`h-full transition-all duration-500 rounded-full ${
                                          isComplete
                                            ? 'bg-emerald-500'
                                            : pct > 0
                                            ? 'bg-[#176B98] dark:bg-[#38bdf8]'
                                            : 'bg-transparent'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>

                                    {!isVideo && prog.viewed_pages && prog.total_pages && prog.total_pages > 0 && (
                                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                        {prog.viewed_pages.length} of {prog.total_pages} distinct pages read
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Open Action Button */}
                                <div className="pt-2">
                                  {isLocked ? (
                                    <button
                                      type="button"
                                      disabled
                                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#122842] text-slate-400 dark:text-slate-500 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
                                    >
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Locked</span>
                                    </button>
                                  ) : isVideo ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedVideoLesson(lesson)}
                                      className="w-full px-3 py-2 rounded-xl bg-[#176B98] dark:bg-[#185d85] hover:bg-[#12567a] dark:hover:bg-[#176B98] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-white" />
                                      <span>{isComplete ? 'Rewatch Video' : pct > 0 ? `Resume (${pct}%)` : 'Watch Video'}</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPdfLesson(lesson)}
                                      className="w-full px-3 py-2 rounded-xl bg-slate-800 dark:bg-[#183B60] hover:bg-slate-700 dark:hover:bg-[#1E4875] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>{isComplete ? 'Review Handbook' : pct > 0 ? `Continue Reading (${pct}%)` : 'Read Handbook'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: ALL MATERIALS / SEARCH VIEW (GRID)
          ========================================================================= */}
      {activeTab !== 'chapters' && (
        <>
          {filteredLessons.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] max-w-md mx-auto my-8 shadow-card-elevated">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No lessons match your search</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {searchQuery
                  ? `No lessons found matching "${searchQuery}". Clear your search query or switch formats.`
                  : 'There are currently no published lessons in this category.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('all');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-[#176B98] dark:text-[#38bdf8] bg-[#F3F8FB] dark:bg-[#153252] hover:bg-[#176B98] hover:text-white dark:hover:bg-[#176B98] rounded-xl transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredLessons.map((lesson) => {
                const isVideo = (lesson.lesson_type || lesson.content_type) === 'video';
                const displayDuration = lesson.video_duration || lesson.duration;
                const displaySize = lesson.file_size_formatted || (lesson.file_size_bytes ? formatBytes(lesson.file_size_bytes) : undefined);
                const prog = getLessonProgress(lesson.id);
                const isComplete = prog.completion_status === 'completed' || prog.progress_percentage >= (isVideo ? 95 : 100);
                const pct = Math.min(100, Math.max(0, prog.progress_percentage));

                return (
                  <div
                    key={lesson.id}
                    className="bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200 dark:border-[#1E426D] shadow-card-elevated hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 text-left"
                  >
                    {/* Media Thumbnail Container */}
                    <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                      {isVideo ? (
                        lesson.thumbnail_url ? (
                          <img
                            src={lesson.thumbnail_url}
                            alt={lesson.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#176B98] text-white p-4">
                            <Play className="w-10 h-10 text-white/80" />
                            <span className="text-[10px] font-bold mt-2 text-white/70 tracking-widest">
                              KBZLIFE ACADEMY
                            </span>
                          </div>
                        )
                      ) : (
                        <PdfThumbnail
                          fileUrl={lesson.file_url}
                          title={lesson.title}
                          aspectClass="aspect-16/9"
                        />
                      )}

                      {/* Measured Scrim for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                      {/* Top Format Label */}
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs flex items-center gap-1 ${
                            isVideo
                              ? 'bg-[#176B98]/90 text-white'
                              : 'bg-emerald-600/90 text-white'
                          }`}
                        >
                          {isVideo ? (
                            <>
                              <Play className="w-3 h-3 fill-white" />
                              <span>Video Lesson</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3" />
                              <span>PDF Handbook</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Play Action Overlay for Videos */}
                      {isVideo && (
                        <button
                          type="button"
                          onClick={() => setSelectedVideoLesson(lesson)}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn"
                          aria-label={`Watch ${lesson.title} in LMS`}
                        >
                          <div className="w-13 h-13 rounded-full bg-[#176B98]/90 hover:bg-[#176B98] text-white flex items-center justify-center shadow-xl group-hover/btn:scale-115 transition-all duration-300 ring-4 ring-white/20">
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                        </button>
                      )}

                      {/* Preview Action Overlay for PDFs */}
                      {!isVideo && (
                        <button
                          type="button"
                          onClick={() => setSelectedPdfLesson(lesson)}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn opacity-85 hover:opacity-100 transition-opacity"
                          aria-label={`Open and preview ${lesson.title} in LMS`}
                        >
                          <div className="w-11 h-11 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xl group-hover/btn:scale-115 transition-all duration-300 ring-4 ring-white/20">
                            <Eye className="w-5 h-5 ml-0.5" />
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
                        {!isVideo && displaySize && (
                          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 font-mono">
                            <HardDrive className="w-3 h-3 text-emerald-400" />
                            <span>{displaySize}</span>
                          </span>
                        )}
                      </div>

                      {/* Module sequence badge */}
                      <div className="absolute bottom-2.5 left-2.5 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-mono">
                          Module #{lesson.display_order}
                        </span>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Unboxed Metadata (Zero-pill discipline) */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {isVideo ? 'Streaming Video' : 'Official PDF Document'}
                          </span>
                          {displaySize && (
                            <>
                              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="font-mono text-[11px]">{displaySize}</span>
                            </>
                          )}
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">Verified</span>
                        </div>

                        {/* Card Title & Description */}
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-[#176B98] dark:group-hover:text-[#38bdf8] transition-colors leading-snug">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                            {lesson.description}
                          </p>
                        )}

                        {/* Synchronized Completion Progress Tracking Bar (0-100%) */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E426D]">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-1.5">
                              {isComplete ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-[#0A261D] px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Completed (100%)</span>
                                </span>
                              ) : pct > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#176B98] dark:text-[#38bdf8] bg-sky-50 dark:bg-[#0E2238] px-2 py-0.5 rounded-md border border-sky-200 dark:border-[#1E426D]">
                                  <Clock className="w-3 h-3 text-[#176B98] dark:text-[#38bdf8]" />
                                  <span>In Progress ({pct}%)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#122842] px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#1E426D]">
                                  <span>Not Started (0%)</span>
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                              {!isVideo && prog.total_pages && prog.total_pages > 0 ? (
                                <span>Page {prog.last_page || 1}/{prog.total_pages} ({pct}%)</span>
                              ) : (
                                <span>{pct}%</span>
                              )}
                            </div>
                          </div>

                          {/* Progress Track */}
                          <div className="w-full h-2 bg-slate-100 dark:bg-[#153252] rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-[#1E426D] shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isComplete
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                  : pct > 0
                                  ? 'bg-gradient-to-r from-[#176B98] to-[#25A9D2]'
                                  : 'bg-transparent'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {!isVideo && prog.viewed_pages && prog.total_pages && prog.total_pages > 0 && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              {prog.viewed_pages.length} of {prog.total_pages} distinct pages viewed
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Action Bar (Strictly View-Only: NO DOWNLOAD BUTTONS) */}
                      <div className="pt-3.5 border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between gap-2">
                        {isVideo ? (
                          <button
                            type="button"
                            onClick={() => setSelectedVideoLesson(lesson)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#176B98] dark:bg-[#185d85] hover:bg-[#12567a] dark:hover:bg-[#176B98] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99]"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>
                              {isComplete
                                ? 'Rewatch Video Lesson'
                                : pct > 0
                                ? `Resume Lesson (${pct}%)`
                                : 'Watch Video Lesson'}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedPdfLesson(lesson)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-[#183B60] hover:bg-slate-700 dark:hover:bg-[#1E4875] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99]"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              {isComplete
                                ? 'Review Official Handbook'
                                : pct > 0
                                ? `Continue Handbook (${pct}%)`
                                : 'Read Official Handbook'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          AUTHENTICATED & SECURE VIDEO PLAYER MODAL (WITH ACCURATE PLAYBACK TRACKING)
          ========================================================================= */}
      {selectedVideoLesson && (
        <LicenseVideoPlayerModal
          lesson={selectedVideoLesson}
          onClose={() => setSelectedVideoLesson(null)}
        />
      )}

      {/* =========================================================================
          PROTECTED IN-APP PDF VIEWER MODAL (VIEW-ONLY, WATERMARKED, SYNCHRONIZED)
          ========================================================================= */}
      {selectedPdfLesson && (
        <PdfViewerModal
          isOpen={!!selectedPdfLesson}
          onClose={() => setSelectedPdfLesson(null)}
          fileUrl={selectedPdfLesson.file_url}
          title={selectedPdfLesson.title}
          subtitle={`Module #${selectedPdfLesson.display_order}`}
          lessonId={selectedPdfLesson.id}
        />
      )}

      {/* =========================================================================
          CHAPTER QUIZ ASSESSMENT MODAL (SERVER-SIDE GRADING, INSTANT UNLOCK)
          ========================================================================= */}
      {activeQuizChapter && (
        <LicenseQuizModal
          isOpen={!!activeQuizChapter}
          chapter={activeQuizChapter}
          onClose={() => setActiveQuizChapter(null)}
          onPassed={() => {
            // Optional callback, completions are updated in context state
          }}
        />
      )}
    </div>
  );
};
