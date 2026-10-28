import type {
  Profile,
  Course,
  Channel,
  CourseEnrollment,
  ChannelAccess,
  LearningProgress,
  AdminAuditLog,
  CompanyNewsArticle,
  CompanyVideoItem,
  TopPerformerEntry,
  EmailLogEntry,
  HodMotto,
  LdTeamMember,
  LicenseTrainingLesson,
  LicenseChapter,
  SkillDevelopmentResource,
  SkillCategory,
  SkillQuiz,
  SkillQuizQuestion,
  LicenseQuiz,
  LicenseQuizQuestion,
  ProductKnowledgeItem,
  ProductQuiz,
  ProductQuizQuestion,
  CompanyBulletinItem,
} from '../types/lms.ts';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'u0000000-0000-0000-0000-000000000001',
    username: 'admin',
    full_name: 'U Aung Thu',
    email: 'admin@kbzlife.com',
    role: 'super_admin',
    account_status: 'active',
    employee_id: 'KBZ-ADM-001',
    department: 'LMS Administration & HR Governance',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    must_change_password: true,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
    last_sign_in_at: '2026-10-20T21:00:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000002',
    username: 'daw.thida',
    full_name: 'Daw Thida',
    email: 'daw.thida@kbzlife.com',
    role: 'user',
    account_status: 'active',
    employee_id: 'KBZ-UW-104',
    department: 'Underwriting & Policy Issue',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    must_change_password: false,
    created_at: '2026-02-01T09:30:00Z',
    updated_at: '2026-10-18T14:20:00Z',
    last_sign_in_at: '2026-10-20T18:45:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000003',
    username: 'ko.zawmin',
    full_name: 'Ko Zaw Min',
    email: 'ko.zawmin@kbzlife.com',
    role: 'user',
    account_status: 'active',
    employee_id: 'KBZ-AGY-208',
    department: 'Alliance Agency Network (Mandalay Region)',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    must_change_password: false,
    created_at: '2026-03-10T11:15:00Z',
    updated_at: '2026-10-19T08:00:00Z',
    last_sign_in_at: '2026-10-20T16:10:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000004',
    username: 'ma.hninyu',
    full_name: 'Ma Hnin Yu',
    email: 'susp.user@kbzlife.com',
    role: 'user',
    account_status: 'suspended',
    employee_id: 'KBZ-OPS-330',
    department: 'Branch Operations (Yangon South)',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    must_change_password: false,
    created_at: '2026-04-12T13:45:00Z',
    updated_at: '2026-10-15T09:20:00Z',
    last_sign_in_at: '2026-10-14T11:30:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000005',
    username: 'kyaw.zin',
    full_name: 'U Kyaw Zin Lat',
    email: 'kyaw.zin@kbzlife.com',
    role: 'user',
    account_status: 'active',
    employee_id: 'KBZ-BAN-012',
    department: 'Bancassurance Channel Headquarters',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    must_change_password: false,
    created_at: '2026-05-20T10:00:00Z',
    updated_at: '2026-10-17T11:00:00Z',
    last_sign_in_at: '2026-10-20T14:15:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000006',
    username: 'mg.phyowai',
    full_name: 'Mg Phyo Wai',
    email: 'phyo.wai@kbzlife.com',
    role: 'user',
    account_status: 'pending',
    employee_id: 'KBZ-REG-501',
    department: 'Retail Agency Distribution (Naypyitaw)',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    must_change_password: false,
    created_at: '2026-10-20T19:30:00Z',
    updated_at: '2026-10-20T19:30:00Z',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000007',
    username: 'daw.ayemaw',
    full_name: 'Daw Aye Aye Maw',
    email: 'aye.maw@kbzlife.com',
    role: 'user',
    account_status: 'rejected',
    employee_id: 'KBZ-REG-502',
    department: 'External Affiliate Contractor',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    must_change_password: false,
    created_at: '2026-10-19T14:20:00Z',
    updated_at: '2026-10-20T08:15:00Z',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'KBZLife Foundation: Underwriting & Risk Analysis',
    description:
      'Master the core life underwriting guidelines, standard and substandard medical classifications, financial underwriting thresholds, and ethical appraisal rules for KBZLife Insurance.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    category: 'Underwriting & Actuarial',
    published: true,
    duration_hours: 6.0,
    modules_count: 8,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-10T10:00:00Z',
    learning_outcomes: [
      'Interpret KBZLife standard medical and non-medical underwriting limits',
      'Accurately calculate financial insurance capacity and anti-selection risks',
      'Handle substandard health loading and policy exclusion endorsements',
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'AML/CFT & Regulatory Compliance 2026',
    description:
      'Mandatory annual regulatory certification covering Anti-Money Laundering, Counter-Financing of Terrorism, and Central Bank & IBRB supervisory directives.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    category: 'Compliance & Ethics',
    published: true,
    duration_hours: 4.0,
    modules_count: 5,
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-10-12T10:00:00Z',
    learning_outcomes: [
      'Execute robust Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD)',
      'Detect red flags in single-premium policies and large cash transactions',
      'Submit Suspicious Transaction Reports (STR) through approved institutional channels',
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Customer Consultation & Advisory Mastery',
    description:
      'Professional life advisory curriculum focused on empathetic consultative dialogues, family protection needs analysis, and trustworthy claim advisory.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    category: 'Advisory & Customer Care',
    published: true,
    duration_hours: 5.0,
    modules_count: 6,
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-10-15T10:00:00Z',
    learning_outcomes: [
      'Conduct holistic family protection and education savings needs audits',
      'Articulate policy benefits and exclusions in transparent Myanmar language',
      'Provide compassionate, efficient support during beneficiary claims processing',
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Group Life & Corporate Welfare Solutions',
    description:
      'Structuring comprehensive group term life, executive health riders, and corporate employee welfare schemes for institutional clients across Myanmar.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    category: 'Corporate Solutions',
    published: true,
    duration_hours: 3.5,
    modules_count: 4,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
    learning_outcomes: [
      'Design tailored group life proposals for corporate and NGO workforces',
      'Calculate group risk mortality pooling and claims retention limits',
      'Manage annual policy renewal audits and employee roster adjustments',
    ],
  },
];

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Bancassurance Channel Mastery',
    description:
      'Dedicated learning stream for KBZ Bank branch relationship executives, bancassurance specialists, and customer-facing advisors.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    published: true,
    order_index: 1,
    tags: ['Bancassurance', 'KBZ Bank Branch', 'Customer Consultation'],
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-10-12T10:00:00Z',
    key_highlights: [
      'In-branch ethical presentation guidelines',
      'Seamless digital enrollment via bank partner terminals',
      'Immediate referral escalation and advisor synchronization',
    ],
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    course_id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Alliance Channel Growth & Partner Ethics',
    description:
      'Specialized curriculum for licensed agency leaders, regional business associates, and independent life protection consultants.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
    published: true,
    order_index: 2,
    tags: ['Alliance Channel', 'Agency Leadership', 'Advisor Honor Code'],
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-10-14T10:00:00Z',
    key_highlights: [
      'Agency team coaching and ethical recruitment',
      'Regional community outreach workshops',
      'Long-term client relationship governance and retention',
    ],
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    course_id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Corporate Channel & Key Account Governance',
    description:
      'Advanced executive briefings for enterprise sales managers handling enterprise conglomerates, manufacturing plants, and financial institutions.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    published: true,
    order_index: 3,
    tags: ['Corporate Channel', 'Group Life', 'Key Accounts'],
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-10-16T10:00:00Z',
    key_highlights: [
      'Corporate tendering and customized benefit design',
      'Executive service level agreements (SLAs)',
      'Enterprise group claims turnaround benchmarks',
    ],
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    course_id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Compliance & Ethics Briefing Channel',
    description:
      'Weekly micro-briefings from KBZLife legal counsel covering updated sanctions, AML typologies, and data confidentiality.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    published: true,
    order_index: 4,
    tags: ['Regulatory Briefings', 'Ethics Case Studies', 'Legal Notices'],
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
    key_highlights: [
      'Real-world insurance fraud case studies',
      'Confidential whistleblowing channels and protections',
      'Quarterly compliance assessment milestones',
    ],
  },
];

export const INITIAL_NEWS: CompanyNewsArticle[] = [
  {
    id: 'n0000000-0000-0000-0000-000000000001',
    title: 'KBZLife Launches Enhanced Internal Learning Portal for Nationwide Operations',
    summary:
      'A state-of-the-art centralized knowledge portal goes live today, uniting employee learning across life underwriting, customer consultation, and compliance.',
    content: [
      'Yangon, Myanmar — KBZLife Insurance has officially introduced the first phase of its internal Employee Learning Portal. This digital ecosystem provides streamlined access to corporate orientation, policy guidelines, actuarial foundations, and executive leadership directives.',
      'Designed to elevate professional mastery across all branches, the portal serves as the single source of truth for organizational culture, product intelligence, and professional ethics.',
      'In his leadership address, the CEO underscored that continuous daily learning and proactive mindset transformation remain the cornerstone of delivering empathetic, reliable life protection to families throughout Myanmar.',
    ],
    cover_image_url:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    category: 'Corporate Milestone',
    status: 'published',
    is_featured: true,
    author_name: 'Internal Communications Desk',
    read_time_minutes: 3,
    published_at: '2026-10-20T08:00:00Z',
    created_at: '2026-10-20T08:00:00Z',
    updated_at: '2026-10-20T08:00:00Z',
  },
  {
    id: 'n0000000-0000-0000-0000-000000000002',
    title: 'Customer First Initiative: Accelerating Claims Settlement and Empathy Standards',
    summary:
      'KBZLife reinforces claims turnaround commitments, empowering branch relationship managers with responsive digital processing.',
    content: [
      'As part of KBZLife’s strategic aspirations for national service excellence, our operational governance council has updated underwriting and claims response protocols.',
      'Employees across regional centers will undergo dedicated refresher workshops this quarter focusing on empathetic claimant communication and accelerated document validation.',
    ],
    cover_image_url:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    category: 'Operations',
    status: 'published',
    is_featured: false,
    author_name: 'Claims Governance Council',
    read_time_minutes: 2,
    published_at: '2026-10-18T10:00:00Z',
    created_at: '2026-10-18T10:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
  },
  {
    id: 'n0000000-0000-0000-0000-000000000003',
    title: 'Bancassurance & Alliance Channel Partnership Expansion for Q4 2026',
    summary:
      'Strengthening synergy between KBZ Bank branch networks and certified life advisors to bring accessible term life plans to rural and urban communities.',
    content: [
      'KBZLife announces an expanded joint enablement initiative with KBZ Bank branch relationship teams. Under this framework, customer advisory kiosks and digital quotation tools will be deployed across 120 key branch hubs.',
      'Branch personnel will complete accredited product certifications on whole life, endowment, and critical illness riders before year-end.',
    ],
    cover_image_url:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
    category: 'Channel Growth',
    status: 'published',
    is_featured: false,
    author_name: 'Partnership Steering Committee',
    read_time_minutes: 4,
    published_at: '2026-10-15T09:30:00Z',
    created_at: '2026-10-15T09:30:00Z',
    updated_at: '2026-10-15T09:30:00Z',
  },
];

