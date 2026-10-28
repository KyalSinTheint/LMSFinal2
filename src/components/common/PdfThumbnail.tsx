import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { renderFirstPageToDataUrl, getCachedPdfThumbnail } from '../../lib/pdfUtils';

interface PdfThumbnailProps {
  fileUrl?: string;
  title: string;
  className?: string;
  aspectClass?: string;
}

export const PdfThumbnail: React.FC<PdfThumbnailProps> = ({
  fileUrl,
  title,
  className = '',
  aspectClass = 'aspect-16/9',
}) => {
  const [thumbUrl, setThumbUrl] = useState<string | null>(() => {
    return fileUrl ? getCachedPdfThumbnail(fileUrl) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(!thumbUrl && !!fileUrl);
  const [hasError, setHasError] = useState<boolean>(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!fileUrl) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    const cached = getCachedPdfThumbnail(fileUrl);
    if (cached) {
      setThumbUrl(cached);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setHasError(false);

    renderFirstPageToDataUrl(fileUrl, 600)
      .then((dataUrl) => {
        if (!isCancelled && isMountedRef.current) {
          setThumbUrl(dataUrl);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[PdfThumbnail] Failed to render first page:', err);
        if (!isCancelled && isMountedRef.current) {
          setHasError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
    };
  }, [fileUrl]);

  return (
    <div
      className={`relative w-full ${aspectClass} bg-slate-900 overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* 1. Successfully rendered real 1st page */}
      {thumbUrl && !hasError && (
        <img
          src={thumbUrl}
          alt={`First page preview: ${title}`}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      )}

      {/* 2. Loading state with spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white z-10 p-3">
          <Loader2 className="w-7 h-7 text-sky-400 animate-spin mb-2" />
          <span className="text-[11px] font-medium text-slate-300 tracking-wide">
            Rendering Page 1 Preview...
          </span>
        </div>
      )}

      {/* 3. Error Fallback (cleanly styled without placeholder images) */}
      {hasError && !isLoading && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-[#176B98] text-white p-4 text-center">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-2 shadow-xs">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-bold text-white tracking-wide truncate max-w-[85%]">
            {title}
          </span>
          <span className="text-[10px] text-white/70 mt-1 uppercase tracking-wider font-semibold">
            Official PDF Document
          </span>
        </div>
      )}
    </div>
  );
};
