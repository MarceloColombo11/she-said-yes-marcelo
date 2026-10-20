"use client";

import { useState } from "react";
import { GiftCard, type Presente } from "./GiftCard";
import { GiftModal } from "./GiftModal";

const POLAROID_TILTS = [-2.2, 1.5, -1.1, 2, 0.7, -1.7];

interface GiftsSectionProps {
  title: string;
  subtitle: string;
  presents: Presente[];
}

export function GiftsSection({ title, subtitle, presents }: GiftsSectionProps) {
  const [selectedPresent, setSelectedPresent] = useState<Presente | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectPresent = (presente: Presente) => {
    setSelectedPresent(presente);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-semibold text-brown md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-olive">{subtitle}</p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-2 items-start gap-x-6 gap-y-12 md:grid-cols-3 md:gap-x-10 md:gap-y-14">
        {presents.map((presente, index) => (
          <GiftCard
            key={presente.id}
            presente={presente}
            tilt={POLAROID_TILTS[index % POLAROID_TILTS.length]}
            onClick={() => handleSelectPresent(presente)}
          />
        ))}
      </div>

      <GiftModal
        presente={selectedPresent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
