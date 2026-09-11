"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import { CalendarPlus, MapPin, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  WEDDING_EVENT,
  ICS_PATH,
  ICS_FILENAME,
  isIosDevice,
  getGoogleCalendarUrl,
  getShareText,
  getWhatsAppShareUrl,
} from "@/lib/calendar";

type EventDetailsCardProps = {
  /** After RSVP, lead with “save this”; on the form page it’s a quieter second step. */
  variant?: "form" | "success";
};

export function EventDetailsCard({ variant = "form" }: EventDetailsCardProps) {
  const shareText = getShareText();
  const isSuccess = variant === "success";

  const handleSaveCalendar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isIosDevice()) {
      toast.success("O iPhone vai pedir para adicionar na Agenda.");
      return;
    }

    e.preventDefault();
    window.open(getGoogleCalendarUrl(), "_blank", "noopener,noreferrer");

    const link = document.createElement("a");
    link.href = ICS_PATH;
    link.download = ICS_FILENAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Abrimos o Google Calendar e o arquivo da agenda.");
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(
        `${WEDDING_EVENT.venueName}\n${WEDDING_EVENT.address}`
      );
      toast.success("Endereço copiado!");
    } catch {
      toast.error("Não deu pra copiar. Tenta de novo?");
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: WEDDING_EVENT.title,
          text: shareText,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    window.open(getWhatsAppShareUrl(shareText), "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="mx-auto w-full max-w-lg px-5 py-10"
      aria-labelledby="detalhes-titulo"
    >
      <div className="mb-5 flex justify-center">
        <Image
          src="/illustrations/wedding.svg"
          alt=""
          width={220}
          height={191}
          className="h-auto w-[min(58%,220px)]"
          unoptimized
        />
      </div>

      <h2
        id="detalhes-titulo"
        className="text-center font-heading text-2xl font-semibold text-brown md:text-3xl"
      >
        {isSuccess ? "Agora salva na agenda" : "Pra não se perder no caminho"}
      </h2>
      <p className="mt-3 text-center text-olive leading-relaxed">
        {isSuccess
          ? "Data, hora e endereço — um toque e fica no celular."
          : "Depois de confirmar, salva a data e o endereço."}
      </p>

      <div className="mt-6 space-y-3 text-center">
        <p className="font-heading text-xl tracking-wide text-brown">
          28 · 11 · 2026 · 16:30
        </p>
        <div>
          <p className="font-medium text-brown">{WEDDING_EVENT.venueName}</p>
          <p className="mt-1 text-sm text-olive leading-relaxed">
            {WEDDING_EVENT.address}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <a
          href={ICS_PATH}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-h-11 border-olive/20 bg-cream text-brown hover:bg-sage/10"
          )}
          onClick={handleSaveCalendar}
        >
          <CalendarPlus className="size-4" aria-hidden />
          Salvar na agenda
        </a>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 border-olive/20 bg-cream text-brown hover:bg-sage/10"
          onClick={() =>
            window.open(WEDDING_EVENT.mapsUrl, "_blank", "noopener,noreferrer")
          }
        >
          <MapPin className="size-4" aria-hidden />
          Abrir no Maps
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 border-olive/20 bg-cream text-brown hover:bg-sage/10"
          onClick={handleCopyAddress}
        >
          <Copy className="size-4" aria-hidden />
          Copiar endereço
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 border-olive/20 bg-cream text-brown hover:bg-sage/10"
          onClick={handleShare}
        >
          <Share2 className="size-4" aria-hidden />
          Mandar no Zap
        </Button>
      </div>
    </section>
  );
}