export const INITIAL_VIDEOS: CompanyVideoItem[] = [
  {
    id: 'v0000000-0000-0000-0000-000000000001',
    title: 'CEO Address: Strategic Vision and Mindset for Life Protection in Myanmar',
    description:
      'Executive briefing delivered by the CEO on corporate values, digital transformation, and our daily commitment to policyholders and families.',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    category: 'Leadership Address',
    display_order: 1,
    duration: '03:32',
    status: 'published',
    published_at: '2026-10-15T10:00:00Z',
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000002',
    title: 'Underwriting Protocols & Medical Risk Assessment Fundamentals (Vimeo Broadcast)',
    description:
      'Chief Underwriter provides step-by-step guidance on standard proposal appraisal, medical questionnaire validation, and anti-selection prevention.',
    video_url: 'https://vimeo.com/76979871',
    thumbnail_url:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    category: 'Training & Ethics',
    display_order: 2,
    duration: '09:55',
    status: 'published',
    published_at: '2026-10-12T11:00:00Z',
    created_at: '2026-10-12T11:00:00Z',
    updated_at: '2026-10-12T11:00:00Z',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000003',
    title: 'Customer First & Empathy Standards (Direct Video Stream)',
    description:
      'High-definition corporate documentary demonstration demonstrating internal customer care and claims assistance standards.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url:
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    category: 'Operational Updates',
    display_order: 3,
    duration: '09:56',
    status: 'published',
    published_at: '2026-10-08T09:00:00Z',
    created_at: '2026-10-08T09:00:00Z',
    updated_at: '2026-10-08T09:00:00Z',
  },
];

export const INITIAL_TOP_PERFORMERS: TopPerformerEntry[] = [
  {
    id: 'tp000000-0000-0000-0000-000000000001',
    employee_name: 'Daw May Thu Khaing',
    employee_title: 'Senior Agency Leader',
    department: 'Mandalay Central Agency',
    channel: 'Alliance Channel',
    achievement_title: 'Top Life Advisor — Highest Policy Retention Rate',
    achievement_description:
      'Achieved a 98.4% persistency rate while onboarding 140 new family protection policies across upper Myanmar.',
    image_url:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    recognition_period: 'January 2026',
    month_index: 1,
    ranking: 1,
    award_date: '2026-01-31',
    status: 'published',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'tp000000-0000-0000-0000-000000000002',
    employee_name: 'U Kyaw Zin Lat',
    employee_title: 'Bancassurance Branch Executive',
    department: 'KBZ Bank Kyauktada Branch',
    channel: 'Bancassurance Channel',
    achievement_title: 'Top Bank Branch Production & Customer Satisfaction',
    achievement_description:
      'Surpassed annual endowment protection targets by 135% through transparent customer consultation.',
    image_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    recognition_period: 'January 2026',
    month_index: 1,
    ranking: 1,
    award_date: '2026-01-31',
    status: 'published',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'tp000000-0000-0000-0000-000000000003',
    employee_name: 'Daw Khin Sandar',
    employee_title: 'Corporate Account Manager',
    department: 'Headquarters Enterprise Risk Group',
    channel: 'Corporate Channel',
    achievement_title: 'Largest Group Life Onboarding',
    achievement_description:
      'Structured group life and medical rider coverage for a 3,200-employee manufacturing conglomerate.',
    image_url:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    recognition_period: 'January 2026',
    month_index: 1,
    ranking: 1,
    award_date: '2026-01-31',
    status: 'published',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'tp000000-0000-0000-0000-000000000004',
    employee_name: 'Ko Thet Naing Oo',
    employee_title: 'Senior Field Consultant',
    department: 'Taunggyi Regional Center',
    channel: 'Alliance Channel',
    achievement_title: 'Outstanding Regional Outreach & Family Protection',
    achievement_description:
      'Delivered educational life protection seminars across Shan State, protecting 110 farming households.',
    image_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    recognition_period: 'February 2026',
    month_index: 2,
    ranking: 1,
    award_date: '2026-02-28',
    status: 'published',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
];

export const INITIAL_ENROLLMENTS: CourseEnrollment[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    user_id: 'u0000000-0000-0000-0000-000000000002', // Daw Thida
    course_id: 'c0000000-0000-0000-0000-000000000001', // Foundation Underwriting
    status: 'enrolled',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-09-01T10:00:00Z',
    expires_at: '2027-09-01T10:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    user_id: 'u0000000-0000-0000-0000-000000000002', // Daw Thida
    course_id: 'c0000000-0000-0000-0000-000000000002', // AML/CFT
    status: 'enrolled',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    user_id: 'u0000000-0000-0000-0000-000000000003', // Ko Zaw Min
    course_id: 'c0000000-0000-0000-0000-000000000003', // Customer Consultation
    status: 'enrolled',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-09-10T11:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    user_id: 'u0000000-0000-0000-0000-000000000004', // Ma Hnin Yu (suspended)
    course_id: 'c0000000-0000-0000-0000-000000000001',
    status: 'enrolled',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-08-01T10:00:00Z',
    restriction_note: 'Under administrative review for compliance verification',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    user_id: 'u0000000-0000-0000-0000-000000000005', // U Kyaw Zin Lat
    course_id: 'c0000000-0000-0000-0000-000000000004', // Corporate Welfare
    status: 'enrolled',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-09-15T10:00:00Z',
  },
];

export const INITIAL_CHANNEL_ACCESS: ChannelAccess[] = [
  {
    id: 'ca000000-0000-0000-0000-000000000001',
    user_id: 'u0000000-0000-0000-0000-000000000002', // Daw Thida
    channel_id: 'a0000000-0000-0000-0000-000000000001', // Bancassurance
    status: 'granted',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ca000000-0000-0000-0000-000000000002',
    user_id: 'u0000000-0000-0000-0000-000000000002', // Daw Thida
    channel_id: 'a0000000-0000-0000-0000-000000000004', // Compliance Briefing
    status: 'granted',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ca000000-0000-0000-0000-000000000003',
    user_id: 'u0000000-0000-0000-0000-000000000003', // Ko Zaw Min
    channel_id: 'a0000000-0000-0000-0000-000000000002', // Alliance Channel
    status: 'granted',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-09-10T11:00:00Z',
  },
  {
    id: 'ca000000-0000-0000-0000-000000000004',
    user_id: 'u0000000-0000-0000-0000-000000000005', // U Kyaw Zin Lat
    channel_id: 'a0000000-0000-0000-0000-000000000003', // Corporate Channel
    status: 'granted',
    assigned_by: 'u0000000-0000-0000-0000-000000000001',
    assigned_at: '2026-09-15T10:00:00Z',
  },
];

export const INITIAL_PROGRESS: LearningProgress[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    user_id: 'u0000000-0000-0000-0000-000000000002', // Daw Thida
    course_id: 'c0000000-0000-0000-0000-000000000001',
    progress_percentage: 65,
    completion_status: 'in_progress',
    last_accessed_at: '2026-10-20T17:30:00Z',
    updated_at: '2026-10-20T17:30:00Z',
    completed_modules: [
      'Module 1: Principles of Risk',
      'Module 2: Medical Underwriting Tables',
      'Module 3: Financial Capacity Assessment',
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    user_id: 'u0000000-0000-0000-0000-000000000002', // Daw Thida
    course_id: 'c0000000-0000-0000-0000-000000000002',
    progress_percentage: 100,
    completion_status: 'completed',
    last_accessed_at: '2026-10-18T14:00:00Z',
    updated_at: '2026-10-18T14:00:00Z',
    completed_modules: [
      'Module 1: AML Foundations',
      'Module 2: CDD Protocols',
      'Module 3: Reporting Suspicious Flows',
      'Module 4: Final Certification Exam',
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000003',
    user_id: 'u0000000-0000-0000-0000-000000000003', // Ko Zaw Min
    course_id: 'c0000000-0000-0000-0000-000000000003',
    progress_percentage: 30,
    completion_status: 'in_progress',
    last_accessed_at: '2026-10-19T08:15:00Z',
    updated_at: '2026-10-19T08:15:00Z',
    completed_modules: [
      'Module 1: Client Consultation Fundamentals',
      'Module 2: Family Protection Needs Analysis',
    ],
  },
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'l0000000-0000-0000-0000-000000000001',
    admin_user_id: 'u0000000-0000-0000-0000-000000000001',
    admin_name: 'U Aung Thu',
    target_user_id: 'u0000000-0000-0000-0000-000000000004',
    target_user_name: 'Ma Hnin Yu',
    action: 'user_status_changed',
    entity_type: 'user',
    entity_id: 'u0000000-0000-0000-0000-000000000004',
    details: 'Account status set to suspended pending annual AML compliance re-certification.',
    created_at: '2026-10-15T09:20:00Z',
  },
  {
    id: 'l0000000-0000-0000-0000-000000000002',
    admin_user_id: 'u0000000-0000-0000-0000-000000000001',
    admin_name: 'U Aung Thu',
    target_user_id: 'u0000000-0000-0000-0000-000000000002',
    target_user_name: 'Daw Thida',
    action: 'course_assigned',
    entity_type: 'course',
    entity_id: 'c0000000-0000-0000-0000-000000000001',
    details: 'Assigned course "KBZLife Foundation: Underwriting & Risk Analysis" with 1-year validity.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'l0000000-0000-0000-0000-000000000003',
    admin_user_id: 'u0000000-0000-0000-0000-000000000001',
    admin_name: 'U Aung Thu',
    target_user_id: 'u0000000-0000-0000-0000-000000000002',
    target_user_name: 'Daw Thida',
    action: 'channel_granted',
    entity_type: 'channel',
    entity_id: 'a0000000-0000-0000-0000-000000000001',
    details: 'Granted access to "Bancassurance Channel Mastery" stream.',
    created_at: '2026-09-01T10:05:00Z',
  },
  {
    id: 'l0000000-0000-0000-0000-000000000004',
    admin_user_id: 'u0000000-0000-0000-0000-000000000001',
    admin_name: 'U Aung Thu',
    target_user_id: 'u0000000-0000-0000-0000-000000000003',
    target_user_name: 'Ko Zaw Min',
    action: 'course_assigned',
    entity_type: 'course',
    entity_id: 'c0000000-0000-0000-0000-000000000003',
    details: 'Assigned "Customer Consultation & Advisory Mastery" for regional agency rollout.',
    created_at: '2026-09-10T11:00:00Z',
  },
];

