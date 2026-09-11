import type { Metadata } from "next";
import { ConfirmacaoPage } from "@/components/confirmacao/ConfirmacaoPage";

export const metadata: Metadata = {
  title: "Confirmação de presença — Suelen & Marcelo",
  description:
    "Confirme se você vem à festa, salve a data e o endereço do Mirante Garden. Até 15 de novembro de 2026.",
  openGraph: {
    title: "Confirmação de presença — Suelen & Marcelo",
    description:
      "Assina a lista da obra: confirmação de presença, data, hora e local do casamento.",
  },
};

export default function ConfirmacaoRoute() {
  return <ConfirmacaoPage />;
}
