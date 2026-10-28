import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Award,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  Filter,
  Check,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { ProductKnowledgeItem } from '../../types/lms';
import { useLms } from '../../context/LmsContext';
import { ProductDetailPage } from './ProductDetailPage';

export const ProductKnowledgeHubPage: React.FC = () => {
  const { getPublishedProducts, productQuizAttempts, currentUser } = useLms();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const products = getPublishedProducts();

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'All' ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.short_description && p.short_description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Check if user passed quiz for a product
  const getProductQuizStatus = (productId: string) => {
    const attempts = productQuizAttempts.filter(
      (a) => a.product_id === productId && a.user_id === currentUser.id
    );
    if (attempts.length === 0) return null;
    const passed = attempts.some((a) => a.passed);
    const highestScore = Math.max(...attempts.map((a) => a.percentage));
    return { passed, highestScore };
  };

  // Card thematic styles based on color theme, closely matching reference photo_2026-10-23_13.31.37_001bb28e.jpeg
  const getCardTheme = (theme?: string) => {
    switch (theme) {
      case 'amber':
        return {
          bg: 'bg-amber-500 hover:bg-amber-600',
          textColor: 'text-white',
          kickerColor: 'text-amber-100',
          descColor: 'text-amber-50',
          btnBg: 'bg-white text-amber-800 hover:bg-amber-50',
          badgeBg: 'bg-amber-600/60 text-white',
          ring: 'focus:ring-amber-400',
        };
      case 'rose':
        return {
          bg: 'bg-rose-500 hover:bg-rose-600',
          textColor: 'text-white',
          kickerColor: 'text-rose-100',
          descColor: 'text-rose-50',
          btnBg: 'bg-white text-rose-800 hover:bg-rose-50',
          badgeBg: 'bg-rose-600/60 text-white',
          ring: 'focus:ring-rose-400',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-600 hover:bg-indigo-700',
          textColor: 'text-white',
          kickerColor: 'text-indigo-200',
          descColor: 'text-indigo-100',
          btnBg: 'bg-white text-indigo-900 hover:bg-indigo-50',
          badgeBg: 'bg-indigo-700/60 text-white',
          ring: 'focus:ring-indigo-400',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-600 hover:bg-emerald-700',
          textColor: 'text-white',
          kickerColor: 'text-emerald-100',
          descColor: 'text-emerald-50',
          btnBg: 'bg-white text-emerald-900 hover:bg-emerald-50',
          badgeBg: 'bg-emerald-700/60 text-white',
          ring: 'focus:ring-emerald-400',
        };
      case 'teal':
        return {
          bg: 'bg-teal-600 hover:bg-teal-700',
          textColor: 'text-white',
          kickerColor: 'text-teal-100',
          descColor: 'text-teal-50',
          btnBg: 'bg-white text-teal-900 hover:bg-teal-50',
          badgeBg: 'bg-teal-700/60 text-white',
          ring: 'focus:ring-teal-400',
        };
      case 'sky':
        return {
          bg: 'bg-sky-600 hover:bg-sky-700',
          textColor: 'text-white',
          kickerColor: 'text-sky-100',
          descColor: 'text-sky-50',
          btnBg: 'bg-white text-sky-900 hover:bg-sky-50',
          badgeBg: 'bg-sky-700/60 text-white',
          ring: 'focus:ring-sky-400',
        };
      case 'navy':
      default:
        return {
          bg: 'bg-[#176B98] hover:bg-[#12567a]',
          textColor: 'text-white',
          kickerColor: 'text-sky-200',
          descColor: 'text-sky-100',
          btnBg: 'bg-white text-[#176B98] hover:bg-slate-100',
          badgeBg: 'bg-[#135A80]/80 text-white',
          ring: 'focus:ring-sky-400',
        };
    }
  };

  // If a product is selected, render its dedicated details page
  if (selectedProductId) {
    const selected = products.find((p) => p.id === selectedProductId);
    if (selected) {
      return (
        <ProductDetailPage
          product={selected}
          onBack={() => {
            setSelectedProductId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-[#176B98] to-[#12567a] rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-xs border border-white/15">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>KBZLife Product Portfolio & Assessment Certification</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Product Knowledge Hub
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
            Deepen your mastery of KBZLife insurance contracts, policy benefits, statutory underwriting criteria, and claim guidelines. Complete product-specific certification quizzes to validate advisory competencies.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{products.length} Official Products</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Accredited Knowledge Quizzes</span>
            </span>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#10243C] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#1E426D] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Compact Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, benefits, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E426D] bg-slate-50 dark:bg-[#122842] text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold self-start sm:self-auto">
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredProducts.length}</strong> of {products.length} products
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#122842] hover:bg-slate-200 dark:hover:bg-[#153252] text-slate-600 dark:text-slate-300 border border-transparent dark:border-[#1E426D]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid — Closely matching reference design photo_2026-10-23_13.31.37_001bb28e.jpeg */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#10243C] rounded-3xl p-12 text-center border border-slate-200 dark:border-[#1E426D] shadow-2xs space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No matching products found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters above.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#153252] hover:bg-slate-200 dark:hover:bg-[#1A73A7] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const theme = getCardTheme(product.card_color_theme);
            const quizStatus = getProductQuizStatus(product.id);

            return (
              <div
                key={product.id}
                className={`${theme.bg} rounded-[28px] p-6 sm:p-7 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[340px] relative overflow-hidden group`}
              >
                {/* Top Kicker & Certification Tag */}
                <div className="space-y-3 z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-black uppercase tracking-widest ${theme.kickerColor} flex items-center gap-1.5`}
                    >
                      <span className="w-2 h-2 rounded-full bg-white/70 inline-block" />
                      <span>{product.category}</span>
                    </span>

                    {/* Quiz Status Badge */}
                    {quizStatus?.passed ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-emerald-950 flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>Passed {quizStatus.highestScore}%</span>
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                      >
                        Quiz Available
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <h3
                    className={`text-xl sm:text-2xl font-black ${theme.textColor} tracking-tight leading-snug line-clamp-2`}
                  >
                    {product.title}
                  </h3>

                  {/* Short Description */}
                  <p
                    className={`text-xs sm:text-sm ${theme.descColor} leading-relaxed line-clamp-3 font-normal opacity-95`}
                  >
                    {product.short_description || product.subtitle || product.description}
                  </p>
                </div>

                {/* Bottom Actions & Thumbnail Graphic */}
                <div className="pt-6 flex items-end justify-between gap-4 z-10">
                  {/* Explore Product Button */}
                  <button
                    onClick={() => {
                      setSelectedProductId(product.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-5 py-2.5 rounded-2xl ${theme.btnBg} font-black text-xs sm:text-sm tracking-wide shadow-md transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0`}
                  >
                    <span>Explore Product</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Thumbnail / 3D Asset illustration in lower right matching visual reference */}
                  {product.image_url ? (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xs border border-white/20 shadow-md shrink-0 flex items-center justify-center p-1 transform group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/70">
                      <Shield className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Ambient background blur pattern */}
                <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 pointer-events-none blur-xl" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
