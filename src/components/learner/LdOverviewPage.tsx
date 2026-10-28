import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLms } from '../../context/LmsContext';
import { LdTeamMember, LdMemberType } from '../../types/lms';
import {
  Quote,
  Users,
  Sparkles,
  GraduationCap,
  Briefcase,
  Building2,
  User,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  LayoutGrid,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';

interface LdOverviewPageProps {
  onNavigateToLicenseTraining?: () => void;
  onNavigateToSkillDev?: () => void;
}

export const LdOverviewPage: React.FC<LdOverviewPageProps> = ({
  onNavigateToLicenseTraining,
  onNavigateToSkillDev,
}) => {
  const { getPublishedHodMotto, getPublishedTeamMembers } = useLms();
  const hodMotto = getPublishedHodMotto();
  const publishedMembers = getPublishedTeamMembers();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | LdMemberType>('all');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Filtered members by search query and type
  const filteredMembers = useMemo(() => {
    let list = publishedMembers;

    if (activeFilter !== 'all') {
      list = list.filter((m) => m.member_type === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.position.toLowerCase().includes(q) ||
          (m.department && m.department.toLowerCase().includes(q))
      );
    }

    return list;
  }, [publishedMembers, activeFilter, searchQuery]);

  // Keep active index within bounds
  useEffect(() => {
    if (activeIndex >= filteredMembers.length) {
      setActiveIndex(Math.max(0, filteredMembers.length - 1));
    }
  }, [filteredMembers.length, activeIndex]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'carousel' || filteredMembers.length <= 1) return;
      // Do not capture if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => Math.min(filteredMembers.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, filteredMembers.length]);

  // Touch swipe support for mobile
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    // Swiping left moves forward to the right (next)
    if (diff > 40 && activeIndex < filteredMembers.length - 1) {
      setActiveIndex((prev) => Math.min(filteredMembers.length - 1, prev + 1));
    }
    // Swiping right moves backward to the left (prev)
    else if (diff < -40 && activeIndex > 0) {
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
    touchStartXRef.current = null;
  };

  const activeMember = filteredMembers[activeIndex] || null;

  const handlePrev = () => {
    if (filteredMembers.length === 0) return;
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (filteredMembers.length === 0) return;
    setActiveIndex((prev) => Math.min(filteredMembers.length - 1, prev + 1));
  };

  const teamMembersCount = publishedMembers.filter((m) => m.member_type === 'team_member').length;
  const internsCount = publishedMembers.filter((m) => m.member_type === 'intern').length;

  return (
    <div className="space-y-16 py-4">
      {/* 1. HOD MOTTO NEAR THE BEGINNING OF THE PAGE */}
      {hodMotto && hodMotto.motto_text.trim() && (
        <section aria-labelledby="hod-motto-heading" className="w-full">
          {/* Section Heading */}
          <div className="max-w-3xl mb-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8] text-xs font-bold tracking-wide mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8]" />
              <span>Leadership Guidance · Learning & Development Hub</span>
            </div>
            <h2
              id="hod-motto-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight"
            >
              Head of Department (HOD) Motto
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {hodMotto.statement_context ||
                'Guiding principles for employee talent capability, ethical compliance, and career progression.'}
            </p>
          </div>

          {/* Motto Card matching CeoMottoSection visual aesthetic */}
          <div className="bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] overflow-hidden shadow-card-elevated hover:shadow-card-hover transition-all">
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
              {/* HOD Portrait Column */}
              <div className="md:col-span-4 bg-[#F3F8FB] dark:bg-[#0E2035] flex flex-col justify-center p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#1E426D]">
                <div className="w-full max-w-xs mx-auto">
                  <div className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 dark:border-[#1E426D] bg-slate-100 dark:bg-[#153252]">
                    {hodMotto.photo_url ? (
                      <img
                        src={hodMotto.photo_url}
                        alt={hodMotto.hod_name || 'Head of Learning & Development'}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F3F8FB] dark:bg-[#0E2035] text-[#176B98] dark:text-[#38bdf8]">
                        <User className="w-16 h-16 opacity-40 mb-2" />
                        <span className="text-xs font-bold">KBZLife Leadership</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      {hodMotto.hod_name || 'Head of Department'}
                    </h3>
                    <p className="text-xs text-[#176B98] dark:text-[#38bdf8] font-semibold mt-0.5">
                      {hodMotto.hod_title || 'Head of Learning & Development'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quotation Panel Column */}
              <div className="md:col-span-8 p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative bg-white dark:bg-[#10243C]">
                <Quote
                  className="w-20 h-20 text-[#176B98]/5 dark:text-[#38bdf8]/5 absolute top-6 right-6 pointer-events-none"
                  aria-hidden="true"
                />

                <div className="space-y-6 relative z-10 text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8] text-xs font-bold shadow-2xs">
                    <Quote className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8]" />
                    <span>Cultivating Talent & Potential</span>
                  </div>

                  <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed tracking-tight whitespace-pre-line text-left">
                    {hodMotto.motto_text}
                  </blockquote>
                </div>

                {/* Attribution and note */}
                <div className="pt-8 mt-8 border-t border-slate-200 dark:border-[#1E426D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#737373] dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {hodMotto.hod_name || 'Daw Khin Thida'}
                    </span>
                    {hodMotto.hod_title && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-slate-600 dark:text-slate-400">{hodMotto.hod_title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. TEAM MEMBERS & INTERNS SECTION WITH SAMPLE IMAGE LAYOUT */}
      <section aria-labelledby="team-cards-heading" className="w-full space-y-6">
        {/* Section Header with Title & Compact Search Bar */}
        <div className="border-b border-slate-200 dark:border-[#1E426D] pb-5 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B98] dark:text-[#38bdf8] uppercase tracking-wider mb-1">
                <Users className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
                <span>Dedicated People & Mentors</span>
              </div>
              <h2
                id="team-cards-heading"
                className="text-2xl sm:text-3xl font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight"
              >
                Our L&D Team & Interns
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                Meet the instructional designers, regulatory compliance trainers, and emerging interns who drive capability development at KBZLife Insurance.
              </p>
            </div>

            {/* Compact Search Bar above the team cards (styled consistent with Company News search) */}
            <div className="relative w-full sm:w-80 md:w-84">
              <label htmlFor="team-search-input" className="sr-only">
                Search team members...
              </label>
              <Search className="w-4 h-4 text-[#737373] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="team-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#153252] rounded-full transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtering Chips & View Layout Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-[#1E426D]">
            {/* Category Chips: All / Team Members / Interns */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#122842] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E426D] hover:bg-slate-50 dark:hover:bg-[#153252]'
                }`}
              >
                All ({publishedMembers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('team_member')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'team_member'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#122842] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E426D] hover:bg-slate-50 dark:hover:bg-[#153252]'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Team Members ({teamMembersCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('intern')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'intern'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#122842] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E426D] hover:bg-slate-50 dark:hover:bg-[#153252]'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Interns ({internsCount})</span>
              </button>
            </div>

            {/* Layout Toggle: Cover Flow (Sample Design) vs Grid View */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'carousel'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8]'
                }`}
                title="Cover Flow 3D Showcase (User Reference Layout)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cover Flow</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8]'
                }`}
                title="Grid Overview"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200 dark:border-[#1E426D] max-w-md mx-auto my-8">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No team members found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different search term or clear the filter.`
                : 'No members are available in this category.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-[#176B98] dark:text-[#38bdf8] bg-[#F3F8FB] dark:bg-[#153252] hover:bg-[#176B98] hover:text-white dark:hover:bg-[#176B98] rounded-lg transition-colors cursor-pointer"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : viewMode === 'carousel' ? (
          /* =========================================================================
             COVER FLOW / 3D GALLERY DECK (MATCHING USER SAMPLE IMAGE PHOTO)
             ========================================================================= */
          <div
            ref={carouselContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative py-6 sm:py-10 px-2 sm:px-4 bg-radial from-slate-900/5 via-slate-800/2 to-transparent rounded-3xl overflow-hidden select-none"
          >
            {/* Gallery Stage / Depth Container */}
            <div className="relative h-[480px] sm:h-[530px] flex items-center justify-center max-w-5xl mx-auto overflow-hidden">
              {filteredMembers.map((member, idx) => {
                const offset = idx - activeIndex;
                const isCenter = offset === 0;
                const isPrev = offset === -1;
                const isNext = offset === 1;
                const isFarPrev = offset === -2;
                const isFarNext = offset === 2;
                const isVisible = Math.abs(offset) <= 2;

                if (!isVisible) return null;

                // 3D positioning styles matching the user-provided sample photo
                let transformStyle = '';
                let zIndex = 10;
                let opacity = 0.4;
                let scale = 0.75;

                if (isCenter) {
                  transformStyle = 'translateX(0%) translateZ(0px) rotateY(0deg)';
                  zIndex = 30;
                  opacity = 1;
                  scale = 1;
                } else if (isPrev) {
                  transformStyle = 'translateX(-58%) translateZ(-90px) rotateY(26deg)';
                  zIndex = 20;
                  opacity = 0.75;
                  scale = 0.88;
                } else if (isNext) {
                  transformStyle = 'translateX(58%) translateZ(-90px) rotateY(-26deg)';
                  zIndex = 20;
                  opacity = 0.75;
                  scale = 0.88;
                } else if (isFarPrev) {
                  transformStyle = 'translateX(-105%) translateZ(-160px) rotateY(40deg)';
                  zIndex = 10;
                  opacity = 0.45;
                  scale = 0.76;
                } else if (isFarNext) {
                  transformStyle = 'translateX(105%) translateZ(-160px) rotateY(-40deg)';
                  zIndex = 10;
                  opacity = 0.45;
                  scale = 0.76;
                }

                return (
                  <div
                    key={member.id}
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      transform: transformStyle,
                      zIndex,
                      opacity,
                    }}
                    className={`absolute transition-all duration-500 ease-out cursor-pointer ${
                      isCenter
                        ? 'w-[300px] sm:w-[350px] md:w-[380px] h-[440px] sm:h-[480px]'
                        : 'w-[260px] sm:w-[300px] md:w-[330px] h-[390px] sm:h-[430px]'
                    }`}
                  >
                    {/* The Card matching sample image visual identity */}
                    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/40 dark:border-[#1E426D] bg-slate-900 group flex flex-col justify-between">
                      {/* Full-bleed Portrait Photo */}
                      <div className="absolute inset-0">
                        {member.photo_url || member.photo_path ? (
                          <img
                            src={member.photo_url || member.photo_path}
                            alt={member.full_name}
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#176B98] flex items-center justify-center text-white">
                            <span className="text-5xl font-extrabold opacity-40">
                              {member.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </span>
                          </div>
                        )}
                        {/* Gradient Vignette overlay for readable text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-black/20" />
                      </div>

                      {/* Card Top Actions (Sample image top buttons: Expand, Controls) */}
                      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs flex items-center gap-1 ${
                            member.member_type === 'intern'
                              ? 'bg-amber-500/90 text-white'
                              : 'bg-[#176B98]/90 text-white'
                          }`}
                        >
                          {member.member_type === 'intern' ? (
                            <>
                              <GraduationCap className="w-3 h-3" />
                              <span>Intern</span>
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-3 h-3" />
                              <span>Team Member</span>
                            </>
                          )}
                        </span>

                        {isCenter && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewMode('grid');
                            }}
                            className="px-2.5 py-1 rounded-full bg-white/30 hover:bg-white/50 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="Expand to Grid View"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Expand</span>
                          </button>
                        )}
                      </div>

                      {/* Card Bottom Content Panel */}
                      <div className="relative z-10 p-4 sm:p-5 backdrop-blur-md bg-white/95 dark:bg-[#10243C]/95 border-t border-slate-100 dark:border-[#1E426D] rounded-b-3xl text-left space-y-1.5 shadow-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base sm:text-lg font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight leading-snug">
                              {member.full_name}
                            </h3>
                            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight mt-0.5">
                              {member.position}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8] shrink-0" />
                            <span className="truncate">{member.department || 'Learning & Development'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                            #{idx + 1} of {filteredMembers.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FLOATING CONTROLLER PILL (Directly matching sample image pill underneath) */}
            {activeMember && (
              <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-3 bg-white/95 dark:bg-[#10243C]/95 backdrop-blur-lg px-3 py-2 rounded-full border border-slate-200/90 dark:border-[#1E426D] shadow-xl max-w-sm sm:max-w-md w-full justify-between">
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={activeIndex === 0}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#153252] text-slate-700 dark:text-slate-200 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-label="Previous team member"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Member Avatar + Name info */}
                  <div className="flex items-center gap-2.5 min-w-0 text-left flex-1 px-1">
                    <img
                      src={activeMember.photo_url || activeMember.photo_path || ''}
                      alt={activeMember.full_name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-[#1E426D]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#176B98] dark:text-[#38bdf8] truncate">
                        {activeMember.full_name}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold truncate">
                        {activeMember.position}
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={activeIndex >= filteredMembers.length - 1}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#153252] text-slate-700 dark:text-slate-200 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-label="Next team member"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Segmented Dots Indicator Bar matching sample slider */}
                <div className="flex items-center gap-1.5 py-1">
                  {filteredMembers.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === activeIndex
                          ? 'w-6 bg-[#176B98] dark:bg-[#38bdf8]'
                          : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             GRID VIEW (Comprehensive Responsive Roster)
             ========================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200/90 dark:border-[#1E426D] shadow-card-elevated hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 text-left min-w-0"
              >
                {/* Photo Container */}
                <div className="relative aspect-4/5 overflow-hidden bg-slate-100 dark:bg-[#0E2035] border-b border-slate-100 dark:border-[#1E426D]">
                  {member.photo_url || member.photo_path ? (
                    <img
                      src={member.photo_url || member.photo_path}
                      alt={member.full_name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#F3F8FB] dark:bg-[#0E2035] text-[#176B98] dark:text-[#38bdf8]">
                      <div className="w-16 h-16 rounded-full bg-[#176B98]/10 dark:bg-[#153252] flex items-center justify-center font-bold text-lg">
                        {member.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Member Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-xs flex items-center gap-1 ${
                        member.member_type === 'intern'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-[#176B98]/90 text-white'
                      }`}
                    >
                      {member.member_type === 'intern' ? (
                        <>
                          <GraduationCap className="w-3 h-3" />
                          <span>Intern</span>
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-3 h-3" />
                          <span>Team Member</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0">
                  <div>
                    <h3 className="text-base font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight group-hover:text-[#12567a] dark:group-hover:text-[#7dd3fc] transition-colors break-words">
                      {member.full_name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 break-words leading-relaxed">
                      {member.position}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#1E426D] flex items-center gap-1.5 text-[11px] text-[#737373] dark:text-slate-400 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8] shrink-0" />
                    <span className="truncate">{member.department || 'Learning & Development'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
