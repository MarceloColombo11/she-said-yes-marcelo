import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import presentesData from "@/data/presentes.json";
import sobreNosData from "@/data/sobre-nos.json";
import venueData from "@/data/venue.json";
import { getDb } from "@/lib/db/client";
import {
  gifts,
  honorPeople,
  scheduleItems,
  sitePhotos,
  siteTextBlocks,
} from "@/lib/db/schema";
import { publicMediaUrl } from "@/lib/site-media";
import { isUuid } from "@/lib/content/validation";
import type { WeddingEvent } from "@/lib/calendar";
import type { HonorPerson } from "@/components/HonorSection";
import type { TimelineEvent } from "@/components/Timeline";
import type { Presente } from "@/components/GiftCard";
import {
  HERO_STATIC,
  JSON_HONOR,
  JSON_SCHEDULE,
  ensureSeeded,
  giftStaticImage,
} from "@/lib/content/seed";
import {
  TEXT_BLOCK_KEYS,
  readTextBlock,
  type CompartilhamentoBlock,
  type ConfirmacaoBlock,
  type EventoBlock,
  type RodapeBlock,
  type RsvpBlock,
  type SecoesBlock,
  type SobreNosBlock,
  type TextBlockKey,
  type TextBlockValues,
} from "@/lib/content/text-blocks";

export type PublicEvento = EventoBlock & { logoUrl: string };

export type PublicSiteContent = {
  evento: PublicEvento;
  weddingEvent: WeddingEvent;
  sobreNos: SobreNosBlock & { imagensCarrossel: string[] };
  secoes: SecoesBlock;
  rsvp: RsvpBlock;
  confirmacao: ConfirmacaoBlock;
  rodape: RodapeBlock;
  compartilhamento: CompartilhamentoBlock;
  heroImageUrls: string[];
  padrinhos: HonorPerson[];
  honra: HonorPerson[];
  damas: HonorPerson[];
  programacao: TimelineEvent[];
  gifts: Presente[];
};

type JsonGift = { id: string; nome: string; descricao: string; valor?: string };

function toWeddingEvent(evento: EventoBlock): WeddingEvent {
  return {
    title: evento.tituloAgenda,
    description: evento.descricaoAgenda,
    venueName: evento.localNome,
    address: evento.endereco,
    mapsUrl: evento.mapsUrl,
    startLocal: evento.inicio,
    endLocal: evento.fim,
  };
}

function assemble(
  texts: TextBlockValues,
  parts: Pick<
    PublicSiteContent,
    "heroImageUrls" | "padrinhos" | "honra" | "damas" | "programacao" | "gifts"
  > & { historiaImageUrls: string[] },
): PublicSiteContent {
  const evento: PublicEvento = {
    ...texts.evento,
    logoUrl: texts.evento.logoMediaId
      ? publicMediaUrl(texts.evento.logoMediaId)
      : venueData.logo,
  };
  const { historiaImageUrls, ...rest } = parts;
  return {
    evento,
    weddingEvent: toWeddingEvent(evento),
    sobreNos: { ...texts.sobre_nos, imagensCarrossel: historiaImageUrls },
    secoes: texts.secoes,
    rsvp: texts.rsvp,
    confirmacao: texts.confirmacao,
    rodape: texts.rodape,
    compartilhamento: texts.compartilhamento,
    ...rest,
  };
}

function textsFrom(byKey: Map<string, unknown>): TextBlockValues {
  const out = {} as Record<TextBlockKey, unknown>;
  for (const key of TEXT_BLOCK_KEYS) {
    out[key] = readTextBlock(key, byKey.get(key) ?? null);
  }
  return out as TextBlockValues;
}

