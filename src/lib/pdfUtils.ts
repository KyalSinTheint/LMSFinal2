/**
 * PDF Utilities & Worker Configuration for KBZLIFE LMS
 * High-performance rendering of PDF first-page previews and full documents
 */
import * as pdfjsLib from 'pdfjs-dist';

// Point worker to local public asset so it works offline and without cross-origin CDN constraints
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Returns a browser-accessible, CORS-safe, and frame-friendly URL for any PDF.
 * If the file is local (/uploads/... or /api/...), returns directly.
 * If data URL, returns as-is.
 * If external (e.g. Supabase, external cloud bucket, or external site), routes via /api/pdf-stream.
 */
export function getPdfStreamUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/api/')) {
    return trimmed;
  }
  // External or relative path
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it's the current host, keep path
    try {
      const urlObj = new URL(trimmed);
      if (typeof window !== 'undefined' && urlObj.host === window.location.host) {
        return urlObj.pathname + urlObj.search;
      }
    } catch {}
    return `/api/pdf-stream?url=${encodeURIComponent(trimmed)}`;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/uploads/${trimmed}`;
}

// In-memory cache for rendered first-page thumbnails to avoid re-rendering on tab switch
const thumbnailMemoryCache = new Map<string, string>();

/**
 * Gets cached first-page preview data URL if available
 */
export function getCachedPdfThumbnail(url: string): string | null {
  if (!url) return null;
  if (thumbnailMemoryCache.has(url)) {
    return thumbnailMemoryCache.get(url)!;
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem(`pdf_thumb_${url}`);
      if (saved) {
        thumbnailMemoryCache.set(url, saved);
        return saved;
      }
    } catch {}
  }
  return null;
}

/**
 * Stores rendered first-page thumbnail in memory and sessionStorage
 */
export function setCachedPdfThumbnail(url: string, dataUrl: string): void {
  if (!url || !dataUrl) return;
  thumbnailMemoryCache.set(url, dataUrl);
  if (typeof window !== 'undefined') {
    try {
      // Only cache reasonably sized data URLs in sessionStorage (under 200KB)
      if (dataUrl.length < 250000) {
        sessionStorage.setItem(`pdf_thumb_${url}`, dataUrl);
      }
    } catch {
      // sessionStorage full or disabled
    }
  }
}

/**
 * Loads a PDF document from URL using PDF.js
 */
export async function loadPdfDocument(url: string): Promise<pdfjsLib.PDFDocumentProxy> {
  const streamUrl = getPdfStreamUrl(url);
  const loadingTask = pdfjsLib.getDocument({
    url: streamUrl,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@legacy/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Renders the first page of a PDF to an image data URL (PNG)
 */
export async function renderFirstPageToDataUrl(
  url: string,
  targetWidth = 560
): Promise<string> {
  const cached = getCachedPdfThumbnail(url);
  if (cached) return cached;

  const doc = await loadPdfDocument(url);
  const page = await doc.getPage(1);
  const unscaledViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context not available');

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({
    canvasContext: context,
    viewport,
    canvas,
  }).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  setCachedPdfThumbnail(url, dataUrl);
  return dataUrl;
}
