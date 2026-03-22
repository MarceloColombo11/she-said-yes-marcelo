"use client";

import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Presente {
  id: string;
  nome: string;
  descricao: string;
  valor?: string;
  chavePix: string;
  imagem?: string | null;
}

interface GiftCardProps {
  presente: Presente;
  onClick: () => void;
  className?: string;
}

export function GiftCard({ presente, onClick, className }: GiftCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[140px] flex-col items-center justify-center gap-4 rounded-xl border border-olive/20 bg-white p-6 shadow-sm transition-all hover:border-sage/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sage/50 focus:ring-offset-2 active:scale-[0.99] lg:hover:scale-[1.02]",
        className
      )}
      aria-label={`Ver detalhes do presente: ${presente.nome}`}
    >
      <div className="flex size-16 min-w-[4rem] min-h-[4rem] items-center justify-center rounded-full bg-sage/20 text-sage transition-colors group-hover:bg-sage/30">
        <Gift className="size-8" />
      </div>
      <div className="text-center">
        <h3 className="font-heading text-lg font-semibold text-brown">
          {presente.nome}
        </h3>
        {presente.valor && (
          <p className="mt-1 text-sm text-olive">{presente.valor}</p>
        )}
      </div>
    </button>
  );
}
