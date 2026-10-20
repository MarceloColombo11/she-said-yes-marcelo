"use client";

import { Clock } from "lucide-react";
import { ICON_MAP, type TimelineEvent } from "@/components/Timeline";
import { cn } from "@/lib/utils";

type ProgramacaoCompactaProps = {
  events: TimelineEvent[];
  /** Index of the moment happening now, or null outside the wedding day. */
  currentIndex: number | null;
};

export function ProgramacaoCompacta({ events, currentIndex }: ProgramacaoCompactaProps) {
  if (events.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-olive/15 bg-white/70 p-5"
      aria-labelledby="programacao-titulo"
    >
      <h2
        id="programacao-titulo"
        className="flex items-center gap-2 font-heading text-xl font-semibold text-brown"
      >
        <Clock className="size-5 text-sage" aria-hidden />
        Programação
      </h2>

      <ol className="mt-4 space-y-1">
        {events.map((item, i) => {
          const Icon = ICON_MAP[item.icone] ?? Clock;
          const isNow = i === currentIndex;
          return (
            <li
              key={`${item.hora}-${item.titulo}`}
              className={cn(
                "flex gap-3 rounded-xl px-3 py-3 transition-colors",
                isNow && "bg-sage/15"
              )}
              aria-current={isNow ? "step" : undefined}
            >
              <span className="w-12 shrink-0 pt-0.5 font-heading text-base font-semibold text-brown tabular-nums">
                {item.hora}
              </span>
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  isNow || item.destaque
                    ? "bg-sage text-cream"
                    : "bg-sage/15 text-sage"
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-brown">{item.titulo}</span>
                  {isNow ? (
                    <span className="rounded-full bg-sage px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-cream">
                      Agora
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-olive">
                  {item.resumo}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
