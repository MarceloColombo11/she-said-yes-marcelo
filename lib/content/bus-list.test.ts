import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listBusRiders } from "./bus-list.ts";
import type { AdminGuest, AdminGuestGroup, AdminUnmatched } from "./guests.ts";

const groups: AdminGuestGroup[] = [{ id: "g1", label: "Família Colombo", sortOrder: 0 }];

function guest(
  overrides: Partial<AdminGuest> & Pick<AdminGuest, "id" | "fullName" | "status">,
): AdminGuest {
  return {
    groupId: null,
    respondedAt: null,
    email: null,
    companionName: null,
    microonibus: null,
    message: null,
    ...overrides,
  };
}

function unmatched(
  overrides: Partial<AdminUnmatched> & Pick<AdminUnmatched, "id" | "typedName" | "attending">,
): AdminUnmatched {
  return {
    createdAt: "2026-11-11T15:00:00.000Z",
    email: null,
    companionName: null,
    microonibus: null,
    message: null,
    ...overrides,
  };
}

describe("listBusRiders", () => {
  it("lista só quem confirmou e pediu o microônibus", () => {
    const result = listBusRiders(
      [
        guest({
          id: "1",
          fullName: "Ana Souza",
          status: "confirmed",
          groupId: "g1",
          microonibus: true,
          companionName: "Bruno Souza",
        }),
        guest({ id: "2", fullName: "Carlos Lima", status: "confirmed", microonibus: false }),
        guest({ id: "3", fullName: "Diana Alves", status: "pending", microonibus: true }),
        guest({ id: "4", fullName: "Eva Nunes", status: "declined", microonibus: true }),
      ],
      groups,
      [],
    );

    assert.deepEqual(result, {
      seats: 2,
      rows: [
        {
          name: "Ana Souza",
          group: "Família Colombo",
          companion: "Bruno Souza",
          companionCounts: true,
        },
      ],
    });
  });

  it("não soma de novo o acompanhante que já está na lista", () => {
    const result = listBusRiders(
      [
        guest({
          id: "1",
          fullName: "Ana Souza",
          status: "confirmed",
          microonibus: true,
          companionName: "Bruno Souza",
        }),
        guest({
          id: "2",
          fullName: "Bruno Souza",
          status: "confirmed",
          microonibus: false,
        }),
      ],
      [],
      [],
    );

    assert.equal(result.seats, 1);
    assert.equal(result.rows.length, 1);
    assert.equal(result.rows[0]?.companionCounts, false);
  });

  it("inclui confirmação avulsa de quem vem e pediu o ônibus", () => {
    const result = listBusRiders(
      [],
      [],
      [
        unmatched({ id: "1", typedName: "Caio Dias", attending: true, microonibus: true }),
        unmatched({ id: "2", typedName: "Dora Dias", attending: false, microonibus: true }),
        unmatched({ id: "3", typedName: "Eva Dias", attending: true, microonibus: false }),
      ],
    );

    assert.deepEqual(result.rows, [
      {
        name: "Caio Dias",
        group: "Avulsa",
        companion: null,
        companionCounts: false,
      },
    ]);
    assert.equal(result.seats, 1);
  });
});
