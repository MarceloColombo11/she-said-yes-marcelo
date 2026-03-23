"use client";

import { Loader2, Zap, ZapOff, SwitchCamera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CameraModalProps = {
  open: boolean;
  isReady: boolean;
  isLoading: boolean;
  flashEnabled: boolean;
  flashSupported: boolean;
  capturedPreview: string | null;
  onClose: () => void;
  onCapture: () => void;
  onConfirm: () => void;
  onRetake: () => void;
  onSwitchFlash: () => void;
  onSwitchCamera: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
  onVideoCanPlay: () => void;
};

export function CameraModal({
  open,
  isReady,
  isLoading,
  flashEnabled,
  flashSupported,
  capturedPreview,
  onClose,
  onCapture,
  onConfirm,
  onRetake,
  onSwitchFlash,
  onSwitchCamera,
  videoRef,
  onVideoCanPlay,
}: CameraModalProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  const isPreviewMode = !!capturedPreview;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[95dvh] w-full max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90dvh] sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-olive/10 px-4 py-3 pb-safe">
          <DialogTitle className="font-heading text-base font-medium text-brown">
            {isPreviewMode ? "Confirmar foto" : "Tirar foto"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 shrink-0 rounded-full"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </Button>
        </DialogHeader>

        <div
          className="relative flex min-h-[50dvh] flex-1 items-center justify-center overflow-hidden bg-black"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {isPreviewMode ? (
            <img
              src={capturedPreview}
              alt="Preview da foto capturada"
              className="h-full w-full object-contain"
            />
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-olive/10 bg-cream/80 p-4 pb-safe">
          {isPreviewMode ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onRetake}
                className="min-h-[48px] flex-1 py-3"
              >
                Tirar outra
              </Button>
              <Button
                onClick={onConfirm}
                className="min-h-[48px] flex-1 py-3"
              >
                Confirmar
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 min-w-[48px] items-center justify-center">
                  {flashSupported ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onSwitchFlash}
                      disabled={isLoading}
                      className={`h-12 w-12 min-h-[48px] min-w-[48px] rounded-full ${
                        flashEnabled ? "bg-amber-200/80 text-amber-800" : "bg-white/80"
                      }`}
                      aria-label={flashEnabled ? "Desligar flash" : "Ligar flash"}
                    >
                      {flashEnabled ? (
                        <Zap className="size-6 fill-amber-600" />
                      ) : (
                        <ZapOff className="size-6" />
                      )}
                    </Button>
                  ) : null}
                </div>

                <Button
                  onClick={onCapture}
                  disabled={!isReady || isLoading}
                  className="h-14 w-14 min-h-[56px] min-w-[56px] shrink-0 rounded-full bg-sage p-0 hover:bg-sage/90"
                  aria-label="Capturar foto"
                >
                  <span className="h-12 w-12 rounded-full border-4 border-white" />
                </Button>

                <div className="flex h-12 w-12 min-w-[48px] items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSwitchCamera}
                    disabled={isLoading}
                    className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full bg-white/80"
                    aria-label="Trocar câmera frontal/traseira"
                  >
                    <SwitchCamera className="size-6" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full py-3"
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
