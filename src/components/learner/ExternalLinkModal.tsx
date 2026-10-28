import React from 'react';
import { SkillDevelopmentResource } from '../../types/lms';
import {
  X,
  ExternalLink,
  Globe,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ExternalLinkModalProps {
  resource: SkillDevelopmentResource;
  onClose: () => void;
}

export const ExternalLinkModal: React.FC<ExternalLinkModalProps> = ({
  resource,
  onClose,
}) => {
  const targetUrl = resource.external_url || resource.content_url || '#';

  // Extract domain name safely for user verification
  let domain = 'external-source.com';
  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname;
  } catch {}

  const displayCategory = resource.category || resource.topic || 'Skill Development';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#F3F8FB]">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                <span className="font-bold text-[#176B98]">{displayCategory}</span>
                <span className="text-slate-300">·</span>
                <span>KBZ Life Insurance External Resource</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 truncate">
                {resource.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Cover image if available */}
          {resource.thumbnail_url && (
            <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
              <img
                src={resource.thumbnail_url}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {resource.description && (
            <p className="text-xs text-slate-600 leading-relaxed">
              {resource.description}
            </p>
          )}

          {/* Destination Link Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#176B98]" />
                <span>Destination Platform</span>
              </span>
              <span className="font-mono text-slate-500 text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {domain}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-600 truncate bg-white p-2 rounded-lg border border-slate-200">
              {targetUrl}
            </p>
          </div>

          {/* Important Transparency Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">
                Third-Party Hosted Material
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                This material is hosted on an external website curated for KBZ Life Insurance employees. Internal LMS watermarking, tracking, and download restrictions do not apply to third-party services.
              </p>
            </div>
          </div>

          {/* Curator / Sponsor Badge */}
          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
            {resource.instructor_avatar ? (
              <img
                src={resource.instructor_avatar}
                alt={resource.instructor_name || 'KBZ Life Insurance'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#176B98]/10 text-[#176B98] flex items-center justify-center font-bold text-xs p-1 border border-[#176B98]/20">
                <img
                  src="/assets/aistudio/KBZ_Logo_28e9d8fb.png"
                  alt="KBZ Life Insurance"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                Curated by{' '}
                {resource.instructor_name && !/KBZ\s*Life\s*Academy/i.test(resource.instructor_name)
                  ? resource.instructor_name
                  : 'KBZ Life Insurance'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {resource.instructor_title && !/KBZ\s*Life\s*Academy/i.test(resource.instructor_title)
                  ? resource.instructor_title
                  : 'KBZ Life Insurance · Learning & Development'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <span>Open External Resource</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
