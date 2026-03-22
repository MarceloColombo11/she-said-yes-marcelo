"use client";

import dynamic from "next/dynamic";
import { Instagram } from "lucide-react";

// Lazy load do mapa para evitar erros de SSR
const MapWidget = dynamic(() => import("./MapWidget").then((m) => ({ default: m.MapWidget })), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-olive/20 bg-cream/50">
      <p className="text-olive/80">Carregando mapa...</p>
    </div>
  ),
});

// Substituir pelo nome real e Instagram do local
const VENUE_NAME = "Nome do Local do Casamento";
const VENUE_DESCRIPTION =
  "Um espaço encantador para celebrar nosso amor. Com vista para a cidade e ambiente acolhedor.";
const VENUE_INSTAGRAM = "https://instagram.com/lugarexemplo";

export function LocationSection() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-4xl font-semibold text-brown">Local</h2>
        <p className="mt-4 text-olive/80">Onde celebraremos nosso amor</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="font-heading text-2xl font-semibold text-brown">
              {VENUE_NAME}
            </h3>
            <p className="mt-4 text-olive/90 leading-relaxed">
              {VENUE_DESCRIPTION}
            </p>
          </div>

          <MapWidget />
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-olive/20 bg-cream/50 p-8">
          <a
            href={VENUE_INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-4 transition-opacity hover:opacity-80"
            aria-label="Ver perfil do local no Instagram"
          >
            <div className="flex size-20 items-center justify-center rounded-full bg-sage/20 text-sage">
              <Instagram className="size-10" />
            </div>
            <div className="text-center">
              <p className="font-medium text-brown">Instagram do local</p>
              <p className="text-sm text-olive/80 mt-1">
                Confira fotos e novidades
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
