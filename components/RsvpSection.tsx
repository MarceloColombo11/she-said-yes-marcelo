"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { RsvpBlock } from "@/lib/content/text-blocks";
import { RsvpModal } from "./RsvpModal";

export function RsvpSection({ texts }: { texts: RsvpBlock }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="font-heading text-3xl font-semibold text-brown md:text-4xl">
        {texts.titulo}
      </h2>
      <p className="mt-6 text-olive leading-relaxed whitespace-pre-line">
        {texts.texto}
      </p>
      <Button
        size="lg"
        variant="default"
        className="mt-8"
        onClick={() => setModalOpen(true)}
        aria-label="Abrir formulário de confirmação de presença"
      >
        {texts.botao}
      </Button>
      <RsvpModal open={modalOpen} onOpenChange={setModalOpen} texts={texts} />
    </div>
  );
}
