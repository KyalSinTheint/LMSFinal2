import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Loader2,
  AlertTriangle,
  FileText,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { loadPdfDocument, getPdfStreamUrl } from '../../lib/pdfUtils';
import { useLms } from '../../context/LmsContext';
import { ViewerWatermark } from './ViewerWatermark';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
  subtitle?: string;
  fileName?: string;
  lessonId?: string;
  onDownload?: () => void;
  watermarkContextLabel?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  title,
  subtitle,
  lessonId,
  watermarkContextLabel = 'KBZLIFE STATUTORY HANDBOOK',
}) => {
  const { currentUser, getLessonProgress, recordPdfPageProgress } = useLms();
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [viewedPagesSet, setViewedPagesSet] = useState<Set<number>>(new Set());
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 0.85;
    }
    return 1.15;
  });
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(true);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const activeRenderIdRef = useRef<number>(0);
  const loadedUrlRef = useRef<string | null>(null);
  const getLessonProgressRef = useRef(getLessonProgress);
  const recordPdfPageProgressRef = useRef(recordPdfPageProgress);

  useEffect(() => {
    getLessonProgressRef.current = getLessonProgress;
  }, [getLessonProgress]);

  useEffect(() => {
    recordPdfPageProgressRef.current = recordPdfPageProgress;
  }, [recordPdfPageProgress]);

  // 1. Load PDF Document and Restore Saved Progress stably
  const loadDocument = useCallback(async () => {
    if (!fileUrl) {
      setErrorMessage('No PDF document file URL was specified.');
      setIsLoadingDoc(false);
      return;
    }

    // If already loaded for this exact URL, do not reload or flash
    if (loadedUrlRef.current === fileUrl && pdfDoc) {
      setIsLoadingDoc(false);
      return;
    }

    try {
      setIsLoadingDoc(true);
      setErrorMessage(null);

      // Restore saved progress if lessonId is provided
      let initialPage = 1;
      const initialViewed = new Set<number>();
      if (lessonId && getLessonProgressRef.current) {
        const savedProgress = getLessonProgressRef.current(lessonId);
        if (savedProgress) {
          if (Array.isArray(savedProgress.viewed_pages)) {
            savedProgress.viewed_pages.forEach((p) => initialViewed.add(p));
          }
          if (savedProgress.last_page && savedProgress.last_page > 0) {
            initialPage = savedProgress.last_page;
          }
        }
      }

      setViewedPagesSet(initialViewed);
      setCurrentPage(initialPage);

      const doc = await loadPdfDocument(fileUrl);
      loadedUrlRef.current = fileUrl;
      setPdfDoc(doc);
      setNumPages(doc.numPages);

      // Clamp initialPage to numPages
      if (initialPage > doc.numPages && doc.numPages > 0) {
        setCurrentPage(doc.numPages);
      }

      setIsLoadingDoc(false);
    } catch (err: any) {
      console.error('[PdfViewerModal] Failed to load PDF document:', err);
      const msg = err?.message || 'Could not load PDF document from server or storage.';
      setErrorMessage(msg);
      setIsLoadingDoc(false);
    }
  }, [fileUrl, lessonId, pdfDoc]);

  useEffect(() => {
    if (isOpen) {
      loadDocument();
    } else {
      loadedUrlRef.current = null;
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setErrorMessage(null);
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    }
  }, [isOpen, fileUrl]); // Only re-run when isOpen or fileUrl changes

  // 2. Render Current Page with Offscreen Double-Buffering (NO FLASHING)
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || currentPage < 1) return;

    const renderId = ++activeRenderIdRef.current;

    try {
      setIsRenderingPage(true);

      // Cancel previous render task if active
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }

      const page = await pdfDoc.getPage(currentPage);
      if (renderId !== activeRenderIdRef.current) return;

      // Render to an offscreen canvas first to avoid blank flashing
      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * pixelRatio });

      const offscreen = document.createElement('canvas');
      offscreen.width = Math.floor(viewport.width);
      offscreen.height = Math.floor(viewport.height);
      const offscreenCtx = offscreen.getContext('2d');
      if (!offscreenCtx) {
        setIsRenderingPage(false);
        return;
      }

      const renderContext = {
        canvasContext: offscreenCtx,
        viewport,
        canvas: offscreen,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      if (renderId !== activeRenderIdRef.current) return;

      // Instant buffer swap to visible canvas without flickering
      const visibleCanvas = canvasRef.current;
      if (visibleCanvas) {
        visibleCanvas.width = offscreen.width;
        visibleCanvas.height = offscreen.height;
        visibleCanvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
        visibleCanvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;
        const visibleCtx = visibleCanvas.getContext('2d');
        if (visibleCtx) {
          visibleCtx.drawImage(offscreen, 0, 0);
        }
      }
      setIsRenderingPage(false);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('[PdfViewerModal] Error rendering page:', err);
      }
      if (renderId === activeRenderIdRef.current) {
        setIsRenderingPage(false);
      }
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    if (pdfDoc && isOpen) {
      renderPage();
    }
  }, [pdfDoc, currentPage, scale, isOpen, renderPage]);

  // 3. Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleFitWidth = () => {
    if (containerRef.current && pdfDoc) {
      const containerWidth = containerRef.current.clientWidth - 48;
      pdfDoc.getPage(currentPage).then((page) => {
        const unscaledViewport = page.getViewport({ scale: 1 });
        const fitScale = Math.max(0.6, Math.min(2.5, containerWidth / unscaledViewport.width));
        setScale(fitScale);
      });
    }
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  // 4. Track distinct viewed pages and update progress
  useEffect(() => {
    if (!isOpen || !pdfDoc || numPages <= 0 || currentPage < 1) return;

    setViewedPagesSet((prev) => {
      if (prev.has(currentPage)) return prev;
      const next = new Set(prev);
      next.add(currentPage);
      return next;
    });

    if (lessonId && recordPdfPageProgressRef.current) {
      recordPdfPageProgressRef.current(lessonId, currentPage, numPages);
    }
  }, [currentPage, isOpen, lessonId, numPages, pdfDoc]);

  const distinctViewedCount = viewedPagesSet.size;
  const readingPercentage = numPages > 0 ? Math.min(100, Math.round((distinctViewedCount / numPages) * 100)) : 0;
  const isFullyRead = numPages > 0 && distinctViewedCount >= numPages;

  // 5. Keyboard Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, numPages, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-label={`PDF Viewer: ${title}`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div
        className="bg-white dark:bg-[#10243C] rounded-3xl max-w-5xl w-full h-[94vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-[#1E426D] text-left select-none relative"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* =====================================================================
            1. MODAL TOP HEADER: Document Title & Main Actions
            ===================================================================== */}
        <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-slate-200 dark:border-[#1E426D] flex items-center justify-between bg-[#F3F8FB] dark:bg-[#0E2035] shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#176B98] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                <span className="font-bold text-[#176B98] dark:text-[#38BDF8] uppercase tracking-wider">Official PDF</span>
                {subtitle && (
                  <>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="truncate">{subtitle}</span>
                  </>
                )}
                {numPages > 0 && (
                  <>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{numPages} {numPages === 1 ? 'Page' : 'Pages'}</span>
                  </>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate" title={title}>
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Reading Progress Indicator */}
            {numPages > 0 && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] shadow-2xs">
                <BookOpen className={`w-3.5 h-3.5 ${isFullyRead ? 'text-emerald-500' : 'text-[#176B98] dark:text-[#38BDF8]'}`} />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <span className="text-slate-700 dark:text-slate-200">{distinctViewedCount} of {numPages} read</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className={isFullyRead ? 'text-emerald-500' : 'text-[#176B98] dark:text-[#38BDF8]'}>{readingPercentage}%</span>
                  </div>
                  <div className="w-20 sm:w-28 h-1.5 bg-slate-100 dark:bg-[#0E1F33] rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isFullyRead ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#176B98] to-[#25A9D2]'
                      }`}
                      style={{ width: `${readingPercentage}%` }}
                    />
                  </div>
                </div>
                {isFullyRead ? (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Completed
                  </span>
                ) : null}
              </div>
            )}

            {/* Secure View-Only Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38BDF8]" />
              <span>Protected View-Only</span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#153252] hover:bg-slate-200 dark:hover:bg-[#1E426D] text-slate-600 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer ml-1 shadow-2xs border border-transparent dark:border-[#1E426D]"
              aria-label="Close PDF viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            2. VIEWER TOOLBAR: Page Navigation & Zoom Controls
            ===================================================================== */}
        {numPages > 0 && !errorMessage && (
          <div className="bg-slate-800 text-white px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs font-medium border-b border-slate-700 select-none">
            {/* Page Navigation */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isRenderingPage}
                className="p-1 sm:px-2.5 sm:py-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
                title="Previous Page (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="px-2.5 py-1 bg-slate-900/80 rounded-lg text-slate-200 font-mono text-[11px] sm:text-xs">
                Page <span className="font-bold text-white">{currentPage}</span> / {numPages}
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= numPages || isRenderingPage}
                className="p-1 sm:px-2.5 sm:py-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
                title="Next Page (Right Arrow)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.6 || isRenderingPage}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 py-0.5 min-w-[52px] text-center font-mono text-[11px] text-slate-200">
                {Math.round(scale * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 3.0 || isRenderingPage}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={handleFitWidth}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
                title="Fit to Width"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="text-[11px]">Fit Width</span>
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
                title="Reset to 100%"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[11px]">100%</span>
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            3. DOCUMENT CANVAS & BODY VIEWPORT
            ===================================================================== */}
        <div
          ref={containerRef}
          className="flex-1 bg-slate-900/95 overflow-auto relative p-4 sm:p-8 flex items-start justify-center"
        >
          {/* Loading Indicator Spinner */}
          {isLoadingDoc && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-950/80 z-20 space-y-3">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-white">Opening PDF Document...</p>
                <p className="text-xs text-slate-400 mt-1">Fetching document data and initializing PDF renderer</p>
              </div>
            </div>
          )}

          {/* Page Rendering Overlay Spinner */}
          {isRenderingPage && !isLoadingDoc && (
            <div className="absolute top-4 right-4 bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 shadow-lg border border-slate-700 z-10">
              <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              <span>Rendering page {currentPage}...</span>
            </div>
          )}

          {/* Clear Error Message Screen */}
          {errorMessage && !isLoadingDoc && (
            <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center text-white my-auto space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Unable to Render PDF</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={loadDocument}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Loading</span>
                </button>
              </div>
            </div>
          )}

          {/* Actual Rendered PDF Canvas with personalized user security watermark */}
          {!errorMessage && (
            <div
              data-keep-light="true"
              className="inline-block transition-transform duration-150 ease-out shadow-2xl rounded-sm overflow-hidden bg-white relative"
              onContextMenu={(e) => e.preventDefault()}
            >
              <ViewerWatermark user={currentUser} contextLabel={watermarkContextLabel} variant="pdf" />
              <canvas
                ref={canvasRef}
                className="block mx-auto max-w-none relative z-10"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
