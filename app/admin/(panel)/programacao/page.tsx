import { ScheduleManager } from "@/components/admin/ScheduleManager";
import { SCHEDULE_ICONS, listScheduleItems } from "@/lib/content/schedule";

export const dynamic = "force-dynamic";

export default async function ProgramacaoPage() {
  let items: Awaited<ReturnType<typeof listScheduleItems>> = [];
  let error: string | null = null;
  try {
    items = await listScheduleItems();
  } catch {
    error = "Não foi possível carregar a programação. Tente de novo em instantes.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Programação</h1>
        <p className="mt-2 text-olive/75">
          Os momentos do dia, na ordem em que aparecem na linha do tempo.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <ScheduleManager items={items} icons={SCHEDULE_ICONS} />
      )}
    </div>
  );
}
