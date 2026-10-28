import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { ProductKnowledgeItem, ProductQuiz, ProductQuizQuestion } from '../../types/lms';
import { useLms } from '../../context/LmsContext';

interface ProductQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductKnowledgeItem;
  onSuccess?: () => void;
}

export const ProductQuizModal: React.FC<ProductQuizModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const { getProductQuiz, submitProductQuizAttempt } = useLms();
  const [quiz, setQuiz] = useState<ProductQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<{
    score: number;
    total_questions: number;
    percentage: number;
    passed: boolean;
    passing_score: number;
    breakdown: Array<{
      question_id: string;
      question_text: string;
      selected_index: number | null;
      correct_index: number;
      is_correct: boolean;
      explanation: string;
    }>;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);

    getProductQuiz(product.id).then((q) => {
      if (isMounted) {
        setQuiz(q);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, product.id, getProductQuiz]);

  // Escape key closes quiz modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const questions: ProductQuizQuestion[] = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const hasAnsweredCurrent = currentQuestion && answers[currentQuestion.id] !== undefined;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (result) return; // Locked once submitted
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitProductQuizAttempt(product.id, quiz.id, answers);
      if (res && res.success) {
        setResult({
          score: res.score ?? 0,
          total_questions: res.total_questions ?? totalQuestions,
          percentage: res.percentage ?? 0,
          passed: Boolean(res.passed),
          passing_score: res.passing_score ?? quiz.passing_score,
          breakdown: res.breakdown || [],
          message: res.message || '',
        });
        if (res.passed && onSuccess) {
          onSuccess();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-left transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="my-auto bg-white dark:bg-[#10243C] rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-[#1E426D] overflow-hidden flex flex-col max-h-[88vh] text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#176B98] dark:bg-[#0E2035] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-xs border-b border-transparent dark:border-[#1E426D]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-200 block truncate">
                Product Knowledge Certification
              </span>
              <h2 className="text-base sm:text-lg font-black text-white truncate">
                {product.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#176B98] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Loading official product assessment questions...
              </p>
            </div>
          ) : !quiz || totalQuestions === 0 ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Quiz Coming Soon</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The product assessment quiz for <strong className="text-slate-800">{product.title}</strong> is currently being prepared by our Learning & Development faculty. Please check back shortly.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#176B98] text-white font-bold text-xs hover:bg-[#12567a] cursor-pointer shadow-xs"
              >
                Return to Product Overview
              </button>
            </div>
          ) : result ? (
            /* Result View */
            <div className="space-y-6">
              {/* Result Banner */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 ${
                  result.passed
                    ? 'bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border-emerald-300'
                    : 'bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-amber-300'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-md ${
                    result.passed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <RotateCcw className="w-8 h-8" />}
                </div>

                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                      result.passed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {result.passed ? 'Assessment Passed' : 'Retake Recommended'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Your Score: {result.percentage}%
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
                    You answered <strong className="text-slate-900">{result.score}</strong> out of{' '}
                    <strong className="text-slate-900">{result.total_questions}</strong> questions correctly. Required passing mark is <strong className="text-slate-900">{result.passing_score}%</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <span>Complete & Back to Product</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question-by-Question Review */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#176B98]" />
                    <span>Assessment Answers & Explanations</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Review your answers below
                  </span>
                </div>

                <div className="space-y-3">
                  {result.breakdown.map((item, index) => (
                    <div
                      key={item.question_id || index}
                      className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                        item.is_correct
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-red-50/40 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            item.is_correct
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {item.is_correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {index + 1}. {item.question_text}
                          </p>

                          {/* Selected vs Correct note */}
                          <div className="text-xs space-y-1">
                            {item.is_correct ? (
                              <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Correct answer selected</span>
                              </p>
                            ) : (
                              <p className="text-red-700 font-semibold flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Incorrect answer submitted</span>
                              </p>
                            )}

                            {item.explanation && (
                              <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-slate-700 text-xs mt-2 leading-relaxed">
                                <strong className="text-slate-900 block mb-0.5">Faculty Guidance:</strong>
                                {item.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Question Taking Flow */
            <div className="space-y-6">
              {/* Progress & Question Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="font-extrabold uppercase tracking-wide text-[#176B98]">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span>
                    Answered: <strong className="text-slate-900">{answeredCount}</strong> / {totalQuestions}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#176B98] transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              {currentQuestion && (
                <div className="bg-slate-50/80 dark:bg-[#122842] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-[#1E426D] space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B98] dark:text-[#38BDF8] bg-sky-100 dark:bg-[#153252] px-2.5 py-0.5 rounded-full inline-block">
                    Multiple Choice Question
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    {currentQuestion.question_text}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-2">
                    {currentQuestion.options.map((option, optIdx) => {
                      const isSelected = answers[currentQuestion.id] === optIdx;
                      const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 dark:bg-[#183B60] border-[#176B98] dark:border-[#38BDF8] ring-2 ring-[#176B98]/20 dark:ring-[#38BDF8]/30 shadow-xs'
                              : 'bg-white dark:bg-[#153252] border-slate-200 dark:border-[#1E426D] hover:border-slate-300 dark:hover:border-[#38BDF8] hover:bg-slate-50/80 dark:hover:bg-[#183B60]'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isSelected
                                ? 'bg-[#176B98] dark:bg-[#38BDF8] text-white dark:text-slate-950 shadow-xs'
                                : 'bg-slate-100 dark:bg-[#10243C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E426D]'
                            }`}
                          >
                            {optionLetter}
                          </div>
                          <span
                            className={`text-xs sm:text-sm font-medium leading-relaxed flex-1 ${
                              isSelected ? 'text-slate-950 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Jump Question Indicators */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {questions.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = answers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCurrent
                          ? 'bg-[#176B98] dark:bg-[#38BDF8] text-white dark:text-slate-950 ring-2 ring-[#176B98]/30 shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-[#122842] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#153252] border border-slate-200 dark:border-[#1E426D]'
                      }`}
                      title={`Go to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Navigation & Submit controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-[#1E426D]">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    currentQuestionIndex === 0
                      ? 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-[#0E2035] cursor-not-allowed border border-slate-200 dark:border-[#1E426D]'
                      : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-[#122842] hover:bg-slate-100 dark:hover:bg-[#153252] border border-slate-200 dark:border-[#1E426D] cursor-pointer shadow-xs'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || answeredCount === 0}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                        isSubmitting || answeredCount === 0
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ring-2 ring-emerald-500/20'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Grading...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit Assessment ({answeredCount}/{totalQuestions})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
