import { PhotoCollection } from "@/components/admin/PhotoCollection";
import { listPhotos } from "@/lib/content/photos";
import {
  HERO_PHOTO_LIMIT,
  HISTORIA_PHOTO_LIMIT,
} from "@/lib/content/validation";

export const dynamic = "force-dynamic";

export default async function FotosPage() {
  let hero: Awaited<ReturnType<typeof listPhotos>> = [];
  let historia: Awaited<ReturnType<typeof listPhotos>> = [];
  let error: string | null = null;
  try {
    [hero, historia] = await Promise.all([
      listPhotos("hero"),
      listPhotos("historia"),
    ]);
  } catch {
    error = "Não foi possível carregar as fotos. Tente de novo em instantes.";
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Fotos</h1>
        <p className="mt-2 text-olive/75">
          Capa na entrada do site (até {HERO_PHOTO_LIMIT}) e Sobre Nós (até{" "}
          {HISTORIA_PHOTO_LIMIT}).
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <>
          <PhotoCollection
            collection="hero"
            title="Capa"
            description="Fundo da entrada, atrás do monograma. Com mais de uma, elas se alternam."
            photos={hero}
          />
          <PhotoCollection
            collection="historia"
            title="Sobre Nós"
            description="Carrossel ao lado da história do casal."
            photos={historia}
          />
        </>
      )}
    </div>
  );
}
