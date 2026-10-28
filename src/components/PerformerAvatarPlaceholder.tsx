import React, { useState } from 'react';

interface PerformerAvatarProps {
  photoUrl?: string | null;
  name?: string;
  channel?: string;
  className?: string;
}

export const PerformerAvatarPlaceholder: React.FC<PerformerAvatarProps> = ({
  photoUrl,
  name,
  channel,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // If real photo exists and didn't fail
  if (photoUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-slate-100 border border-slate-200 aspect-square ${className}`}>
        <img
          src={photoUrl}
          alt={name ? `${name} - ${channel}` : 'Top Performer Photo'}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }

  // Pure SVG/CSS Silhouette Avatar with Question Mark (?) per prompt specification
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-200/90 aspect-square flex items-center justify-center select-none shadow-2xs group ${className}`}
      aria-label="Pending Performer Announcement"
    >
      {/* Neutral Silhouette Vector */}
      <svg
        className="w-full h-full text-slate-300 transition-colors group-hover:text-slate-300/80"
        fill="currentColor"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Head */}
        <circle cx="50" cy="38" r="18" fill="currentColor" opacity="0.85" />
        {/* Shoulders / Bust */}
        <path
          d="M 18,92 C 18,70 32,60 50,60 C 68,60 82,70 82,92 Z"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>

      {/* Prominent Question Mark Badge overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border-2 border-[#00529B]/30 shadow-xs flex items-center justify-center transform group-hover:scale-105 transition-transform">
          <span className="text-lg sm:text-xl font-bold font-mono text-[#00529B] leading-none">
            ?
          </span>
        </div>
      </div>
    </div>
  );
};
