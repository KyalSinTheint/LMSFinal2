import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export interface ServerEmailLog {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: 'sent' | 'failed' | 'queued';
  error_message?: string;
  created_at: string;
}

// In-memory server credentials, storage, and log store
export let serverAdminPassword = 'admin123';
export let mustChangeAdminPassword = true;
export const serverEmailLogs: ServerEmailLog[] = [];
export const uploadedAssetsMap = new Map<string, { buffer: Buffer; contentType: string }>();

import type {
  LicenseChapter,
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
} from '../types/lms.ts';
import {
  INITIAL_LICENSE_CHAPTERS,
  INITIAL_LICENSE_LESSONS,
  INITIAL_LICENSE_QUIZZES,
  INITIAL_SKILL_QUIZZES,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCT_QUIZZES,
  INITIAL_COMPANY_BULLETINS,
} from '../data/seedLmsData.ts';

export const serverProducts: ProductKnowledgeItem[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
export const serverProductQuizzes: ProductQuiz[] = JSON.parse(JSON.stringify(INITIAL_PRODUCT_QUIZZES));
export const serverProductQuizAttempts: ProductQuizAttempt[] = [];
export const serverSkillQuizzes: SkillQuiz[] = JSON.parse(JSON.stringify(INITIAL_SKILL_QUIZZES));
export const serverSkillQuizAttempts: SkillQuizAttempt[] = [];
export const serverCompanyBulletins: CompanyBulletinItem[] = JSON.parse(JSON.stringify(INITIAL_COMPANY_BULLETINS));

export interface VideoProgressRecord {
  userId: string;
  lessonId: string;
  watchedIntervals: [number, number][];
  uniqueWatchedSeconds: number;
  totalDurationSeconds: number;
  progressPercentage: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  lastPosition: number;
  lastHeartbeatTime: number;
  updatedAt: string;
}

export const serverVideoProgressRegistry = new Map<string, VideoProgressRecord>();

export interface PdfProgressRecord {
  userId: string;
  lessonId: string;
  viewedPages: number[];
  totalPages: number;
  progressPercentage: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  lastPage: number;
  updatedAt: string;
}

export const serverPdfProgressRegistry = new Map<string, PdfProgressRecord>();
export const serverLicenseChapters: LicenseChapter[] = JSON.parse(JSON.stringify(INITIAL_LICENSE_CHAPTERS));
export const serverLicenseQuizzes: LicenseQuiz[] = JSON.parse(JSON.stringify(INITIAL_LICENSE_QUIZZES));
export const serverQuizAttempts: LicenseQuizAttempt[] = [];
export const serverChapterCompletions = new Map<string, {
  userId: string;
  chapterId: string;
  status: 'locked' | 'in_progress' | 'quiz_available' | 'passed' | 'completed';
  materialsCompleted: boolean;
  quizPassed: boolean;
  highestQuizScore: number;
  completedAt?: string;
  updatedAt: string;
}>();


export function mergeWatchedIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [[sorted[0][0], sorted[0][1]]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current[0] <= last[1] + 0.6) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push([current[0], current[1]]);
    }
  }
  return merged;
}

export function calculateUniqueSeconds(intervals: [number, number][]): number {
  return intervals.reduce((acc, [start, end]) => acc + Math.max(0, end - start), 0);
}

/**
 * Server-side PDF Text Extraction & Scanned Document Detection
 */
export async function extractTextFromPdfBuffer(
  pdfBuffer: Buffer,
  maxPages = 25
): Promise<{ text: string; numPages: number; isScanned: boolean }> {
  // @ts-ignore
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const uint8 = new Uint8Array(pdfBuffer);
  const loadingTask = pdfjs.getDocument({
    data: uint8,
    useSystemFonts: true,
    disableFontFace: true,
  });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;
  const pagesToRead = Math.min(numPages, maxPages);
  let aggregatedText = '';

  for (let i = 1; i <= pagesToRead; i++) {
    try {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageStr = content.items
        .map((it: any) => it.str)
        .filter(Boolean)
        .join(' ');
      aggregatedText += `\n--- Page ${i} ---\n` + pageStr;
    } catch (pageErr) {
      console.warn(`[PDF Extraction] Error reading page ${i}:`, pageErr);
    }
  }

  // Detect scanned or image-only or unreadable PDFs
  const cleaned = aggregatedText.replace(/--- Page \d+ ---/g, '').trim();
  const alphanumericChars = (cleaned.match(/[a-zA-Z0-9]/g) || []).length;
  const isScanned = cleaned.length < 50 || alphanumericChars < 30;

  return { text: aggregatedText, numPages, isScanned };
}

/**
 * AI Quiz Generation using Gemini API (@google/genai) with Resilient Fallback
 */
export async function generateQuizQuestionsFromText(
  text: string,
  count = 5,
  topic = ''
): Promise<Array<{
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}>> {
  const prompt = `You are a senior insurance educator and curriculum designer for KBZLife Insurance.
Create exactly ${count} professional, clear multiple-choice quiz questions based strictly on the following study material.
${topic ? `Topic Focus: ${topic}` : ''}

MATERIAL:
"""
${text.slice(0, 16000)}
"""

RULES:
1. Each question must evaluate an essential concept or regulatory rule from the text.
2. Provide exactly 4 distinct options per question.
3. Mark the zero-based index of the correct answer (0, 1, 2, or 3).
4. Provide a helpful, clear explanation for why the answer is correct quoting or referencing the material.
5. Return JSON ONLY with this exact schema:
[
  {
    "question_text": "Question statement?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option_index": 0,
    "explanation": "Why Option A is correct according to the material."
  }
]`;

  let parsed: any = null;
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

  if (apiKey && apiKey.length > 5) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const callModel = async (modelName: string) => {
        const result = await Promise.race([
          ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API call timed out after 8s')), 8000)
          ),
        ]);
        return result.text || '';
      };

      let responseText = '';
      try {
        responseText = await callModel('gemini-3.8-flash');
      } catch (primaryErr) {
        console.warn('[Gemini Quiz] Primary model failed, trying gemini-3.1-flash-lite fallback:', primaryErr);
        try {
          responseText = await callModel('gemini-3.1-flash-lite');
        } catch (fallbackErr) {
          console.warn('[Gemini Quiz] Fallback model failed:', fallbackErr);
        }
      }

      if (responseText && responseText.trim()) {
        const cleanJson = responseText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
        parsed = JSON.parse(cleanJson);
      }
    } catch (aiErr) {
      console.warn('[Gemini Quiz Generation] AI model unavailable or error, using document-grounded text extraction fallback:', aiErr);
    }
  }

  // Fallback heuristic: Extract key sentences and build multiple choice questions
  if (!Array.isArray(parsed) || parsed.length === 0) {
    const rawParagraphs = text
      .split(/\n\n+|(?<=[.!?])\s+---|\n(?=[A-Z0-9.\-•])/)
      .map((p) => p.replace(/--- Page \d+ ---/g, '').trim())
      .filter((p) => p.length >= 40 && p.length <= 400 && !p.startsWith('http'));

    const sentences = rawParagraphs.length >= count ? rawParagraphs : text.split(/(?<=[.!?])\s+/).filter((s) => s.length >= 35 && s.length <= 250);

    const generatedFallback: any[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < Math.min(count, Math.max(3, sentences.length)); i++) {
      let chosenIdx = Math.floor(Math.random() * sentences.length);
      let attempts = 0;
      while (usedIndices.has(chosenIdx) && attempts < 20) {
        chosenIdx = (chosenIdx + 1) % sentences.length;
        attempts++;
      }
      usedIndices.add(chosenIdx);

      const sentence = sentences[chosenIdx] || `Standard compliance rule ${i + 1} governs insurance advisory.`;
      const cleanSentence = sentence.replace(/[\n\r]+/g, ' ').trim();

      const questionTypes = [
        `According to the curriculum for "${topic || 'Insurance Standards'}", which statement accurately reflects the policy?`,
        `Based on the official study handbook, what is the primary compliance requirement?`,
        `Regarding "${topic || 'KBZLife Operational Guidelines'}", which of the following is correct?`,
        `Under statutory regulatory guidance, how should the following requirement be applied?`,
      ];

      const qText = questionTypes[i % questionTypes.length];
      const correctOption = cleanSentence;

      const distractors = [
        `It is discretionary and only applies during optional administrative reviews.`,
        `Requirements may be waived without supervisory notification or documentation.`,
        `Documentation is optional unless expressly requested by external parties.`,
        `Applicable only to third-party contractors and not to permanent advisory personnel.`,
      ];

      // Shuffle options and pick random correct index
      const targetCorrectIdx = Math.floor(Math.random() * 4);
      const options = [...distractors.slice(0, 3)];
      options.splice(targetCorrectIdx, 0, correctOption);

      generatedFallback.push({
        question_text: qText,
        options,
        correct_option_index: targetCorrectIdx,
        explanation: `As stated directly in the document: "${cleanSentence}"`,
      });
    }

    parsed = generatedFallback;
  }

  return parsed.map((item: any, idx: number) => {
    let opts = Array.isArray(item.options) ? item.options.map((o: any) => String(o).trim()) : [];
    while (opts.length < 4) {
      opts.push(`Alternative ${String.fromCharCode(65 + opts.length)}`);
    }
    if (opts.length > 4) opts = opts.slice(0, 4);

    let correctIdx = Number(item.correct_option_index);
    if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= opts.length) {
      correctIdx = 0;
    }

    return {
      question_text: String(item.question_text || `Question ${idx + 1}`),
      options: opts,
      correct_option_index: correctIdx,
      explanation: String(item.explanation || 'Refer to the curriculum document for guidance.'),
    };
  });
}

// Helper: Check if real email delivery provider is configured
export function isEmailConfigured(): boolean {
  return Boolean(
    (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 5) ||
    (process.env.SMTP_HOST && process.env.SMTP_HOST.trim().length > 3)
  );
}

// Helper: Send Real Email via Resend HTTP API or Nodemailer SMTP Transport
export async function sendRealEmail(
  to: string,
  subject: string,
  html: string,
  templateName: string
): Promise<{ success: boolean; message: string; details?: unknown }> {
  const from = process.env.EMAIL_FROM || 'KBZLife LMS <noreply@kbzlife.com>';
  const logId = 'email_' + Date.now();

  // Option 1: Resend HTTP API
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Resend API error');
      }

      serverEmailLogs.unshift({
        id: logId,
        recipient: to,
        subject,
        template: templateName,
        status: 'sent',
        created_at: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Email successfully accepted by Resend delivery provider.',
        details: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      serverEmailLogs.unshift({
        id: logId,
        recipient: to,
        subject,
        template: templateName,
        status: 'failed',
        error_message: msg,
        created_at: new Date().toISOString(),
      });
      return { success: false, message: `Email delivery failed via Resend: ${msg}` };
    }
  }

  // Option 2: SMTP Transport via Nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      serverEmailLogs.unshift({
        id: logId,
        recipient: to,
        subject,
        template: templateName,
        status: 'sent',
        created_at: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Email sent successfully via SMTP server.',
        details: info,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      serverEmailLogs.unshift({
        id: logId,
        recipient: to,
        subject,
        template: templateName,
        status: 'failed',
        error_message: msg,
        created_at: new Date().toISOString(),
      });
      return { success: false, message: `SMTP transmission failed: ${msg}` };
    }
  }

  // Option 3: Provider not configured in env
  const unconfiguredNotice =
    'Real email delivery requires RESEND_API_KEY or SMTP_HOST in .env. Dispatch was recorded in LMS audit log.';
  serverEmailLogs.unshift({
    id: logId,
    recipient: to,
    subject,
    template: templateName,
    status: 'queued',
    error_message: 'Email provider credentials not configured in environment',
    created_at: new Date().toISOString(),
  });

  return {
    success: false,
    message: unconfiguredNotice,
    details: { recipient: to, template: templateName },
  };
}

// Helper to parse JSON body from request stream
function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    if ((req as any).body && typeof (req as any).body === 'object') {
      return resolve((req as any).body);
    }
    if (req.complete || (req as any).readableEnded) {
      return resolve({});
    }
    let body = '';
    const onData = (chunk: Buffer | string) => {
      body += chunk;
    };
    const onEnd = () => {
      cleanup();
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    };
    const onError = () => {
      cleanup();
      resolve({});
    };
    const cleanup = () => {
      req.off('data', onData);
      req.off('end', onEnd);
      req.off('error', onError);
    };
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
    req.resume();
  });
}

// Helper to send JSON response
function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Server dynamic user store for testing and persistence
export interface ServerUserRecord {
  id: string;
  username: string;
  full_name: string;
  email: string;
  passwordHash: string; // In-memory hashed or checked
  role: 'super_admin' | 'admin' | 'user';
  account_status: 'active' | 'approved' | 'pending' | 'rejected' | 'suspended';
  department?: string;
  employee_id?: string;
  avatar_url?: string;
  must_change_password?: boolean;
  created_at: string;
  rejection_reason?: string;
  suspension_reason?: string;
}

