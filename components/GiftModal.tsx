"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Presente } from "./GiftCard";

interface GiftModalProps {
  presente: Presente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GiftModal({ presente, open, onOpenChange }: GiftModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    if (!presente?.chavePix) return;
    navigator.clipboard.writeText(presente.chavePix);
    setCopied(true);
    toast.success("Chave copiada! Cole no app do seu banco.");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!presente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-brown">
            {presente.nome}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes do presente e pagamento via Pix com QR Code e chave para
            copiar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-olive/90">{presente.descricao}</p>
          {presente.valor && (
            <p className="text-sm font-medium text-sage">{presente.valor}</p>
          )}

          <div className="flex flex-col items-center gap-4 rounded-lg border border-olive/20 bg-cream/50 p-4">
            <p className="text-sm font-medium text-brown">Pague via Pix</p>
            <QRCodeSVG
              value={presente.chavePix}
              size={160}
              level="M"
              className="rounded-lg"
            />
            <div className="flex w-full items-center gap-2">
              <code className="flex-1 truncate rounded bg-white px-3 py-2 text-xs text-olive">
                {presente.chavePix}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPix}
                aria-label="Copiar chave Pix"
              >
                {copied ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-olive">
              Copie a chave e cole no app do seu banco para pagar via Pix.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
