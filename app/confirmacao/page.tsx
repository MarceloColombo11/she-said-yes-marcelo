import type { Metadata } from "next";
import { ConfirmacaoPage } from "@/components/confirmacao/ConfirmacaoPage";
import { getPublicSiteContent } from "@/lib/content/public";
import { shareOpenGraph } from "@/lib/share-metadata";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { compartilhamento, confirmacao, evento } = await getPublicSiteContent();
  const title = `${confirmacao.titulo} — ${compartilhamento.nomeSite}`;
  const description = `Confirme se você vem à festa, salve a data e o endereço do ${evento.localNome}. ${confirmacao.prazo}.`;
  return {
    title,
    description,
    openGraph: shareOpenGraph({
      siteName: compartilhamento.nomeSite,
      title,
      description,
      imageAlt: `Monograma ${compartilhamento.nomeSite}`,
    }),
  };
}

export default async function ConfirmacaoRoute() {
  const content = await getPublicSiteContent();
  return (
    <ConfirmacaoPage texts={content.confirmacao} event={content.weddingEvent} />
  );
}
