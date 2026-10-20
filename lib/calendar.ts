/** Wedding event helpers for calendar (.ics / Google) and share links. */

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Brazil has had no DST since 2019; local times are always UTC-3. */
const SAO_PAULO_OFFSET = "-03:00";

export type WeddingEvent = {
  title: string;
  description: string;
  venueName: string;
  address: string;
  mapsUrl: string;
  /** "YYYY-MM-DDTHH:mm" in America/Sao_Paulo */
  startLocal: string;
  endLocal: string;
};

type LocalParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
};

function parseLocal(value: string): LocalParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) {
    return { year: "2026", month: "01", day: "01", hour: "00", minute: "00" };
  }
  const [, year, month, day, hour, minute] = match;
  return { year, month, day, hour, minute };
}

export function localToDate(value: string): Date {
  const p = parseLocal(value);
  return new Date(
    `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00${SAO_PAULO_OFFSET}`,
  );
}

/** "28 · 11 · 2026" */
export function formatDateDots(value: string): string {
  const p = parseLocal(value);
  return `${p.day} · ${p.month} · ${p.year}`;
}

/** "16:30" */
export function formatTime(value: string): string {
  const p = parseLocal(value);
  return `${p.hour}:${p.minute}`;
}

/** "28 de novembro de 2026" */
export function formatDateLong(value: string): string {
  const p = parseLocal(value);
  return `${Number(p.day)} de ${MONTHS[Number(p.month) - 1] ?? ""} de ${p.year}`;
}

/** "28.11.2026" */
export function formatDateCompact(value: string): string {
  const p = parseLocal(value);
  return `${p.day}.${p.month}.${p.year}`;
}

export function eventLocation(event: WeddingEvent): string {
  return `${event.venueName}, ${event.address}`;
}

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

export function buildIcsContent(event: WeddingEvent): string {
  const start = localToDate(event.startLocal);
  const end = localToDate(event.endLocal);
  const uid = `casamento-suelen-marcelo-${toIcsUtc(start)}@casamento`;
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
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `LOCATION:${escapeIcs(eventLocation(event))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/** Local times in America/Sao_Paulo (avoids browser TZ drift). */
function toGoogleLocal(value: string): string {
  const p = parseLocal(value);
  return `${p.year}${p.month}${p.day}T${p.hour}${p.minute}00`;
}

export function getGoogleCalendarUrl(event: WeddingEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: eventLocation(event),
    dates: `${toGoogleLocal(event.startLocal)}/${toGoogleLocal(event.endLocal)}`,
    ctz: "America/Sao_Paulo",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const ICS_PATH = "/casamento.ics";
export const ICS_FILENAME = "casamento-suelen-marcelo.ics";

/** iPhone / iPad — Safari abre .ics no app Calendar; blob+download não. */
export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports as Macintosh
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function getShareText(event: WeddingEvent): string {
  return [
    event.title,
    `${formatDateLong(event.startLocal)} · ${formatTime(event.startLocal)}`,
    event.venueName,
    event.address,
    event.mapsUrl,
  ].join("\n");
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
