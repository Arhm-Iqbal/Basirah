export const STRIPPABLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const ACCEPTED_EVIDENCE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES_PER_INCIDENT = 8;

// Chrome/Safari refuse to rasterise beyond this on either axis; a canvas over the limit silently
// produces a blank bitmap, which would upload an all-black "photo" instead of failing.
const MAX_CANVAS_DIMENSION = 8192;

const JPEG_QUALITY = 0.92;

export type PreparedFile = {
  file: File;
  metadataStripped: boolean;
};

export class MetadataStripError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MetadataStripError';
  }
}

export function isStrippableImage(mimeType: string): boolean {
  return (STRIPPABLE_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

export function isAcceptedEvidence(mimeType: string): boolean {
  return (ACCEPTED_EVIDENCE_TYPES as readonly string[]).includes(mimeType);
}

function loadImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new MetadataStripError('That image could not be read.'));
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new MetadataStripError('That image could not be re-encoded.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      mimeType === 'image/png' ? undefined : JPEG_QUALITY,
    );
  });
}

function scaleToLimit(width: number, height: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= MAX_CANVAS_DIMENSION) return { width, height };
  const ratio = MAX_CANVAS_DIMENSION / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

/**
 * Re-encodes an image through a canvas, which is what actually removes the metadata: the canvas
 * holds decoded pixels only, so EXIF GPS coordinates, device make/model, and serial numbers are
 * gone by construction rather than by a parser we would have to keep correct.
 *
 * Rejects rather than returning the original on any failure. A photo of vandalism carries the
 * reporter's home location, so falling back to the raw file would be the worst outcome here.
 */
export async function stripImageMetadata(file: File): Promise<File> {
  if (!isStrippableImage(file.type)) {
    throw new MetadataStripError('That file type cannot be sanitised as an image.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);

    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    if (sourceWidth === 0 || sourceHeight === 0) {
      throw new MetadataStripError('That image could not be read.');
    }

    const { width, height } = scaleToLimit(sourceWidth, sourceHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (context === null) {
      throw new MetadataStripError('This browser could not process the image.');
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, file.type);

    // Filenames travel with the upload and often carry a handset or account name, so the
    // sanitised copy is renamed too.
    const extension =
      file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';

    return new File([blob], `evidence.${extension}`, {
      type: file.type,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Images are always re-encoded before they leave the browser. Documents cannot be sanitised this
 * way and are uploaded as-is, which the UI states plainly rather than implying they are scrubbed.
 */
export async function prepareEvidenceFile(file: File): Promise<PreparedFile> {
  if (!isAcceptedEvidence(file.type)) {
    throw new MetadataStripError('That file type is not supported.');
  }

  if (!isStrippableImage(file.type)) {
    return { file, metadataStripped: false };
  }

  return { file: await stripImageMetadata(file), metadataStripped: true };
}
