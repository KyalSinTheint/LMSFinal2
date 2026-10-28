import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  HelpCircle,
  Check,
  Edit2,
  Trash2,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';
import { formatBytes } from '../../lib/storageUtils';

export interface GeneratedQuestionItem {
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface PdfQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextTitle: string; // e.g. "Chapter 1: Regulatory Accreditation" or "Business English"
  existingPdfs?: Array<{ title: string; url: string; file_name?: string }>;
  onQuestionsGenerated: (
    questions: GeneratedQuestionItem[],
    meta: { fileName: string; numPages?: number; mode: 'replace' | 'append' }
  ) => void;
}

export const PdfQuizGeneratorModal: React.FC<PdfQuizGeneratorModalProps> = ({
  isOpen,
  onClose,
  contextTitle,
  existingPdfs = [],
  onQuestionsGenerated,
}) => {
  const { generateQuizFromPdf, showToast } = useLms();

  const [sourceType, setSourceType] = useState<'upload' | 'existing'>('upload');
  const [selectedExistingUrl, setSelectedExistingUrl] = useState<string>(
    existingPdfs[0]?.url || ''
  );

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isScannedPdf, setIsScannedPdf] = useState<boolean>(false);

  // Review state
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [extractedMeta, setExtractedMeta] = useState<{ fileName: string; numPages?: number } | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const fileInputRef = useRef<HTMLInputElement>(null);
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('error', 'Invalid File Type', 'Please upload a PDF document (.pdf).');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Please upload a PDF under 100 MB.');
      return;
    }

    setSelectedFile(file);
    setGenerationError(null);
    setIsScannedPdf(false);

    // Read base64
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartGeneration = async () => {
    setGenerationError(null);
    setIsScannedPdf(false);
    setIsGenerating(true);
    setProgressStep('Uploading and reading PDF document structure...');

    try {
      let payload: {
        fileUrl?: string;
        base64?: string;
        fileName?: string;
        count: number;
        topic: string;
      };

      if (sourceType === 'upload') {
        if (!fileBase64 && !selectedFile) {
          showToast('error', 'PDF Missing', 'Please select a PDF document to generate questions.');
          setIsGenerating(false);
          return;
        }
        payload = {
          base64: fileBase64 || undefined,
          fileName: selectedFile?.name || 'document.pdf',
          count: questionCount,
          topic: contextTitle || 'Curriculum',
        };
      } else {
        if (!selectedExistingUrl) {
          showToast('error', 'Selection Missing', 'Please select an existing lesson document.');
          setIsGenerating(false);
          return;
        }
        const existingDoc = existingPdfs.find((p) => p.url === selectedExistingUrl);
        payload = {
          fileUrl: selectedExistingUrl,
          fileName: existingDoc?.file_name || existingDoc?.title || 'curriculum.pdf',
          count: questionCount,
          topic: existingDoc?.title || contextTitle || 'Curriculum',
        };
      }

      setProgressStep('Extracting digital text layer & analyzing curriculum rules...');

      const result = await generateQuizFromPdf(payload);

      if (!result.success) {
        setIsGenerating(false);
        if (result.isScanned) {
          setIsScannedPdf(true);
          setGenerationError(
            'The uploaded PDF appears to be a scanned image or contains no searchable digital text layer. OCR or digital text is required for automated question extraction.'
          );
        } else {
          setGenerationError(result.error || 'Failed to extract content from PDF.');
        }
        return;
      }

      if (!result.questions || result.questions.length === 0) {
        setIsGenerating(false);
        setGenerationError('No questions could be formulated from this document text.');
        return;
      }

      setGeneratedQuestions(result.questions);
      setExtractedMeta({
        fileName: payload.fileName || 'document.pdf',
        numPages: result.page_count,
      });
      setIsGenerating(false);
      setProgressStep('');
    } catch (err: unknown) {
      setIsGenerating(false);
      const msg = err instanceof Error ? err.message : String(err);
      setGenerationError(msg || 'An unexpected error occurred during extraction.');
    }
  };

  const handleApplyQuestions = () => {
    if (generatedQuestions.length === 0) return;
    onQuestionsGenerated(generatedQuestions, {
      fileName: extractedMeta?.fileName || 'document.pdf',
      numPages: extractedMeta?.numPages,
      mode: importMode,
    });
    showToast(
      'success',
      'Questions Imported',
      `Imported ${generatedQuestions.length} questions into the quiz builder. You can now review, edit, or adjust passing scores.`
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto text-left"
      onClick={() => {
        if (!isGenerating) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-[#10243C] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-[#1E426D] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#1E426D] bg-gradient-to-r from-[#176B98]/10 via-[#176B98]/5 to-white dark:to-[#10243C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#176B98] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>AI PDF Quiz Generator</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#176B98]/10 dark:bg-[#176B98]/30 text-[#176B98] dark:text-[#38BDF8] uppercase">
                  Automatic
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                Generate questions, answer options, and correct answers from training PDFs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isGenerating) onClose();
            }}
            disabled={isGenerating}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#153252] hover:bg-slate-200 dark:hover:bg-[#1E426D] text-slate-500 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 shadow-xs border border-transparent dark:border-[#1E426D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: When questions have not yet been generated */}
          {generatedQuestions.length === 0 ? (
            <div className="space-y-5">
              {/* Context indicator */}
              <div className="p-3.5 rounded-2xl bg-[#F3F8FB] border border-[#176B98]/20 flex items-center justify-between text-xs text-slate-700">
                <span className="font-semibold text-slate-600">Configuring Quiz for:</span>
                <span className="font-bold text-[#176B98] truncate max-w-[60%]">
                  {contextTitle}
                </span>
              </div>

              {/* Source Mode Switcher (if existing curriculum PDFs are present) */}
              {existingPdfs.length > 0 && (
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setSourceType('upload')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sourceType === 'upload'
                        ? 'bg-[#176B98] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Upload New PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('existing')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sourceType === 'existing'
                        ? 'bg-[#176B98] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Select Existing Lesson PDF ({existingPdfs.length})
                  </button>
                </div>
              )}

              {/* Upload Dropzone */}
              {sourceType === 'upload' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    PDF Training Handbook or Regulatory Manual <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="p-4 rounded-2xl border-2 border-[#176B98]/30 bg-[#F3F8FB] flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {formatBytes(selectedFile.size)} · Digital PDF Document
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFileBase64(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-bold ml-3 cursor-pointer shrink-0"
                      >
                        Change File
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-slate-300 hover:border-[#176B98] rounded-2xl bg-slate-50/70 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-[#176B98]/10 text-slate-500 group-hover:text-[#176B98] flex items-center justify-center shadow-xs transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#176B98]">
                        Click or drag a digital PDF here to extract quiz questions
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Supports statutory handbooks, syllabi, and guidelines (up to 100 MB)
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                /* Select Existing Lesson PDF */
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Select an Existing Lesson PDF <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedExistingUrl}
                    onChange={(e) => setSelectedExistingUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                  >
                    {existingPdfs.map((pdf, idx) => (
                      <option key={idx} value={pdf.url}>
                        {pdf.title} ({pdf.file_name || 'Handbook'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Extraction Parameters */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Questions to Generate Automatically
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        questionCount === num
                          ? 'bg-[#176B98] text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-[#153252] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E426D]'
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              {/* Scanned / Unreadable PDF Error Banner */}
              {isScannedPdf && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold text-amber-900">
                        Scanned or Unreadable PDF Detected
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        The uploaded PDF appears to be a scanned image or contains no selectable digital text layer.
                        Automatic question generation requires a digital PDF with searchable text.
                      </p>
                    </div>
                  </div>
                  <div className="pl-7 text-[11px] text-amber-700 space-y-1">
                    <p>• Recommendation: Upload the original digital document or export directly from Word/Docs.</p>
                    <p>• Alternatively, you can click "Cancel" to manually create multiple-choice questions in the builder.</p>
                  </div>
                </div>
              )}

              {/* General Error Banner */}
              {generationError && !isScannedPdf && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Loading indicator */}
              {isGenerating && (
                <div className="p-6 rounded-2xl bg-[#F3F8FB] border border-[#176B98]/20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#176B98] animate-spin mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{progressStep}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Extracting core insurance principles and structuring multiple-choice questions with answer keys...
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: Review & Edit Generated Questions */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-900">
                      Successfully Extracted {generatedQuestions.length} Quiz Questions
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Extracted from {extractedMeta?.fileName || 'PDF'}
                      {extractedMeta?.numPages ? ` (${extractedMeta.numPages} pages analyzed)` : ''}.
                      Review and edit questions below before importing.
                    </p>
                  </div>
                </div>

                {/* Import Mode: Replace vs Append */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-emerald-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-[#176B98] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Replace Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                      importMode === 'append'
                        ? 'bg-[#176B98] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Append to Existing
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="w-5 h-5 rounded-md bg-[#176B98] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {editingIndex === idx ? (
                          <textarea
                            rows={2}
                            value={q.question_text}
                            onChange={(e) => {
                              const next = [...generatedQuestions];
                              next[idx].question_text = e.target.value;
                              setGeneratedQuestions(next);
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                          />
                        ) : (
                          <h4 className="font-bold text-slate-900 leading-snug">
                            {q.question_text}
                          </h4>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingIndex(editingIndex === idx ? null : idx)}
                          className="p-1 text-slate-500 hover:text-[#176B98] cursor-pointer"
                          title="Edit question text and options"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== idx));
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correct_option_index;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => {
                              // Click to change correct answer
                              const next = [...generatedQuestions];
                              next[idx].correct_option_index = oIdx;
                              setGeneratedQuestions(next);
                            }}
                            className={`p-2 rounded-xl border text-[11px] flex items-center gap-2 cursor-pointer transition-colors ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            {editingIndex === idx ? (
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const next = [...generatedQuestions];
                                  next[idx].options[oIdx] = e.target.value;
                                  setGeneratedQuestions(next);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px]"
                              />
                            ) : (
                              <span className="flex-1 truncate">{opt}</span>
                            )}
                            {isCorrect && (
                              <span className="text-[9px] font-extrabold uppercase text-emerald-700 shrink-0">
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="pl-7">
                        <div className="p-2 rounded-lg bg-white border border-slate-100 text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700">Explanation:</span> {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          {generatedQuestions.length === 0 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartGeneration}
                disabled={isGenerating || (sourceType === 'upload' && !selectedFile)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#176B98] hover:bg-[#12567a] rounded-xl shadow-xs cursor-pointer disabled:opacity-40 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting & Formulating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Extract & Generate Questions</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setGeneratedQuestions([]);
                  setSelectedFile(null);
                  setFileBase64(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Regenerate / Pick Another PDF
              </button>
              <button
                type="button"
                onClick={handleApplyQuestions}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Import {generatedQuestions.length} Questions into Quiz Builder</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
