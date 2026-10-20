import { TextBlockEditor } from "@/components/admin/TextBlockEditor";
import { getTextBlocks } from "@/lib/content/texts";
import {
  TEXT_BLOCKS,
  TEXT_BLOCK_KEYS,
  type BlockValue,
} from "@/lib/content/text-blocks";

export const dynamic = "force-dynamic";

const KEYS = TEXT_BLOCK_KEYS.filter((key) => key !== "evento");

export default async function TextosPage() {
  let blocks: Awaited<ReturnType<typeof getTextBlocks>> | null = null;
  try {
    blocks = await getTextBlocks();
  } catch {
    blocks = null;
  }

  if (!blocks) {
    return (
      <div>
        <h1 className="font-heading text-3xl font-semibold">Textos</h1>
        <p className="mt-4 text-sm text-red-700" role="alert">
          Não foi possível carregar os textos. Tente de novo em instantes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Textos</h1>
        <p className="mt-2 text-olive/75">
          Cada bloco corresponde a um trecho que os convidados leem no site.
        </p>
      </div>
      {KEYS.map((key) => (
        <TextBlockEditor
          key={key}
          blockKey={key}
          title={TEXT_BLOCKS[key].label}
          hint={TEXT_BLOCKS[key].description}
          fields={TEXT_BLOCKS[key].fields}
          value={blocks[key] as unknown as BlockValue}
        />
      ))}
    </div>
  );
}