function fallbackContent(): PublicSiteContent {
  const honor = (list: typeof JSON_HONOR.padrinhos): HonorPerson[] =>
    list.map((person) => ({ ...person }));
  return assemble(textsFrom(new Map()), {
    heroImageUrls: HERO_STATIC,
    historiaImageUrls: sobreNosData.imagensCarrossel ?? [],
    padrinhos: honor(JSON_HONOR.padrinhos),
    honra: honor(JSON_HONOR.honra),
    damas: honor(JSON_HONOR.damas),
    programacao: JSON_SCHEDULE.map((item) => ({ ...item })),
    gifts: (presentesData as JsonGift[]).map(({ id, nome, descricao, valor }) => ({
      id,
      nome,
      descricao,
      valor,
      imagem: giftStaticImage(id),
    })),
  });
}

function isMissingRelation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const cause =
    "cause" in error ? (error as { cause?: { code?: string } }).cause : undefined;
  return cause?.code === "42P01";
}

async function loadFromDb(): Promise<PublicSiteContent> {
  const db = getDb();
  if (!db) return fallbackContent();
  await ensureSeeded();

  const [giftRows, photoRows, textRows, peopleRows, scheduleRows] =
    await Promise.all([
      db.select().from(gifts).orderBy(asc(gifts.sortOrder), asc(gifts.createdAt)),
      db
        .select()
        .from(sitePhotos)
        .orderBy(asc(sitePhotos.sortOrder), asc(sitePhotos.createdAt)),
      db.select().from(siteTextBlocks),
      db
        .select()
        .from(honorPeople)
        .orderBy(asc(honorPeople.sortOrder), asc(honorPeople.createdAt)),
      db
        .select()
        .from(scheduleItems)
        .orderBy(asc(scheduleItems.sortOrder), asc(scheduleItems.createdAt)),
    ]);

  const photosOf = (collection: "hero" | "historia") =>
    photoRows
      .filter((row) => row.collection === collection)
      .map((row) => publicMediaUrl(row.mediaId));

  const peopleOf = (category: "padrinhos" | "honra" | "damas"): HonorPerson[] =>
    peopleRows
      .filter((row) => row.category === category)
      .map((row) => ({
        nome: row.name,
        texto: row.text,
        foto: row.mediaId ? publicMediaUrl(row.mediaId) : "",
        fotoZoom: row.photoZoom ?? undefined,
        fotoObjectPosition: row.photoObjectPosition ?? undefined,
        fotoOffsetY: row.photoOffsetY ?? undefined,
      }));

  return assemble(textsFrom(new Map(textRows.map((row) => [row.key, row.payload]))), {
    heroImageUrls: photosOf("hero"),
    historiaImageUrls: photosOf("historia"),
    padrinhos: peopleOf("padrinhos"),
    honra: peopleOf("honra"),
    damas: peopleOf("damas"),
    programacao: scheduleRows.map((row) => ({
      hora: row.time,
      titulo: row.title,
      resumo: row.summary,
      descricao: row.description,
      icone: row.icon,
      local: row.location ?? undefined,
      destaque: row.highlight,
    })),
    gifts: giftRows.map((row) => ({
      id: row.id,
      nome: row.title,
      descricao: row.description,
      valor: row.suggestedValue ?? undefined,
      imagem: row.mediaId ? publicMediaUrl(row.mediaId) : null,
    })),
  });
}

export const getPublicSiteContent = cache(
  async (): Promise<PublicSiteContent> => {
    try {
      return await loadFromDb();
    } catch (error) {
      if (!isMissingRelation(error)) {
        console.error("[content/public] usando fallback", error);
      }
      return fallbackContent();
    }
  },
);

export async function getGiftPixById(id: string): Promise<string | null> {
  try {
    const db = getDb();
    if (db) {
      await ensureSeeded();
      if (isUuid(id)) {
        const [row] = await db
          .select({ pix: gifts.pix })
          .from(gifts)
          .where(eq(gifts.id, id))
          .limit(1);
        if (row) return row.pix?.trim() || null;
      }
    }
  } catch {
    console.error("[content/public] pix db");
  }

  const fromJson = (presentesData as { id: string; chavePix?: string }[]).find(
    (item) => item.id === id,
  );
  return fromJson?.chavePix?.trim() || null;
}
