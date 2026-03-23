"use client";

import { PhotoCarousel } from "./PhotoCarousel";

export type AboutContent = {
  imagensCarrossel: string[];
  titulo: string;
  subtitulo: string;
  paragrafos: string[];
  assinatura: string;
};

// Fallback quando não houver fotos em public ou lista vazia no JSON
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
];

type AboutSectionProps = {
  content: AboutContent;
};

export function AboutSection({ content }: AboutSectionProps) {
  const carouselImages =
    content.imagensCarrossel.length > 0
      ? content.imagensCarrossel
      : FALLBACK_IMAGES;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-4xl font-semibold text-brown">
          {content.titulo}
        </h2>
        <p className="mt-4 text-olive">{content.subtitulo}</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <PhotoCarousel
            images={carouselImages}
            alt="Suelen e Marcelo"
          />
        </div>
        <div className="space-y-6">
          {content.paragrafos.map((texto, i) => (
            <p key={i} className="text-olive/90 leading-relaxed">
              {texto}
            </p>
          ))}
          <p className="font-heading text-xl font-semibold text-brown">
            {content.assinatura}
          </p>
        </div>
      </div>
    </div>
  );
}
