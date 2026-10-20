import {
  GUEST_NAME_MAX,
  normalizePersonName,
  validateGuestFullName,
} from "./guest-name.ts";

export type CompanionMatch = { id: string; nameNormalized: string };

export type CompanionPlan =
  | { action: "none" }
  | { action: "reject"; error: string }
  | { action: "create"; fullName: string; nameNormalized: string }
  | { action: "confirm"; id: string };

export function planCompanionGuest(
  companionName: string | null | undefined,
  primaryNameNormalized: string,
  matches: CompanionMatch[],
): CompanionPlan {
  const trimmed =
    typeof companionName === "string" ? companionName.replace(/\s+/g, " ").trim() : "";
  if (!trimmed) return { action: "none" };

  const parsed = validateGuestFullName(trimmed);
  if (!parsed.ok) {
    const error = parsed.error.startsWith("O nome pode")
      ? `O nome do acompanhante pode ter no máximo ${GUEST_NAME_MAX} caracteres.`
      : "Informe nome e sobrenome do acompanhante.";
    return { action: "reject", error };
  }

  if (parsed.normalized === primaryNameNormalized) return { action: "none" };

  const same = matches.filter((match) => match.nameNormalized === parsed.normalized);
  if (same.length > 1) return { action: "none" };
  if (same.length === 1) return { action: "confirm", id: same[0].id };
  return {
    action: "create",
    fullName: parsed.value,
    nameNormalized: parsed.normalized,
  };
}

export function countComingPeople(
  rows: {
    name: string;
    companionName: string | null;
    microonibus: boolean | null;
  }[],
): { people: number; bus: number } {
  const names = new Set(rows.map((row) => normalizePersonName(row.name)));
  let people = 0;
  let bus = 0;
  for (const row of rows) {
    people += 1;
    if (row.microonibus) bus += 1;
    if (!row.companionName) continue;
    const companion = normalizePersonName(row.companionName);
    if (!companion || names.has(companion)) continue;
    people += 1;
    if (row.microonibus) bus += 1;
  }
  return { people, bus };
}
