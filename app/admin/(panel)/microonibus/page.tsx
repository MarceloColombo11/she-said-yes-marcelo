import { requireAdminSession } from "@/lib/admin-auth";
import { listBusRiders } from "@/lib/content/bus-list";
import { loadGuestBoard } from "@/lib/content/guests";

export const dynamic = "force-dynamic";

export default async function MicroonibusPage() {
  await requireAdminSession();
  let board: Awaited<ReturnType<typeof loadGuestBoard>>;
  try {
    board = await loadGuestBoard();
  } catch {
    return (
      <div>
        <h1 className="font-heading text-3xl font-semibold">Microônibus</h1>
        <p className="mt-4 text-sm text-red-700" role="alert">
          Não foi possível carregar a lista. Tente de novo em instantes.
        </p>
      </div>
    );
  }

  const { rows, seats } = listBusRiders(board.guests, board.groups, board.unmatched);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Microônibus</h1>
        <p className="mt-2 text-olive/75">
          {seats} {seats === 1 ? "lugar" : "lugares"}
        </p>
        <p className="mt-1 text-sm text-olive/70">
          O acompanhante entra na conta quando ainda não está na lista.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-olive/60">Ninguém pediu o microônibus.</p>
      ) : (
        <div className="overflow-x-auto border border-sage/30">
          <table className="w-full min-w-xl text-left">
            <thead>
              <tr className="bg-[#f7f4ef] text-xs font-medium text-olive/60">
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Grupo</th>
                <th className="px-3 py-2 font-medium">Acompanhante</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.name}-${index}`} className="border-t border-sage/30 align-top">
                  <td className="px-3 py-2 font-medium text-olive">{row.name}</td>
                  <td className="px-3 py-2 text-olive/80">{row.group || "—"}</td>
                  <td className="px-3 py-2 text-olive/80">
                    {row.companion ? (
                      <span>
                        {row.companion}
                        {row.companionCounts ? (
                          <span className="mt-1 block text-xs text-olive/60">
                            Conta como lugar
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
