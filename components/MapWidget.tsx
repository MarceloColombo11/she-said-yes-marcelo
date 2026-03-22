"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mirante Garden - link para obter direções
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir//Mirante+Garden,+Estrada+Geral+da+Fazendinha+-+Fazendinha,+Bigua%C3%A7u+-+SC,+88160-000";

const EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.400967922347!2d-48.700594124541496!3d-27.45677367632704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9527530be692af6f%3A0x7a1b1042588b0df!2sMirante%20Garden!5e0!3m2!1sen!2sbr!4v1774201165659!5m2!1sen!2sbr";

export function MapWidget() {
  const openDirections = () => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const destination = encodeURIComponent(
      "Mirante Garden, Estrada Geral da Fazendinha - Fazendinha, Biguaçu - SC, 88160-000"
    );
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${destination}`
      : DIRECTIONS_URL;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-olive/20">
        <iframe
          src={EMBED_URL}
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Local do casamento no mapa"
        />
      </div>
      <Button
        onClick={openDirections}
        className="w-full sm:w-auto"
        aria-label="Obter direções para o local"
      >
        <MapPin className="mr-2 size-4" />
        Como chegar
        <ExternalLink className="ml-2 size-4" />
      </Button>
    </div>
  );
}
