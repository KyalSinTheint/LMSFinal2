import React from 'react';
import { Quote } from 'lucide-react';
import { CompanyContentData } from '../data/companyContent';
import { ImagePlaceholder } from './ImagePlaceholder';

interface CeoMottoSectionProps {
  content: CompanyContentData['ceoMotto'];
}

export const CeoMottoSection: React.FC<CeoMottoSectionProps> = ({ content }) => {
  return (
    <section
      id="ceo-motto"
      aria-labelledby="ceo-motto-heading"
      className="py-16 lg:py-20 bg-light-blue-pattern border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-[#176B98] tracking-wider uppercase mb-2">
            <span>Leadership Guidance</span>
          </div>
          <h2
            id="ceo-motto-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[#176B98] tracking-tight"
          >
            CEO Motto
          </h2>
          <p className="text-sm text-[#737373] mt-1">
            {content.statementContext}
          </p>
        </div>

        {/* Dedicated CEO Motto Layout */}
        <div className="bg-white/95 dark:bg-[#10243C] backdrop-blur-xs rounded-3xl border border-slate-200 dark:border-[#1E426D] overflow-hidden shadow-card-elevated hover:shadow-card-hover transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            {/* CEO Portrait Column (4 cols on md) */}
            <div className="md:col-span-4 bg-[#F3F8FB] dark:bg-[#0E2035] flex flex-col justify-center p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#1E426D]">
              <div className="w-full max-w-xs mx-auto">
                <ImagePlaceholder
                  src={content.photoUrl || '/assets/aistudio/CEO_38bdec3d.jpg'}
                  alt={content.ceoName || 'U Han Win Hlaing'}
                  placeholderText={content.photoCaption || 'U Han Win Hlaing, Chief Executive Officer'}
                  aspectRatioClass="aspect-4/5"
                  className="rounded-2xl shadow-sm border border-slate-200/90 dark:border-[#1E426D]"
                />

                <div className="mt-4 text-center">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    {content.ceoName}
                  </h3>
                  <p className="text-xs text-[#176B98] dark:text-[#38BDF8] font-semibold mt-0.5">
                    {content.ceoTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Quotation Panel Column (8 cols on md) */}
            <div className="md:col-span-8 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative bg-white dark:bg-[#10243C]">
              {/* Quote Icon watermark subtle accent */}
              <Quote
                className="w-20 h-20 text-[#176B98]/5 dark:text-[#38BDF8]/10 absolute top-6 right-6 pointer-events-none"
                aria-hidden="true"
              />

              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38BDF8] text-xs font-bold shadow-2xs">
                  <Quote className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38BDF8]" />
                  <span>Empowering Your Daily Success</span>
                </div>

                <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed tracking-tight whitespace-pre-line text-left">
                  {content.motto}
                </blockquote>
              </div>

              {/* Attribution */}
              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-[#1E426D] flex items-center justify-between text-xs text-[#737373] dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{content.ceoName}</span>
                  {content.ceoTitle && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span>{content.ceoTitle}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
