import React, { useState, useEffect } from 'react';
import { useLms } from '../context/LmsContext';
import { CompanyNewsArticle } from '../types/lms';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  X,
  ChevronRight,
  Search,
} from 'lucide-react';

interface OurCompanyNewsPageProps {
  onBackToOverview?: () => void;
}

export const OurCompanyNewsPage: React.FC<OurCompanyNewsPageProps> = () => {
  const { getPublishedNews } = useLms();
  const publishedNews = getPublishedNews();

  const [selectedArticle, setSelectedArticle] = useState<CompanyNewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Case-insensitive search across title, content, summary, category, author
  const query = searchQuery.trim().toLowerCase();
  const filteredNews = publishedNews.filter((article) => {
    if (!query) return true;
    const matchTitle = article.title?.toLowerCase().includes(query) ?? false;
    const matchSummary = article.summary?.toLowerCase().includes(query) ?? false;
    const matchCategory = article.category?.toLowerCase().includes(query) ?? false;
    const matchAuthor = article.author_name?.toLowerCase().includes(query) ?? false;
    const matchContent = Array.isArray(article.content)
      ? article.content.some((p) => typeof p === 'string' && p.toLowerCase().includes(query))
      : false;
    return matchTitle || matchSummary || matchContent || matchCategory || matchAuthor;
  });

  const featuredArticle =
    publishedNews.find((n) => n.is_featured) || publishedNews[0];
  const secondaryArticles = filteredNews.filter((n) => n.id !== featuredArticle?.id);
  const articlesToShow = query ? filteredNews : secondaryArticles;

  // Background scroll locking with shift prevention
  useEffect(() => {
    if (!selectedArticle) return;

    // Calculate scrollbar width to prevent page horizontal shifting
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedArticle]);

  return (
    <div className="py-12 lg:py-16 bg-light-blue-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newspaper Style Masthead Header */}
        <div className="border-b-2 border-[#176B98] pb-6 mb-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#176B98] dark:text-[#38BDF8] uppercase tracking-wider mb-1">
                <Newspaper className="w-4 h-4 text-[#176B98] dark:text-[#38BDF8]" />
                <span>Internal Corporate Gazette</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#176B98] dark:text-[#38BDF8] tracking-tight">
                Our Company News
              </h1>
            </div>

            {/* Compact Search Bar replacing category controls and previous labels */}
            <div className="relative w-full sm:w-80 md:w-84">
              <label htmlFor="news-search-input" className="sr-only">
                Search news
              </label>
              <Search className="w-4 h-4 text-[#737373] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="news-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
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
        </div>

        {/* Empty State Check */}
        {publishedNews.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200 dark:border-[#1E426D] max-w-lg mx-auto">
            <Newspaper className="w-12 h-12 text-[#737373] dark:text-slate-400 opacity-60 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No company news has been published yet.</h3>
            <p className="text-xs text-[#737373] dark:text-slate-400 mt-2">
              Official corporate articles will appear here once approved by Internal Communications.
            </p>
          </div>
        ) : filteredNews.length === 0 ? (
          /* Empty Search State */
          <div className="p-12 text-center bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200 dark:border-[#1E426D] max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#F3F8FB] dark:bg-[#153252] text-[#176B98] dark:text-[#38BDF8] mx-auto mb-4 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No matching articles found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              We couldn't find any articles matching &ldquo;<span className="font-semibold text-slate-800 dark:text-slate-200">{searchQuery}</span>&rdquo;. Try searching for different keywords, topics, or titles.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#176B98] dark:text-[#38BDF8] bg-[#176B98]/10 dark:bg-[#153252] hover:bg-[#176B98]/20 dark:hover:bg-[#183B60] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear search query</span>
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Search active notice */}
            {query && (
              <div className="flex items-center justify-between bg-white dark:bg-[#10243C] px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1E426D] text-xs shadow-2xs">
                <span className="text-slate-700 dark:text-slate-300">
                  Showing <strong className="text-[#176B98] dark:text-[#38BDF8]">{filteredNews.length}</strong> matching{' '}
                  {filteredNews.length === 1 ? 'article' : 'articles'} for &ldquo;
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{searchQuery}</span>&rdquo;
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-[#176B98] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Search</span>
                </button>
              </div>
            )}

            {/* FEATURED STORY (Large Editorial Layout) - Shown only when not filtering via search query */}
            {!query && featuredArticle && (
              <article
                onClick={() => setSelectedArticle(featuredArticle)}
                className="bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200 dark:border-[#1E426D] overflow-hidden shadow-xs hover:border-[#176B98]/40 dark:hover:border-[#38BDF8]/40 hover:shadow-md transition-all cursor-pointer group text-left"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto relative overflow-hidden bg-slate-100 dark:bg-[#0E2035] min-h-[260px]">
                    <img
                      src={
                        featuredArticle.cover_image_url ||
                        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt={featuredArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded bg-[#176B98] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                        Featured Story
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-[#737373] dark:text-slate-400">
                        <span className="font-semibold text-[#176B98] dark:text-[#38BDF8]">{featuredArticle.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {featuredArticle.published_at
                            ? new Date(featuredArticle.published_at).toLocaleDateString()
                            : new Date(featuredArticle.created_at).toLocaleDateString()}
                        </span>
                        {featuredArticle.read_time_minutes && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {featuredArticle.read_time_minutes} min read
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#176B98] dark:text-[#38BDF8] group-hover:text-[#135A80] dark:group-hover:text-[#7DD3FC] transition-colors leading-snug">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {featuredArticle.summary}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between">
                      <span className="text-xs font-medium text-[#737373] dark:text-slate-400">
                        By {featuredArticle.author_name || 'Corporate Desk'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B98] dark:text-[#38BDF8] group-hover:translate-x-0.5 transition-transform">
                        <span>Read Full Story</span>
                        <ArrowRight className="w-4 h-4 text-[#176B98] dark:text-[#38BDF8]" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* ARTICLES GRID */}
            <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E426D] pb-2">
                    <h3 className="text-base font-bold text-[#176B98] dark:text-[#38BDF8] uppercase tracking-wider">
                      {query ? 'Search Results' : 'Latest Announcements & Stories'}
                    </h3>
                    <span className="text-xs text-[#737373] dark:text-slate-400 font-mono">
                      {articlesToShow.length} {articlesToShow.length === 1 ? 'Article' : 'Articles'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articlesToShow.map((article) => (
                      <article
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white dark:bg-[#10243C] rounded-xl border border-slate-200 dark:border-[#1E426D] overflow-hidden shadow-2xs hover:shadow-sm hover:border-[#176B98]/40 dark:hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between cursor-pointer group text-left"
                      >
                    <div>
                      <div className="aspect-16/10 relative overflow-hidden bg-slate-100 dark:bg-[#0E2035]">
                        <img
                          src={
                            article.cover_image_url ||
                            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-0.5 rounded bg-white/90 dark:bg-[#10243C] backdrop-blur-xs text-[#176B98] dark:text-[#38BDF8] text-[10px] font-bold uppercase tracking-wider shadow-2xs border border-transparent dark:border-[#1E426D]">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-[#737373] dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {article.published_at
                              ? new Date(article.published_at).toLocaleDateString()
                              : new Date(article.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#176B98] dark:group-hover:text-[#38BDF8] transition-colors leading-snug">
                          {article.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 mt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#1E426D] pt-3">
                      <span className="text-[#737373] dark:text-slate-400 text-[11px]">
                        {article.author_name || 'Internal Desk'}
                      </span>
                      <span className="text-[#176B98] dark:text-[#38BDF8] font-bold inline-flex items-center gap-1 group-hover:underline">
                        <span>Read</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ARTICLE DETAIL MODAL / READER VIEW WITH SCROLL-LOCK */}
        {selectedArticle && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedArticle(null);
            }}
          >
            <div
              className="bg-white dark:bg-[#10243C] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-[#1E426D] text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="p-4 sm:p-5 bg-[#176B98] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs text-white/90">
                  <Newspaper className="w-4 h-4 text-white" />
                  <span className="font-semibold">KBZLife Employee Gazette</span>
                  <span>·</span>
                  <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded text-[11px]">
                    {selectedArticle.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  aria-label="Close article"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Article Body with Native Scroll and Containment */}
              <div className="p-6 sm:p-8 overflow-y-auto overscroll-contain space-y-6 flex-1">
                <div className="space-y-3">
                  <h1
                    id="article-modal-title"
                    className="text-2xl sm:text-3xl font-extrabold text-[#176B98] dark:text-[#38BDF8] leading-tight"
                  >
                    {selectedArticle.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#737373] dark:text-slate-400 pt-1 border-b border-slate-100 dark:border-[#1E426D] pb-4">
                    <span className="font-semibold text-[#176B98] dark:text-[#38BDF8] bg-[#F3F8FB] dark:bg-[#153252] border border-[#176B98]/20 dark:border-[#1E426D] px-2.5 py-0.5 rounded-full">
                      {selectedArticle.category}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedArticle.published_at
                        ? new Date(selectedArticle.published_at).toLocaleDateString()
                        : new Date(selectedArticle.created_at).toLocaleDateString()}
                    </span>
                    <span>·</span>
                    <span>By {selectedArticle.author_name || 'Corporate Editorial Board'}</span>
                    {selectedArticle.read_time_minutes && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {selectedArticle.read_time_minutes} min read
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {selectedArticle.cover_image_url && (
                  <div className="rounded-xl overflow-hidden aspect-16/9 bg-slate-100 dark:bg-[#0E2035] border border-slate-200 dark:border-[#1E426D]">
                    <img
                      src={selectedArticle.cover_image_url}
                      alt={selectedArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-200 leading-relaxed text-sm space-y-4">
                  <p className="font-semibold text-base text-slate-900 dark:text-slate-100 leading-relaxed bg-[#F3F8FB] dark:bg-[#122842] p-4 rounded-xl border border-slate-200 dark:border-[#1E426D]">
                    {selectedArticle.summary}
                  </p>

                  {Array.isArray(selectedArticle.content) ? (
                    selectedArticle.content.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <p>{String(selectedArticle.content)}</p>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-[#1E426D] flex items-center justify-between">
                  <span className="text-xs text-[#737373] dark:text-slate-400">
                    KBZLife Insurance · Internal Employee Document
                  </span>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 rounded-xl bg-[#176B98] text-white text-xs font-bold hover:bg-[#135A80] transition-colors cursor-pointer"
                  >
                    Close Gazette Reader
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