export const INITIAL_EMAIL_LOGS: EmailLogEntry[] = [
  {
    id: 'eml_001',
    recipient: 'daw.thida@kbzlife.com',
    subject: 'Welcome to KBZLife Employee Learning Portal',
    template: 'user_invitation',
    status: 'sent',
    created_at: '2026-02-01T09:30:00Z',
  },
  {
    id: 'eml_002',
    recipient: 'ko.zawmin@kbzlife.com',
    subject: 'Welcome to KBZLife Employee Learning Portal',
    template: 'user_invitation',
    status: 'sent',
    created_at: '2026-03-10T11:15:00Z',
  },
];

export const INITIAL_HOD_MOTTO: HodMotto = {
  id: 'hod_motto_001',
  motto_text: "“Learning is not a one-time milestone; it is our ongoing commitment to professional excellence. In the Learning and Development Hub, our mission is to empower every KBZLife employee with the knowledge, modern skills, and unwavering ethics needed to protect Myanmar families with utmost trust and capability.”",
  hod_name: 'Daw Khin Thida',
  hod_title: 'Head of Learning & Development, KBZLife Insurance',
  photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  statement_context: 'Leadership statement for all KBZLife operational and advisory employees nationwide.',
  is_published: true,
  updated_at: '2026-10-21T09:00:00Z',
};

