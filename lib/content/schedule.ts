import { asc, eq, max } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { scheduleItems } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/content/seed";
import {
  DESCRIPTION_MAX,
  SCALAR_TEXT_MAX,
  TITLE_MAX,
  isUuid,
  trimOptional,
  trimRequired,
} from "@/lib/content/validation";

export const SCHEDULE_ICONS: { value: string; label: string }[] = [
  { value: "coffee", label: "Café / recepção" },
  { value: "church", label: "Igreja / cerimônia" },
  { value: "wine", label: "Taça / cocktail" },
  { value: "utensils", label: "Talheres / jantar" },
  { value: "music", label: "Música / festa" },
];

export type AdminScheduleItem = {
  id: string;
  time: string;
  title: string;
  summary: string;
  description: string;
  icon: string;
  location: string;
  highlight: boolean;
  sortOrder: number;
};

export async function listScheduleItems(): Promise<AdminScheduleItem[]> {
  await ensureSeeded();
  const db = requireDb();
  const rows = await db
    .select()
    .from(scheduleItems)
    .orderBy(asc(scheduleItems.sortOrder), asc(scheduleItems.createdAt));
  return rows.map((row) => ({
    id: row.id,
    time: row.time,
    title: row.title,
    summary: row.summary,
    description: row.description,
    icon: row.icon,
    location: row.location ?? "",
    highlight: row.highlight,
    sortOrder: row.sortOrder,
  }));
}

export type ScheduleInput = {
  time: string;
  title: string;
  summary: string;
  description: string;
  icon: string;
  location: string | null;
  highlight: boolean;
};

export function parseScheduleInput(
  formData: FormData,
): ScheduleInput | { error: string } {
  const time = trimRequired(formData.get("time"), "o horário", 20);
  if (!time.ok) return { error: time.error };
  const title = trimRequired(formData.get("title"), "o título", TITLE_MAX);
  if (!title.ok) return { error: title.error };
  const summary = trimRequired(formData.get("summary"), "o resumo", SCALAR_TEXT_MAX);
  if (!summary.ok) return { error: summary.error };
  const description = trimRequired(
    formData.get("description"),
    "a descrição",
    DESCRIPTION_MAX,
  );
  if (!description.ok) return { error: description.error };
  const icon = String(formData.get("icon") ?? "");
  if (!SCHEDULE_ICONS.some((item) => item.value === icon)) {
    return { error: "Escolha um ícone." };
  }
  const location = trimOptional(formData.get("location"), "o local", TITLE_MAX);
  if (!location.ok) return { error: location.error };
  return {
    time: time.value,
    title: title.value,
    summary: summary.value,
    description: description.value,
    icon,
    location: location.value || null,
    highlight: formData.get("highlight") === "on",
  };
}

export async function createScheduleItem(input: ScheduleInput): Promise<void> {
  const db = requireDb();
  await ensureSeeded();
  const [agg] = await db
    .select({ value: max(scheduleItems.sortOrder) })
    .from(scheduleItems);
  await db.insert(scheduleItems).values({
    ...input,
    sortOrder: (agg?.value ?? -1) + 1,
  });
}

export async function updateScheduleItem(
  id: string,
  input: ScheduleInput,
): Promise<void> {
  if (!isUuid(id)) throw new Error("Momento não encontrado.");
  const db = requireDb();
  const updated = await db
    .update(scheduleItems)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(scheduleItems.id, id))
    .returning({ id: scheduleItems.id });
  if (updated.length === 0) throw new Error("Momento não encontrado.");
}

export async function deleteScheduleItem(id: string): Promise<void> {
  if (!isUuid(id)) throw new Error("Momento não encontrado.");
  const db = requireDb();
  await db.delete(scheduleItems).where(eq(scheduleItems.id, id));
}

export async function reorderScheduleItems(ids: string[]): Promise<void> {
  const db = requireDb();
  const existing = await db.select({ id: scheduleItems.id }).from(scheduleItems);
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
        .update(scheduleItems)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(scheduleItems.id, id)),
    ),
  );
}
