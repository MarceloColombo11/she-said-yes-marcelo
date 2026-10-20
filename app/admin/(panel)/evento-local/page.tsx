import { TextBlockEditor } from "@/components/admin/TextBlockEditor";
import { getTextBlocks } from "@/lib/content/texts";
import { TEXT_BLOCKS, type BlockValue } from "@/lib/content/text-blocks";

export const dynamic = "force-dynamic";

export default async function EventoLocalPage() {
  let evento: BlockValue | null = null;
  try {
    const blocks = await getTextBlocks();
    evento = blocks.evento as unknown as BlockValue;
  } catch {
    evento = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Evento e local</h1>
        <p className="mt-2 text-olive/75">
          Data e horário (contagem regressiva, agenda e convite), endereço, mapa e
          Instagram do local.
        </p>
      </div>
      {evento ? (
        <TextBlockEditor
          blockKey="evento"
          title={TEXT_BLOCKS.evento.label}
          hint={TEXT_BLOCKS.evento.description}
          fields={TEXT_BLOCKS.evento.fields}
          value={evento}
        />
      ) : (
        <p className="text-sm text-red-700" role="alert">
          Não foi possível carregar os dados do evento. Tente de novo em instantes.
        </p>
      )}
    </div>
  );
}
