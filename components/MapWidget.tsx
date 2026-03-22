"use client";

import { useCallback, useMemo, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Substituir pelo endereço real do local do casamento
const VENUE_ADDRESS = "Av. Paulista, 1000 - Bela Vista, São Paulo - SP";
const VENUE_LAT = -23.5615;
const VENUE_LNG = -46.656;

const mapContainerStyle = { width: "100%", height: "300px" };

export function MapWidget() {
  const [, setMap] = useState<google.maps.Map | null>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const center = useMemo(() => ({ lat: VENUE_LAT, lng: VENUE_LNG }), []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const openInMaps = () => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const encodedAddress = encodeURIComponent(VENUE_ADDRESS);
    const url = isIOS
      ? `maps://maps.apple.com/?q=${encodedAddress}`
      : `https://maps.google.com/?q=${encodedAddress}`;
    window.open(url, "_blank");
  };

  if (loadError) {
    return (
      <div className="rounded-xl border border-olive/20 bg-cream/50 p-8 text-center">
        <p className="text-olive/80">
          Não foi possível carregar o mapa.{" "}
          <Button variant="link" className="p-0 h-auto" onClick={openInMaps}>
            Abrir no Google Maps
          </Button>
        </p>
      </div>
    );
  }

  if (!isLoaded || !GOOGLE_MAPS_API_KEY) {
    return (
      <div className="space-y-4">
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-olive/20 bg-cream/50">
          <p className="text-olive/80">
            {GOOGLE_MAPS_API_KEY ? "Carregando mapa..." : "Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"}
          </p>
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

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-olive/20">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <Marker position={center} title="Local do evento" />
        </GoogleMap>
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
