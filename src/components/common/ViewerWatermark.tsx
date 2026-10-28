import React, { useMemo } from 'react';

interface ViewerWatermarkProps {
  user: {
    full_name?: string;
    employee_id?: string;
    email?: string;
  };
  contextLabel?: string;
  variant?: 'video' | 'pdf';
}

export const ViewerWatermark: React.FC<ViewerWatermarkProps> = ({
  user,
  contextLabel = 'KBZLIFE CONFIDENTIAL',
  variant = 'pdf',
}) => {
  const userIdentifier = useMemo(() => {
    const name = user.full_name || 'KBZLife Learner';
    const id = user.employee_id || user.email || 'ID-VERIFIED';
    return `${name} (${id})`;
  }, [user]);

  const dateStamp = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // For video: A restrained top-right pill watermark + ultra-faint single center diagonal mark
  if (variant === 'video') {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Subtle, elegant corner branding badge (out of the way of controls and subtitles) */}
        <div className="absolute top-3.5 right-4 flex items-center gap-2 bg-slate-950/40 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10 text-white/60 text-[10px] font-mono tracking-wide shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
          <span>KBZLIFE</span>
          <span className="opacity-40">•</span>
          <span className="truncate max-w-[160px]">{userIdentifier}</span>
        </div>

        {/* Extremely faint single diagonal center watermark (barely 3% opacity so video text/slides are 100% readable) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035]">
          <div className="transform -rotate-15 text-white font-bold text-lg sm:text-2xl tracking-widest whitespace-nowrap select-none uppercase font-mono">
            {contextLabel} • {userIdentifier} • {dateStamp}
          </div>
        </div>
      </div>
    );
  }

  // For PDF: Ultra-subtle background watermarks (3-4% opacity) and unobtrusive footer reference
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-8"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* 2 or 3 very spaced, ultra-faint diagonal lines that never obscure text, numbers, or tables */}
      <div className="absolute inset-0 flex flex-col justify-around items-center opacity-[0.038] py-16 pointer-events-none">
        <div className="transform -rotate-18 text-[#176B98] font-bold text-base sm:text-xl tracking-widest whitespace-nowrap font-mono uppercase">
          KBZLIFE • {contextLabel} • {userIdentifier}
        </div>
        <div className="transform -rotate-18 text-[#176B98] font-bold text-base sm:text-xl tracking-widest whitespace-nowrap font-mono uppercase">
          {contextLabel || 'KBZLIFE CONFIDENTIAL'} • {userIdentifier} • {dateStamp}
        </div>
      </div>

      {/* Discrete bottom edge tag - does not cover page numbers or main content */}
      <div className="absolute bottom-2 left-4 text-[9px] font-mono tracking-wide text-slate-400/70 select-none">
        KBZLife Internal Training • {userIdentifier} • {dateStamp}
      </div>
    </div>
  );
};

