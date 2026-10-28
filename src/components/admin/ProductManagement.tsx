import React, { useState, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Layers,
  FileText,
  Shield,
  Save,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Trash,
  PlusCircle,
  Calendar,
  Users,
} from 'lucide-react';
import {
  ProductKnowledgeItem,
  ProductColorTheme,
  ProductSection,
  ProductQuiz,
  ProductQuizQuestion,
} from '../../types/lms';
import { useLms } from '../../context/LmsContext';
import { ProductKnowledgeRichEditor } from './ProductKnowledgeRichEditor';
import { getProductRichContent } from '../../lib/productKnowledgeUtils';
import { PdfQuizGeneratorModal, GeneratedQuestionItem } from './PdfQuizGeneratorModal';

export const ProductManagement: React.FC = () => {
  const {
    products,
    productQuizzes,
    productQuizAttempts,
    createProduct,
    updateProduct,
    deleteProduct,
    saveProductQuiz,
    showToast,
  } = useLms();

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'attempts'>('products');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Product Editor Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<{
    title: string;
    subtitle: string;
    card_color_theme: ProductColorTheme;
    short_description: string;
    content: string;
    image_url: string;
    is_published: boolean;
    display_order: number;
  }>({
    title: '',
    subtitle: '',
    card_color_theme: 'navy',
    short_description: '',
    content: '',
    image_url: '',
    is_published: true,
    display_order: 1,
  });

  // Quiz Editor Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isPdfQuizModalOpen, setIsPdfQuizModalOpen] = useState<boolean>(false);
  const [quizProductId, setQuizProductId] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState<{
    title: string;
    description: string;
    passing_score: number;
    max_attempts: number;
    is_published: boolean;
    questions: Array<{
      id: string;
      question_text: string;
      options: string[];
      correct_option_index: number;
      explanation: string;
    }>;
  }>({
    title: '',
    description: '',
    passing_score: 80,
    max_attempts: 0,
    is_published: true,
    questions: [],
  });

  const selectedProductForQuiz = products.find((p) => p.id === quizProductId);

  // Keyboard shortcut: close modals on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPdfQuizModalOpen) {
          setIsPdfQuizModalOpen(false);
        } else if (isQuizModalOpen) {
          setIsQuizModalOpen(false);
        } else if (isProductModalOpen) {
          setIsProductModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPdfQuizModalOpen, isQuizModalOpen, isProductModalOpen]);

  const handlePdfQuestionsGenerated = (
    newQuestions: GeneratedQuestionItem[],
    meta: { fileName: string; numPages?: number; mode: 'replace' | 'append' }
  ) => {
    const formatted = newQuestions.map((q, idx) => ({
      id: `qp_${Date.now()}_${idx + 1}`,
      question_text: q.question_text,
      options: q.options,
      correct_option_index: q.correct_option_index ?? 0,
      explanation: q.explanation || '',
    }));

    if (meta.mode === 'replace') {
      setQuizForm((prev) => ({
        ...prev,
        questions: formatted,
      }));
    } else {
      setQuizForm((prev) => ({
        ...prev,
        questions: [...prev.questions, ...formatted],
      }));
    }

    showToast(
      'success',
      'Questions Imported',
      `Loaded ${formatted.length} questions from ${meta.fileName} into the quiz editor.`
    );
  };

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available Categories
  const CATEGORIES = [
    'Individual Life',
    'Corporate & Group',
    'Health & Medical',
    'Education',
    'Credit Life',
    'Savings & Investment',
  ];

  // Available Themes
  const THEMES: { id: ProductColorTheme; label: string; bg: string }[] = [
    { id: 'amber', label: 'Amber / Gold', bg: 'bg-amber-500' },
    { id: 'navy', label: 'KBZ Navy', bg: 'bg-[#176B98]' },
    { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-600' },
    { id: 'indigo', label: 'Indigo / Violet', bg: 'bg-indigo-600' },
    { id: 'teal', label: 'Deep Teal', bg: 'bg-teal-600' },
    { id: 'rose', label: 'Rose / Crimson', bg: 'bg-rose-600' },
    { id: 'sky', label: 'Sky Blue', bg: 'bg-sky-600' },
    { id: 'slate', label: 'Slate Gray', bg: 'bg-slate-600' },
  ];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Boolean(p.content && p.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      Boolean(p.short_description && p.short_description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Handle direct device image upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select an image file (PNG, JPG, WebP).');
      return;
    }

    setIsUploading(true);
    try {
      // Read as Data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              dataUrl: base64Data,
              bucket: 'product-images',
            }),
          });

          const data = await res.json();
          if (data.success && data.url) {
            setProductForm((prev) => ({ ...prev, image_url: data.url }));
            showToast('success', 'Image Uploaded', 'Product image stored successfully.');
          } else {
            // Local data URL fallback
            setProductForm((prev) => ({ ...prev, image_url: base64Data }));
            showToast('info', 'Image Loaded', 'Image loaded from device.');
          }
        } catch {
          setProductForm((prev) => ({ ...prev, image_url: base64Data }));
          showToast('info', 'Image Loaded', 'Image loaded locally from device.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      showToast('error', 'Upload Failed', 'Could not process the selected image.');
    }
  };

  // Open Product Modal for Create
  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      subtitle: '',
      card_color_theme: 'amber',
      short_description: '',
      content: '',
      image_url: '',
      is_published: true,
      display_order: products.length + 1,
    });
    setIsProductModalOpen(true);
  };

  // Open Product Modal for Edit (preserves existing saved data into rich text)
  const handleOpenEditModal = (product: ProductKnowledgeItem) => {
    setEditingProductId(product.id);
    const richContent = (product.content && product.content.trim()) || getProductRichContent(product);
    setProductForm({
      title: product.title,
      subtitle: product.subtitle || '',
      card_color_theme: product.card_color_theme || 'navy',
      short_description: product.short_description || '',
      content: richContent,
      image_url: product.image_url || '',
      is_published: product.is_published ?? (product.status === 'published'),
      display_order: product.display_order ?? 1,
    });
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      showToast('error', 'Validation Error', 'Product name / title is required.');
      return;
    }
    if (!productForm.content.trim()) {
      showToast('error', 'Validation Error', 'Product Knowledge content is required.');
      return;
    }

    const editingProduct = editingProductId ? products.find((p) => p.id === editingProductId) : null;
    const cleanContent = productForm.content.trim();
    const cleanShortDesc = productForm.short_description.trim() || cleanContent.slice(0, 160).replace(/[\r\n]+/g, ' ');

    const payload = {
      title: productForm.title.trim(),
      subtitle: productForm.subtitle.trim(),
      category: editingProduct?.category || 'Insurance',
      card_color_theme: productForm.card_color_theme,
      short_description: cleanShortDesc,
      description: cleanContent,
      content: cleanContent,
      image_url: productForm.image_url,
      is_published: productForm.is_published,
      status: (productForm.is_published ? 'published' : 'draft') as 'published' | 'draft',
      display_order: Number(productForm.display_order) || 1,
    };

    if (editingProductId) {
      await updateProduct(editingProductId, payload);
    } else {
      await createProduct(payload);
    }

    setIsProductModalOpen(false);
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}" and its associated quiz? This action cannot be undone.`)) {
      await deleteProduct(id);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (product: ProductKnowledgeItem) => {
    const nextPublished = !(product.is_published ?? (product.status === 'published'));
    await updateProduct(product.id, {
      is_published: nextPublished,
      status: nextPublished ? 'published' : 'draft',
    });
  };

  // Open Quiz Modal
  const handleOpenQuizModal = (product: ProductKnowledgeItem) => {
    setQuizProductId(product.id);
    const existing = productQuizzes.find((q) => q.product_id === product.id);

    if (existing) {
      setQuizForm({
        title: existing.title || `${product.title} Certification Quiz`,
        description: existing.description || '',
        passing_score: existing.passing_score || 80,
        max_attempts: existing.max_attempts || 0,
        is_published: existing.is_published ?? true,
        questions: existing.questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          options: [...q.options],
          correct_option_index: q.correct_option_index ?? 0,
          explanation: q.explanation || '',
        })),
      });
    } else {
      // Default initial question template
      setQuizForm({
        title: `${product.title} Certification Quiz`,
        description: `Verify your advisory understanding of policy terms, key benefits, and underwriting conditions for ${product.title}.`,
        passing_score: 80,
        max_attempts: 0,
        is_published: true,
        questions: [
          {
            id: `q_${Date.now()}_1`,
            question_text: `What is the primary coverage benefit provided under ${product.title}?`,
            options: [
              'Guaranteed death and disability protection with structured financial security',
              'Travel luggage loss reimbursement only',
              'Automotive vehicle collision coverage',
              'No financial payout under any circumstances',
            ],
            correct_option_index: 0,
            explanation: `The core purpose of ${product.title} is to deliver comprehensive life protection and savings benefits.`,
          },
        ],
      });
    }
    setIsQuizModalOpen(true);
  };

  // Add Question to Quiz
  const handleAddQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `q_${Date.now()}_${prev.questions.length + 1}`,
          question_text: '',
          options: ['', '', '', ''],
          correct_option_index: 0,
          explanation: '',
        },
      ],
    }));
  };

  // Remove Question
  const handleRemoveQuestion = (qIndex: number) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIndex),
    }));
  };

  // Update Question field
  const handleUpdateQuestion = (qIndex: number, field: string, value: any) => {
    setQuizForm((prev) => {
      const updated = [...prev.questions];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  // Update Option in Question
  const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuizForm((prev) => {
      const updated = [...prev.questions];
      const newOpts = [...updated[qIndex].options];
      newOpts[optIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options: newOpts };
      return { ...prev, questions: updated };
    });
  };

  // Add Option to Question
  const handleAddOption = (qIndex: number) => {
    setQuizForm((prev) => {
      const updated = [...prev.questions];
      updated[qIndex] = {
        ...updated[qIndex],
        options: [...updated[qIndex].options, ''],
      };
      return { ...prev, questions: updated };
    });
  };

  // Remove Option from Question
  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuizForm((prev) => {
      const updated = [...prev.questions];
      const newOpts = updated[qIndex].options.filter((_, idx) => idx !== optIndex);
      let newCorrect = updated[qIndex].correct_option_index;
      if (newCorrect >= newOpts.length) {
        newCorrect = Math.max(0, newOpts.length - 1);
      }
      updated[qIndex] = {
        ...updated[qIndex],
        options: newOpts,
        correct_option_index: newCorrect,
      };
      return { ...prev, questions: updated };
    });
  };

  // Save Quiz
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizProductId) return;

    if (!quizForm.title.trim()) {
      showToast('error', 'Validation Error', 'Quiz title is required.');
      return;
    }

    if (quizForm.questions.length === 0) {
      showToast('error', 'Validation Error', 'Please add at least one question to the quiz.');
      return;
    }

    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      if (!q.question_text.trim()) {
        showToast('error', 'Validation Error', `Question #${i + 1} is missing question text.`);
        return;
      }
      const validOptions = q.options.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        showToast('error', 'Validation Error', `Question #${i + 1} must have at least 2 options.`);
        return;
      }
    }

    const formattedQuestions: ProductQuizQuestion[] = quizForm.questions.map((q, idx) => ({
      id: q.id,
      quiz_id: `quiz_${quizProductId}`,
      question_text: q.question_text.trim(),
      options: q.options.filter((o) => o.trim().length > 0),
      correct_option_index: q.correct_option_index,
      explanation: q.explanation.trim(),
      display_order: idx + 1,
    }));

    await saveProductQuiz(quizProductId, {
      title: quizForm.title.trim(),
      description: quizForm.description.trim(),
      passing_score: Number(quizForm.passing_score) || 80,
      max_attempts: Number(quizForm.max_attempts) || 0,
      is_published: quizForm.is_published,
      questions: formattedQuestions,
    });

    setIsQuizModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 text-[#176B98]">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Product Knowledge Hub Management
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Create, edit, organize, and publish insurance products. Upload genuine imagery from your device, structure coverage terms, and configure dedicated certification quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Products Catalog vs Quiz Attempts */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'products'
              ? 'bg-[#176B98] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('attempts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'attempts'
              ? 'bg-[#176B98] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Learner Quiz Attempts ({productQuizAttempts.length})</span>
        </button>
      </div>

      {activeSubTab === 'products' ? (
        <div className="space-y-4">
          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#176B98]/20"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Theme</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Product Quiz</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                        No products match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isPublished = product.is_published ?? (product.status === 'published');
                      const quiz = productQuizzes.find((q) => q.product_id === product.id);

                      return (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 border border-slate-200">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                              <div className="min-w-0 max-w-sm">
                                <span className="font-extrabold text-slate-900 block truncate text-xs sm:text-sm">
                                  {product.title}
                                </span>
                                {product.subtitle && (
                                  <span className="text-[11px] text-slate-500 truncate block">
                                    {product.subtitle}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 font-semibold text-slate-800">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                              {product.category}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase text-white shadow-2xs ${
                                THEMES.find((t) => t.id === product.card_color_theme)?.bg || 'bg-[#176B98]'
                              }`}
                            >
                              {product.card_color_theme || 'navy'}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleTogglePublish(product)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer border ${
                                isPublished
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {isPublished ? (
                                <>
                                  <Eye className="w-3 h-3 text-emerald-600" />
                                  <span>Published</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 text-amber-600" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenQuizModal(product)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#176B98] dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 font-bold text-xs transition-colors cursor-pointer border border-sky-200 dark:border-sky-800"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                <span>{quiz ? `Quiz (${quiz.questions?.length || 0} Qs)` : 'Configure Quiz'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleOpenQuizModal(product);
                                  setIsPdfQuizModalOpen(true);
                                }}
                                title="Upload Product PDF to generate quiz questions with AI"
                                className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer flex items-center justify-center"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(product)}
                                className="p-2 rounded-lg text-slate-500 hover:text-[#176B98] hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.title)}
                                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Learner Quiz Attempts Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Learner Assessment Attempts Log</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Total Recorded Attempts: {productQuizAttempts.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Learner</th>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Percentage</th>
                  <th className="px-4 py-3.5">Certification Status</th>
                  <th className="px-5 py-3.5 text-right">Date / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productQuizAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No quiz attempts recorded yet. Learners can take quizzes from the Product Knowledge Hub.
                    </td>
                  </tr>
                ) : (
                  productQuizAttempts.map((attempt) => {
                    const prod = products.find((p) => p.id === attempt.product_id);
                    return (
                      <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {attempt.user_name || attempt.user_id}
                          {attempt.user_email && (
                            <span className="block text-[11px] font-normal text-slate-500">
                              {attempt.user_email}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {prod?.title || attempt.product_id}
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
                            {attempt.passed ? 'PASSED' : 'RETAKE'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-500 text-[11px]">
                          {new Date(attempt.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          PRODUCT CREATE / EDIT MODAL
      ===================================================================== */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-left transition-opacity"
          onClick={() => setIsProductModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#176B98] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-200" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  {editingProductId ? 'Edit Product Knowledge Record' : 'Add New Insurance Product'}
                </h2>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Basic Details Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="e.g. KBZLife Endowment Life Assurance"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                      placeholder="e.g. Guaranteed Long-Term Savings & Protection"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Display Sequence Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={productForm.display_order}
                      onChange={(e) => setProductForm({ ...productForm, display_order: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Card Color Theme
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, card_color_theme: t.id })}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            productForm.card_color_theme === t.id
                              ? 'border-[#176B98] ring-2 ring-[#176B98]/30 bg-sky-50'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${t.bg} shrink-0 shadow-2xs`} />
                          <span className="text-[10px] font-bold text-slate-700 truncate">{t.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Image Upload from Device */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Image (Direct Device Upload)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
                    {productForm.image_url ? (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                        <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-8 h-8" />
                      </div>
                    )}

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs flex items-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-[#176B98]" />
                          <span>{isUploading ? 'Uploading...' : 'Upload Image from Device'}</span>
                        </button>

                        {productForm.image_url && (
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, image_url: '' })}
                            className="px-3 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Select a product banner or 3D visual from your local storage (JPEG, PNG, WebP).
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Description (For Product Cards)
                  </label>
                  <input
                    type="text"
                    value={productForm.short_description}
                    onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                    placeholder="Concise 1-2 sentence overview for the hub cards..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B98]/20 focus:border-[#176B98]"
                  />
                </div>
              </div>

              {/* Single Product Knowledge Rich-Text Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#176B98] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#176B98]" />
                    <span>Product Knowledge & Curriculum Content *</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Enter all headings, policy rules, benefits, eligibility, and features in one place
                  </span>
                </div>

                <ProductKnowledgeRichEditor
                  value={productForm.content}
                  onChange={(content) => setProductForm({ ...productForm, content })}
                  placeholder="Enter complete product knowledge, policy terms, key benefits, eligibility criteria, and underwriting rules here using headings, bullet points, and lists..."
                  minHeight="340px"
                />
              </div>

              {/* Publication Status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Product Publication Visibility
                  </span>
                  <span className="text-[11px] text-slate-500">
                    When active, product is visible to regular employees in the Product Knowledge Hub.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_published}
                    onChange={(e) => setProductForm({ ...productForm, is_published: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#176B98]" />
                </label>
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProductId ? 'Save Product Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          PRODUCT QUIZ BUILDER MODAL
      ===================================================================== */}
      {isQuizModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-left transition-opacity"
          onClick={() => setIsQuizModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#176B98] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  Manage Product Quiz & Answer Key
                </h2>
              </div>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quiz Form */}
            <form onSubmit={handleSaveQuiz} className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Quiz Configuration */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      placeholder="e.g. KBZLife Endowment Assurance Certification Quiz"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B98]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Passing Score (% mark)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={quizForm.passing_score}
                      onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 80 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B98]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Max Attempts Allowed (0 for unlimited)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={quizForm.max_attempts}
                      onChange={(e) => setQuizForm({ ...quizForm, max_attempts: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B98]/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assessment Description
                    </label>
                    <textarea
                      rows={2}
                      value={quizForm.description}
                      onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                      placeholder="Brief instructions on what topics are examined..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#176B98]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 flex-wrap gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#176B98] dark:text-sky-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Questions ({quizForm.questions.length})</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPdfQuizModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-[#176B98] hover:from-sky-600 hover:to-[#135A80] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Upload PDF & Generate Quiz (AI)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 dark:hover:bg-sky-900/60 text-[#176B98] dark:text-sky-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                {quizForm.questions.map((question, qIdx) => (
                  <div
                    key={question.id || qIdx}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#176B98] text-white text-[11px] font-black shrink-0">
                        Q{qIdx + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={question.question_text}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'question_text', e.target.value)}
                          placeholder="Enter question text..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-[#176B98]/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Options list with correct radio button */}
                    <div className="space-y-2 pl-2 sm:pl-8">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>Answer Choices (Select radio button for CORRECT answer):</span>
                        <button
                          type="button"
                          onClick={() => handleAddOption(qIdx)}
                          className="text-[#176B98] hover:underline cursor-pointer"
                        >
                          + Add Option
                        </button>
                      </div>

                      {question.options.map((option, optIdx) => {
                        const isCorrect = question.correct_option_index === optIdx;
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={isCorrect}
                              onChange={() => handleUpdateQuestion(qIdx, 'correct_option_index', optIdx)}
                              className="w-4 h-4 text-[#176B98] cursor-pointer"
                              title="Mark as correct answer"
                            />
                            <span
                              className={`w-5 text-center text-xs font-black ${
                                isCorrect ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                            >
                              {optionLetter}.
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                              placeholder={`Option ${optionLetter}`}
                              className={`flex-1 px-3 py-1.5 rounded-lg border text-xs bg-white focus:ring-2 ${
                                isCorrect
                                  ? 'border-emerald-400 ring-2 ring-emerald-500/20 font-semibold'
                                  : 'border-slate-200 focus:ring-[#176B98]/20'
                              }`}
                            />
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="pl-2 sm:pl-8">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Explanation (Shown to learners after submission):
                      </label>
                      <input
                        type="text"
                        value={question.explanation}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                        placeholder="Why is this answer correct? Reference policy clause or terms..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-[#176B98]/20"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Product Quiz</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI PDF Quiz Generator Modal for Product Knowledge */}
      <PdfQuizGeneratorModal
        isOpen={isPdfQuizModalOpen}
        onClose={() => setIsPdfQuizModalOpen(false)}
        contextTitle={selectedProductForQuiz ? selectedProductForQuiz.title : 'Product Knowledge'}
        onQuestionsGenerated={handlePdfQuestionsGenerated}
      />
    </div>
  );
};
