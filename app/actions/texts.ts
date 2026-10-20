"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { parseTextBlockForm, saveTextBlock } from "@/lib/content/texts";

export type TextActionState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

function failMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Não foi possível salvar. Tente de novo em instantes.";
}

export async function saveTextBlockAction(
  _prev: TextActionState,
  formData: FormData,
): Promise<TextActionState> {
  await requireAdminSession();
  try {
    const parsed = parseTextBlockForm(formData);
    if ("error" in parsed) return { ok: false, error: parsed.error };
    await saveTextBlock(parsed.key, parsed.payload);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("[texts] save", error);
    return { ok: false, error: failMessage(error) };
  }
}
