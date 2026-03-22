"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mirante Garden - Fazendinha, Biguaçu - SC
const MAPS_PLACE_URL =
  "https://www.google.com/maps/place/Mirante+Garden/@-27.4567737,-48.7005941,17z";
const EMBED_URL =
  "https://www.google.com/maps?q=-27.4567737,-48.6980192&z=17&output=embed";

export function MapWidget() {
  const openInMaps = () => {
    window.open(MAPS_PLACE_URL, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-olive/20">
        <iframe
          src={EMBED_URL}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Local do casamento no mapa"
        />
      </div>
      <Button
        onClick={openInMaps}
        className="w-full sm:w-auto"
        aria-label="Abrir local no mapa"
      >
        <MapPin className="mr-2 size-4" />
        Como chegar
        <ExternalLink className="ml-2 size-4" />
      </Button>
    </div>
  );
}
