import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countComingPeople,
  planCompanionGuest,
} from "./companion-guest.ts";

describe("planCompanionGuest", () => {
  const primary = "marcelo henrique colombo";

  it("cria um convidado novo quando o acompanhante ainda não está na lista", () => {
    const plan = planCompanionGuest("Suelen Januario", primary, []);
    assert.deepEqual(plan, {
      action: "create",
      fullName: "Suelen Januario",
      nameNormalized: "suelen januario",
    });
  });

  it("confirma o convidado que já existe com o mesmo nome", () => {
    const plan = planCompanionGuest("Suelen Januário", primary, [
      { id: "suelen", nameNormalized: "suelen januario" },
    ]);
    assert.deepEqual(plan, { action: "confirm", id: "suelen" });
  });

  it("não cria o acompanhante de novo quando o nome é o da própria pessoa", () => {
    const plan = planCompanionGuest("Marcelo Henrique Colombo", primary, [
      { id: "marcelo", nameNormalized: primary },
    ]);
    assert.deepEqual(plan, { action: "none" });
  });

  it("recusa acompanhante sem sobrenome", () => {
    const plan = planCompanionGuest("Suelen", primary, []);
    assert.equal(plan.action, "reject");
    if (plan.action === "reject") {
      assert.match(plan.error, /sobrenome/);
    }
  });

  it("não escolhe sozinho quando há mais de um convidado com o mesmo nome", () => {
    const plan = planCompanionGuest("Ana Souza", primary, [
      { id: "a", nameNormalized: "ana souza" },
      { id: "b", nameNormalized: "ana souza" },
    ]);
    assert.deepEqual(plan, { action: "none" });
  });

  it("ignora acompanhante em branco", () => {
    assert.deepEqual(planCompanionGuest("  ", primary, []), { action: "none" });
    assert.deepEqual(planCompanionGuest(null, primary, []), { action: "none" });
  });
});

describe("countComingPeople", () => {
  it("não conta duas vezes o acompanhante que já é convidado", () => {
    const totals = countComingPeople([
      {
        name: "Marcelo Henrique Colombo",
        companionName: "Suelen Januario",
        microonibus: false,
      },
      {
        name: "Suelen Januario",
        companionName: null,
        microonibus: false,
      },
    ]);
    assert.deepEqual(totals, { people: 2, bus: 0 });
  });

  it("ainda soma o acompanhante que só existe como nome", () => {
    const totals = countComingPeople([
      {
        name: "Marcelo Henrique Colombo",
        companionName: "Suelen Januario",
        microonibus: true,
      },
    ]);
    assert.deepEqual(totals, { people: 2, bus: 2 });
  });
});
