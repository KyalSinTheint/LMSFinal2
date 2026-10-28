import React from 'react';
import { Eye, Target, Sparkles, Shield } from 'lucide-react';
import { CompanyContentData } from '../data/companyContent';
import { ImagePlaceholder } from './ImagePlaceholder';

interface VisionMissionPurposeProps {
  vision: CompanyContentData['vision'];
  mission: CompanyContentData['mission'];
  purpose: CompanyContentData['purpose'];
}

export const VisionMissionPurposeSection: React.FC<VisionMissionPurposeProps> = ({
  vision,
  mission,
  purpose,
}) => {
  return (
    <section
      id="our-purpose"
      aria-labelledby="vision-mission-purpose-heading"
      className="py-16 sm:py-20 lg:py-24 bg-light-blue-pattern border-b border-slate-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176B98]/10 text-[#176B98] text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#176B98]" />
            <span>Strategic Direction</span>
          </div>
          <h2
            id="vision-mission-purpose-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#176B98] dark:text-[#38BDF8] tracking-tight font-myanmar"
            style={{ textWrap: 'balance' }}
          >
            Vision, Mission & Purpose
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The foundational commitments shaping KBZLIFE's service to the people and families across Myanmar.
          </p>
        </div>

        {/* 3 Distinctive Visual Graphic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* CARD 1: OUR VISION */}
          <div className="bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] overflow-hidden shadow-card-elevated hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 text-left">
            {/* Visual Image Header */}
            <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-[#0E2035]">
              <ImagePlaceholder
                src={vision.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'}
                alt={vision.heading}
                placeholderText="Our Vision Image"
                aspectRatioClass="h-full w-full"
                showBadge={false}
              />
              {/* Badge & Icon Overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-[#176B98] text-white flex items-center justify-center shadow-md">
                  <Eye className="w-5 h-5 text-white" />
                </span>
                <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-[#10243C] backdrop-blur-md text-[#176B98] dark:text-[#38BDF8] text-xs font-extrabold shadow-sm border border-slate-200/90 dark:border-[#1E426D]">
                  Our Vision
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-[#176B98] dark:text-[#38BDF8] tracking-tight font-myanmar">
                  {vision.heading}
                </h3>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-myanmar leading-relaxed">
                  "{vision.burmeseStatement}"
                </p>
                <p className="text-xs sm:text-sm font-medium text-[#737373] dark:text-slate-400 italic">
                  "{vision.englishStatement}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between text-xs text-[#737373] dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Insurtech Excellence</span>
                <span className="text-[#176B98] dark:text-[#38BDF8] font-bold">KBZLIFE</span>
              </div>
            </div>
          </div>

          {/* CARD 2: OUR MISSION */}
          <div className="bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] overflow-hidden shadow-card-elevated hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 text-left">
            {/* Visual Image Header */}
            <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-[#0E2035]">
              <ImagePlaceholder
                src={mission.imageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'}
                alt={mission.heading}
                placeholderText="Our Mission Image"
                aspectRatioClass="h-full w-full"
                showBadge={false}
              />
              {/* Badge & Icon Overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-[#176B98] text-white flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </span>
                <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-[#10243C] backdrop-blur-md text-[#176B98] dark:text-[#38BDF8] text-xs font-extrabold shadow-sm border border-slate-200/90 dark:border-[#1E426D]">
                  Our Mission
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-[#176B98] dark:text-[#38BDF8] tracking-tight font-myanmar">
                  {mission.heading}
                </h3>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-myanmar leading-relaxed">
                  "{mission.burmeseStatement}"
                </p>
                <p className="text-xs sm:text-sm font-medium text-[#737373] dark:text-slate-400 italic">
                  "{mission.englishStatement}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between text-xs text-[#737373] dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Right Insurance for ALL</span>
                <span className="text-[#176B98] dark:text-[#38BDF8] font-bold">KBZLIFE</span>
              </div>
            </div>
          </div>

          {/* CARD 3: OUR PURPOSE */}
          <div className="bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] overflow-hidden shadow-card-elevated hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 text-left">
            {/* Visual Image Header */}
            <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-[#0E2035]">
              <ImagePlaceholder
                src={purpose.imageUrl || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80'}
                alt={purpose.heading}
                placeholderText="Our Purpose Image"
                aspectRatioClass="h-full w-full"
                showBadge={false}
              />
              {/* Badge & Icon Overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-[#176B98] text-white flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </span>
                <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-[#10243C] backdrop-blur-md text-[#176B98] dark:text-[#38BDF8] text-xs font-extrabold shadow-sm border border-slate-200/90 dark:border-[#1E426D]">
                  Our Purpose
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-[#176B98] dark:text-[#38BDF8] tracking-tight font-myanmar">
                  {purpose.heading}
                </h3>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-myanmar leading-relaxed">
                  "{purpose.burmeseStatement}"
                </p>
                <p className="text-xs sm:text-sm font-medium text-[#737373] dark:text-slate-400 italic">
                  "{purpose.englishStatement}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between text-xs text-[#737373] dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Protecting People of Myanmar</span>
                <span className="text-[#176B98] dark:text-[#38BDF8] font-bold">KBZLIFE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
