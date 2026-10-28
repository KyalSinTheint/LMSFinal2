/**
 * Robust Video URL Parser and Embed Utilities for KBZLife LMS
 * Supports YouTube (Standard, Shorts, youtu.be, embed, mobile), Vimeo, Direct Files (MP4/WebM), and External Links.
 */

export interface ParsedVideoInfo {
  provider: 'youtube' | 'vimeo' | 'direct' | 'unsupported';
  embedUrl: string | null;
  videoId: string | null;
  thumbnailUrl: string | null;
  isEmbeddable: boolean;
  directPlayableUrl: string | null;
  errorMessage?: string;
}

/**
 * Safely extracts YouTube ID from any valid YouTube URL format:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ
 * - https://youtube.com/watch?feature=shared&v=dQw4w9WgXcQ
 */
export function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  try {
    // Check if it's a valid URL with protocol
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be' || parsed.hostname.endsWith('.youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // youtube.com (www., m., etc.)
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtube-nocookie.com')) {
      // /watch?v=VIDEO_ID
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }

      // /shorts/VIDEO_ID or /embed/VIDEO_ID or /v/VIDEO_ID
      const parts = parsed.pathname.split('/').filter(Boolean);
      const prefixIndex = parts.findIndex((p) => ['shorts', 'embed', 'v'].includes(p.toLowerCase()));
      if (prefixIndex !== -1 && parts[prefixIndex + 1]) {
        const id = parts[prefixIndex + 1].split('?')[0];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    }
  } catch {
    // Fallback to regex if URL parsing fails
  }

  // Regex fallback
  const regex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|watch\?(?:.*&)?v=))([a-zA-Z0-9_-]{11})/i;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
}

/**
 * Safely extracts Vimeo Video ID from:
 * - https://vimeo.com/123456789
 * - https://player.vimeo.com/video/123456789
 * - https://vimeo.com/channels/staffpicks/123456789
 */
export function extractVimeoId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // Raw digits ID
  if (/^\d{6,12}$/.test(url)) {
    return url;
  }

  const regex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+))/i;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
}

/**
 * Checks if URL is a direct playable video file (MP4, WebM, OGG, etc.)
 */
export function isDirectVideoUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const url = rawUrl.trim().toLowerCase();
  return (
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.ogg') ||
    url.endsWith('.mov') ||
    url.includes('.mp4?') ||
    url.includes('/storage/v1/object/public/videos/') ||
    url.includes('supabase.co/storage/v1/object/public')
  );
}

/**
 * Parses any video URL and returns embed details, provider type, and auto-thumbnails
 */
export function parseVideoUrl(rawUrl: string): ParsedVideoInfo {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      provider: 'unsupported',
      embedUrl: null,
      videoId: null,
      thumbnailUrl: null,
      isEmbeddable: false,
      directPlayableUrl: null,
      errorMessage: 'Please enter a valid video link (YouTube, Vimeo, or MP4 URL).',
    };
  }

  const trimmed = rawUrl.trim();

  // 1. YouTube
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`,
      videoId: ytId,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      isEmbeddable: true,
      directPlayableUrl: null,
    };
  }

  // 2. Vimeo
  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&dnt=1`,
      videoId: vimeoId,
      thumbnailUrl: null, // Vimeo thumbnail requires API; handled with fallback
      isEmbeddable: true,
      directPlayableUrl: null,
    };
  }

  // 3. Direct HTML5 Video File
  if (isDirectVideoUrl(trimmed)) {
    return {
      provider: 'direct',
      embedUrl: null,
      videoId: null,
      thumbnailUrl: null,
      isEmbeddable: true,
      directPlayableUrl: trimmed,
    };
  }

  // 4. Other / External Link
  return {
    provider: 'unsupported',
    embedUrl: null,
    videoId: null,
    thumbnailUrl: null,
    isEmbeddable: false,
    directPlayableUrl: null,
    errorMessage:
      'This URL cannot be embedded directly in an iframe. A secure "Open External Video" link will be provided for learners.',
  };
}
