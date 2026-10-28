import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Shield,
  FileText,
  Calendar,
  Users,
  CreditCard,
  Layers,
  ChevronRight,
  BookOpen,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Target,
  Clock,
} from 'lucide-react';
import { ProductKnowledgeItem, ProductQuizAttempt } from '../../types/lms';
import { useLms } from '../../context/LmsContext';
import { ProductQuizModal } from './ProductQuizModal';
import { ProductRichTextRenderer } from '../common/ProductRichTextRenderer';
import { getProductRichContent } from '../../lib/productKnowledgeUtils';

interface ProductDetailPageProps {
  product: ProductKnowledgeItem;
  onBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
}) => {
  const { getUserProductAttempts } = useLms();
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<ProductQuizAttempt[]>([]);
  const [latestAttempt, setLatestAttempt] = useState<ProductQuizAttempt | null>(null);

  const loadAttempts = async () => {
    const userAttempts = await getUserProductAttempts(product.id);
    setAttempts(userAttempts);
    if (userAttempts.length > 0) {
      setLatestAttempt(userAttempts[0]);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, [product.id]);

  // Color theme mapping for the hero card
  const themeClasses: Record<string, { bg: string; text: string; badge: string; border: string }> = {
    amber: {
      bg: 'bg-gradient-to-r from-[#D97706] to-[#B45309]',
      text: 'text-white',
      badge: 'bg-amber-400 text-slate-950 font-black',
      border: 'border-amber-500',
    },
    navy: {
      bg: 'bg-gradient-to-r from-[#176B98] to-[#0F3E57]',
      text: 'text-white',
      badge: 'bg-sky-300 text-[#0F3E57] font-black',
      border: 'border-[#176B98]',
    },
    emerald: {
      bg: 'bg-gradient-to-r from-[#059669] to-[#047857]',
      text: 'text-white',
      badge: 'bg-emerald-300 text-emerald-950 font-black',
      border: 'border-emerald-500',
    },
    indigo: {
      bg: 'bg-gradient-to-r from-[#4F46E5] to-[#3730A3]',
      text: 'text-white',
      badge: 'bg-indigo-200 text-indigo-950 font-black',
      border: 'border-indigo-500',
    },
    teal: {
      bg: 'bg-gradient-to-r from-[#0D9488] to-[#0F766E]',
      text: 'text-white',
      badge: 'bg-teal-200 text-teal-950 font-black',
      border: 'border-teal-500',
    },
    rose: {
      bg: 'bg-gradient-to-r from-[#E11D48] to-[#BE123C]',
      text: 'text-white',
      badge: 'bg-rose-200 text-rose-950 font-black',
      border: 'border-rose-500',
    },
    sky: {
      bg: 'bg-gradient-to-r from-[#0284C7] to-[#0369A1]',
      text: 'text-white',
      badge: 'bg-sky-200 text-sky-950 font-black',
      border: 'border-sky-500',
    },
    slate: {
      bg: 'bg-gradient-to-r from-[#475569] to-[#334155]',
      text: 'text-white',
      badge: 'bg-slate-200 text-slate-950 font-black',
      border: 'border-slate-500',
    },
  };

  const theme = themeClasses[product.card_color_theme || 'navy'] || themeClasses.navy;

  const isCustomRichContent = Boolean(product.content && product.content.trim().length > 0);
  const fullKnowledgeContent =
    (product.content && product.content.trim()) ||
    (product.description && product.description.trim()) ||
    getProductRichContent(product);

  const hasKeyBenefits = Array.isArray(product.key_benefits) && product.key_benefits.length > 0;
  const hasKeyFeatures = Array.isArray(product.key_features) && product.key_features.length > 0;
  const hasEligibility = Boolean(product.eligibility_criteria && product.eligibility_criteria.trim());
  const hasCoverage = Boolean(product.coverage_details && product.coverage_details.trim());
  const hasPremium = Boolean(product.premium_terms && product.premium_terms.trim());
  const hasTargetAudience = Boolean(product.target_audience && product.target_audience.trim());
  const hasAdditionalSections = Array.isArray(product.additional_sections) && product.additional_sections.length > 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#10243C] hover:bg-slate-100 dark:hover:bg-[#153252] text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-[#1E426D] transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
          <span>Back to Product Knowledge Hub</span>
        </button>

        {latestAttempt && (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
              latestAttempt.passed
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              Quiz Certification: {latestAttempt.passed ? 'PASSED' : 'RETAKE NEEDED'} ({latestAttempt.percentage}%)
            </span>
          </div>
        )}
      </div>

      {/* Hero Banner Header */}
      <div
        className={`${theme.bg} rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6`}
      >
        <div className="space-y-3 max-w-2xl z-10">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme.badge}`}
            >
              {product.category || 'Insurance'}
            </span>
            <span className="text-white/80 text-xs font-semibold">
              KBZLife Official Portfolio
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {product.title}
          </h1>

          {product.subtitle && (
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium">
              {product.subtitle}
            </p>
          )}

          {/* Action CTA */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-white text-[#176B98] hover:bg-slate-100 font-black text-xs sm:text-sm tracking-wide transition-all transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#176B98]" />
              <span>Take Product Quiz</span>
              <ChevronRight className="w-4 h-4 text-[#176B98]" />
            </button>
            {latestAttempt && (
              <span className="text-xs text-white/80 font-medium">
                Last scored {latestAttempt.percentage}% ({latestAttempt.passed ? 'Passed' : 'Needs retry'})
              </span>
            )}
          </div>
        </div>

        {/* Product Image Box */}
        {product.image_url && (
          <div className="relative shrink-0 w-full sm:w-72 h-48 sm:h-56 rounded-2xl overflow-hidden bg-white/10 border border-white/20 shadow-lg flex items-center justify-center p-2 z-10">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                // If custom image fails to load, gracefully fall back
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      </div>

      {/* Main Content Grid: Details & Right Quiz Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Product Details & Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complete Product Knowledge Section */}
          <div className="bg-white dark:bg-[#10243C] rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-200 dark:border-[#1E426D] shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#176B98] dark:text-[#38bdf8] pb-3 border-b border-slate-100 dark:border-[#1E426D]">
              <FileText className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
              <span>Product Knowledge & Curriculum</span>
            </div>

            <ProductRichTextRenderer
              content={fullKnowledgeContent}
              className="text-slate-700 dark:text-slate-300"
            />
          </div>

          {/* Key Benefits Section (if provided) */}
          {!isCustomRichContent && hasKeyBenefits && (
            <div className="bg-white dark:bg-[#10243C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E426D] shadow-2xs space-y-4 transition-colors">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#176B98] dark:text-[#38bdf8]">
                <Shield className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
                <span>Key Benefits & Policyholder Protections</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.key_benefits!.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Features Section (if provided) */}
          {!isCustomRichContent && hasKeyFeatures && (
            <div className="bg-white dark:bg-[#10243C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E426D] shadow-2xs space-y-4 transition-colors">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#176B98] dark:text-[#38bdf8]">
                <Layers className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
                <span>Policy Features & Contract Terms</span>
              </div>
              <div className="space-y-2.5">
                {product.key_features!.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8] text-[11px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility & Coverage Details (if provided) */}
          {!isCustomRichContent && (hasEligibility || hasCoverage) && (
            <div className="bg-white dark:bg-[#10243C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E426D] shadow-2xs space-y-4 transition-colors">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#176B98] dark:text-[#38bdf8]">
                <Users className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
                <span>Eligibility & Coverage Parameters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasEligibility && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Eligibility Criteria
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {product.eligibility_criteria}
                    </p>
                  </div>
                )}
                {hasCoverage && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Sum Assured & Coverage Scope
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {product.coverage_details}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Premium Terms & Target Audience (if provided) */}
          {!isCustomRichContent && (hasPremium || hasTargetAudience) && (
            <div className="bg-white dark:bg-[#10243C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E426D] shadow-2xs space-y-4 transition-colors">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#176B98] dark:text-[#38bdf8]">
                <CreditCard className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
                <span>Payment Channels & Target Demographics</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasPremium && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Premium Payment Options
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {product.premium_terms}
                    </p>
                  </div>
                )}
                {hasTargetAudience && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#122842] border border-slate-200 dark:border-[#1E426D] space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Target Audience & Fit
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {product.target_audience}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Dynamic Sections entered by Administrator */}
          {!isCustomRichContent && hasAdditionalSections &&
            product.additional_sections!.map((sec) => (
              <div
                key={sec.id}
                className="bg-white dark:bg-[#10243C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E426D] shadow-2xs space-y-3 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#176B98] dark:text-[#38bdf8]">
                  <Sparkles className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
                  <span>{sec.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </div>
            ))}
        </div>

        {/* Right Column: Quiz Action Card & Certification Summary */}
        <div className="space-y-6">
          {/* Prominent Quiz CTA Card */}
          <div className="bg-gradient-to-br from-[#176B98] to-[#12567a] rounded-3xl p-6 text-white shadow-md space-y-4 sticky top-20">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-300" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-200 block">
                Verification Assessment
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                Product Knowledge Quiz
              </h3>
              <p className="text-xs text-white/80 leading-relaxed mt-1">
                Demonstrate advisory proficiency on policy terms, surrender rights, underwriting rules, and claim procedures for this insurance product.
              </p>
            </div>

            {latestAttempt && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  latestAttempt.passed
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                    : 'bg-amber-500/20 border-amber-400 text-amber-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Your Last Score:</span>
                  <span className="font-extrabold text-white text-sm">
                    {latestAttempt.percentage}%
                  </span>
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  Status: {latestAttempt.passed ? 'PASSED · Verified' : 'Needs Retake'}
                </div>
              </div>
            )}

            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-[#176B98] text-xs font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#176B98]" />
              <span>{latestAttempt ? 'Retake Product Quiz' : 'Take Product Quiz'}</span>
            </button>

            {/* Assessment Rules */}
            <div className="pt-2 border-t border-white/15 space-y-1.5 text-[11px] text-white/70">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Multiple-choice questions with answer review</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Passing mark standard: 80%</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Unlimited attempts for learning reinforcement</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Assessment Modal */}
      <ProductQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        product={product}
        onSuccess={loadAttempts}
      />
    </div>
  );
};
