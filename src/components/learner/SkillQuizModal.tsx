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
  BookOpen,
} from 'lucide-react';
import { SkillQuiz, SkillQuizQuestion } from '../../types/lms';
import { useLms } from '../../context/LmsContext';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface SkillQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  categoryName: string;
  resourceId?: string;
  resourceTitle?: string;
  onPassed?: () => void;
}

export const SkillQuizModal: React.FC<SkillQuizModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  resourceId,
  resourceTitle,
  onPassed,
}) => {
  const { getSkillQuiz, submitSkillQuiz } = useLms();
  const [quiz, setQuiz] = useState<SkillQuiz | null>(null);
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

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);

    getSkillQuiz(categoryId, resourceId).then((q) => {
      if (isMounted) {
        setQuiz(q);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, categoryId, resourceId, getSkillQuiz]);

  if (!isOpen) return null;

  const questions: SkillQuizQuestion[] = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const hasAnsweredCurrent = currentQuestion && answers[currentQuestion.id] !== undefined;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (result) return;
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

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await submitSkillQuiz(quiz.id, categoryId, answers);
      if (res.success && res.breakdown) {
        setResult({
          score: res.score || 0,
          total_questions: res.total_questions || totalQuestions,
          percentage: res.percentage || 0,
          passed: Boolean(res.passed),
          passing_score: res.passing_score || quiz.passing_score,
          breakdown: res.breakdown,
          message: res.message || '',
        });
        if (res.passed && onPassed) {
          onPassed();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto text-left"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#10243C] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-[#1E426D] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#1E426D] flex items-center justify-between bg-[#F3F8FB] dark:bg-[#0E2035] shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-[#176B98] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                <span className="font-bold text-[#176B98] dark:text-[#38BDF8]">Skill Assessment</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{categoryName}</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                {quiz?.title || resourceTitle || `${categoryName} Mastery Assessment`}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#153252] hover:bg-slate-200 dark:hover:bg-[#1E426D] text-slate-600 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs border border-transparent dark:border-[#1E426D]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#176B98] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Loading skill assessment questions...</p>
            </div>
          ) : !quiz || questions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Assessment Currently Available</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                An administrator has not yet published an assessment quiz for this topic. Please check back later.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : result ? (
            /* Results Screen with Breakdown */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div
                className={`p-6 rounded-2xl border text-center space-y-3 ${
                  result.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-xs ${
                    result.passed ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <RotateCcw className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-black tracking-tight">
                    {result.passed ? 'Assessment Passed!' : 'Retake Recommended'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90 max-w-md mx-auto">
                    {result.message}
                  </p>
                </div>

                <div className="inline-flex items-center gap-6 px-6 py-2.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-2xs font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                      Your Score
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {result.score} / {result.total_questions} ({result.percentage}%)
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                      Passing Threshold
                    </span>
                    <span className="text-base font-extrabold text-slate-700">
                      {result.passing_score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Question-by-Question Review Breakdown */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Question Review & Explanations ({result.breakdown.length})
                </h5>

                <div className="space-y-3">
                  {result.breakdown.map((item, idx) => (
                    <div
                      key={item.question_id || idx}
                      className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                        item.is_correct
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            item.is_correct
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {item.is_correct ? '✓' : '✕'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900">
                            {idx + 1}. {item.question_text}
                          </p>
                        </div>
                      </div>

                      {item.explanation && (
                        <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 text-[11px] text-slate-600">
                          <span className="font-bold text-slate-800">Explanation:</span>{' '}
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Question Taking View */
            <div className="space-y-6">
              {/* Stepper Strip */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-900 font-bold">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[#176B98] font-bold">
                    Passing Mark: {quiz.passing_score}%
                  </span>
                </div>

                <div className="text-[11px] font-mono font-bold text-slate-600">
                  {answeredCount} of {totalQuestions} answered
                </div>
              </div>

              {/* Question Statement */}
              {currentQuestion && (
                <div className="space-y-4">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQuestion.question_text}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((option, optIdx) => {
                      const isSelected = answers[currentQuestion.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#EBF5FB] dark:bg-[#183B60] border-[#176B98] text-[#0d4a6b] dark:text-sky-200 font-bold shadow-xs ring-1 ring-[#176B98]'
                              : 'bg-white dark:bg-[#122842] border-slate-200 dark:border-[#1E426D] hover:border-slate-300 dark:hover:border-[#25A9D2] hover:bg-slate-50 dark:hover:bg-[#153252] text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#176B98] text-white'
                                : 'bg-slate-100 dark:bg-[#153252] text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-xs sm:text-sm flex-1 leading-snug">{option}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#176B98] dark:text-[#38BDF8] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-[#1E426D] bg-slate-50/80 dark:bg-[#0E2035] flex items-center justify-between gap-3 shrink-0">
          {result ? (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E426D] bg-white dark:bg-[#122842] hover:bg-slate-100 dark:hover:bg-[#153252] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Assessment</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allAnswered || isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <span>Grading...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit for Grading</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
