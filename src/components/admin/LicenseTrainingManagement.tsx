import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  LicenseTrainingLesson,
  LessonContentType,
  LicenseChapter,
  LicenseQuiz,
  LicenseQuizQuestion,
} from '../../types/lms';
import {
  validateLessonFile,
  uploadLargeFileChunked,
  uploadImageFile,
  estimateVideoDuration,
  formatBytes,
  triggerFileDownload,
} from '../../lib/storageUtils';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';
import {
  Award,
  Plus,
  Play,
  FileText,
  Upload,
  X,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Clock,
  Layers,
  Search,
  ExternalLink,
  Film,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Sparkles,
  Save,
  Check,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { PdfThumbnail } from '../common/PdfThumbnail';
import { PdfQuizGeneratorModal, GeneratedQuestionItem } from './PdfQuizGeneratorModal';

export const LICENSE_CATEGORIES = [
  'Regulatory Accreditation',
  'Statutory Compliance',
  'Underwriting Certification',
  'Policyholder Protection',
  'Bancassurance Compliance',
  'Claims & Ethical Governance',
];

interface LessonFormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  chapter_id?: string;
  lesson_type: LessonContentType;
  display_order: number;
  is_published: boolean;
  file_url: string;
  file_path?: string;
  file_size?: number;
  file_size_formatted?: string;
  video_duration?: string;
  thumbnail_url?: string;
  thumbnail_path?: string;
}

const INITIAL_LESSON_FORM: LessonFormData = {
  title: '',
  description: '',
  category: 'Regulatory Accreditation',
  lesson_type: 'video',
  display_order: 1,
  is_published: true,
  file_url: '',
  thumbnail_url: '',
};

interface ChapterFormData {
  id?: string;
  title: string;
  chapter_number: number;
  description: string;
  passing_score: number;
  display_order: number;
  is_published: boolean;
}

const INITIAL_CHAPTER_FORM: ChapterFormData = {
  title: '',
  chapter_number: 1,
  description: '',
  passing_score: 80,
  display_order: 1,
  is_published: true,
};

