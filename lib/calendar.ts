/** Wedding event helpers for calendar (.ics / Google) and share links. */

export const WEDDING_EVENT = {
  title: "Casamento Suelen & Marcelo",
  description:
    "Cerimônia e celebração de Suelen e Marcelo no Mirante Garden.",
  location:
    "Mirante Garden, Estrada Geral da Fazendinha - Fazendinha, Biguaçu - SC, 88160-000",
  venueName: "Mirante Garden",
  address: "Estrada Geral da Fazendinha - Fazendinha, Biguaçu - SC, 88160-000",
  /** Local time America/Sao_Paulo */
  start: new Date("2026-11-28T16:30:00-03:00"),
  end: new Date("2026-11-28T23:00:00-03:00"),
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Mirante+Garden+Fazendinha+Biguacu+SC",
} as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Format as UTC ICS datetime: YYYYMMDDTHHMMSSZ */
export function toIcsUtc(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function buildIcsContent(event = WEDDING_EVENT): string {
  const uid = `casamento-suelen-marcelo-${toIcsUtc(event.start)}@casamento`;
  const stamp = toIcsUtc(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Suelen e Marcelo//Casamento//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsUtc(event.start)}`,
    `DTEND:${toIcsUtc(event.end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/** Fixed local times in America/Sao_Paulo (avoids browser TZ drift). */
const GOOGLE_START = "20261128T163000";
const GOOGLE_END = "20261128T230000";

export function getGoogleCalendarUrl(event = WEDDING_EVENT): string {
  const dates = `${GOOGLE_START}/${GOOGLE_END}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(
  filename = "casamento-suelen-marcelo.ics",
  event = WEDDING_EVENT
) {
  const blob = new Blob([buildIcsContent(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function getShareText(event = WEDDING_EVENT): string {
  return [
    event.title,
    "28 de novembro de 2026 · 16:30",
    event.venueName,
    event.address,
    event.mapsUrl,
  ].join("\n");
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
