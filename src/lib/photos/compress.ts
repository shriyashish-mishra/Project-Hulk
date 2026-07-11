const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

/**
 * Resizes to a max 1600px edge and re-encodes as JPEG in the browser before
 * upload — keeps files small while preserving enough detail for visual
 * comparison later. Runs entirely client-side, nothing touches the server
 * until the compressed blob is ready.
 */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process the photo."))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}
