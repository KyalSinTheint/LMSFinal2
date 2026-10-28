export type UserRole = 'super_admin' | 'admin' | 'user';
export type AccountStatus = 'active' | 'approved' | 'pending' | 'rejected' | 'suspended' | 'inactive';

export interface Profile {
  id: string;
  username?: string;
  full_name: string;
  email: string;
  role: UserRole;
  account_status: AccountStatus;
  employee_id?: string;
  department?: string;
  avatar_url?: string;
  must_change_password?: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  published: boolean;
  duration_hours?: number;
  modules_count?: number;
  created_at: string;
  updated_at: string;
  learning_outcomes?: string[];
}

export interface Channel {
  id: string;
  course_id?: string | null;
  title: string;
  description: string;
  thumbnail_url: string;
  published: boolean;
  order_index: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  key_highlights?: string[];
}

export type EnrollmentStatus = 'enrolled' | 'completed' | 'revoked';

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  assigned_by: string; // admin profile id
  assigned_at: string;
  expires_at?: string | null;
  restriction_note?: string | null;
}

export type ChannelAccessStatus = 'granted' | 'revoked';

export interface ChannelAccess {
  id: string;
  user_id: string;
  channel_id: string;
  status: ChannelAccessStatus;
  assigned_by: string; // admin profile id
  assigned_at: string;
  expires_at?: string | null;
  restriction_note?: string | null;
}

export type ProgressCompletionStatus = 'not_started' | 'in_progress' | 'completed';

export interface LearningProgress {
  id: string;
  user_id: string;
  course_id?: string | null;
  channel_id?: string | null;
  lesson_id?: string | null;
  progress_percentage: number; // 0 to 100
  completion_status: ProgressCompletionStatus;
  last_accessed_at: string;
  updated_at: string;
  completed_modules?: string[];
  watched_seconds?: number;
  total_duration_seconds?: number;
  watched_intervals?: [number, number][];
  last_position?: number;
  // PDF reading progress fields
  content_type?: 'video' | 'pdf';
  viewed_pages?: number[];
  total_pages?: number;
  last_page?: number;
  // Quiz completion fields
  quiz_score?: number;
  quiz_passed?: boolean;
  quiz_attempts_count?: number;
  quiz_completed_at?: string;
  overall_completed?: boolean;
}

export interface LessonProgressInfo {
  lesson_id: string;
  progress_percentage: number;
  completion_status: ProgressCompletionStatus;
  watched_seconds: number;
  total_duration_seconds: number;
  watched_intervals: [number, number][];
  last_position?: number;
  // PDF reading progress fields
  content_type?: 'video' | 'pdf';
  viewed_pages?: number[];
  total_pages?: number;
  last_page?: number;
  // Quiz completion fields
  quiz_score?: number;
  quiz_passed?: boolean;
  quiz_attempts_count?: number;
  quiz_completed_at?: string;
  overall_completed?: boolean;
  updated_at: string;
}

// License Training Chapter & Quiz Interfaces
export type ChapterStatus = 'locked' | 'in_progress' | 'quiz_available' | 'passed' | 'completed';

export interface LicenseChapter {
  id: string;
  chapter_number: number;
  title: string;
  description?: string;
  passing_score: number; // default 80% (configurable by admin)
  display_order: number;
  is_published: boolean;
  author_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicenseQuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number; // 0-indexed
  explanation?: string;
  display_order: number;
}

