"use client";

import { MapPin, Phone } from "lucide-react";
import type { PublicEvento } from "@/lib/content/public";
import { InstagramEmbeds } from "./InstagramEmbeds";
import { MapWidget } from "./MapWidget";

type LocationSectionProps = {
  title: string;
  subtitle: string;
  evento: PublicEvento;
};

export function LocationSection({ title, subtitle, evento }: LocationSectionProps) {
  const hasInstagram = Boolean(evento.instagramUrl);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-semibold text-brown md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-olive">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-12">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-heading text-2xl font-semibold text-brown">
              {evento.localNome}
            </h3>
            <div className="mt-4 space-y-4 text-olive/90 leading-relaxed">
              {evento.localDescricao.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-3">
                <MapPin className="size-5 shrink-0 text-sage" />
                <p className="text-olive/90">{evento.endereco}</p>
              </div>
              {evento.telefone ? (
                <div className="flex items-center justify-center gap-3">
                  <Phone className="size-5 shrink-0 text-sage" />
                  <a
                    href={`tel:+55${evento.telefone.replace(/\D/g, "")}`}
                    className="text-olive/90 transition-colors hover:text-sage"
                  >
                    {evento.telefone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {evento.mapaEmbedUrl ? <MapWidget embedUrl={evento.mapaEmbedUrl} /> : null}
        </div>

        {hasInstagram || evento.instagramPosts.length > 0 ? (
          <div className="space-y-8">
            {hasInstagram ? (
              <a
                href={evento.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-4 rounded-xl border border-olive/20 bg-cream/50 p-8 transition-opacity hover:opacity-80"
                aria-label="Ver perfil do local no Instagram"
              >
                <div className="flex size-20 shrink-0 overflow-hidden rounded-full bg-cream shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                  <img
                    src={evento.logoUrl}
                    alt={`Logo de ${evento.localNome}`}
                    className="size-full object-cover"
                  />
                </div>
                <div className="text-center">
                  {evento.instagramHandle ? (
                    <p className="font-medium text-brown">@{evento.instagramHandle}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-olive">
                    Confira fotos e novidades
                  </p>
                </div>
              </a>
            ) : null}
            {evento.instagramPosts.length > 0 ? (
              <div>
                <h4 className="mb-4 font-heading text-lg font-semibold text-brown text-center">
                  Publicações do local
                </h4>
                <InstagramEmbeds posts={evento.instagramPosts} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
