"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { Loader2, Heart, PartyPopper } from "lucide-react";
import { fireConfettiCannon } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import type { RsvpBlock } from "@/lib/content/text-blocks";
import { GuestNameField } from "@/components/rsvp/GuestNameField";
import {
  submitRsvp,
  validateCompanionName,
  validateRsvpName,
  type Presenca,
} from "@/components/rsvp/submit-rsvp";

interface RsvpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  texts: RsvpBlock;
}

const EMPTY_FORM = {
  nome: "",
  guestId: null as string | null,
  nomeAcompanhante: "",
  microonibus: "" as "" | "sim" | "nao",
};

export function RsvpModal({ open, onOpenChange, texts }: RsvpModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Presenca | null>(null);
  const [presenca, setPresenca] = useState<Presenca>("vou");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [microError, setMicroError] = useState<string | null>(null);
  const [companionError, setCompanionError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSuccess(null);
      setNomeError(null);
      setMicroError(null);
      setCompanionError(null);
      const t = setTimeout(() => firstInputRef.current?.focus({ preventScroll: true }), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (success === "vou") fireConfettiCannon();
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nErr = validateRsvpName(formData.nome);
    const mErr =
      presenca === "vou" && !formData.microonibus
        ? "Por favor, informe se deseja ir de microônibus."
        : null;
    const cErr =
      presenca === "vou" ? validateCompanionName(formData.nomeAcompanhante) : null;
    setNomeError(nErr);
    setMicroError(mErr);
    setCompanionError(cErr);

    if (nErr || mErr || cErr) {
      toast.error(nErr || mErr || cErr);
      return;
    }

    setLoading(true);
    try {
      const result = await submitRsvp({
        nome: formData.nome,
        guestId: formData.guestId,
        presenca,
        nomeAcompanhante: formData.nomeAcompanhante,
        microonibus: formData.microonibus,
        mensagem: "",
      });
      if (result.ok) {
        setSuccess(presenca);
        setFormData(EMPTY_FORM);
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success) setSuccess(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[90dvh] max-w-md overflow-y-auto pb-safe sm:max-w-md"
        aria-describedby={success ? "rsvp-success-desc" : "rsvp-form-desc"}
        aria-busy={loading}
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-brown">
            {success ? texts.sucessoTitulo : texts.modalTitulo}
          </DialogTitle>
          <DialogDescription id={success ? "rsvp-success-desc" : "rsvp-form-desc"}>
            {success ? texts.sucessoDescricao : texts.modalDescricao}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex size-20 items-center justify-center rounded-full bg-sage/20 text-sage">
              <Heart className="size-10 fill-sage" aria-hidden />
            </div>
            {success === "vou" ? (
              <>
                <p className="text-center font-heading text-lg text-brown">
                  {texts.sucessoMensagem}
                </p>
                <div className="flex items-center gap-2 text-olive">
                  <PartyPopper className="size-5" aria-hidden />
                  <span className="text-sm">Nos vemos em breve</span>
                </div>
              </>
            ) : null}
            <Button
              size="lg"
              className="min-h-[44px] w-full min-w-[44px] rounded-xl bg-sage px-6 transition-transform active:scale-[0.98] hover:bg-sage/90"
              onClick={handleClose}
            >
              Fechar
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 pb-2"
            noValidate
          >
            <GuestNameField
              ref={firstInputRef}
              id="rsvp-nome"
              value={formData.nome}
              error={nomeError}
              disabled={loading}
              onChange={(nome, guestId) => {
                setFormData((p) => ({ ...p, nome, guestId }));
                if (nomeError) setNomeError(null);
              }}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Você vem? *</p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Você vem?">
                {(["vou", "nao_vou"] as const).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    aria-pressed={presenca === value}
                    className={cn(
                      "min-h-11 text-brown",
                      presenca === value && "border-sage bg-sage text-cream hover:bg-sage/90 hover:text-cream",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setPresenca(value);
                      setMicroError(null);
                    }}
                  >
                    {value === "vou" ? "Vou" : "Não vou"}
                  </Button>
                ))}
              </div>
            </div>

            {presenca === "vou" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rsvp-microonibus">Deseja ir de microônibus? *</Label>
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
                      id="rsvp-microonibus"
                      className="min-h-[44px] w-full"
                      aria-invalid={!!microError}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="block text-sm text-muted-foreground">
                    {texts.microonibusAviso}
                  </span>
                  {microError && (
                    <p className="text-sm text-destructive" role="alert">
                      {microError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rsvp-nome-acompanhante">Nome do acompanhante</Label>
                  <Input
                    id="rsvp-nome-acompanhante"
                    value={formData.nomeAcompanhante}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, nomeAcompanhante: e.target.value }));
                      if (companionError) setCompanionError(null);
                    }}
                    placeholder="Nome completo do acompanhante (opcional)"
                    disabled={loading}
                    aria-invalid={!!companionError}
                    className="min-h-[44px]"
                  />
                  {companionError && (
                    <p className="text-sm text-destructive" role="alert">
                      {companionError}
                    </p>
                  )}
                </div>
              </>
            ) : null}

            <Button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-sage py-3 text-base transition-transform active:scale-[0.98] hover:bg-sage/90 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
                  Enviando...
                </>
              ) : (
                "Enviar resposta"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
