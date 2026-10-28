/**
 * Supabase Storage & Large-File Streaming Uploader for KBZLife LMS
 * Supports direct device uploads up to 1 GB for videos and 100 MB for PDFs
 */

import { getSupabaseClient } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  storage_path?: string;
  path?: string;
  fileName?: string;
  size?: number;
  formattedSize?: string;
  error?: string;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg'];
const MAX_VIDEO_SIZE_BYTES = 1024 * 1024 * 1024; // 1 GB per video

const ALLOWED_PDF_TYPES = ['application/pdf'];
const MAX_PDF_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB for PDFs

/**
 * Validates image file type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported image format. Please select a JPG, PNG, or WebP image.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Image file is too large (${sizeMb} MB). Maximum allowed image size is 10 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validates lesson file (Video up to 1GB, PDF up to 150MB)
 */
export function validateLessonFile(
  file: File,
  expectedType: 'video' | 'pdf'
): { valid: boolean; error?: string } {
  const extension = (file.name.split('.').pop() || '').toLowerCase();

  if (expectedType === 'video') {
    const isVideoMime = ALLOWED_VIDEO_TYPES.includes(file.type) || file.type.startsWith('video/');
    const isVideoExt = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension);

    if (!isVideoMime && !isVideoExt) {
      return {
        valid: false,
        error: 'Unsupported video format. Please upload an MP4, WebM, or MOV file.',
      };
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Video exceeds the 1 GB maximum limit (${sizeMb} MB). Please compress or select a video under 1 GB.`,
      };
    }

    return { valid: true };
  }

  if (expectedType === 'pdf') {
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = extension === 'pdf';

    if (!isPdfMime && !isPdfExt) {
      return {
        valid: false,
        error: 'Unsupported document format. Please upload a PDF file (.pdf).',
      };
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `PDF document is too large (${sizeMb} MB). Maximum allowed PDF size is 150 MB.`,
      };
    }

    return { valid: true };
  }

  return { valid: true };
}

/**
 * Uploads an image file to Supabase Storage or persistent server fallback
 */
export async function uploadImageFile(
  file: File,
  bucketName: string = 'company-news'
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const storagePath = `${timestamp}_${randomStr}_${sanitizedName}`;

  // 1. Direct Supabase Storage attempt
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (!uploadErr && uploadData?.path) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uploadData.path);

        if (publicUrlData?.publicUrl) {
          return {
            success: true,
            url: publicUrlData.publicUrl,
            storage_path: uploadData.path,
            path: uploadData.path,
            size: file.size,
            formattedSize: formatBytes(file.size),
          };
        }
      }
    } catch (err: unknown) {
      console.warn('[KBZLife Storage] Client upload attempt skipped to server route:', err);
    }
  }

  // 2. Fallback to Server Upload Handler
  try {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        dataUrl,
        bucket: bucketName,
      }),
    });

    const result = await res.json();
    if (res.ok && result.success && result.url) {
      return {
        success: true,
        url: result.url,
        storage_path: result.fileName,
        path: result.fileName,
        size: file.size,
        formattedSize: formatBytes(file.size),
      };
    }

    return {
      success: false,
      error: result.message || 'Image upload failed. Please try again.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg || 'Upload failed due to network error.' };
  }
}

/**
 * Resumable & Chunked Upload for Large Files up to 1 GB (Videos & PDFs)
 * Never loads the entire file into browser memory as base64.
 * Uses 5 MB chunks with real progress tracking and cancellation support.
 */
export async function uploadLargeFileChunked(
  fileOrOptions:
    | File
    | {
        file: File;
        bucket: string;
        onProgress?: (progressPct: number, loadedBytes: number, totalBytes: number) => void;
        signal?: AbortSignal;
      },
  bucketArg?: string,
  onProgressArg?: (progressPct: number, loadedBytes: number, totalBytes: number) => void,
  signalArg?: AbortSignal
): Promise<UploadResult> {
  let file: File;
  let bucket: string;
  let onProgress: ((progressPct: number, loadedBytes: number, totalBytes: number) => void) | undefined;
  let signal: AbortSignal | undefined;

  if (fileOrOptions instanceof File) {
    file = fileOrOptions;
    bucket = bucketArg || 'uploads';
    onProgress = onProgressArg;
    signal = signalArg;
  } else {
    file = fileOrOptions.file;
    bucket = fileOrOptions.bucket;
    onProgress = fileOrOptions.onProgress;
    signal = fileOrOptions.signal;
  }

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let uploadedBytes = 0;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    if (signal?.aborted) {
      return { success: false, error: 'Upload was cancelled by user.' };
    }

    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunkBlob = file.slice(start, end);

    try {
      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        headers: {
          'x-upload-id': uploadId,
          'x-file-name': encodeURIComponent(file.name),
          'x-chunk-index': String(chunkIndex),
          'x-total-chunks': String(totalChunks),
          'x-file-type': file.type || 'application/octet-stream',
          'x-bucket': bucket,
          'Content-Type': 'application/octet-stream',
        },
        body: chunkBlob,
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = 'Failed to upload file chunk.';
        try {
          const errObj = JSON.parse(errorText);
          if (errObj.message) errMsg = errObj.message;
        } catch {}
        return { success: false, error: errMsg };
      }

      const result = await response.json();
      uploadedBytes += end - start;

      const progress = Math.min(100, Math.round((uploadedBytes / file.size) * 100));
      if (onProgress) {
        onProgress(progress, uploadedBytes, file.size);
      }

      if (result.complete && result.url) {
        const finalSize = result.size || file.size;
        return {
          success: true,
          url: result.url,
          storage_path: result.storage_path || result.fileName,
          path: result.storage_path || result.fileName,
          fileName: result.fileName,
          size: finalSize,
          formattedSize: formatBytes(finalSize),
        };
      }
    } catch (err: unknown) {
      if (signal?.aborted) {
        return { success: false, error: 'Upload cancelled.' };
      }
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Upload error on chunk ${chunkIndex + 1}/${totalChunks}: ${msg}` };
    }
  }

  return { success: false, error: 'Upload completed but server did not return a valid URL.' };
}

/**
 * Attempts to inspect the duration of an uploaded video file in the browser
 */
export function estimateVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const durationSeconds = Math.round(video.duration);
        if (isNaN(durationSeconds) || durationSeconds <= 0) {
          resolve(900);
          return;
        }
        resolve(durationSeconds);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(900);
      };
    } catch {
      resolve(900);
    }
  });
}

/**
 * Triggers a real browser file download using /api/download to force Content-Disposition: attachment
 */
export function triggerFileDownload(fileUrl: string, fileName?: string, role: string = 'user') {
  if (!fileUrl) return;
  const targetFileName = fileName || fileUrl.split('/').pop() || 'download';
  const downloadUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(targetFileName)}&role=${encodeURIComponent(role)}`;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', targetFileName);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
    } catch {}
  }, 100);
}


