"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  createHonorPerson,
  deleteHonorPerson,
  isHonorCategory,
  parseHonorPersonInput,
  reorderHonorPeople,
  updateHonorPerson,
} from "@/lib/content/honor-people";

export type HonorActionState =
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

export async function saveHonorPersonAction(
  _prev: HonorActionState,
  formData: FormData,
): Promise<HonorActionState> {
  await requireAdminSession();
  try {
    const parsed = parseHonorPersonInput(formData);
    if ("error" in parsed) return { ok: false, error: parsed.error };
    const id = String(formData.get("id") ?? "");
    if (id) {
      await updateHonorPerson(id, parsed);
    } else {
      await createHonorPerson(parsed);
    }
    publish();
    return { ok: true };
  } catch (error) {
    console.error("[honor] save", error);
    return { ok: false, error: failMessage(error) };
  }
}

export async function deleteHonorPersonAction(id: string): Promise<HonorActionState> {
  await requireAdminSession();
  try {
    await deleteHonorPerson(id);
    publish();
    return { ok: true };
  } catch (error) {
    console.error("[honor] delete", error);
    return { ok: false, error: failMessage(error) };
  }
}

export async function reorderHonorPeopleAction(
  category: string,
  ids: string[],
): Promise<HonorActionState> {
  await requireAdminSession();
  if (!isHonorCategory(category)) {
    return { ok: false, error: "Categoria inválida." };
  }
  try {
    await reorderHonorPeople(category, ids);
    publish();
    return { ok: true };
  } catch (error) {
    console.error("[honor] reorder", error);
    return { ok: false, error: failMessage(error) };
  }
}
