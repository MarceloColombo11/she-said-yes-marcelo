import { validateSiteImageFile } from "@/lib/content/validation";

// A Vercel recusa corpos de requisição acima de ~4,5 MB.
const SHRINK_ABOVE_BYTES = 3.5 * 1024 * 1024;
const MAX_DIMENSION = 2400;

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function shrinkIfLarge(file: File): Promise<File> {
  if (file.size <= SHRINK_ABOVE_BYTES) return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob =
    file.type === "image/png" ? await toBlob(canvas, "image/png") : null;
  if (!blob || blob.size > SHRINK_ABOVE_BYTES) {
    blob = await toBlob(canvas, "image/jpeg", 0.85);
  }
  if (!blob) return file;

  const name = (file.name || "foto").replace(/\.[^.]+$/, "");
  const extension = blob.type === "image/png" ? "png" : "jpg";
  return new File([blob], `${name}.${extension}`, { type: blob.type });
}

export async function uploadSiteImage(original: File): Promise<string> {
  const validation = validateSiteImageFile({
    mimeType: original.type || "image/jpeg",
    size: original.size,
  });
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const file = await shrinkIfLarge(original);
  const form = new FormData();
  form.set("file", file, file.name || "foto.jpg");

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: form,
  });
  const done = (await response.json().catch(() => ({}))) as {
    mediaId?: string;
    error?: string;
  };
  if (!response.ok || !done.mediaId) {
    throw new Error(done.error || "Não foi possível enviar a foto.");
  }
  return done.mediaId;
}
