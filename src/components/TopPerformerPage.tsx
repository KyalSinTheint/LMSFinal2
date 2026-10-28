import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import {
  MonthlyTopPerformerGroup,
  defaultTopPerformers,
} from '../data/portalExtensionsData';
import { TopPerformerMonthCard } from './TopPerformerMonthCard';
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Grid3X3,
  SlidersHorizontal,
  Info,
  Calendar,
} from 'lucide-react';

interface TopPerformerPageProps {
  onBackToOverview?: () => void;
}

export const TopPerformerPage: React.FC<TopPerformerPageProps> = () => {
  const { getPublishedTopPerformers, isSupabaseLive } = useLms();
  const publishedPerformers = getPublishedTopPerformers();

  // Set index: 0 = Jan-Apr (Set 1), 1 = May-Aug (Set 2), 2 = Sep-Dec (Set 3)
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'all-grid'>('carousel');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const monthlyGroups: MonthlyTopPerformerGroup[] = monthNames.map((monthName, idx) => {
    const monthIndex = idx + 1;
    const quarter = monthIndex <= 3 ? 'Q1' : monthIndex <= 6 ? 'Q2' : monthIndex <= 9 ? 'Q3' : 'Q4';
    const setIndex = monthIndex <= 4 ? 0 : monthIndex <= 8 ? 1 : 2;

    const allianceEntry = publishedPerformers.find(
      (p) => p.month_index === monthIndex && p.channel === 'Alliance Channel'
    );
    const bancassuranceEntry = publishedPerformers.find(
      (p) => p.month_index === monthIndex && p.channel === 'Bancassurance Channel'
    );
    const corporateEntry = publishedPerformers.find(
      (p) => p.month_index === monthIndex && p.channel === 'Corporate Channel'
    );

    const defaultGroup = defaultTopPerformers[idx];

    return {
      monthIndex,
      monthName,
      quarter,
      setIndex,
      performers: {
        alliance: {
          channel: 'Alliance Channel',
          name: allianceEntry
            ? allianceEntry.employee_name
            : (isSupabaseLive ? '' : defaultGroup?.performers?.alliance?.name || ''),
          photoUrl: allianceEntry
            ? allianceEntry.image_url
            : (isSupabaseLive ? null : defaultGroup?.performers?.alliance?.photoUrl || null),
          recognitionNote: allianceEntry
            ? `${allianceEntry.achievement_title} — ${allianceEntry.achievement_description}`
            : (isSupabaseLive ? '' : defaultGroup?.performers?.alliance?.recognitionNote || ''),
        },
        bancassurance: {
          channel: 'Bancassurance Channel',
          name: bancassuranceEntry
            ? bancassuranceEntry.employee_name
            : (isSupabaseLive ? '' : defaultGroup?.performers?.bancassurance?.name || ''),
          photoUrl: bancassuranceEntry
            ? bancassuranceEntry.image_url
            : (isSupabaseLive ? null : defaultGroup?.performers?.bancassurance?.photoUrl || null),
          recognitionNote: bancassuranceEntry
            ? `${bancassuranceEntry.achievement_title} — ${bancassuranceEntry.achievement_description}`
            : (isSupabaseLive ? '' : defaultGroup?.performers?.bancassurance?.recognitionNote || ''),
        },
        corporate: {
          channel: 'Corporate Channel',
          name: corporateEntry
            ? corporateEntry.employee_name
            : (isSupabaseLive ? '' : defaultGroup?.performers?.corporate?.name || ''),
          photoUrl: corporateEntry
            ? corporateEntry.image_url
            : (isSupabaseLive ? null : defaultGroup?.performers?.corporate?.photoUrl || null),
          recognitionNote: corporateEntry
            ? `${corporateEntry.achievement_title} — ${corporateEntry.achievement_description}`
            : (isSupabaseLive ? '' : defaultGroup?.performers?.corporate?.recognitionNote || ''),
        },
      },
    };
  });

  const sets = [
    { label: 'Set 1: Jan — Apr', range: 'January – April', months: monthlyGroups.slice(0, 4) },
    { label: 'Set 2: May — Aug', range: 'May – August', months: monthlyGroups.slice(4, 8) },
    { label: 'Set 3: Sep — Dec', range: 'September – December', months: monthlyGroups.slice(8, 12) },
  ];

  const handlePrev = () => {
    setCurrentSetIndex((prev) => (prev > 0 ? prev - 1 : sets.length - 1));
  };

  const handleNext = () => {
    setCurrentSetIndex((prev) => (prev < sets.length - 1 ? prev + 1 : 0));
  };

  const activeSet = sets[currentSetIndex];

  return (
    <div className="py-12 lg:py-16 bg-light-blue-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200 dark:border-[#1E426D]">
          <div className="text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#176B98] dark:text-[#38BDF8] uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#176B98] dark:text-[#38BDF8]" />
              <span>Recognition & Excellence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#176B98] dark:text-[#38BDF8] tracking-tight">
              Top Performer Recognition
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Celebrating outstanding sales and service leadership across our three core distribution channels: <strong>Alliance Channel</strong>, <strong>Bancassurance Channel</strong>, and <strong>Corporate Channel</strong>. Each monthly card displays one channel at a time—use the <strong>left and right side arrows on each card</strong> to browse between channels.
            </p>
          </div>

          {/* Controls: Switch View Mode */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-[#176B98] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#10243C] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E426D] hover:bg-slate-50 dark:hover:bg-[#153252]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Quarterly View</span>
            </button>
            <button
              onClick={() => setViewMode('all-grid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'all-grid'
                  ? 'bg-[#176B98] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#10243C] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E426D] hover:bg-slate-50 dark:hover:bg-[#153252]'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Year Overview</span>
            </button>
          </div>
        </div>

        {/* 3 Channels Clarification Pill Strip */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#10243C] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E426D] flex items-center gap-3 text-left">
            <div className="w-7 h-7 rounded-lg bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38BDF8] font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Alliance Channel</span>
              <span className="text-[11px] text-[#737373] dark:text-slate-400">Retail & Institutional Partnerships</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#10243C] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E426D] flex items-center gap-3 text-left">
            <div className="w-7 h-7 rounded-lg bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38BDF8] font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Bancassurance Channel</span>
              <span className="text-[11px] text-[#737373] dark:text-slate-400">Bank Branch Network Advisors</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#10243C] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E426D] flex items-center gap-3 text-left">
            <div className="w-7 h-7 rounded-lg bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38BDF8] font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Corporate Channel</span>
              <span className="text-[11px] text-[#737373] dark:text-slate-400">Commercial & Group Life Solutions</span>
            </div>
          </div>
        </div>

        {/* VIEW 1: CAROUSEL SLIDER (4 Cards visible side-by-side on desktop) */}
        {viewMode === 'carousel' ? (
          <div className="space-y-6">
            {/* Carousel Navigation Header */}
            <div className="flex items-center justify-between bg-white dark:bg-[#10243C] px-5 py-3 rounded-xl border border-slate-200 dark:border-[#1E426D] shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#176B98] dark:text-[#38BDF8] uppercase tracking-wider">
                  Active Quarter View:
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {activeSet.label}
                </span>
                <span className="text-xs text-[#737373] dark:text-slate-400 hidden sm:inline">
                  (Showing 4 months side-by-side)
                </span>
              </div>

              {/* Slider Arrows & Indicators */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-3">
                  {sets.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSetIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSetIndex === idx
                          ? 'w-6 bg-[#176B98] dark:bg-[#38BDF8]'
                          : 'w-2 bg-slate-300 dark:bg-[#1E426D] hover:bg-slate-400'
                      }`}
                      aria-label={`Go to ${s.label}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg border border-slate-200 dark:border-[#1E426D] hover:bg-slate-100 dark:hover:bg-[#153252] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Previous 4 months"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg border border-slate-200 dark:border-[#1E426D] hover:bg-slate-100 dark:hover:bg-[#153252] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Next 4 months"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 4 Cards Side-by-Side on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {activeSet.months.map((month) => (
                <TopPerformerMonthCard key={month.monthIndex} monthData={month} />
              ))}
            </div>

            {/* Pagination helper info */}
            <div className="flex items-center justify-between text-xs text-[#737373] pt-2 px-1">
              <span>Showing {activeSet.range} (Set {currentSetIndex + 1} of 3)</span>
              <span>Use arrows to slide to next set of 4 cards</span>
            </div>
          </div>
        ) : (
          /* VIEW 2: COMPLETE YEAR OVERVIEW (3 Rows of 4 Cards = 12 Months) */
          <div className="space-y-10">
            {sets.map((set, sIdx) => (
              <div key={sIdx} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#176B98] text-white flex items-center justify-center text-xs font-bold">
                    {sIdx + 1}
                  </div>
                  <h2 className="text-base font-bold text-[#176B98] dark:text-[#38BDF8]">
                    {set.label}
                  </h2>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-[#1E426D]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {set.months.map((month) => (
                    <TopPerformerMonthCard key={month.monthIndex} monthData={month} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informational Guidance Callout */}
        <div className="mt-12 p-5 rounded-xl bg-white dark:bg-[#10243C] border border-slate-200 dark:border-[#1E426D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300 text-left">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Info className="w-4 h-4 text-[#176B98] dark:text-[#38BDF8]" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                Pending Performer Submissions Policy
              </span>
              <span>
                Months awaiting official monthly sales audit results display neutral question-mark silhouette avatars with blank recognition text areas per compliance guidelines.
              </span>
            </div>
          </div>
          <div className="shrink-0 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
            12-Month Annual Framework
          </div>
        </div>
      </div>
    </div>
  );
};
