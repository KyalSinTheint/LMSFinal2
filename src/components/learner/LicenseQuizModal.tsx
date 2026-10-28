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
  Lock,
  ArrowRight,
} from 'lucide-react';
import { LicenseChapter, LicenseQuiz, LicenseQuizQuestion } from '../../types/lms';
import { useLms } from '../../context/LmsContext';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface LicenseQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: LicenseChapter;
  onPassed?: () => void;
}

export const LicenseQuizModal: React.FC<LicenseQuizModalProps> = ({
  isOpen,
  onClose,
  chapter,
  onPassed,
}) => {
  const { getChapterQuiz, submitChapterQuiz } = useLms();
  const [quiz, setQuiz] = useState<LicenseQuiz | null>(null);
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
    next_chapter_unlocked?: boolean;
    next_chapter_title?: string;
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

    getChapterQuiz(chapter.id).then((q) => {
      if (isMounted) {
        setQuiz(q);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, chapter.id, getChapterQuiz]);

  if (!isOpen) return null;

  const questions: LicenseQuizQuestion[] = quiz?.questions || [];
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

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitChapterQuiz(chapter.id, quiz.id, answers);
      if (res && res.success) {
        setResult({
          score: res.score ?? 0,
          total_questions: res.total_questions ?? totalQuestions,
          percentage: res.percentage ?? 0,
          passed: Boolean(res.passed),
          passing_score: res.passing_score ?? quiz.passing_score,
          next_chapter_unlocked: res.next_chapter_unlocked,
          next_chapter_title: res.next_chapter_title,
          breakdown: res.breakdown || [],
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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-left"
      role="dialog"
      aria-modal="true"
      aria-label={`Assessment: ${chapter.title}`}
    >
      <div className="bg-white dark:bg-[#10243C] rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-[#1E426D] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#176B98] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-sky-100 font-semibold uppercase tracking-wider mb-0.5">
                <span>Chapter {chapter.chapter_number} Assessment</span>
                <span className="text-white/40">·</span>
                <span>Pass Mark: {chapter.passing_score}%</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate" title={chapter.title}>
                {chapter.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
            aria-label="Close Quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#176B98] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading chapter assessment questions...</p>
            </div>
          ) : !quiz || questions.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Assessment In Preparation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The learning materials for Chapter {chapter.chapter_number} have been configured, but the certification quiz questions are currently being verified by the compliance department.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#176B98] text-white text-xs font-bold hover:bg-[#135A80] transition-colors cursor-pointer"
              >
                Return to Library
              </button>
            </div>
          ) : result ? (
            /* Results View */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div
                className={`p-6 sm:p-8 rounded-3xl border text-center space-y-3 ${
                  result.passed
                    ? 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-[#10243C] border-emerald-200 dark:border-emerald-800'
                    : 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-[#10243C] border-amber-200 dark:border-amber-800'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md ${
                    result.passed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {result.passed ? <CheckCircle2 className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      result.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {result.passed ? 'Passed Assessment' : 'Needs Retake'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    Score: {result.score} / {result.total_questions} ({result.percentage}%)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                    {result.passed
                      ? `Congratulations! You met the required ${result.passing_score}% benchmark for Chapter ${chapter.chapter_number}.`
                      : `You scored ${result.percentage}%. You need at least ${result.passing_score}% to pass and unlock the subsequent chapter.`}
                  </p>
                </div>

                {result.passed && result.next_chapter_unlocked && (
                  <div className="p-3.5 bg-emerald-100/70 border border-emerald-300 rounded-2xl max-w-md mx-auto flex items-center justify-center gap-2 text-xs font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Next Chapter Automatically Unlocked: {result.next_chapter_title}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-center gap-3">
                  {!result.passed && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retry Assessment</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Question Feedback Breakdown */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Question Review & Explanations ({result.breakdown.length})
                </h4>

                {result.breakdown.map((item, idx) => (
                  <div
                    key={item.question_id || idx}
                    className={`p-4 sm:p-5 rounded-2xl border text-left ${
                      item.is_correct ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                            item.is_correct ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            item.is_correct ? 'text-emerald-800' : 'text-red-800'
                          }`}
                        >
                          {item.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-900 mb-3 leading-relaxed">
                      {item.question_text}
                    </p>

                    {item.explanation && (
                      <div className="p-3 bg-white/90 dark:bg-[#122842] rounded-xl border border-slate-200 dark:border-[#1E426D] text-xs text-slate-700 dark:text-slate-200 space-y-1">
                        <span className="font-bold text-[#176B98] dark:text-[#38BDF8] block">Regulatory & Practical Context:</span>
                        <p className="leading-relaxed text-[11px]">{item.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Quiz Taking View */
            <div className="space-y-6">
              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>
                    Question <strong className="text-slate-900 dark:text-slate-100">{currentQuestionIndex + 1}</strong> of{' '}
                    <strong>{totalQuestions}</strong>
                  </span>
                  <span className="text-[11px] font-mono text-[#176B98] dark:text-[#38BDF8]">
                    {answeredCount} of {totalQuestions} answered
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#153252] rounded-full overflow-hidden border border-slate-200/80 dark:border-[#1E426D]">
                  <div
                    className="h-full bg-gradient-to-r from-[#176B98] to-[#25A9D2] transition-all duration-300 rounded-full"
                    style={{ width: `${Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              {currentQuestion && (
                <div className="space-y-4">
                  <div className="bg-[#F3F8FB] dark:bg-[#0E2035] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1E426D] shadow-2xs">
                    <span className="text-[11px] font-bold text-[#176B98] dark:text-[#38BDF8] uppercase tracking-wider block mb-1">
                      Question #{currentQuestionIndex + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                      {currentQuestion.question_text}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((option, optIdx) => {
                      const isSelected = answers[currentQuestion.id] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer group ${
                            isSelected
                              ? 'bg-sky-50/80 dark:bg-[#183B60] border-[#176B98] text-[#176B98] dark:text-sky-200 ring-2 ring-[#176B98]/20 shadow-xs'
                              : 'bg-white dark:bg-[#122842] border-slate-200 dark:border-[#1E426D] hover:border-slate-300 dark:hover:border-[#25A9D2] hover:bg-slate-50 dark:hover:bg-[#153252] text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-[#176B98] text-white'
                                  : 'bg-slate-100 dark:bg-[#153252] text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-[#1E426D]'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-xs sm:text-sm font-medium leading-relaxed">
                              {option}
                            </span>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'border-[#176B98] bg-[#176B98] text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0E2035]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation & Question Jump Dots */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#176B98] text-white shadow-xs ring-2 ring-[#176B98]/30'
                          : isAnswered
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-[#122842] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#153252]'
                      }`}
                      title={`Go to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!result && quiz && questions.length > 0 && (
          <div className="bg-[#F3F8FB] dark:bg-[#0E2035] px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-[#1E426D] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#1E426D] bg-white dark:bg-[#122842] hover:bg-slate-50 dark:hover:bg-[#153252] text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#135A80] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Submit Assessment</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
