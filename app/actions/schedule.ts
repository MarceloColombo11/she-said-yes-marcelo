"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  createScheduleItem,
  deleteScheduleItem,
  parseScheduleInput,
  reorderScheduleItems,
  updateScheduleItem,
} from "@/lib/content/schedule";

export type ScheduleActionState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function failMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Não foi possível salvar. Tente de novo em instantes.";
}

function publish(): void {
  revalidatePath("/", "layout");
}

export async function saveScheduleItemAction(
  _prev: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  await requireAdminSession();
  try {
    const parsed = parseScheduleInput(formData);
    if ("error" in parsed) return { ok: false, error: parsed.error };
    const id = String(formData.get("id") ?? "");
    if (id) {
      await updateScheduleItem(id, parsed);
    } else {
      await createScheduleItem(parsed);
    }
    publish();
    return { ok: true };
  } catch (error) {
    console.error("[schedule] save", error);
    return { ok: false, error: failMessage(error) };
  }
}

export async function deleteScheduleItemAction(
  id: string,
): Promise<ScheduleActionState> {
  await requireAdminSession();
  try {
    await deleteScheduleItem(id);
    publish();
    return { ok: true };
  } catch (error) {
    console.error("[schedule] delete", error);
    return { ok: false, error: failMessage(error) };
  }
}

export async function reorderScheduleItemsAction(
  ids: string[],
): Promise<ScheduleActionState> {
  await requireAdminSession();
  try {
    await reorderScheduleItems(ids);
    publish();
    return { ok: true };
  } catch (error) {
    console.error("[schedule] reorder", error);
    return { ok: false, error: failMessage(error) };
  }
}
