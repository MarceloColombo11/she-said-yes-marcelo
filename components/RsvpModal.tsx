"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const RSVP_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_RSVP_URL || "";

interface RsvpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RsvpModal({ open, onOpenChange }: RsvpModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    acompanhantes: "0",
    restricoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error("Por favor, informe seu nome completo.");
      return;
    }

    if (!RSVP_URL) {
      toast.error("Configuração de confirmação indisponível. Tente novamente mais tarde.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(RSVP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          email: formData.email.trim() || null,
          acompanhantes: formData.acompanhantes,
          restricoes: formData.restricoes.trim() || null,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok && result?.success !== false) {
        toast.success("Presença confirmada! Obrigado por nos honrar com sua presença.");
        setFormData({ nome: "", email: "", acompanhantes: "0", restricoes: "" });
        onOpenChange(false);
      } else {
        toast.error("Erro ao confirmar. Tente novamente.");
      }
    } catch {
      toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-brown">
            Confirmar Presença
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData((p) => ({ ...p, nome: e.target.value }))
              }
              placeholder="Seu nome completo"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acompanhantes">Número de acompanhantes</Label>
            <Select
              value={formData.acompanhantes}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, acompanhantes: v ?? "0" }))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3 ou mais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="restricoes">Restrições alimentares</Label>
            <Textarea
              id="restricoes"
              value={formData.restricoes}
              onChange={(e) =>
                setFormData((p) => ({ ...p, restricoes: e.target.value }))
              }
              placeholder="Vegetariano, alergias, etc. (opcional)"
              rows={3}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
