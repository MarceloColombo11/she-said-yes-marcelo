import { countComingPeople } from "./companion-guest.ts";
import { normalizePersonName } from "./guest-name.ts";
import type { AdminGuest, AdminGuestGroup, AdminUnmatched } from "./guests.ts";

export type BusRow = {
  name: string;
  group: string;
  companion: string | null;
  companionCounts: boolean;
};

export function listBusRiders(
  guests: AdminGuest[],
  groups: AdminGuestGroup[],
  unmatched: AdminUnmatched[],
): { rows: BusRow[]; seats: number } {
  const confirmed = guests.filter((guest) => guest.status === "confirmed");
  const comingUnmatched = unmatched.filter((item) => item.attending);
  const coming = [
    ...confirmed.map((guest) => ({
      name: guest.fullName,
      companionName: guest.companionName,
      microonibus: guest.microonibus,
    })),
    ...comingUnmatched.map((item) => ({
      name: item.typedName,
      companionName: item.companionName,
      microonibus: item.microonibus,
    })),
  ];
  const names = new Set(coming.map((row) => normalizePersonName(row.name)));
  const groupLabel = new Map(groups.map((group) => [group.id, group.label]));

  const rows = [
    ...confirmed
      .filter((guest) => guest.microonibus === true)
      .map((guest) =>
        toRow(
          guest.fullName,
          guest.groupId ? (groupLabel.get(guest.groupId) ?? "") : "",
          guest.companionName,
          names,
        ),
      ),
    ...comingUnmatched
      .filter((item) => item.microonibus === true)
      .map((item) => toRow(item.typedName, "Avulsa", item.companionName, names)),
  ].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return { rows, seats: countComingPeople(coming).bus };
}

function toRow(
  name: string,
  group: string,
  companionName: string | null,
  names: Set<string>,
): BusRow {
  const companion = companionName?.replace(/\s+/g, " ").trim() || null;
  const normalized = companion ? normalizePersonName(companion) : "";
  return {
    name,
    group,
    companion,
    companionCounts: Boolean(normalized && !names.has(normalized)),
  };
}
