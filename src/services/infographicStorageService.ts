/**
 * Infographic Storage Service
 * Handles compression and upload of infographic images to Supabase Storage
 */

import supabase from '@/services/supabase';

const BUCKET_NAME = 'infographics';
const MAX_SIZE_MB = 1;
const MIN_QUALITY = 0.85;

export interface CompressionResult {
  blob: Blob;
  quality: number;
  originalSize: number;
  compressedSize: number;
  format: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  compressionInfo?: {
    quality: number;
    originalSize: number;
    compressedSize: number;
  };
}

/**
 * Convert canvas to WebP blob with specified quality
 */
function canvasToWebPBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Compress base64 image to WebP format under maxSizeMB
 * Uses iterative quality reduction while maintaining visual quality
 */
export async function compressToWebP(
  base64Data: string,
  mimeType: string,
  maxSizeMB: number = MAX_SIZE_MB
): Promise<CompressionResult> {
  // Create image from base64
  const img = new Image();
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });

  // Calculate original size
  const originalSize = Math.ceil((base64Data.length * 3) / 4); // Approximate base64 to bytes

  // Create canvas at original resolution (preserving 4K quality)
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw image on canvas with high quality settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0);

  // Try lossless first (quality = 1.0)
  let quality = 1.0;
  let blob = await canvasToWebPBlob(canvas, quality);

  console.log(`[InfographicStorage] Initial WebP size: ${(blob.size / 1024 / 1024).toFixed(2)}MB at quality ${quality}`);

  // Iteratively reduce quality if needed, but never below MIN_QUALITY
  const maxBytes = maxSizeMB * 1024 * 1024;

  while (blob.size > maxBytes && quality > MIN_QUALITY) {
    quality -= 0.05;
    quality = Math.max(quality, MIN_QUALITY); // Ensure we don't go below minimum
    blob = await canvasToWebPBlob(canvas, quality);
    console.log(`[InfographicStorage] Reduced to quality ${quality.toFixed(2)}: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
  }

  // If still over limit at minimum quality, log warning but proceed
  if (blob.size > maxBytes) {
    console.warn(`[InfographicStorage] Image still ${(blob.size / 1024 / 1024).toFixed(2)}MB at minimum quality ${MIN_QUALITY}. Proceeding anyway to preserve quality.`);
  }

  return {
    blob,
    quality,
    originalSize,
    compressedSize: blob.size,
    format: 'webp'
  };
}

/**
 * Upload infographic to Supabase Storage
 */
export async function uploadInfographic(
  constituencyId: string,
  base64Data: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    // Compress image
    const compression = await compressToWebP(base64Data, mimeType);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${constituencyId}_${timestamp}.webp`;
    const filePath = `${constituencyId}/${filename}`;

    // Convert blob to File for upload
    const file = new File([compression.blob], filename, { type: 'image/webp' });

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false
      });

    if (error) {
      console.error('[InfographicStorage] Upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    console.log(`[InfographicStorage] Uploaded successfully: ${urlData.publicUrl}`);
    console.log(`[InfographicStorage] Compression: ${(compression.originalSize / 1024).toFixed(0)}KB -> ${(compression.compressedSize / 1024).toFixed(0)}KB (quality: ${compression.quality.toFixed(2)})`);

    return {
      success: true,
      url: urlData.publicUrl,
      compressionInfo: {
        quality: compression.quality,
        originalSize: compression.originalSize,
        compressedSize: compression.compressedSize
      }
    };
  } catch (error) {
    console.error('[InfographicStorage] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get all saved infographics for a constituency
 */
export interface InfographicFile {
  name: string;
  url: string;
  createdAt: Date;
}

export async function getInfographicsForConstituency(
  constituencyId: string
): Promise<InfographicFile[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(constituencyId, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('[InfographicStorage] List error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get public URLs for each file
    const files: InfographicFile[] = data
      .filter(file => file.name.endsWith('.webp'))
      .map(file => {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${constituencyId}/${file.name}`);

        return {
          name: file.name,
          url: urlData.publicUrl,
          createdAt: new Date(file.created_at)
        };
      });

    return files;
  } catch (error) {
    console.error('[InfographicStorage] Error fetching infographics:', error);
    return [];
  }
}

/**
 * Delete infographic from storage
 */
export async function deleteInfographic(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('[InfographicStorage] Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[InfographicStorage] Delete error:', error);
    return false;
  }
}

export default {
  compressToWebP,
  uploadInfographic,
  deleteInfographic,
  getInfographicsForConstituency
};
