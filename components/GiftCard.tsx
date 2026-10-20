"use client";

import Image from "next/image";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSiteMediaUrl } from "@/lib/site-media";

export interface Presente {
  id: string;
  nome: string;
  descricao: string;
  valor?: string;
  chavePix?: string;
  imagem?: string | null;
}

interface GiftCardProps {
  presente: Presente;
  onClick: () => void;
  tilt?: number;
  className?: string;
}

export function GiftCard({ presente, onClick, tilt = 0, className }: GiftCardProps) {
  const imagemUrl = presente.imagem;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ["--tilt" as string]: `${tilt}deg` }}
      className={cn(
        "gift-polaroid group flex w-full cursor-pointer flex-col border-0 bg-white p-2.5 pb-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-4 focus-visible:ring-offset-cream sm:p-3 sm:pb-5",
        className
      )}
      aria-label={`Ver detalhes do presente: ${presente.nome}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#e6e1d4] shadow-[inset_0_0_0_1px_rgba(61,23,0,0.08)]">
        {imagemUrl ? (
          <Image
            src={imagemUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 240px"
            unoptimized={isSiteMediaUrl(imagemUrl)}
          />
        ) : (
          <Gift className="absolute inset-0 m-auto size-10 text-olive/70" aria-hidden />
        )}
      </div>
      <div className="flex min-h-16 flex-col items-center justify-center px-1.5 pt-3 sm:min-h-[4.5rem] sm:px-2 sm:pt-4">
        <h3 className="font-heading text-sm font-medium italic leading-snug text-balance text-brown sm:text-base">
          {presente.nome}
        </h3>
        {presente.valor && (
          <p className="mt-1 text-xs text-olive sm:text-sm">{presente.valor}</p>
        )}
      </div>
    </button>
  );
}
