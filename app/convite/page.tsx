import type { Metadata } from "next";
import { ConvitePage } from "@/components/convite/ConvitePage";
import { formatDateLong, formatTime } from "@/lib/calendar";
import { getPublicSiteContent } from "@/lib/content/public";
import { shareOpenGraph } from "@/lib/share-metadata";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { compartilhamento, convite, evento } = await getPublicSiteContent();
  const title = `${convite.titulo} — ${compartilhamento.nomeSite}`;
  const description = `${formatDateLong(evento.inicio)}, ${formatTime(evento.inicio)} · ${evento.localNome}. Como chegar, programação e salvar na agenda.`;
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

export default async function ConviteRoute() {
  const content = await getPublicSiteContent();
  return (
    <ConvitePage
      texts={content.convite}
      event={content.weddingEvent}
      mapaEmbedUrl={content.evento.mapaEmbedUrl}
      programacao={content.programacao}
    />
  );
}
