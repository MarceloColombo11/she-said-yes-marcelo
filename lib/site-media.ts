import { isUuid } from "@/lib/content/validation";

export function publicMediaUrl(id: string): string {
  return `/api/site-media/${id}`;
}

/** Imagens servidas pela rota de mídia não passam pelo otimizador do next/image. */
export function isSiteMediaUrl(src: string): boolean {
  return src.startsWith("/api/site-media/");
}

export function parseMediaId(value: string | undefined): string | null {
  if (!value) return null;
  return isUuid(value) ? value : null;
}
