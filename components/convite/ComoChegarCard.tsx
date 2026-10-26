"use client";

import { Copy, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { MapWidget } from "@/components/MapWidget";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRouteUrl, getWazeUrl, type WeddingEvent } from "@/lib/calendar";
import { useDevicePlatform } from "./hooks";

const outlineButton = cn(
  buttonVariants({ variant: "outline" }),
  "min-h-12 w-full justify-start gap-3 rounded-xl border-olive/20 bg-cream px-4 text-brown hover:bg-sage/10"
);

type ComoChegarCardProps = {
  event: WeddingEvent;
  mapaEmbedUrl: string;
};

export function ComoChegarCard({ event, mapaEmbedUrl }: ComoChegarCardProps) {
  const platform = useDevicePlatform();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${event.venueName}\n${event.address}`);
      toast.success("Endereço copiado!");
    } catch {
      toast.error("Não deu para copiar. Tente de novo?");
    }
  };

  return (
    <section
      className="rounded-2xl border border-olive/15 bg-white/70 p-5"
      aria-labelledby="como-chegar-titulo"
    >
      <h2
        id="como-chegar-titulo"
        className="flex items-center gap-2 font-heading text-xl font-semibold text-brown"
      >
        <MapPin className="size-5 text-sage" aria-hidden />
        Como chegar
      </h2>
      <p className="mt-3 font-medium text-brown">{event.venueName}</p>
      <p className="mt-1 text-sm leading-relaxed text-olive">{event.address}</p>

      <div className="mt-5 grid gap-2">
        <a
          href={getRouteUrl(event, platform)}
          target="_blank"
          rel="noopener noreferrer"
          className={outlineButton}
        >
          <Navigation className="size-4 text-sage" aria-hidden />
          {platform === "ios" ? "Abrir no Mapas" : "Abrir no Google Maps"}
        </a>
        <button type="button" onClick={handleCopy} className={outlineButton}>
          <Copy className="size-4 text-sage" aria-hidden />
          Copiar endereço
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-brown/60">
        Prefere o{" "}
        <a
          href={getWazeUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-olive underline underline-offset-2"
        >
          Waze
        </a>
        ?
      </p>

      {mapaEmbedUrl ? (
        <div className="mt-5">
          <MapWidget embedUrl={mapaEmbedUrl} />
        </div>
      ) : null}
    </section>
  );
}
