import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface ImagePlaceholderProps {
  src?: string | null;
  alt: string;
  placeholderText: string;
  aspectRatioClass?: string;
  className?: string;
  showBadge?: boolean;
  objectFit?: 'cover' | 'contain';
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  src,
  alt,
  placeholderText,
  aspectRatioClass = 'aspect-16/10',
  className = '',
  showBadge = true,
  objectFit = 'cover',
}) => {
  const [hasError, setHasError] = useState(false);

  // If valid src provided and no loading error
  if (src && !hasError) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-white border border-slate-200/80 shadow-sm group ${aspectRatioClass} ${className}`}>
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`w-full h-full transition-transform duration-500 group-hover:scale-[1.02] ${
            objectFit === 'contain' ? 'object-contain p-4' : 'object-cover'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-xs text-white/90 font-medium truncate">{alt}</p>
        </div>
      </div>
    );
  }

  // High-fidelity, tasteful corporate placeholder frame
  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 border-dashed border-[#00529B]/30 bg-gradient-to-br from-[#F0F5FA] to-white flex flex-col items-center justify-center p-6 text-center shadow-xs transition-colors hover:border-[#00529B]/50 ${aspectRatioClass} ${className}`}
    >
      {/* Subtle blueprint grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#003366 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        <div className="w-14 h-14 rounded-xl bg-[#00529B]/10 flex items-center justify-center text-[#00529B] mb-3 shadow-xs">
          <ImageIcon className="w-7 h-7 stroke-[1.75]" />
        </div>

        {showBadge && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#003366]/10 text-[#003366] mb-2 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#00529B]" />
            Official Asset Slot
          </span>
        )}

        <h4 className="text-sm font-bold text-slate-800 font-mono tracking-tight px-3 py-1 bg-white/80 rounded border border-slate-200/60 mb-2">
          {placeholderText}
        </h4>

        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
          Approved KBZLife brand imagery will be placed here. Separated in content configuration.
        </p>

        {hasError && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            <span>Image link unavailable, showing designated placeholder</span>
          </div>
        )}
      </div>
    </div>
  );
};
