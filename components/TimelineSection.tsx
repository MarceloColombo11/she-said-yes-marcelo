"use client";

import { Timeline } from "./Timeline";
import type { TimelineEvent } from "./Timeline";

interface TimelineSectionProps {
  events: TimelineEvent[];
}

export function TimelineSection({ events }: TimelineSectionProps) {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-4xl font-semibold text-brown">
          Programação
        </h2>
        <p className="mt-4 text-olive/80">O que vai rolar no nosso dia</p>
      </div>
      <Timeline events={events} />
    </div>
  );
}
