import { and, asc, eq, max } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { honorPeople } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/content/seed";
import { deleteOrphanMedia } from "@/lib/content/media";
import { publicMediaUrl } from "@/lib/site-media";
import {
  LONG_TEXT_MAX,
  TITLE_MAX,
  isUuid,
  trimOptional,
  trimRequired,
} from "@/lib/content/validation";

export type HonorCategory = "padrinhos" | "honra" | "damas";

export const HONOR_CATEGORIES: { value: HonorCategory; label: string }[] = [
  { value: "padrinhos", label: "Padrinhos" },
  { value: "honra", label: "Convidados de Honra" },
  { value: "damas", label: "Damas de Honra" },
];

export function isHonorCategory(value: string): value is HonorCategory {
  return value === "padrinhos" || value === "honra" || value === "damas";
}

export type AdminHonorPerson = {
  id: string;
  category: HonorCategory;
  name: string;
  text: string;
  mediaId: string | null;
  imageUrl: string | null;
  photoZoom: number | null;
  photoObjectPosition: string;
  photoOffsetY: number | null;
  sortOrder: number;
};

export async function listHonorPeople(): Promise<AdminHonorPerson[]> {
  await ensureSeeded();
  const db = requireDb();
  const rows = await db
    .select()
    .from(honorPeople)
    .orderBy(asc(honorPeople.sortOrder), asc(honorPeople.createdAt));
  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    name: row.name,
    text: row.text,
    mediaId: row.mediaId,
    imageUrl: row.mediaId ? publicMediaUrl(row.mediaId) : null,
    photoZoom: row.photoZoom,
    photoObjectPosition: row.photoObjectPosition ?? "",
    photoOffsetY: row.photoOffsetY,
    sortOrder: row.sortOrder,
  }));
}

export type HonorPersonInput = {
  category: HonorCategory;
  name: string;
  text: string;
  mediaId: string | null;
  photoZoom: number | null;
  photoObjectPosition: string | null;
  photoOffsetY: number | null;
};

function parseNumber(
  value: FormDataEntryValue | null,
  label: string,
  min: number,
  maxValue: number,
): { ok: true; value: number | null } | { ok: false; error: string } {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return { ok: true, value: null };
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > maxValue) {
    return {
      ok: false,
      error: `${label} precisa ser um número entre ${min} e ${maxValue}.`,
    };
  }
  return { ok: true, value: parsed };
}

export function parseHonorPersonInput(
  formData: FormData,
): HonorPersonInput | { error: string } {
  const category = String(formData.get("category") ?? "");
  if (!isHonorCategory(category)) return { error: "Categoria inválida." };
  const name = trimRequired(formData.get("name"), "o nome", TITLE_MAX);
  if (!name.ok) return { error: name.error };
  const text = trimRequired(formData.get("text"), "o texto", LONG_TEXT_MAX);
  if (!text.ok) return { error: text.error };
  const mediaRaw = String(formData.get("mediaId") ?? "").trim();
  const mediaId = mediaRaw || null;
  if (mediaId && !isUuid(mediaId)) return { error: "Imagem inválida." };
  const zoom = parseNumber(formData.get("photoZoom"), "O zoom", 0.5, 4);
  if (!zoom.ok) return { error: zoom.error };
  const offset = parseNumber(formData.get("photoOffsetY"), "O deslocamento", -50, 50);
  if (!offset.ok) return { error: offset.error };
  const position = trimOptional(
    formData.get("photoObjectPosition"),
    "o enquadramento",
    40,
  );
  if (!position.ok) return { error: position.error };
  return {
    category,
    name: name.value,
    text: text.value,
    mediaId,
    photoZoom: zoom.value,
    photoObjectPosition: position.value || null,
    photoOffsetY: offset.value,
  };
}

export async function createHonorPerson(input: HonorPersonInput): Promise<void> {
  const db = requireDb();
  await ensureSeeded();
  const [agg] = await db
    .select({ value: max(honorPeople.sortOrder) })
    .from(honorPeople)
    .where(eq(honorPeople.category, input.category));
  await db.insert(honorPeople).values({
    ...input,
    sortOrder: (agg?.value ?? -1) + 1,
  });
}

export async function updateHonorPerson(
  id: string,
  input: HonorPersonInput,
): Promise<void> {
  if (!isUuid(id)) throw new Error("Pessoa não encontrada.");
  const db = requireDb();
  const [current] = await db
    .select()
    .from(honorPeople)
    .where(eq(honorPeople.id, id))
    .limit(1);
  if (!current) throw new Error("Pessoa não encontrada.");
  await db
    .update(honorPeople)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(honorPeople.id, id));
  if (current.mediaId && current.mediaId !== input.mediaId) {
    await deleteOrphanMedia(current.mediaId);
  }
}

export async function deleteHonorPerson(id: string): Promise<void> {
  if (!isUuid(id)) throw new Error("Pessoa não encontrada.");
  const db = requireDb();
  const [current] = await db
    .select()
    .from(honorPeople)
    .where(eq(honorPeople.id, id))
    .limit(1);
  if (!current) throw new Error("Pessoa não encontrada.");
  await db.delete(honorPeople).where(eq(honorPeople.id, id));
  if (current.mediaId) await deleteOrphanMedia(current.mediaId);
}

export async function reorderHonorPeople(
  category: HonorCategory,
  ids: string[],
): Promise<void> {
  const db = requireDb();
  const existing = await db
    .select({ id: honorPeople.id })
    .from(honorPeople)
    .where(eq(honorPeople.category, category));
  const existingSet = new Set(existing.map((row) => row.id));
  const incoming = new Set(ids);
  if (
    existingSet.size !== incoming.size ||
    [...existingSet].some((id) => !incoming.has(id))
  ) {
    throw new Error("A ordem da lista mudou. Recarregue e tente de novo.");
  }
  await Promise.all(
    ids.map((id, index) =>
      db
        .update(honorPeople)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(and(eq(honorPeople.id, id), eq(honorPeople.category, category))),
    ),
  );
}
