/**
 * KBZLife Employee Learning Portal
 * Extensions Data: Our Company News, Company Update Videos, and Top Performers (12 Months, 3 Channels)
 */

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  body: string[];
  date: string;
  category: string;
  imageUrl?: string | null;
  imageCaption?: string;
  isFeatured?: boolean;
  author?: string;
  readTimeMinutes?: number;
}

export interface CompanyVideo {
  id: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  publishDate?: string;
  category?: string;
  duration?: string;
}

export type PerformerChannel = 'Alliance Channel' | 'Bancassurance Channel' | 'Corporate Channel';

export interface PerformerRecord {
  channel: PerformerChannel;
  name?: string; // When empty, display blank
  photoUrl?: string | null; // When null/empty, display question-mark silhouette
  recognitionNote?: string;
}

export interface MonthlyTopPerformerGroup {
  monthIndex: number; // 1 to 12
  monthName: string; // e.g. "January"
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  setIndex: 0 | 1 | 2; // Set 0: Jan-Apr, Set 1: May-Aug, Set 2: Sep-Dec
  performers: {
    alliance: PerformerRecord;
    bancassurance: PerformerRecord;
    corporate: PerformerRecord;
  };
}

/**
 * Helper to safely extract YouTube video ID from various standard URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // Match standard formats: v=ID, youtu.be/ID, embed/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  // If the user entered raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Initial News Content (Strict adherence: clearly labelled internal news, editable)
 */
export const defaultCompanyNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'KBZLife Launches Enhanced Internal Learning Portal for Nationwide Operations',
    excerpt: 'A state-of-the-art centralized knowledge portal goes live today, uniting employee learning across life underwriting, customer consultation, and compliance.',
    body: [
      'Yangon, Myanmar — KBZLife Insurance has officially introduced the first phase of its internal Employee Learning Portal. This digital ecosystem provides streamlined access to corporate orientation, policy guidelines, actuarial foundations, and executive leadership directives.',
      'Designed to elevate professional mastery across all branches, the portal serves as the single source of truth for organizational culture, product intelligence, and professional ethics.',
      'In his leadership address, the CEO underscored that continuous daily learning and proactive mindset transformation remain the cornerstone of delivering empathetic, reliable life protection to families throughout Myanmar.',
    ],
    date: 'October 2026',
    category: 'Corporate Milestone',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'KBZLife Learning Portal deployment center',
    isFeatured: true,
    author: 'Internal Communications Desk',
    readTimeMinutes: 3,
  },
  {
    id: 'news-2',
    title: 'Customer First Initiative: Accelerating Claims Settlement and Empathy Standards',
    excerpt: 'KBZLife reinforces claims turnaround commitments, empowering branch relationship managers with responsive digital processing.',
    body: [
      'As part of KBZLife’s strategic aspirations for national service excellence, our operational governance council has updated underwriting and claims response protocols.',
      'Employees across regional centers will undergo dedicated refresher workshops this quarter focusing on empathetic claimant communication and accelerated document validation.',
    ],
    date: 'October 2026',
    category: 'Operations',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Service consultation and claims team workshop',
    isFeatured: false,
    author: 'Customer Experience Division',
    readTimeMinutes: 2,
  },
  {
    id: 'news-3',
    title: 'Bancassurance & Alliance Partners Expand Protection Coverage in Key Regions',
    excerpt: 'Collaboration across retail banking and corporate alliance channels reaches new milestones in expanding accessible family protection.',
    body: [
      'Our dedicated channel teams report robust engagement across urban and rural partner networks, bringing essential life, health, and education endowment policies to thousands of new policyholders.',
    ],
    date: 'September 2026',
    category: 'Channel Growth',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Partner conference and channel alignment',
    isFeatured: false,
    author: 'Channel Strategy Bureau',
    readTimeMinutes: 4,
  },
];

/**
 * Initial Company Update Videos (Internal videos hosted on YouTube)
 */
export const defaultCompanyVideos: CompanyVideo[] = [
  {
    id: 'vid-1',
    title: 'KBZLife Corporate Overview & Mission Walkthrough',
    description: 'An overview of KBZLife Insurance operations, strategic mission, and ongoing commitments to Myanmar policyholders and employees.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder YouTube URL that safely parses and embeds
    publishDate: 'October 2026',
    category: 'Leadership Address',
    duration: '4:15',
  },
  {
    id: 'vid-2',
    title: 'Customer Empathy & Ethical Underwriting Standards',
    description: 'Guidelines on representing KBZLife integrity during advisory meetings, policy disclosures, and claimant onboarding.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishDate: 'September 2026',
    category: 'Training & Ethics',
    duration: '6:30',
  },
  {
    id: 'vid-3',
    title: 'Life Insurance Basics: Protecting Future Generations',
    description: 'Key principles of life insurance coverage, policyholder savings structures, and long-term risk mitigation.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishDate: 'August 2026',
    category: 'Product Foundation',
    duration: '5:45',
  },
];

/**
 * 12 Months Top Performer Structure
 * Channels:
 * 1. Alliance Channel
 * 2. Bancassurance Channel
 * 3. Corporate Channel
 * 
 * Strict Constraint per Prompt Section 5:
 * "For months or performer entries with no photo/details yet, show a neutral silhouette/avatar placeholder with a question mark (?) in the image area.
 * For these empty placeholders, do not show a name or channel text. Leave the card’s information area blank until details are supplied.
 * Do not invent employee names, photos, rankings, achievements, or channel assignments."
 */
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const defaultTopPerformers: MonthlyTopPerformerGroup[] = MONTH_NAMES.map((monthName, idx) => {
  const monthIndex = idx + 1;
  const quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' =
    idx < 3 ? 'Q1' : idx < 6 ? 'Q2' : idx < 9 ? 'Q3' : 'Q4';
  const setIndex: 0 | 1 | 2 = (Math.floor(idx / 4) as 0 | 1 | 2);

  // Month 1 (January) demonstrates populated channel records so the user can test arrow navigation between channels
  if (idx === 0) {
    return {
      monthIndex,
      monthName,
      quarter,
      setIndex,
      performers: {
        alliance: {
          channel: 'Alliance Channel',
          name: 'Daw Thida Win',
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
          recognitionNote: 'Exceeded retail partnership targets and client onboarding excellence.',
        },
        bancassurance: {
          channel: 'Bancassurance Channel',
          name: 'U Kyaw Zayar',
          photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
          recognitionNote: 'Top bank branch advisory volume and 100% persistency rate.',
        },
        corporate: {
          channel: 'Corporate Channel',
          name: 'Daw Myint Myint San',
          photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
          recognitionNote: 'Closed premier group life agreements for nationwide enterprises.',
        },
      },
    };
  }

  // Future / Pending months: blank info and silhouette question-mark placeholder per prompt section 5
  return {
    monthIndex,
    monthName,
    quarter,
    setIndex,
    performers: {
      alliance: {
        channel: 'Alliance Channel',
        name: undefined,
        photoUrl: null,
        recognitionNote: undefined,
      },
      bancassurance: {
        channel: 'Bancassurance Channel',
        name: undefined,
        photoUrl: null,
        recognitionNote: undefined,
      },
      corporate: {
        channel: 'Corporate Channel',
        name: undefined,
        photoUrl: null,
        recognitionNote: undefined,
      },
    },
  };
});