export const LicenseTrainingManagement: React.FC = () => {
  const {
    licenseTrainingLessons,
    licenseChapters,
    createLicenseLesson,
    updateLicenseLesson,
    deleteLicenseLesson,
    createLicenseChapter,
    updateLicenseChapter,
    deleteLicenseChapter,
    reorderLicenseChapters,
    getChapterQuiz,
    saveChapterQuiz,
    licenseQuizAttempts,
    showToast,
  } = useLms();

  // Top Admin View Tab: 'lessons' | 'chapters' | 'quizzes'
  const [adminTab, setAdminTab] = useState<'lessons' | 'chapters' | 'quizzes'>('lessons');

  // --- Lesson Management State ---
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>(INITIAL_LESSON_FORM);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isLessonSubmitting, setIsLessonSubmitting] = useState(false);
  const [lessonSearchQuery, setLessonSearchQuery] = useState('');
  const [lessonFilterType, setLessonFilterType] = useState<'all' | 'video' | 'pdf'>('all');
  const [deleteLessonConfirmId, setDeleteLessonConfirmId] = useState<string | null>(null);
  const [previewLesson, setPreviewLesson] = useState<LicenseTrainingLesson | null>(null);

  // Lesson file upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // --- Chapter Management State ---
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterFormData, setChapterFormData] = useState<ChapterFormData>(INITIAL_CHAPTER_FORM);
  const [isChapterSubmitting, setIsChapterSubmitting] = useState(false);
  const [deleteChapterConfirmId, setDeleteChapterConfirmId] = useState<string | null>(null);

  // --- Quiz Management State ---
  const [selectedQuizChapterId, setSelectedQuizChapterId] = useState<string>(
    licenseChapters[0]?.id || ''
  );
  const [currentQuiz, setCurrentQuiz] = useState<LicenseQuiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<LicenseQuizQuestion[]>([]);
  const [quizPassingScore, setQuizPassingScore] = useState<number>(80);
  const [isQuizSaving, setIsQuizSaving] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [quizSubTab, setQuizSubTab] = useState<'editor' | 'attempts'>('editor');

  // Editing single question state
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState<{
    id: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
    explanation: string;
  }>({
    id: '',
    question_text: '',
    options: ['', '', '', ''],
    correct_option_index: 0,
    explanation: '',
  });

  // Lock body scroll when modals open
  useBodyScrollLock(
    isLessonModalOpen ||
      isChapterModalOpen ||
      questionModalOpen ||
      isPdfModalOpen ||
      !!deleteLessonConfirmId ||
      !!deleteChapterConfirmId ||
      !!previewLesson
  );

  // Set default selected chapter for quiz tab
  useEffect(() => {
    if (!selectedQuizChapterId && licenseChapters.length > 0) {
      setSelectedQuizChapterId(licenseChapters[0].id);
    }
  }, [licenseChapters, selectedQuizChapterId]);

  // Load Quiz when chapter changes in Quiz tab
  useEffect(() => {
    if (!selectedQuizChapterId) return;

    let isMounted = true;
    setIsLoadingQuiz(true);

    const targetChapter = licenseChapters.find((c) => c.id === selectedQuizChapterId);
    if (targetChapter) {
      setQuizPassingScore(targetChapter.passing_score || 80);
    }

    getChapterQuiz(selectedQuizChapterId).then((quiz) => {
      if (!isMounted) return;
      if (quiz) {
        setCurrentQuiz(quiz);
        setQuizQuestions(quiz.questions || []);
        setQuizPassingScore(quiz.passing_score || targetChapter?.passing_score || 80);
      } else {
        setCurrentQuiz(null);
        setQuizQuestions([]);
      }
      setIsLoadingQuiz(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedQuizChapterId, getChapterQuiz, licenseChapters]);

  // Sorted chapters
  const sortedChapters = useMemo(() => {
    return [...licenseChapters].sort((a, b) => a.display_order - b.display_order);
  }, [licenseChapters]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return licenseTrainingLessons.filter((l) => {
      const lType = l.lesson_type || l.content_type || 'video';
      if (lessonFilterType !== 'all' && lType !== lessonFilterType) return false;
      if (lessonSearchQuery.trim()) {
        const q = lessonSearchQuery.toLowerCase().trim();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchDesc = l.description && l.description.toLowerCase().includes(q);
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [licenseTrainingLessons, lessonFilterType, lessonSearchQuery]);

  // -------------------------------------------------------------
  // LESSON MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenCreateLesson = () => {
    setLessonFormData({
      ...INITIAL_LESSON_FORM,
      chapter_id: licenseChapters[0]?.id || '',
      display_order: licenseTrainingLessons.length + 1,
    });
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setUploadError(null);
    setUploadProgress(0);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: LicenseTrainingLesson) => {
    const isStandardCategory = LICENSE_CATEGORIES.includes(lesson.category || '');
    setLessonFormData({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      category: lesson.category || 'Regulatory Accreditation',
      chapter_id: lesson.chapter_id || licenseChapters[0]?.id || '',
      lesson_type: (lesson.lesson_type || lesson.content_type || 'video') as LessonContentType,
      display_order: lesson.display_order,
      is_published: lesson.is_published ?? (lesson.status === 'published'),
      file_url: lesson.file_url,
      file_path: lesson.file_path,
      file_size: lesson.file_size || lesson.file_size_bytes,
      file_size_formatted:
        lesson.file_size_formatted ||
        (lesson.file_size_bytes ? formatBytes(lesson.file_size_bytes) : undefined),
      video_duration: lesson.video_duration || lesson.duration,
      thumbnail_url: lesson.thumbnail_url || '',
      thumbnail_path: lesson.thumbnail_path,
    });
    if (!isStandardCategory && lesson.category) {
      setIsCustomCategory(true);
      setCustomCategoryInput(lesson.category);
    } else {
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    }
    setUploadError(null);
    setUploadProgress(0);
    setIsLessonModalOpen(true);
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatusText('Upload cancelled by user.');
    showToast('info', 'Upload Cancelled', 'File upload was halted.');
  };

  const handleLessonFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateLessonFile(file, lessonFormData.lesson_type);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      showToast('error', 'File Rejected', validation.error || 'File validation failed');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText(
      `Preparing ${lessonFormData.lesson_type === 'video' ? 'video' : 'PDF'} chunked upload...`
    );

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let durationStr: string | undefined;
      if (lessonFormData.lesson_type === 'video') {
        try {
          const durationSeconds = await estimateVideoDuration(file);
          const mins = Math.floor(durationSeconds / 60);
          const secs = Math.floor(durationSeconds % 60);
          durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;
        } catch {
          durationStr = undefined;
        }
      }

      const result = await uploadLargeFileChunked(
        file,
        'license-training',
        (pct, loaded, total) => {
          setUploadProgress(pct);
          setUploadStatusText(
            `Uploading: ${formatBytes(loaded)} / ${formatBytes(total)} (${pct}%)`
          );
        },
        abortController.signal
      );

      if (result.success && result.url) {
        setLessonFormData((prev) => ({
          ...prev,
          file_url: result.url || '',
          file_path: result.path,
          file_size: file.size,
          file_size_formatted: formatBytes(file.size),
          video_duration: durationStr || prev.video_duration,
        }));
        setUploadStatusText('Upload complete and verified.');
        showToast(
          'success',
          'File Uploaded',
          `${file.name} (${formatBytes(file.size)}) uploaded successfully.`
        );
      } else {
        const errorMsg = result.error || 'Upload could not be finished.';
        setUploadError(errorMsg);
        showToast('error', 'Upload Failed', errorMsg);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        setUploadStatusText('Upload was cancelled.');
      } else {
        const errorMsg = (err as Error)?.message || 'Upload encountered a network failure.';
        setUploadError(errorMsg);
        showToast('error', 'Upload Error', errorMsg);
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleLessonThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImageFile(file, 'lesson_thumbnails');
      if (res.success && res.url) {
        setLessonFormData((prev) => ({
          ...prev,
          thumbnail_url: res.url,
          thumbnail_path: res.path,
        }));
        showToast('success', 'Cover Saved', 'Lesson thumbnail cover updated.');
      } else {
        showToast('error', 'Thumbnail Error', res.error || 'Failed to upload cover');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', 'Thumbnail Error', msg || 'Upload failed');
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonFormData.title.trim()) {
      showToast('error', 'Validation Error', 'Lesson title is required.');
      return;
    }

    if (!lessonFormData.file_url) {
      showToast(
        'error',
        'Validation Error',
        `Please upload a ${lessonFormData.lesson_type} file for this lesson.`
      );
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || 'General Licensing'
      : lessonFormData.category || 'Regulatory Accreditation';

    const targetChapterId = lessonFormData.chapter_id || licenseChapters[0]?.id;

    setIsLessonSubmitting(true);
    try {
      if (lessonFormData.id) {
        const success = await updateLicenseLesson(lessonFormData.id, {
          title: lessonFormData.title.trim(),
          description: lessonFormData.description.trim() || undefined,
          category: finalCategory,
          chapter_id: targetChapterId,
          lesson_type: lessonFormData.lesson_type,
          content_type: lessonFormData.lesson_type,
          display_order: Number(lessonFormData.display_order),
          is_published: lessonFormData.is_published,
          status: lessonFormData.is_published ? 'published' : 'draft',
          file_url: lessonFormData.file_url,
          file_path: lessonFormData.file_path,
          file_size: lessonFormData.file_size,
          file_size_bytes: lessonFormData.file_size,
          file_size_formatted: lessonFormData.file_size_formatted,
          video_duration: lessonFormData.video_duration,
          duration: lessonFormData.video_duration,
          thumbnail_url: lessonFormData.thumbnail_url || undefined,
          thumbnail_path: lessonFormData.thumbnail_path,
        });
        if (success) {
          setIsLessonModalOpen(false);
        }
      } else {
        const created = await createLicenseLesson({
          title: lessonFormData.title.trim(),
          description: lessonFormData.description.trim() || undefined,
          category: finalCategory,
          chapter_id: targetChapterId,
          lesson_type: lessonFormData.lesson_type,
          content_type: lessonFormData.lesson_type,
          display_order: Number(lessonFormData.display_order),
          is_published: lessonFormData.is_published,
          status: lessonFormData.is_published ? 'published' : 'draft',
          file_url: lessonFormData.file_url,
          file_path: lessonFormData.file_path,
          file_size: lessonFormData.file_size,
          file_size_bytes: lessonFormData.file_size,
          file_size_formatted: lessonFormData.file_size_formatted,
          video_duration: lessonFormData.video_duration,
          duration: lessonFormData.video_duration,
          thumbnail_url: lessonFormData.thumbnail_url || undefined,
          thumbnail_path: lessonFormData.thumbnail_path,
        });
        if (created) {
          setIsLessonModalOpen(false);
        }
      }
    } finally {
      setIsLessonSubmitting(false);
    }
  };

  const handleToggleLessonPublish = async (lesson: LicenseTrainingLesson) => {
    const nextPublished = !(lesson.is_published ?? (lesson.status === 'published'));
    await updateLicenseLesson(lesson.id, {
      is_published: nextPublished,
      status: nextPublished ? 'published' : 'draft',
    });
  };

  const handleDeleteLesson = async (id: string) => {
    await deleteLicenseLesson(id);
    setDeleteLessonConfirmId(null);
  };

  // -------------------------------------------------------------
  // CHAPTER MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenCreateChapter = () => {
    const nextNum = sortedChapters.length + 1;
    setChapterFormData({
      ...INITIAL_CHAPTER_FORM,
      chapter_number: nextNum,
      display_order: nextNum,
    });
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (chapter: LicenseChapter) => {
    setChapterFormData({
      id: chapter.id,
      title: chapter.title,
      chapter_number: chapter.chapter_number,
      description: chapter.description || '',
      passing_score: chapter.passing_score || 80,
      display_order: chapter.display_order,
      is_published: chapter.is_published,
    });
    setIsChapterModalOpen(true);
  };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chapterFormData.title.trim()) {
      showToast('error', 'Validation Error', 'Chapter title is required.');
      return;
    }

    setIsChapterSubmitting(true);
    try {
      if (chapterFormData.id) {
        const ok = await updateLicenseChapter(chapterFormData.id, {
          title: chapterFormData.title.trim(),
          chapter_number: Number(chapterFormData.chapter_number),
          description: chapterFormData.description.trim() || undefined,
          passing_score: Number(chapterFormData.passing_score) || 80,
          display_order: Number(chapterFormData.display_order),
          is_published: chapterFormData.is_published,
        });
        if (ok) setIsChapterModalOpen(false);
      } else {
        const ok = await createLicenseChapter({
          title: chapterFormData.title.trim(),
          chapter_number: Number(chapterFormData.chapter_number),
          description: chapterFormData.description.trim() || undefined,
          passing_score: Number(chapterFormData.passing_score) || 80,
          display_order: Number(chapterFormData.display_order),
          is_published: chapterFormData.is_published,
        });
        if (ok) setIsChapterModalOpen(false);
      }
    } finally {
      setIsChapterSubmitting(false);
    }
  };

  const handleToggleChapterPublish = async (chapter: LicenseChapter) => {
    await updateLicenseChapter(chapter.id, {
      is_published: !chapter.is_published,
    });
  };

  const handleDeleteChapter = async (id: string) => {
    await deleteLicenseChapter(id);
    setDeleteChapterConfirmId(null);
  };

  const handleMoveChapter = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedChapters.length) return;

    const newOrder = [...sortedChapters];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    const orderedIds = newOrder.map((c) => c.id);
    await reorderLicenseChapters(orderedIds);
  };

  // -------------------------------------------------------------
  // QUIZ & QUESTION BUILDER HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddQuestion = () => {
    setEditingQuestionIndex(null);
    setQuestionDraft({
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      question_text: '',
      options: ['', '', '', ''],
      correct_option_index: 0,
      explanation: '',
    });
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (index: number) => {
    const q = quizQuestions[index];
    if (!q) return;

    const options = [...(q.options || [])];
    while (options.length < 4) options.push('');

    setEditingQuestionIndex(index);
    setQuestionDraft({
      id: q.id,
      question_text: q.question_text,
      options,
      correct_option_index: q.correct_option_index,
      explanation: q.explanation || '',
    });
    setQuestionModalOpen(true);
  };

  const handleSaveQuestionDraft = () => {
    if (!questionDraft.question_text.trim()) {
      showToast('error', 'Validation Error', 'Question text is required.');
      return;
    }

    const cleanedOptions = questionDraft.options.map((o) => o.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) {
      showToast('error', 'Validation Error', 'Provide at least 2 distinct answer options.');
      return;
    }

    if (
      questionDraft.correct_option_index < 0 ||
      questionDraft.correct_option_index >= cleanedOptions.length
    ) {
      showToast('error', 'Validation Error', 'Select a valid correct answer choice.');
      return;
    }

    const updatedQ: LicenseQuizQuestion = {
      id: questionDraft.id,
      quiz_id: currentQuiz?.id || `quiz_${selectedQuizChapterId}`,
      question_text: questionDraft.question_text.trim(),
      options: cleanedOptions,
      correct_option_index: questionDraft.correct_option_index,
      explanation: questionDraft.explanation.trim() || undefined,
      display_order:
        editingQuestionIndex !== null
          ? quizQuestions[editingQuestionIndex].display_order
          : quizQuestions.length + 1,
    };

    if (editingQuestionIndex !== null) {
      setQuizQuestions((prev) => {
        const next = [...prev];
        next[editingQuestionIndex] = updatedQ;
        return next;
      });
    } else {
      setQuizQuestions((prev) => [...prev, updatedQ]);
    }

    setQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuizQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveEntireQuiz = async () => {
    if (!selectedQuizChapterId) return;

    const targetChapter = licenseChapters.find((c) => c.id === selectedQuizChapterId);
    if (!targetChapter) return;

    if (quizQuestions.length === 0) {
      showToast('error', 'Empty Quiz', 'Add at least one multiple-choice question.');
      return;
    }

    setIsQuizSaving(true);
    try {
      const ok = await saveChapterQuiz(selectedQuizChapterId, {
        title: `${targetChapter.title} Assessment`,
        description: `Official statutory assessment for Chapter ${targetChapter.chapter_number}. Score ${quizPassingScore}% or higher to unlock the next chapter.`,
        passingScore: Number(quizPassingScore) || 80,
        questions: quizQuestions.map((q, idx) => ({
          id: q.id,
          quiz_id: currentQuiz?.id || `quiz_${selectedQuizChapterId}`,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index,
          explanation: q.explanation,
          display_order: idx + 1,
        })),
      });

      if (ok) {
        // Also update chapter passing score if changed
        if (targetChapter.passing_score !== quizPassingScore) {
          await updateLicenseChapter(targetChapter.id, {
            passing_score: Number(quizPassingScore),
          });
        }
      }
    } finally {
      setIsQuizSaving(false);
    }
  };

  const selectedChapter = useMemo(() => {
    return licenseChapters.find((c) => c.id === selectedQuizChapterId) || sortedChapters[0];
  }, [licenseChapters, selectedQuizChapterId, sortedChapters]);

  const existingChapterPdfs = useMemo(() => {
    return licenseTrainingLessons
      .filter(
        (l) =>
          (l.chapter_id === selectedQuizChapterId ||
            (!l.chapter_id && sortedChapters[0]?.id === selectedQuizChapterId)) &&
          (l.lesson_type === 'pdf' || l.content_type === 'pdf')
      )
      .map((l) => ({
        title: l.title,
        url: l.file_url,
        file_name: l.file_path?.split('/').pop() || l.file_name,
      }));
  }, [licenseTrainingLessons, selectedQuizChapterId, sortedChapters]);

  const handlePdfQuestionsGenerated = (
    newQuestions: GeneratedQuestionItem[],
    meta: { fileName: string; numPages?: number; mode: 'replace' | 'append' }
  ) => {
    const formatted: LicenseQuizQuestion[] = newQuestions.map((q, idx) => ({
      id: `q_${Date.now()}_${idx + 1}`,
      quiz_id: currentQuiz?.id || `quiz_${selectedQuizChapterId}`,
      question_text: q.question_text,
      options: q.options,
      correct_option_index: q.correct_option_index,
      explanation: q.explanation,
      display_order: idx + 1,
    }));

    if (meta.mode === 'replace') {
      setQuizQuestions(formatted);
    } else {
      setQuizQuestions((prev) => [
        ...prev,
        ...formatted.map((q, i) => ({ ...q, display_order: prev.length + i + 1 })),
      ]);
    }
  };

  const relevantAttempts = useMemo(() => {
    return licenseQuizAttempts.filter(
      (a) => !selectedQuizChapterId || a.chapter_id === selectedQuizChapterId
    );
  }, [licenseQuizAttempts, selectedQuizChapterId]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#176B98] mb-1">
            <Award className="w-4 h-4" />
            <span>Admin Management</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal">Licensing Curriculum Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#176B98] tracking-tight">
            License Training Curriculum & Quizzes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Manage sequential licensing chapters, upload videos and PDF handbooks, configure passing score thresholds, and author chapter assessments.
          </p>
        </div>

        {/* Dynamic Action Button based on active admin tab */}
        <div className="flex items-center gap-2 shrink-0">
          {adminTab === 'lessons' && (
            <button
              type="button"
              onClick={handleOpenCreateLesson}
              className="px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Lesson</span>
            </button>
          )}

          {adminTab === 'chapters' && (
            <button
              type="button"
              onClick={handleOpenCreateChapter}
              className="px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Chapter</span>
            </button>
          )}

          {adminTab === 'quizzes' && (
            <button
              type="button"
              onClick={handleSaveEntireQuiz}
              disabled={isQuizSaving || quizQuestions.length === 0}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isQuizSaving ? 'Saving Quiz...' : 'Save Quiz Assessment'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Admin Navigation Tabs adhering to zero-pill discipline */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAdminTab('lessons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'lessons'
                ? 'bg-[#176B98] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#176B98] hover:bg-[#F3F8FB]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Lessons & Materials ({licenseTrainingLessons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('chapters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'chapters'
                ? 'bg-[#176B98] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#176B98] hover:bg-[#F3F8FB]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chapters & Sequencing ({sortedChapters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('quizzes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'quizzes'
                ? 'bg-[#176B98] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#176B98] hover:bg-[#F3F8FB]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chapter Quizzes & Questions</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LESSONS & MATERIALS (VIDEOS & PDF HANDBOOKS)
          ========================================================================= */}
      {adminTab === 'lessons' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            {/* Format tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setLessonFilterType('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  lessonFilterType === 'all'
                    ? 'bg-white text-[#176B98] shadow-2xs'
                    : 'text-slate-600 hover:text-[#176B98] hover:bg-[#F3F8FB]'
                }`}
              >
                All ({licenseTrainingLessons.length})
              </button>
              <button
                type="button"
                onClick={() => setLessonFilterType('video')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  lessonFilterType === 'video'
                    ? 'bg-white text-[#176B98] shadow-2xs'
                    : 'text-slate-600 hover:text-[#176B98] hover:bg-[#F3F8FB]'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>
                  Videos (
                  {
                    licenseTrainingLessons.filter(
                      (l) => (l.lesson_type || l.content_type) === 'video'
                    ).length
                  }
                  )
                </span>
              </button>
              <button
                type="button"
                onClick={() => setLessonFilterType('pdf')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  lessonFilterType === 'pdf'
                    ? 'bg-white text-[#176B98] shadow-2xs'
                    : 'text-slate-600 hover:text-[#176B98] hover:bg-[#F3F8FB]'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>
                  PDFs (
                  {
                    licenseTrainingLessons.filter(
                      (l) => (l.lesson_type || l.content_type) === 'pdf'
                    ).length
                  }
                  )
                </span>
              </button>
            </div>

            {/* Simple Search bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lessons by title or description..."
                value={lessonSearchQuery}
                onChange={(e) => setLessonSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#176B98]/30 focus:border-[#176B98]"
              />
              {lessonSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLessonSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            {filteredLessons.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#176B98]" />
                <p className="text-sm font-semibold text-slate-700">No license lessons match your filter</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Upload New Lesson" to add the first licensing module.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredLessons.map((lesson) => {
                  const isVideo = (lesson.lesson_type || lesson.content_type) === 'video';
                  const displayDuration = lesson.video_duration || lesson.duration;
                  const displaySize =
                    lesson.file_size_formatted ||
                    (lesson.file_size_bytes ? formatBytes(lesson.file_size_bytes) : undefined);
                  const isPub = lesson.is_published ?? (lesson.status === 'published');
                  const assignedChapter = licenseChapters.find((c) => c.id === lesson.chapter_id);

                  return (
                    <div
                      key={lesson.id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F3F8FB] transition-colors border-l-4 border-transparent hover:border-[#176B98]"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Thumbnail / Icon */}
                        <div className="w-20 h-14 rounded-xl bg-slate-900 shrink-0 overflow-hidden relative shadow-2xs border border-slate-200">
                          {isVideo ? (
                            lesson.thumbnail_url ? (
                              <img
                                src={lesson.thumbnail_url}
                                alt={lesson.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-[#176B98] text-white">
                                <Play className="w-5 h-5" />
                              </div>
                            )
                          ) : (
                            <PdfThumbnail
                              fileUrl={lesson.file_url}
                              title={lesson.title}
                              aspectClass="w-full h-full"
                            />
                          )}
                        </div>

                        {/* Text info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1 flex-wrap">
                            <span className="font-mono text-slate-400">
                              #{lesson.display_order}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-semibold text-[#176B98]">
                              {assignedChapter
                                ? `Chapter ${assignedChapter.chapter_number}`
                                : 'Chapter 1 (Default)'}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-semibold text-slate-700">
                              {isVideo ? 'Video Lesson' : 'PDF Handbook'}
                            </span>
                            {displayDuration && (
                              <>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  <Clock className="w-3 h-3 text-[#176B98]" />
                                  {displayDuration}
                                </span>
                              </>
                            )}
                            {displaySize && (
                              <>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  <HardDrive className="w-3 h-3" />
                                  {displaySize}
                                </span>
                              </>
                            )}
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span
                              className={isPub ? 'text-emerald-700 font-bold' : 'text-amber-600 font-bold'}
                            >
                              {isPub ? 'Published' : 'Draft'}
                            </span>
                          </div>

                          <h3 className="text-sm font-extrabold text-slate-900 truncate">
                            {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => setPreviewLesson(lesson)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-white hover:bg-[#176B98] hover:border-[#176B98] transition-colors flex items-center gap-1 cursor-pointer"
                          title="Preview lesson content"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleLessonPublish(lesson)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            isPub
                              ? 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-[#176B98]/40'
                              : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                          title={isPub ? 'Unpublish' : 'Publish'}
                        >
                          {isPub ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>Unpublish</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Publish</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditLesson(lesson)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-white hover:bg-[#176B98] hover:border-[#176B98] transition-colors cursor-pointer"
                          title="Edit Lesson"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteLessonConfirmId(lesson.id)}
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CHAPTERS & SEQUENCING MANAGEMENT
          ========================================================================= */}
      {adminTab === 'chapters' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Learners unlock chapters sequentially. Chapter 1 is open by default. Subsequent chapters automatically unlock once the learner scores at or above the designated passing threshold.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateChapter}
              className="px-3.5 py-1.5 rounded-lg bg-[#176B98] text-white text-xs font-bold hover:bg-[#12567a] flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ml-4"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chapter</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            {sortedChapters.map((chapter, index) => {
              const assignedLessons = licenseTrainingLessons.filter(
                (l) => l.chapter_id === chapter.id || (!l.chapter_id && index === 0)
              );
              const videoCount = assignedLessons.filter(
                (l) => (l.lesson_type || l.content_type) === 'video'
              ).length;
              const pdfCount = assignedLessons.filter(
                (l) => (l.lesson_type || l.content_type) === 'pdf'
              ).length;

              return (
                <div
                  key={chapter.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F3F8FB]/70 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Chapter index badge */}
                    <div className="w-10 h-10 rounded-xl bg-[#176B98]/10 text-[#176B98] flex items-center justify-center font-extrabold text-sm shrink-0">
                      {chapter.chapter_number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
                        <span className="font-bold text-[#176B98]">
                          Chapter {chapter.chapter_number}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-slate-600">
                          Passing Score: {chapter.passing_score || 80}%
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600">
                          {assignedLessons.length} materials ({videoCount} videos, {pdfCount} PDFs)
                        </span>
                        <span className="text-slate-300">·</span>
                        <span
                          className={
                            chapter.is_published
                              ? 'text-emerald-700 font-bold'
                              : 'text-amber-600 font-bold'
                          }
                        >
                          {chapter.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 truncate">
                        {chapter.title}
                      </h3>
                      {chapter.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {chapter.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Move Up / Down */}
                    <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => handleMoveChapter(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-500 hover:text-white hover:bg-[#176B98] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Chapter Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveChapter(index, 'down')}
                        disabled={index === sortedChapters.length - 1}
                        className="p-1 text-slate-500 hover:text-white hover:bg-[#176B98] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Chapter Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Manage Quiz button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuizChapterId(chapter.id);
                        setAdminTab('quizzes');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-[#176B98]/30 bg-[#F3F8FB] hover:bg-[#176B98] text-[#176B98] hover:text-white hover:border-[#176B98] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
                      <span>Configure Quiz</span>
                    </button>

                    {/* Publish toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleChapterPublish(chapter)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                        chapter.is_published
                          ? 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-[#176B98]/40'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {chapter.is_published ? 'Unpublish' : 'Publish'}
                    </button>

                    {/* Edit Chapter */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditChapter(chapter)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-white hover:bg-[#176B98] hover:border-[#176B98] transition-colors cursor-pointer"
                      title="Edit Chapter"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Chapter */}
                    <button
                      type="button"
                      onClick={() => setDeleteChapterConfirmId(chapter.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CHAPTER QUIZZES & QUESTIONS BUILDER
          ========================================================================= */}
      {adminTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Subtab Navigation (Editor vs Attempts Log) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuizSubTab('editor')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  quizSubTab === 'editor'
                    ? 'bg-[#176B98] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-[#176B98] hover:border-[#176B98] hover:bg-[#F3F8FB]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Quiz Questions Editor ({quizQuestions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setQuizSubTab('attempts')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  quizSubTab === 'attempts'
                    ? 'bg-[#176B98] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-[#176B98] hover:border-[#176B98] hover:bg-[#F3F8FB]'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Learner Quiz Attempts ({relevantAttempts.length})</span>
              </button>
            </div>

            {quizSubTab === 'editor' && (
              <button
                type="button"
                onClick={handleSaveEntireQuiz}
                disabled={isQuizSaving || quizQuestions.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Save className="w-4 h-4" />
                <span>{isQuizSaving ? 'Saving Quiz...' : 'Save & Publish Quiz'}</span>
              </button>
            )}
          </div>

          {quizSubTab === 'editor' ? (
            <>
              {/* Chapter Selector, PDF Generator, & Passing Score Banner */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#176B98] uppercase tracking-wider">
                      Sequential Assessment Authoring
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Configure Chapter Assessment
                    </h3>
                  </div>

                  {/* Chapter Select Dropdown */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">Chapter:</label>
                    <select
                      value={selectedQuizChapterId}
                      onChange={(e) => setSelectedQuizChapterId(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                    >
                      {sortedChapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          Chapter {ch.chapter_number}: {ch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-xs font-semibold text-slate-600">
                      Required Passing Score:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        step="5"
                        value={quizPassingScore}
                        onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-[#176B98] focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      (Learners must score this or higher to unlock the next chapter)
                    </span>
                  </div>

                  {/* PDF Generator and Manual Add Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPdfModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Upload a PDF handbook to automatically generate multiple-choice questions"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                      <span>✨ Auto-Generate from PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenAddQuestion}
                      className="px-3.5 py-2 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {isLoadingQuiz ? (
                  <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-[#176B98]" />
                    <p className="text-xs">Loading chapter assessment questions...</p>
                  </div>
                ) : quizQuestions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#176B98]/10 text-[#176B98] flex items-center justify-center mx-auto">
                      <Sparkles className="w-7 h-7 text-[#176B98]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">
                        No Questions Configured for Chapter {selectedChapter?.chapter_number || 1}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                        You can upload an official curriculum PDF to automatically extract concepts and generate multiple-choice questions, or create questions manually.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsPdfModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>✨ Upload PDF to Auto-Generate Quiz</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenAddQuestion}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-[#176B98] hover:text-white hover:border-[#176B98] text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        + Add Question Manually
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {quizQuestions.map((q, qIndex) => (
                      <div
                        key={q.id || qIndex}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-[#176B98] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                              {qIndex + 1}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {q.question_text}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(qIndex)}
                              className="p-1.5 rounded-lg border border-transparent text-slate-500 hover:text-white hover:bg-[#176B98] hover:border-[#176B98] transition-colors cursor-pointer"
                              title="Edit question"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(qIndex)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {q.options.map((opt, oIndex) => {
                            const isCorrect = oIndex === q.correct_option_index;
                            return (
                              <div
                                key={oIndex}
                                onClick={() => {
                                  // Quick toggle correct answer
                                  const next = [...quizQuestions];
                                  next[qIndex].correct_option_index = oIndex;
                                  setQuizQuestions(next);
                                }}
                                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#F3F8FB] hover:border-[#176B98]/50'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIndex)}
                                </span>
                                <span className="flex-1 truncate">{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider shrink-0">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span className="font-bold text-slate-700">Explanation:</span>{' '}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsPdfModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Add More Questions from PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveEntireQuiz}
                        disabled={isQuizSaving}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isQuizSaving ? 'Saving...' : 'Save & Publish All Questions'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Learner Quiz Attempts Log */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Licensing Quiz Submissions Log</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing recorded employee exam submissions for Chapter {selectedChapter?.chapter_number || 1}
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total Attempts: {relevantAttempts.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Learner</th>
                      <th className="px-4 py-3.5">Chapter</th>
                      <th className="px-4 py-3.5">Score</th>
                      <th className="px-4 py-3.5">Percentage</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Date / Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relevantAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                          No quiz attempts recorded yet for this chapter.
                        </td>
                      </tr>
                    ) : (
                      relevantAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {attempt.user_name || 'Employee'}
                            {attempt.user_email && (
                              <span className="block text-[11px] font-normal text-slate-500">
                                {attempt.user_email}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-800">
                            {selectedChapter?.title || `Chapter ${selectedChapter?.chapter_number || 1}`}
                          </td>
                          <td className="px-4 py-3.5 font-semibold">
                            {attempt.score} / {attempt.total_questions}
                          </td>
                          <td className="px-4 py-3.5 font-bold">
                            {attempt.percentage}%
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                attempt.passed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {attempt.passed ? 'PASSED (UNLOCKED)' : 'RETAKE'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-500 text-[11px]">
                            {new Date(attempt.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          LESSON CREATE / EDIT MODAL
          ========================================================================= */}
      {isLessonModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => {
            if (!isUploading) setIsLessonModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 my-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#176B98]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {lessonFormData.id ? 'Edit License Lesson' : 'Upload New License Lesson'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isUploading) setIsLessonModalOpen(false);
                }}
                disabled={isUploading}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLessonSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AML/CFT Statutory Advisory Standards"
                  value={lessonFormData.title}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                />
              </div>

              {/* Assigned Chapter & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Sequential Chapter <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={lessonFormData.chapter_id || sortedChapters[0]?.id || ''}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, chapter_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] bg-white font-bold text-slate-800"
                  >
                    {sortedChapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Chapter {ch.chapter_number}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Content Format <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={lessonFormData.lesson_type}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        lesson_type: e.target.value as LessonContentType,
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] bg-white font-bold text-slate-800"
                  >
                    <option value="video">Video Lesson (Streaming MP4)</option>
                    <option value="pdf">PDF Handbook (Interactive Document)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis of what the learner will study..."
                  value={lessonFormData.description}
                  onChange={(e) =>
                    setLessonFormData({ ...lessonFormData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                />
              </div>

              {/* File Upload Section */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  {lessonFormData.lesson_type === 'video' ? 'Video File (MP4)' : 'PDF File (PDF)'}{' '}
                  <span className="text-red-500">*</span>
                </label>

                {lessonFormData.file_url ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 min-w-0">
                      {lessonFormData.lesson_type === 'video' ? (
                        <Play className="w-4 h-4 text-[#176B98] shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {lessonFormData.file_path?.split('/').pop() ||
                          lessonFormData.file_url.split('/').pop()}
                      </span>
                      {lessonFormData.file_size_formatted && (
                        <span className="text-[11px] font-mono text-slate-500">
                          ({lessonFormData.file_size_formatted})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setLessonFormData((prev) => ({
                          ...prev,
                          file_url: '',
                          file_path: undefined,
                          file_size: undefined,
                        }))
                      }
                      className="text-xs text-red-600 hover:text-red-700 font-bold ml-3 cursor-pointer"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={lessonFormData.lesson_type === 'video' ? 'video/mp4,video/*' : '.pdf'}
                      onChange={handleLessonFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-[#176B98] rounded-xl text-center bg-white transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <Upload className="w-6 h-6 text-[#176B98]" />
                      <span className="text-xs font-bold text-slate-700">
                        Click to select {lessonFormData.lesson_type === 'video' ? 'video' : 'PDF'}{' '}
                        file
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {lessonFormData.lesson_type === 'video'
                          ? 'Supports MP4, WebM (up to 1 GB)'
                          : 'Official PDF documents (up to 150 MB)'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Upload progress */}
                {isUploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                      <span>{uploadStatusText}</span>
                      <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="text-red-600 hover:text-red-700 font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#176B98] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {uploadError && <p className="text-xs text-red-600 font-bold">{uploadError}</p>}
              </div>

              {/* Thumbnail for video */}
              {lessonFormData.lesson_type === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Video Poster Thumbnail (Optional)
                  </label>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLessonThumbnailChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    {lessonFormData.thumbnail_url && (
                      <img
                        src={lessonFormData.thumbnail_url}
                        alt="Thumbnail preview"
                        className="w-16 h-10 object-cover rounded-lg border border-slate-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      {lessonFormData.thumbnail_url ? 'Change Image' : 'Upload Cover Image'}
                    </button>
                  </div>
                </div>
              )}

              {/* Order and Publish toggle */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Display Order:</label>
                  <input
                    type="number"
                    min="1"
                    value={lessonFormData.display_order}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        display_order: Number(e.target.value),
                      })
                    }
                    className="w-20 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-center"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonFormData.is_published}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, is_published: e.target.checked })
                    }
                    className="w-4 h-4 text-[#176B98] rounded-sm focus:ring-[#176B98]"
                  />
                  <span className="text-xs font-bold text-slate-700">Publish Immediately</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  disabled={isLessonSubmitting || isUploading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLessonSubmitting || isUploading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#176B98] hover:bg-[#12567a] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isLessonSubmitting ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CHAPTER CREATE / EDIT MODAL
          ========================================================================= */}
      {isChapterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setIsChapterModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#176B98]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {chapterFormData.id ? 'Edit Sequential Chapter' : 'Create New Chapter'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChapterModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleChapterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={chapterFormData.chapter_number}
                  onChange={(e) =>
                    setChapterFormData({
                      ...chapterFormData,
                      chapter_number: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Underwriting Risk Assessment & Statutory Disclosure"
                  value={chapterFormData.title}
                  onChange={(e) =>
                    setChapterFormData({ ...chapterFormData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Scope and regulatory objectives of this chapter..."
                  value={chapterFormData.description}
                  onChange={(e) =>
                    setChapterFormData({ ...chapterFormData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="5"
                    required
                    value={chapterFormData.passing_score}
                    onChange={(e) =>
                      setChapterFormData({
                        ...chapterFormData,
                        passing_score: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98] font-mono font-bold text-[#176B98]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={chapterFormData.display_order}
                    onChange={(e) =>
                      setChapterFormData({
                        ...chapterFormData,
                        display_order: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={chapterFormData.is_published}
                  onChange={(e) =>
                    setChapterFormData({ ...chapterFormData, is_published: e.target.checked })
                  }
                  className="w-4 h-4 text-[#176B98] rounded-sm focus:ring-[#176B98]"
                />
                <span className="text-xs font-bold text-slate-700">Published (Visible to Learners)</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChapterSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#176B98] hover:bg-[#12567a] rounded-xl shadow-xs cursor-pointer"
                >
                  {isChapterSubmitting ? 'Saving...' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          QUESTION AUTHORING MODAL (FOR QUIZZES)
          ========================================================================= */}
      {questionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setQuestionModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingQuestionIndex !== null ? 'Edit Multiple-Choice Question' : 'Add Multiple-Choice Question'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuestionModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the question for this chapter assessment..."
                  value={questionDraft.question_text}
                  onChange={(e) =>
                    setQuestionDraft({ ...questionDraft, question_text: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Answer Options & Correct Choice <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {questionDraft.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={questionDraft.correct_option_index === oIdx}
                        onChange={() =>
                          setQuestionDraft({ ...questionDraft, correct_option_index: oIdx })
                        }
                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="w-5 text-xs font-mono font-bold text-slate-400">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...questionDraft.options];
                          nextOpts[oIdx] = e.target.value;
                          setQuestionDraft({ ...questionDraft, options: nextOpts });
                        }}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Select the radio button next to the option that is the correct answer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Explanation / Rational (Shown to learners in results feedback)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this option is correct according to statutory guidelines..."
                  value={questionDraft.explanation}
                  onChange={(e) =>
                    setQuestionDraft({ ...questionDraft, explanation: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestionDraft}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#176B98] hover:bg-[#12567a] rounded-xl shadow-xs cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN PREVIEW MODAL
          ========================================================================= */}
      {previewLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm"
          onClick={() => setPreviewLesson(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#176B98] text-white flex items-center justify-center shrink-0">
                  {(previewLesson.lesson_type || previewLesson.content_type) === 'video' ? (
                    <Play className="w-4 h-4 fill-white" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#176B98] uppercase tracking-wider block">
                    Admin Preview · {previewLesson.category || 'Curriculum'}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                    {previewLesson.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Content */}
            {(previewLesson.lesson_type || previewLesson.content_type) === 'video' ? (
              <>
                <div className="relative bg-black aspect-16/9 flex items-center justify-center">
                  <video
                    src={previewLesson.file_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={previewLesson.thumbnail_url}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {previewLesson.file_size_formatted ||
                      (previewLesson.file_size_bytes
                        ? formatBytes(previewLesson.file_size_bytes)
                        : 'Video file')}
                    {previewLesson.video_duration ? ` · ${previewLesson.video_duration}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const cleanName = (previewLesson.title || 'license_training_video').replace(
                        /[^a-zA-Z0-9_-]/g,
                        '_'
                      );
                      triggerFileDownload(previewLesson.file_url, `${cleanName}.mp4`, 'admin');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Video</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]">
                <FileText className="w-16 h-16 text-[#176B98]" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{previewLesson.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Official Licensing PDF Document</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={previewLesson.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const cleanName = (previewLesson.title || 'license_document').replace(
                        /[^a-zA-Z0-9_-]/g,
                        '_'
                      );
                      triggerFileDownload(previewLesson.file_url, `${cleanName}.pdf`, 'admin');
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}

            {/* Details */}
            {previewLesson.description && (
              <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {previewLesson.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE LESSON CONFIRMATION MODAL
          ========================================================================= */}
      {deleteLessonConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setDeleteLessonConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Delete License Lesson?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently delete this lesson and its uploaded content. Learners will no longer be able to access it.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteLessonConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLesson(deleteLessonConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CHAPTER CONFIRMATION MODAL
          ========================================================================= */}
      {deleteChapterConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setDeleteChapterConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Delete Chapter?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently delete this sequential chapter and its associated quiz. Assigned lessons will be unassigned.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteChapterConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteChapter(deleteChapterConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI PDF Quiz Generator Modal */}
      <PdfQuizGeneratorModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        contextTitle={`Chapter ${selectedChapter?.chapter_number || 1}: ${selectedChapter?.title || 'Licensing Accreditation'}`}
        existingPdfs={existingChapterPdfs}
        onQuestionsGenerated={handlePdfQuestionsGenerated}
      />
    </div>
  );
};
