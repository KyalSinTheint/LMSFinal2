import React, { useState } from 'react';
import { MonthlyTopPerformerGroup, PerformerRecord } from '../data/portalExtensionsData';
import { PerformerAvatarPlaceholder } from './PerformerAvatarPlaceholder';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  ShieldCheck,
  Building,
  Briefcase,
} from 'lucide-react';

interface TopPerformerMonthCardProps {
  monthData: MonthlyTopPerformerGroup;
}

interface ChannelMeta {
  key: keyof MonthlyTopPerformerGroup['performers'];
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  themeColor: string;
  badgeBg: string;
  badgeText: string;
  categoryTag: string;
}

const CHANNEL_CONFIG: ChannelMeta[] = [
  {
    key: 'alliance',
    label: 'Alliance Channel',
    shortLabel: 'Alliance',
    icon: Sparkles,
    themeColor: '#003366',
    badgeBg: 'bg-[#003366]',
    badgeText: 'text-white',
    categoryTag: 'Retail & Institutional Partnerships',
  },
  {
    key: 'bancassurance',
    label: 'Bancassurance Channel',
    shortLabel: 'Bancassurance',
    icon: Building,
    themeColor: '#00529B',
    badgeBg: 'bg-[#00529B]',
    badgeText: 'text-white',
    categoryTag: 'Bank Branch Advisory Network',
  },
  {
    key: 'corporate',
    label: 'Corporate Channel',
    shortLabel: 'Corporate',
    icon: Briefcase,
    themeColor: '#0284C7',
    badgeBg: 'bg-[#0284C7]',
    badgeText: 'text-white',
    categoryTag: 'Commercial & Group Life Solutions',
  },
];

export const TopPerformerMonthCard: React.FC<TopPerformerMonthCardProps> = ({ monthData }) => {
  // State: Displays ONLY ONE channel at a time as required
  const [activeChannelIndex, setActiveChannelIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');

  const currentChannelMeta = CHANNEL_CONFIG[activeChannelIndex];
  const performer: PerformerRecord = monthData.performers[currentChannelMeta.key];
  const hasDetails = Boolean(performer?.name?.trim());
  const IconComponent = currentChannelMeta.icon;

  const handlePrevChannel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideDirection('prev');
    setActiveChannelIndex((prev) => (prev > 0 ? prev - 1 : CHANNEL_CONFIG.length - 1));
  };

  const handleNextChannel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideDirection('next');
    setActiveChannelIndex((prev) => (prev < CHANNEL_CONFIG.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200/90 dark:border-[#1E426D] shadow-card-elevated hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden text-left h-full group/card min-h-[460px]">
      {/* 1. Month Card Header with Quarter and Channel Stepper Indicator */}
      <div className="bg-gradient-to-r from-[#003366] to-[#00529B] px-5 py-3 text-white flex items-center justify-between border-b border-[#002244]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-300" />
          <h3 className="text-sm font-extrabold tracking-tight uppercase">
            {monthData.monthName}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/20 text-sky-100">
            {monthData.quarter}
          </span>
          <span className="text-[11px] font-medium text-sky-200">
            Channel {activeChannelIndex + 1}/3
          </span>
        </div>
      </div>

      {/* 2. Left and Right Channel Navigation Arrows (Vertically centered on the card edges) */}
      <button
        type="button"
        onClick={handlePrevChannel}
        aria-label={`Previous channel (Switch to ${
          CHANNEL_CONFIG[(activeChannelIndex - 1 + 3) % 3].label
        })`}
        className="absolute left-2.5 top-[52%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-[#153252] hover:bg-white dark:hover:bg-[#1E426D] text-slate-700 dark:text-slate-200 hover:text-[#003366] dark:hover:text-[#38BDF8] shadow-md border border-slate-200 dark:border-[#1E426D] flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00529B] cursor-pointer"
        title="View previous channel"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={handleNextChannel}
        aria-label={`Next channel (Switch to ${
          CHANNEL_CONFIG[(activeChannelIndex + 1) % 3].label
        })`}
        className="absolute right-2.5 top-[52%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-[#153252] hover:bg-white dark:hover:bg-[#1E426D] text-slate-700 dark:text-slate-200 hover:text-[#003366] dark:hover:text-[#38BDF8] shadow-md border border-slate-200 dark:border-[#1E426D] flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00529B] cursor-pointer"
        title="View next channel"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* 3. Spacious Single-Channel Viewport (Spacious layout, only ONE channel rendered at a time) */}
      <div className="px-10 py-6 flex-1 flex flex-col justify-between">
        {/* Animated Single-Channel Content Block */}
        <div
          key={`${monthData.monthIndex}-${currentChannelMeta.key}`}
          className="space-y-4 animate-in fade-in duration-200"
        >
          {/* Channel Badge & Type */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${currentChannelMeta.badgeBg} ${currentChannelMeta.badgeText} shadow-2xs`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{currentChannelMeta.label}</span>
            </span>

            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Monthly Recognition
            </span>
          </div>

          {/* Top Image Area: Large, High-Fidelity Performer Portrait / Silhouette */}
          <div className="py-2">
            <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto relative">
              <PerformerAvatarPlaceholder
                photoUrl={performer.photoUrl}
                name={performer.name}
                channel={currentChannelMeta.label}
                className="w-full h-full rounded-2xl shadow-sm border border-slate-200 dark:border-[#1E426D]"
              />
            </div>
          </div>

          {/* Bottom Information Area: Performer Name, Title, and Recognition Details */}
          <div className="text-center min-h-[90px] flex flex-col justify-center">
            {hasDetails ? (
              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                  {performer.name}
                </h4>
                <p className="text-xs font-semibold text-[#00529B] dark:text-[#38BDF8]">
                  {currentChannelMeta.label} Performer
                </p>
                {performer.recognitionNote ? (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed max-w-xs mx-auto pt-1">
                    "{performer.recognitionNote}"
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {currentChannelMeta.categoryTag}
                  </p>
                )}
              </div>
            ) : (
              /* Blank per specification for unpopulated months: silhouette avatar shown, name & channel left blank */
              <div className="py-4 space-y-2">
                <div className="w-12 h-1 bg-slate-200 dark:bg-[#1E426D] rounded-full mx-auto" aria-hidden="true" />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                  Pending monthly audit announcement
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Card Bottom Bar: Quick Channel Dots Selector */}
      <div className="px-5 py-3 bg-[#F8FAFC] dark:bg-[#0E2035] border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {currentChannelMeta.shortLabel}
        </span>

        {/* 3 Channel Dots to switch or see progress */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Channels">
          {CHANNEL_CONFIG.map((cfg, idx) => {
            const isSelected = activeChannelIndex === idx;
            return (
              <button
                key={cfg.key}
                type="button"
                onClick={() => setActiveChannelIndex(idx)}
                className={`transition-all rounded-full cursor-pointer focus-visible:ring-1 focus-visible:ring-[#00529B] ${
                  isSelected
                    ? 'w-5 h-2 bg-[#003366] dark:bg-[#38BDF8]'
                    : 'w-2 h-2 bg-slate-300 dark:bg-[#1E426D] hover:bg-slate-400 dark:hover:bg-[#25A9D2]'
                }`}
                title={`Switch to ${cfg.label}`}
                aria-label={`Channel ${idx + 1}: ${cfg.label}`}
                aria-selected={isSelected}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNextChannel}
          className="text-[11px] font-semibold text-[#00529B] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-0.5"
        >
          <span>Next</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
