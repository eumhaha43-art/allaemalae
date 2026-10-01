"use client";

/**
 * Shrink a picked photo into something a post can carry.
 *
 * The object URL behind the picker preview dies with the document, so a post
 * that kept it would show a broken thumbnail after a reload. There is no
 * upload endpoint yet either, so the post stores a downscaled JPEG data URL
 * instead — a few tens of KB, which localStorage can hold.
 */

/** Long edge of the stored copy. The feed thumbnail is 72px at 1x. */
const MAX_EDGE = 320;
const QUALITY = 0.7;

export async function toThumbnail(file: File, fallback: string): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return fallback;

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", QUALITY);
  } catch {
    // Odd format, or no canvas — fall back to the preview URL, which at least
    // holds up until the page is reloaded.
    return fallback;
  }
}
