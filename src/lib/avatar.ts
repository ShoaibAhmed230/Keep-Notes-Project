import { supabase } from '@/lib/supabase';

export const AVATAR_BUCKET = 'avatars';
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB before compression
const OUTPUT_SIZE = 512;

export class AvatarError extends Error {}

/** Center-crops to a square and shrinks to 512px so uploads stay tiny. */
async function compressToSquare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const edge = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(OUTPUT_SIZE, edge);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new AvatarError('Your browser could not process this image.');

  ctx.drawImage(
    bitmap,
    (bitmap.width - edge) / 2,
    (bitmap.height - edge) / 2,
    edge,
    edge,
    0,
    0,
    size,
    size,
  );
  bitmap.close();

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/webp', 0.85),
  );
  if (!blob) throw new AvatarError('Could not compress this image. Try a different file.');
  return blob;
}

function describeStorageError(message: string): string {
  if (/bucket not found/i.test(message)) {
    return `Storage bucket "${AVATAR_BUCKET}" does not exist yet. Create it in your Supabase dashboard (Storage → New bucket → name it "${AVATAR_BUCKET}" and make it public).`;
  }
  if (/row-level security|policy|unauthorized|403/i.test(message)) {
    return `Upload was blocked by storage permissions. Add the upload policies for the "${AVATAR_BUCKET}" bucket in Supabase.`;
  }
  return message;
}

/** Uploads a new profile photo and returns its public URL. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new AvatarError('Please choose an image file (JPG, PNG, WebP or GIF).');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AvatarError('That image is larger than 5 MB. Please pick a smaller one.');
  }

  const blob = await compressToSquare(file);
  const path = `${userId}/${Date.now()}.webp`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: 'image/webp', upsert: true });

  if (error) throw new AvatarError(describeStorageError(error.message));

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Removes every stored photo for this user except the one currently in use.
 * Failures are ignored — orphaned files must never block saving a profile.
 */
export async function cleanupOldAvatars(userId: string, keepUrl?: string | null): Promise<void> {
  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
  if (error || !data?.length) return;

  const stale = data
    .map(item => `${userId}/${item.name}`)
    .filter(path => !keepUrl || !keepUrl.includes(path));

  if (stale.length) await supabase.storage.from(AVATAR_BUCKET).remove(stale);
}
