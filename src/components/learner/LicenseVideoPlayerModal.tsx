import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LicenseTrainingLesson, LessonProgressInfo } from '../../types/lms';
import { useLms } from '../../context/LmsContext';
import { ViewerWatermark } from '../common/ViewerWatermark';
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  HardDrive,
  ShieldAlert,
  AlertCircle,
  Award,
} from 'lucide-react';

interface LicenseVideoPlayerModalProps {
  lesson: LicenseTrainingLesson;
  onClose: () => void;
}

export const LicenseVideoPlayerModal: React.FC<LicenseVideoPlayerModalProps> = ({
  lesson,
  onClose,
}) => {
  const { currentUser, getLessonProgress, recordVideoHeartbeat, showToast } = useLms();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initial progress from context/server
  const initialProgress = getLessonProgress(lesson.id);
  const [progressInfo, setProgressInfo] = useState<LessonProgressInfo>(initialProgress);

  // Playback tracking references (anti-cheating)
  const isPlayingRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(initialProgress.last_position || 0);
  const segmentStartRef = useRef<number>(initialProgress.last_position || 0);
  const lastSendTimeRef = useRef<number>(Date.now());
  const [hasRestoredPosition, setHasRestoredPosition] = useState<boolean>(false);
  const [seekWarning, setSeekWarning] = useState<string | null>(null);

  // Direct fallback & error state
  const [useDirectFallback, setUseDirectFallback] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<{ title: string; message: string } | null>(null);

  const videoSource = (lesson.file_url || '').trim();

  // Clean stream URL routed through protected endpoint with no-download headers, with direct fallback
  const streamUrl = useDirectFallback
    ? videoSource
    : `/api/license/stream-video?url=${encodeURIComponent(videoSource)}&lessonId=${encodeURIComponent(lesson.id)}`;

  const handleVideoError = () => {
    if (!useDirectFallback && videoSource) {
      console.warn('[KBZLife LMS] License video proxy stream error, attempting direct stream fallback...');
      setUseDirectFallback(true);
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else {
      setPlaybackError({
        title: 'Video Stream Unavailable',
        message: videoSource
          ? `Unable to stream video from "${videoSource}". Please check that the file exists and is accessible.`
          : 'No video stream URL has been configured for this lesson.',
      });
    }
  };

  // Flush genuine played segment to server
  const sendSegmentProgress = useCallback(
    async (start: number, end: number, currentTime: number) => {
      const video = videoRef.current;
      if (!video) return;

      const duration = video.duration || 1;
      const playbackRate = video.playbackRate || 1.0;

      if (end > start && end - start > 0.4) {
        const updated = await recordVideoHeartbeat(
          lesson.id,
          { start, end },
          duration,
          playbackRate,
          currentTime
        );
        if (updated) {
          setProgressInfo(updated);
        }
      }
    },
    [lesson.id, recordVideoHeartbeat]
  );

  // When video metadata is loaded, restore last position if available
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasRestoredPosition && progressInfo.last_position && progressInfo.last_position > 5) {
      // Restore up to last position if not already completed
      if (progressInfo.progress_percentage < 100 && progressInfo.last_position < video.duration - 5) {
        video.currentTime = progressInfo.last_position;
      }
      setHasRestoredPosition(true);
    }
    lastTimeRef.current = video.currentTime;
    segmentStartRef.current = video.currentTime;
  };

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    isPlayingRef.current = true;
    lastTimeRef.current = video.currentTime;
    segmentStartRef.current = video.currentTime;
    lastSendTimeRef.current = Date.now();
    setSeekWarning(null);
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (!video) return;
    isPlayingRef.current = false;
    const curr = video.currentTime;
    const start = segmentStartRef.current;
    sendSegmentProgress(start, curr, curr);
    lastTimeRef.current = curr;
    segmentStartRef.current = curr;
  };

  const handleSeeking = () => {
    const video = videoRef.current;
    if (!video) return;

    // Flush any pending segment before the seek leap
    const prev = lastTimeRef.current;
    const start = segmentStartRef.current;
    if (prev > start && prev - start > 0.5) {
      sendSegmentProgress(start, prev, prev);
    }

    // Inform user that seeking forward does not grant completion credit
    const curr = video.currentTime;
    if (curr > prev + 5) {
      setSeekWarning('Seeking ahead detected. Only genuinely watched segments count toward 95% completion.');
      setTimeout(() => setSeekWarning(null), 4000);
    }
  };

  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video) return;
    // Reset tracker references to the new playback position
    lastTimeRef.current = video.currentTime;
    segmentStartRef.current = video.currentTime;
    lastSendTimeRef.current = Date.now();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !isPlayingRef.current) return;

    const curr = video.currentTime;
    const prev = lastTimeRef.current;
    const delta = curr - prev;

    // Normal forward playback check (prevent artificial teleporting)
    if (delta > 0 && delta <= 3.5) {
      lastTimeRef.current = curr;

      // Send periodic heartbeat every ~3 seconds
      const now = Date.now();
      if (now - lastSendTimeRef.current >= 3000) {
        const start = segmentStartRef.current;
        sendSegmentProgress(start, curr, curr);
        segmentStartRef.current = curr;
        lastSendTimeRef.current = now;
      }
    } else if (delta > 3.5 || delta < 0) {
      // Seek detected without seeking event trigger
      segmentStartRef.current = curr;
      lastTimeRef.current = curr;
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;
    isPlayingRef.current = false;
    const curr = video.currentTime;
    const start = segmentStartRef.current;
    sendSegmentProgress(start, curr, curr);

    // If genuinely watched 95%+ of video
    if (progressInfo.progress_percentage >= 95) {
      showToast('success', 'Lesson Completed!', `Congratulations! You have fulfilled the 95% completion requirement for ${lesson.title}.`);
    } else {
      showToast('info', 'Completion Pending', `You have watched ${progressInfo.progress_percentage}% of this lesson. Complete at least 95% to earn accreditation credit.`);
    }
  };

  // Close modal with final position update
  const handleClose = () => {
    const video = videoRef.current;
    if (video && isPlayingRef.current) {
      const curr = video.currentTime;
      const start = segmentStartRef.current;
      sendSegmentProgress(start, curr, curr);
    }
    onClose();
  };

  const isCompleted = progressInfo.completion_status === 'completed' || progressInfo.progress_percentage >= 95;
  const percentage = Math.min(100, Math.max(0, progressInfo.progress_percentage));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto select-none"
      onClick={handleClose}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div
        className="bg-white dark:bg-[#10243C] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-[#1E426D] my-auto animate-in fade-in zoom-in-95 duration-200 text-left relative"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#1E426D] flex items-center justify-between bg-[#F3F8FB] dark:bg-[#0E2035]">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-[#176B98] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                <span className="font-bold text-[#176B98] dark:text-[#38BDF8]">License Training Video</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span>Module #{lesson.display_order}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">{lesson.category || 'Regulatory Compliance'}</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                {lesson.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status indicator badge */}
            <div
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : percentage > 0
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-[#176B98] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800'
                  : 'bg-slate-100 dark:bg-[#153252] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E426D]'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Completed (100%)</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#176B98]" />
                  <span>{percentage}% Watched</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#153252] hover:bg-slate-200 dark:hover:bg-[#1E426D] text-slate-600 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs border border-transparent dark:border-[#1E426D]"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Progress Bar Strip */}
        <div className="bg-slate-100 dark:bg-[#122842] border-b border-slate-200/80 dark:border-[#1E426D] px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-200">Completion Status:</span>
            <div className="w-40 sm:w-56 h-2.5 bg-slate-200 dark:bg-[#0E1F33] rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-r from-[#176B98] to-[#25A9D2]'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-100 tabular-nums font-mono">
              {percentage}%
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38BDF8]" />
            <span>95% verified playback required for module accreditation</span>
          </div>
        </div>

        {/* Seek Warning Banner (if user skipped ahead) */}
        {seekWarning && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center gap-2 animate-in fade-in duration-150">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{seekWarning}</span>
          </div>
        )}

        {/* Video Player Area with Watermark & Security Shield */}
        <div
          className="relative bg-black aspect-16/9 flex items-center justify-center overflow-hidden"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Watermark stamped with logged-in user identity */}
          <ViewerWatermark user={currentUser} contextLabel="KBZLIFE LICENSE TRAINING" />

          {playbackError ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900/95 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h4 className="text-base font-bold text-white">{playbackError.title}</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{playbackError.message}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPlaybackError(null);
                  setUseDirectFallback(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="px-4 py-2 bg-[#176B98] hover:bg-[#12587d] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Retry Playback
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={streamUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeeking={handleSeeking}
              onSeeked={handleSeeked}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={handleVideoError}
              className="w-full h-full object-contain relative z-10"
              poster={lesson.thumbnail_url}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Footer Meta & Policy Information (Strictly View-Only: NO DOWNLOAD BUTTONS) */}
        <div className="p-5 sm:p-6 space-y-4 bg-white dark:bg-[#10243C]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E426D]">
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              {lesson.video_duration && (
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38BDF8]" />
                  <span>Duration: {lesson.video_duration}</span>
                </span>
              )}
              {lesson.file_size_formatted && (
                <span className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-400">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>{lesson.file_size_formatted}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Regulatory Curriculum Verified</span>
              </span>
            </div>

            <div className="text-xs text-slate-400 dark:text-slate-400 font-medium">
              View-Only Curriculum · Copying and downloading are restricted
            </div>
          </div>

          {lesson.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Lesson Overview & Compliance Competencies
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {lesson.description}
              </p>
            </div>
          )}

          {/* Privacy & Progress Guarantee Note */}
          <div className="bg-[#F3F8FB] dark:bg-[#122842] border border-slate-200/80 dark:border-[#1E426D] rounded-2xl p-3.5 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-[#176B98] dark:text-[#38BDF8] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Progress Guarantee:</strong> Your actual playback progress is securely recorded in the KBZLife Learning Database under your employee profile ({currentUser.full_name} · {currentUser.employee_id || currentUser.email}). You can pause or return anytime, and your verified completion record will be restored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
