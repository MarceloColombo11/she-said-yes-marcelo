import { eq, sql } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import {
  gifts,
  honorPeople,
  siteMedia,
  sitePhotos,
  siteTextBlocks,
} from "@/lib/db/schema";

export async function deleteOrphanMedia(mediaId: string): Promise<void> {
  const db = requireDb();
  const [[giftRef], [photoRef], [personRef], [textRef]] = await Promise.all([
    db.select({ id: gifts.id }).from(gifts).where(eq(gifts.mediaId, mediaId)).limit(1),
    db
      .select({ id: sitePhotos.id })
      .from(sitePhotos)
      .where(eq(sitePhotos.mediaId, mediaId))
      .limit(1),
    db
      .select({ id: honorPeople.id })
      .from(honorPeople)
      .where(eq(honorPeople.mediaId, mediaId))
      .limit(1),
    db
      .select({ key: siteTextBlocks.key })
      .from(siteTextBlocks)
      .where(sql`${siteTextBlocks.payload}::text like ${`%${mediaId}%`}`)
      .limit(1),
  ]);
  if (giftRef || photoRef || personRef || textRef) return;

  await db.delete(siteMedia).where(eq(siteMedia.id, mediaId));
}