export const INITIAL_TEAM_MEMBERS: LdTeamMember[] = [
  // 9 Core Team Members
  {
    id: 'tm_001',
    full_name: 'Daw Khin Thida',
    position: 'Head of Learning & Development',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    display_order: 1,
    is_published: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'tm_002',
    full_name: 'U Min Htet Aung',
    position: 'Senior L&D Manager (Curriculum & Methodology)',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    display_order: 2,
    is_published: true,
    created_at: '2026-01-12T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'tm_003',
    full_name: 'Daw Su Myat Noe',
    position: 'Assistant Manager, Agency Training & Sales Enablement',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    display_order: 3,
    is_published: true,
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'tm_004',
    full_name: 'U Zin Min Oo',
    position: 'Lead Technical Trainer, Bancassurance Systems',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    display_order: 4,
    is_published: true,
    created_at: '2026-02-15T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'tm_005',
    full_name: 'Daw Aye Aye Maw',
    position: 'Senior Instructional Designer & Multimedia Lead',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    display_order: 5,
    is_published: true,
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'tm_006',
    full_name: 'U Kyaw Swar Lin',
    position: 'Corporate Leadership & Management Development Specialist',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    display_order: 6,
    is_published: true,
    created_at: '2026-03-10T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'tm_007',
    full_name: 'Daw Phyu Phyu Thin',
    position: 'LMS Digital Systems Administrator & Analytics Lead',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    display_order: 7,
    is_published: true,
    created_at: '2026-03-15T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'tm_008',
    full_name: 'U Thet Naing Soe',
    position: 'Underwriting & Actuarial Foundations Trainer',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    display_order: 8,
    is_published: true,
    created_at: '2026-04-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'tm_009',
    full_name: 'Daw May Thet Khine',
    position: 'Talent Onboarding & Employee Experience Specialist',
    department: 'Learning & Development',
    member_type: 'team_member',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    display_order: 9,
    is_published: true,
    created_at: '2026-04-15T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },

  // 5 Interns
  {
    id: 'int_001',
    full_name: 'Ma Thiri May',
    position: 'Multimedia & Digital Content Design Intern',
    department: 'Learning & Development',
    member_type: 'intern',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    display_order: 10,
    is_published: true,
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'int_002',
    full_name: 'Ko Kaung Sithu',
    position: 'LMS Operations & Technical Support Intern',
    department: 'Learning & Development',
    member_type: 'intern',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    display_order: 11,
    is_published: true,
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'int_003',
    full_name: 'Ma Eaint Poe',
    position: 'Training Logistics & Workshop Coordination Intern',
    department: 'Learning & Development',
    member_type: 'intern',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    display_order: 12,
    is_published: true,
    created_at: '2026-06-15T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'int_004',
    full_name: 'Ko Nay Lin Htet',
    position: 'Learner Analytics & Survey Assessment Intern',
    department: 'Learning & Development',
    member_type: 'intern',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    display_order: 13,
    is_published: true,
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'int_005',
    full_name: 'Ma Hnin Pwint',
    position: 'Employee Engagement & Learning Materials Intern',
    department: 'Learning & Development',
    member_type: 'intern',
    photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    display_order: 14,
    is_published: true,
    created_at: '2026-07-15T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
];

export const INITIAL_LICENSE_CHAPTERS: LicenseChapter[] = [
  {
    id: 'lic_ch_001',
    chapter_number: 1,
    title: 'Chapter 1: Regulatory Foundations & Anti-Money Laundering',
    description: 'Master statutory licensing regulations under the Insurance Business Regulatory Board (IBRB), core advisor ethics, and compulsory Anti-Money Laundering (AML/CFT) frameworks.',
    passing_score: 80,
    display_order: 1,
    is_published: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-22T10:00:00Z',
  },
  {
    id: 'lic_ch_002',
    chapter_number: 2,
    title: 'Chapter 2: Underwriting Fundamentals & Fair Market Conduct',
    description: 'Learn field underwriting discipline, medical & financial hazard disclosure principles, policyholder rights, and transparency standards.',
    passing_score: 80,
    display_order: 2,
    is_published: true,
    created_at: '2026-08-15T08:00:00Z',
    updated_at: '2026-10-22T10:00:00Z',
  },
  {
    id: 'lic_ch_003',
    chapter_number: 3,
    title: 'Chapter 3: Bancassurance & Point-of-Sale Governance',
    description: 'Guidelines on co-branded banking distributions, suitability evaluation, client consent records, and ethical customer solicitation.',
    passing_score: 80,
    display_order: 3,
    is_published: true,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-10-22T10:00:00Z',
  },
];

export const INITIAL_LICENSE_LESSONS: LicenseTrainingLesson[] = [
  {
    id: 'lic_lesson_001',
    chapter_id: 'lic_ch_001',
    title: 'Myanmar Life Insurance Agent Licensing & Code of Conduct',
    description: 'Comprehensive regulatory foundation covering IBRB agent licensing requirements, ethical marketing protocols, and statutory compliance across Myanmar branches.',
    content_type: 'video',
    lesson_type: 'video',
    file_url: '/uploads/IBRB_Licensing_Agent_Code.mp4',
    file_name: 'IBRB_Licensing_Agent_Code.mp4',
    file_size_bytes: 700000,
    file_size_formatted: '683.0 KB',
    duration: '00:45',
    video_duration: '00:45',
    thumbnail_url: '/src/assets/images/license_compliance_training_1792658701433.jpg',
    category: 'Regulatory Accreditation',
    display_order: 1,
    status: 'published',
    is_published: true,
    created_at: '2026-08-10T09:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
  },
  {
    id: 'lic_lesson_002',
    chapter_id: 'lic_ch_001',
    title: 'Anti-Money Laundering (AML) & CFT Compliance Handbook',
    description: 'Mandatory annual AML compliance guidelines, red flag detection, Customer Due Diligence (CDD), and Suspicious Transaction Report (STR) documentation for licensed advisors.',
    content_type: 'pdf',
    lesson_type: 'pdf',
    file_url: '/uploads/KBZLife_AML_CFT_Compliance_2026.pdf',
    file_name: 'KBZLife_AML_CFT_Compliance_2026.pdf',
    file_size_bytes: 58198,
    file_size_formatted: '58.2 KB',
    thumbnail_url: '',
    category: 'Statutory Compliance',
    display_order: 2,
    status: 'published',
    is_published: true,
    created_at: '2026-08-15T11:00:00Z',
    updated_at: '2026-10-19T09:00:00Z',
  },
  {
    id: 'lic_lesson_003',
    chapter_id: 'lic_ch_002',
    title: 'Underwriting Fundamentals & Risk Selection for Agency Force',
    description: 'Essential field underwriting practices, medical questionnaire disclosures, financial underwriting limits, and moral hazard verification.',
    content_type: 'video',
    lesson_type: 'video',
    file_url: '/uploads/Digital_Cloud_Workflows.mp4',
    file_name: 'Digital_Cloud_Workflows.mp4',
    file_size_bytes: 65400000,
    file_size_formatted: '65.4 MB',
    duration: '22:10',
    video_duration: '22:10',
    thumbnail_url: '/src/assets/images/underwriting_risk_training_1792658701585.jpg',
    category: 'Underwriting Certification',
    display_order: 3,
    status: 'published',
    is_published: true,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  },
  {
    id: 'lic_lesson_004',
    chapter_id: 'lic_ch_002',
    title: 'Fair Market Conduct & Beneficiary Rights Protection Manual',
    description: 'Detailed operating procedures on policyholder privacy, transparent product illustration disclosures, and swift claims facilitation standards.',
    content_type: 'pdf',
    lesson_type: 'pdf',
    file_url: '/uploads/Fair_Market_Conduct_Manual.pdf',
    file_name: 'Fair_Market_Conduct_Manual.pdf',
    file_size_bytes: 58198,
    file_size_formatted: '58.2 KB',
    thumbnail_url: '',
    category: 'Policyholder Protection',
    display_order: 4,
    status: 'published',
    is_published: true,
    created_at: '2026-09-15T08:30:00Z',
    updated_at: '2026-10-20T14:00:00Z',
  },
  {
    id: 'lic_lesson_005',
    chapter_id: 'lic_ch_003',
    title: 'Bancassurance Point-of-Sale Disclosure Directives (Draft)',
    description: 'Internal procedural preview for in-branch bank executives on co-branded endowment disclosures and customer suitability tests.',
    content_type: 'video',
    lesson_type: 'video',
    file_url: '/uploads/English_Insurance_Advisory.mp4',
    file_name: 'English_Insurance_Advisory.mp4',
    file_size_bytes: 32000000,
    file_size_formatted: '32.0 MB',
    duration: '15:30',
    video_duration: '15:30',
    thumbnail_url: '/src/assets/images/license_compliance_training_1792658701433.jpg',
    category: 'Bancassurance Compliance',
    display_order: 5,
    status: 'draft',
    is_published: false,
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-21T09:00:00Z',
  },
];

export const INITIAL_SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'sk_cat_001',
    name: 'Business English',
    description: 'Professional terminology, client consultation dialogue, and formal correspondence.',
    display_order: 1,
    is_published: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'sk_cat_002',
    name: 'Excel & Data Analytics',
    description: 'Financial modeling, automated reporting, formulas, and policy analytics dashboards.',
    display_order: 2,
    is_published: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'sk_cat_003',
    name: 'Leadership & Management',
    description: 'Team coaching, emotional intelligence, and frontline operational leadership.',
    display_order: 3,
    is_published: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'sk_cat_004',
    name: 'Technology & Digital Tools',
    description: 'Cloud collaboration suites, digital signatures, and paperless branch workflows.',
    display_order: 4,
    is_published: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
];

export const INITIAL_SKILL_RESOURCES: SkillDevelopmentResource[] = [
  {
    id: 'sk_res_001',
    title: 'English for Insurance Professionals: Client Advisory & Presentation',
    description: 'Essential business English vocabulary, empathetic email writing, and professional consultative terminology for modern insurance advisors.',
    category_id: 'sk_cat_001',
    category: 'Business English',
    topic: 'Business English',
    content_type: 'video',
    file_url: '/uploads/English_Insurance_Advisory.mp4',
    content_url: '/uploads/English_Insurance_Advisory.mp4',
    file_name: 'English_Insurance_Advisory.mp4',
    file_size_bytes: 655347,
    file_size_formatted: '640.0 KB',
    duration: '00:45',
    video_duration: '00:45',
    thumbnail_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    instructor_name: 'Daw Eleanor Pena',
    instructor_role: 'Corporate Language Specialist',
    instructor_title: 'Corporate Language Specialist',
    instructor_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    lesson_count: 16,
    display_order: 1,
    status: 'published',
    is_published: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-18T12:00:00Z',
  },
  {
    id: 'sk_res_002',
    title: 'Excel Mastery: Financial Modeling & Actuarial Reporting',
    description: 'Master advanced formulas (XLOOKUP, INDEX/MATCH), dynamic Pivot Tables, and automated dashboard reporting for policy portfolio analytics.',
    category_id: 'sk_cat_002',
    category: 'Excel & Data Analytics',
    topic: 'Excel & Data Analytics',
    content_type: 'video',
    file_url: '/uploads/Excel_Financial_Modeling.mp4',
    content_url: '/uploads/Excel_Financial_Modeling.mp4',
    file_name: 'Excel_Financial_Modeling.mp4',
    file_size_bytes: 683100,
    file_size_formatted: '667.0 KB',
    duration: '00:45',
    video_duration: '00:45',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    instructor_name: 'U Dianne Russell',
    instructor_role: 'Financial Analytics Lead',
    instructor_title: 'Financial Analytics Lead',
    instructor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    lesson_count: 24,
    display_order: 2,
    status: 'published',
    is_published: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-10-19T14:00:00Z',
  },
  {
    id: 'sk_res_003',
    title: 'Excel Advanced Formulas & Automation Handbook',
    description: 'Comprehensive quick-reference manual featuring automated macro scripts, conditional formatting blueprints, and validation rules for branch managers.',
    category_id: 'sk_cat_002',
    category: 'Excel & Data Analytics',
    topic: 'Excel & Data Analytics',
    content_type: 'pdf',
    content_url: '/uploads/KBZLife_Excel_Automation_Handbook.pdf',
    file_url: '/uploads/KBZLife_Excel_Automation_Handbook.pdf',
    file_name: 'KBZLife_Excel_Automation_Handbook.pdf',
    file_size_bytes: 58198,
    file_size_formatted: '58.2 KB',
    thumbnail_url: '',
    instructor_name: 'U Min Htet Aung',
    instructor_role: 'Senior L&D Manager',
    instructor_title: 'Senior L&D Manager',
    instructor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    lesson_count: 8,
    display_order: 3,
    status: 'published',
    is_published: true,
    created_at: '2026-08-20T11:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'sk_res_004',
    title: 'Everyday Business English for Frontline Branch Service',
    description: 'Practical customer interaction dialogs, objection handling phrases, and polite formal correspondence guides for customer care advisors.',
    category_id: 'sk_cat_001',
    category: 'Business English',
    topic: 'Business English',
    content_type: 'pdf',
    content_url: '/uploads/Everyday_Business_English_Frontline.pdf',
    file_url: '/uploads/Everyday_Business_English_Frontline.pdf',
    file_name: 'Everyday_Business_English_Frontline.pdf',
    file_size_bytes: 58198,
    file_size_formatted: '58.2 KB',
    thumbnail_url: '',
    instructor_name: 'Daw Su Myat Noe',
    instructor_role: 'Sales Enablement Specialist',
    instructor_title: 'Sales Enablement Specialist',
    instructor_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    lesson_count: 12,
    display_order: 4,
    status: 'published',
    is_published: true,
    created_at: '2026-09-05T09:00:00Z',
    updated_at: '2026-10-21T08:00:00Z',
  },
  {
    id: 'sk_res_005',
    title: 'Leading Teams: Developing High-Performance Insurance Leaders',
    description: 'External leadership briefing focusing on team coaching, emotional intelligence in underwriting, and building psychological safety in high-stress sales environments.',
    category_id: 'sk_cat_003',
    category: 'Leadership & Management',
    topic: 'Leadership & Management',
    content_type: 'link',
    external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    instructor_name: 'Guy Hawkins',
    instructor_role: 'HR & Talent Governance Director',
    instructor_title: 'HR & Talent Governance Director',
    instructor_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    lesson_count: 38,
    display_order: 5,
    status: 'published',
    is_published: true,
    created_at: '2026-09-12T13:00:00Z',
    updated_at: '2026-10-21T11:00:00Z',
  },
  {
    id: 'sk_res_006',
    title: 'Digital Systems & Cloud Collaboration for Insurance Operations',
    description: 'Hands-on workflow tutorial on modern cloud suites, secure document processing, digital signatures, and paperless policy issuance.',
    category_id: 'sk_cat_004',
    category: 'Technology & Digital Tools',
    topic: 'Technology & Digital Tools',
    content_type: 'video',
    file_url: '/uploads/Digital_Cloud_Workflows.mp4',
    content_url: '/uploads/Digital_Cloud_Workflows.mp4',
    file_name: 'Digital_Cloud_Workflows.mp4',
    file_size_bytes: 683100,
    file_size_formatted: '667.0 KB',
    duration: '00:45',
    video_duration: '00:45',
    thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    instructor_name: 'U Zin Min Oo',
    instructor_role: 'Lead Systems Trainer',
    instructor_title: 'Lead Systems Trainer',
    instructor_avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80',
    lesson_count: 10,
    display_order: 6,
    status: 'published',
    is_published: true,
    created_at: '2026-09-25T14:30:00Z',
    updated_at: '2026-10-21T15:00:00Z',
  },
];

export const INITIAL_LICENSE_QUIZZES: LicenseQuiz[] = [
  {
    id: 'quiz_lic_001',
    chapter_id: 'lic_ch_001',
    lesson_id: 'lic_lesson_001',
    title: 'Chapter 1: Licensing Regulations & AML Assessment',
    description: 'Verify your comprehension of IBRB statutory guidelines, anti-rebating laws, agent duties, and ethical disclosure standards.',
    passing_score: 80,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-10-22T10:00:00Z',
    questions: [
      {
        id: 'q_001_1',
        quiz_id: 'quiz_lic_001',
        question_text: 'Under the Myanmar Insurance Business Regulatory Board (IBRB) framework, what is the mandatory renewal cycle for life insurance agent licenses?',
        options: [
          'Every 6 calendar months',
          'Annually (every 1 year) with verified CPD hours',
          'Every 3 years upon branch manager endorsement',
          'Permanent certification with no renewal needed'
        ],
        correct_option_index: 1,
        explanation: 'Under IBRB regulatory directives, licensed life insurance agents in Myanmar must renew their certification annually along with verified Continuing Professional Development (CPD) hours.',
        display_order: 1
      },
      {
        id: 'q_001_2',
        quiz_id: 'quiz_lic_001',
        question_text: 'What fundamental legal and ethical principle governs all agent interactions and disclosures with prospective policyholders?',
        options: [
          'Caveat Emptor (Buyer Beware)',
          'Utmost Good Faith (Uberrimae Fidei) and full disclosure of all material facts',
          'Maximum Quota Attainment priority',
          'Discretionary premium discount flexibility'
        ],
        correct_option_index: 1,
        explanation: 'The doctrine of Uberrimae Fidei (Utmost Good Faith) requires both insurer and agent to disclose all material facts transparently without misrepresentation or concealment.',
        display_order: 2
      },
      {
        id: 'q_001_3',
        quiz_id: 'quiz_lic_001',
        question_text: 'Which practice is strictly prohibited under the KBZLife Code of Conduct regarding customer premium settlements?',
        options: [
          'Issuing instant computerized receipts through corporate channels',
          'Accepting customer premium payments into an agent’s personal bank or mobile money account',
          'Guiding clients to direct bank transfer and official digital payment gateways',
          'Providing premium payment schedules during policy delivery'
        ],
        correct_option_index: 1,
        explanation: 'Under strict financial conduct rules, agents must never receive premium payments into personal bank accounts or personal wallets; funds must be remitted directly to official KBZLife accounts.',
        display_order: 3
      },
      {
        id: 'q_001_4',
        quiz_id: 'quiz_lic_001',
        question_text: 'If a prospective applicant discloses a history of medical conditions during the interview, what is the licensed agent’s statutory obligation?',
        options: [
          'Omit the disclosure to ensure instant policy issuance',
          'Record the complete medical history honestly on the proposal form for medical underwriter assessment',
          'Advise the applicant to wait one year before declaring',
          'Issue an instant binding endorsement on behalf of the company'
        ],
        correct_option_index: 1,
        explanation: 'An agent must record every material fact disclosed by the applicant to protect both the client and insurer against non-disclosure disputes during future claims.',
        display_order: 4
      },
      {
        id: 'q_001_5',
        quiz_id: 'quiz_lic_001',
        question_text: 'What constitutes illegal "rebating" under Myanmar insurance statutory regulations?',
        options: [
          'Providing official KBZLife policy document binders and informative brochures',
          'Returning part of the agent commission or offering cash kickbacks to induce a client to purchase',
          'Explaining loyalty terminal bonuses and annual dividend structures',
          'Assisting bereaved family members with claim documentation'
        ],
        correct_option_index: 1,
        explanation: 'Rebating—offering cash incentives, commission sharing, or unapproved discounts to induce policy purchases—is strictly illegal under Myanmar insurance regulations and leads to immediate license revocation.',
        display_order: 5
      }
    ]
  },
  {
    id: 'quiz_lic_003',
    chapter_id: 'lic_ch_002',
    lesson_id: 'lic_lesson_003',
    title: 'Chapter 2: Underwriting & Market Conduct Assessment',
    description: 'Test your understanding of primary field underwriting responsibilities, moral vs physical hazard differentiation, and insurable interest.',
    passing_score: 80,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-10-22T10:00:00Z',
    questions: [
      {
        id: 'q_003_1',
        quiz_id: 'quiz_lic_003',
        question_text: 'What is the primary role of an insurance advisor acting as a "field underwriter"?',
        options: [
          'Determining corporate investment yields and financial reserves',
          'Serving as the initial line of risk appraisal by observing facts, verifying identity, and gathering accurate client data at the point of sale',
          'Issuing policy contracts independently without head office underwriting approval',
          'Calculating mortality tables and actuarial rate books'
        ],
        correct_option_index: 1,
        explanation: 'Field underwriting empowers the advisor as the first point of contact to observe physical condition, lifestyle habits, and financial legitimacy before transmitting proposals to underwriters.',
        display_order: 1
      },
      {
        id: 'q_003_2',
        quiz_id: 'quiz_lic_003',
        question_text: 'Which scenario exemplifies a "moral hazard" in life insurance risk appraisal?',
        options: [
          'A client diagnosed with hypertension or hereditary heart condition',
          'A client working in high-voltage electrical grid maintenance',
          'An applicant who provides inconsistent income details, conceals heavy debt, and seeks excessive life coverage disproportionate to income',
          'An individual who participates in recreational weekend cycling'
        ],
        correct_option_index: 2,
        explanation: 'Moral hazard stems from character, honesty, or financial distress that creates motivation to falsify disclosures or profit inappropriately from life insurance coverage.',
        display_order: 2
      },
      {
        id: 'q_003_3',
        quiz_id: 'quiz_lic_003',
        question_text: 'How is "Insurable Interest" defined in life insurance law?',
        options: [
          'Any acquaintance who is willing to fund the premium installments',
          'A verifiable legal or financial relationship where the policy beneficiary suffers genuine economic loss upon the insured person’s demise',
          'Any member of the same social club or neighborhood group',
          'Mutual interest between colleagues in the same corporate department'
        ],
        correct_option_index: 1,
        explanation: 'Insurable interest requires a bona fide legal, familial, or economic dependence ensuring life insurance is purchased for legitimate protection rather than speculative gain.',
        display_order: 3
      },
      {
        id: 'q_003_4',
        quiz_id: 'quiz_lic_003',
        question_text: 'In financial underwriting, what guideline helps determine a reasonable sum assured for family income replacement?',
        options: [
          'A flat 500 million MMK limit for every individual regardless of income',
          'Human Life Value (HLV) multiple calculation based on age, current annual earned income, and years to retirement',
          'Sum of current bank checking account balances',
          'Double the purchase price of the client’s residential real estate'
        ],
        correct_option_index: 1,
        explanation: 'Underwriters employ Human Life Value (HLV) multiples (e.g., 10x–25x annual income depending on age bracket) to calculate appropriate and sustainable life insurance coverage.',
        display_order: 4
      },
      {
        id: 'q_003_5',
        quiz_id: 'quiz_lic_003',
        question_text: 'When a head-office underwriter requests an Attending Physician’s Statement (APS), what does this signify?',
        options: [
          'The application has been automatically rejected without appeal',
          'Specific clinical findings and medical history from treating physicians are required to assess and appropriately rate the risk',
          'The policy can be issued immediately without further paperwork',
          'The agent failed to obtain a national registration card (NRC)'
        ],
        correct_option_index: 1,
        explanation: 'An APS provides objective clinical insight regarding specific conditions, enabling the underwriting team to offer fair terms, standard rates, or specialized medical loadings.',
        display_order: 5
      }
    ]
  },
  {
    id: 'quiz_lic_005',
    chapter_id: 'lic_ch_003',
    lesson_id: 'lic_lesson_005',
    title: 'Chapter 3: Bancassurance & POS Governance Assessment',
    description: 'Ensure compliance with bank branch point-of-sale protocols, deposit vs insurance distinction, suitability checks, and cooling-off directives.',
    passing_score: 80,
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-22T10:00:00Z',
    questions: [
      {
        id: 'q_005_1',
        quiz_id: 'quiz_lic_005',
        question_text: 'What critical disclosure must every bank executive emphasize to customers when introducing bancassurance products?',
        options: [
          'That insurance policies are fixed term deposits insured by the central bank deposit scheme',
          'That bancassurance products are life insurance contracts underwritten by KBZLife and are distinct from bank deposit accounts',
          'That life insurance policies offer unlimited immediate ATM cash withdrawals',
          'That insurance premiums replace regular income tax obligations'
        ],
        correct_option_index: 1,
        explanation: 'Bancassurance regulatory directives require clear disclosure that insurance policies are long-term insurance contracts issued by KBZLife and are not bank deposit liabilities.',
        display_order: 1
      },
      {
        id: 'q_005_2',
        quiz_id: 'quiz_lic_005',
        question_text: 'What is the statutory purpose of the mandatory "Cooling-Off Period" in bancassurance policy issuance?',
        options: [
          'A waiting period before the bank approves loan applications',
          'A defined period (typically 14 to 21 days) allowing the policyholder to review policy terms and cancel with full refund of premiums paid less medical expenses',
          'The period when no policy benefits are payable in the first year',
          'The time taken by the bank to print policy booklets'
        ],
        correct_option_index: 1,
        explanation: 'The cooling-off period provides consumer protection by allowing policyholders to examine the actual policy contract and cancel for a full refund if the policy does not meet expectations.',
        display_order: 2
      },
      {
        id: 'q_005_3',
        quiz_id: 'quiz_lic_005',
        question_text: 'What is the requirement of the mandatory "Customer Suitability Assessment" at the bank branch?',
        options: [
          'Ensuring the customer deposits all savings into high-risk investment funds',
          'Verifying that the proposed insurance product matches the customer’s financial horizon, affordability, risk appetite, and genuine protection needs',
          'Requiring the customer to open an overdraft facility before applying',
          'Selling whatever product has the highest sales bonus of the month'
        ],
        correct_option_index: 1,
        explanation: 'Suitability guidelines require bank advisors to match products with customer needs, avoiding mis-selling and ensuring long-term premium affordability.',
        display_order: 3
      },
      {
        id: 'q_005_4',
        quiz_id: 'quiz_lic_005',
        question_text: 'How should projected non-guaranteed bonuses or dividend illustrations be presented to branch customers?',
        options: [
          'Stated as guaranteed annual interest returns identical to fixed deposit coupons',
          'Clearly presented with dual benchmark return scenarios, explicitly identifying non-guaranteed components and explaining market fluctuations',
          'Hidden in the fine print without oral explanation',
          'Guaranteed by the branch manager’s verbal commitment'
        ],
        correct_option_index: 1,
        explanation: 'Illustrations must transparently delineate guaranteed benefits from non-guaranteed projections and explain that past dividend history does not guarantee future results.',
        display_order: 4
      },
      {
        id: 'q_005_5',
        quiz_id: 'quiz_lic_005',
        question_text: 'When a bank customer expresses dissatisfaction or submits a formal grievance regarding a bancassurance product, what is the mandatory immediate action?',
        options: [
          'Advise the customer to abandon the policy without official paperwork',
          'Log the grievance into the integrated customer complaint tracking system within 24 hours and issue a formal tracking acknowledgment',
          'Instruct the customer to contact the insurance regulator directly without internal branch review',
          'Hold the complaint until the quarterly regional audit'
        ],
        correct_option_index: 1,
        explanation: 'Mandatory market conduct protocols demand prompt grievance registration within 24 hours with an official acknowledgment number and structured resolution tracking.',
        display_order: 5
      }
    ]
  }
];

// =====================================================================
// INITIAL PRODUCT KNOWLEDGE HUB ITEMS
// =====================================================================
export const INITIAL_PRODUCTS: ProductKnowledgeItem[] = [
  {
    id: 'prod_001',
    title: 'KBZLife Endowment Life Assurance',
    subtitle: 'Guaranteed Long-Term Savings & Comprehensive Financial Security',
    category: 'Individual Life',
    card_color_theme: 'amber',
    short_description: 'Combines disciplined capital accumulation with 100% guaranteed death benefit and annual reversionary bonuses.',
    description: 'The flagship KBZLife Endowment Life Assurance plan combines disciplined long-term capital accumulation with life protection. In the event of unfortunate death or total permanent disability during the policy term, the full sum assured plus accumulated bonuses are paid to designated beneficiaries. Upon surviving to maturity, the policyholder receives the maturity benefit plus guaranteed maturity bonuses.',
    image_url: '/assets/aistudio/photo_2026-10-23_13.31.37_001bb28e.jpeg',
    key_benefits: [
      '100% Guaranteed Sum Assured upon maturity or premature demise',
      'Compound annual reversionary bonuses added to portfolio value',
      'Total & Permanent Disability (TPD) rider coverage included',
      'Income tax relief up to statutory limits under Myanmar Revenue Code'
    ],
    key_features: [
      'Flexible Policy Terms: 10, 15, 20, or 25 years',
      'Payment options: Annual, Semi-Annual, Quarterly, or Monthly via KBZPay',
      'Guaranteed cash surrender value after 2 years of continuous premium payments',
      'Policy loan facility up to 85% of accrued surrender value'
    ],
    eligibility_criteria: 'Entry age: 18 to 60 years old (maximum maturity age: 70). Available to Myanmar citizens and foreign permanent residents.',
    coverage_details: 'Minimum Sum Assured: 5,000,000 MMK. Maximum Sum Assured: Subject to financial underwriting.',
    premium_terms: 'Payable via KBZPay, KBZ Bank mobile banking, or over-the-counter branch cash deposit.',
    target_audience: 'Parents saving for family milestones, young professionals building capital, and risk-averse savers.',
    additional_sections: [
      {
        id: 'sec_001_1',
        title: 'Maturity Settlement Process',
        content: 'Upon policy maturity, KBZLife sends an automated maturity notification 60 days in advance. The policyholder provides NRC copy and original policy bond at any KBZ branch for direct bank transfer within 5 business days.'
      }
    ],
    display_order: 1,
    status: 'published',
    is_published: true,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'prod_002',
    title: 'KBZLife Group Term Life & Employee Security',
    subtitle: 'Corporate Employee Health, Accidental Cover & Family Protection',
    category: 'Corporate & Group',
    card_color_theme: 'navy',
    short_description: 'Comprehensive 24/7 group life, accidental dismemberment, and disability coverage for corporate teams across Myanmar.',
    description: 'Tailored for corporate enterprises, MSMEs, and commercial institutions across Myanmar. Provides 24/7 worldwide term life, accidental death, dismemberment, and total disability protection for participating staff members, enhancing organizational talent retention and corporate duty of care.',
    image_url: '/assets/aistudio/photo_2026-10-22_13.01.51_74d38a12.jpeg',
    key_benefits: [
      'Substantial death benefit paid directly to employee designated family',
      'Double indemnity benefit for accidental fatalities during work or travel',
      'No individual medical examination required under free-cover limits',
      'Customizable salary-multiplier or flat sum assured schedules'
    ],
    key_features: [
      'Annual renewable contract terms with simplified employee roster updates',
      'Optional Critical Illness and Hospitalization cash allowance riders',
      'Dedicated corporate relationship manager and automated digital enrollment'
    ],
    eligibility_criteria: 'Active full-time employees aged 18 to 65. Minimum group size: 5 eligible employees.',
    coverage_details: 'Sum Assured ranges from 1x to 5x annual basic salary, or flat tier (e.g. 10,000,000 MMK to 50,000,000 MMK).',
    premium_terms: 'Paid annually by corporate employer via corporate bank transfer or direct debit.',
    target_audience: 'Enterprises, factories, NGOs, banking institutions, and growing technology firms in Myanmar.',
    additional_sections: [
      {
        id: 'sec_002_1',
        title: 'Simplified Group Claims Protocol',
        content: 'Corporate HR submits consolidated accident or demise reports with death certificate and police extract. Express claims settlement within 3 working days for non-contested cases.'
      }
    ],
    display_order: 2,
    status: 'published',
    is_published: true,
    created_at: '2026-08-05T09:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  },
  {
    id: 'prod_003',
    title: 'KBZLife Critical Illness & Comprehensive Medical Care',
    subtitle: 'Living Benefits Coverage for Major Dread Diseases & Treatments',
    category: 'Health & Medical',
    card_color_theme: 'emerald',
    short_description: 'Immediate lump-sum cash settlement upon critical illness diagnosis to protect household financial wellbeing.',
    description: 'Provides an immediate lump-sum cash payout upon diagnosis of any covered critical illness (including cancer, heart attack, stroke, kidney failure, and major organ transplant). Designed to alleviate costly medical treatment expenses, experimental procedures, and recuperation without depleting household savings.',
    image_url: '/assets/aistudio/photo_2026-10-22_14.03.31_8815d33e.jpeg',
    key_benefits: [
      '100% upfront lump-sum cash disbursement upon confirmed diagnosis',
      'Coverage for 36 major critical illnesses spanning early and late stages',
      'Daily hospitalization cash stipend up to 90 days per policy year',
      'Second medical opinion consultation access with regional specialists'
    ],
    key_features: [
      'Guaranteed renewable policy up to age 75',
      'Premium freeze guarantee: premiums remain fixed for 5-year intervals',
      'Survival period: only 14 days post-diagnosis for claim disbursement'
    ],
    eligibility_criteria: 'Entry age: 15 to 55 years old. Standard health declaration and medical evaluation.',
    coverage_details: 'Sum Assured from 10,000,000 MMK to 150,000,000 MMK.',
    premium_terms: 'Monthly or Annual payments via KBZPay or automated debit.',
    target_audience: 'Working adults, corporate executives, and breadwinners seeking healthcare cost protection.',
    display_order: 3,
    status: 'published',
    is_published: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-10-21T09:00:00Z',
  },
  {
    id: 'prod_004',
    title: 'KBZLife Education Booster Plan',
    subtitle: 'Guaranteed Higher Education & University Tuition Funding',
    category: 'Education',
    card_color_theme: 'indigo',
    short_description: 'Secures your child educational journey with scheduled payouts and automatic premium waiver upon parental demise.',
    description: 'Secures your child educational journey and graduation dreams regardless of unforeseen life events. Pays scheduled academic milestone cash payouts as your child reaches high school, matriculation, and university entry, with an automatic premium waiver if the policyholder passes away or suffers disability.',
    image_url: '/src/assets/images/underwriting_risk_training_1792658701585.jpg',
    key_benefits: [
      'Guaranteed annual education allowances during university years',
      'Full waiver of future premiums if the breadwinner passes away or suffers TPD',
      'Immediate family support allowance paid upon untimely parental death',
      'Child graduation milestone maturity bonus'
    ],
    key_features: [
      'Child entry age: 30 days to 12 years old; parent entry age: 18 to 55',
      'Maturity timed specifically to align with child 18th or 21st birthday',
      'Option to add child hospital surgical benefit rider'
    ],
    eligibility_criteria: 'Child: 30 days to 12 years old. Proposer (Parent/Guardian): 18 to 55 years old.',
    coverage_details: 'Target education fund: 10,000,000 MMK to 80,000,000 MMK.',
    premium_terms: 'Flexible premium terms up to the child 18th birthday.',
    target_audience: 'Parents and grandparents planning structured university tuition reserves.',
    display_order: 4,
    status: 'published',
    is_published: true,
    created_at: '2026-08-15T11:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
  },
  {
    id: 'prod_005',
    title: 'KBZLife Credit Shield Loan Protection',
    subtitle: 'Mortgage & Commercial Borrower Collateral Coverage',
    category: 'Credit Life',
    card_color_theme: 'teal',
    short_description: 'Settles remaining bank loan and mortgage balances upon borrower death or disability to protect family homes.',
    description: 'Designed in strategic partnership with banking and lending institutions to protect borrowers and their mortgaged assets. In the event of borrower death or permanent disability during the loan tenure, the outstanding credit balance is settled directly with the lending bank, safeguarding family homes and collateral assets.',
    image_url: '/src/assets/images/license_compliance_training_1792658701433.jpg',
    key_benefits: [
      'Eliminates the threat of foreclosure or collateral seizure for surviving relatives',
      'Full outstanding principal loan clearance paid directly to lender',
      'Affordable single-premium or loan-amortized payment options'
    ],
    key_features: [
      'Reducing term assurance matching bank amortization schedule',
      'Joint borrower coverage available for co-signed mortgages',
      'Instant digital issuance integrated with KBZ Bank mortgage approvals'
    ],
    eligibility_criteria: 'Approved bank borrowers aged 18 to 65. Loan tenure: 1 to 20 years.',
    coverage_details: 'Sum assured matches 100% of the loan disbursement amount.',
    premium_terms: 'Financed into the bank loan package or paid as single upfront premium.',
    target_audience: 'Mortgage borrowers, auto loan holders, and small business credit applicants.',
    display_order: 5,
    status: 'published',
    is_published: true,
    created_at: '2026-08-20T12:00:00Z',
    updated_at: '2026-10-22T08:00:00Z',
  },
  {
    id: 'prod_006',
    title: 'KBZLife Short-Term High Yield Endowment',
    subtitle: 'Capital Preservation & Fixed Guaranteed Returns (3-Year & 5-Year)',
    category: 'Savings & Investment',
    card_color_theme: 'rose',
    short_description: 'Short-tenure guaranteed return savings plan with life assurance and principal security for conservative investors.',
    description: 'A modern, short-duration insurance savings vehicle offering higher guaranteed returns than traditional bank fixed deposits while retaining life protection. Ideal for individuals and treasuries seeking capital safety, predictable return yields, and liquidity over 3 to 5 years.',
    image_url: '/src/assets/images/market_conduct_governance_1792658701262.jpg',
    key_benefits: [
      'Guaranteed annual cash coupons or compound maturity accumulation',
      'Full return of invested capital plus guaranteed interest at maturity',
      '105% life cover on total single premium invested'
    ],
    key_features: [
      'Single premium deposit or short 2-year payment structure',
      'Choice of 3-year or 5-year fixed maturity horizon',
      'Guaranteed yield unaffected by market equity volatility'
    ],
    eligibility_criteria: 'Individuals aged 18 to 70. Corporate treasuries also eligible.',
    coverage_details: 'Minimum single premium: 5,000,000 MMK. Maximum: 500,000,000 MMK.',
    premium_terms: 'Single premium upfront payment via KBZ Bank transfer.',
    target_audience: 'Treasury managers, retirees, and conservative high-net-worth investors.',
    display_order: 6,
    status: 'published',
    is_published: true,
    created_at: '2026-08-25T13:00:00Z',
    updated_at: '2026-10-22T09:00:00Z',
  }
];

// =====================================================================
// INITIAL PRODUCT-SPECIFIC QUIZZES
// =====================================================================
export const INITIAL_PRODUCT_QUIZZES: ProductQuiz[] = [
  {
    id: 'quiz_prod_001',
    product_id: 'prod_001',
    title: 'KBZLife Endowment Life Assurance Certification Quiz',
    description: 'Test your understanding of the Endowment policy structure, bonuses, surrender rules, and maturity payouts.',
    passing_score: 80,
    max_attempts: 0,
    is_published: true,
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
    questions: [
      {
        id: 'qp_001_1',
        quiz_id: 'quiz_prod_001',
        question_text: 'What happens to the KBZLife Endowment Life Assurance benefit if the policyholder survives to the end of the policy term?',
        options: [
          'The policy expires without any financial disbursement',
          'The policyholder receives the full guaranteed Sum Assured plus accrued annual reversionary bonuses',
          'Only the total premiums paid are returned without interest or bonus',
          'The sum assured is converted into an irrevocable charitable donation'
        ],
        correct_option_index: 1,
        explanation: 'At maturity, the endowment contract delivers the full guaranteed Sum Assured along with all compound annual reversionary bonuses accrued over the tenure.',
        display_order: 1
      },
      {
        id: 'qp_001_2',
        quiz_id: 'quiz_prod_001',
        question_text: 'After how many years of continuous premium payments does the KBZLife Endowment policy acquire a guaranteed cash surrender value?',
        options: [
          '6 months',
          '1 full year',
          '2 full policy years',
          '5 full policy years'
        ],
        correct_option_index: 2,
        explanation: 'Under Myanmar insurance regulations and KBZLife policy terms, endowment policies attain guaranteed cash surrender and policy loan privileges after 2 years of continuous premium payment.',
        display_order: 2
      },
      {
        id: 'qp_001_3',
        quiz_id: 'quiz_prod_001',
        question_text: 'What is the maximum policy loan amount an advisor can illustrate against an active KBZLife Endowment policy?',
        options: [
          'Up to 50% of total premiums paid',
          'Up to 85% of the accrued cash surrender value',
          '100% of the original sum assured',
          'No policy loans are permitted on endowment plans'
        ],
        correct_option_index: 1,
        explanation: 'Policyholders can secure liquidity through a policy loan up to 85% of the verified cash surrender value without surrendering their life protection.',
        display_order: 3
      },
      {
        id: 'qp_001_4',
        quiz_id: 'quiz_prod_001',
        question_text: 'What is the minimum entry age for a proposed life insured under KBZLife Endowment Assurance?',
        options: [
          '12 years old',
          '18 years old',
          '21 years old',
          '25 years old'
        ],
        correct_option_index: 1,
        explanation: 'The standard entry age for individual adult life insurance contracts in Myanmar is 18 years completed.',
        display_order: 4
      }
    ]
  },
  {
    id: 'quiz_prod_002',
    product_id: 'prod_002',
    title: 'Group Term Life & Corporate Employee Security Quiz',
    description: 'Assess competencies in corporate eligibility limits, salary multipliers, and free-cover limits.',
    passing_score: 80,
    max_attempts: 0,
    is_published: true,
    created_at: '2026-08-05T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
    questions: [
      {
        id: 'qp_002_1',
        quiz_id: 'quiz_prod_002',
        question_text: 'What is the minimum group size required to establish a KBZLife Corporate Group Term Life contract?',
        options: [
          '2 employees',
          '5 eligible employees',
          '25 employees',
          '50 employees'
        ],
        correct_option_index: 1,
        explanation: 'KBZLife accommodates small and medium enterprises with a minimum group threshold of 5 eligible full-time staff members.',
        display_order: 1
      },
      {
        id: 'qp_002_2',
        quiz_id: 'quiz_prod_002',
        question_text: 'What additional benefit is payable if an insured employee suffers an accidental fatality while covered under KBZLife Group Term Life?',
        options: [
          'Return of premium only',
          'Double Indemnity benefit (additional accidental death payout)',
          'No additional payout beyond basic salary',
          '50% discount on next year corporate premium'
        ],
        correct_option_index: 1,
        explanation: 'The accidental death and dismemberment rider provides Double Indemnity, doubling the lump-sum settlement paid to the employee family.',
        display_order: 2
      },
      {
        id: 'qp_002_3',
        quiz_id: 'quiz_prod_002',
        question_text: 'How are group members below the Free Cover Limit (FCL) underwritten?',
        options: [
          'They must undergo full hospital health screening and blood tests',
          'They are accepted automatically without individual medical examinations',
          'They must wait 12 months before coverage becomes active',
          'They are rejected unless approved by the board of directors'
        ],
        correct_option_index: 1,
        explanation: 'Employees whose sum assured falls within the agreed Free Cover Limit are underwritten automatically without requiring individual health examinations.',
        display_order: 3
      }
    ]
  },
  {
    id: 'quiz_prod_003',
    product_id: 'prod_003',
    title: 'Critical Illness & Medical Care Competency Quiz',
    description: 'Verify your knowledge of critical illness definitions, survival period, and claim criteria.',
    passing_score: 80,
    max_attempts: 0,
    is_published: true,
    created_at: '2026-08-10T11:00:00Z',
    updated_at: '2026-10-21T09:00:00Z',
    questions: [
      {
        id: 'qp_003_1',
        quiz_id: 'quiz_prod_003',
        question_text: 'How is the benefit paid when a policyholder is diagnosed with a covered critical illness?',
        options: [
          'Reimbursement of actual hospital receipts only',
          '100% upfront lump-sum cash disbursement directly to the insured',
          'Monthly installments paid exclusively to registered hospitals',
          'Voucher for prescription medications only'
        ],
        correct_option_index: 1,
        explanation: 'Critical Illness insurance is a living benefit that disburses a 100% lump-sum cash amount upon certified medical diagnosis, giving families freedom to manage treatments.',
        display_order: 1
      },
      {
        id: 'qp_003_2',
        quiz_id: 'quiz_prod_003',
        question_text: 'What is the standard survival period required after diagnosis for critical illness claim eligibility?',
        options: [
          'No survival requirement',
          '14 days post-diagnosis',
          '180 days post-diagnosis',
          '1 full calendar year'
        ],
        correct_option_index: 1,
        explanation: 'The policyholder must survive at least 14 days following the definitive specialist diagnosis of the covered critical condition.',
        display_order: 2
      },
      {
        id: 'qp_003_3',
        quiz_id: 'quiz_prod_003',
        question_text: 'Up to what age can the KBZLife Critical Illness plan be renewed?',
        options: [
          'Age 50',
          'Age 60',
          'Age 65',
          'Age 75'
        ],
        correct_option_index: 3,
        explanation: 'KBZLife provides market-leading guaranteed renewability up to age 75 to ensure mature policyholders remain protected during peak health vulnerability years.',
        display_order: 3
      }
    ]
  },
  {
    id: 'quiz_prod_004',
    product_id: 'prod_004',
    title: 'Education Booster Plan Accreditation Quiz',
    description: 'Test your understanding of child milestone payouts, waiver of premiums, and maturity terms.',
    passing_score: 80,
    max_attempts: 0,
    is_published: true,
    created_at: '2026-08-15T12:00:00Z',
    updated_at: '2026-10-21T10:00:00Z',
    questions: [
      {
        id: 'qp_004_1',
        quiz_id: 'quiz_prod_004',
        question_text: 'What critical safeguard activates if the parent/proposer passes away during the Education Booster policy term?',
        options: [
          'The policy is terminated immediately with zero cash return',
          'All future premiums are completely waived while all scheduled child education payouts remain fully guaranteed',
          'The child must take out a student bank loan to continue the policy',
          'The sum assured is halved and deferred to retirement'
        ],
        correct_option_index: 1,
        explanation: 'The Waiver of Premium rider ensures that if the breadwinner passes away or suffers TPD, KBZLife assumes all remaining premium obligations, protecting the child graduation fund in full.',
        display_order: 1
      },
      {
        id: 'qp_004_2',
        quiz_id: 'quiz_prod_004',
        question_text: 'What is the eligible entry age range for a child under the KBZLife Education Booster Plan?',
        options: [
          'From 30 days to 12 years old',
          'From 5 years to 18 years old',
          'From 10 years to 20 years old',
          'Only newborn infants within 7 days of birth'
        ],
        correct_option_index: 0,
        explanation: 'Children are eligible from 30 days of age up to 12 years old, allowing parents sufficient tenure to build an adequate university corpus.',
        display_order: 2
      }
    ]
  },
  {
    id: 'quiz_prod_005',
    product_id: 'prod_005',
    title: 'Credit Shield Loan Protection Certification Quiz',
    description: 'Examine understanding of collateral debt cancellation and bank bancassurance procedures.',
    passing_score: 80,
    max_attempts: 0,
    is_published: true,
    created_at: '2026-08-20T13:00:00Z',
    updated_at: '2026-10-22T08:00:00Z',
    questions: [
      {
        id: 'qp_005_1',
        quiz_id: 'quiz_prod_005',
        question_text: 'Who is the primary beneficiary of a Credit Shield Loan Protection policy?',
        options: [
          'The real estate agency or car dealership',
          'The lending bank/institution to clear the outstanding loan balance',
          'The insurance sales representative',
          'The tax administration department'
        ],
        correct_option_index: 1,
        explanation: 'Credit life policies assign the lending bank as primary loss payee to retire the outstanding debt balance and prevent foreclosure on the surviving family.',
        display_order: 1
      },
      {
        id: 'qp_005_2',
        quiz_id: 'quiz_prod_005',
        question_text: 'How does the sum assured typically adjust over time in a mortgage credit shield policy?',
        options: [
          'It increases by 10% annually with inflation',
          'It remains completely flat regardless of bank payments',
          'It reduces progressively in tandem with the amortized loan balance',
          'It resets to zero every calendar quarter'
        ],
        correct_option_index: 2,
        explanation: 'A reducing term structure matches the amortization schedule of the mortgage, keeping premiums cost-effective while matching the outstanding liability.',
        display_order: 2
      }
    ]
  },
  {
    id: 'quiz_prod_006',
    product_id: 'prod_006',
    title: 'Short-Term High Yield Endowment Quiz',
    description: 'Validate key details of short-term capital preservation, guaranteed returns, and single premium structures.',
    passing_score: 80,
    max_attempts: 0,
    is_published: true,
    created_at: '2026-08-25T14:00:00Z',
    updated_at: '2026-10-22T09:00:00Z',
    questions: [
      {
        id: 'qp_006_1',
        quiz_id: 'quiz_prod_006',
        question_text: 'What are the tenure options available for the KBZLife Short-Term High Yield Endowment?',
        options: [
          '10 or 20 years',
          '3-Year or 5-Year fixed terms',
          'Life-long whole life term only',
          '30 days only'
        ],
        correct_option_index: 1,
        explanation: 'The plan is specifically engineered for short duration savings goals with 3-year or 5-year maturity horizons.',
        display_order: 1
      },
      {
        id: 'qp_006_2',
        quiz_id: 'quiz_prod_006',
        question_text: 'What life coverage is provided on the Single Premium deposit under this plan?',
        options: [
          'No life coverage is provided',
          '105% of the single premium invested',
          '1000% of the single premium',
          'Equal to the annual bank deposit rate'
        ],
        correct_option_index: 1,
        explanation: 'Under Myanmar regulatory guidelines for single-premium endowment plans, life cover is established at 105% of the total single premium deposited.',
        display_order: 2
      }
    ]
  }
];

// =====================================================================
// INITIAL COMPANY BULLETIN (Campaigns, Announcements, Notices)
// =====================================================================

export const INITIAL_SKILL_QUIZZES: SkillQuiz[] = [
  {
    id: 'quiz_sk_001',
    category_id: 'sk_cat_001',
    resource_id: 'sk_res_001',
    title: 'Business English: Client Advisory & Professional Communications Assessment',
    description: 'Verify your mastery of corporate consultative terminology, formal email writing conventions, and empathetic client interaction standards.',
    passing_score: 80,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
    is_published: true,
    questions: [
      {
        id: 'q_sk_001_1',
        quiz_id: 'quiz_sk_001',
        question_text: 'When communicating premium adjustments or policy renewals to a high-net-worth client, which phrasing demonstrates the highest level of professional consultative empathy?',
        options: [
          '"You have to pay the new premium rate immediately or your coverage is cancelled."',
          '"We appreciate your continued trust in KBZLife. Allow us to review how your updated portfolio values maintain optimal protection for your family."',
          '"The head office changed the rates and there is nothing anyone can do."',
          '"Please check our general website whenever you have spare time."'
        ],
        correct_option_index: 1,
        explanation: 'Consultative advisory emphasizes relationship-building, acknowledging client trust, and linking changes to their family protection objectives.',
        display_order: 1
      },
      {
        id: 'q_sk_001_2',
        quiz_id: 'quiz_sk_001',
        question_text: 'In formal business correspondence, what does the abbreviation "CDD" represent in life insurance advisory contexts?',
        options: [
          'Central Daily Disbursement',
          'Customer Due Diligence',
          'Certified Death Declaration',
          'Corporate Distribution Directive'
        ],
        correct_option_index: 1,
        explanation: 'CDD stands for Customer Due Diligence, the core standard operating process of verifying client identity and risk background.',
        display_order: 2
      },
      {
        id: 'q_sk_001_3',
        quiz_id: 'quiz_sk_001',
        question_text: 'Which email closing is most appropriate for formal policyholder advisory inquiries?',
        options: [
          '"Later,"',
          '"Yours sincerely / Warm regards, [Advisor Name], KBZLife Insurance"',
          '"Sent from my phone,"',
          '"Thanks a bunch,"'
        ],
        correct_option_index: 1,
        explanation: '"Yours sincerely" or "Warm regards" followed by complete name and official title maintains brand professionalism and customer confidence.',
        display_order: 3
      }
    ]
  },
  {
    id: 'quiz_sk_002',
    category_id: 'sk_cat_002',
    resource_id: 'sk_res_002',
    title: 'Excel & Data Analytics: Financial Modeling Assessment',
    description: 'Practical evaluation on policyholder calculations, dynamic formulas (XLOOKUP), and financial dashboard analytics.',
    passing_score: 80,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
    is_published: true,
    questions: [
      {
        id: 'q_sk_002_1',
        quiz_id: 'quiz_sk_002',
        question_text: 'Why is XLOOKUP generally preferred over traditional VLOOKUP in financial modeling sheets?',
        options: [
          'XLOOKUP requires columns to be sorted in ascending order',
          'XLOOKUP defaults to exact matches, looks up to the left and right, and handles column insertions safely without breaking index references',
          'XLOOKUP only works on numeric data and ignores string cells',
          'XLOOKUP automatically converts spreadsheets into PDF documents'
        ],
        correct_option_index: 1,
        explanation: 'XLOOKUP defaults to exact match, allows leftward searches, and uses cell ranges rather than column index numbers, preventing breakage if columns are added.',
        display_order: 1
      },
      {
        id: 'q_sk_002_2',
        quiz_id: 'quiz_sk_002',
        question_text: 'Which Excel function is best suited to calculate the periodic payment for an annuity policy based on constant payments and interest rate?',
        options: [
          'PMT',
          'COUNTIF',
          'STDEV.S',
          'CONCATENATE'
        ],
        correct_option_index: 0,
        explanation: 'PMT calculates the payment for a loan or annuity investment based on constant payments and a constant interest rate.',
        display_order: 2
      }
    ]
  }
];

// =====================================================================
// INITIAL COMPANY BULLETIN (Campaigns, Announcements, Notices)
// =====================================================================

export const INITIAL_COMPANY_BULLETINS: CompanyBulletinItem[] = [
  {
    id: 'bulletin-001',
    title: 'Q4 2026 Nationwide Sales Campaign: Accelerate to Zenith',
    description: 'Official campaign launch directives for all Agency, Bancassurance, and Corporate distribution arms. Includes quota thresholds, commission accelerations, and branch incentive structures.',
    category: 'Campaign',
    pdf_url: '/uploads/Fair_Market_Conduct_Manual.pdf',
    file_name: 'Fair_Market_Conduct_Manual.pdf',
    file_size: 2450000,
    formatted_file_size: '2.4 MB',
    page_count: 24,
    published: true,
    status: 'published',
    published_at: '2026-10-24T09:30:00Z',
    created_at: '2026-10-24T08:00:00Z',
    updated_at: '2026-10-24T09:30:00Z',
    author_id: 'u0000000-0000-0000-0000-000000000001',
    author_name: 'Executive Leadership & Agency Directorate',
    department: 'Sales & Agency Distribution',
    tags: ['campaign', 'q4 target', 'agency sales', 'bancassurance', 'incentive'],
    priority: 'high',
    verified: true,
  },
  {
    id: 'bulletin-002',
    title: 'Annual Compliance & Anti-Money Laundering (AML/CFT) Directive 2026',
    description: 'Mandatory regulatory compliance guidelines issued by the Compliance & Legal Directorate. All licensed insurance professionals and branch advisors must review before November 15.',
    category: 'Policy Memo',
    pdf_url: '/uploads/KBZLife_AML_CFT_Compliance_2026.pdf',
    file_name: 'KBZLife_AML_CFT_Compliance_2026.pdf',
    file_size: 3120000,
    formatted_file_size: '3.1 MB',
    page_count: 36,
    published: true,
    status: 'published',
    published_at: '2026-10-22T14:15:00Z',
    created_at: '2026-10-22T11:00:00Z',
    updated_at: '2026-10-22T14:15:00Z',
    author_id: 'u0000000-0000-0000-0000-000000000001',
    author_name: 'Compliance & Legal Directorate',
    department: 'Governance & Compliance',
    tags: ['compliance', 'regulatory', 'aml cft', 'mandatory', 'legal memo'],
    priority: 'urgent',
    verified: true,
  },
  {
    id: 'bulletin-003',
    title: 'Frontline Professional Excellence & Customer Conduct Notice',
    description: 'Standard operational directives regarding ethical market conduct, client suitability disclosures, and transparent communication protocols across all service touchpoints.',
    category: 'Notice',
    pdf_url: '/uploads/Everyday_Business_English_Frontline.pdf',
    file_name: 'Everyday_Business_English_Frontline.pdf',
    file_size: 1850000,
    formatted_file_size: '1.8 MB',
    page_count: 18,
    published: true,
    status: 'published',
    published_at: '2026-10-20T11:00:00Z',
    created_at: '2026-10-20T08:30:00Z',
    updated_at: '2026-10-20T11:00:00Z',
    author_id: 'u0000000-0000-0000-0000-000000000001',
    author_name: 'Operations & Service Quality Council',
    department: 'Customer Experience',
    tags: ['notice', 'frontline', 'market conduct', 'service quality', 'customer advisory'],
    priority: 'normal',
    verified: true,
  },
  {
    id: 'bulletin-004',
    title: 'Digital Financial Reporting & Workflow Modernization Initiative',
    description: 'Operational roadmap for regional branches and head office accounting teams detailing updated Excel automation tools, reporting templates, and monthly closing schedules.',
    category: 'Announcement',
    pdf_url: '/uploads/KBZLife_Excel_Automation_Handbook.pdf',
    file_name: 'KBZLife_Excel_Automation_Handbook.pdf',
    file_size: 4200000,
    formatted_file_size: '4.2 MB',
    page_count: 42,
    published: true,
    status: 'published',
    published_at: '2026-10-18T16:45:00Z',
    created_at: '2026-10-18T13:00:00Z',
    updated_at: '2026-10-18T16:45:00Z',
    author_id: 'u0000000-0000-0000-0000-000000000001',
    author_name: 'Finance & Technology Department',
    department: 'Financial Management',
    tags: ['announcement', 'operations', 'automation', 'reporting', 'workflow'],
    priority: 'normal',
    verified: true,
  },
];
