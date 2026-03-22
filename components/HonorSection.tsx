"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface HonorPerson {
  nome: string;
  foto: string;
  texto: string;
}

function HonorAvatar({ person }: { person: HonorPerson }) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !person.foto) {
    return (
      <div className="flex size-24 items-center justify-center rounded-full border-2 border-sage/30 bg-sage/20 font-heading text-2xl font-semibold text-sage">
        {person.nome.charAt(0)}
      </div>
    );
  }

  return (
    <div className="relative size-24 overflow-hidden rounded-full border-2 border-sage/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={person.foto}
        alt={person.nome}
        className="size-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

interface HonorSectionProps {
  title: string;
  subtitle?: string;
  data: HonorPerson[];
}

export function HonorSection({ title, subtitle, data }: HonorSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-4xl font-semibold text-brown">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-olive/80">{subtitle}</p>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((person, i) => (
          <div
            key={person.nome}
            className={cn(
              "flex flex-col items-center rounded-xl border border-olive/20 bg-white p-6 shadow-sm transition-all duration-500",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            )}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <HonorAvatar person={person} />
            <h3 className="mt-4 font-heading text-lg font-semibold text-brown">
              {person.nome}
            </h3>
            <p className="mt-2 text-center text-sm text-olive/80">
              {person.texto}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
