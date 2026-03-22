"use client";

import { PhotoCarousel } from "./PhotoCarousel";

// Substituir pelas URLs reais das fotos do casal em /public/images/casal/
const COUPLE_IMAGES = [
  "/images/casal/1.jpg",
  "/images/casal/2.jpg",
  "/images/casal/3.jpg",
];

// Fallback para desenvolvimento - usar imagens placeholder
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
];

export function AboutSection() {
  // Usar fallback se as imagens locais não existirem
  const images = COUPLE_IMAGES;
  const useFallback = true; // Trocar para false quando tiver fotos em /public

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-4xl font-semibold text-brown">
          Sobre Nós
        </h2>
        <p className="mt-4 text-olive/80">Nossa história de amor</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <PhotoCarousel
            images={useFallback ? FALLBACK_IMAGES : images}
            alt="Suelen e Marcelo"
          />
        </div>
        <div className="space-y-6">
          <p className="text-olive/90 leading-relaxed">
            Tudo começou quando nossos caminhos se cruzaram e descobrimos que
            éramos feitos um para o outro. Cada momento vivido reforçou a
            certeza de que queremos construir uma vida juntos.
          </p>
          <p className="text-olive/90 leading-relaxed">
            Com gratidão e amor, convidamos você a celebrar conosco o início
            desta nova etapa. Será uma honra ter sua presença neste dia tão
            especial.
          </p>
          <p className="font-heading text-xl font-semibold text-brown">
            Suelen & Marcelo
          </p>
        </div>
      </div>
    </div>
  );
}