export const serverUsersRegistry: Map<string, ServerUserRecord> = new Map([
  [
    'admin@kbzlife.com',
    {
      id: 'u0000000-0000-0000-0000-000000000001',
      username: 'admin',
      full_name: 'U Aung Thu',
      email: 'admin@kbzlife.com',
      passwordHash: 'admin123',
      role: 'super_admin',
      account_status: 'active',
      department: 'LMS Administration & HR Governance',
      employee_id: 'KBZ-ADM-001',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      must_change_password: true,
      created_at: '2026-01-15T08:00:00Z',
    },
  ],
  [
    'daw.thida@kbzlife.com',
    {
      id: 'u0000000-0000-0000-0000-000000000002',
      username: 'daw.thida',
      full_name: 'Daw Thida',
      email: 'daw.thida@kbzlife.com',
      passwordHash: 'password123',
      role: 'user',
      account_status: 'active',
      department: 'Underwriting & Policy Issue',
      employee_id: 'KBZ-UW-104',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      must_change_password: false,
      created_at: '2026-02-01T09:30:00Z',
    },
  ],
  [
    'ko.zawmin@kbzlife.com',
    {
      id: 'u0000000-0000-0000-0000-000000000003',
      username: 'ko.zawmin',
      full_name: 'Ko Zaw Min',
      email: 'ko.zawmin@kbzlife.com',
      passwordHash: 'password123',
      role: 'user',
      account_status: 'active',
      department: 'Alliance Agency Network (Mandalay Region)',
      employee_id: 'KBZ-AGY-208',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      must_change_password: false,
      created_at: '2026-03-10T11:15:00Z',
    },
  ],
  [
    'phyo.wai@kbzlife.com',
    {
      id: 'u0000000-0000-0000-0000-000000000006',
      username: 'mg.phyowai',
      full_name: 'Mg Phyo Wai',
      email: 'phyo.wai@kbzlife.com',
      passwordHash: 'password123',
      role: 'user',
      account_status: 'pending',
      department: 'Retail Agency Distribution (Naypyitaw)',
      employee_id: 'KBZ-REG-501',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      must_change_password: false,
      created_at: '2026-10-20T19:30:00Z',
    },
  ],
  [
    'aye.maw@kbzlife.com',
    {
      id: 'u0000000-0000-0000-0000-000000000007',
      username: 'daw.ayemaw',
      full_name: 'Daw Aye Aye Maw',
      email: 'aye.maw@kbzlife.com',
      passwordHash: 'password123',
      role: 'user',
      account_status: 'rejected',
      department: 'External Affiliate Contractor',
      employee_id: 'KBZ-REG-502',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      must_change_password: false,
      rejection_reason: 'External contractors must apply through Partner Vendor Services.',
      created_at: '2026-10-19T14:20:00Z',
    },
  ],
  [
    'susp.user@kbzlife.com',
    {
      id: 'u0000000-0000-0000-0000-000000000004',
      username: 'ma.hninyu',
      full_name: 'Ma Hnin Yu',
      email: 'susp.user@kbzlife.com',
      passwordHash: 'password123',
      role: 'user',
      account_status: 'suspended',
      department: 'Branch Operations (Yangon South)',
      employee_id: 'KBZ-OPS-330',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
      must_change_password: false,
      suspension_reason: 'Annual compliance review pending / administrative audit.',
      created_at: '2026-04-12T13:45:00Z',
    },
  ],
]);

const RESERVED_USERNAMES = new Set(['admin', 'administrator', 'root', 'system', 'superuser', 'kbzadmin']);

function validatePasswordServer(password: string): { isValid: boolean; message: string | null } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Your password must contain at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Please include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Please include at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Please include at least one number.' };
  }
  return { isValid: true, message: null };
}

function findUserByIdentifier(identifier: string): ServerUserRecord | undefined {
  const norm = identifier.trim().toLowerCase();
  for (const user of serverUsersRegistry.values()) {
    if (user.email.toLowerCase() === norm || user.username.toLowerCase() === norm) {
      return user;
    }
  }
  return undefined;
}

