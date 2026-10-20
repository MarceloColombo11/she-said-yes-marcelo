export const SITE_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const HERO_PHOTO_LIMIT = 6;
export const HISTORIA_PHOTO_LIMIT = 12;

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;
export const LONG_TEXT_MAX = 5000;
export const PIX_MAX = 512;
export const VALUE_MAX = 60;
export const SCALAR_TEXT_MAX = 500;
export const PARAGRAPH_MAX = 2000;

export type PhotoCollection = "hero" | "historia";

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function trimRequired(
  value: unknown,
  label: string,
  max: number,
): ValidationResult {
  const trimmed = asString(value).trim();
  if (!trimmed) {
    return { ok: false, error: `Preencha ${label}.` };
  }
  if (trimmed.length > max) {
    return {
      ok: false,
      error: `${label} pode ter no máximo ${max} caracteres.`,
    };
  }
  return { ok: true, value: trimmed };
}

export function trimOptional(
  value: unknown,
  label: string,
  max: number,
): ValidationResult {
  const trimmed = asString(value).trim();
  if (!trimmed) return { ok: true, value: "" };
  if (trimmed.length > max) {
    return {
      ok: false,
      error: `${label} pode ter no máximo ${max} caracteres.`,
    };
  }
  return { ok: true, value: trimmed };
}

export function validatePix(value: unknown): ValidationResult {
  const compact = asString(value).replace(/\s+/g, "");
  if (!compact) return { ok: true, value: "" };
  const looksLikeCopiaCola =
    compact.startsWith("000201") && compact.includes("BR.GOV.BCB.PIX");
  if (!looksLikeCopiaCola || compact.length > PIX_MAX) {
    return {
      ok: false,
      error:
        "Cole o código Pix copia e cola gerado pelo banco, ou deixe vazio.",
    };
  }
  return { ok: true, value: compact };
}

export function validateSiteImageFile(input: {
  mimeType: string;
  size: number;
}): { ok: true } | { ok: false; error: string } {
  const mime = (input.mimeType || "").toLowerCase().trim();
  if (!(SITE_IMAGE_MIMES as readonly string[]).includes(mime)) {
    return {
      ok: false,
      error: "Envie uma foto em JPEG, PNG ou WebP.",
    };
  }
  if (!Number.isFinite(input.size) || input.size <= 0) {
    return { ok: false, error: "Arquivo inválido." };
  }
  return { ok: true };
}

export function photoLimit(collection: PhotoCollection): number {
  return collection === "hero" ? HERO_PHOTO_LIMIT : HISTORIA_PHOTO_LIMIT;
}

export function photoLimitMessage(collection: PhotoCollection): string {
  return collection === "hero"
    ? `A capa aceita no máximo ${HERO_PHOTO_LIMIT} fotos. Remova uma para enviar outra.`
    : `Sobre Nós aceita no máximo ${HISTORIA_PHOTO_LIMIT} fotos. Remova uma para enviar outra.`;
}

export function validateParagraphs(
  values: unknown[],
  label: string,
  options: { required?: boolean; max?: number } = {},
): { ok: true; value: string[] } | { ok: false; error: string } {
  const required = options.required ?? true;
  const max = options.max ?? PARAGRAPH_MAX;
  const paragraphs = values
    .map((item) => asString(item).trim())
    .filter((item) => item.length > 0);

  if (required && paragraphs.length === 0) {
    return {
      ok: false,
      error: `${label} precisa de pelo menos um item.`,
    };
  }

  for (const paragraph of paragraphs) {
    if (paragraph.length > max) {
      return {
        ok: false,
        error: `Cada item de ${label} pode ter no máximo ${max} caracteres.`,
      };
    }
  }

  return { ok: true, value: paragraphs };
}

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isLocalDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
}

export function isSafeStaticPath(path: string): boolean {
  if (!path.startsWith("/") || path.includes("..") || path.includes("\\")) {
    return false;
  }
  return (
    path.startsWith("/images/") || path.startsWith("/imagensPresentes/")
  );
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
