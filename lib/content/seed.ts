import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import presentesData from "@/data/presentes.json";
import sobreNosData from "@/data/sobre-nos.json";
import padrinhosData from "@/data/padrinhos.json";
import convidadosHonraData from "@/data/convidados-honra.json";
import damasData from "@/data/damas.json";
import programacaoData from "@/data/programacao.json";
import venueData from "@/data/venue.json";
import { getDb } from "@/lib/db/client";
import {
  contentSeed,
  gifts,
  honorPeople,
  scheduleItems,
  siteMedia,
  sitePhotos,
  siteTextBlocks,
} from "@/lib/db/schema";
import { isSafeStaticPath } from "@/lib/content/validation";
import {
  TEXT_BLOCK_KEYS,
  defaultTextBlock,
} from "@/lib/content/text-blocks";

const SEED_ID = "v1";

export const HERO_STATIC = ["/images/casal/1.jpeg"];

type JsonGift = {
  id: string;
  nome: string;
  descricao: string;
  valor?: string;
  chavePix?: string;
};

export type JsonHonorPerson = {
  nome: string;
  foto: string;
  texto: string;
  fotoZoom?: number;
  fotoObjectPosition?: string;
  fotoOffsetY?: number;
};

export type JsonScheduleItem = {
  hora: string;
  titulo: string;
  resumo: string;
  descricao: string;
  icone: string;
  local?: string;
  destaque?: boolean;
};

export const JSON_HONOR: Record<"padrinhos" | "honra" | "damas", JsonHonorPerson[]> = {
  padrinhos: padrinhosData as JsonHonorPerson[],
  honra: convidadosHonraData as JsonHonorPerson[],
  damas: damasData as JsonHonorPerson[],
};

export const JSON_SCHEDULE = programacaoData as JsonScheduleItem[];

export function giftStaticImage(id: string): string {
  return `/imagensPresentes/${id}.jpeg`;
}

type Db = NonNullable<ReturnType<typeof getDb>>;

function publicAbs(rel: string): string {
  return path.join(process.cwd(), "public", rel.replace(/^\//, ""));
}

function mimeFor(staticPath: string): string {
  const ext = path.extname(staticPath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function insertStaticMedia(
  db: Db,
  staticPath: string | null | undefined,
): Promise<string | null> {
  if (!staticPath || !isSafeStaticPath(staticPath)) return null;
  const file = publicAbs(staticPath);
  if (!existsSync(file)) return null;
  const [media] = await db
    .insert(siteMedia)
    .values({
      source: "static",
      staticPath,
      mime: mimeFor(staticPath),
      byteSize: statSync(file).size,
    })
    .returning({ id: siteMedia.id });
  return media?.id ?? null;
}

async function seedContent(db: Db): Promise<void> {
  const logoMediaId = await insertStaticMedia(db, venueData.logo);
  const textRows = TEXT_BLOCK_KEYS.map((key) => {
    const value = defaultTextBlock(key) as Record<string, unknown>;
    return {
      key,
      payload: key === "evento" ? { ...value, logoMediaId } : value,
    };
  });
  await db.insert(siteTextBlocks).values(textRows).onConflictDoNothing();

  const giftRows = presentesData as JsonGift[];
  for (let i = 0; i < giftRows.length; i += 1) {
    const item = giftRows[i];
    await db.insert(gifts).values({
      title: item.nome,
      description: item.descricao,
      pix: item.chavePix?.trim() || null,
      suggestedValue: item.valor?.trim() || null,
      mediaId: await insertStaticMedia(db, giftStaticImage(item.id)),
      sortOrder: i,
    });
  }

  const photoSets: ["hero" | "historia", string[]][] = [
    ["hero", HERO_STATIC],
    ["historia", sobreNosData.imagensCarrossel ?? []],
  ];
  for (const [collection, paths] of photoSets) {
    let sortOrder = 0;
    for (const staticPath of paths) {
      const mediaId = await insertStaticMedia(db, staticPath);
      if (!mediaId) continue;
      await db.insert(sitePhotos).values({ collection, mediaId, sortOrder });
      sortOrder += 1;
    }
  }

  for (const [category, people] of Object.entries(JSON_HONOR) as [
    keyof typeof JSON_HONOR,
    JsonHonorPerson[],
  ][]) {
    for (let i = 0; i < people.length; i += 1) {
      const person = people[i];
      await db.insert(honorPeople).values({
        category,
        name: person.nome,
        text: person.texto,
        mediaId: await insertStaticMedia(db, person.foto),
        photoZoom: person.fotoZoom ?? null,
        photoObjectPosition: person.fotoObjectPosition ?? null,
        photoOffsetY: person.fotoOffsetY ?? null,
        sortOrder: i,
      });
    }
  }

  if (JSON_SCHEDULE.length > 0) {
    await db.insert(scheduleItems).values(
      JSON_SCHEDULE.map((item, i) => ({
        time: item.hora,
        title: item.titulo,
        summary: item.resumo,
        description: item.descricao,
        icon: item.icone,
        location: item.local ?? null,
        highlight: Boolean(item.destaque),
        sortOrder: i,
      })),
    );
  }
}

let seeded = false;

/**
 * Popula o banco com o conteúdo de data/*.json na primeira vez.
 * A linha em content_seed funciona como trava: só quem a inserir executa o seed.
 */
export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const db = getDb();
  if (!db) return;

  const [already] = await db
    .select({ id: contentSeed.id })
    .from(contentSeed)
    .where(eq(contentSeed.id, SEED_ID))
    .limit(1);
  if (already) {
    seeded = true;
    return;
  }

  const claimed = await db
    .insert(contentSeed)
    .values({ id: SEED_ID })
    .onConflictDoNothing()
    .returning({ id: contentSeed.id });
  if (claimed.length === 0) {
    seeded = true;
    return;
  }

  try {
    await seedContent(db);
    seeded = true;
  } catch (error) {
    await db.delete(contentSeed).where(eq(contentSeed.id, SEED_ID));
    throw error;
  }
}
