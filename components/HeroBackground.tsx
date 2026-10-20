"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isSiteMediaUrl } from "@/lib/site-media";

const SLIDE_MS = 6000;

type HeroBackgroundProps = {
  images: string[];
};

export function HeroBackground({ images }: HeroBackgroundProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((i) => (i + 1) % images.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 opacity-30" aria-hidden>
      {images.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          unoptimized={isSiteMediaUrl(src)}
          className={cn(
            "object-cover object-center transition-opacity duration-[1500ms]",
            i === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}
