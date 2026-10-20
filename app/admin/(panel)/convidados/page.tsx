import { requireAdminSession } from "@/lib/admin-auth";
import { loadGuestBoard, type RsvpExtras } from "@/lib/content/guests";
import { GuestPanel } from "@/components/admin/GuestPanel";

export const dynamic = "force-dynamic";

function headcount(rows: RsvpExtras[]) {
  let people = 0;
  let bus = 0;
  for (const row of rows) {
    const size = row.companionName ? 2 : 1;
    people += size;
    if (row.microonibus) bus += size;
  }
  return { people, bus };
}

export default async function ConvidadosPage() {
  await requireAdminSession();
  let board: Awaited<ReturnType<typeof loadGuestBoard>>;
  try {
    board = await loadGuestBoard();
  } catch {
    return (
      <div>
        <h1 className="font-heading text-3xl font-semibold">Convidados</h1>
        <p className="mt-4 text-sm text-red-700" role="alert">
          Não foi possível carregar a lista. Tente de novo em instantes.
        </p>
      </div>
    );
  }

  const confirmed = board.guests.filter((g) => g.status === "confirmed");
  const declined = board.guests.filter((g) => g.status === "declined").length;
  const pending = board.guests.length - confirmed.length - declined;
  const totals = headcount([
    ...confirmed,
    ...board.unmatched.filter((item) => item.attending),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Convidados</h1>
        <p className="mt-2 text-olive/75">
          {confirmed.length} confirmaram · {declined} não vão · {pending} pendentes
          {board.unmatched.length
            ? ` · ${board.unmatched.length} confirmação(ões) avulsa(s)`
            : ""}
        </p>
        <p className="mt-1 text-sm text-olive/70">
          Contando acompanhantes e confirmações avulsas: {totals.people}{" "}
          {totals.people === 1 ? "pessoa vem" : "pessoas vêm"} ·{" "}
          {totals.bus} {totals.bus === 1 ? "lugar" : "lugares"} no microônibus
        </p>
      </div>
      <GuestPanel board={board} />
    </div>
  );
}
