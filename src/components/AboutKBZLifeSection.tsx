import React from 'react';
import { Building2 } from 'lucide-react';
import { CompanyContentData } from '../data/companyContent';
import { ImagePlaceholder } from './ImagePlaceholder';

interface AboutKBZLifeSectionProps {
  content: CompanyContentData['about'];
}

export const AboutKBZLifeSection: React.FC<AboutKBZLifeSectionProps> = ({ content }) => {
  return (
    <section
      id="about-kbzlife"
      aria-labelledby="about-heading"
      className="py-16 lg:py-24 bg-light-blue-dots border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-[#176B98] dark:text-[#38BDF8] tracking-wider uppercase">
              <Building2 className="w-4 h-4 text-[#176B98] dark:text-[#38BDF8]" />
              <span>Corporate Heritage</span>
            </div>

            <h2
              id="about-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#176B98] dark:text-[#38BDF8] tracking-tight leading-snug font-myanmar"
            >
              {content.heading}
            </h2>

            <div className="space-y-4 text-base text-slate-700 dark:text-slate-200 leading-relaxed font-myanmar max-w-prose">
              {content.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="bg-white/95 dark:bg-[#10243C] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E426D] shadow-card-elevated text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Company Image Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="space-y-3">
              <ImagePlaceholder
                src={content.imageUrl || '/assets/aistudio/KBZL_cb546615.png'}
                alt={content.imageCaption || 'KBZ LIFE Insurance'}
                placeholderText={content.imageCaption || 'KBZ LIFE Insurance'}
                aspectRatioClass="aspect-4/3"
                objectFit="contain"
                className="shadow-card-elevated rounded-2xl border border-slate-200 bg-white"
              />
              <p className="text-center text-xs text-[#737373] font-medium">
                KBZ LIFE Insurance
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