export interface LicenseQuiz {
  id: string;
  chapter_id?: string;
  lesson_id?: string;
  title: string;
  description?: string;
  passing_score: number; // e.g. 80
  questions: LicenseQuizQuestion[];
  is_published?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LicenseQuizAttempt {
  id: string;
  quiz_id: string;
  chapter_id?: string;
  lesson_id?: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  score: number; // e.g. 4
  total_questions: number; // e.g. 5
  percentage: number; // e.g. 80
  passed: boolean;
  answers: Record<string, number>; // question_id -> chosen option index
  created_at: string;
}

// Company News in Supabase
export interface CompanyNewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string[]; // paragraph blocks
  cover_image_url: string;
  category: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  author_id?: string | null;
  author_name?: string;
  read_time_minutes?: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Company Video in Supabase
export interface CompanyVideoItem {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  category: string;
  display_order: number;
  duration?: string;
  status: 'draft' | 'published';
  author_id?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Top Performer in Supabase
export interface TopPerformerEntry {
  id: string;
  employee_name: string;
  employee_title: string;
  department: string;
  channel: 'Alliance Channel' | 'Bancassurance Channel' | 'Corporate Channel';
  achievement_title: string;
  achievement_description: string;
  image_url: string;
  recognition_period: string; // e.g. "January 2026"
  month_index: number; // 1 to 12
  ranking?: number | null;
  award_date?: string | null;
  status: 'draft' | 'published';
  author_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type AuditAction =
  | 'user_status_changed'
  | 'user_approved'
  | 'user_rejected'
  | 'user_suspended'
  | 'user_reactivated'
  | 'user_registered'
  | 'user_role_changed'
  | 'user_invited'
  | 'password_changed'
  | 'password_reset_triggered'
  | 'course_assigned'
  | 'course_revoked'
  | 'channel_granted'
  | 'channel_revoked'
  | 'course_created'
  | 'course_updated'
  | 'course_deleted'
  | 'channel_created'
  | 'channel_updated'
  | 'channel_deleted'
  | 'news_created'
  | 'news_updated'
  | 'news_deleted'
  | 'news_published'
  | 'video_created'
  | 'video_updated'
  | 'video_deleted'
  | 'top_performer_created'
  | 'top_performer_updated'
  | 'top_performer_deleted'
  | 'profile_updated'
  | 'access_restrictions_updated'
  | 'hod_motto_updated'
  | 'team_member_created'
  | 'team_member_updated'
  | 'team_member_deleted'
  | 'team_members_reordered'
  | 'skill_category_created'
  | 'skill_category_updated'
  | 'skill_category_deleted'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'product_quiz_saved'
  | 'product_quiz_deleted'
  | 'license_chapter_created'
  | 'license_chapter_updated'
  | 'license_chapter_deleted'
  | 'license_chapter_reordered'
  | 'license_quiz_saved'
  | 'license_quiz_deleted'
  | 'skill_quiz_saved'
  | 'skill_quiz_deleted'
  | 'bulletin_created'
  | 'bulletin_updated'
  | 'bulletin_deleted';

export type EntityType =
  | 'user'
  | 'course'
  | 'channel'
  | 'access'
  | 'news'
  | 'video'
  | 'top_performer'
  | 'profile'
  | 'system'
  | 'email'
  | 'hod_motto'
  | 'team_member'
  | 'license_lesson'
  | 'license_chapter'
  | 'license_quiz'
  | 'skill_resource'
  | 'skill_category'
  | 'skill_quiz'
  | 'product'
  | 'product_quiz'
  | 'bulletin';

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  admin_name: string;
  target_user_id?: string | null;
  target_user_name?: string | null;
  action: AuditAction;
  entity_type: EntityType;
  entity_id?: string | null;
  details: string;
  created_at: string;
}

export interface EmailLogEntry {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: 'sent' | 'failed' | 'queued';
  error_message?: string | null;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveOrSuspendedUsers: number;
  totalCourses: number;
  totalChannels: number;
  totalEnrollments: number;
  totalNews: number;
  totalVideos: number;
  totalTopPerformers: number;
  totalTeamMembers: number;
  totalLicenseLessons?: number;
  totalSkillResources?: number;
  totalSkillCategories?: number;
  totalProducts?: number;
}

// Head of Department (HOD) Motto
export interface HodMotto {
  id: string;
  motto_text: string;
  hod_name?: string;
  hod_title?: string;
  photo_url?: string;
  statement_context?: string;
  is_published: boolean;
  updated_at: string;
}

// Learning and Development Team Member
export type LdMemberType = 'team_member' | 'intern';

export interface LdTeamMember {
  id: string;
  full_name: string;
  position: string;
  department: string;
  member_type: LdMemberType;
  photo_path?: string;
  photo_url?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// License Training Lesson (Video or PDF with direct device upload support up to 1GB)
export type LicenseContentType = 'video' | 'pdf';
export type LessonContentType = LicenseContentType;

export interface LicenseTrainingLesson {
  id: string;
  title: string;
  description?: string;
  content_type?: LicenseContentType;
  lesson_type?: LicenseContentType;
  file_url: string; // Storage URL or persistent path
  file_path?: string;
  storage_path?: string;
  file_name?: string;
  file_size?: number;
  file_size_bytes?: number;
  file_size_formatted?: string;
  duration?: string; // e.g. "18:45"
  video_duration?: string;
  thumbnail_url?: string;
  thumbnail_path?: string;
  category?: string;
  chapter_id?: string;
  display_order: number;
  status?: 'draft' | 'published';
  is_published?: boolean;
  author_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Skill Development Category (Managed by Administrator)
export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Skill Development Resource (Video, PDF, or External Link)
export type SkillContentType = 'video' | 'link' | 'pdf';

export interface SkillDevelopmentResource {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  category?: string;
  topic: string; // Dynamic topic / category name
  content_type: SkillContentType;
  content_url?: string; // Storage URL or external link
  file_url?: string;
  external_url?: string;
  file_path?: string;
  storage_path?: string;
  file_name?: string;
  file_size?: number;
  file_size_bytes?: number;
  file_size_formatted?: string;
  duration?: string;
  video_duration?: string;
  thumbnail_url?: string;
  thumbnail_path?: string;
  instructor_name?: string;
  instructor_role?: string;
  instructor_title?: string;
  instructor_avatar?: string;
  instructor_avatar_path?: string;
  rating?: number; // 1 to 5
  lesson_count?: number; // e.g. 16
  display_order: number;
  status?: 'draft' | 'published';
  is_published?: boolean;
  author_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Skill Development Quiz Interfaces (Assessment for Skill Categories & Resources)
export interface SkillQuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number; // 0-indexed
  explanation?: string;
  display_order: number;
}

export interface SkillQuiz {
  id: string;
  category_id?: string;
  resource_id?: string;
  title: string;
  description?: string;
  passing_score: number; // default 80%
  questions: SkillQuizQuestion[];
  is_published?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillQuizAttempt {
  id: string;
  quiz_id: string;
  category_id?: string;
  resource_id?: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number>;
  created_at: string;
}

// =====================================================================
// PRODUCT KNOWLEDGE HUB INTERFACES
// =====================================================================

export interface ProductSection {
  id: string;
  title: string;
  content: string;
}

export type ProductColorTheme = 'navy' | 'emerald' | 'amber' | 'indigo' | 'slate' | 'teal' | 'rose' | 'sky';

export interface ProductKnowledgeItem {
  id: string;
  title: string; // Product name e.g. "KBZLife Endowment Life Assurance"
  subtitle?: string; // Tagline e.g. "Guaranteed Long-Term Savings & Comprehensive Life Cover"
  category?: string; // Optional e.g. "Individual Life", "Group Life", etc.
  description: string; // Overview & Purpose / short description
  short_description?: string; // Concise card description
  content?: string; // Flexible complete Product Knowledge rich-text content
  image_url?: string;
  image_path?: string;
  card_color_theme?: ProductColorTheme;

