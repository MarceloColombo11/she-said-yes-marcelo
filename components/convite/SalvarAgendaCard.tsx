"use client";

import { CalendarHeart, CalendarPlus, Share2 } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ICS_PATH,
  getGoogleCalendarUrl,
  getInviteShareText,
  getShareText,
  getWhatsAppShareUrl,
  type WeddingEvent,
} from "@/lib/calendar";
import { useDevicePlatform } from "./hooks";

const CALENDAR_HINT = {
  ios: "Abre direto na Agenda do iPhone.",
  android: "Abre no Google Agenda do seu celular.",
  desktop: "Abre no Google Agenda.",
} as const;

export function SalvarAgendaCard({ event }: { event: WeddingEvent }) {
  const platform = useDevicePlatform();
  const ios = platform === "ios";

  const handleShare = async () => {
    const pageUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: getShareText(event),
          url: pageUrl,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    window.open(
      getWhatsAppShareUrl(getInviteShareText(event, pageUrl)),
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section
      className="rounded-2xl border border-olive/15 bg-white/70 p-5"
      aria-labelledby="agenda-titulo"
    >
      <h2
        id="agenda-titulo"
        className="flex items-center gap-2 font-heading text-xl font-semibold text-brown"
      >
        <CalendarHeart className="size-5 text-sage" aria-hidden />
        Salve na agenda
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-olive">
        Data, hora e endereço direto no seu celular. Um toque e pronto.
      </p>

      <div className="mt-5 grid gap-2">
        <a
          href={ios ? ICS_PATH : getGoogleCalendarUrl(event)}
          target={ios ? undefined : "_blank"}
          rel={ios ? undefined : "noopener noreferrer"}
          onClick={
            ios
              ? () => toast.success("O iPhone vai pedir para adicionar na Agenda.")
              : undefined
          }
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-12 w-full justify-start gap-3 rounded-xl border-olive/20 bg-cream px-4 text-brown hover:bg-sage/10"
          )}
        >
          <CalendarPlus className="size-4 text-sage" aria-hidden />
          Salvar na agenda
        </a>
        <button
          type="button"
          onClick={handleShare}
          className={cn(
            buttonVariants(),
            "mt-2 min-h-12 w-full gap-2 rounded-xl bg-sage text-cream hover:bg-sage/90"
          )}
        >
          <Share2 className="size-4" aria-hidden />
          Compartilhar com quem vai junto
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-brown/60">
        {CALENDAR_HINT[platform]}
      </p>
    </section>
  );
}
