"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type CameraModalProps = {
  open: boolean;
  isReady: boolean;
  isLoading: boolean;
  onClose: () => void;
  onCapture: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
  onVideoCanPlay: () => void;
};

export function CameraModal({
  open,
  isReady,
  isLoading,
  onClose,
  onCapture,
  videoRef,
  onVideoCanPlay,
}: CameraModalProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg border-amber-200/40 shadow-lg sm:max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-heading text-brown">
            Tirar foto
          </DialogTitle>
        </DialogHeader>
        <div
          className="relative aspect-video w-full overflow-hidden rounded-2xl border border-olive/10 bg-black"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Loader2 className="size-12 animate-spin" aria-hidden />
              <span className="sr-only">Aguarde a câmera carregar...</span>
            </div>
          )}
          {!isLoading && (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onCanPlay={onVideoCanPlay}
              className="h-full w-full object-cover"
              aria-label="Visualização da câmera"
            />
          )}
        </div>
        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onCapture} disabled={!isReady || isLoading}>
            Capturar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
