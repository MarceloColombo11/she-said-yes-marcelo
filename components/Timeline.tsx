"use client";

import { useState } from "react";
import { Church, Wine, Utensils, Music } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  hora: string;
  titulo: string;
  descricao: string;
  icone: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  church: Church,
  wine: Wine,
  utensils: Utensils,
  music: Music,
};

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-olive/30 md:left-1/2 md:-translate-x-px" />
        <div className="space-y-8">
          {events.map((event, i) => {
            const IconComponent = ICON_MAP[event.icone] || Church;
            const isLeft = i % 2 === 0;
            return (
              <div
                key={event.hora + event.titulo}
                className={cn(
                  "relative flex items-start gap-6",
                  !isLeft && "md:flex-row-reverse"
                )}
              >
                <div className="flex shrink-0 items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="flex size-12 items-center justify-center rounded-full border-2 border-sage bg-cream text-sage transition-colors hover:bg-sage hover:text-cream focus:outline-none focus:ring-2 focus:ring-sage/50"
                    aria-label={`Ver detalhes: ${event.titulo}`}
                  >
                    <IconComponent className="size-5" />
                  </button>
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-lg border border-olive/20 bg-white p-4 shadow-sm",
                    isLeft ? "md:text-right" : "md:text-left"
                  )}
                >
                  <p className="text-sm font-medium text-sage">{event.hora}</p>
                  <h3 className="font-heading text-lg font-semibold text-brown">
                    {event.titulo}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="mt-2 text-sm text-olive/80 underline decoration-sage/50 hover:decoration-sage"
                  >
                    Ver mais
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-brown">
                  {selectedEvent.hora} — {selectedEvent.titulo}
                </DialogTitle>
              </DialogHeader>
              <p className="text-olive/90 italic">
                {selectedEvent.descricao}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
