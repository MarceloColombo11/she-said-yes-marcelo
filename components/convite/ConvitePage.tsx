"use client";

import Image from "next/image";
import Link from "next/link";
import { Navigation } from "lucide-react";
import Monograma from "@/components/monograma";
import { buttonVariants } from "@/components/ui/button";
import type { TimelineEvent } from "@/components/Timeline";
import { cn } from "@/lib/utils";
import {
  clockToMinutes,
  daysUntilLocal,
  formatDateLong,
  formatTime,
  getRouteUrl,
  saoPauloMinutes,
  type WeddingEvent,
} from "@/lib/calendar";
import type { ConviteBlock } from "@/lib/content/text-blocks";
import { AtalhosCard } from "./AtalhosCard";
import { ComoChegarCard } from "./ComoChegarCard";
import { ProgramacaoCompacta } from "./ProgramacaoCompacta";
import { SalvarAgendaCard } from "./SalvarAgendaCard";
import { useDevicePlatform, useNow } from "./hooks";

type ConvitePageProps = {
  texts: ConviteBlock;
  event: WeddingEvent;
  mapaEmbedUrl: string;
  programacao: TimelineEvent[];
};

function countdownLabel(days: number): string | null {
  if (days > 1) return `Faltam ${days} dias`;
  if (days === 1) return "É amanhã!";
  if (days === 0) return "É hoje!";
  return null;
}

function currentMomentIndex(
  events: TimelineEvent[],
  event: WeddingEvent,
  nowMs: number
): number | null {
  if (daysUntilLocal(event.startLocal, nowMs) !== 0) return null;
  const minutes = saoPauloMinutes(nowMs);
  const start = clockToMinutes(formatTime(event.startLocal));
  const end = clockToMinutes(formatTime(event.endLocal));
  if (start !== null && end !== null && end > start && minutes >= end) {
    return null;
  }
  let index: number | null = null;
  events.forEach((item, i) => {
    const at = clockToMinutes(item.hora);
    if (at !== null && at <= minutes) index = i;
  });
  return index;
}

export function ConvitePage({
  texts,
  event,
  mapaEmbedUrl,
  programacao,
}: ConvitePageProps) {
  const now = useNow();
  const platform = useDevicePlatform();
  const days = now === null ? null : daysUntilLocal(event.startLocal, now);
  const chip = days === null ? null : countdownLabel(days);
  const currentIndex =
    now === null ? null : currentMomentIndex(programacao, event, now);
  const routeUrl = getRouteUrl(event, platform);

  return (
    <main id="main" className="min-h-dvh bg-cream pt-safe pb-28 md:pb-12">
      <header className="mx-auto max-w-lg px-5 pt-6 text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
        <Monograma
          className="mx-auto h-11 w-auto md:h-12"
          animate={false}
          simple
        />
        <Image
          src="/illustrations/a-caminho.svg"
          alt=""
          width={280}
          height={193}
          className="mx-auto mt-4 h-auto w-[min(56%,220px)]"
          priority
          unoptimized
        />
        <h1 className="mt-4 font-heading text-[1.75rem] font-semibold leading-tight text-brown md:text-4xl">
          {texts.titulo}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-olive">
          {days === 0 ? texts.mensagemDia : texts.subtitulo}
        </p>
        <p className="mt-4 font-heading text-lg tracking-wide text-brown">
          {formatDateLong(event.startLocal)}
        </p>
        <p className="text-sm text-olive">
          {formatTime(event.startLocal)} · {event.venueName}
        </p>
        <div className="mt-3 flex h-7 justify-center">
          {chip ? (
            <span className="inline-flex items-center rounded-full bg-sage/15 px-3 text-sm font-medium text-olive animate-in fade-in-0 duration-300">
              {chip}
            </span>
          ) : null}
        </div>
      </header>

      <div className="mx-auto mt-6 flex max-w-lg flex-col gap-5 px-5">
        <ComoChegarCard event={event} mapaEmbedUrl={mapaEmbedUrl} />
        <SalvarAgendaCard event={event} />
        <ProgramacaoCompacta events={programacao} currentIndex={currentIndex} />
        <AtalhosCard title={texts.atalhosTitulo} />
      </div>

      <footer className="mx-auto flex max-w-lg flex-col items-center gap-1 px-5 pt-8 text-center">
        {days === null || days > 0 ? (
          <Link
            href="/confirmacao"
            className="inline-flex min-h-11 items-center text-sm text-olive underline-offset-4 hover:underline"
          >
            Ainda não confirmou? Confirme aqui
          </Link>
        ) : null}
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm text-olive underline-offset-4 hover:underline"
        >
          Ver site completo
        </Link>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-olive/15 bg-cream/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <a
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants(),
            "mx-auto flex min-h-12 w-full max-w-lg gap-2 rounded-xl bg-sage text-base text-cream hover:bg-sage/90"
          )}
        >
          <Navigation className="size-5" aria-hidden />
          Abrir rota no mapa
        </a>
      </div>
    </main>
  );
}
