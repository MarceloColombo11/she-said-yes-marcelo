import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildConfirmedGuestsCsv } from "./confirmed-guests-csv.ts";
import type { AdminGuest, AdminGuestGroup } from "./guests.ts";

const groups: AdminGuestGroup[] = [
  { id: "g1", label: "Família Colombo", sortOrder: 0 },
];

function guest(overrides: Partial<AdminGuest> & Pick<AdminGuest, "id" | "fullName" | "status">): AdminGuest {
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

describe("buildConfirmedGuestsCsv", () => {
  it("exporta só quem confirmou, com cabeçalho e separador ponto e vírgula", () => {
    const csv = buildConfirmedGuestsCsv(
      [
        guest({
          id: "1",
          fullName: "Ana Souza",
          status: "confirmed",
          groupId: "g1",
          email: "ana@example.com",
          companionName: "Bruno Souza",
          microonibus: true,
          message: "Vamos sim",
          respondedAt: "2026-11-11T15:30:00.000Z",
        }),
        guest({ id: "2", fullName: "Carlos Lima", status: "declined" }),
        guest({ id: "3", fullName: "Diana Alves", status: "pending" }),
      ],
      groups,
    );

    assert.equal(
      csv,
      "\uFEFFnome;grupo;e-mail;acompanhante;microônibus;recado;data da resposta\r\n" +
        "Ana Souza;Família Colombo;ana@example.com;Bruno Souza;sim;Vamos sim;11/11/2026 12:30\r\n",
    );
  });

  it("deixa células vazias e protege ponto e vírgula, aspas e fórmula", () => {
    const csv = buildConfirmedGuestsCsv(
      [
        guest({
          id: "1",
          fullName: '=Ana "Souza";',
          status: "confirmed",
          message: "linha 1\nlinha 2",
        }),
      ],
      [],
    );

    assert.equal(
      csv,
      "\uFEFFnome;grupo;e-mail;acompanhante;microônibus;recado;data da resposta\r\n" +
        "\"'=Ana \"\"Souza\"\";\";;;;;\"linha 1\nlinha 2\";\r\n",
    );
  });

  it("grava não quando a pessoa recusou o microônibus", () => {
    const csv = buildConfirmedGuestsCsv(
      [guest({ id: "1", fullName: "Eva", status: "confirmed", microonibus: false })],
      [],
    );
    assert.match(csv, /Eva;;;;não;;\r\n$/);
  });
});
