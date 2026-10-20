"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Heart, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import Monograma from "@/components/monograma";
import { EventDetailsCard } from "@/components/confirmacao/EventDetailsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fireConfettiCannon } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { formatDateDots, formatTime, type WeddingEvent } from "@/lib/calendar";
import type { ConfirmacaoBlock } from "@/lib/content/text-blocks";
import { GuestNameField } from "@/components/rsvp/GuestNameField";
import {
  submitRsvp,
  validateCompanionName,
  validateRsvpName,
  type Presenca,
} from "@/components/rsvp/submit-rsvp";

const EMPTY_FORM = {
  nome: "",
  guestId: null as string | null,
  nomeAcompanhante: "",
  microonibus: "" as "" | "sim" | "nao",
  mensagem: "",
};

type ConfirmacaoPageProps = {
  texts: ConfirmacaoBlock;
  event: WeddingEvent;
};

export function ConfirmacaoPage({ texts, event }: ConfirmacaoPageProps) {
  const [presenca, setPresenca] = useState<Presenca>("vou");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Presenca | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const dateLine = formatDateDots(event.startLocal);
  const timeLine = formatTime(event.startLocal);
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [microError, setMicroError] = useState<string | null>(null);
  const [companionError, setCompanionError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (success === "vou") fireConfettiCannon();
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nErr = validateRsvpName(formData.nome);
    const mErr =
      presenca === "vou" && !formData.microonibus
        ? "Por favor, informe se precisa de microônibus."
        : null;
    const cErr =
      presenca === "vou" ? validateCompanionName(formData.nomeAcompanhante) : null;

    setNomeError(nErr);
    setMicroError(mErr);
    setCompanionError(cErr);

    if (nErr || mErr || cErr) {
      toast.error(nErr || mErr || cErr);
      const target = nErr
        ? firstInputRef.current
        : formRef.current?.querySelector<HTMLElement>("#conf-micro");
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const result = await submitRsvp({ ...formData, presenca });
      if (result.ok) {
        setSuccess(presenca);
        setFormData(EMPTY_FORM);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const isVou = success === "vou";
    return (
      <main id="main" className="min-h-dvh bg-cream pb-safe pt-safe">
        <div className="mx-auto flex max-w-lg flex-col items-center px-5 pt-12 text-center animate-in fade-in-0 zoom-in-95 duration-300">
          <Image
            src={
              isVou
                ? "/illustrations/a-caminho.svg"
                : "/illustrations/lista-da-obra.svg"
            }
            alt=""
            width={280}
            height={193}
            className="mb-6 h-auto w-[min(72%,280px)]"
            unoptimized
          />
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-sage/20 text-sage">
            <Heart className="size-7 fill-sage" aria-hidden />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-brown md:text-3xl">
            {isVou ? texts.sucessoVouTitulo : texts.sucessoNaoVouTitulo}
          </h1>
          <p className="mt-3 text-olive leading-relaxed">
            {isVou ? texts.sucessoVouTexto : texts.sucessoNaoVouTexto}
          </p>
          {isVou && (
            <div className="mt-3 flex items-center gap-2 text-olive">
              <PartyPopper className="size-5" aria-hidden />
              <span className="text-sm">
                {dateLine} · {event.venueName}
              </span>
            </div>
          )}
        </div>

        {isVou ? <EventDetailsCard variant="success" event={event} /> : null}

        <div className="mx-auto flex max-w-lg flex-col items-center px-5 pb-12 pt-2 text-center">
          <Button
            size="lg"
            variant="outline"
            className="min-h-11 w-full max-w-xs rounded-xl border-olive/20 text-brown"
            onClick={() => setSuccess(null)}
          >
            Confirmar outra pessoa
          </Button>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center text-sm text-olive underline-offset-4 hover:underline"
          >
            Ver site completo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="min-h-dvh bg-cream pb-safe pt-safe">
      <header className="mx-auto max-w-lg px-5 pb-1 pt-5 text-center">
        <Monograma
          className="mx-auto h-11 w-auto md:h-12"
          animate={false}
          simple
        />
        <div
          className={cn(
            "mt-3 flex justify-center transition-all duration-700 ease-out",
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          <Image
            src="/illustrations/obra-casamento.svg"
            alt=""
            width={160}
            height={125}
            className="h-auto w-[min(42%,160px)]"
            priority
            unoptimized
          />
        </div>
        <h1 className="mt-3 font-heading text-[1.65rem] font-semibold leading-tight text-brown md:text-4xl">
          {texts.titulo}
        </h1>
        <p className="mt-1.5 text-sm text-olive leading-relaxed">
          {texts.subtitulo}
        </p>
        <p className="mt-2 font-heading text-sm tracking-wide text-brown">
          {dateLine} · {timeLine} · {event.venueName}
        </p>
        <p className="mt-1 text-xs text-brown/70">{texts.prazo}</p>
      </header>

      <section
        className="mx-auto w-full max-w-lg px-5 pt-5 pb-4"
        aria-labelledby="form-titulo"
      >
        <h2 id="form-titulo" className="sr-only">
          Assina a lista da obra
        </h2>

        <div
          className="grid grid-cols-2 gap-2 rounded-xl border border-olive/20 p-1"
          role="group"
          aria-label="Você vai ao casamento?"
        >
          <button
            type="button"
            onClick={() => {
              setPresenca("vou");
              setMicroError(null);
            }}
            className={cn(
              "min-h-12 rounded-lg px-3 text-sm font-medium transition-colors",
              presenca === "vou"
                ? "bg-sage text-cream"
                : "bg-transparent text-brown hover:bg-sage/10"
            )}
            aria-pressed={presenca === "vou"}
          >
            Eu vou
          </button>
          <button
            type="button"
            onClick={() => {
              setPresenca("nao_vou");
              setMicroError(null);
            }}
            className={cn(
              "min-h-12 rounded-lg px-3 text-sm font-medium transition-colors",
              presenca === "nao_vou"
                ? "bg-sage text-cream"
                : "bg-transparent text-brown hover:bg-sage/10"
            )}
            aria-pressed={presenca === "nao_vou"}
          >
            Não vou
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-brown/70">
          {presenca === "vou" ? texts.vouDica : texts.naoVouDica}
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
          noValidate
        >
          <GuestNameField
            ref={firstInputRef}
            id="conf-nome"
            value={formData.nome}
            error={nomeError}
            disabled={loading}
            onChange={(nome, guestId) => {
              setFormData((p) => ({ ...p, nome, guestId }));
              if (nomeError) setNomeError(null);
            }}
          />

          {presenca === "vou" && (
            <div className="space-y-2 animate-in fade-in-0 duration-200">
              <Label htmlFor="conf-micro">
                Vai de microônibus? (por conta dos noivos) *
              </Label>
              <Select
                value={formData.microonibus}
                onValueChange={(v) => {
                  setFormData((p) => ({
                    ...p,
                    microonibus: (v ?? "") as "" | "sim" | "nao",
                  }));
                  if (microError) setMicroError(null);
                }}
                disabled={loading}
              >
                <SelectTrigger
                  id="conf-micro"
                  className="min-h-11 w-full"
                  aria-invalid={!!microError}
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
              {microError && (
                <p className="text-sm text-destructive" role="alert">
                  {microError}
                </p>
              )}
            </div>
          )}

          <details className="group rounded-xl border border-olive/15 px-3 py-2">
            <summary className="cursor-pointer list-none py-2 text-sm font-medium text-brown marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                Acompanhante e recado
                <span className="text-xs font-normal text-olive">opcional</span>
              </span>
            </summary>
            <div className="space-y-5 pb-3 pt-1">
              <div className="space-y-2">
                <Label htmlFor="conf-acompanhante">
                  Nome do par / acompanhante
                </Label>
                <Input
                  id="conf-acompanhante"
                  value={formData.nomeAcompanhante}
                  onChange={(e) => {
                    setFormData((p) => ({
                      ...p,
                      nomeAcompanhante: e.target.value,
                    }));
                    if (companionError) setCompanionError(null);
                  }}
                  placeholder="Nome completo de quem vem com você"
                  disabled={loading}
                  aria-invalid={!!companionError}
                  className="min-h-11"
                />
                {companionError && (
                  <p className="text-sm text-destructive" role="alert">
                    {companionError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="conf-mensagem">Recado pra obra</Label>
                <textarea
                  id="conf-mensagem"
                  value={formData.mensagem}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, mensagem: e.target.value }))
                  }
                  placeholder="Manda um abraço, uma piada, o que quiser…"
                  disabled={loading}
                  rows={3}
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-22 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
                />
              </div>
            </div>
          </details>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-sage py-3 text-base transition-transform active:scale-[0.98] hover:bg-sage/90 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
                Enviando...
              </>
            ) : (
              "Enviar confirmação"
            )}
          </Button>
        </form>
      </section>

      <EventDetailsCard variant="form" event={event} />

      <footer className="mx-auto max-w-lg px-5 pb-12 pt-2 text-center">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm text-olive underline-offset-4 hover:underline"
        >
          Ver site completo
        </Link>
      </footer>
    </main>
  );
}
