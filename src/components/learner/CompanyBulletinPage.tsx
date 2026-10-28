import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  SlidersHorizontal,
  X,
  Sparkles,
  Calendar,
  Tag,
  Building2,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { CompanyBulletinItem, BulletinCategory } from '../../types/lms';
import { PdfViewerModal } from '../common/PdfViewerModal';

// Helper for formatting time ago
function formatTimeAgo(isoString: string): string {
  if (!isoString) return 'Recently';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export const CompanyBulletinPage: React.FC = () => {
  const { companyBulletins, currentUser } = useLms();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePdfBulletin, setActivePdfBulletin] = useState<CompanyBulletinItem | null>(null);

  // Filter only published bulletins for users
  const publishedBulletins = useMemo(() => {
    return companyBulletins.filter((b) => b.published === true || b.status === 'published');
  }, [companyBulletins]);

  // Categories list with counts
  const categories: { label: string; value: string; count: number }[] = useMemo(() => {
    const list: { label: string; value: string; count: number }[] = [
      { label: 'All', value: 'All', count: publishedBulletins.length },
      {
        label: 'Campaigns',
        value: 'Campaign',
        count: publishedBulletins.filter((b) => b.category === 'Campaign').length,
      },
      {
        label: 'Policy Memos',
        value: 'Policy Memo',
        count: publishedBulletins.filter((b) => b.category === 'Policy Memo').length,
      },
      {
        label: 'Announcements',
        value: 'Announcement',
        count: publishedBulletins.filter((b) => b.category === 'Announcement').length,
      },
      {
        label: 'Notices',
        value: 'Notice',
        count: publishedBulletins.filter((b) => b.category === 'Notice').length,
      },
    ];
    return list;
  }, [publishedBulletins]);

  // Filtered bulletins according to search query and category
  const filteredBulletins = useMemo(() => {
    let result = [...publishedBulletins];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (b) => b.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.reference_no && b.reference_no.toLowerCase().includes(q)) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q))) ||
          (b.department && b.department.toLowerCase().includes(q))
      );
    }

    return result;
  }, [publishedBulletins, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-[#F5F4FA] via-[#F3F4F9] to-[#ECEFF8] dark:from-[#0B131E] dark:via-[#0E2035] dark:to-[#0B131E] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* =====================================================================
            1. HERO & BULLETIN BANNER
            ===================================================================== */}
        <div className="text-center space-y-3 pt-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-sans">
            Company Bulletin
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Stay aligned with nationwide sales campaigns, compliance directives, standard operating
            procedures, and official leadership notices.
          </p>
        </div>

        {/* =====================================================================
            2. SEARCH & CATEGORY FILTER BAR
            ===================================================================== */}
        <div className="bg-white/90 dark:bg-[#10243C]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/70 dark:border-[#1E426D] shadow-xs space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements, sales campaigns, notices, or department topics..."
              className="w-full pl-11 pr-10 py-3 bg-[#F8FAFC] dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#176B98] text-white shadow-2xs'
                      : 'bg-[#F1F5F9] dark:bg-[#153252] text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38BDF8] hover:bg-slate-200/70 dark:hover:bg-[#183B60]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/90 dark:bg-[#1E426D] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            3. ANNOUNCEMENT CARDS LIST (Clean Corporate Bulletin Layout)
            ===================================================================== */}
        {filteredBulletins.length === 0 ? (
          <div className="bg-white dark:bg-[#10243C] rounded-3xl p-12 text-center border border-slate-200/70 dark:border-[#1E426D] shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#153252] text-slate-400 dark:text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Announcements Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No bulletins match your current filter or query. Try adjusting your search keyword or selecting a different category.
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#153252] hover:bg-slate-200 dark:hover:bg-[#183B60] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {filteredBulletins.map((bulletin) => (
              <div
                key={bulletin.id}
                onClick={() => setActivePdfBulletin(bulletin)}
                className="bg-white dark:bg-[#10243C] rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-[#1E426D] shadow-sm hover:shadow-md hover:border-[#25A9D2]/40 transition-all duration-200 p-6 sm:p-7 relative group cursor-pointer text-left"
              >
                {/* Top Section: Title/Meta + Right Category Indicator */}
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Title & Meta */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Announcement Title */}
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#176B98] dark:group-hover:text-[#38BDF8] transition-colors leading-snug line-clamp-2">
                      {bulletin.title}
                    </h3>

                    {/* Sub-meta Row: Verified Notice Badge + Time Ago */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs pt-0.5">
                      {bulletin.verified !== false && (
                        <span className="flex items-center gap-1 font-semibold text-[#25A9D2]">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-[#25A9D2] text-white shrink-0" />
                          <span>Verified Notice</span>
                        </span>
                      )}

                      <span className="text-slate-400 dark:text-slate-400 font-medium">
                        {formatTimeAgo(bulletin.published_at)}
                      </span>

                      {bulletin.department && (
                        <span className="text-slate-400 dark:text-slate-400 hidden sm:inline-block">
                          • {bulletin.department}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Highlighted Category (No Reference Numbers) */}
                  <div className="shrink-0 text-right space-y-0.5">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
                      {bulletin.category}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                      Official Notice
                    </div>
                  </div>
                </div>

                {/* Middle Section: Short Multi-line Description */}
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-4 line-clamp-2 sm:line-clamp-3">
                  {bulletin.description}
                </p>

                {/* Bottom Section: Tag Pills + View PDF Action Button */}
                <div className="mt-5 pt-2 flex flex-wrap items-center justify-between gap-3">
                  {/* Lavender / Periwinkle Tag Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Default category tag */}
                    <span className="bg-[#F0EFFE] dark:bg-[#1E2545] text-[#7B78B8] dark:text-[#A5B4FC] text-xs font-semibold px-3 py-1 rounded-xl border border-[#E5E3FB] dark:border-[#3730A3] lowercase">
                      {bulletin.category.toLowerCase()}
                    </span>

                    {/* Additional tags */}
                    {bulletin.tags &&
                      bulletin.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#F0EFFE] dark:bg-[#1E2545] text-[#7B78B8] dark:text-[#A5B4FC] text-xs font-semibold px-3 py-1 rounded-xl border border-[#E5E3FB] dark:border-[#3730A3] lowercase"
                        >
                          {tag.toLowerCase()}
                        </span>
                      ))}
                  </div>

                  {/* View Document Button (View-Only, No Download Option) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePdfBulletin(bulletin);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#176B98]/10 dark:bg-[#153252] hover:bg-[#176B98] text-[#176B98] dark:text-[#38BDF8] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-2xs group-hover:bg-[#176B98] group-hover:text-white dark:border dark:border-[#1E426D]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Document</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          4. SECURE IN-APP PDF VIEWER MODAL (VIEW-ONLY, NO DOWNLOAD)
          ===================================================================== */}
      {activePdfBulletin && (
        <PdfViewerModal
          isOpen={!!activePdfBulletin}
          onClose={() => setActivePdfBulletin(null)}
          fileUrl={activePdfBulletin.pdf_url}
          title={activePdfBulletin.title}
          subtitle={`${activePdfBulletin.category} · Published ${formatTimeAgo(activePdfBulletin.published_at)}`}
          fileName={activePdfBulletin.file_name}
          watermarkContextLabel={`CONFIDENTIAL · OFFICIAL KBZLIFE BULLETIN · ${activePdfBulletin.category.toUpperCase()}`}
        />
      )}
    </div>
  );
};
