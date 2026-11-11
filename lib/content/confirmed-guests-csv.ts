import type { AdminGuest, AdminGuestGroup } from "./guests.ts";

const HEADERS = [
  "nome",
  "grupo",
  "e-mail",
  "acompanhante",
  "microônibus",
  "recado",
  "data da resposta",
] as const;

export function buildConfirmedGuestsCsv(
  guests: AdminGuest[],
  groups: AdminGuestGroup[],
): string {
  const groupLabel = new Map(groups.map((group) => [group.id, group.label]));
  const rows = guests
    .filter((guest) => guest.status === "confirmed")
    .map((guest) => [
      guest.fullName,
      guest.groupId ? (groupLabel.get(guest.groupId) ?? "") : "",
      guest.email ?? "",
      guest.companionName ?? "",
      microonibusCell(guest.microonibus),
      guest.message ?? "",
      formatRespondedAt(guest.respondedAt),
    ]);

  return `\uFEFF${[HEADERS, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")}\r\n`;
}

function microonibusCell(value: boolean | null): string {
  if (value == null) return "";
  return value ? "sim" : "não";
}

function formatRespondedAt(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("day")}/${pick("month")}/${pick("year")} ${pick("hour")}:${pick("minute")}`;
}

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[;"\r\n]/.test(safe)) return `"${safe.replaceAll('"', '""')}"`;
  return safe;
}

export function downloadConfirmedGuestsCsv(
  guests: AdminGuest[],
  groups: AdminGuestGroup[],
): void {
  const csv = buildConfirmedGuestsCsv(guests, groups);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "confirmados.csv";
  link.click();
  URL.revokeObjectURL(url);
}