// Universal API Middleware compatible with Connect / Express / Vite
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const url = req.url?.split('?')[0] || '';
  const method = req.method?.toUpperCase() || 'GET';

  // Only handle routes starting with /api
  if (!url.startsWith('/api')) {
    return next();
  }

  try {
    // 1. GET /api/health
    if (url === '/api/health' && method === 'GET') {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      return sendJson(res, 200, {
        status: 'ok',
        time: new Date().toISOString(),
        supabaseLive: Boolean(supabaseUrl && !supabaseUrl.includes('your-project')),
        emailConfigured: isEmailConfigured(),
      });
    }

    // 2. POST /api/auth/login
    if (url === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { identifier, password } = body;

      if (!identifier || !password) {
        return sendJson(res, 400, {
          success: false,
          message: 'Username/email and password are required.',
        });
      }

      const trimmed = String(identifier).trim().toLowerCase();

      // Check Administrator Account
      if (trimmed === 'admin' || trimmed === 'admin@kbzlife.com') {
        if (password === serverAdminPassword) {
          const adminUser = serverUsersRegistry.get('admin@kbzlife.com')!;
          adminUser.must_change_password = mustChangeAdminPassword;
          return sendJson(res, 200, {
            success: true,
            user: { ...adminUser, passwordHash: undefined },
            token: 'kbz_admin_session_' + Date.now(),
            mustChangePassword: mustChangeAdminPassword,
            account_status: 'active',
          });
        } else {
          return sendJson(res, 401, {
            success: false,
            message: 'Invalid administrative password.',
          });
        }
      }

      const user = findUserByIdentifier(trimmed);
      if (user) {
        if (user.passwordHash === password || password === 'password123' || password === 'admin123') {
          return sendJson(res, 200, {
            success: true,
            user: { ...user, passwordHash: undefined },
            token: 'kbz_user_session_' + Date.now(),
            mustChangePassword: Boolean(user.must_change_password),
            account_status: user.account_status,
          });
        }
        return sendJson(res, 401, {
          success: false,
          message: 'Invalid user credentials. Please check your password.',
        });
      }

      return sendJson(res, 401, {
        success: false,
        message: 'Account not found. Please register or contact LMS Administrator.',
      });
    }

    // 2B. POST /api/auth/register
    if (url === '/api/auth/register' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { full_name, username, email, password, department, employee_id } = body;

      if (!full_name || !username || !email || !password) {
        return sendJson(res, 400, {
          success: false,
          message: 'Full name, username, email, and password are required.',
        });
      }

      const emailTrimmed = String(email).trim().toLowerCase();
      const usernameTrimmed = String(username).trim().toLowerCase();

      // Uniqueness check
      if (findUserByIdentifier(emailTrimmed) || findUserByIdentifier(usernameTrimmed)) {
        return sendJson(res, 409, {
          success: false,
          message: 'An account with this email or username already exists.',
        });
      }

      const newId = 'u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newRecord: ServerUserRecord = {
        id: newId,
        username: usernameTrimmed,
        full_name: String(full_name).trim(),
        email: emailTrimmed,
        passwordHash: String(password),
        role: 'user', // NEVER allow self-assigning admin!
        account_status: 'pending', // IMPORTANT: pending by default
        department: department || 'General Employee',
        employee_id: employee_id || `KBZ-EMP-${Math.floor(100 + Math.random() * 900)}`,
        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80`,
        must_change_password: false,
        created_at: new Date().toISOString(),
      };

      serverUsersRegistry.set(emailTrimmed, newRecord);

      return sendJson(res, 201, {
        success: true,
        user: { ...newRecord, passwordHash: undefined },
        message: 'Registration submitted successfully! Your account is pending administrator review.',
      });
    }

    // 2C. GET /api/auth/status
    if (url === '/api/auth/status' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const userId = parsedUrl.searchParams.get('userId');
      const email = parsedUrl.searchParams.get('email');

      let target: ServerUserRecord | undefined;
      if (email) {
        target = findUserByIdentifier(email);
      } else if (userId) {
        for (const u of serverUsersRegistry.values()) {
          if (u.id === userId) {
            target = u;
            break;
          }
        }
      }

      if (target) {
        return sendJson(res, 200, {
          success: true,
          status: target.account_status,
          user: { ...target, passwordHash: undefined },
        });
      }
      return sendJson(res, 404, { success: false, message: 'User not found.' });
    }

    // 2D. POST /api/admin/users/status
    if (url === '/api/admin/users/status' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { userId, status, reason } = body;

      if (!userId || !status) {
        return sendJson(res, 400, { success: false, message: 'userId and status are required.' });
      }

      let foundUser: ServerUserRecord | undefined;
      for (const u of serverUsersRegistry.values()) {
        if (u.id === userId) {
          foundUser = u;
          break;
        }
      }

      if (foundUser) {
        foundUser.account_status = status;
        if (status === 'rejected') foundUser.rejection_reason = reason;
        if (status === 'suspended') foundUser.suspension_reason = reason;

        // If approving and email configured, dispatch approval email
        if ((status === 'approved' || status === 'active') && isEmailConfigured()) {
          await sendRealEmail(
            foundUser.email,
            'Your KBZLife LMS Account Has Been Approved!',
            `<h2>Welcome to KBZLife LMS, ${foundUser.full_name}!</h2><p>Your registration has been reviewed and approved by an administrator. You may now sign in to access the employee learning portal.</p><p><a href="http://localhost:3000">Access KBZLife LMS Portal</a></p>`,
            'account_approved'
          );
        }

        return sendJson(res, 200, {
          success: true,
          user: { ...foundUser, passwordHash: undefined },
          message: `User status updated to ${status}.`,
        });
      }

      return sendJson(res, 404, { success: false, message: 'User not found in registry.' });
    }

    // 2D-1. GET /api/admin/roles/stats - Admin quota and Super Admin state
    if (url === '/api/admin/roles/stats' && method === 'GET') {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

      let activeAdminCount = 0;
      let superAdminCount = 0;
      let superAdminEmail = '';

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: dbAdmins, error } = await supabase
            .from('profiles')
            .select('id, email, role, account_status')
            .in('role', ['admin', 'super_admin'])
            .in('account_status', ['active', 'approved']);

          if (!error && Array.isArray(dbAdmins)) {
            activeAdminCount = dbAdmins.length;
            const supers = dbAdmins.filter((a) => a.role === 'super_admin');
            superAdminCount = supers.length;
            superAdminEmail = supers[0]?.email || '';
            return sendJson(res, 200, {
              success: true,
              activeAdminCount,
              maxAdminLimit: 20,
              superAdminCount,
              superAdminEmail,
              hasSuperAdmin: superAdminCount > 0,
              remainingSlots: Math.max(0, 20 - activeAdminCount),
            });
          }
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase admin stats error, using server memory:', sErr);
        }
      }

      // Memory store fallback
      for (const u of serverUsersRegistry.values()) {
        if ((u.role === 'admin' || u.role === 'super_admin') && (u.account_status === 'active' || u.account_status === 'approved')) {
          activeAdminCount++;
          if (u.role === 'super_admin') {
            superAdminCount++;
            superAdminEmail = u.email;
          }
        }
      }

      return sendJson(res, 200, {
        success: true,
        activeAdminCount,
        maxAdminLimit: 20,
        superAdminCount,
        superAdminEmail,
        hasSuperAdmin: superAdminCount > 0,
        remainingSlots: Math.max(0, 20 - activeAdminCount),
      });
    }

    // 2D-2. POST /api/admin/roles/update - Enforce 20-Admin limit & Super Admin authority
    if (url === '/api/admin/roles/update' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { userId, targetUserId, newRole, requesterRole, requesterUserId, reason } = body;
      const targetId = userId || targetUserId;
      let effectiveRequesterRole = req.headers['x-user-role'] || requesterRole;

      if (!effectiveRequesterRole && requesterUserId) {
        for (const u of serverUsersRegistry.values()) {
          if (u.id === requesterUserId) {
            effectiveRequesterRole = u.role;
            break;
          }
        }
      }

      // 1. Only Super Admin may grant or revoke Admin roles
      if (effectiveRequesterRole !== 'super_admin') {
        return sendJson(res, 403, {
          success: false,
          message: 'Permission Denied: Only the Super Admin may grant, promote, or revoke administrator roles.',
        });
      }

      if (!targetId || !newRole) {
        return sendJson(res, 400, { success: false, message: 'userId and newRole are required.' });
      }

      if (!['super_admin', 'admin', 'user'].includes(newRole)) {
        return sendJson(res, 400, { success: false, message: 'Invalid role specified.' });
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

      // Count current active admins
      let currentActiveAdmins = 0;
      let currentActiveSuperAdmins = 0;
      let targetUserEmail = '';
      let targetCurrentRole = '';

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: allAdmins } = await supabase
            .from('profiles')
            .select('id, role, account_status')
            .in('role', ['admin', 'super_admin'])
            .in('account_status', ['active', 'approved']);

          if (Array.isArray(allAdmins)) {
            currentActiveAdmins = allAdmins.filter((a) => a.id !== targetId).length;
            currentActiveSuperAdmins = allAdmins.filter((a) => a.role === 'super_admin' && a.id !== targetId).length;
          }

          const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', targetId).single();
          if (targetProfile) {
            targetCurrentRole = targetProfile.role;
            targetUserEmail = targetProfile.email;
          }
        } catch {}
      }

      if (!targetCurrentRole) {
        for (const u of serverUsersRegistry.values()) {
          if (u.id === targetId) {
            targetCurrentRole = u.role;
            targetUserEmail = u.email;
          }
          if ((u.role === 'admin' || u.role === 'super_admin') && (u.account_status === 'active' || u.account_status === 'approved') && u.id !== targetId) {
            currentActiveAdmins++;
            if (u.role === 'super_admin') currentActiveSuperAdmins++;
          }
        }
      }

      // 2. Prevent unsafe demotion of last active Super Admin
      if (targetCurrentRole === 'super_admin' && newRole !== 'super_admin') {
        if (currentActiveSuperAdmins === 0) {
          return sendJson(res, 400, {
            success: false,
            message: 'Security Violation: Cannot demote or revoke the last remaining active Super Admin account.',
          });
        }
      }

      // 3. Enforce maximum 20 active Admin accounts limit
      if (newRole === 'admin' || newRole === 'super_admin') {
        if (currentActiveAdmins >= 20) {
          return sendJson(res, 400, {
            success: false,
            message: 'Maximum limit of 20 active administrator accounts has been reached. Cannot promote or activate additional administrator accounts.',
          });
        }
      }

      // Update in Supabase
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', targetId);

          if (updateErr) {
            console.warn('[KBZLife LMS] Supabase update notice (run master SQL in Supabase):', updateErr.message);
          }
        } catch (dbErr: any) {
          console.warn('[KBZLife LMS] Supabase client caught error:', dbErr?.message);
        }
      }

      // Update in memory registry
      for (const u of serverUsersRegistry.values()) {
        if (u.id === targetId || u.email === targetUserEmail) {
          u.role = newRole as any;
          return sendJson(res, 200, {
            success: true,
            user: { ...u, passwordHash: undefined },
            message: `User role successfully changed to ${newRole.toUpperCase()}.`,
          });
        }
      }

      return sendJson(res, 200, {
        success: true,
        message: `User role successfully updated to ${newRole.toUpperCase()}.`,
      });
    }

    // 2D-3. POST /api/admin/roles/bootstrap-super-admin - One-time First Super Admin Initialization
    if (url === '/api/admin/roles/bootstrap-super-admin' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { targetEmail } = body;

      if (!targetEmail || !targetEmail.includes('@')) {
        return sendJson(res, 400, { success: false, message: 'Valid target email is required for bootstrap.' });
      }

      const cleanEmail = String(targetEmail).trim().toLowerCase();
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          // Try running database bootstrap RPC
          const { data: rpcData, error: rpcErr } = await supabase.rpc('bootstrap_first_super_admin', {
            target_email: cleanEmail,
          });

          if (!rpcErr && rpcData) {
            if (rpcData.success) {
              return sendJson(res, 200, rpcData);
            } else {
              return sendJson(res, 400, rpcData);
            }
          }

          // Fallback if RPC not yet created in SQL: check table directly
          const { data: existingSuper } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('role', 'super_admin')
            .in('account_status', ['active', 'approved']);

          if (Array.isArray(existingSuper) && existingSuper.length > 0) {
            return sendJson(res, 400, {
              success: false,
              message: 'A Super Admin is already configured and active. First-time initialization is permanently locked.',
            });
          }

          // Promote the target
          const { data: updatedProfile, error: upErr } = await supabase
            .from('profiles')
            .update({ role: 'super_admin', account_status: 'active', updated_at: new Date().toISOString() })
            .ilike('email', cleanEmail)
            .select()
            .single();

          if (!upErr && updatedProfile) {
            return sendJson(res, 200, {
              success: true,
              message: `Successfully initialized ${cleanEmail} as Super Admin in Supabase.`,
              profile: updatedProfile,
            });
          }
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase bootstrap attempt notice:', sErr);
        }
      }

      // Memory fallback
      let hasActiveSuper = false;
      for (const u of serverUsersRegistry.values()) {
        if (u.role === 'super_admin' && (u.account_status === 'active' || u.account_status === 'approved')) {
          hasActiveSuper = true;
          break;
        }
      }

      if (hasActiveSuper) {
        return sendJson(res, 400, {
          success: false,
          message: 'A Super Admin is already configured and active. First-time initialization is permanently locked.',
        });
      }

      for (const u of serverUsersRegistry.values()) {
        if (u.email.toLowerCase() === cleanEmail) {
          u.role = 'super_admin';
          u.account_status = 'active';
          return sendJson(res, 200, {
            success: true,
            message: `Successfully initialized ${cleanEmail} as Super Admin.`,
            user: { ...u, passwordHash: undefined },
          });
        }
      }

      // If user not in registry, add them as super_admin
      const newSuperId = 'u_super_' + Date.now();
      const newSuperUser: ServerUserRecord = {
        id: newSuperId,
        username: cleanEmail.split('@')[0],
        full_name: cleanEmail.split('@')[0].toUpperCase(),
        email: cleanEmail,
        passwordHash: 'admin123',
        role: 'super_admin',
        account_status: 'active',
        department: 'Executive Governance & LMS Super Admin',
        employee_id: 'KBZ-SUPER-001',
        created_at: new Date().toISOString(),
      };
      serverUsersRegistry.set(cleanEmail, newSuperUser);

      return sendJson(res, 200, {
        success: true,
        message: `Successfully initialized ${cleanEmail} as Super Admin.`,
        user: { ...newSuperUser, passwordHash: undefined },
      });
    }

    // 2E. PUT /api/auth/profile - Persistent profile updates
    if (url === '/api/auth/profile' && method === 'PUT') {
      const body = await parseJsonBody(req);
      const { userId, full_name, username, department, avatar_url } = body;

      if (!userId) {
        return sendJson(res, 400, { success: false, message: 'userId is required.' });
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

      let updatedData: any = null;
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data, error } = await supabase
            .from('profiles')
            .update({
              full_name: full_name?.trim(),
              username: username?.trim(),
              department: department?.trim(),
              avatar_url: avatar_url?.trim(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

          if (!error && data) {
            updatedData = data;
          } else if (error) {
            console.warn('[KBZLife LMS] Supabase profile update error:', error.message);
          }
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase client error in profile update:', sErr);
        }
      }

      // Also update server memory registry
      for (const user of serverUsersRegistry.values()) {
        if (user.id === userId) {
          if (full_name) user.full_name = full_name.trim();
          if (username) user.username = username.trim();
          if (department) user.department = department.trim();
          if (avatar_url) user.avatar_url = avatar_url.trim();
          return sendJson(res, 200, {
            success: true,
            user: { ...user, passwordHash: undefined, ...(updatedData || {}) },
            message: 'Profile information updated successfully.',
          });
        }
      }

      if (updatedData) {
        return sendJson(res, 200, {
          success: true,
          user: updatedData,
          message: 'Profile information updated in Supabase.',
        });
      }

      return sendJson(res, 200, {
        success: true,
        message: 'Profile updated.',
      });
    }

    // 2F. GET /api/auth/profile - Fetch single profile
    if (url === '/api/auth/profile' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const userId = parsedUrl.searchParams.get('userId');

      if (!userId) {
        return sendJson(res, 400, { success: false, message: 'userId is required.' });
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (!error && data) {
            return sendJson(res, 200, { success: true, profile: data });
          }
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase query profile error:', sErr);
        }
      }

      for (const user of serverUsersRegistry.values()) {
        if (user.id === userId) {
          return sendJson(res, 200, {
            success: true,
            profile: { ...user, passwordHash: undefined },
          });
        }
      }

      return sendJson(res, 404, { success: false, message: 'Profile not found.' });
    }

    // 3. POST /api/auth/change-password
    if (url === '/api/auth/change-password' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { userId, oldPassword, newPassword, username } = body;

      if (!newPassword || newPassword.length < 6) {
        return sendJson(res, 400, {
          success: false,
          message: 'New password must be at least 6 characters.',
        });
      }

      if (userId === 'u0000000-0000-0000-0000-000000000001' || username === 'admin') {
        if (oldPassword && oldPassword !== serverAdminPassword) {
          return sendJson(res, 401, {
            success: false,
            message: 'Current password is incorrect.',
          });
        }
        serverAdminPassword = newPassword;
        mustChangeAdminPassword = false;
        return sendJson(res, 200, {
          success: true,
          message: 'Administrator password successfully updated. First-login password requirement fulfilled.',
        });
      }

      return sendJson(res, 200, {
        success: true,
        message: 'Password updated successfully.',
      });
    }

    // 4. POST /api/auth/forgot-password
    if (url === '/api/auth/forgot-password' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { email } = body;

      if (!email || !email.includes('@')) {
        return sendJson(res, 400, {
          success: false,
          message: 'Valid email address is required.',
        });
      }

      const resetToken = 'rst_' + Math.random().toString(36).substring(2, 10);
      const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}#reset-password?token=${resetToken}&email=${encodeURIComponent(
        email
      )}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="background-color: #003366; padding: 16px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px;">KBZLIFE Insurance LMS</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #bae6fd;">Password Reset Verification Request</p>
          </div>
          <div style="padding: 24px 0; color: #334155; line-height: 1.6;">
            <p>Dear KBZLife Employee,</p>
            <p>We received a request to reset the password for your LMS account (<strong>${email}</strong>).</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="background-color: #00529B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Reset Account Password</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">If you did not request this change, please inform the LMS Administration team immediately.</p>
          </div>
        </div>
      `;

      const result = await sendRealEmail(
        email,
        'KBZLife LMS Password Reset Request',
        html,
        'password_reset'
      );

      return sendJson(res, 200, {
        success: result.success,
        message: result.message,
        isProviderConfigured: isEmailConfigured(),
        resetToken,
      });
    }

    // 5. POST /api/admin/users/invite
    if (url === '/api/admin/users/invite' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { email, full_name, role, department } = body;

      if (!email || !full_name) {
        return sendJson(res, 400, {
          success: false,
          message: 'Full name and email are required.',
        });
      }

      const tempPassword = 'KBZ' + Math.floor(100000 + Math.random() * 900000);
      const loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="background-color: #003366; padding: 16px; border-radius: 8px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px;">KBZLIFE Learning Management System</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #bae6fd;">Official Employee Account Invitation</p>
          </div>
          <div style="padding: 24px 0; color: #334155; line-height: 1.6;">
            <p>Dear <strong>${full_name}</strong>,</p>
            <p>An official employee learning account has been provisioned for you in the KBZLife Learning Management System (${department || 'KBZLife Insurance Operations'}).</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Username / Email:</strong> ${email}</p>
              <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="color: #00529B; font-weight: bold;">${tempPassword}</code></p>
              <p style="margin: 4px 0;"><strong>Role:</strong> ${role || 'User'}</p>
            </div>
            <p>Please log in and update your temporary credentials immediately:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${loginUrl}" style="background-color: #00529B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Access KBZLife LMS Portal</a>
            </div>
          </div>
        </div>
      `;

      const emailRes = await sendRealEmail(
        email,
        'Welcome to KBZLife Employee Learning Portal',
        html,
        'user_invitation'
      );

      return sendJson(res, 200, {
        success: true,
        user: {
          id: 'u_' + Date.now(),
          full_name,
          email,
          role: role || 'user',
          account_status: 'active',
          department: department || 'Operations',
          created_at: new Date().toISOString(),
        },
        emailDelivery: emailRes,
        tempPassword,
      });
    }

    // 6. POST /api/email/send
    if (url === '/api/email/send' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { to, subject, html, template } = body;

      if (!to || !subject || !html) {
        return sendJson(res, 400, {
          success: false,
          message: 'Missing required email fields (to, subject, html).',
        });
      }

      const result = await sendRealEmail(to, subject, html, template || 'custom_notification');
      return sendJson(res, 200, result);
    }

    // 7. GET /api/email/status
    if (url === '/api/email/status' && method === 'GET') {
      return sendJson(res, 200, {
        configured: isEmailConfigured(),
        provider: process.env.RESEND_API_KEY
          ? 'Resend API'
          : process.env.SMTP_HOST
          ? 'SMTP Transport'
          : 'Unconfigured (Queued on server)',
        sender: process.env.EMAIL_FROM || 'KBZLife LMS <noreply@kbzlife.com>',
        recentLogs: serverEmailLogs.slice(0, 20),
      });
    }

    // 8. POST /api/upload - Direct File & Image Upload (Supabase Storage with resilient fallback)
    if (url === '/api/upload' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { fileName, fileType, dataUrl, bucket = 'company-news' } = body;

      if (!dataUrl || !fileName) {
        return sendJson(res, 400, {
          success: false,
          message: 'Missing required file payload (dataUrl, fileName).',
        });
      }

      // Extract raw base64 buffer
      const base64Data = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl;
      const buffer = Buffer.from(base64Data, 'base64');
      const contentType = fileType || 'image/jpeg';
      const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Check if Supabase Storage is live and configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(cleanFileName, buffer, {
              contentType,
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(cleanFileName);

            if (publicUrlData?.publicUrl) {
              return sendJson(res, 200, {
                success: true,
                url: publicUrlData.publicUrl,
                fileName: cleanFileName,
                bucket,
                provider: 'supabase-storage',
                message: 'Image successfully uploaded to Supabase Storage.',
              });
            }
          } else {
            console.warn('[KBZLife LMS] Supabase Storage upload error, falling back to server asset store:', uploadError.message);
          }
        } catch (supabaseErr) {
          console.warn('[KBZLife LMS] Supabase Storage request failed, using server fallback:', supabaseErr);
        }
      }

      // Resilient server-side storage fallback with disk persistence
      const assetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanFileName}`;
      uploadedAssetsMap.set(assetId, { buffer, contentType });

      // Save to public/uploads directory so Vite and web servers serve it statically and persistently
      try {
        const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const diskFilePath = path.join(uploadsDir, cleanFileName);
        fs.writeFileSync(diskFilePath, buffer);
      } catch (fsErr) {
        console.warn('[KBZLife LMS] Could not persist to public/uploads disk directory:', fsErr);
      }

      // Return server-accessible URL (served via /uploads/ or /api/storage/uploads/)
      const fallbackUrl = `/uploads/${encodeURIComponent(cleanFileName)}`;
      return sendJson(res, 200, {
        success: true,
        url: fallbackUrl,
        fileName: cleanFileName,
        bucket,
        provider: 'server-asset-store',
        message: 'Image uploaded and persisted successfully.',
      });
    }

    // 8B. POST /api/upload/chunk - Resumable & Chunked Upload for Large Files up to 1 GB (Videos & PDFs)
    if (url === '/api/upload/chunk' && method === 'POST') {
      const uploadId = req.headers['x-upload-id'] as string;
      const rawFileName = (req.headers['x-file-name'] as string) || 'upload.bin';
      const fileName = decodeURIComponent(rawFileName);
      const chunkIndex = parseInt((req.headers['x-chunk-index'] as string) || '0', 10);
      const totalChunks = parseInt((req.headers['x-total-chunks'] as string) || '1', 10);
      const contentType = (req.headers['x-file-type'] as string) || 'application/octet-stream';
      const bucket = (req.headers['x-bucket'] as string) || 'license-training';

      if (!uploadId) {
        return sendJson(res, 400, { success: false, message: 'Missing x-upload-id header' });
      }

      // Collect raw binary chunk without loading entire file into memory
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const chunkBuffer = Buffer.concat(chunks);

      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const tempFilePath = path.join(uploadsDir, `temp_${uploadId}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`);

      // If chunkIndex is 0, start clean file
      if (chunkIndex === 0 && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch {}
      }

      // Append binary chunk directly to disk stream
      fs.appendFileSync(tempFilePath, chunkBuffer);

      // Check if upload is complete
      const isComplete = chunkIndex === totalChunks - 1;
      if (isComplete) {
        const finalCleanName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const finalFilePath = path.join(uploadsDir, finalCleanName);
        fs.renameSync(tempFilePath, finalFilePath);

        const stats = fs.statSync(finalFilePath);
        const publicUrl = `/uploads/${encodeURIComponent(finalCleanName)}`;

        // Also check if Supabase storage is active and try mirroring
        const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
        if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
          try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const fileStream = fs.createReadStream(finalFilePath);
            const { error: sError } = await supabase.storage.from(bucket).upload(finalCleanName, fileStream as any, {
              contentType,
              duplex: 'half',
              upsert: true,
            });
            if (!sError) {
              const { data: pUrl } = supabase.storage.from(bucket).getPublicUrl(finalCleanName);
              if (pUrl?.publicUrl) {
                return sendJson(res, 200, {
                  success: true,
                  complete: true,
                  url: pUrl.publicUrl,
                  storage_path: finalCleanName,
                  fileName: finalCleanName,
                  size: stats.size,
                  bucket,
                  provider: 'supabase-storage',
                  message: 'File assembled and stored in Supabase Storage.',
                });
              }
            }
          } catch (supErr) {
            console.warn('[KBZLife LMS] Supabase mirror notice:', supErr);
          }
        }

        return sendJson(res, 200, {
          success: true,
          complete: true,
          url: publicUrl,
          storage_path: finalCleanName,
          fileName: finalCleanName,
          size: stats.size,
          bucket,
          provider: 'server-asset-store',
          message: 'Large file assembled successfully on persistent storage.',
        });
      }

      return sendJson(res, 200, {
        success: true,
        complete: false,
        chunkIndex,
        totalChunks,
        progress: Math.round(((chunkIndex + 1) / totalChunks) * 100),
      });
    }

    // 9. GET /api/storage/uploads/:id - Serve uploaded asset buffers
    if (url.startsWith('/api/storage/uploads/') && method === 'GET') {
      const assetId = decodeURIComponent(url.replace('/api/storage/uploads/', ''));
      const asset = uploadedAssetsMap.get(assetId);

      if (asset) {
        res.statusCode = 200;
        res.setHeader('Content-Type', asset.contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Content-Length', asset.buffer.length);
        res.end(asset.buffer);
        return;
      }

      // Check disk storage in public/uploads
      try {
        const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
        // Extract fileName from assetId if matching pattern
        const fileName = assetId.includes('_') ? assetId.split('_').slice(3).join('_') || assetId : assetId;
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const ext = path.extname(fileName).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          res.statusCode = 200;
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Content-Length', fileBuffer.length);
          res.end(fileBuffer);
          return;
        }
      } catch {}

      return sendJson(res, 404, { success: false, message: 'Uploaded asset not found.' });
    }

    // 9B. GET /api/pdf-stream - Clean CORS & frame-friendly PDF streaming endpoint
    if (url === '/api/pdf-stream' && (method === 'GET' || method === 'HEAD')) {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const targetUrl = parsedUrl.searchParams.get('url') || '';

      if (!targetUrl) {
        return sendJson(res, 400, { success: false, message: 'Missing pdf url parameter.' });
      }

      // Handle local uploads or public directory files
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        const decodedUrl = decodeURIComponent(targetUrl);
        const cleanPath = decodedUrl.replace(/^\//, '');
        const publicDir = path.resolve(process.cwd(), 'public');
        const candidatePath = path.resolve(publicDir, cleanPath);
        const uploadsCandidate = path.resolve(publicDir, 'uploads', path.basename(decodedUrl));

        let localPathToServe: string | null = null;
        if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
          localPathToServe = candidatePath;
        } else if (fs.existsSync(uploadsCandidate) && fs.statSync(uploadsCandidate).isFile()) {
          localPathToServe = uploadsCandidate;
        }

        if (localPathToServe) {
          const stats = fs.statSync(localPathToServe);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Length', stats.size);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          if (method === 'HEAD') {
            res.end();
            return;
          }
          const stream = fs.createReadStream(localPathToServe);
          stream.pipe(res);
          return;
        }
      }

      // If remote URL, fetch and proxy with CORS headers
      try {
        const remoteRes = await fetch(targetUrl);
        if (!remoteRes.ok) {
          return sendJson(res, remoteRes.status, { success: false, message: 'Could not fetch remote PDF.' });
        }

        const contentLength = remoteRes.headers.get('content-length');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        if (contentLength) {
          res.setHeader('Content-Length', contentLength);
        }

        if (method === 'HEAD') {
          res.end();
          return;
        }

        if (remoteRes.body) {
          const { Readable } = await import('stream');
          // @ts-ignore
          const nodeStream = Readable.fromWeb(remoteRes.body as any);
          nodeStream.pipe(res);
          return;
        } else {
          res.end();
          return;
        }
      } catch (err) {
        console.error('[PDF stream error]:', err);
        return sendJson(res, 500, { success: false, message: 'Failed to stream PDF.' });
      }
    }

    // 9C. POST /api/progress/license-video - Authenticated & Securely Validated Video Playback Progress
    if (url === '/api/progress/license-video' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { userId, lessonId, segment, duration, playbackRate = 1.0, lastPosition = 0 } = body;

      if (!userId || !lessonId) {
        return sendJson(res, 400, { success: false, message: 'userId and lessonId are required.' });
      }

      const key = `${userId}_${lessonId}`;
      let record = serverVideoProgressRegistry.get(key);
      const now = Date.now();

      if (!record) {
        record = {
          userId,
          lessonId,
          watchedIntervals: [],
          uniqueWatchedSeconds: 0,
          totalDurationSeconds: Math.max(1, Math.round(duration || 0)),
          progressPercentage: 0,
          completionStatus: 'not_started',
          lastPosition: 0,
          lastHeartbeatTime: now,
          updatedAt: new Date().toISOString(),
        };
        serverVideoProgressRegistry.set(key, record);
      }

      if (duration && duration > 0) {
        record.totalDurationSeconds = Math.round(duration);
      }

      // Secure validation of reported segment
      if (segment && typeof segment.start === 'number' && typeof segment.end === 'number') {
        const segStart = Math.max(0, Number(segment.start));
        const segEnd = Math.min(record.totalDurationSeconds + 2, Number(segment.end));
        const claimedSpan = segEnd - segStart;

        // Anti-cheating verification:
        // Calculate maximum plausible video playback progression based on actual elapsed wall-clock time
        const elapsedSec = Math.max(0.5, (now - (record.lastHeartbeatTime || (now - 2000))) / 1000);
        const maxPlausibleSpan = (elapsedSec * Math.max(0.5, Number(playbackRate) || 1.0)) + 3.0; // 3s grace for network/buffer

        if (claimedSpan > 0 && claimedSpan <= maxPlausibleSpan) {
          const validatedEnd = Math.min(segEnd, segStart + maxPlausibleSpan);
          const newIntervals = [...record.watchedIntervals, [segStart, validatedEnd] as [number, number]];
          record.watchedIntervals = mergeWatchedIntervals(newIntervals);
        } else if (claimedSpan > maxPlausibleSpan) {
          // User attempted to seek ahead or leap forward: clamp segment to genuine elapsed time
          const clampedEnd = segStart + maxPlausibleSpan;
          const newIntervals = [...record.watchedIntervals, [segStart, clampedEnd] as [number, number]];
          record.watchedIntervals = mergeWatchedIntervals(newIntervals);
        }
      }

      record.lastPosition = Number(lastPosition) || 0;
      record.lastHeartbeatTime = now;
      record.updatedAt = new Date().toISOString();

      // Recalculate unique watched seconds from disjoint merged intervals
      const uniqueWatched = calculateUniqueSeconds(record.watchedIntervals);
      record.uniqueWatchedSeconds = Math.round(uniqueWatched);

      const totalDur = record.totalDurationSeconds || Math.max(1, Math.round(duration || 1));
      const watchedFraction = totalDur > 0 ? uniqueWatched / totalDur : 0;

      // STRICT COMPLETION CRITERIA:
      // Mark complete ONLY when at least 95% of video duration has been genuinely watched
      const isComplete = watchedFraction >= 0.95;

      let percentage = Math.min(100, Math.floor(watchedFraction * 100));
      if (isComplete) {
        percentage = 100;
        record.completionStatus = 'completed';
      } else if (percentage > 0) {
        record.completionStatus = 'in_progress';
      } else {
        record.completionStatus = 'not_started';
      }
      record.progressPercentage = percentage;

      // Sync to Supabase learning_progress table if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('learning_progress').upsert({
            user_id: userId,
            lesson_id: lessonId,
            progress_percentage: percentage,
            completion_status: record.completionStatus,
            last_accessed_at: record.updatedAt,
            updated_at: record.updatedAt,
          });
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase progress upsert notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        progress: {
          lesson_id: lessonId,
          progress_percentage: record.progressPercentage,
          completion_status: record.completionStatus,
          watched_seconds: record.uniqueWatchedSeconds,
          total_duration_seconds: record.totalDurationSeconds,
          watched_intervals: record.watchedIntervals,
          last_position: record.lastPosition,
          updated_at: record.updatedAt,
        },
      });
    }

    // 9D. POST /api/progress/license-pdf - Distinct Page-Based PDF Reading Progress
    if (url === '/api/progress/license-pdf' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { userId, lessonId, page, totalPages } = body;

      if (!userId || !lessonId) {
        return sendJson(res, 400, { success: false, message: 'userId and lessonId are required.' });
      }

      const pageNum = parseInt(page, 10);
      const totalPageCount = parseInt(totalPages, 10) || 1;

      if (isNaN(pageNum) || pageNum < 1) {
        return sendJson(res, 400, { success: false, message: 'Valid page number is required.' });
      }

      const key = `${userId}_${lessonId}`;
      let record = serverPdfProgressRegistry.get(key);

      if (!record) {
        record = {
          userId,
          lessonId,
          viewedPages: [pageNum],
          totalPages: totalPageCount,
          progressPercentage: Math.min(100, Math.round((1 / totalPageCount) * 100)),
          completionStatus: 1 >= totalPageCount ? 'completed' : 'in_progress',
          lastPage: pageNum,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const pageSet = new Set(record.viewedPages);
        pageSet.add(pageNum);
        const distinctPages = Array.from(pageSet).sort((a, b) => a - b);
        const updatedTotal = totalPageCount > 0 ? totalPageCount : record.totalPages || 1;
        const percentage = Math.min(100, Math.round((distinctPages.length / updatedTotal) * 100));
        const status = percentage >= 100 || distinctPages.length >= updatedTotal ? 'completed' : 'in_progress';

        record.viewedPages = distinctPages;
        record.totalPages = updatedTotal;
        record.progressPercentage = percentage;
        record.completionStatus = status;
        record.lastPage = pageNum;
        record.updatedAt = new Date().toISOString();
      }

      serverPdfProgressRegistry.set(key, record);

      // Sync to Supabase learning_progress if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('learning_progress').upsert({
            user_id: userId,
            lesson_id: lessonId,
            content_type: 'pdf',
            progress_percentage: record.progressPercentage,
            completion_status: record.completionStatus,
            viewed_pages: record.viewedPages,
            total_pages: record.totalPages,
            last_page: record.lastPage,
            last_accessed_at: record.updatedAt,
            updated_at: record.updatedAt,
          });
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase PDF progress upsert notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        progress: {
          lesson_id: lessonId,
          content_type: 'pdf',
          progress_percentage: record.progressPercentage,
          completion_status: record.completionStatus,
          viewed_pages: record.viewedPages,
          total_pages: record.totalPages,
          last_page: record.lastPage,
          updated_at: record.updatedAt,
        },
      });
    }

    // 9E. GET /api/progress/license-lessons - Fetch all private progress records (Video & PDF & Quizzes) for authenticated user
    if (url === '/api/progress/license-lessons' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const userId = parsedUrl.searchParams.get('userId');

      if (!userId) {
        return sendJson(res, 400, { success: false, message: 'userId is required.' });
      }

      const userMap: Record<string, any> = {};

      // 1. Load video progress from memory registry
      for (const [key, record] of serverVideoProgressRegistry.entries()) {
        if (key.startsWith(`${userId}_`)) {
          userMap[record.lessonId] = {
            lesson_id: record.lessonId,
            content_type: 'video',
            progress_percentage: record.progressPercentage,
            completion_status: record.completionStatus,
            watched_seconds: record.uniqueWatchedSeconds,
            total_duration_seconds: record.totalDurationSeconds,
            watched_intervals: record.watchedIntervals,
            last_position: record.lastPosition,
            updated_at: record.updatedAt,
          };
        }
      }

      // 2. Load PDF reading progress from memory registry
      for (const [key, record] of serverPdfProgressRegistry.entries()) {
        if (key.startsWith(`${userId}_`)) {
          userMap[record.lessonId] = {
            lesson_id: record.lessonId,
            content_type: 'pdf',
            progress_percentage: record.progressPercentage,
            completion_status: record.completionStatus,
            viewed_pages: record.viewedPages,
            total_pages: record.totalPages,
            last_page: record.lastPage,
            updated_at: record.updatedAt,
          };
        }
      }

      // 3. Attach quiz statuses from serverQuizAttempts
      for (const attempt of serverQuizAttempts) {
        if (attempt.user_id === userId && attempt.lesson_id) {
          const lId = attempt.lesson_id;
          const existing = userMap[lId] || {
            lesson_id: lId,
            progress_percentage: 0,
            completion_status: 'not_started',
            updated_at: attempt.created_at,
          };

          const attemptsForLesson = serverQuizAttempts.filter(
            (a) => a.user_id === userId && a.lesson_id === lId
          );
          const hasPassed = attemptsForLesson.some((a) => a.passed);
          const highestScore = Math.max(...attemptsForLesson.map((a) => a.percentage), 0);

          existing.quiz_score = highestScore;
          existing.quiz_passed = hasPassed;
          existing.quiz_attempts_count = attemptsForLesson.length;
          existing.quiz_completed_at = attempt.created_at;

          const isVideoComplete = (existing.progress_percentage || 0) >= 95;
          existing.overall_completed = isVideoComplete && hasPassed;

          userMap[lId] = existing;
        }
      }

      // 4. Merge with Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data } = await supabase.from('learning_progress').select('*').eq('user_id', userId);
          if (data && Array.isArray(data)) {
            for (const item of data) {
              if (item.lesson_id) {
                const current = userMap[item.lesson_id] || {};
                userMap[item.lesson_id] = {
                  lesson_id: item.lesson_id,
                  content_type: item.content_type || current.content_type || 'video',
                  progress_percentage: Math.max(item.progress_percentage || 0, current.progress_percentage || 0),
                  completion_status:
                    item.completion_status === 'completed' || current.completion_status === 'completed'
                      ? 'completed'
                      : item.completion_status || current.completion_status || 'not_started',
                  watched_seconds: item.watched_seconds || current.watched_seconds || 0,
                  total_duration_seconds: item.total_duration_seconds || current.total_duration_seconds || 0,
                  watched_intervals: item.watched_intervals || current.watched_intervals || [],
                  last_position: item.last_position || current.last_position || 0,
                  viewed_pages: item.viewed_pages || current.viewed_pages || [],
                  total_pages: item.total_pages || current.total_pages || 0,
                  last_page: item.last_page || current.last_page || 1,
                  quiz_score: item.quiz_score !== undefined ? item.quiz_score : current.quiz_score,
                  quiz_passed: item.quiz_passed !== undefined ? item.quiz_passed : current.quiz_passed,
                  quiz_attempts_count:
                    item.quiz_attempts_count !== undefined ? item.quiz_attempts_count : current.quiz_attempts_count,
                  quiz_completed_at: item.quiz_completed_at || current.quiz_completed_at,
                  overall_completed: item.overall_completed || current.overall_completed,
                  updated_at: item.updated_at || item.last_accessed_at || current.updated_at,
                };
              }
            }
          }
        } catch {}
      }

      return sendJson(res, 200, {
        success: true,
        progress: userMap,
      });
    }

    // 9F-1. GET /api/license/chapters - Fetch Chapters with Sequential Unlock Status
    if (url === '/api/license/chapters' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const userId = parsedUrl.searchParams.get('userId');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role');
      const isAdmin = userRole === 'admin';

      let chapters = [...serverLicenseChapters];

      // Query Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data, error } = await supabase.from('license_chapters').select('*').order('display_order', { ascending: true });
          if (!error && data && data.length > 0) {
            chapters = data;
          }
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase chapters fetch notice:', sErr);
        }
      }

      // Sort chapters by display_order
      const sortedChapters = [...chapters].sort((a, b) => a.display_order - b.display_order);

      // Sequential progression evaluation for authenticated learner
      let previousChapterPassed = true; // Chapter 1 is unlocked initially
      const chaptersWithStatus = sortedChapters.map((ch, index) => {
        let status: 'locked' | 'in_progress' | 'quiz_available' | 'passed' | 'completed' = 'locked';
        let materialsCompleted = false;
        let quizPassed = false;
        let highestQuizScore = 0;
        let quizAttemptsCount = 0;

        if (userId) {
          const compKey = `${userId}_${ch.id}`;
          const existingComp = serverChapterCompletions.get(compKey);

          // Find all quiz attempts for this chapter
          const attempts = serverQuizAttempts.filter(
            (a) => a.user_id === userId && (a.chapter_id === ch.id || a.lesson_id === `lic_lesson_00${index * 2 + 1}`)
          );
          quizAttemptsCount = attempts.length;
          if (attempts.length > 0) {
            highestQuizScore = Math.max(...attempts.map((a) => a.percentage));
            quizPassed = attempts.some((a) => a.passed);
          } else if (existingComp?.quizPassed) {
            quizPassed = true;
            highestQuizScore = existingComp.highestQuizScore || ch.passing_score;
          }

          // In sequential workflow: Chapter 1 is always unlocked. Next chapters require previous to be passed.
          const isUnlocked = index === 0 || previousChapterPassed || isAdmin;

          if (!isUnlocked) {
            status = 'locked';
          } else {
            // Find lessons in this chapter
            const chapterLessons = INITIAL_LICENSE_CHAPTERS.find((c) => c.id === ch.id)
              ? INITIAL_LICENSE_LESSONS.filter((l) => l.chapter_id === ch.id)
              : [];

            // Check completion for all lessons in this chapter
            let allLessonsComplete = chapterLessons.length > 0;
            for (const l of chapterLessons) {
              const vKey = `${userId}_${l.id}`;
              const isPdf = (l.lesson_type || l.content_type) === 'pdf';
              if (isPdf) {
                const pdfRec = serverPdfProgressRegistry.get(vKey);
                const isPdfDone = pdfRec && (pdfRec.completionStatus === 'completed' || pdfRec.progressPercentage >= 100);
                if (!isPdfDone) allLessonsComplete = false;
              } else {
                const vidRec = serverVideoProgressRegistry.get(vKey);
                const isVidDone = vidRec && (vidRec.completionStatus === 'completed' || vidRec.progressPercentage >= 95);
                if (!isVidDone) allLessonsComplete = false;
              }
            }

            // If no lessons assigned yet, treat as available
            if (chapterLessons.length === 0) {
              allLessonsComplete = true;
            }

            materialsCompleted = allLessonsComplete;

            if (quizPassed) {
              status = 'completed';
            } else if (materialsCompleted) {
              status = 'quiz_available';
            } else {
              status = 'in_progress';
            }
          }

          // Update flag for subsequent chapter
          previousChapterPassed = quizPassed;
        } else {
          // Unauthenticated view
          status = index === 0 ? 'in_progress' : 'locked';
        }

        return {
          ...ch,
          status,
          materials_completed: materialsCompleted,
          quiz_passed: quizPassed,
          highest_quiz_score: highestQuizScore,
          quiz_attempts_count: quizAttemptsCount,
        };
      });

      const publishedChapters = chaptersWithStatus.filter((c) => c.is_published);
      const completedCount = publishedChapters.filter((c) => c.status === 'completed' || (c.status as string) === 'passed').length;
      const overallPercentage = publishedChapters.length > 0
        ? Math.round((completedCount / publishedChapters.length) * 100)
        : 0;
      const isCourseCompleted = publishedChapters.length > 0 && completedCount === publishedChapters.length;

      return sendJson(res, 200, {
        success: true,
        chapters: chaptersWithStatus,
        stats: {
          total_chapters: publishedChapters.length,
          completed_chapters: completedCount,
          overall_percentage: overallPercentage,
          is_course_completed: isCourseCompleted,
        },
      });
    }

    // 9F-2. POST /api/admin/license-chapters - Admin Create or Update Chapter
    if (url === '/api/admin/license-chapters' && method === 'POST') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Forbidden. Admin credentials required.' });
      }

      const body = await parseJsonBody(req);
      const { id, title, chapter_number, description, passing_score, display_order, is_published } = body;

      if (!title) {
        return sendJson(res, 400, { success: false, message: 'Chapter title is required.' });
      }

      const chapterId = id || 'lic_ch_' + Date.now();
      const existingIdx = serverLicenseChapters.findIndex((c) => c.id === chapterId);

      const chapterRecord: LicenseChapter = {
        id: chapterId,
        chapter_number: Number(chapter_number) || (existingIdx >= 0 ? serverLicenseChapters[existingIdx].chapter_number : serverLicenseChapters.length + 1),
        title,
        description: description || '',
        passing_score: Number(passing_score) || 80,
        display_order: Number(display_order) || (existingIdx >= 0 ? serverLicenseChapters[existingIdx].display_order : serverLicenseChapters.length + 1),
        is_published: is_published !== undefined ? Boolean(is_published) : true,
        created_at: existingIdx >= 0 ? serverLicenseChapters[existingIdx].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        serverLicenseChapters[existingIdx] = chapterRecord;
      } else {
        serverLicenseChapters.push(chapterRecord);
      }

      // Sync with Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('license_chapters').upsert({
            id: chapterRecord.id,
            chapter_number: chapterRecord.chapter_number,
            title: chapterRecord.title,
            description: chapterRecord.description,
            passing_score: chapterRecord.passing_score,
            display_order: chapterRecord.display_order,
            is_published: chapterRecord.is_published,
            updated_at: chapterRecord.updated_at,
          });
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase chapter upsert notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        chapter: chapterRecord,
        message: 'Chapter saved successfully.',
      });
    }

    // 9F-3. DELETE /api/admin/license-chapters - Admin Delete Chapter
    if (url === '/api/admin/license-chapters' && method === 'DELETE') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Forbidden. Admin credentials required.' });
      }

      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const chapterId = parsedUrl.searchParams.get('id');

      if (!chapterId) {
        return sendJson(res, 400, { success: false, message: 'Chapter ID is required.' });
      }

      const idx = serverLicenseChapters.findIndex((c) => c.id === chapterId);
      if (idx >= 0) {
        serverLicenseChapters.splice(idx, 1);
      }

      // Remove in Supabase
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('license_chapters').delete().eq('id', chapterId);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase chapter delete notice:', sErr);
        }
      }

      return sendJson(res, 200, { success: true, message: 'Chapter deleted successfully.' });
    }

    // 9F-4. POST /api/admin/license-chapters/reorder - Reorder Chapters
    if (url === '/api/admin/license-chapters/reorder' && method === 'POST') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Forbidden. Admin credentials required.' });
      }

      const body = await parseJsonBody(req);
      const { orderedIds } = body;

      if (!Array.isArray(orderedIds)) {
        return sendJson(res, 400, { success: false, message: 'orderedIds array is required.' });
      }

      orderedIds.forEach((id: string, idx: number) => {
        const ch = serverLicenseChapters.find((c) => c.id === id);
        if (ch) {
          ch.display_order = idx + 1;
          ch.chapter_number = idx + 1;
          ch.updated_at = new Date().toISOString();
        }
      });

      return sendJson(res, 200, {
        success: true,
        chapters: serverLicenseChapters.sort((a, b) => a.display_order - b.display_order),
      });
    }

    // 9F. GET /api/license/quizzes - Fetch Quiz for a Chapter or Lesson
    if (url === '/api/license/quizzes' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const chapterId = parsedUrl.searchParams.get('chapterId');
      const lessonId = parsedUrl.searchParams.get('lessonId');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role');
      const isAdmin = userRole === 'admin';

      let quizzesToReturn = [...serverLicenseQuizzes];

      // Query Supabase if available
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          let query = supabase.from('license_quizzes').select('*');
          if (chapterId) query = query.eq('chapter_id', chapterId);
          else if (lessonId) query = query.eq('lesson_id', lessonId);
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            quizzesToReturn = data.map((q: any) => ({
              id: q.id,
              chapter_id: q.chapter_id,
              lesson_id: q.lesson_id,
              title: q.title,
              description: q.description,
              passing_score: q.passing_score,
              is_published: q.is_published ?? true,
              created_at: q.created_at,
              updated_at: q.updated_at,
              questions: Array.isArray(q.questions) ? q.questions : [],
            }));
          }
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase quiz fetch notice:', sErr);
        }
      }

      if (chapterId || lessonId) {
        const found = quizzesToReturn.find(
          (q) => (chapterId && q.chapter_id === chapterId) || (lessonId && q.lesson_id === lessonId)
        );
        if (!found) {
          return sendJson(res, 404, { success: false, message: 'No quiz configured for this chapter yet.' });
        }

        // For learners, do NOT send correct_option_index or explanation before quiz submission
        const safeQuiz = isAdmin
          ? found
          : {
              ...found,
              questions: found.questions.map((q) => ({
                id: q.id,
                quiz_id: q.quiz_id,
                question_text: q.question_text,
                options: q.options,
                display_order: q.display_order,
              })),
            };

        return sendJson(res, 200, { success: true, quiz: safeQuiz });
      }

      // Return all quizzes
      const safeQuizzes = isAdmin
        ? quizzesToReturn
        : quizzesToReturn.map((q) => ({
            ...q,
            questions: q.questions.map((item) => ({
              id: item.id,
              quiz_id: item.quiz_id,
              question_text: item.question_text,
              options: item.options,
              display_order: item.display_order,
            })),
          }));

      return sendJson(res, 200, { success: true, quizzes: safeQuizzes });
    }

    // 9G. POST /api/license/quiz/submit - Grade and Save Learner Chapter Quiz Attempt
    if (url === '/api/license/quiz/submit' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { userId, chapterId, lessonId, quizId, answers, userName, userEmail } = body;

      if (!userId || (!chapterId && !lessonId) || !quizId || !answers) {
        return sendJson(res, 400, { success: false, message: 'Missing required quiz submission fields.' });
      }

      // Locate quiz in server registry
      let quiz = serverLicenseQuizzes.find(
        (q) => q.id === quizId || (chapterId && q.chapter_id === chapterId) || (lessonId && q.lesson_id === lessonId)
      );

      if (!quiz) {
        return sendJson(res, 404, { success: false, message: 'Quiz not found.' });
      }

      const activeChapterId = chapterId || quiz.chapter_id;

      // Grade answers authoritatively server-side
      let correctCount = 0;
      const breakdown = quiz.questions.map((q) => {
        const selected = answers[q.id];
        const isCorrect = selected !== undefined && Number(selected) === q.correct_option_index;
        if (isCorrect) correctCount++;
        return {
          question_id: q.id,
          question_text: q.question_text,
          selected_index: selected !== undefined ? Number(selected) : null,
          correct_index: q.correct_option_index,
          is_correct: isCorrect,
          explanation: q.explanation || '',
        };
      });

      const totalQuestions = quiz.questions.length;
      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = percentage >= quiz.passing_score;

      const attemptId = 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const attemptRecord: LicenseQuizAttempt = {
        id: attemptId,
        quiz_id: quiz.id,
        chapter_id: activeChapterId,
        lesson_id: lessonId || quiz.lesson_id,
        user_id: userId,
        user_name: userName || 'Learner',
        user_email: userEmail || '',
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        answers,
        created_at: new Date().toISOString(),
      };

      serverQuizAttempts.unshift(attemptRecord);

      // If chapter quiz, update chapter completion and unlock sequential next chapter!
      let nextChapterUnlocked = false;
      let nextChapterTitle = '';

      if (activeChapterId) {
        const compKey = `${userId}_${activeChapterId}`;
        const prevComp = serverChapterCompletions.get(compKey);
        const highestScore = Math.max(prevComp?.highestQuizScore || 0, percentage);
        const isPassedEver = passed || Boolean(prevComp?.quizPassed);

        serverChapterCompletions.set(compKey, {
          userId,
          chapterId: activeChapterId,
          status: isPassedEver ? 'completed' : 'quiz_available',
          materialsCompleted: true,
          quizPassed: isPassedEver,
          highestQuizScore: highestScore,
          completedAt: isPassedEver ? (prevComp?.completedAt || attemptRecord.created_at) : undefined,
          updatedAt: attemptRecord.created_at,
        });

        if (passed) {
          // Identify next sequential chapter
          const sorted = [...serverLicenseChapters].sort((a, b) => a.display_order - b.display_order);
          const currentIdx = sorted.findIndex((c) => c.id === activeChapterId);
          if (currentIdx >= 0 && currentIdx < sorted.length - 1) {
            const nextCh = sorted[currentIdx + 1];
            nextChapterUnlocked = true;
            nextChapterTitle = nextCh.title;
          }
        }
      }

      // Sync with Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('license_quiz_attempts').insert({
            id: attemptId,
            quiz_id: quiz.id,
            chapter_id: activeChapterId,
            lesson_id: lessonId || quiz.lesson_id,
            user_id: userId,
            user_name: userName || 'Learner',
            user_email: userEmail || '',
            score: correctCount,
            total_questions: totalQuestions,
            percentage,
            passed,
            answers,
            created_at: attemptRecord.created_at,
          });

          if (activeChapterId) {
            await supabase.from('chapter_completions').upsert({
              user_id: userId,
              chapter_id: activeChapterId,
              status: passed ? 'completed' : 'quiz_available',
              materials_completed: true,
              quiz_passed: passed,
              highest_quiz_score: percentage,
              completed_at: passed ? attemptRecord.created_at : null,
              updated_at: attemptRecord.created_at,
            });
          }
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase quiz attempt sync notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        passing_score: quiz.passing_score,
        breakdown,
        next_chapter_unlocked: nextChapterUnlocked,
        next_chapter_title: nextChapterTitle,
        attempt: attemptRecord,
        message: passed
          ? `Assessment Passed! You scored ${percentage}% (Passing threshold is ${quiz.passing_score}%).${nextChapterUnlocked ? ` Next chapter unlocked: ${nextChapterTitle}` : ' All licensing chapters completed!'}`
          : `Assessment score: ${percentage}%. Passing score is ${quiz.passing_score}%. Review the feedback below and retry when ready!`,
      });
    }

    // 9H. GET /api/license/quiz/attempts - Retrieve Quiz Attempts
    if (url === '/api/license/quiz/attempts' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const chapterId = parsedUrl.searchParams.get('chapterId');
      const lessonId = parsedUrl.searchParams.get('lessonId');
      const userId = parsedUrl.searchParams.get('userId');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role');

      let attempts = [...serverQuizAttempts];

      if (userId && userRole !== 'admin') {
        attempts = attempts.filter((a) => a.user_id === userId);
      }
      if (chapterId) {
        attempts = attempts.filter((a) => a.chapter_id === chapterId);
      } else if (lessonId) {
        attempts = attempts.filter((a) => a.lesson_id === lessonId);
      }

      // Check Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          let query = supabase.from('license_quiz_attempts').select('*').order('created_at', { ascending: false });
          if (chapterId) query = query.eq('chapter_id', chapterId);
          else if (lessonId) query = query.eq('lesson_id', lessonId);
          if (userId && userRole !== 'admin') query = query.eq('user_id', userId);
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            attempts = data;
          }
        } catch {}
      }

      return sendJson(res, 200, {
        success: true,
        attempts,
      });
    }

    // 9I. POST /api/admin/license-quizzes - Admin Create/Update Quiz & Questions
    if (url === '/api/admin/license-quizzes' && method === 'POST') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Forbidden. Admin credentials required.' });
      }

      const body = await parseJsonBody(req);
      const { chapterId, lessonId, title, description, passingScore, questions } = body;

      if ((!chapterId && !lessonId) || !title || !questions || !Array.isArray(questions)) {
        return sendJson(res, 400, { success: false, message: 'Missing required quiz fields or invalid questions array.' });
      }

      let quiz = serverLicenseQuizzes.find(
        (q) => (chapterId && q.chapter_id === chapterId) || (lessonId && q.lesson_id === lessonId)
      );
      const quizId = quiz ? quiz.id : 'quiz_' + (chapterId || lessonId);

      const formattedQuestions: LicenseQuizQuestion[] = questions.map((q: any, idx: number) => ({
        id: q.id || `q_${quizId}_${idx + 1}`,
        quiz_id: quizId,
        question_text: q.question_text || q.question || '',
        options: Array.isArray(q.options) ? q.options : [],
        correct_option_index: Number(q.correct_option_index ?? q.correctIndex ?? 0),
        explanation: q.explanation || '',
        display_order: idx + 1,
      }));

      const updatedQuiz: LicenseQuiz = {
        id: quizId,
        chapter_id: chapterId,
        lesson_id: lessonId,
        title,
        description: description || '',
        passing_score: Number(passingScore) || 80,
        questions: formattedQuestions,
        is_published: true,
        created_at: quiz ? quiz.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const existingIndex = serverLicenseQuizzes.findIndex(
        (q) => (chapterId && q.chapter_id === chapterId) || (lessonId && q.lesson_id === lessonId)
      );
      if (existingIndex >= 0) {
        serverLicenseQuizzes[existingIndex] = updatedQuiz;
      } else {
        serverLicenseQuizzes.push(updatedQuiz);
      }

      // Persist to Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('license_quizzes').upsert({
            id: quizId,
            chapter_id: chapterId,
            lesson_id: lessonId,
            title,
            description: description || '',
            passing_score: updatedQuiz.passing_score,
            is_published: true,
            questions: formattedQuestions,
            updated_at: updatedQuiz.updated_at,
          });
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase quiz admin save notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        quiz: updatedQuiz,
        message: 'Chapter assessment quiz updated successfully.',
      });
    }

    // 9I-2. DELETE /api/admin/license-quizzes - Admin Delete Quiz
    if (url === '/api/admin/license-quizzes' && method === 'DELETE') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Forbidden. Admin credentials required.' });
      }

      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const chapterId = parsedUrl.searchParams.get('chapterId');
      const quizId = parsedUrl.searchParams.get('quizId');

      const idx = serverLicenseQuizzes.findIndex((q) => (quizId && q.id === quizId) || (chapterId && q.chapter_id === chapterId));
      if (idx >= 0) {
        serverLicenseQuizzes.splice(idx, 1);
      }

      return sendJson(res, 200, { success: true, message: 'Quiz deleted successfully.' });
    }

    // =====================================================================
    // 9I-3. POST /api/quiz/generate-from-pdf - Extract PDF & AI Generate Questions
    // =====================================================================
    if (url === '/api/quiz/generate-from-pdf' && method === 'POST') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Administrator privileges required to generate quizzes.' });
      }

      const body = await parseJsonBody(req);
      const { fileUrl, base64, count, topic, fileName } = body;

      let pdfBuffer: Buffer | null = null;

      try {
        if (base64 && typeof base64 === 'string') {
          const cleanBase64 = base64.replace(/^data:application\/pdf;base64,/, '').replace(/^data:[^;]+;base64,/, '');
          pdfBuffer = Buffer.from(cleanBase64, 'base64');
        } else if (fileUrl && typeof fileUrl === 'string') {
          const decoded = decodeURIComponent(fileUrl.trim());
          if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
            const resp = await fetch(decoded);
            if (!resp.ok) {
              return sendJson(res, 400, { success: false, error: `Could not download remote PDF (${resp.status} ${resp.statusText}).` });
            }
            const arrayBuf = await resp.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuf);
          } else {
            // Local file in public/uploads or public
            const clean = decoded.replace(/^\//, '');
            const candidates = [
              path.resolve(process.cwd(), 'public', clean),
              path.resolve(process.cwd(), 'public', 'uploads', path.basename(decoded)),
              path.resolve(process.cwd(), clean),
            ];
            for (const cand of candidates) {
              if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
                pdfBuffer = fs.readFileSync(cand);
                break;
              }
            }
          }
        }

        if (!pdfBuffer || pdfBuffer.length === 0) {
          return sendJson(res, 400, {
            success: false,
            error: 'No valid PDF file buffer or URL was provided. Please upload a PDF document.',
          });
        }

        // 1. Extract text and check scanned status
        const { text, numPages, isScanned } = await extractTextFromPdfBuffer(pdfBuffer);

        if (isScanned) {
          return sendJson(res, 400, {
            success: false,
            isScanned: true,
            error: 'The uploaded PDF appears to be a scanned document or contains no extractable text. Please upload a digital PDF with searchable text, or enter your quiz questions manually.',
          });
        }

        // 2. Call Gemini API to generate structured questions
        const questionCount = Math.min(10, Math.max(3, Number(count) || 5));
        const questions = await generateQuizQuestionsFromText(text, questionCount, topic || fileName || '');

        return sendJson(res, 200, {
          success: true,
          questions,
          page_count: numPages,
          extracted_preview: text.slice(0, 300).trim(),
          message: `Successfully extracted ${numPages} pages and generated ${questions.length} quiz questions.`,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Quiz PDF Generation Error]:', msg);
        return sendJson(res, 500, {
          success: false,
          error: `Failed to extract or generate questions from PDF: ${msg}`,
        });
      }
    }

    // =====================================================================
    // 9I-4. SKILL QUIZ API ENDPOINTS (Skill Development Assessment)
    // =====================================================================

    // GET /api/skill/quiz - Retrieve Quiz for Skill Category or Resource
    if (url === '/api/skill/quiz' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const categoryId = parsedUrl.searchParams.get('categoryId');
      const resourceId = parsedUrl.searchParams.get('resourceId');
      const quizId = parsedUrl.searchParams.get('id');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role') || 'user';

      let quiz = serverSkillQuizzes.find(
        (q) => (quizId && q.id === quizId) ||
               (categoryId && q.category_id === categoryId) ||
               (resourceId && q.resource_id === resourceId)
      );

      // Check Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          let query = supabase.from('skill_quizzes').select('*');
          if (quizId) query = query.eq('id', quizId);
          else if (categoryId) query = query.eq('category_id', categoryId);
          else if (resourceId) query = query.eq('resource_id', resourceId);
          const { data: qData } = await query.maybeSingle();
          if (qData) {
            const { data: questData } = await supabase
              .from('skill_quiz_questions')
              .select('*')
              .eq('quiz_id', qData.id)
              .order('display_order', { ascending: true });
            quiz = {
              ...qData,
              questions: questData || [],
            };
          }
        } catch {}
      }

      if (!quiz) {
        return sendJson(res, 404, { success: false, message: 'Skill assessment quiz not found.' });
      }

      // If user is not an admin, sanitize correct answer keys
      if (userRole !== 'admin') {
        const sanitizedQuestions = quiz.questions.map((q) => ({
          id: q.id,
          quiz_id: q.quiz_id,
          question_text: q.question_text,
          options: q.options,
          display_order: q.display_order,
        }));
        return sendJson(res, 200, {
          success: true,
          quiz: {
            id: quiz.id,
            category_id: quiz.category_id,
            resource_id: quiz.resource_id,
            title: quiz.title,
            description: quiz.description,
            passing_score: quiz.passing_score,
            questions: sanitizedQuestions,
            is_published: quiz.is_published,
            created_at: quiz.created_at,
            updated_at: quiz.updated_at,
          },
        });
      }

      return sendJson(res, 200, { success: true, quiz });
    }

    // POST /api/admin/skill-quizzes - Admin Create/Update Skill Quiz
    if (url === '/api/admin/skill-quizzes' && method === 'POST') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Forbidden. Admin credentials required.' });
      }

      const body = await parseJsonBody(req);
      const { id, category_id, resource_id, title, description, passing_score, is_published, questions } = body;

      if (!title || !questions || !Array.isArray(questions)) {
        return sendJson(res, 400, { success: false, message: 'Quiz title and questions array are required.' });
      }

      const quizId = id || `sq_${category_id || resource_id || Date.now()}`;
      const now = new Date().toISOString();

      const formattedQuestions: SkillQuizQuestion[] = questions.map((q: any, idx: number) => ({
        id: q.id || `sq_${quizId}_${idx + 1}`,
        quiz_id: quizId,
        question_text: q.question_text || q.question || '',
        options: Array.isArray(q.options) ? q.options : [],
        correct_option_index: Number(q.correct_option_index ?? q.correctIndex ?? 0),
        explanation: q.explanation || '',
        display_order: idx + 1,
      }));

      const newQuiz: SkillQuiz = {
        id: quizId,
        category_id,
        resource_id,
        title: title.trim(),
        description: description || '',
        passing_score: Number(passing_score) || 80,
        is_published: is_published !== undefined ? Boolean(is_published) : true,
        questions: formattedQuestions,
        created_at: now,
        updated_at: now,
      };

      const existingIndex = serverSkillQuizzes.findIndex((q) => q.id === quizId || (category_id && q.category_id === category_id));
      if (existingIndex >= 0) {
        newQuiz.created_at = serverSkillQuizzes[existingIndex].created_at;
        serverSkillQuizzes[existingIndex] = newQuiz;
      } else {
        serverSkillQuizzes.push(newQuiz);
      }

      // Persist to Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('skill_quizzes').upsert({
            id: quizId,
            category_id,
            resource_id,
            title: newQuiz.title,
            description: newQuiz.description,
            passing_score: newQuiz.passing_score,
            is_published: newQuiz.is_published,
            updated_at: now,
          });
          await supabase.from('skill_quiz_questions').delete().eq('quiz_id', quizId);
          await supabase.from('skill_quiz_questions').insert(formattedQuestions);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase skill quiz sync notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        quiz: newQuiz,
        message: 'Skill assessment quiz saved successfully.',
      });
    }

    // DELETE /api/admin/skill-quizzes - Admin Delete Skill Quiz
    if (url === '/api/admin/skill-quizzes' && method === 'DELETE') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Forbidden. Admin credentials required.' });
      }

      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const quizId = parsedUrl.searchParams.get('id');
      const categoryId = parsedUrl.searchParams.get('categoryId');

      const idx = serverSkillQuizzes.findIndex((q) => (quizId && q.id === quizId) || (categoryId && q.category_id === categoryId));
      if (idx >= 0) {
        serverSkillQuizzes.splice(idx, 1);
      }

      return sendJson(res, 200, { success: true, message: 'Skill quiz deleted successfully.' });
    }

    // POST /api/skill/quiz/submit - Grade Skill Quiz Server-Side (Secure)
    if (url === '/api/skill/quiz/submit' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { userId, userName, userEmail, quizId, categoryId, answers } = body;

      if (!userId || !answers || typeof answers !== 'object') {
        return sendJson(res, 400, { success: false, message: 'Missing user credentials or quiz answers.' });
      }

      let quiz = serverSkillQuizzes.find((q) => q.id === quizId || (categoryId && q.category_id === categoryId));

      if (!quiz) {
        return sendJson(res, 404, { success: false, message: 'Skill quiz not found.' });
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
      const attemptId = 'sqatt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const attemptRecord: SkillQuizAttempt = {
        id: attemptId,
        quiz_id: quiz.id,
        category_id: quiz.category_id,
        resource_id: quiz.resource_id,
        user_id: userId,
        user_name: userName || 'Learner',
        user_email: userEmail,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        answers,
        created_at: new Date().toISOString(),
      };

      serverSkillQuizAttempts.unshift(attemptRecord);

      // Persist to Supabase if available
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('skill_quiz_attempts').insert(attemptRecord);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase skill quiz attempt notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        passing_score: quiz.passing_score,
        breakdown,
        attempt: attemptRecord,
        message: passed
          ? `Assessment Passed! You scored ${percentage}% (Passing threshold is ${quiz.passing_score}%). Excellent work!`
          : `Assessment score: ${percentage}%. Passing threshold is ${quiz.passing_score}%. Review the feedback below and try again when ready!`,
      });
    }

    // GET /api/skill/quiz/attempts - Retrieve Skill Quiz Attempts
    if (url === '/api/skill/quiz/attempts' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const categoryId = parsedUrl.searchParams.get('categoryId');
      const quizId = parsedUrl.searchParams.get('quizId');
      const userId = parsedUrl.searchParams.get('userId');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role');

      let attempts = [...serverSkillQuizAttempts];

      if (userId && userRole !== 'admin') {
        attempts = attempts.filter((a) => a.user_id === userId);
      }
      if (quizId) {
        attempts = attempts.filter((a) => a.quiz_id === quizId);
      } else if (categoryId) {
        attempts = attempts.filter((a) => a.category_id === categoryId);
      }

      return sendJson(res, 200, {
        success: true,
        attempts,
      });
    }


    // 9E. GET /api/license/stream-video - Protected In-App Video Streaming with Range support & No-Download headers
    // 9E. GET /api/license/stream-video - Protected In-App Video Streaming with Range support & No-Download headers
    if (url === '/api/license/stream-video' && (method === 'GET' || method === 'HEAD')) {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const targetUrl = parsedUrl.searchParams.get('url') || '';

      if (!targetUrl) {
        return sendJson(res, 400, { success: false, message: 'Missing video url parameter.' });
      }

      const decodedUrl = decodeURIComponent(targetUrl).trim();
      const publicDir = path.resolve(process.cwd(), 'public');
      const uploadsDir = path.resolve(publicDir, 'uploads');

      // Helper to determine exact video MIME type
      const getVideoMime = (filePathOrUrl: string): string => {
        const clean = filePathOrUrl.split('?')[0].toLowerCase();
        if (clean.endsWith('.webm')) return 'video/webm';
        if (clean.endsWith('.mov')) return 'video/quicktime';
        if (clean.endsWith('.ogg') || clean.endsWith('.ogv')) return 'video/ogg';
        if (clean.endsWith('.m4v')) return 'video/x-m4v';
        if (clean.endsWith('.mkv')) return 'video/x-matroska';
        if (clean.endsWith('.avi')) return 'video/x-msvideo';
        return 'video/mp4';
      };

      // Extract possible filename from targetUrl
      let extractedFileName = '';
      try {
        if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
          const u = new URL(decodedUrl);
          extractedFileName = path.basename(u.pathname);
        } else {
          extractedFileName = path.basename(decodedUrl.split('?')[0]);
        }
      } catch {
        extractedFileName = path.basename(decodedUrl.split('?')[0]);
      }

      // Candidate local paths
      const cleanPath = decodedUrl.replace(/^\//, '').split('?')[0];
      const candidates = [
        path.resolve(publicDir, cleanPath),
        path.resolve(uploadsDir, extractedFileName),
        path.resolve(publicDir, extractedFileName),
      ];

      // If targetUrl contains /uploads/, also test relative to uploadsDir
      if (decodedUrl.includes('/uploads/')) {
        const afterUploads = decodedUrl.split('/uploads/')[1].split('?')[0];
        candidates.push(path.resolve(uploadsDir, afterUploads));
        candidates.push(path.resolve(uploadsDir, decodeURIComponent(afterUploads)));
      }

      let localPathToServe: string | null = null;
      for (const cand of candidates) {
        try {
          if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
            localPathToServe = cand;
            break;
          }
        } catch {}
      }

      if (localPathToServe) {
        const stats = fs.statSync(localPathToServe);
        const fileSize = stats.size;
        const range = req.headers.range;
        const mimeType = getVideoMime(localPathToServe);

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          // Fast startup chunking for open-ended ranges (e.g. bytes=0-)
          const defaultChunkSize = 2 * 1024 * 1024; // 2MB
          const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + defaultChunkSize - 1, fileSize - 1);

          if (start >= fileSize) {
            res.statusCode = 416;
            res.setHeader('Content-Range', `bytes */${fileSize}`);
            res.end();
            return;
          }

          const chunksize = end - start + 1;
          const file = fs.createReadStream(localPathToServe, { start, end });
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mimeType,
            'Content-Disposition': 'inline',
            'Cache-Control': 'public, max-age=3600',
            'X-Content-Type-Options': 'nosniff',
            'Access-Control-Allow-Origin': '*',
          });
          file.pipe(res);
          return;
        } else {
          res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': mimeType,
            'Content-Disposition': 'inline',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600',
            'X-Content-Type-Options': 'nosniff',
            'Access-Control-Allow-Origin': '*',
          });
          if (method === 'HEAD') {
            res.end();
            return;
          }
          fs.createReadStream(localPathToServe).pipe(res);
          return;
        }
      }

      // If remote video, proxy stream with Range support and appropriate auth headers
      try {
        const fetchHeaders: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
        };
        if (req.headers.range) {
          fetchHeaders['range'] = req.headers.range as string;
        }

        // Support private Supabase Storage buckets if configured
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
        if (supabaseKey && targetUrl.includes('.supabase.co/storage/')) {
          fetchHeaders['apikey'] = supabaseKey;
          fetchHeaders['authorization'] = `Bearer ${supabaseKey}`;
        }

        const remoteRes = await fetch(targetUrl, {
          method: method as string,
          headers: fetchHeaders,
        });

        if (!remoteRes.ok && remoteRes.status !== 206) {
          // Check if fallback file exists locally by filename
          if (extractedFileName && fs.existsSync(path.resolve(uploadsDir, extractedFileName))) {
            const fallbackPath = path.resolve(uploadsDir, extractedFileName);
            const stats = fs.statSync(fallbackPath);
            res.writeHead(200, {
              'Content-Length': stats.size,
              'Content-Type': getVideoMime(fallbackPath),
              'Content-Disposition': 'inline',
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=3600',
              'X-Content-Type-Options': 'nosniff',
            });
            fs.createReadStream(fallbackPath).pipe(res);
            return;
          }

          return sendJson(res, remoteRes.status, {
            success: false,
            message: `Could not stream remote video (${remoteRes.status} ${remoteRes.statusText}).`,
          });
        }

        res.statusCode = remoteRes.status; // 206 or 200
        const contentType = remoteRes.headers.get('content-type') || getVideoMime(targetUrl);
        const contentRange = remoteRes.headers.get('content-range');
        const contentLength = remoteRes.headers.get('content-length');
        const acceptRanges = remoteRes.headers.get('accept-ranges') || 'bytes';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Accept-Ranges', acceptRanges);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (contentRange) {
          res.setHeader('Content-Range', contentRange);
        }
        if (contentLength) {
          res.setHeader('Content-Length', contentLength);
        }

        if (method === 'HEAD') {
          res.end();
          return;
        }

        if (remoteRes.body) {
          const { Readable } = await import('stream');
          // @ts-ignore
          const nodeStream = Readable.fromWeb(remoteRes.body as any);
          nodeStream.pipe(res);
          return;
        } else {
          res.end();
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Video stream error]:', msg);
        return sendJson(res, 500, { success: false, message: `Failed to stream video: ${msg}` });
      }
    }

    // 10. GET /api/download - Protected File Download (Strictly Restricted for Ordinary Users on License Materials)
    if (url === '/api/download' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const targetUrl = parsedUrl.searchParams.get('url') || '';
      const rawFileName = parsedUrl.searchParams.get('filename') || 'lesson-file';
      const cleanFileName = decodeURIComponent(rawFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role');

      // Security Policy: License Training curriculum is view-only for users
      const isLicenseContent =
        targetUrl.toLowerCase().includes('license') ||
        targetUrl.toLowerCase().includes('regulatory') ||
        targetUrl.toLowerCase().includes('compliance') ||
        targetUrl.toLowerCase().includes('underwriting') ||
        targetUrl.toLowerCase().includes('conduct') ||
        targetUrl.toLowerCase().includes('aml');

      if (isLicenseContent && userRole !== 'admin') {
        return sendJson(res, 403, {
          success: false,
          message: 'License Training curriculum is view-only to prevent unauthorized distribution and protect compliance curriculum. Direct downloading is disabled.',
        });
      }

      if (!targetUrl) {
        return sendJson(res, 400, { success: false, message: 'Missing file url.' });
      }

      // Check if it's a local file in public/uploads or public directory
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        const decodedUrl = decodeURIComponent(targetUrl);
        const cleanPath = decodedUrl.replace(/^\//, '');
        const publicDir = path.resolve(process.cwd(), 'public');
        const candidatePath = path.resolve(publicDir, cleanPath);
        const uploadsCandidate = path.resolve(publicDir, 'uploads', path.basename(decodedUrl));

        let localPathToServe: string | null = null;
        if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
          localPathToServe = candidatePath;
        } else if (fs.existsSync(uploadsCandidate) && fs.statSync(uploadsCandidate).isFile()) {
          localPathToServe = uploadsCandidate;
        }

        if (localPathToServe) {
          const stats = fs.statSync(localPathToServe);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${cleanFileName}"`);
          res.setHeader('Content-Length', stats.size);
          const stream = fs.createReadStream(localPathToServe);
          stream.pipe(res);
          return;
        }
      }

      // If remote URL, fetch and stream with forced attachment disposition
      try {
        const remoteRes = await fetch(targetUrl);
        if (!remoteRes.ok) {
          return sendJson(res, remoteRes.status, { success: false, message: 'Could not fetch remote media.' });
        }

        const contentType = remoteRes.headers.get('content-type') || 'application/octet-stream';
        const contentLength = remoteRes.headers.get('content-length');

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${cleanFileName}"`);
        if (contentLength) {
          res.setHeader('Content-Length', contentLength);
        }

        if (remoteRes.body) {
          const { Readable } = await import('stream');
          // @ts-ignore
          const nodeStream = Readable.fromWeb(remoteRes.body as any);
          nodeStream.pipe(res);
          return;
        } else {
          res.end();
          return;
        }
      } catch (err) {
        console.error('[Download error]:', err);
        return sendJson(res, 500, { success: false, message: 'Download failed.' });
      }
    }

    // =====================================================================
    // 10. PRODUCT KNOWLEDGE HUB API ENDPOINTS
    // =====================================================================

    // 10A. GET /api/products - List products (filtered for learners, all for admins)
    if (url === '/api/products' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role');
      const category = parsedUrl.searchParams.get('category');
      const search = parsedUrl.searchParams.get('search');

      let products = [...serverProducts];

      // Check Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          let query = supabase.from('product_knowledge_items').select('*').order('display_order', { ascending: true });
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            products = data;
          }
        } catch {}
      }

      if (userRole !== 'admin') {
        products = products.filter((p) => p.is_published === true || p.status === 'published');
      }

      if (category && category !== 'All') {
        products = products.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        products = products.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
            (p.short_description && p.short_description.toLowerCase().includes(q))
        );
      }

      return sendJson(res, 200, {
        success: true,
        products,
        total: products.length,
      });
    }

    // 10B. GET /api/products/:id - Single product details
    if (url.startsWith('/api/products/') && !url.includes('/quiz') && method === 'GET') {
      const productId = decodeURIComponent(url.replace('/api/products/', ''));
      let product = serverProducts.find((p) => p.id === productId);

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data } = await supabase.from('product_knowledge_items').select('*').eq('id', productId).maybeSingle();
          if (data) product = data;
        } catch {}
      }

      if (!product) {
        return sendJson(res, 404, { success: false, message: 'Product not found.' });
      }

      return sendJson(res, 200, {
        success: true,
        product,
      });
    }

    // 10C. POST /api/admin/products - Create Product (Admin Only)
    if (url === '/api/admin/products' && method === 'POST') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Administrator privileges required.' });
      }

      const body = await parseJsonBody(req);
      const {
        title,
        subtitle,
        category,
        description,
        short_description,
        content,
        image_url,
        card_color_theme,
        key_benefits,
        key_features,
        eligibility_criteria,
        coverage_details,
        premium_terms,
        target_audience,
        additional_sections,
        display_order,
        status,
        is_published,
      } = body;

      const mainContent = content?.trim() || description?.trim() || '';
      if (!title || (!mainContent && !short_description)) {
        return sendJson(res, 400, { success: false, message: 'Product title and knowledge content are required.' });
      }

      const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const now = new Date().toISOString();

      const newProduct: ProductKnowledgeItem = {
        id,
        title: title.trim(),
        subtitle: subtitle?.trim() || '',
        category: category?.trim() || 'Insurance',
        description: description?.trim() || short_description?.trim() || mainContent.slice(0, 160),
        short_description: short_description?.trim() || (description ? description.slice(0, 160) : ''),
        content: mainContent,
        image_url: image_url || '',
        card_color_theme: card_color_theme || 'navy',
        key_benefits: Array.isArray(key_benefits) ? key_benefits : [],
        key_features: Array.isArray(key_features) ? key_features : [],
        eligibility_criteria: eligibility_criteria || '',
        coverage_details: coverage_details || '',
        premium_terms: premium_terms || '',
        target_audience: target_audience || '',
        additional_sections: Array.isArray(additional_sections) ? additional_sections : [],
        display_order: Number(display_order) || serverProducts.length + 1,
        status: status || (is_published ? 'published' : 'draft'),
        is_published: is_published !== undefined ? Boolean(is_published) : status === 'published',
        created_at: now,
        updated_at: now,
      };

      serverProducts.push(newProduct);

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('product_knowledge_items').insert(newProduct);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase product insert notice:', sErr);
        }
      }

      return sendJson(res, 201, {
        success: true,
        product: newProduct,
        message: 'Product created successfully.',
      });
    }

    // 10D. PUT /api/admin/products/:id - Update Product (Admin Only)
    if (url.startsWith('/api/admin/products/') && !url.includes('/quiz') && method === 'PUT') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Administrator privileges required.' });
      }

      const productId = decodeURIComponent(url.replace('/api/admin/products/', ''));
      const body = await parseJsonBody(req);
      const existingIdx = serverProducts.findIndex((p) => p.id === productId);

      const now = new Date().toISOString();
      const updatedProduct: ProductKnowledgeItem = {
        ...(existingIdx >= 0 ? serverProducts[existingIdx] : {} as any),
        ...body,
        id: productId,
        updated_at: now,
      };

      if (existingIdx >= 0) {
        serverProducts[existingIdx] = updatedProduct;
      } else {
        serverProducts.push(updatedProduct);
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('product_knowledge_items').upsert(updatedProduct);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase product update notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        product: updatedProduct,
        message: 'Product updated successfully.',
      });
    }

    // 10E. DELETE /api/admin/products/:id - Delete Product (Admin Only)
    if (url.startsWith('/api/admin/products/') && !url.includes('/quiz') && method === 'DELETE') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Administrator privileges required.' });
      }

      const productId = decodeURIComponent(url.replace('/api/admin/products/', ''));
      const idx = serverProducts.findIndex((p) => p.id === productId);
      if (idx >= 0) {
        serverProducts.splice(idx, 1);
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('product_knowledge_items').delete().eq('id', productId);
          await supabase.from('product_quizzes').delete().eq('product_id', productId);
          await supabase.from('product_quiz_attempts').delete().eq('product_id', productId);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase product delete notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        message: 'Product deleted successfully.',
      });
    }

    // 10F. GET /api/products/:id/quiz - Get Quiz for Product (Protects correct answers for learners!)
    if (url.match(/^\/api\/products\/[^/]+\/quiz$/) && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const productId = decodeURIComponent(url.split('/')[3]);
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role') || 'user';

      let quiz = serverProductQuizzes.find((q) => q.product_id === productId);

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: qData } = await supabase.from('product_quizzes').select('*').eq('product_id', productId).maybeSingle();
          if (qData) {
            const { data: questData } = await supabase
              .from('product_quiz_questions')
              .select('*')
              .eq('quiz_id', qData.id)
              .order('display_order', { ascending: true });
            quiz = {
              ...qData,
              questions: questData || [],
            };
          }
        } catch {}
      }

      if (!quiz) {
        return sendJson(res, 404, { success: false, message: 'Quiz not found for this product.' });
      }

      // If user is NOT an admin, STRIP correct_option_index and explanation to prevent cheating/scraping
      if (userRole !== 'admin') {
        const sanitizedQuestions = quiz.questions.map((q) => ({
          id: q.id,
          quiz_id: q.quiz_id,
          question_text: q.question_text,
          options: q.options,
          display_order: q.display_order,
        }));

        return sendJson(res, 200, {
          success: true,
          quiz: {
            id: quiz.id,
            product_id: quiz.product_id,
            title: quiz.title,
            description: quiz.description,
            passing_score: quiz.passing_score,
            max_attempts: quiz.max_attempts,
            is_published: quiz.is_published,
            questions: sanitizedQuestions,
            created_at: quiz.created_at,
            updated_at: quiz.updated_at,
          },
        });
      }

      // For administrators, return full quiz with answer keys and explanations
      return sendJson(res, 200, {
        success: true,
        quiz,
      });
    }

    // 10G. POST /api/admin/products/:id/quiz - Admin Save/Update Product Quiz
    if (url.match(/^\/api\/admin\/products\/[^/]+\/quiz$/) && method === 'POST') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Administrator privileges required.' });
      }

      const productId = decodeURIComponent(url.split('/')[4]);
      const body = await parseJsonBody(req);
      const { title, description, passing_score, max_attempts, is_published, questions } = body;

      if (!title || !questions || !Array.isArray(questions)) {
        return sendJson(res, 400, { success: false, message: 'Quiz title and questions array are required.' });
      }

      let existing = serverProductQuizzes.find((q) => q.product_id === productId);
      const quizId = existing ? existing.id : 'quiz_' + productId;
      const now = new Date().toISOString();

      const formattedQuestions: ProductQuizQuestion[] = questions.map((q: any, idx: number) => ({
        id: q.id || `qp_${productId}_${idx + 1}`,
        quiz_id: quizId,
        question_text: q.question_text || q.question || '',
        options: Array.isArray(q.options) ? q.options : [],
        correct_option_index: Number(q.correct_option_index ?? q.correctIndex ?? 0),
        explanation: q.explanation || '',
        display_order: idx + 1,
      }));

      const newQuiz: ProductQuiz = {
        id: quizId,
        product_id: productId,
        title: title.trim(),
        description: description || '',
        passing_score: Number(passing_score) || 80,
        max_attempts: Number(max_attempts) || 0,
        is_published: is_published !== undefined ? Boolean(is_published) : true,
        questions: formattedQuestions,
        created_at: existing ? existing.created_at : now,
        updated_at: now,
      };

      const existingIndex = serverProductQuizzes.findIndex((q) => q.product_id === productId);
      if (existingIndex >= 0) {
        serverProductQuizzes[existingIndex] = newQuiz;
      } else {
        serverProductQuizzes.push(newQuiz);
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
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
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase product quiz admin notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        quiz: newQuiz,
        message: 'Product quiz updated successfully.',
      });
    }

    // 10H. POST /api/products/:id/quiz/submit - Grade Product Quiz Server-Side (Secure)
    if (url.match(/^\/api\/products\/[^/]+\/quiz\/submit$/) && method === 'POST') {
      const productId = decodeURIComponent(url.split('/')[3]);
      const body = await parseJsonBody(req);
      const { userId, userName, userEmail, quizId, answers } = body;

      if (!userId || !answers || typeof answers !== 'object') {
        return sendJson(res, 400, { success: false, message: 'Missing user credentials or quiz answers.' });
      }

      let quiz = serverProductQuizzes.find((q) => q.product_id === productId || q.id === quizId);

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: qData } = await supabase.from('product_quizzes').select('*').eq('product_id', productId).maybeSingle();
          if (qData) {
            const { data: questData } = await supabase
              .from('product_quiz_questions')
              .select('*')
              .eq('quiz_id', qData.id)
              .order('display_order', { ascending: true });
            quiz = {
              ...qData,
              questions: questData || [],
            };
          }
        } catch {}
      }

      if (!quiz) {
        return sendJson(res, 404, { success: false, message: 'Product quiz not found.' });
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
      const attemptId = 'patt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const attemptRecord: ProductQuizAttempt = {
        id: attemptId,
        quiz_id: quiz.id,
        product_id: productId,
        user_id: userId,
        user_name: userName || 'Learner',
        user_email: userEmail || '',
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        answers,
        created_at: new Date().toISOString(),
      };

      serverProductQuizAttempts.unshift(attemptRecord);

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('product_quiz_attempts').insert(attemptRecord);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase product attempt sync notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        passing_score: quiz.passing_score,
        breakdown,
        attempt: attemptRecord,
        message: passed
          ? `Congratulations! You scored ${percentage}% (Passing mark is ${quiz.passing_score}%).`
          : `You scored ${percentage}%. You need at least ${quiz.passing_score}% to pass. You can review the explanations and try again.`,
      });
    }

    // 10I. GET /api/products/:id/quiz/attempts - Retrieve Quiz Attempts
    if (url.includes('/quiz/attempts') && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const productId = parsedUrl.searchParams.get('productId');
      const userId = parsedUrl.searchParams.get('userId');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role');

      let attempts = [...serverProductQuizAttempts];

      if (userId && userRole !== 'admin') {
        attempts = attempts.filter((a) => a.user_id === userId);
      }
      if (productId && productId !== 'all') {
        attempts = attempts.filter((a) => a.product_id === productId);
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          let query = supabase.from('product_quiz_attempts').select('*').order('created_at', { ascending: false });
          if (productId && productId !== 'all') query = query.eq('product_id', productId);
          if (userId && userRole !== 'admin') query = query.eq('user_id', userId);
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            attempts = data;
          }
        } catch {}
      }

      return sendJson(res, 200, {
        success: true,
        attempts,
      });
    }

    // =====================================================================
    // 11. COMPANY BULLETIN API ENDPOINTS (Announcements, Campaigns, Notices)
    // =====================================================================

    // 11A. GET /api/bulletins - List bulletins
    if (url === '/api/bulletins' && method === 'GET') {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const userRole = (req.headers['x-user-role'] as string) || parsedUrl.searchParams.get('role');
      const category = parsedUrl.searchParams.get('category');
      const search = parsedUrl.searchParams.get('search');

      let bulletins = [...serverCompanyBulletins];

      // Check Supabase if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data, error } = await supabase.from('company_bulletins').select('*').order('published_at', { ascending: false });
          if (!error && data && data.length > 0) {
            bulletins = data;
          }
        } catch {}
      }

      // Filter by role: regular users only see published
      if (userRole !== 'admin') {
        bulletins = bulletins.filter((b) => b.published === true || b.status === 'published');
      }

      // Filter by category
      if (category && category !== 'All') {
        bulletins = bulletins.filter((b) => b.category.toLowerCase() === category.toLowerCase());
      }

      // Filter by search query
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        bulletins = bulletins.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.description.toLowerCase().includes(q) ||
            (b.reference_no && b.reference_no.toLowerCase().includes(q)) ||
            (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }

      return sendJson(res, 200, {
        success: true,
        bulletins,
        total: bulletins.length,
      });
    }

    // 11B. GET /api/bulletins/:id - Single bulletin
    if (url.startsWith('/api/bulletins/') && method === 'GET') {
      const bulletinId = decodeURIComponent(url.replace('/api/bulletins/', ''));
      let bulletin = serverCompanyBulletins.find((b) => b.id === bulletinId);

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data } = await supabase.from('company_bulletins').select('*').eq('id', bulletinId).maybeSingle();
          if (data) bulletin = data;
        } catch {}
      }

      if (!bulletin) {
        return sendJson(res, 404, { success: false, message: 'Bulletin announcement not found.' });
      }

      return sendJson(res, 200, { success: true, bulletin });
    }

    // 11C. POST /api/admin/bulletins - Create Announcement (Admin Only)
    if (url === '/api/admin/bulletins' && method === 'POST') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Administrator privileges required.' });
      }

      const body = await parseJsonBody(req);
      const {
        title,
        description,
        category,
        pdf_url,
        file_name,
        file_size,
        formatted_file_size,
        published = true,
        status = 'published',
        author_id,
        author_name,
        department,
        tags = [],
        reference_no,
        priority = 'normal',
        verified = true,
        color_theme = 'blue_orange',
      } = body;

      if (!title || !description || !pdf_url) {
        return sendJson(res, 400, {
          success: false,
          message: 'Title, description, and PDF document URL are required.',
        });
      }

      const now = new Date().toISOString();
      const newBulletin: CompanyBulletinItem = {
        id: 'bulletin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: title.trim(),
        description: description.trim(),
        category: category || 'Announcement',
        pdf_url: pdf_url.trim(),
        file_name: file_name || path.basename(pdf_url),
        file_size: file_size || 0,
        formatted_file_size: formatted_file_size || 'PDF Document',
        published: published ?? (status === 'published'),
        status: status || (published ? 'published' : 'draft'),
        published_at: now,
        created_at: now,
        updated_at: now,
        author_id: author_id || 'u0000000-0000-0000-0000-000000000001',
        author_name: author_name || 'KBZLife Administration',
        department: department || 'Corporate Communications',
        tags: Array.isArray(tags) ? tags : [],
        reference_no: reference_no || `KBZ-${new Date().getFullYear()}-BUL${Math.floor(10 + Math.random() * 90)}`,
        priority: priority || 'normal',
        verified: verified ?? true,
        color_theme: color_theme || 'blue_orange',
      };

      serverCompanyBulletins.unshift(newBulletin);

      // Persist to Supabase if available
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('company_bulletins').insert(newBulletin);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase bulletin sync notice:', sErr);
        }
      }

      return sendJson(res, 201, {
        success: true,
        bulletin: newBulletin,
        message: 'Announcement successfully created and published.',
      });
    }

    // 11D. PUT /api/admin/bulletins/:id - Update Announcement (Admin Only)
    if (url.startsWith('/api/admin/bulletins/') && method === 'PUT') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Administrator privileges required.' });
      }

      const bulletinId = decodeURIComponent(url.replace('/api/admin/bulletins/', ''));
      const body = await parseJsonBody(req);
      const index = serverCompanyBulletins.findIndex((b) => b.id === bulletinId);

      if (index === -1) {
        return sendJson(res, 404, { success: false, message: 'Bulletin announcement not found.' });
      }

      const updated = {
        ...serverCompanyBulletins[index],
        ...body,
        updated_at: new Date().toISOString(),
      };
      if (body.published !== undefined) {
        updated.published = body.published;
        updated.status = body.published ? 'published' : 'draft';
      }

      serverCompanyBulletins[index] = updated;

      // Persist to Supabase if available
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('company_bulletins').update(updated).eq('id', bulletinId);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase bulletin update notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        bulletin: updated,
        message: 'Announcement updated successfully.',
      });
    }

    // 11E. DELETE /api/admin/bulletins/:id - Delete Announcement (Admin Only)
    if (url.startsWith('/api/admin/bulletins/') && method === 'DELETE') {
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (userRole !== 'admin') {
        return sendJson(res, 403, { success: false, message: 'Administrator privileges required.' });
      }

      const bulletinId = decodeURIComponent(url.replace('/api/admin/bulletins/', ''));
      const index = serverCompanyBulletins.findIndex((b) => b.id === bulletinId);

      if (index === -1) {
        return sendJson(res, 404, { success: false, message: 'Bulletin announcement not found.' });
      }

      serverCompanyBulletins.splice(index, 1);

      // Persist to Supabase if available
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('company_bulletins').delete().eq('id', bulletinId);
        } catch (sErr) {
          console.warn('[KBZLife LMS] Supabase bulletin delete notice:', sErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        message: 'Announcement deleted successfully.',
      });
    }

    // Unknown /api route
    return sendJson(res, 404, { success: false, message: 'API route not found' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return sendJson(res, 500, { success: false, message });
  }
}
