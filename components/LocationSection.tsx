"use client";

import { Instagram, MapPin, Phone } from "lucide-react";
import { MapWidget } from "./MapWidget";

// Substituir pelo nome real e Instagram do local
const VENUE_NAME = "Mirante Garden";
const VENUE_DESCRIPTION =
  "Um espaço encantador para celebrar nosso amor. Com vista para a cidade e ambiente acolhedor.";
const VENUE_INSTAGRAM = "https://instagram.com/lugarexemplo";
const VENUE_ADDRESS =
  "Estrada Geral da Fazendinha - Fazendinha, Biguaçu - SC, 88160-000";
const VENUE_PHONE = "(48) 99949-4900";

export function LocationSection() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-4xl font-semibold text-brown">
          Local
        </h2>
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

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-sage" />
                <p className="text-olive/90">{VENUE_ADDRESS}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-sage" />
                <a
                  href={`tel:+55${VENUE_PHONE.replace(/\D/g, "")}`}
                  className="text-olive/90 transition-colors hover:text-sage"
                >
                  {VENUE_PHONE}
                </a>
              </div>
            </div>
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
              <p className="mt-1 text-sm text-olive/80">
                Confira fotos e novidades
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
