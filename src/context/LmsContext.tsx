import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Profile,
  Course,
  Channel,
  CourseEnrollment,
  ChannelAccess,
  LearningProgress,
  AdminAuditLog,
  AdminStats,
  AccountStatus,
  UserRole,
  ProgressCompletionStatus,
  CompanyNewsArticle,
  CompanyVideoItem,
  TopPerformerEntry,
  EmailLogEntry,
  HodMotto,
  LdTeamMember,
  LicenseTrainingLesson,
  LicenseContentType,
  LicenseChapter,
  ChapterStatus,
  SkillDevelopmentResource,
  SkillCategory,
  LessonProgressInfo,
  LicenseQuiz,
  LicenseQuizQuestion,
  LicenseQuizAttempt,
  SkillQuiz,
  SkillQuizQuestion,
  SkillQuizAttempt,
  ProductKnowledgeItem,
  ProductQuiz,
  ProductQuizQuestion,
  ProductQuizAttempt,
  CompanyBulletinItem,
  BulletinCategory,
} from '../types/lms';
import {
  INITIAL_PROFILES,
  INITIAL_COURSES,
  INITIAL_CHANNELS,
  INITIAL_NEWS,
  INITIAL_VIDEOS,
  INITIAL_TOP_PERFORMERS,
  INITIAL_ENROLLMENTS,
  INITIAL_CHANNEL_ACCESS,
  INITIAL_PROGRESS,
  INITIAL_AUDIT_LOGS,
  INITIAL_EMAIL_LOGS,
  INITIAL_HOD_MOTTO,
  INITIAL_TEAM_MEMBERS,
  INITIAL_LICENSE_CHAPTERS,
  INITIAL_LICENSE_LESSONS,
  INITIAL_SKILL_CATEGORIES,
  INITIAL_SKILL_RESOURCES,
  INITIAL_LICENSE_QUIZZES,
  INITIAL_SKILL_QUIZZES,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCT_QUIZZES,
  INITIAL_COMPANY_BULLETINS,
} from '../data/seedLmsData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface LmsContextType {
  currentUser: Profile;
  profiles: Profile[];
  courses: Course[];
  channels: Channel[];
  courseEnrollments: CourseEnrollment[];
  channelAccesses: ChannelAccess[];
  learningProgress: LearningProgress[];
  companyNews: CompanyNewsArticle[];
  companyVideos: CompanyVideoItem[];
  topPerformers: TopPerformerEntry[];
  hodMotto: HodMotto;
  teamMembers: LdTeamMember[];
  licenseTrainingLessons: LicenseTrainingLesson[];
  skillCategories: SkillCategory[];
  skillDevelopmentResources: SkillDevelopmentResource[];
  products: ProductKnowledgeItem[];
  productQuizzes: ProductQuiz[];
  productQuizAttempts: ProductQuizAttempt[];
  companyBulletins: CompanyBulletinItem[];
  auditLogs: AdminAuditLog[];
  emailLogs: EmailLogEntry[];
  isLoading: boolean;
  isSupabaseLive: boolean;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;

  // Theme support
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Session & Authentication
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  loginWithCredentials: (identifier: string, password: string) => Promise<{ success: boolean; message: string; mustChangePassword?: boolean; account_status?: AccountStatus; role?: UserRole }>;
  registerUser: (data: { full_name: string; username: string; email: string; password: string; department?: string; employee_id?: string }) => Promise<{ success: boolean; user?: Profile; message: string }>;
  checkUserApprovalStatus: (userId?: string) => Promise<AccountStatus>;
  approveUser: (userId: string) => Promise<boolean>;
  rejectUser: (userId: string, reason: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; isConfigured?: boolean }>;
  updateAdminProfile: (updates: Partial<Profile>) => Promise<boolean>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<{ success: boolean; message: string; profile?: Profile }>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  signOut: () => void;

  // Role Authority & 20-Admin Quota
  activeAdminCount: number;
  maxAdminLimit: number;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  bootstrapSuperAdmin: (targetEmail: string) => Promise<{ success: boolean; message: string }>;

  // Computed / Queries
  getStats: () => AdminStats;
  getUserEnrollments: (userId: string) => CourseEnrollment[];
  getUserChannelAccesses: (userId: string) => ChannelAccess[];
  getUserAccessibleCourses: (userId: string) => Course[];
  getUserAccessibleChannels: (userId: string) => Channel[];
  getUserProgress: (userId: string, courseId?: string, channelId?: string) => LearningProgress | undefined;
  getPublishedNews: () => CompanyNewsArticle[];
  getPublishedVideos: () => CompanyVideoItem[];
  getPublishedTopPerformers: () => TopPerformerEntry[];
  getPublishedTeamMembers: () => LdTeamMember[];
  getPublishedHodMotto: () => HodMotto | null;
  getPublishedLicenseLessons: () => LicenseTrainingLesson[];
  getPublishedSkillCategories: () => SkillCategory[];
  getPublishedSkillResources: () => SkillDevelopmentResource[];
  getPublishedProducts: () => ProductKnowledgeItem[];
  getProduct: (id: string) => ProductKnowledgeItem | undefined;

  // Administrative mutations
  updateUserStatus: (userId: string, status: AccountStatus, reason?: string) => Promise<boolean>;
  updateUserRole: (userId: string, role: UserRole, reason?: string) => Promise<{ success: boolean; message: string }>;
  assignCourse: (userId: string, courseId: string, expiresAt?: string | null, note?: string) => Promise<boolean>;
  revokeCourse: (userId: string, courseId: string, reason?: string) => Promise<boolean>;
  assignChannel: (userId: string, channelId: string, expiresAt?: string | null, note?: string) => Promise<boolean>;
  revokeChannel: (userId: string, channelId: string, reason?: string) => Promise<boolean>;
  createCourse: (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => Promise<Course | null>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<boolean>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  createChannel: (channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>) => Promise<Channel | null>;
  updateChannel: (channelId: string, updates: Partial<Channel>) => Promise<boolean>;
  deleteChannel: (channelId: string) => Promise<boolean>;

  // Company News mutations
  createNews: (article: Omit<CompanyNewsArticle, 'id' | 'created_at' | 'updated_at'>) => Promise<CompanyNewsArticle | null>;
  updateNews: (id: string, updates: Partial<CompanyNewsArticle>) => Promise<boolean>;
  deleteNews: (id: string) => Promise<boolean>;

  // Company Videos mutations
  createVideo: (video: Omit<CompanyVideoItem, 'id' | 'created_at' | 'updated_at'>) => Promise<CompanyVideoItem | null>;
  updateVideo: (id: string, updates: Partial<CompanyVideoItem>) => Promise<boolean>;
  deleteVideo: (id: string) => Promise<boolean>;

  // Top Performers mutations
  createTopPerformer: (performer: Omit<TopPerformerEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<TopPerformerEntry | null>;
  updateTopPerformer: (id: string, updates: Partial<TopPerformerEntry>) => Promise<boolean>;
  deleteTopPerformer: (id: string) => Promise<boolean>;

  // License Training Lessons mutations (Admin to User Publishing Flow)
  createLicenseLesson: (lesson: Omit<LicenseTrainingLesson, 'id' | 'created_at' | 'updated_at'>) => Promise<LicenseTrainingLesson | null>;
  updateLicenseLesson: (id: string, updates: Partial<LicenseTrainingLesson>) => Promise<boolean>;
  deleteLicenseLesson: (id: string) => Promise<boolean>;

  // Skill Categories mutations (Admin Category Management)
  createSkillCategory: (category: Omit<SkillCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<SkillCategory | null>;
  updateSkillCategory: (id: string, updates: Partial<SkillCategory>) => Promise<boolean>;
  deleteSkillCategory: (id: string) => Promise<boolean>;

  // Skill Development Resources mutations (Admin to User Publishing Flow)
  createSkillResource: (resource: Omit<SkillDevelopmentResource, 'id' | 'created_at' | 'updated_at'>) => Promise<SkillDevelopmentResource | null>;
  updateSkillResource: (id: string, updates: Partial<SkillDevelopmentResource>) => Promise<boolean>;
  deleteSkillResource: (id: string) => Promise<boolean>;

  // HOD Motto & L&D Team mutations
  updateHodMotto: (updates: Partial<HodMotto>) => Promise<boolean>;
  createTeamMember: (member: Omit<LdTeamMember, 'id' | 'created_at' | 'updated_at'>) => Promise<LdTeamMember | null>;
  updateTeamMember: (id: string, updates: Partial<LdTeamMember>) => Promise<boolean>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  reorderTeamMembers: (orderedIds: string[]) => Promise<boolean>;

  // User invitation & Email Delivery
  inviteUser: (data: { email: string; full_name: string; role: UserRole; department: string; employee_id?: string }) => Promise<boolean>;
  sendCustomEmail: (to: string, subject: string, html: string, template?: string) => Promise<{ success: boolean; message: string }>;

  // Learner Progress mutations
  recordProgress: (
    courseId?: string,
    channelId?: string,
    percentage?: number,
    completionStatus?: ProgressCompletionStatus,
    completedModule?: string
  ) => Promise<boolean>;

  // License Training Video & PDF Progress (Genuinely Watched & Read Progress)
  licenseVideoProgress: Record<string, LessonProgressInfo>;
  getLessonProgress: (lessonId: string) => LessonProgressInfo;
  recordVideoHeartbeat: (
    lessonId: string,
    segment: { start: number; end: number },
    duration: number,
    playbackRate?: number,
    lastPosition?: number
  ) => Promise<LessonProgressInfo | null>;
  recordPdfPageProgress: (
    lessonId: string,
    page: number,
    totalPages: number
  ) => Promise<LessonProgressInfo | null>;

  // License Training Chapters, Sequential Progression & Quizzes
  licenseChapters: LicenseChapter[];
  chapterCompletions: Record<string, { status: ChapterStatus; materials_completed: boolean; quiz_passed: boolean; highest_quiz_score: number }>;
  getChapterStatus: (chapterId: string) => ChapterStatus;
  getChapterMaterialsProgress: (chapterId: string) => {
    isComplete: boolean;
    completedCount: number;
    totalCount: number;
    percentage: number;
  };
  getOverallLicenseProgress: () => {
    totalChapters: number;
    completedChapters: number;
    overallPercentage: number;
    isCourseCompleted: boolean;
  };
  createLicenseChapter: (data: {
    title: string;
    chapter_number?: number;
    description?: string;
    passing_score?: number;
    display_order?: number;
    is_published?: boolean;
  }) => Promise<boolean>;
  updateLicenseChapter: (id: string, updates: Partial<LicenseChapter>) => Promise<boolean>;
  deleteLicenseChapter: (id: string) => Promise<boolean>;
  reorderLicenseChapters: (orderedIds: string[]) => Promise<boolean>;
  getChapterQuiz: (chapterId: string) => Promise<LicenseQuiz | null>;
  saveChapterQuiz: (
    chapterId: string,
    data: {
      title: string;
      description?: string;
      passingScore: number;
      questions: LicenseQuizQuestion[];
    }
  ) => Promise<boolean>;
  submitChapterQuiz: (
    chapterId: string,
    quizId: string,
    answers: Record<string, number>
  ) => Promise<{
    success: boolean;
    score?: number;
    total_questions?: number;
    percentage?: number;
    passed?: boolean;
    passing_score?: number;
    breakdown?: Array<{
      question_id: string;
      question_text: string;
      selected_index: number | null;
      correct_index: number;
      is_correct: boolean;
      explanation: string;
    }>;
    next_chapter_unlocked?: boolean;
    next_chapter_title?: string;
    message?: string;
  }>;

  // License Training Quizzes & Assessments (Legacy & Lesson-Specific)
  licenseQuizzes: LicenseQuiz[];
  licenseQuizAttempts: LicenseQuizAttempt[];
  getLessonQuiz: (lessonId: string) => Promise<LicenseQuiz | null>;
  submitQuizAttempt: (
    lessonId: string,
    quizId: string,
    answers: Record<string, number>
  ) => Promise<{
    success: boolean;
    score?: number;
    total_questions?: number;
    percentage?: number;
    passed?: boolean;
    passing_score?: number;
    breakdown?: Array<{
      question_id: string;
      question_text: string;
      selected_index: number | null;
      correct_index: number;
      is_correct: boolean;
      explanation: string;
    }>;
    overall_completed?: boolean;
    message?: string;
  }>;
  saveQuiz: (
    lessonId: string,
    title: string,
    description: string,
    passingScore: number,
    questions: LicenseQuizQuestion[]
  ) => Promise<boolean>;
  getQuizAttempts: (lessonId?: string, chapterId?: string) => Promise<LicenseQuizAttempt[]>;

  // Product Knowledge Hub mutations
  createProduct: (product: Omit<ProductKnowledgeItem, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductKnowledgeItem | null>;
  updateProduct: (id: string, updates: Partial<ProductKnowledgeItem>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductQuiz: (productId: string) => Promise<ProductQuiz | null>;
  saveProductQuiz: (productId: string, data: { title: string; description?: string; passing_score: number; max_attempts?: number; is_published: boolean; questions: ProductQuizQuestion[] }) => Promise<boolean>;
  submitProductQuizAttempt: (productId: string, quizId: string, answers: Record<string, number>) => Promise<{
    success: boolean;
    score?: number;
    total_questions?: number;
    percentage?: number;
    passed?: boolean;
    passing_score?: number;
    breakdown?: Array<{
      question_id: string;
      question_text: string;
      selected_index: number | null;
      correct_index: number;
      is_correct: boolean;
      explanation: string;
    }>;
    attempt?: ProductQuizAttempt;
    message?: string;
  }>;
  getUserProductAttempts: (productId?: string) => Promise<ProductQuizAttempt[]>;
  // AI-Powered Quiz Extraction & Generation from Uploaded PDF
  generateQuizFromPdf: (data: {
    fileUrl?: string;
    base64?: string;
    fileName?: string;
    count?: number;
    topic?: string;
  }) => Promise<{
    success: boolean;
    questions?: any[];
    page_count?: number;
    extracted_preview?: string;
    error?: string;
    isScanned?: boolean;
    message?: string;
  }>;

  // Skill Development Quizzes & Assessments
  skillQuizzes: SkillQuiz[];
  skillQuizAttempts: SkillQuizAttempt[];
  getSkillQuiz: (categoryId?: string, resourceId?: string, quizId?: string) => Promise<SkillQuiz | null>;
  saveSkillQuiz: (data: {
    id?: string;
    category_id?: string;
    resource_id?: string;
    title: string;
    description?: string;
    passing_score: number;
    is_published?: boolean;
    questions: SkillQuizQuestion[];
  }) => Promise<boolean>;
  deleteSkillQuiz: (quizId: string) => Promise<boolean>;
  submitSkillQuiz: (
    quizId: string,
    categoryId: string | undefined,
    answers: Record<string, number>
  ) => Promise<{
    success: boolean;
    score?: number;
    total_questions?: number;
    percentage?: number;
    passed?: boolean;
    passing_score?: number;
    breakdown?: Array<{
      question_id: string;
      question_text: string;
      selected_index: number | null;
      correct_index: number;
      is_correct: boolean;
      explanation: string;
    }>;
    attempt?: SkillQuizAttempt;
    message?: string;
  }>;
  getSkillQuizAttempts: (categoryId?: string, quizId?: string) => Promise<SkillQuizAttempt[]>;

  // Company Bulletin mutations
  createBulletin: (data: Omit<CompanyBulletinItem, 'id' | 'created_at' | 'updated_at'>) => Promise<CompanyBulletinItem | null>;
  updateBulletin: (id: string, updates: Partial<CompanyBulletinItem>) => Promise<boolean>;
  deleteBulletin: (id: string) => Promise<boolean>;

  // Data reload
  refreshData: () => Promise<void>;
  resetToInitialData: () => void;
}

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'kbzlife_lms_current_user_id_v2',
  PROFILES: 'kbzlife_lms_profiles_v2',
  COURSES: 'kbzlife_lms_courses_v2',
  CHANNELS: 'kbzlife_lms_channels_v2',
  ENROLLMENTS: 'kbzlife_lms_enrollments_v2',
  CHANNEL_ACCESS: 'kbzlife_lms_channel_access_v2',
  PROGRESS: 'kbzlife_lms_progress_v2',
  AUDIT_LOGS: 'kbzlife_lms_audit_logs_v2',
  NEWS: 'kbzlife_lms_news_v3',
  VIDEOS: 'kbzlife_lms_videos_v3',
  PERFORMERS: 'kbzlife_lms_performers_v2',
  EMAIL_LOGS: 'kbzlife_lms_email_logs_v2',
  HOD_MOTTO: 'kbzlife_lms_hod_motto_v2',
  TEAM_MEMBERS: 'kbzlife_lms_team_members_v2',
  LICENSE_LESSONS: 'kbzlife_lms_license_lessons_v1',
  SKILL_CATEGORIES: 'kbzlife_lms_skill_categories_v1',
  SKILL_RESOURCES: 'kbzlife_lms_skill_resources_v1',
  SKILL_QUIZZES: 'kbzlife_lms_skill_quizzes_v1',
  SKILL_ATTEMPTS: 'kbzlife_lms_skill_attempts_v1',
  LICENSE_PROGRESS: 'kbzlife_lms_license_progress_v2',
  LICENSE_QUIZZES: 'kbzlife_lms_license_quizzes_v1',
  LICENSE_CHAPTERS: 'kbzlife_lms_license_chapters_v1',
  LICENSE_ATTEMPTS: 'kbzlife_lms_license_attempts_v1',
  CHAPTER_COMPLETIONS: 'kbzlife_lms_chapter_completions_v1',
  PRODUCTS: 'kbzlife_lms_products_v1',
  PRODUCT_QUIZZES: 'kbzlife_lms_product_quizzes_v1',
  PRODUCT_ATTEMPTS: 'kbzlife_lms_product_attempts_v1',
  BULLETINS: 'kbzlife_lms_bulletins_v1',
};

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHANNELS);
      return saved ? JSON.parse(saved) : INITIAL_CHANNELS;
    } catch {
      return INITIAL_CHANNELS;
    }
  });

  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      return saved ? JSON.parse(saved) : INITIAL_ENROLLMENTS;
    } catch {
      return INITIAL_ENROLLMENTS;
    }
  });

  const [channelAccesses, setChannelAccesses] = useState<ChannelAccess[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHANNEL_ACCESS);
      return saved ? JSON.parse(saved) : INITIAL_CHANNEL_ACCESS;
    } catch {
      return INITIAL_CHANNEL_ACCESS;
    }
  });

  const [companyNews, setCompanyNews] = useState<CompanyNewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NEWS);
      return saved ? JSON.parse(saved) : INITIAL_NEWS;
    } catch {
      return INITIAL_NEWS;
    }
  });

  const [companyVideos, setCompanyVideos] = useState<CompanyVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
    } catch {
      return INITIAL_VIDEOS;
    }
  });

  const [topPerformers, setTopPerformers] = useState<TopPerformerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERFORMERS);
      return saved ? JSON.parse(saved) : INITIAL_TOP_PERFORMERS;
    } catch {
      return INITIAL_TOP_PERFORMERS;
    }
  });

  const [hodMotto, setHodMotto] = useState<HodMotto>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOD_MOTTO);
      return saved ? JSON.parse(saved) : INITIAL_HOD_MOTTO;
    } catch {
      return INITIAL_HOD_MOTTO;
    }
  });

  const [teamMembers, setTeamMembers] = useState<LdTeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
      return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
    } catch {
      return INITIAL_TEAM_MEMBERS;
    }
  });

  const [licenseTrainingLessons, setLicenseTrainingLessons] = useState<LicenseTrainingLesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LICENSE_LESSONS);
      const parsed: LicenseTrainingLesson[] = saved ? JSON.parse(saved) : INITIAL_LICENSE_LESSONS;
      return parsed.map((lesson) => {
        if (lesson.file_url && (lesson.file_url.includes('w3.org') || lesson.file_url.includes('commondatastorage.googleapis.com'))) {
          const matched = INITIAL_LICENSE_LESSONS.find((l) => l.id === lesson.id);
          return {
            ...lesson,
            file_url: matched ? matched.file_url : '/uploads/IBRB_Licensing_Agent_Code.mp4',
            thumbnail_url: matched ? matched.thumbnail_url : lesson.thumbnail_url,
          };
        }
        return lesson;
      });
    } catch {
      return INITIAL_LICENSE_LESSONS;
    }
  });

  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SKILL_CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_SKILL_CATEGORIES;
    } catch {
      return INITIAL_SKILL_CATEGORIES;
    }
  });

  const [skillDevelopmentResources, setSkillDevelopmentResources] = useState<SkillDevelopmentResource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SKILL_RESOURCES);
      const parsed: SkillDevelopmentResource[] = saved ? JSON.parse(saved) : INITIAL_SKILL_RESOURCES;
      return parsed.map((res) => {
        if ((res.content_url && (res.content_url.includes('w3.org') || res.content_url.includes('commondatastorage.googleapis.com'))) ||
            (res.file_url && (res.file_url.includes('w3.org') || res.file_url.includes('commondatastorage.googleapis.com')))) {
          const matched = INITIAL_SKILL_RESOURCES.find((r) => r.id === res.id);
          return {
            ...res,
            content_url: matched ? matched.content_url : (res.file_url || res.content_url),
            file_url: matched ? matched.file_url : (res.file_url || res.content_url),
            thumbnail_url: matched ? matched.thumbnail_url : res.thumbnail_url,
          };
        }
        return res;
      });
    } catch {
      return INITIAL_SKILL_RESOURCES;
    }
  });

  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  });

  const [licenseVideoProgress, setLicenseVideoProgress] = useState<Record<string, LessonProgressInfo>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LICENSE_PROGRESS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [licenseChapters, setLicenseChapters] = useState<LicenseChapter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LICENSE_CHAPTERS);
      return saved ? JSON.parse(saved) : INITIAL_LICENSE_CHAPTERS;
    } catch {
      return INITIAL_LICENSE_CHAPTERS;
    }
  });

  const [licenseQuizzes, setLicenseQuizzes] = useState<LicenseQuiz[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LICENSE_QUIZZES);
      return saved ? JSON.parse(saved) : INITIAL_LICENSE_QUIZZES;
    } catch {
      return INITIAL_LICENSE_QUIZZES;
    }
  });

  const [licenseQuizAttempts, setLicenseQuizAttempts] = useState<LicenseQuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LICENSE_ATTEMPTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [chapterCompletions, setChapterCompletions] = useState<Record<string, { status: ChapterStatus; materials_completed: boolean; quiz_passed: boolean; highest_quiz_score: number }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAPTER_COMPLETIONS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [products, setProducts] = useState<ProductKnowledgeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [productQuizzes, setProductQuizzes] = useState<ProductQuiz[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCT_QUIZZES);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCT_QUIZZES;
    } catch {
      return INITIAL_PRODUCT_QUIZZES;
    }
  });

  const [productQuizAttempts, setProductQuizAttempts] = useState<ProductQuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCT_ATTEMPTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [skillQuizzes, setSkillQuizzes] = useState<SkillQuiz[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SKILL_QUIZZES);
      return saved ? JSON.parse(saved) : INITIAL_SKILL_QUIZZES;
    } catch {
      return INITIAL_SKILL_QUIZZES;
    }
  });

  const [skillQuizAttempts, setSkillQuizAttempts] = useState<SkillQuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SKILL_ATTEMPTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [companyBulletins, setCompanyBulletins] = useState<CompanyBulletinItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BULLETINS);
      return saved ? JSON.parse(saved) : INITIAL_COMPANY_BULLETINS;
    } catch {
      return INITIAL_COMPANY_BULLETINS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_EMAIL_LOGS;
    } catch {
      return INITIAL_EMAIL_LOGS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (saved && profiles.some((p) => p.id === saved)) {
        return saved;
      }
      return profiles[0]?.id || INITIAL_PROFILES[0].id;
    } catch {
      return INITIAL_PROFILES[0].id;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem('kbzlife_authenticated');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(isSupabaseConfigured());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Theme State with persistent storage and system preference support
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('kbz_theme');
      if (saved === 'dark' || saved === 'light') {
        if (saved === 'dark') document.documentElement.classList.add('dark');
        return saved;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kbz_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.warn('[Theme] Error persisting theme:', err);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  }, []);

  // Persistent storage synchronizer
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(courseEnrollments));
      localStorage.setItem(STORAGE_KEYS.CHANNEL_ACCESS, JSON.stringify(channelAccesses));
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(companyNews));
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(companyVideos));
      localStorage.setItem(STORAGE_KEYS.PERFORMERS, JSON.stringify(topPerformers));
      localStorage.setItem(STORAGE_KEYS.HOD_MOTTO, JSON.stringify(hodMotto));
      localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(teamMembers));
      localStorage.setItem(STORAGE_KEYS.LICENSE_LESSONS, JSON.stringify(licenseTrainingLessons));
      localStorage.setItem(STORAGE_KEYS.SKILL_CATEGORIES, JSON.stringify(skillCategories));
      localStorage.setItem(STORAGE_KEYS.SKILL_RESOURCES, JSON.stringify(skillDevelopmentResources));
      localStorage.setItem(STORAGE_KEYS.SKILL_QUIZZES, JSON.stringify(skillQuizzes));
      localStorage.setItem(STORAGE_KEYS.SKILL_ATTEMPTS, JSON.stringify(skillQuizAttempts));
      localStorage.setItem(STORAGE_KEYS.LICENSE_PROGRESS, JSON.stringify(licenseVideoProgress));
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(learningProgress));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(emailLogs));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.PRODUCT_QUIZZES, JSON.stringify(productQuizzes));
      localStorage.setItem(STORAGE_KEYS.PRODUCT_ATTEMPTS, JSON.stringify(productQuizAttempts));
      localStorage.setItem(STORAGE_KEYS.LICENSE_CHAPTERS, JSON.stringify(licenseChapters));
      localStorage.setItem(STORAGE_KEYS.LICENSE_ATTEMPTS, JSON.stringify(licenseQuizAttempts));
      localStorage.setItem(STORAGE_KEYS.CHAPTER_COMPLETIONS, JSON.stringify(chapterCompletions));
      localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify(companyBulletins));
    } catch (e) {
      console.warn('Could not sync to localStorage', e);
    }
  }, [
    currentUserId,
    profiles,
    courses,
    channels,
    courseEnrollments,
    channelAccesses,
    companyNews,
    companyVideos,
    topPerformers,
    hodMotto,
    teamMembers,
    licenseTrainingLessons,
    licenseChapters,
    licenseQuizAttempts,
    chapterCompletions,
    skillCategories,
    skillDevelopmentResources,
    skillQuizzes,
    skillQuizAttempts,
    products,
    productQuizzes,
    productQuizAttempts,
    companyBulletins,
    learningProgress,
    licenseVideoProgress,
    auditLogs,
    emailLogs,
  ]);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all tables from Supabase if live
  const refreshData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsSupabaseLive(false);
      return;
    }

    setIsLoading(true);
    try {
      const [
        { data: dbProfiles },
        { data: dbCourses },
        { data: dbChannels },
        { data: dbNews },
        { data: dbVideos },
        { data: dbPerformers },
        { data: dbEnrollments },
        { data: dbChannelAccess },
        { data: dbProgress },
        { data: dbAudit },
        { data: dbHodMotto },
        { data: dbTeamMembers },
        { data: dbLicenseLessons },
        { data: dbSkillCategories },
        { data: dbSkillResources },
        { data: dbProducts },
        { data: dbProductQuizzes },
        { data: dbProductAttempts },
        { data: dbBulletins },
        { data: dbLicenseChapters },
        { data: dbLicenseQuizzes },
        { data: dbLicenseAttempts },
        { data: dbSkillQuizzes },
        { data: dbSkillAttempts },
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('channels').select('*'),
        supabase.from('company_news').select('*'),
        supabase.from('company_videos').select('*'),
        supabase.from('top_performers').select('*'),
        supabase.from('course_enrollments').select('*'),
        supabase.from('channel_access').select('*'),
        supabase.from('learning_progress').select('*'),
        supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('hod_motto').select('*'),
        supabase.from('ld_team_members').select('*').order('display_order', { ascending: true }),
        supabase.from('license_training_lessons').select('*').order('display_order', { ascending: true }),
        supabase.from('skill_categories').select('*').order('display_order', { ascending: true }),
        supabase.from('skill_development_resources').select('*').order('display_order', { ascending: true }),
        supabase.from('product_knowledge_items').select('*').order('display_order', { ascending: true }),
        supabase.from('product_quizzes').select('*'),
        supabase.from('product_quiz_attempts').select('*').order('created_at', { ascending: false }),
        supabase.from('company_bulletins').select('*').order('published_at', { ascending: false }),
        supabase.from('license_chapters').select('*').order('display_order', { ascending: true }),
        supabase.from('license_quizzes').select('*'),
        supabase.from('license_quiz_attempts').select('*').order('created_at', { ascending: false }),
        supabase.from('skill_quizzes').select('*'),
        supabase.from('skill_quiz_attempts').select('*').order('created_at', { ascending: false }),
      ]);

      if (Array.isArray(dbProfiles) && dbProfiles.length > 0) setProfiles(dbProfiles as Profile[]);
      if (Array.isArray(dbCourses)) setCourses(dbCourses as Course[]);
      if (Array.isArray(dbChannels)) setChannels(dbChannels as Channel[]);
      if (Array.isArray(dbNews)) setCompanyNews(dbNews as CompanyNewsArticle[]);
      if (Array.isArray(dbVideos)) setCompanyVideos(dbVideos as CompanyVideoItem[]);
      if (Array.isArray(dbPerformers)) setTopPerformers(dbPerformers as TopPerformerEntry[]);
      if (Array.isArray(dbEnrollments)) setCourseEnrollments(dbEnrollments as CourseEnrollment[]);
      if (Array.isArray(dbChannelAccess)) setChannelAccesses(dbChannelAccess as ChannelAccess[]);
      if (Array.isArray(dbProgress)) setLearningProgress(dbProgress as LearningProgress[]);
      if (Array.isArray(dbAudit)) setAuditLogs(dbAudit as AdminAuditLog[]);
      if (Array.isArray(dbHodMotto) && dbHodMotto.length > 0) setHodMotto(dbHodMotto[0] as HodMotto);
      if (Array.isArray(dbTeamMembers) && dbTeamMembers.length > 0) setTeamMembers(dbTeamMembers as LdTeamMember[]);
      if (Array.isArray(dbLicenseLessons) && dbLicenseLessons.length > 0) setLicenseTrainingLessons(dbLicenseLessons as LicenseTrainingLesson[]);
      if (Array.isArray(dbSkillCategories) && dbSkillCategories.length > 0) setSkillCategories(dbSkillCategories as SkillCategory[]);
      if (Array.isArray(dbSkillResources) && dbSkillResources.length > 0) setSkillDevelopmentResources(dbSkillResources as SkillDevelopmentResource[]);
      if (Array.isArray(dbProducts) && dbProducts.length > 0) setProducts(dbProducts as ProductKnowledgeItem[]);
      if (Array.isArray(dbProductQuizzes) && dbProductQuizzes.length > 0) setProductQuizzes(dbProductQuizzes as ProductQuiz[]);
      if (Array.isArray(dbProductAttempts)) setProductQuizAttempts(dbProductAttempts as ProductQuizAttempt[]);
      if (Array.isArray(dbBulletins) && dbBulletins.length > 0) setCompanyBulletins(dbBulletins as CompanyBulletinItem[]);
      if (Array.isArray(dbLicenseChapters) && dbLicenseChapters.length > 0) setLicenseChapters(dbLicenseChapters as LicenseChapter[]);
      if (Array.isArray(dbLicenseQuizzes) && dbLicenseQuizzes.length > 0) setLicenseQuizzes(dbLicenseQuizzes as LicenseQuiz[]);
      if (Array.isArray(dbLicenseAttempts)) setLicenseQuizAttempts(dbLicenseAttempts as LicenseQuizAttempt[]);
      if (Array.isArray(dbSkillQuizzes) && dbSkillQuizzes.length > 0) setSkillQuizzes(dbSkillQuizzes as SkillQuiz[]);
      if (Array.isArray(dbSkillAttempts)) setSkillQuizAttempts(dbSkillAttempts as SkillQuizAttempt[]);

      setIsSupabaseLive(true);
    } catch (err) {
      console.warn('[KBZLife LMS] Supabase fetch fallback to local store:', err);
      setIsSupabaseLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      refreshData();
    }
  }, [refreshData]);

  // Realtime synchronization across Admin and User panels
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const channel = supabase
        .channel('lms-admin-user-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'product_knowledge_items' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'product_quizzes' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'product_quiz_attempts' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'skill_categories' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'skill_development_resources' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'license_training_lessons' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'company_videos' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'company_news' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'top_performers' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'learning_progress' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            refreshData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[KBZLife LMS] Supabase Realtime subscription notice:', err);
    }
  }, [refreshData]);

  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0] || INITIAL_PROFILES[0];

  const switchUser = (userId: string) => {
    const found = profiles.find((p) => p.id === userId);
    if (found) {
      setCurrentUserId(userId);
      showToast(
        'info',
        `Switched User: ${found.full_name}`,
        `Role: ${found.role.toUpperCase()} | Status: ${found.account_status.toUpperCase()}`
      );
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('kbzlife_authenticated');
      sessionStorage.setItem('kbzlife_authenticated', 'false');
    } catch {}
    window.location.hash = '';
    showToast('info', 'Signed Out', 'You have been securely signed out of KBZLife LMS.');
  };

  const logAuditAction = async (
    action: AdminAuditLog['action'],
    entity_type: AdminAuditLog['entity_type'],
    entity_id: string | null,
    details: string,
    target_user_id?: string | null,
    target_user_name?: string | null
  ) => {
    const newLog: AdminAuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      admin_user_id: currentUser.id,
      admin_name: currentUser.full_name,
      target_user_id: target_user_id || null,
      target_user_name: target_user_name || null,
      action,
      entity_type,
      entity_id: entity_id || null,
      details,
      created_at: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('admin_audit_logs').insert([newLog]);
      } catch (err) {
        console.warn('Could not write audit log to Supabase:', err);
      }
    }
  };

  // -------------------------------------------------------------
  // AUTHENTICATION & PASSWORD MANAGEMENT
  // -------------------------------------------------------------

  const loginWithCredentials = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; message: string; mustChangePassword?: boolean; account_status?: AccountStatus; role?: UserRole }> => {
    const supabase = getSupabaseClient();

    // 1. Try real Supabase Auth if configured and identifier is an email
    if (supabase && identifier.includes('@')) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: identifier.trim(),
          password,
        });

        if (!authErr && authData?.user) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (dbProfile) {
            setProfiles((prev) => {
              const filtered = prev.filter((p) => p.id !== dbProfile.id);
              return [dbProfile as Profile, ...filtered];
            });
            setCurrentUserId(dbProfile.id);
            setIsAuthenticated(true);
            try { sessionStorage.setItem('kbzlife_authenticated', 'true'); } catch {}

            return {
              success: true,
              message: 'Successfully authenticated via Supabase Auth.',
              mustChangePassword: Boolean(dbProfile.must_change_password),
              account_status: dbProfile.account_status,
              role: dbProfile.role as UserRole,
            };
          }
        }
      } catch (sbErr) {
        console.warn('[KBZLife LMS] Supabase Auth signIn attempt error, falling back to server route:', sbErr);
      }
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid username or password.' };
      }

      // If user exists in local state, sync
      const matched = profiles.find(
        (p) =>
          p.email.toLowerCase() === data.user.email.toLowerCase() ||
          (p.username && p.username.toLowerCase() === identifier.toLowerCase())
      );

      if (matched) {
        setCurrentUserId(matched.id);
      } else {
        setProfiles((prev) => [data.user, ...prev]);
        setCurrentUserId(data.user.id);
      }

      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('kbzlife_authenticated', 'true');
      } catch {}

      const userRole = ((data.user && data.user.role) || (matched && matched.role) || 'user') as UserRole;
      return {
        success: true,
        message: 'Successfully authenticated.',
        mustChangePassword: data.mustChangePassword,
        account_status: data.account_status,
        role: userRole,
      };
    } catch {
      // Local fallback for offline mode
      if (identifier === 'admin' || identifier === 'admin@kbzlife.com') {
        if (password === 'admin123') {
          setCurrentUserId(INITIAL_PROFILES[0].id);
          setIsAuthenticated(true);
          try {
            sessionStorage.setItem('kbzlife_authenticated', 'true');
          } catch {}
          return { success: true, message: 'Logged in as Administrator.', mustChangePassword: true, account_status: 'active', role: 'super_admin' };
        }
      }
      return { success: false, message: 'Authentication server unavailable.' };
    }
  };

  const registerUser = async (data: {
    full_name: string;
    username: string;
    email: string;
    password: string;
    department?: string;
    employee_id?: string;
  }): Promise<{ success: boolean; user?: Profile; message: string }> => {
    const supabase = getSupabaseClient();
    let supabaseUserId: string | null = null;

    if (supabase) {
      try {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              full_name: data.full_name.trim(),
              username: data.username.trim(),
              department: data.department,
              employee_id: data.employee_id,
            },
          },
        });
        if (!signUpErr && signUpData?.user) {
          supabaseUserId = signUpData.user.id;
          // Ensure profile exists in profiles table with pending status
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            full_name: data.full_name.trim(),
            username: data.username.trim(),
            email: data.email.trim(),
            role: 'user', // NEVER assign admin
            account_status: 'pending', // MUST be pending
            department: data.department || 'KBZLife Operations',
            employee_id: data.employee_id || `KBZ-EMP-${Math.floor(100 + Math.random() * 900)}`,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (sbSignUpErr) {
        console.warn('[KBZLife LMS] Supabase Auth signUp error, falling back to server route:', sbSignUpErr);
      }
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, supabaseUserId }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, message: resData.message || 'Registration failed.' };
      }

      const newProfile: Profile = {
        id: supabaseUserId || resData.user.id,
        username: resData.user.username,
        full_name: resData.user.full_name,
        email: resData.user.email,
        role: 'user', // NEVER assign admin
        account_status: 'pending', // MUST be pending
        department: resData.user.department,
        employee_id: resData.user.employee_id,
        avatar_url: resData.user.avatar_url,
        must_change_password: false,
        created_at: resData.user.created_at,
        updated_at: new Date().toISOString(),
      };

      setProfiles((prev) => [newProfile, ...prev]);
      setCurrentUserId(newProfile.id);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('kbzlife_authenticated', 'true');
      } catch {}

      await logAuditAction(
        'user_registered',
        'user',
        newProfile.id,
        `New learner registered: ${newProfile.full_name} (${newProfile.email}). Account set to pending approval.`,
        newProfile.id,
        newProfile.full_name
      );

      showToast('info', 'Registration Received', 'Your account is pending administrator review.');
      return { success: true, user: newProfile, message: resData.message };
    } catch {
      // Local fallback
      const newId = supabaseUserId || ('u_' + Date.now());
      const localProfile: Profile = {
        id: newId,
        username: data.username,
        full_name: data.full_name,
        email: data.email,
        role: 'user',
        account_status: 'pending',
        department: data.department || 'General Employee',
        employee_id: data.employee_id || `KBZ-EMP-${Math.floor(100 + Math.random() * 900)}`,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        must_change_password: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfiles((prev) => [localProfile, ...prev]);
      setCurrentUserId(localProfile.id);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('kbzlife_authenticated', 'true');
      } catch {}

      return {
        success: true,
        user: localProfile,
        message: 'Account registered. Pending administrator approval.',
      };
    }
  };

  const checkUserApprovalStatus = async (userId?: string): Promise<AccountStatus> => {
    const targetId = userId || currentUserId;
    try {
      const res = await fetch(`/api/auth/status?userId=${encodeURIComponent(targetId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.status) {
          setProfiles((prev) =>
            prev.map((p) => (p.id === targetId ? { ...p, account_status: data.status } : p))
          );
          return data.status;
        }
      }
    } catch {
      // fallback to current local state
    }
    const p = profiles.find((pr) => pr.id === targetId);
    return p ? p.account_status : 'pending';
  };

  const approveUser = async (userId: string): Promise<boolean> => {
    return updateUserStatus(userId, 'approved', 'Administrative approval granted');
  };

  const rejectUser = async (userId: string, reason: string): Promise<boolean> => {
    return updateUserStatus(userId, 'rejected', reason || 'Registration declined');
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === currentUser.id ? { ...p, must_change_password: false } : p))
        );
        await logAuditAction('password_changed', 'user', currentUser.id, 'User password changed successfully.');
        showToast('success', 'Password Updated', 'Your new password has been verified and saved.');
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to update password.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: msg };
    }
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message: string; isConfigured?: boolean }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.isProviderConfigured) {
        showToast('success', 'Email Sent', `Password reset instructions sent to ${email}`);
      } else {
        showToast('info', 'Password Reset Link Generated', data.message);
      }

      await logAuditAction(
        'password_reset_triggered',
        'user',
        null,
        `Password reset email triggered for ${email}`
      );

      return {
        success: data.success,
        message: data.message,
        isConfigured: data.isProviderConfigured,
      };
    } catch {
      return { success: false, message: 'Password reset request failed. Server offline.' };
    }
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error && data) {
          const profile = data as Profile;
          setProfiles((prev) => prev.map((p) => (p.id === userId ? profile : p)));
          return profile;
        }
      } catch (err) {
        console.warn('[KBZLife LMS] Supabase fetchProfile error:', err);
      }
    }
    // Also check server endpoint
    try {
      const res = await fetch(`/api/auth/profile?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          setProfiles((prev) => prev.map((p) => (p.id === userId ? json.profile : p)));
          return json.profile;
        }
      }
    } catch {}

    return profiles.find((p) => p.id === userId) || null;
  };

  const updateProfile = async (
    userId: string,
    updates: Partial<Profile>
  ): Promise<{ success: boolean; message: string; profile?: Profile }> => {
    const now = new Date().toISOString();

    // Whitelist only editable profile fields. Strictly protect role, account_status, and id.
    const safeUpdates: Record<string, any> = {};
    if (updates.full_name !== undefined) safeUpdates.full_name = updates.full_name.trim();
    if (updates.username !== undefined) safeUpdates.username = updates.username.trim();
    if (updates.department !== undefined) safeUpdates.department = updates.department.trim();
    if (updates.avatar_url !== undefined) safeUpdates.avatar_url = updates.avatar_url.trim();
    if (updates.employee_id !== undefined && currentUser.role === 'admin') {
      safeUpdates.employee_id = updates.employee_id.trim();
    }
    if (updates.email !== undefined && updates.email.trim()) {
      safeUpdates.email = updates.email.trim();
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...safeUpdates,
            updated_at: now,
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('[KBZLife LMS] Supabase profile update error:', error);
          showToast('error', 'Profile Update Failed', error.message);
          return { success: false, message: `Database error: ${error.message}` };
        }

        if (data) {
          const updatedProfile = data as Profile;
          setProfiles((prev) =>
            prev.map((p) => (p.id === userId ? updatedProfile : p))
          );
          // Also sync to server-side registry
          try {
            await fetch('/api/auth/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, ...safeUpdates }),
            });
          } catch {}

          await logAuditAction(
            'profile_updated',
            'user',
            userId,
            `Profile details successfully saved to Supabase for ${updatedProfile.full_name}.`
          );
          showToast('success', 'Profile Saved', 'Profile changes successfully written to Supabase database.');
          return { success: true, message: 'Profile updated in Supabase.', profile: updatedProfile };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast('error', 'Database Connection Error', msg);
        return { success: false, message: msg };
      }
    }

    // Try server endpoint fallback
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...safeUpdates }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, ...json.user } : p)));
          showToast('success', 'Profile Saved', 'Profile details updated successfully.');
          return { success: true, message: 'Saved successfully.', profile: json.user };
        }
      }
    } catch {}

    // Local fallback when offline
    let localUpdated: Profile | undefined;
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === userId) {
          localUpdated = { ...p, ...safeUpdates, updated_at: now };
          return localUpdated;
        }
        return p;
      })
    );
    showToast('info', 'Profile Saved Locally', 'Changes saved to browser storage. Connect Supabase to write to live cloud database.');
    return { success: true, message: 'Saved to local store.', profile: localUpdated };
  };

  const updateAdminProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    const res = await updateProfile(currentUser.id, updates);
    return res.success;
  };

  // -------------------------------------------------------------
  // USER INVITATIONS & REAL EMAIL DISPATCH
  // -------------------------------------------------------------

  const inviteUser = async (data: {
    email: string;
    full_name: string;
    role: UserRole;
    department: string;
    employee_id?: string;
  }): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can invite users.');
      return false;
    }

    const now = new Date().toISOString();
    const newProfile: Profile = {
      id: 'u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: data.email.split('@')[0],
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      account_status: 'active',
      department: data.department,
      employee_id: data.employee_id || `KBZ-${Math.floor(100 + Math.random() * 900)}`,
      must_change_password: true,
      created_at: now,
      updated_at: now,
    };

    setProfiles((prev) => [newProfile, ...prev]);

    // Call server email invitation endpoint
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();

      if (resData.emailDelivery?.success) {
        showToast('success', 'User Invited & Email Sent', `Invitation email delivered to ${data.email}.`);
      } else {
        showToast(
          'info',
          'User Created',
          `Account created for ${data.full_name}. Email queued: ${resData.emailDelivery?.message || 'Provider pending'}`
        );
      }
    } catch {
      showToast('info', 'User Created', `User ${data.full_name} created successfully.`);
    }

    await logAuditAction(
      'user_invited',
      'user',
      newProfile.id,
      `Invited new ${data.role.toUpperCase()} account for ${data.full_name} (${data.email})`,
      newProfile.id,
      newProfile.full_name
    );

    return true;
  };

  const sendCustomEmail = async (
    to: string,
    subject: string,
    html: string,
    template?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, template }),
      });
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: msg };
    }
  };

  // -------------------------------------------------------------
  // USER STATUS & ROLE MUTATIONS
  // -------------------------------------------------------------

  const updateUserStatus = async (userId: string, newStatus: AccountStatus, reason?: string): Promise<boolean> => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      showToast('error', 'Access Denied', 'Only authorized administrators can modify user account statuses.');
      return false;
    }

    const targetUser = profiles.find((p) => p.id === userId);
    if (!targetUser) return false;

    const oldStatus = targetUser.account_status;
    const now = new Date().toISOString();

    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, account_status: newStatus, updated_at: now } : p))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').update({ account_status: newStatus, updated_at: now }).eq('id', userId);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }

    // Also sync to server endpoint
    try {
      await fetch('/api/auth/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });
    } catch {}

    const detailText = `Account status changed from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}${
      reason ? `. Reason: ${reason}` : ''
    }`;
    await logAuditAction('user_status_changed', 'user', userId, detailText, targetUser.id, targetUser.full_name);

    showToast('success', 'Status Updated', `${targetUser.full_name}'s status is now ${newStatus.toUpperCase()}.`);
    return true;
  };

  const updateUserRole = async (
    userId: string,
    newRole: UserRole,
    reason?: string
  ): Promise<{ success: boolean; message: string }> => {
    // 1. Only Super Admin may grant or revoke Admin roles
    if (currentUser.role !== 'super_admin') {
      const msg = 'Permission Denied: Only the Super Admin may grant, promote, or revoke administrator roles.';
      showToast('error', 'Super Admin Required', msg);
      return { success: false, message: msg };
    }

    const targetUser = profiles.find((p) => p.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User profile not found.' };
    }

    // 2. Prevent unsafe removal or demotion of the last active Super Admin
    if (targetUser.role === 'super_admin' && newRole !== 'super_admin') {
      const activeSuperAdmins = profiles.filter(
        (p) => p.role === 'super_admin' && (p.account_status === 'active' || p.account_status === 'approved') && p.id !== userId
      );
      if (activeSuperAdmins.length === 0) {
        const msg = 'Security Violation: Cannot demote or revoke the last remaining active Super Admin account.';
        showToast('error', 'Action Prohibited', msg);
        return { success: false, message: msg };
      }
    }

    // 3. Enforce maximum 20 active Admin accounts limit
    if (newRole === 'admin' || newRole === 'super_admin') {
      const activeAdmins = profiles.filter(
        (p) =>
          (p.role === 'admin' || p.role === 'super_admin') &&
          (p.account_status === 'active' || p.account_status === 'approved') &&
          p.id !== userId
      );
      if (activeAdmins.length >= 20) {
        const msg = 'Admin Limit Exceeded: Maximum limit of 20 active administrator accounts has been reached. Demote an existing administrator before adding another.';
        showToast('error', 'Limit Reached (20/20)', msg);
        return { success: false, message: msg };
      }
    }

    try {
      const res = await fetch('/api/admin/roles/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({
          userId,
          newRole,
          requesterRole: currentUser.role,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast('error', 'Role Update Rejected', data.message || 'Failed to update role.');
        return { success: false, message: data.message || 'Role update rejected.' };
      }

      const now = new Date().toISOString();
      setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role: newRole, updated_at: now } : p)));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('profiles').update({ role: newRole, updated_at: now }).eq('id', userId);
        } catch {}
      }

      await logAuditAction(
        'user_role_changed',
        'user',
        userId,
        `Role changed from ${targetUser.role.toUpperCase()} to ${newRole.toUpperCase()}${reason ? `. Reason: ${reason}` : ''}`,
        targetUser.id,
        targetUser.full_name
      );

      showToast('success', 'User Role Updated', `${targetUser.full_name} is now ${newRole.toUpperCase()}.`);
      return { success: true, message: data.message };
    } catch (err: any) {
      const msg = err.message || 'Role update failed.';
      showToast('error', 'Error', msg);
      return { success: false, message: msg };
    }
  };

  const bootstrapSuperAdmin = async (targetEmail: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/roles/bootstrap-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Super Admin Initialized', data.message);
        await refreshData();
        return { success: true, message: data.message };
      } else {
        showToast('error', 'Initialization Failed', data.message);
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const msg = err.message || 'Bootstrap request failed.';
      showToast('error', 'Bootstrap Error', msg);
      return { success: false, message: msg };
    }
  };

  // -------------------------------------------------------------
  // COURSE & CHANNEL PERMISSIONS
  // -------------------------------------------------------------

  const assignCourse = async (
    userId: string,
    courseId: string,
    expiresAt?: string | null,
    note?: string
  ): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const targetUser = profiles.find((p) => p.id === userId);
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetUser || !targetCourse) return false;

    const now = new Date().toISOString();
    const existing = courseEnrollments.find((e) => e.user_id === userId && e.course_id === courseId);

    const enrollmentRecord: CourseEnrollment = {
      id: existing ? existing.id : 'enr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: userId,
      course_id: courseId,
      status: 'enrolled',
      assigned_by: currentUser.id,
      assigned_at: now,
      expires_at: expiresAt || null,
      restriction_note: note || null,
    };

    setCourseEnrollments((prev) => {
      const filtered = prev.filter((e) => !(e.user_id === userId && e.course_id === courseId));
      return [...filtered, enrollmentRecord];
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('course_enrollments').upsert([enrollmentRecord]);
      } catch (err) {
        console.warn('Supabase enrollment upsert warning:', err);
      }
    }

    await logAuditAction(
      'course_assigned',
      'course',
      courseId,
      `Assigned course "${targetCourse.title}" to ${targetUser.full_name}`,
      targetUser.id,
      targetUser.full_name
    );

    showToast('success', 'Course Assigned', `"${targetCourse.title}" is now available to ${targetUser.full_name}.`);
    return true;
  };

  const revokeCourse = async (userId: string, courseId: string, reason?: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const targetUser = profiles.find((p) => p.id === userId);
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetUser || !targetCourse) return false;

    setCourseEnrollments((prev) =>
      prev.map((e) =>
        e.user_id === userId && e.course_id === courseId
          ? { ...e, status: 'revoked', restriction_note: reason || 'Access revoked by administrator' }
          : e
      )
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('course_enrollments')
          .update({ status: 'revoked', restriction_note: reason || 'Access revoked by administrator' })
          .match({ user_id: userId, course_id: courseId });
      } catch (err) {
        console.warn('Supabase revoke warning:', err);
      }
    }

    await logAuditAction(
      'course_revoked',
      'course',
      courseId,
      `Revoked course "${targetCourse.title}" access for ${targetUser.full_name}`,
      targetUser.id,
      targetUser.full_name
    );

    showToast('info', 'Access Revoked', `Revoked course "${targetCourse.title}" from ${targetUser.full_name}.`);
    return true;
  };

  const assignChannel = async (
    userId: string,
    channelId: string,
    expiresAt?: string | null,
    note?: string
  ): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const targetUser = profiles.find((p) => p.id === userId);
    const targetChannel = channels.find((c) => c.id === channelId);
    if (!targetUser || !targetChannel) return false;

    const now = new Date().toISOString();
    const existing = channelAccesses.find((ca) => ca.user_id === userId && ca.channel_id === channelId);

    const accessRecord: ChannelAccess = {
      id: existing ? existing.id : 'ca_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: userId,
      channel_id: channelId,
      status: 'granted',
      assigned_by: currentUser.id,
      assigned_at: now,
      expires_at: expiresAt || null,
      restriction_note: note || null,
    };

    setChannelAccesses((prev) => {
      const filtered = prev.filter((ca) => !(ca.user_id === userId && ca.channel_id === channelId));
      return [...filtered, accessRecord];
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('channel_access').upsert([accessRecord]);
      } catch (err) {
        console.warn('Supabase channel access upsert warning:', err);
      }
    }

    await logAuditAction(
      'channel_granted',
      'channel',
      channelId,
      `Granted channel access "${targetChannel.title}" to ${targetUser.full_name}`,
      targetUser.id,
      targetUser.full_name
    );

    showToast('success', 'Channel Granted', `Channel "${targetChannel.title}" granted to ${targetUser.full_name}.`);
    return true;
  };

  const revokeChannel = async (userId: string, channelId: string, reason?: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const targetUser = profiles.find((p) => p.id === userId);
    const targetChannel = channels.find((c) => c.id === channelId);
    if (!targetUser || !targetChannel) return false;

    setChannelAccesses((prev) =>
      prev.map((ca) =>
        ca.user_id === userId && ca.channel_id === channelId
          ? { ...ca, status: 'revoked', restriction_note: reason || 'Access revoked by administrator' }
          : ca
      )
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('channel_access')
          .update({ status: 'revoked', restriction_note: reason || 'Access revoked by administrator' })
          .match({ user_id: userId, channel_id: channelId });
      } catch (err) {
        console.warn('Supabase revoke warning:', err);
      }
    }

    await logAuditAction(
      'channel_revoked',
      'channel',
      channelId,
      `Revoked channel "${targetChannel.title}" access for ${targetUser.full_name}`,
      targetUser.id,
      targetUser.full_name
    );

    showToast('info', 'Channel Revoked', `Revoked channel "${targetChannel.title}" from ${targetUser.full_name}.`);
    return true;
  };

  // -------------------------------------------------------------
  // COURSE CRUD
  // -------------------------------------------------------------

  const createCourse = async (
    courseInput: Omit<Course, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Course | null> => {
    if (currentUser.role !== 'admin') return null;

    const now = new Date().toISOString();
    const newCourse: Course = {
      ...courseInput,
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
    };

    setCourses((prev) => [newCourse, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('courses').insert([newCourse]);
      } catch (err) {
        console.warn('Supabase insert warning:', err);
      }
    }

    await logAuditAction('course_created', 'course', newCourse.id, `Created new course "${newCourse.title}"`);
    showToast('success', 'Course Created', `Course "${newCourse.title}" saved to database.`);
    return newCourse;
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const now = new Date().toISOString();
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updates, updated_at: now } : c))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('courses').update({ ...updates, updated_at: now }).eq('id', courseId);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }

    await logAuditAction('course_updated', 'course', courseId, `Updated course details for ${updates.title || courseId}`);
    showToast('success', 'Course Updated', 'Course changes saved to database.');
    return true;
  };

  const deleteCourse = async (courseId: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const courseToDelete = courses.find((c) => c.id === courseId);
    if (!courseToDelete) return false;

    setCourses((prev) => prev.filter((c) => c.id !== courseId));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('courses').delete().eq('id', courseId);
      } catch (err) {
        console.warn('Supabase delete warning:', err);
      }
    }

    await logAuditAction('course_deleted', 'course', courseId, `Deleted course "${courseToDelete.title}"`);
    showToast('info', 'Course Deleted', `Course "${courseToDelete.title}" removed from catalog.`);
    return true;
  };

  // -------------------------------------------------------------
  // CHANNEL CRUD
  // -------------------------------------------------------------

  const createChannel = async (
    channelInput: Omit<Channel, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Channel | null> => {
    if (currentUser.role !== 'admin') return null;

    const now = new Date().toISOString();
    const newChannel: Channel = {
      ...channelInput,
      id: 'ch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
    };

    setChannels((prev) => [newChannel, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('channels').insert([newChannel]);
      } catch (err) {
        console.warn('Supabase insert warning:', err);
      }
    }

    await logAuditAction('channel_created', 'channel', newChannel.id, `Created new channel "${newChannel.title}"`);
    showToast('success', 'Channel Created', `Channel "${newChannel.title}" saved to database.`);
    return newChannel;
  };

  const updateChannel = async (channelId: string, updates: Partial<Channel>): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const now = new Date().toISOString();
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, ...updates, updated_at: now } : c))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('channels').update({ ...updates, updated_at: now }).eq('id', channelId);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }

    await logAuditAction('channel_updated', 'channel', channelId, `Updated channel details for ${updates.title || channelId}`);
    showToast('success', 'Channel Updated', 'Channel changes saved to database.');
    return true;
  };

  const deleteChannel = async (channelId: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const channelToDelete = channels.find((c) => c.id === channelId);
    if (!channelToDelete) return false;

    setChannels((prev) => prev.filter((c) => c.id !== channelId));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('channels').delete().eq('id', channelId);
      } catch (err) {
        console.warn('Supabase delete warning:', err);
      }
    }

    await logAuditAction('channel_deleted', 'channel', channelId, `Deleted channel "${channelToDelete.title}"`);
    showToast('info', 'Channel Deleted', `Channel "${channelToDelete.title}" removed.`);
    return true;
  };

  // -------------------------------------------------------------
  // COMPANY NEWS CRUD
  // -------------------------------------------------------------

  const createNews = async (
    articleInput: Omit<CompanyNewsArticle, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CompanyNewsArticle | null> => {
    if (currentUser.role !== 'admin') return null;

    const now = new Date().toISOString();
    const newArticle: CompanyNewsArticle = {
      ...articleInput,
      id: generateUuid(),
      created_at: now,
      updated_at: now,
    };

    setCompanyNews((prev) => [newArticle, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('company_news').insert([newArticle]);
      } catch (err) {
        console.warn('Supabase news insert warning:', err);
      }
    }

    await logAuditAction('news_created', 'news', newArticle.id, `Created news article "${newArticle.title}"`);
    showToast('success', 'News Created', `"${newArticle.title}" saved to Supabase.`);
    return newArticle;
  };

  const updateNews = async (id: string, updates: Partial<CompanyNewsArticle>): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const now = new Date().toISOString();
    setCompanyNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updated_at: now } : n))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('company_news').update({ ...updates, updated_at: now }).eq('id', id);
      } catch (err) {
        console.warn('Supabase news update warning:', err);
      }
    }

    await logAuditAction('news_updated', 'news', id, `Updated news article "${updates.title || id}"`);
    showToast('success', 'News Updated', 'Changes saved to Supabase.');
    return true;
  };

  const deleteNews = async (id: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const article = companyNews.find((n) => n.id === id);
    if (!article) return false;

    setCompanyNews((prev) => prev.filter((n) => n.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('company_news').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase news delete warning:', err);
      }
    }

    await logAuditAction('news_deleted', 'news', id, `Deleted news article "${article.title}"`);
    showToast('info', 'News Deleted', `"${article.title}" removed.`);
    return true;
  };

  // -------------------------------------------------------------
  // COMPANY VIDEOS CRUD
  // -------------------------------------------------------------

  const createVideo = async (
    videoInput: Omit<CompanyVideoItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CompanyVideoItem | null> => {
    if (currentUser.role !== 'admin') return null;

    const now = new Date().toISOString();
    const newVideo: CompanyVideoItem = {
      ...videoInput,
      id: generateUuid(),
      created_at: now,
      updated_at: now,
    };

    setCompanyVideos((prev) => [newVideo, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('company_videos').insert([newVideo]);
      } catch (err) {
        console.warn('Supabase video insert warning:', err);
      }
    }

    await logAuditAction('video_created', 'video', newVideo.id, `Added video "${newVideo.title}"`);
    showToast('success', 'Video Added', `"${newVideo.title}" saved to Supabase.`);
    return newVideo;
  };

  const updateVideo = async (id: string, updates: Partial<CompanyVideoItem>): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const now = new Date().toISOString();
    setCompanyVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updated_at: now } : v))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('company_videos').update({ ...updates, updated_at: now }).eq('id', id);
      } catch (err) {
        console.warn('Supabase video update warning:', err);
      }
    }

    await logAuditAction('video_updated', 'video', id, `Updated video "${updates.title || id}"`);
    showToast('success', 'Video Updated', 'Video metadata updated in Supabase.');
    return true;
  };

  const deleteVideo = async (id: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const video = companyVideos.find((v) => v.id === id);
    if (!video) return false;

    setCompanyVideos((prev) => prev.filter((v) => v.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('company_videos').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase video delete warning:', err);
      }
    }

    await logAuditAction('video_deleted', 'video', id, `Deleted video "${video.title}"`);
    showToast('info', 'Video Deleted', `"${video.title}" removed.`);
    return true;
  };

  // -------------------------------------------------------------
  // TOP PERFORMERS CRUD
  // -------------------------------------------------------------

  const createTopPerformer = async (
    performerInput: Omit<TopPerformerEntry, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TopPerformerEntry | null> => {
    if (currentUser.role !== 'admin') return null;

    const now = new Date().toISOString();
    const newPerformer: TopPerformerEntry = {
      ...performerInput,
      id: 'tp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
    };

    setTopPerformers((prev) => [newPerformer, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('top_performers').insert([newPerformer]);
      } catch (err) {
        console.warn('Supabase performer insert warning:', err);
      }
    }

    await logAuditAction(
      'top_performer_created',
      'top_performer',
      newPerformer.id,
      `Added Top Performer entry for ${newPerformer.employee_name}`
    );
    showToast('success', 'Top Performer Added', `${newPerformer.employee_name} recognized in Supabase.`);
    return newPerformer;
  };

  const updateTopPerformer = async (id: string, updates: Partial<TopPerformerEntry>): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const now = new Date().toISOString();
    setTopPerformers((prev) =>
      prev.map((tp) => (tp.id === id ? { ...tp, ...updates, updated_at: now } : tp))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('top_performers').update({ ...updates, updated_at: now }).eq('id', id);
      } catch (err) {
        console.warn('Supabase performer update warning:', err);
      }
    }

    await logAuditAction('top_performer_updated', 'top_performer', id, `Updated Top Performer entry for ${updates.employee_name || id}`);
    showToast('success', 'Top Performer Updated', 'Changes saved to Supabase.');
    return true;
  };

  const deleteTopPerformer = async (id: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const performer = topPerformers.find((tp) => tp.id === id);
    if (!performer) return false;

    setTopPerformers((prev) => prev.filter((tp) => tp.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('top_performers').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase performer delete warning:', err);
      }
    }

    await logAuditAction('top_performer_deleted', 'top_performer', id, `Deleted Top Performer entry for ${performer.employee_name}`);
    showToast('info', 'Top Performer Removed', `${performer.employee_name} entry removed.`);
    return true;
  };

  // -------------------------------------------------------------
  // LICENSE TRAINING LESSONS CRUD (ADMIN UPLOAD & USER VIEWING)
  // -------------------------------------------------------------

  const createLicenseLesson = async (
    lessonInput: Omit<LicenseTrainingLesson, 'id' | 'created_at' | 'updated_at'>
  ): Promise<LicenseTrainingLesson | null> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can create license training lessons.');
      return null;
    }

    const now = new Date().toISOString();
    const contentType = (lessonInput.content_type || lessonInput.lesson_type || 'video') as LicenseContentType;
    const isPublished = lessonInput.is_published !== undefined
      ? Boolean(lessonInput.is_published)
      : lessonInput.status === 'published';

    const newLesson: LicenseTrainingLesson = {
      ...lessonInput,
      content_type: contentType,
      lesson_type: contentType,
      category: lessonInput.category || 'Regulatory Accreditation',
      status: isPublished ? 'published' : 'draft',
      is_published: isPublished,
      id: 'lic_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
    };

    setLicenseTrainingLessons((prev) => [newLesson, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('license_training_lessons').insert([newLesson]);
      } catch (err) {
        console.warn('Supabase license lesson insert notice:', err);
      }
    }

    await logAuditAction(
      'course_created',
      'license_lesson',
      newLesson.id,
      `Created license training lesson: "${newLesson.title}" (${(newLesson.content_type || contentType).toUpperCase()})`
    );
    showToast('success', 'Lesson Saved', `"${newLesson.title}" has been saved.`);
    return newLesson;
  };

  const updateLicenseLesson = async (
    id: string,
    updates: Partial<LicenseTrainingLesson>
  ): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can modify license training lessons.');
      return false;
    }

    const now = new Date().toISOString();
    setLicenseTrainingLessons((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const isPublished = updates.is_published !== undefined
          ? Boolean(updates.is_published)
          : updates.status !== undefined
          ? updates.status === 'published'
          : l.is_published ?? (l.status === 'published');
        const contentType = (updates.content_type || updates.lesson_type || l.content_type || l.lesson_type || 'video') as LicenseContentType;
        return {
          ...l,
          ...updates,
          content_type: contentType,
          lesson_type: contentType,
          is_published: isPublished,
          status: isPublished ? 'published' : 'draft',
          updated_at: now,
        };
      })
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('license_training_lessons')
          .update({ ...updates, updated_at: now })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase license lesson update notice:', err);
      }
    }

    await logAuditAction(
      'course_updated',
      'license_lesson',
      id,
      `Updated license training lesson: "${updates.title || id}"`
    );
    showToast('success', 'Lesson Updated', 'Changes saved successfully.');
    return true;
  };

  const deleteLicenseLesson = async (id: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can delete license training lessons.');
      return false;
    }

    const lesson = licenseTrainingLessons.find((l) => l.id === id);
    if (!lesson) return false;

    setLicenseTrainingLessons((prev) => prev.filter((l) => l.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('license_training_lessons').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase license lesson delete notice:', err);
      }
    }

    await logAuditAction(
      'course_deleted',
      'license_lesson',
      id,
      `Deleted license training lesson: "${lesson.title}"`
    );
    showToast('info', 'Lesson Removed', `"${lesson.title}" has been deleted.`);
    return true;
  };

  // -------------------------------------------------------------
  // SKILL CATEGORIES CRUD (ADMIN CATEGORY MANAGEMENT)
  // -------------------------------------------------------------

  const createSkillCategory = async (
    categoryInput: Omit<SkillCategory, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SkillCategory | null> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can create skill categories.');
      return null;
    }

    const now = new Date().toISOString();
    const newCategory: SkillCategory = {
      ...categoryInput,
      id: 'sk_cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      is_published: categoryInput.is_published ?? true,
      display_order: categoryInput.display_order || skillCategories.length + 1,
      created_at: now,
      updated_at: now,
    };

    setSkillCategories((prev) => [...prev, newCategory]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('skill_categories').insert([newCategory]);
      } catch (err) {
        console.warn('Supabase skill category insert notice:', err);
      }
    }

    await logAuditAction(
      'skill_category_created',
      'skill_category',
      newCategory.id,
      `Created skill category: "${newCategory.name}"`
    );
    showToast('success', 'Category Created', `"${newCategory.name}" added successfully.`);
    return newCategory;
  };

  const updateSkillCategory = async (
    id: string,
    updates: Partial<SkillCategory>
  ): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can modify skill categories.');
      return false;
    }

    const now = new Date().toISOString();
    const existing = skillCategories.find((c) => c.id === id);
    if (!existing) return false;

    const oldName = existing.name;
    const newName = updates.name ? updates.name.trim() : oldName;

    setSkillCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, name: newName, updated_at: now } : c))
    );

    // If category name changed, also cascade to assigned resources in local state
    if (updates.name && updates.name !== oldName) {
      setSkillDevelopmentResources((prev) =>
        prev.map((r) =>
          r.category_id === id || r.category === oldName || r.topic === oldName
            ? { ...r, category: newName, topic: newName, updated_at: now }
            : r
        )
      );
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('skill_categories')
          .update({ ...updates, name: newName, updated_at: now })
          .eq('id', id);

        if (updates.name && updates.name !== oldName) {
          await supabase
            .from('skill_development_resources')
            .update({ category: newName, topic: newName, updated_at: now })
            .eq('category_id', id);
        }
      } catch (err) {
        console.warn('Supabase skill category update notice:', err);
      }
    }

    await logAuditAction(
      'skill_category_updated',
      'skill_category',
      id,
      `Updated skill category: "${newName}"`
    );
    showToast('success', 'Category Updated', 'Changes saved successfully.');
    return true;
  };

  const deleteSkillCategory = async (id: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can delete skill categories.');
      return false;
    }

    const category = skillCategories.find((c) => c.id === id);
    if (!category) return false;

    setSkillCategories((prev) => prev.filter((c) => c.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('skill_categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase skill category delete notice:', err);
      }
    }

    await logAuditAction(
      'skill_category_deleted',
      'skill_category',
      id,
      `Deleted skill category: "${category.name}"`
    );
    showToast('info', 'Category Removed', `"${category.name}" has been deleted.`);
    return true;
  };

  // -------------------------------------------------------------
  // SKILL DEVELOPMENT RESOURCES CRUD (ADMIN UPLOAD & USER VIEWING)
  // -------------------------------------------------------------

  const createSkillResource = async (
    resourceInput: Omit<SkillDevelopmentResource, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SkillDevelopmentResource | null> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can create skill development resources.');
      return null;
    }

    const now = new Date().toISOString();
    const categoryName = resourceInput.category || resourceInput.topic || 'General';
    const isPub = resourceInput.is_published ?? (resourceInput.status === 'published' || true);

    const newResource: SkillDevelopmentResource = {
      ...resourceInput,
      id: 'sk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      category: categoryName,
      topic: categoryName,
      is_published: isPub,
      status: isPub ? 'published' : 'draft',
      created_at: now,
      updated_at: now,
    };

    setSkillDevelopmentResources((prev) => [newResource, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('skill_development_resources').insert([newResource]);
      } catch (err) {
        console.warn('Supabase skill resource insert notice:', err);
      }
    }

    await logAuditAction(
      'course_created',
      'skill_resource',
      newResource.id,
      `Created skill resource: "${newResource.title}" [${newResource.category}]`
    );
    showToast('success', 'Resource Created', `"${newResource.title}" saved to ${newResource.category}.`);
    return newResource;
  };

  const updateSkillResource = async (
    id: string,
    updates: Partial<SkillDevelopmentResource>
  ): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can modify skill resources.');
      return false;
    }

    const now = new Date().toISOString();
    const cleanUpdates: Partial<SkillDevelopmentResource> = { ...updates, updated_at: now };
    if (updates.category && !updates.topic) cleanUpdates.topic = updates.category;
    if (updates.topic && !updates.category) cleanUpdates.category = updates.topic;
    if (updates.is_published !== undefined) {
      cleanUpdates.status = updates.is_published ? 'published' : 'draft';
    } else if (updates.status !== undefined) {
      cleanUpdates.is_published = updates.status === 'published';
    }

    setSkillDevelopmentResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...cleanUpdates } : r))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('skill_development_resources')
          .update(cleanUpdates)
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase skill resource update notice:', err);
      }
    }

    await logAuditAction(
      'course_updated',
      'skill_resource',
      id,
      `Updated skill resource: "${updates.title || id}"`
    );
    showToast('success', 'Resource Updated', 'Changes saved successfully.');
    return true;
  };

  const deleteSkillResource = async (id: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Access Denied', 'Only administrators can delete skill resources.');
      return false;
    }

    const resource = skillDevelopmentResources.find((r) => r.id === id);
    if (!resource) return false;

    setSkillDevelopmentResources((prev) => prev.filter((r) => r.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('skill_development_resources').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase skill resource delete notice:', err);
      }
    }

    await logAuditAction(
      'course_deleted',
      'skill_resource',
      id,
      `Deleted skill resource: "${resource.title}"`
    );
    showToast('info', 'Resource Removed', `"${resource.title}" has been deleted.`);
    return true;
  };

  // -------------------------------------------------------------
  // HOD MOTTO & TEAM MEMBERS MUTATIONS
  // -------------------------------------------------------------

  const updateHodMotto = async (updates: Partial<HodMotto>): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Unauthorized', 'Only administrators can update the HOD motto.');
      return false;
    }

    const updated: HodMotto = {
      ...hodMotto,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setHodMotto(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('hod_motto').upsert([updated]);
      } catch (err) {
        console.warn('Supabase HOD motto update warning:', err);
      }
    }

    await logAuditAction('hod_motto_updated', 'hod_motto', updated.id, 'Updated Head of Department (HOD) motto and guidance statement.');
    showToast('success', 'HOD Motto Saved', 'Head of Department leadership motto has been updated.');
    return true;
  };

  const createTeamMember = async (
    member: Omit<LdTeamMember, 'id' | 'created_at' | 'updated_at'>
  ): Promise<LdTeamMember | null> => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Unauthorized', 'Only administrators can add team members.');
      return null;
    }

    const now = new Date().toISOString();
    const newMember: LdTeamMember = {
      ...member,
      id: 'tm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: now,
      updated_at: now,
    };

    setTeamMembers((prev) => [...prev, newMember]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('ld_team_members').insert([newMember]);
      } catch (err) {
        console.warn('Supabase team member insert warning:', err);
      }
    }

    await logAuditAction(
      'team_member_created',
      'team_member',
      newMember.id,
      `Added new ${newMember.member_type === 'intern' ? 'intern' : 'team member'}: ${newMember.full_name} (${newMember.position})`
    );
    showToast('success', 'Member Added', `${newMember.full_name} has been added to the L&D Team.`);
    return newMember;
  };

  const updateTeamMember = async (id: string, updates: Partial<LdTeamMember>): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const existing = teamMembers.find((m) => m.id === id);
    if (!existing) return false;

    const updated: LdTeamMember = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setTeamMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('ld_team_members').update(updated).eq('id', id);
      } catch (err) {
        console.warn('Supabase team member update warning:', err);
      }
    }

    await logAuditAction(
      'team_member_updated',
      'team_member',
      id,
      `Updated record for ${updated.full_name} (${updated.position})`
    );
    showToast('success', 'Member Updated', `${updated.full_name}'s record has been updated.`);
    return true;
  };

  const deleteTeamMember = async (id: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    const member = teamMembers.find((m) => m.id === id);
    if (!member) return false;

    setTeamMembers((prev) => prev.filter((m) => m.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('ld_team_members').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase team member delete warning:', err);
      }
    }

    await logAuditAction(
      'team_member_deleted',
      'team_member',
      id,
      `Deleted L&D team member: ${member.full_name}`
    );
    showToast('info', 'Member Removed', `${member.full_name} has been removed.`);
    return true;
  };

  const reorderTeamMembers = async (orderedIds: string[]): Promise<boolean> => {
    if (currentUser.role !== 'admin') return false;

    setTeamMembers((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      const reordered: LdTeamMember[] = [];
      orderedIds.forEach((id, idx) => {
        const item = map.get(id);
        if (item) {
          reordered.push({ ...item, display_order: idx + 1 });
          map.delete(id);
        }
      });
      map.forEach((item) => reordered.push(item));
      return reordered;
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await supabase
            .from('ld_team_members')
            .update({ display_order: i + 1 })
            .eq('id', orderedIds[i]);
        }
      } catch (err) {
        console.warn('Supabase team reorder warning:', err);
      }
    }

    await logAuditAction('team_members_reordered', 'team_member', null, 'Reordered L&D team display sequence.');
    showToast('success', 'Order Saved', 'Team display order updated successfully.');
    return true;
  };

  // -------------------------------------------------------------
  // LEARNING PROGRESS
  // -------------------------------------------------------------

  const recordProgress = async (
    courseId?: string,
    channelId?: string,
    percentage: number = 25,
    completionStatus: ProgressCompletionStatus = 'in_progress',
    completedModule?: string
  ): Promise<boolean> => {
    if (currentUser.account_status === 'suspended') {
      showToast('error', 'Account Suspended', 'Suspended accounts cannot update or record learning progress.');
      return false;
    }

    const now = new Date().toISOString();
    const existing = learningProgress.find(
      (p) =>
        p.user_id === currentUser.id &&
        ((courseId && p.course_id === courseId) || (channelId && p.channel_id === channelId))
    );

    const prevModules = existing?.completed_modules || [];
    const updatedModules =
      completedModule && !prevModules.includes(completedModule)
        ? [...prevModules, completedModule]
        : prevModules;

    const record: LearningProgress = {
      id: existing ? existing.id : 'prog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: currentUser.id,
      course_id: courseId || null,
      channel_id: channelId || null,
      progress_percentage: Math.min(100, Math.max(0, percentage)),
      completion_status: percentage >= 100 ? 'completed' : completionStatus,
      last_accessed_at: now,
      updated_at: now,
      completed_modules: updatedModules,
    };

    setLearningProgress((prev) => {
      const filtered = prev.filter(
        (p) =>
          !(
            p.user_id === currentUser.id &&
            ((courseId && p.course_id === courseId) || (channelId && p.channel_id === channelId))
          )
      );
      return [...filtered, record];
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('learning_progress').upsert([record]);
      } catch (err) {
        console.warn('Could not record progress to Supabase:', err);
      }
    }

    showToast('info', 'Progress Saved', `Progress updated to ${record.progress_percentage}%.`);
    return true;
  };

  // Load authenticated user's private progress records from server
  const loadUserLicenseProgress = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/progress/license-lessons?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.progress) {
          setLicenseVideoProgress((prev) => ({
            ...prev,
            ...json.progress,
          }));
        }
      }
    } catch (err) {
      console.warn('[KBZLife LMS] Could not fetch remote progress:', err);
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadUserLicenseProgress(currentUserId);
    }
  }, [currentUserId, loadUserLicenseProgress]);

  const getLessonProgress = useCallback((lessonId: string): LessonProgressInfo => {
    const existing = licenseVideoProgress[lessonId];
    if (existing) {
      return existing;
    }
    const legacy = learningProgress.find((p) => p.user_id === currentUser.id && p.lesson_id === lessonId);
    if (legacy) {
      return {
        lesson_id: lessonId,
        content_type: legacy.content_type || 'video',
        progress_percentage: legacy.progress_percentage,
        completion_status: legacy.completion_status,
        watched_seconds: legacy.watched_seconds || 0,
        total_duration_seconds: legacy.total_duration_seconds || 0,
        watched_intervals: legacy.watched_intervals || [],
        last_position: legacy.last_position || 0,
        viewed_pages: legacy.viewed_pages || [],
        total_pages: legacy.total_pages || 0,
        last_page: legacy.last_page || 1,
        quiz_score: legacy.quiz_score,
        quiz_passed: legacy.quiz_passed,
        quiz_attempts_count: legacy.quiz_attempts_count,
        quiz_completed_at: legacy.quiz_completed_at,
        overall_completed: legacy.overall_completed,
        updated_at: legacy.updated_at,
      };
    }
    return {
      lesson_id: lessonId,
      progress_percentage: 0,
      completion_status: 'not_started',
      watched_seconds: 0,
      total_duration_seconds: 0,
      watched_intervals: [],
      last_position: 0,
      viewed_pages: [],
      total_pages: 0,
      last_page: 1,
      updated_at: new Date().toISOString(),
    };
  }, [licenseVideoProgress, learningProgress, currentUser.id]);

  const recordVideoHeartbeat = useCallback(
    async (
      lessonId: string,
      segment: { start: number; end: number },
      duration: number,
      playbackRate: number = 1.0,
      lastPosition: number = 0
    ): Promise<LessonProgressInfo | null> => {
      if (currentUser.account_status === 'suspended') {
        showToast('error', 'Account Suspended', 'Suspended accounts cannot update learning progress.');
        return null;
      }

      try {
        const res = await fetch('/api/progress/license-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            lessonId,
            segment,
            duration,
            playbackRate,
            lastPosition,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.progress) {
            const prog = json.progress as LessonProgressInfo;
            setLicenseVideoProgress((prev) => ({
              ...prev,
              [lessonId]: {
                ...(prev[lessonId] || {}),
                ...prog,
              },
            }));

            setLearningProgress((prev) => {
              const now = new Date().toISOString();
              const filtered = prev.filter((p) => !(p.user_id === currentUser.id && p.lesson_id === lessonId));
              const newRecord: LearningProgress = {
                id: 'prog_' + currentUser.id + '_' + lessonId,
                user_id: currentUser.id,
                lesson_id: lessonId,
                content_type: 'video',
                progress_percentage: prog.progress_percentage,
                completion_status: prog.completion_status,
                last_accessed_at: now,
                updated_at: now,
                watched_seconds: prog.watched_seconds,
                total_duration_seconds: prog.total_duration_seconds,
                watched_intervals: prog.watched_intervals,
                last_position: prog.last_position,
              };
              return [...filtered, newRecord];
            });

            return prog;
          }
        }
      } catch (err) {
        console.warn('[KBZLife LMS] Failed to send video heartbeat:', err);
      }
      return null;
    },
    [currentUser.account_status, currentUser.id, showToast]
  );

  const recordPdfPageProgress = useCallback(
    async (
      lessonId: string,
      page: number,
      totalPages: number
    ): Promise<LessonProgressInfo | null> => {
      if (currentUser.account_status === 'suspended') {
        showToast('error', 'Account Suspended', 'Suspended accounts cannot update learning progress.');
        return null;
      }

      const totalPageCount = totalPages > 0 ? totalPages : 1;

      // 1. Synchronously update local state based on distinct pages viewed
      let updatedProg: LessonProgressInfo | null = null;
      setLicenseVideoProgress((prev) => {
        const current = prev[lessonId] || getLessonProgress(lessonId);
        const pagesSet = new Set<number>(current.viewed_pages || []);
        pagesSet.add(page);
        const distinctPages = Array.from(pagesSet).sort((a, b) => a - b);
        const percentage = Math.min(100, Math.round((distinctPages.length / totalPageCount) * 100));
        const status: ProgressCompletionStatus = distinctPages.length >= totalPageCount || percentage >= 100 ? 'completed' : 'in_progress';

        updatedProg = {
          ...current,
          lesson_id: lessonId,
          content_type: 'pdf',
          viewed_pages: distinctPages,
          total_pages: totalPageCount,
          last_page: page,
          progress_percentage: percentage,
          completion_status: status,
          updated_at: new Date().toISOString(),
        };

        return {
          ...prev,
          [lessonId]: updatedProg,
        };
      });

      // 2. Synchronously update learningProgress array
      setLearningProgress((prev) => {
        const now = new Date().toISOString();
        const filtered = prev.filter((p) => !(p.user_id === currentUser.id && p.lesson_id === lessonId));
        if (!updatedProg) return prev;
        const current = updatedProg as LessonProgressInfo;
        const newRecord: LearningProgress = {
          id: 'prog_' + currentUser.id + '_' + lessonId,
          user_id: currentUser.id,
          lesson_id: lessonId,
          content_type: 'pdf',
          progress_percentage: current.progress_percentage,
          completion_status: current.completion_status,
          last_accessed_at: now,
          updated_at: now,
          viewed_pages: current.viewed_pages,
          total_pages: current.total_pages,
          last_page: current.last_page,
        };
        return [...filtered, newRecord];
      });

      // 3. Persist to API and Supabase
      try {
        fetch('/api/progress/license-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            lessonId,
            page,
            totalPages: totalPageCount,
          }),
        }).catch((e) => console.warn('[KBZLife LMS] Background PDF progress sync notice:', e));

        const supabase = getSupabaseClient();
        if (supabase && updatedProg) {
          const current = updatedProg as LessonProgressInfo;
          Promise.resolve(
            supabase.from('learning_progress').upsert({
              user_id: currentUser.id,
              lesson_id: lessonId,
              content_type: 'pdf',
              progress_percentage: current.progress_percentage,
              completion_status: current.completion_status,
              viewed_pages: current.viewed_pages,
              total_pages: current.total_pages,
              last_page: current.last_page,
              updated_at: current.updated_at,
            })
          ).catch(() => {});
        }
      } catch (err) {
        console.warn('[KBZLife LMS] Failed to send PDF progress:', err);
      }

      return updatedProg;
    },
    [currentUser.account_status, currentUser.id, getLessonProgress, showToast]
  );

  // -------------------------------------------------------------
  // CHAPTER-BASED SEQUENTIAL WORKFLOW & PROGRESSION
  // -------------------------------------------------------------

  const getChapterStatus = useCallback(
    (chapterId: string): ChapterStatus => {
      if (currentUser.role === 'admin') {
        const comp = chapterCompletions[chapterId];
        if (comp?.quiz_passed) return 'completed';
        if (comp?.materials_completed) return 'quiz_available';
        return 'in_progress';
      }

      const sorted = [...licenseChapters].sort((a, b) => a.display_order - b.display_order || a.chapter_number - b.chapter_number);
      const index = sorted.findIndex((c) => c.id === chapterId);
      if (index === -1) return 'locked';

      // Sequential chapter unlocking: Chapter 1 is always unlocked initially.
      // Subsequent chapters unlock ONLY after passing the previous chapter's quiz.
      if (index > 0) {
        const prevChapter = sorted[index - 1];
        const prevComp = chapterCompletions[prevChapter.id];
        const prevPassed = prevComp?.quiz_passed || prevComp?.status === 'completed' || prevComp?.status === 'passed';
        if (!prevPassed) {
          return 'locked';
        }
      }

      // Check current chapter status
      const comp = chapterCompletions[chapterId];
      if (comp?.quiz_passed || comp?.status === 'completed' || comp?.status === 'passed') {
        return 'completed';
      }

      // Check if all designated learning materials (video & PDF) in this chapter are completed
      const chapterLessons = licenseTrainingLessons.filter(
        (l) => l.chapter_id === chapterId && (l.is_published ?? (l.status === 'published'))
      );

      if (chapterLessons.length === 0) {
        return 'quiz_available';
      }

      let allComplete = true;
      for (const lesson of chapterLessons) {
        const prog = getLessonProgress(lesson.id);
        const isPdf = (lesson.lesson_type || lesson.content_type) === 'pdf';
        if (isPdf) {
          const isPdfDone =
            prog.completion_status === 'completed' ||
            (prog.viewed_pages && prog.total_pages && prog.total_pages > 0 && prog.viewed_pages.length >= prog.total_pages) ||
            prog.progress_percentage >= 100;
          if (!isPdfDone) allComplete = false;
        } else {
          const isVidDone = prog.completion_status === 'completed' || prog.progress_percentage >= 95;
          if (!isVidDone) allComplete = false;
        }
      }

      if (allComplete) {
        return 'quiz_available';
      }

      return 'in_progress';
    },
    [currentUser.role, licenseChapters, chapterCompletions, licenseTrainingLessons, getLessonProgress]
  );

  const getChapterMaterialsProgress = useCallback(
    (chapterId: string) => {
      const chapterLessons = licenseTrainingLessons.filter(
        (l) => l.chapter_id === chapterId && (l.is_published ?? (l.status === 'published'))
      );

      if (chapterLessons.length === 0) {
        return { isComplete: true, completedCount: 0, totalCount: 0, percentage: 100 };
      }

      let completedCount = 0;
      for (const lesson of chapterLessons) {
        const prog = getLessonProgress(lesson.id);
        const isPdf = (lesson.lesson_type || lesson.content_type) === 'pdf';
        if (isPdf) {
          const isPdfDone =
            prog.completion_status === 'completed' ||
            (prog.viewed_pages && prog.total_pages && prog.total_pages > 0 && prog.viewed_pages.length >= prog.total_pages) ||
            prog.progress_percentage >= 100;
          if (isPdfDone) completedCount++;
        } else {
          const isVidDone = prog.completion_status === 'completed' || prog.progress_percentage >= 95;
          if (isVidDone) completedCount++;
        }
      }

      const percentage = Math.round((completedCount / chapterLessons.length) * 100);
      return {
        isComplete: completedCount === chapterLessons.length,
        completedCount,
        totalCount: chapterLessons.length,
        percentage,
      };
    },
    [licenseTrainingLessons, getLessonProgress]
  );

  const getOverallLicenseProgress = useCallback(() => {
    const publishedChapters = licenseChapters.filter((c) => c.is_published);
    if (publishedChapters.length === 0) {
      return { totalChapters: 0, completedChapters: 0, overallPercentage: 0, isCourseCompleted: false };
    }

    let completed = 0;
    for (const ch of publishedChapters) {
      const status = getChapterStatus(ch.id);
      if (status === 'completed' || status === 'passed') {
        completed++;
      }
    }

    const percentage = Math.round((completed / publishedChapters.length) * 100);
    return {
      totalChapters: publishedChapters.length,
      completedChapters: completed,
      overallPercentage: percentage,
      isCourseCompleted: completed === publishedChapters.length && publishedChapters.length > 0,
    };
  }, [licenseChapters, getChapterStatus]);

  const createLicenseChapter = useCallback(
    async (data: {
      title: string;
      chapter_number?: number;
      description?: string;
      passing_score?: number;
      display_order?: number;
      is_published?: boolean;
    }): Promise<boolean> => {
      if (currentUser.role !== 'admin') {
        showToast('error', 'Access Denied', 'Only administrators can create chapters.');
        return false;
      }

      try {
        const res = await fetch('/api/admin/license-chapters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (json.success && json.chapter) {
          setLicenseChapters((prev) => [...prev, json.chapter].sort((a, b) => a.display_order - b.display_order));
          await logAuditAction(
            'license_chapter_created',
            'license_chapter',
            json.chapter.id,
            `Created license chapter: ${json.chapter.title}`
          );
          showToast('success', 'Chapter Created', `Created ${json.chapter.title}`);
          return true;
        } else {
          showToast('error', 'Error', json.message || 'Failed to create chapter.');
          return false;
        }
      } catch (err: any) {
        showToast('error', 'Network Error', err.message || 'Creation failed.');
        return false;
      }
    },
    [currentUser.role, logAuditAction, showToast]
  );

  const updateLicenseChapter = useCallback(
    async (id: string, updates: Partial<LicenseChapter>): Promise<boolean> => {
      if (currentUser.role !== 'admin') {
        showToast('error', 'Access Denied', 'Only administrators can update chapters.');
        return false;
      }

      const existing = licenseChapters.find((c) => c.id === id);
      if (!existing) return false;

      const payload = { ...existing, ...updates, id };

      try {
        const res = await fetch('/api/admin/license-chapters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (json.success && json.chapter) {
          setLicenseChapters((prev) =>
            prev.map((c) => (c.id === id ? json.chapter : c)).sort((a, b) => a.display_order - b.display_order)
          );
          await logAuditAction(
            'license_chapter_updated',
            'license_chapter',
            id,
            `Updated license chapter: ${json.chapter.title}`
          );
          showToast('success', 'Chapter Updated', `Saved changes for ${json.chapter.title}`);
          return true;
        }
      } catch (err: any) {
        showToast('error', 'Error', err.message || 'Failed to update chapter.');
      }
      return false;
    },
    [currentUser.role, licenseChapters, logAuditAction, showToast]
  );

  const deleteLicenseChapter = useCallback(
    async (id: string): Promise<boolean> => {
      if (currentUser.role !== 'admin') {
        showToast('error', 'Access Denied', 'Only administrators can delete chapters.');
        return false;
      }

      const target = licenseChapters.find((c) => c.id === id);

      try {
        const res = await fetch(`/api/admin/license-chapters?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'x-user-role': currentUser.role },
        });

        const json = await res.json();
        if (json.success) {
          setLicenseChapters((prev) => prev.filter((c) => c.id !== id));
          if (target) {
            await logAuditAction(
              'license_chapter_deleted',
              'license_chapter',
              id,
              `Deleted license chapter: ${target.title}`
            );
          }
          showToast('success', 'Chapter Deleted', 'The chapter has been removed.');
          return true;
        }
      } catch (err: any) {
        showToast('error', 'Error', err.message || 'Failed to delete chapter.');
      }
      return false;
    },
    [currentUser.role, licenseChapters, logAuditAction, showToast]
  );

  const reorderLicenseChapters = useCallback(
    async (orderedIds: string[]): Promise<boolean> => {
      if (currentUser.role !== 'admin') return false;

      try {
        const res = await fetch('/api/admin/license-chapters/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify({ orderedIds }),
        });

        const json = await res.json();
        if (json.success && json.chapters) {
          setLicenseChapters(json.chapters);
          return true;
        }
      } catch (err) {
        console.warn('Reorder chapters error:', err);
      }
      return false;
    },
    [currentUser.role]
  );

  const getChapterQuiz = useCallback(
    async (chapterId: string): Promise<LicenseQuiz | null> => {
      try {
        const res = await fetch(`/api/license/quizzes?chapterId=${encodeURIComponent(chapterId)}&role=${currentUser.role}`, {
          headers: { 'x-user-role': currentUser.role },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.quiz) {
            return json.quiz;
          }
        }
      } catch (err) {
        console.warn('[KBZLife LMS] Failed to load chapter quiz from API:', err);
      }

      const local = licenseQuizzes.find((q) => q.chapter_id === chapterId);
      return local || null;
    },
    [currentUser.role, licenseQuizzes]
  );

  const saveChapterQuiz = useCallback(
    async (
      chapterId: string,
      data: {
        title: string;
        description?: string;
        passingScore: number;
        questions: LicenseQuizQuestion[];
      }
    ): Promise<boolean> => {
      if (currentUser.role !== 'admin') {
        showToast('error', 'Access Denied', 'Only administrators can configure quizzes.');
        return false;
      }

      try {
        const res = await fetch('/api/admin/license-quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify({
            chapterId,
            ...data,
          }),
        });

        const json = await res.json();
        if (json.success && json.quiz) {
          setLicenseQuizzes((prev) => {
            const idx = prev.findIndex((q) => q.chapter_id === chapterId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = json.quiz;
              return updated;
            }
            return [...prev, json.quiz];
          });
          showToast('success', 'Quiz Saved', 'Chapter assessment configured successfully.');
          return true;
        }
      } catch (err: any) {
        showToast('error', 'Error', err.message || 'Failed to save chapter quiz.');
      }
      return false;
    },
    [currentUser.role, showToast]
  );

  const submitChapterQuiz = useCallback(
    async (
      chapterId: string,
      quizId: string,
      answers: Record<string, number>
    ) => {
      if (currentUser.account_status === 'suspended') {
        showToast('error', 'Account Suspended', 'Suspended accounts cannot submit assessments.');
        return { success: false, message: 'Account is suspended.' };
      }

      try {
        const res = await fetch('/api/license/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userName: currentUser.full_name,
            userEmail: currentUser.email,
            chapterId,
            quizId,
            answers,
          }),
        });

        const json = await res.json();
        if (json.success) {
          // Immediately update local chapter completion state
          setChapterCompletions((prev) => {
            const prevComp = prev[chapterId];
            const highest = Math.max(prevComp?.highest_quiz_score || 0, json.percentage || 0);
            const passedEver = json.passed || Boolean(prevComp?.quiz_passed);
            return {
              ...prev,
              [chapterId]: {
                status: passedEver ? 'completed' : 'quiz_available',
                materials_completed: true,
                quiz_passed: passedEver,
                highest_quiz_score: highest,
              },
            };
          });

          if (json.attempt) {
            setLicenseQuizAttempts((prev) => [json.attempt, ...prev]);
          }

          if (json.passed) {
            showToast('success', 'Assessment Passed!', json.message);
          } else {
            showToast('warning', 'Retake Available', json.message);
          }

          return json;
        } else {
          showToast('error', 'Quiz Error', json.message || 'Submission failed.');
          return { success: false, message: json.message };
        }
      } catch (err: any) {
        showToast('error', 'Network Error', err.message || 'Submission failed.');
        return { success: false, message: err.message };
      }
    },
    [currentUser.account_status, currentUser.email, currentUser.full_name, currentUser.id, showToast]
  );

  const getLessonQuiz = useCallback(
    async (lessonId: string): Promise<LicenseQuiz | null> => {
      try {
        const res = await fetch(`/api/license/quizzes?lessonId=${encodeURIComponent(lessonId)}&role=${currentUser.role}`, {
          headers: { 'x-user-role': currentUser.role },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.quiz) {
            return json.quiz;
          }
        }
      } catch (err) {
        console.warn('[KBZLife LMS] Failed to load quiz from API:', err);
      }
      const local = licenseQuizzes.find((q) => q.lesson_id === lessonId);
      return local || null;
    },
    [currentUser.role, licenseQuizzes]
  );

  const submitQuizAttempt = useCallback(
    async (lessonId: string, quizId: string, answers: Record<string, number>) => {
      if (currentUser.account_status === 'suspended') {
        showToast('error', 'Account Suspended', 'Suspended accounts cannot submit assessments.');
        return { success: false, message: 'Account is suspended.' };
      }

      try {
        const res = await fetch('/api/license/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userName: currentUser.full_name,
            userEmail: currentUser.email,
            lessonId,
            quizId,
            answers,
          }),
        });

        const json = await res.json();
        if (json.success) {
          setLicenseVideoProgress((prev) => {
            const current = prev[lessonId] || getLessonProgress(lessonId);
            return {
              ...prev,
              [lessonId]: {
                ...current,
                quiz_score: json.percentage,
                quiz_passed: json.passed,
                quiz_attempts_count: (current.quiz_attempts_count || 0) + 1,
                quiz_completed_at: new Date().toISOString(),
                overall_completed: json.overall_completed,
              },
            };
          });

          if (json.attempt) {
            setLicenseQuizAttempts((prev) => [json.attempt, ...prev]);
          }

          if (json.passed) {
            showToast('success', 'Assessment Passed!', json.message);
          } else {
            showToast('warning', 'Assessment Needs Retake', json.message);
          }
          return json;
        } else {
          showToast('error', 'Quiz Submission Error', json.message || 'Failed to submit quiz.');
          return { success: false, ...json };
        }
      } catch (err: any) {
        showToast('error', 'Network Error', err.message || 'Submission failed.');
        return { success: false, message: err.message };
      }
    },
    [currentUser.account_status, currentUser.email, currentUser.full_name, currentUser.id, getLessonProgress, showToast]
  );

  const saveQuiz = useCallback(
    async (
      lessonId: string,
      title: string,
      description: string,
      passingScore: number,
      questions: LicenseQuizQuestion[]
    ): Promise<boolean> => {
      try {
        const res = await fetch('/api/admin/license-quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify({
            lessonId,
            title,
            description,
            passingScore,
            questions,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.quiz) {
            setLicenseQuizzes((prev) => {
              const idx = prev.findIndex((q) => q.lesson_id === lessonId);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = json.quiz;
                return updated;
              }
              return [...prev, json.quiz];
            });
            showToast('success', 'Quiz Saved', 'Assessment questions updated successfully.');
            return true;
          }
        }
      } catch (err) {
        console.warn('[KBZLife LMS] Failed to save quiz via API:', err);
      }
      return false;
    },
    [currentUser.role, showToast]
  );

  const getQuizAttempts = useCallback(
    async (lessonId?: string, chapterId?: string): Promise<LicenseQuizAttempt[]> => {
      try {
        const params = new URLSearchParams();
        if (chapterId) params.append('chapterId', chapterId);
        if (lessonId) params.append('lessonId', lessonId);
        params.append('userId', currentUser.id);
        params.append('role', currentUser.role);

        const res = await fetch(`/api/license/quiz/attempts?${params.toString()}`, {
          headers: { 'x-user-role': currentUser.role },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.attempts)) {
            return json.attempts;
          }
        }
      } catch (err) {
        console.warn('Could not load quiz attempts:', err);
      }
      return licenseQuizAttempts.filter(
        (a) => (!chapterId || a.chapter_id === chapterId) && (!lessonId || a.lesson_id === lessonId)
      );
    },
    [currentUser.id, currentUser.role, licenseQuizAttempts]
  );

  // -------------------------------------------------------------
  // COMPUTED / HELPERS
  // -------------------------------------------------------------

  const getStats = (): AdminStats => {
    return {
      totalUsers: profiles.length,
      activeUsers: profiles.filter((p) => p.account_status === 'active').length,
      inactiveOrSuspendedUsers: profiles.filter((p) => p.account_status !== 'active').length,
      totalCourses: courses.length,
      totalChannels: channels.length,
      totalEnrollments: courseEnrollments.filter((e) => e.status === 'enrolled').length,
      totalNews: companyNews.length,
      totalVideos: companyVideos.length,
      totalTopPerformers: topPerformers.length,
      totalTeamMembers: teamMembers.length,
      totalLicenseLessons: licenseTrainingLessons.length,
      totalSkillCategories: skillCategories.length,
      totalSkillResources: skillDevelopmentResources.length,
      totalProducts: products.length,
    };
  };

  const getUserEnrollments = (userId: string) => {
    return courseEnrollments.filter((e) => e.user_id === userId);
  };

  const getUserChannelAccesses = (userId: string) => {
    return channelAccesses.filter((ca) => ca.user_id === userId);
  };

  const getUserAccessibleCourses = (userId: string): Course[] => {
    const user = profiles.find((p) => p.id === userId);
    if (!user || user.account_status !== 'active') return [];
    if (user.role === 'admin') return courses.filter((c) => c.published);

    const validCourseIds = courseEnrollments
      .filter((e) => {
        if (e.user_id !== userId || e.status !== 'enrolled') return false;
        if (e.expires_at && new Date(e.expires_at) < new Date()) return false;
        return true;
      })
      .map((e) => e.course_id);

    return courses.filter((c) => c.published && validCourseIds.includes(c.id));
  };

  const getUserAccessibleChannels = (userId: string): Channel[] => {
    const user = profiles.find((p) => p.id === userId);
    if (!user || user.account_status !== 'active') return [];
    if (user.role === 'admin') return channels.filter((c) => c.published);

    const validChannelIds = channelAccesses
      .filter((ca) => {
        if (ca.user_id !== userId || ca.status !== 'granted') return false;
        if (ca.expires_at && new Date(ca.expires_at) < new Date()) return false;
        return true;
      })
      .map((ca) => ca.channel_id);

    return channels.filter((c) => c.published && validChannelIds.includes(c.id));
  };

  const getUserProgress = (userId: string, courseId?: string, channelId?: string) => {
    return learningProgress.find(
      (p) =>
        p.user_id === userId &&
        ((courseId && p.course_id === courseId) || (channelId && p.channel_id === channelId))
    );
  };

  const getPublishedNews = (): CompanyNewsArticle[] => {
    return companyNews.filter((n) => n.status === 'published');
  };

  const getPublishedVideos = (): CompanyVideoItem[] => {
    return companyVideos
      .filter((v) => v.status === 'published')
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getPublishedTopPerformers = (): TopPerformerEntry[] => {
    return topPerformers.filter((tp) => tp.status === 'published');
  };

  const getPublishedTeamMembers = (): LdTeamMember[] => {
    return teamMembers
      .filter((m) => m.is_published)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getPublishedHodMotto = (): HodMotto | null => {
    if (!hodMotto.is_published || !hodMotto.motto_text || !hodMotto.motto_text.trim()) {
      return null;
    }
    return hodMotto;
  };

  const getPublishedLicenseLessons = (): LicenseTrainingLesson[] => {
    return licenseTrainingLessons
      .filter((l) => l.is_published === true || l.status === 'published')
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  };

  const getPublishedSkillCategories = (): SkillCategory[] => {
    return skillCategories
      .filter((c) => c.is_published)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getPublishedSkillResources = (): SkillDevelopmentResource[] => {
    return skillDevelopmentResources
      .filter((r) => r.is_published === true || r.status === 'published')
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getPublishedProducts = (): ProductKnowledgeItem[] => {
    return products
      .filter((p) => p.is_published === true || p.status === 'published')
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getProduct = (id: string): ProductKnowledgeItem | undefined => {
    return products.find((p) => p.id === id);
  };

  const createProduct = async (
    productData: Omit<ProductKnowledgeItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ProductKnowledgeItem | null> => {
    const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();
    const newProduct: ProductKnowledgeItem = {
      ...productData,
      id,
      is_published: productData.is_published ?? (productData.status === 'published'),
      display_order: productData.display_order ?? (products.length + 1),
      created_at: now,
      updated_at: now,
    };

    setProducts((prev) => [...prev, newProduct]);

    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify(newProduct),
      });
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('product_knowledge_items').insert(newProduct);
      } catch (err) {
        console.warn('[KBZLife LMS] Supabase product insert notice:', err);
      }
    }

    await logAuditAction('product_created', 'product', id, `Added new product: ${newProduct.title}`);
    showToast('success', 'Product Created', `"${newProduct.title}" has been saved.`);
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<ProductKnowledgeItem>): Promise<boolean> => {
    const now = new Date().toISOString();
    let updatedItem: ProductKnowledgeItem | undefined;

    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = {
            ...item,
            ...updates,
            is_published:
              updates.is_published !== undefined
                ? updates.is_published
                : updates.status !== undefined
                ? updates.status === 'published'
                : item.is_published,
            updated_at: now,
          };
          return updatedItem;
        }
        return item;
      })
    );

    try {
      await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify(updates),
      });
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase && updatedItem) {
      try {
        await supabase.from('product_knowledge_items').update(updatedItem).eq('id', id);
      } catch (err) {
        console.warn('[KBZLife LMS] Supabase product update notice:', err);
      }
    }

    await logAuditAction('product_updated', 'product', id, `Updated product details: ${updatedItem?.title || id}`);
    showToast('success', 'Product Updated', 'Product changes saved successfully.');
    return true;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
        },
      });
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('product_knowledge_items').delete().eq('id', id);
        await supabase.from('product_quizzes').delete().eq('product_id', id);
        await supabase.from('product_quiz_attempts').delete().eq('product_id', id);
      } catch (err) {
        console.warn('[KBZLife LMS] Supabase product delete notice:', err);
      }
    }

    await logAuditAction('product_deleted', 'product', id, `Deleted product: ${target?.title || id}`);
    showToast('info', 'Product Deleted', `"${target?.title || 'Product'}" has been removed.`);
    return true;
  };

  const getProductQuiz = useCallback(
    async (productId: string): Promise<ProductQuiz | null> => {
      const sanitizeForLearner = (q: ProductQuiz): ProductQuiz => {
        if (currentUser.role === 'admin') return q;
        return {
          ...q,
          questions: q.questions.map((quest) => ({
            id: quest.id,
            quiz_id: quest.quiz_id,
            question_text: quest.question_text,
            options: quest.options,
            display_order: quest.display_order,
          } as ProductQuizQuestion)),
        };
      };

      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}/quiz`, {
          headers: { 'x-user-role': currentUser.role },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.quiz) {
            return sanitizeForLearner(json.quiz);
          }
        }
      } catch {}

      const existing = productQuizzes.find((q) => q.product_id === productId);
      if (existing) {
        return sanitizeForLearner(existing);
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: qData } = await supabase
            .from('product_quizzes')
            .select('*')
            .eq('product_id', productId)
            .maybeSingle();
          if (qData) {
            const { data: questData } = await supabase
              .from('product_quiz_questions')
              .select('*')
              .eq('quiz_id', qData.id)
              .order('display_order', { ascending: true });
            const completeQuiz: ProductQuiz = {
              ...qData,
              questions: questData || [],
            };
            return sanitizeForLearner(completeQuiz);
          }
        } catch {}
      }

      return null;
    },
    [currentUser.role, productQuizzes]
  );

  const saveProductQuiz = useCallback(
    async (
      productId: string,
      data: {
        title: string;
        description?: string;
        passing_score: number;
        max_attempts?: number;
        is_published: boolean;
        questions: ProductQuizQuestion[];
      }
    ): Promise<boolean> => {
      const now = new Date().toISOString();
      const existing = productQuizzes.find((q) => q.product_id === productId);
      const quizId = existing ? existing.id : 'quiz_' + productId;

      const formattedQuestions = data.questions.map((q, idx) => ({
        ...q,
        id: q.id || `qp_${productId}_${idx + 1}`,
        quiz_id: quizId,
        display_order: idx + 1,
      }));

      const newQuiz: ProductQuiz = {
        id: quizId,
        product_id: productId,
        title: data.title,
        description: data.description,
        passing_score: data.passing_score,
        max_attempts: data.max_attempts ?? 0,
        is_published: data.is_published,
        questions: formattedQuestions,
        created_at: existing ? existing.created_at : now,
        updated_at: now,
      };

      setProductQuizzes((prev) => {
        const idx = prev.findIndex((q) => q.product_id === productId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = newQuiz;
          return next;
        }
        return [...prev, newQuiz];
      });

      try {
        await fetch(`/api/admin/products/${encodeURIComponent(productId)}/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify(newQuiz),
        });
      } catch {}

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('product_quizzes').upsert({
            id: quizId,
            product_id: productId,
            title: newQuiz.title,
            description: newQuiz.description,
            passing_score: newQuiz.passing_score,
            max_attempts: newQuiz.max_attempts,
            is_published: newQuiz.is_published,
            updated_at: now,
          });
          await supabase.from('product_quiz_questions').delete().eq('quiz_id', quizId);
          await supabase.from('product_quiz_questions').insert(formattedQuestions);
        } catch (err) {
          console.warn('[KBZLife LMS] Supabase product quiz save notice:', err);
        }
      }

      await logAuditAction('product_quiz_saved', 'product_quiz', quizId, `Saved quiz for product: ${productId}`);
      showToast('success', 'Quiz Saved', 'Product quiz and questions saved successfully.');
      return true;
    },
    [currentUser.role, logAuditAction, productQuizzes, showToast]
  );

  const submitProductQuizAttempt = useCallback(
    async (productId: string, quizId: string, answers: Record<string, number>) => {
      if (currentUser.account_status === 'suspended') {
        showToast('error', 'Account Suspended', 'Suspended accounts cannot submit assessments.');
        return { success: false, message: 'Account is suspended.' };
      }

      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userName: currentUser.full_name,
            userEmail: currentUser.email,
            productId,
            quizId,
            answers,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (json.attempt) {
              setProductQuizAttempts((prev) => [json.attempt, ...prev]);
            }
            if (json.passed) {
              showToast('success', 'Product Quiz Passed!', json.message);
            } else {
              showToast('warning', 'Quiz Needs Retake', json.message);
            }
            return json;
          }
        }
      } catch {}

      const quiz = productQuizzes.find((q) => q.product_id === productId || q.id === quizId);
      if (!quiz) {
        showToast('error', 'Quiz Not Found', 'Could not locate the quiz for grading.');
        return { success: false, message: 'Quiz not found' };
      }

      const totalQuestions = quiz.questions.length;
      let correctCount = 0;
      const breakdown = quiz.questions.map((q) => {
        const selected = answers[q.id];
        const isCorrect = selected !== undefined && selected === q.correct_option_index;
        if (isCorrect) correctCount++;
        return {
          question_id: q.id,
          question_text: q.question_text,
          selected_index: selected ?? null,
          correct_index: q.correct_option_index,
          is_correct: isCorrect,
          explanation: q.explanation || '',
        };
      });

      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = percentage >= quiz.passing_score;

      const attemptRecord: ProductQuizAttempt = {
        id: 'patt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        quiz_id: quiz.id,
        product_id: productId,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_email: currentUser.email,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        answers,
        created_at: new Date().toISOString(),
      };

      setProductQuizAttempts((prev) => [attemptRecord, ...prev]);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('product_quiz_attempts').insert(attemptRecord);
        } catch {}
      }

      if (passed) {
        showToast('success', 'Product Quiz Passed!', `You scored ${percentage}% (Passing mark: ${quiz.passing_score}%).`);
      } else {
        showToast('warning', 'Quiz Needs Retake', `You scored ${percentage}%. You need ${quiz.passing_score}% to pass.`);
      }

      return {
        success: true,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        passing_score: quiz.passing_score,
        breakdown,
        attempt: attemptRecord,
        message: passed
          ? `Congratulations! You scored ${percentage}% on the ${quiz.title}.`
          : `You scored ${percentage}%. Passing mark is ${quiz.passing_score}%. Review the feedback and try again!`,
      };
    },
    [currentUser.account_status, currentUser.email, currentUser.full_name, currentUser.id, productQuizzes, showToast]
  );

  const getUserProductAttempts = useCallback(
    async (productId?: string): Promise<ProductQuizAttempt[]> => {
      let filtered = productQuizAttempts.filter((a) => a.user_id === currentUser.id);
      if (productId) {
        filtered = filtered.filter((a) => a.product_id === productId);
      }

      try {
        const params = new URLSearchParams();
        if (productId) params.append('productId', productId);
        params.append('userId', currentUser.id);
        const res = await fetch(`/api/products/${productId || 'all'}/quiz/attempts?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.attempts)) {
            return json.attempts;
          }
        }
      } catch {}

      return filtered;
    },
    [currentUser.id, productQuizAttempts]
  );

  // =====================================================================
  // AI-POWERED PDF QUIZ GENERATION (License Training & Skill Development)
  // =====================================================================
  const generateQuizFromPdf = useCallback(
    async (data: {
      fileUrl?: string;
      base64?: string;
      fileName?: string;
      count?: number;
      topic?: string;
    }) => {
      try {
        const res = await fetch('/api/quiz/generate-from-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          const err = json.error || json.message || 'Failed to extract or generate quiz from PDF.';
          showToast('error', 'Quiz Generation Notice', err);
          return {
            success: false,
            error: err,
            isScanned: Boolean(json.isScanned),
          };
        }

        showToast(
          'success',
          'Quiz Questions Generated',
          `Successfully generated ${json.questions?.length || 0} questions from ${data.fileName || 'PDF'}. You can now review and adjust before publishing.`
        );

        return {
          success: true,
          questions: json.questions || [],
          page_count: json.page_count,
          extracted_preview: json.extracted_preview,
          message: json.message,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast('error', 'Generation Error', msg);
        return {
          success: false,
          error: msg,
        };
      }
    },
    [currentUser.role, showToast]
  );

  // =====================================================================
  // SKILL DEVELOPMENT QUIZZES & ASSESSMENTS
  // =====================================================================
  const getSkillQuiz = useCallback(
    async (categoryId?: string, resourceId?: string, quizId?: string): Promise<SkillQuiz | null> => {
      const existing = skillQuizzes.find(
        (q) => (quizId && q.id === quizId) ||
               (categoryId && q.category_id === categoryId) ||
               (resourceId && q.resource_id === resourceId)
      );
      if (existing) return existing;

      try {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (resourceId) params.append('resourceId', resourceId);
        if (quizId) params.append('id', quizId);

        const res = await fetch(`/api/skill/quiz?${params.toString()}`, {
          headers: { 'x-user-role': currentUser.role },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.quiz) {
            return json.quiz;
          }
        }
      } catch {}

      return null;
    },
    [currentUser.role, skillQuizzes]
  );

  const saveSkillQuiz = useCallback(
    async (data: {
      id?: string;
      category_id?: string;
      resource_id?: string;
      title: string;
      description?: string;
      passing_score: number;
      is_published?: boolean;
      questions: SkillQuizQuestion[];
    }): Promise<boolean> => {
      const now = new Date().toISOString();
      const quizId = data.id || `sq_${data.category_id || data.resource_id || Date.now()}`;

      const formattedQuestions = data.questions.map((q, idx) => ({
        ...q,
        id: q.id || `sq_${quizId}_${idx + 1}`,
        quiz_id: quizId,
        display_order: idx + 1,
      }));

      const newQuiz: SkillQuiz = {
        id: quizId,
        category_id: data.category_id,
        resource_id: data.resource_id,
        title: data.title,
        description: data.description,
        passing_score: data.passing_score,
        is_published: data.is_published ?? true,
        questions: formattedQuestions,
        created_at: now,
        updated_at: now,
      };

      setSkillQuizzes((prev) => {
        const idx = prev.findIndex((q) => q.id === quizId || (data.category_id && q.category_id === data.category_id));
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = newQuiz;
          return next;
        }
        return [...prev, newQuiz];
      });

      try {
        await fetch('/api/admin/skill-quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify(newQuiz),
        });
      } catch {}

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('skill_quizzes').upsert({
            id: quizId,
            category_id: data.category_id,
            resource_id: data.resource_id,
            title: newQuiz.title,
            description: newQuiz.description,
            passing_score: newQuiz.passing_score,
            is_published: newQuiz.is_published,
            updated_at: now,
          });
          await supabase.from('skill_quiz_questions').delete().eq('quiz_id', quizId);
          await supabase.from('skill_quiz_questions').insert(formattedQuestions);
        } catch (err) {
          console.warn('[KBZLife LMS] Supabase skill quiz save notice:', err);
        }
      }

      await logAuditAction('skill_quiz_saved', 'skill_quiz', quizId, `Saved skill assessment quiz: ${data.title}`);
      showToast('success', 'Skill Quiz Saved', 'Assessment quiz has been published successfully.');
      return true;
    },
    [currentUser.role, logAuditAction, showToast]
  );

  const deleteSkillQuiz = useCallback(
    async (quizId: string): Promise<boolean> => {
      setSkillQuizzes((prev) => prev.filter((q) => q.id !== quizId));

      try {
        await fetch(`/api/admin/skill-quizzes?id=${encodeURIComponent(quizId)}`, {
          method: 'DELETE',
          headers: { 'x-user-role': currentUser.role },
        });
      } catch {}

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('skill_quizzes').delete().eq('id', quizId);
          await supabase.from('skill_quiz_questions').delete().eq('quiz_id', quizId);
        } catch {}
      }

      await logAuditAction('skill_quiz_deleted', 'skill_quiz', quizId, `Deleted skill quiz: ${quizId}`);
      showToast('info', 'Skill Quiz Deleted', 'Assessment quiz removed.');
      return true;
    },
    [currentUser.role, logAuditAction, showToast]
  );

  const submitSkillQuiz = useCallback(
    async (
      quizId: string,
      categoryId: string | undefined,
      answers: Record<string, number>
    ) => {
      if (currentUser.account_status === 'suspended') {
        showToast('error', 'Account Suspended', 'Suspended accounts cannot submit assessments.');
        return { success: false, message: 'Account is suspended.' };
      }

      try {
        const res = await fetch('/api/skill/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userName: currentUser.full_name,
            userEmail: currentUser.email,
            quizId,
            categoryId,
            answers,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (json.attempt) {
              setSkillQuizAttempts((prev) => [json.attempt, ...prev]);
            }
            if (json.passed) {
              showToast('success', 'Assessment Passed!', json.message);
            } else {
              showToast('warning', 'Retake Needed', json.message);
            }
            return json;
          }
        }
      } catch {}

      // Fallback local grading if offline
      const quiz = skillQuizzes.find((q) => q.id === quizId || (categoryId && q.category_id === categoryId));
      if (!quiz) {
        showToast('error', 'Quiz Not Found', 'Could not locate assessment quiz for grading.');
        return { success: false, message: 'Quiz not found' };
      }

      const totalQuestions = quiz.questions.length;
      let correctCount = 0;
      const breakdown = quiz.questions.map((q) => {
        const selected = answers[q.id];
        const isCorrect = selected !== undefined && selected === q.correct_option_index;
        if (isCorrect) correctCount++;
        return {
          question_id: q.id,
          question_text: q.question_text,
          selected_index: selected ?? null,
          correct_index: q.correct_option_index,
          is_correct: isCorrect,
          explanation: q.explanation || '',
        };
      });

      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = percentage >= quiz.passing_score;

      const attemptRecord: SkillQuizAttempt = {
        id: 'sqatt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        quiz_id: quiz.id,
        category_id: categoryId,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_email: currentUser.email,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        answers,
        created_at: new Date().toISOString(),
      };

      setSkillQuizAttempts((prev) => [attemptRecord, ...prev]);

      if (passed) {
        showToast('success', 'Assessment Passed!', `You scored ${percentage}% (Passing threshold: ${quiz.passing_score}%).`);
      } else {
        showToast('warning', 'Retake Needed', `You scored ${percentage}%. You need ${quiz.passing_score}% to pass.`);
      }

      return {
        success: true,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        passing_score: quiz.passing_score,
        breakdown,
        attempt: attemptRecord,
        message: passed
          ? `Congratulations! You scored ${percentage}% on the ${quiz.title}.`
          : `You scored ${percentage}%. Passing mark is ${quiz.passing_score}%. Review the explanations and retry when ready!`,
      };
    },
    [currentUser.account_status, currentUser.email, currentUser.full_name, currentUser.id, showToast, skillQuizzes]
  );

  const getSkillQuizAttempts = useCallback(
    async (categoryId?: string, quizId?: string): Promise<SkillQuizAttempt[]> => {
      let filtered = skillQuizAttempts.filter((a) => a.user_id === currentUser.id);
      if (categoryId) {
        filtered = filtered.filter((a) => a.category_id === categoryId);
      }
      if (quizId) {
        filtered = filtered.filter((a) => a.quiz_id === quizId);
      }

      try {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (quizId) params.append('quizId', quizId);
        params.append('userId', currentUser.id);
        const res = await fetch(`/api/skill/quiz/attempts?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.attempts)) {
            return json.attempts;
          }
        }
      } catch {}

      return filtered;
    },
    [currentUser.id, skillQuizAttempts]
  );

  // =====================================================================
  // COMPANY BULLETIN MUTATIONS
  // =====================================================================
  const createBulletin = async (
    data: Omit<CompanyBulletinItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CompanyBulletinItem | null> => {
    const now = new Date().toISOString();
    const id = 'bulletin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newBulletin: CompanyBulletinItem = {
      ...data,
      id,
      published_at: data.published_at || now,
      created_at: now,
      updated_at: now,
      author_id: data.author_id || currentUser.id,
      author_name: data.author_name || currentUser.full_name,
    };

    setCompanyBulletins((prev) => [newBulletin, ...prev]);

    try {
      await fetch('/api/admin/bulletins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify(newBulletin),
      });
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('company_bulletins').insert(newBulletin);
      } catch (err) {
        console.warn('[KBZLife LMS] Supabase bulletin insert notice:', err);
      }
    }

    await logAuditAction('bulletin_created', 'bulletin', id, `Created announcement: ${newBulletin.title}`);
    showToast('success', 'Announcement Published', `"${newBulletin.title}" is now available in Company Bulletin.`);
    return newBulletin;
  };

  const updateBulletin = async (id: string, updates: Partial<CompanyBulletinItem>): Promise<boolean> => {
    const now = new Date().toISOString();
    let updatedItem: CompanyBulletinItem | undefined;

    setCompanyBulletins((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = {
            ...item,
            ...updates,
            published:
              updates.published !== undefined
                ? updates.published
                : updates.status !== undefined
                ? updates.status === 'published'
                : item.published,
            status:
              updates.status !== undefined
                ? updates.status
                : updates.published !== undefined
                ? updates.published
                  ? 'published'
                  : 'draft'
                : item.status,
            updated_at: now,
          };
          return updatedItem;
        }
        return item;
      })
    );

    try {
      await fetch(`/api/admin/bulletins/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify(updates),
      });
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase && updatedItem) {
      try {
        await supabase.from('company_bulletins').update(updatedItem).eq('id', id);
      } catch (err) {
        console.warn('[KBZLife LMS] Supabase bulletin update notice:', err);
      }
    }

    await logAuditAction('bulletin_updated', 'bulletin', id, `Updated announcement: ${updatedItem?.title || id}`);
    showToast('success', 'Announcement Updated', 'Changes saved successfully.');
    return true;
  };

  const deleteBulletin = async (id: string): Promise<boolean> => {
    const target = companyBulletins.find((b) => b.id === id);
    setCompanyBulletins((prev) => prev.filter((b) => b.id !== id));

    try {
      await fetch(`/api/admin/bulletins/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
        },
      });
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('company_bulletins').delete().eq('id', id);
      } catch (err) {
        console.warn('[KBZLife LMS] Supabase bulletin delete notice:', err);
      }
    }

    await logAuditAction('bulletin_deleted', 'bulletin', id, `Deleted announcement: ${target?.title || id}`);
    showToast('info', 'Announcement Deleted', `"${target?.title || 'Announcement'}" has been removed.`);
    return true;
  };

  const resetToInitialData = () => {
    setProfiles(INITIAL_PROFILES);
    setCourses(INITIAL_COURSES);
    setChannels(INITIAL_CHANNELS);
    setCompanyNews(INITIAL_NEWS);
    setCompanyBulletins(INITIAL_COMPANY_BULLETINS);
    setCompanyVideos(INITIAL_VIDEOS);
    setTopPerformers(INITIAL_TOP_PERFORMERS);
    setHodMotto(INITIAL_HOD_MOTTO);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setLicenseTrainingLessons(INITIAL_LICENSE_LESSONS);
    setSkillCategories(INITIAL_SKILL_CATEGORIES);
    setSkillDevelopmentResources(INITIAL_SKILL_RESOURCES);
    setProducts(INITIAL_PRODUCTS);
    setProductQuizzes(INITIAL_PRODUCT_QUIZZES);
    setProductQuizAttempts([]);
    setCourseEnrollments(INITIAL_ENROLLMENTS);
    setChannelAccesses(INITIAL_CHANNEL_ACCESS);
    setLearningProgress(INITIAL_PROGRESS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setEmailLogs(INITIAL_EMAIL_LOGS);
    setCurrentUserId(INITIAL_PROFILES[0].id);
    localStorage.clear();
    showToast('info', 'Reset to Seed Data', 'All tables restored to official KBZLife initial state.');
  };

  const activeAdminCount = profiles.filter(
    (p) =>
      (p.role === 'admin' || p.role === 'super_admin') &&
      (p.account_status === 'active' || p.account_status === 'approved')
  ).length;

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  return (
    <LmsContext.Provider
      value={{
        currentUser,
        profiles,
        courses,
        channels,
        courseEnrollments,
        channelAccesses,
        learningProgress,
        companyNews,
        companyVideos,
        topPerformers,
        hodMotto,
        teamMembers,
        licenseTrainingLessons,
        skillDevelopmentResources,
        auditLogs,
        emailLogs,
        isLoading,
        isSupabaseLive,
        toasts,
        dismissToast,
        showToast,
        theme,
        toggleTheme,
        setTheme,
        isAuthenticated,
        switchUser,
        loginWithCredentials,
        registerUser,
        checkUserApprovalStatus,
        approveUser,
        rejectUser,
        changePassword,
        requestPasswordReset,
        updateAdminProfile,
        updateProfile,
        fetchProfile,
        signOut,
        activeAdminCount,
        maxAdminLimit: 20,
        isSuperAdmin,
        isAdmin,
        bootstrapSuperAdmin,
        getStats,
        getUserEnrollments,
        getUserChannelAccesses,
        getUserAccessibleCourses,
        getUserAccessibleChannels,
        getUserProgress,
        getPublishedNews,
        getPublishedVideos,
        getPublishedTopPerformers,
        getPublishedTeamMembers,
        getPublishedHodMotto,
        getPublishedLicenseLessons,
        skillCategories,
        getPublishedSkillCategories,
        getPublishedSkillResources,
        createSkillCategory,
        updateSkillCategory,
        deleteSkillCategory,
        updateUserStatus,
        updateUserRole,
        assignCourse,
        revokeCourse,
        assignChannel,
        revokeChannel,
        createCourse,
        updateCourse,
        deleteCourse,
        createChannel,
        updateChannel,
        deleteChannel,
        createNews,
        updateNews,
        deleteNews,
        createVideo,
        updateVideo,
        deleteVideo,
        createTopPerformer,
        updateTopPerformer,
        deleteTopPerformer,
        createLicenseLesson,
        updateLicenseLesson,
        deleteLicenseLesson,
        createSkillResource,
        updateSkillResource,
        deleteSkillResource,
        updateHodMotto,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        reorderTeamMembers,
        inviteUser,
        sendCustomEmail,
        recordProgress,
        licenseVideoProgress,
        getLessonProgress,
        recordVideoHeartbeat,
        recordPdfPageProgress,
        licenseChapters,
        chapterCompletions,
        getChapterStatus,
        getChapterMaterialsProgress,
        getOverallLicenseProgress,
        createLicenseChapter,
        updateLicenseChapter,
        deleteLicenseChapter,
        reorderLicenseChapters,
        getChapterQuiz,
        saveChapterQuiz,
        submitChapterQuiz,
        licenseQuizzes,
        licenseQuizAttempts,
        getLessonQuiz,
        submitQuizAttempt,
        saveQuiz,
        getQuizAttempts,
        products,
        productQuizzes,
        productQuizAttempts,
        getPublishedProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductQuiz,
        saveProductQuiz,
        submitProductQuizAttempt,
        getUserProductAttempts,
        generateQuizFromPdf,
        skillQuizzes,
        skillQuizAttempts,
        getSkillQuiz,
        saveSkillQuiz,
        deleteSkillQuiz,
        submitSkillQuiz,
        getSkillQuizAttempts,
        companyBulletins,
        createBulletin,
        updateBulletin,
        deleteBulletin,
        refreshData,
        resetToInitialData,
      }}
    >
      {children}

      {/* Global Toast Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-sm flex items-start justify-between gap-3 transition-all transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-900/95 text-white border-red-700'
                : toast.type === 'warning'
                ? 'bg-amber-900/95 text-white border-amber-700'
                : 'bg-[#003366]/95 text-white border-sky-600'
            }`}
          >
            <div>
              <p className="font-semibold">{toast.title}</p>
              {toast.message && <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/60 hover:text-white text-xs font-bold px-1.5 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </LmsContext.Provider>
  );
};

export const useLms = (): LmsContextType => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
