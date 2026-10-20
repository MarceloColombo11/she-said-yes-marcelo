import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { siteTextBlocks } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/content/seed";
import { deleteOrphanMedia } from "@/lib/content/media";
import {
  TEXT_BLOCKS,
  TEXT_BLOCK_KEYS,
  isTextBlockKey,
  readTextBlock,
  type BlockValue,
  type TextBlockKey,
  type TextBlockValues,
} from "@/lib/content/text-blocks";
import {
  SCALAR_TEXT_MAX,
  isHttpsUrl,
  isLocalDateTime,
  isUuid,
  trimOptional,
  trimRequired,
  validateParagraphs,
} from "@/lib/content/validation";

export async function getTextBlocks(): Promise<TextBlockValues> {
  await ensureSeeded();
  const db = requireDb();
  const rows = await db.select().from(siteTextBlocks);
  const byKey = new Map(rows.map((row) => [row.key, row.payload]));
  const out = {} as Record<TextBlockKey, unknown>;
  for (const key of TEXT_BLOCK_KEYS) {
    out[key] = readTextBlock(key, byKey.get(key) ?? null);
  }
  return out as TextBlockValues;
}

export function parseTextBlockForm(
  formData: FormData,
): { key: TextBlockKey; payload: BlockValue } | { error: string } {
  const keyRaw = String(formData.get("key") ?? "");
  if (!isTextBlockKey(keyRaw)) {
    return { error: "Bloco de texto inválido." };
  }

  const payload: BlockValue = {};
  for (const field of TEXT_BLOCKS[keyRaw].fields) {
    const label = field.label.toLowerCase();
    const max = field.max ?? SCALAR_TEXT_MAX;

    if (field.kind === "paragraphs") {
      const parsed = validateParagraphs(formData.getAll(field.name), field.label, {
        required: field.required ?? false,
        max: field.max,
      });
      if (!parsed.ok) return { error: parsed.error };
      payload[field.name] = parsed.value;
      continue;
    }

    if (field.kind === "media") {
      const raw = String(formData.get(field.name) ?? "").trim();
      if (raw && !isUuid(raw)) return { error: "Imagem inválida." };
      if (!raw && field.required) return { error: `Envie ${label}.` };
      payload[field.name] = raw || null;
      continue;
    }

    const parsed = field.required
      ? trimRequired(formData.get(field.name), label, max)
      : trimOptional(formData.get(field.name), label, max);
    if (!parsed.ok) return { error: parsed.error };

    if (field.kind === "datetime" && parsed.value && !isLocalDateTime(parsed.value)) {
      return { error: `Data inválida em ${label}.` };
    }
    if (field.kind === "url" && parsed.value && !isHttpsUrl(parsed.value)) {
      return { error: `Use um link começando com https:// em ${label}.` };
    }
    payload[field.name] = parsed.value;
  }

  if (keyRaw === "evento") {
    const inicio = String(payload.inicio ?? "");
    const fim = String(payload.fim ?? "");
    if (fim <= inicio) {
      return { error: "O término precisa ser depois do início." };
    }
    const posts = (payload.instagramPosts as string[]) ?? [];
    if (posts.some((url) => !isHttpsUrl(url))) {
      return { error: "Cada publicação do Instagram precisa ser um link https://." };
    }
  }

  return { key: keyRaw, payload };
}

function mediaIdsOf(key: TextBlockKey, payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  return TEXT_BLOCKS[key].fields
    .filter((field) => field.kind === "media")
    .map((field) => record[field.name])
    .filter((value): value is string => typeof value === "string" && isUuid(value));
}

export async function saveTextBlock(
  key: TextBlockKey,
  payload: BlockValue,
): Promise<void> {
  const db = requireDb();
  const [current] = await db
    .select({ payload: siteTextBlocks.payload })
    .from(siteTextBlocks)
    .where(eq(siteTextBlocks.key, key))
    .limit(1);

  const now = new Date();
  await db
    .insert(siteTextBlocks)
    .values({ key, payload, updatedAt: now })
    .onConflictDoUpdate({
      target: siteTextBlocks.key,
      set: { payload, updatedAt: now },
    });

  const kept = new Set(mediaIdsOf(key, payload));
  for (const mediaId of mediaIdsOf(key, current?.payload)) {
    if (!kept.has(mediaId)) await deleteOrphanMedia(mediaId);
  }
}