  // Structured learning sections
  key_benefits?: string[];
  key_features?: string[];
  eligibility_criteria?: string;
  coverage_details?: string;
  premium_terms?: string;
  target_audience?: string;
  additional_sections?: ProductSection[];

  display_order: number;
  status: 'draft' | 'published';
  is_published: boolean;
  author_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductQuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number; // 0-indexed (backend authoritative, protected before grading)
  explanation?: string;
  display_order: number;
}

export interface ProductQuiz {
  id: string;
  product_id: string;
  title: string;
  description?: string;
  passing_score: number; // Percentage, e.g. 80
  max_attempts?: number; // 0 for unlimited
  is_published: boolean;
  questions: ProductQuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface ProductQuizAttempt {
  id: string;
  quiz_id: string;
  product_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  score: number; // Number of correct answers
  total_questions: number;
  percentage: number; // Percentage (0-100)
  passed: boolean;
  answers: Record<string, number>; // question_id -> chosen index
  created_at: string;
}

// =====================================================================
// COMPANY BULLETIN INTERFACES (Campaigns, Announcements, Notices)
// =====================================================================

export type BulletinCategory = 'Campaign' | 'Announcement' | 'Notice' | 'Policy Memo' | 'Incentive';

export type BulletinColorTheme = 'blue_orange' | 'yellow_orange' | 'yellow_blue' | 'emerald_teal' | 'purple_pink';

export interface CompanyBulletinItem {
  id: string;
  title: string;
  description: string;
  category: BulletinCategory;
  pdf_url: string;
  file_name?: string;
  file_size?: number; // bytes
  formatted_file_size?: string;
  page_count?: number;
  published: boolean;
  status: 'published' | 'draft';
  published_at: string;
  created_at: string;
  updated_at: string;
  author_id?: string;
  author_name?: string;
  department?: string;
  tags?: string[];
  reference_no?: string; // e.g. "KBZ-2026-CMP04"
  priority?: 'normal' | 'high' | 'urgent';
  verified?: boolean; // Verified badge matching reference image
  color_theme?: BulletinColorTheme; // Geometric dual-tone circular avatar theme
}
