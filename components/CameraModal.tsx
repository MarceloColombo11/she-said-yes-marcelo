"use client";

import { cn } from "@/lib/utils";
import { Loader2, Zap, ZapOff, SwitchCamera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CapturedKind } from "@/hooks/useCameraCapture";

type CameraModalProps = {
  effectiveFacingMode?: "user" | "environment";
  open: boolean;
  isReady: boolean;
  isLoading: boolean;
  flashEnabled: boolean;
  /** Flash disponível na UI (frontal sempre; traseira se torch). */
  flashAvailable?: boolean;
  /** @deprecated use flashAvailable */
  flashSupported?: boolean;
  screenFlashActive?: boolean;
  zoomSupported?: boolean;
  zoom?: number;
  zoomPresets?: number[];
  onZoomPreset?: (preset: number) => void;
  capturedPreview: string | null;
  capturedKind?: CapturedKind;
  isRecording?: boolean;
  recordProgress?: number;
  maxVideoSeconds?: number;
  onClose: () => void;
  onConfirm: () => void;
  onRetake: () => void;
  onSwitchFlash: () => void;
  onSwitchCamera: () => void;
  onShutterPointerDown: (e: React.PointerEvent) => void;
  onShutterPointerMove?: (e: React.PointerEvent) => void;
  onShutterPointerUp: (e: React.PointerEvent) => void;
  onShutterPointerCancel: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
  onVideoCanPlay: () => void;
};

function formatZoomLabel(value: number): string {
  if (Number.isInteger(value)) return `${value}x`;
  return `${value}x`;
}

function nearestPreset(zoom: number, presets: number[]): number | null {
  if (presets.length === 0) return null;
  let best = presets[0];
  let bestDist = Math.abs(zoom - best);
  for (const p of presets) {
    const d = Math.abs(zoom - p);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

export function CameraModal({
  effectiveFacingMode = "environment",
  open,
  isReady,
  isLoading,
  flashEnabled,
  flashAvailable,
  flashSupported,
  screenFlashActive = false,
  zoomSupported = false,
  zoom = 1,
  zoomPresets = [],
  onZoomPreset,
  capturedPreview,
  capturedKind = "photo",
  isRecording = false,
  recordProgress = 0,
  maxVideoSeconds = 15,
  onClose,
  onConfirm,
  onRetake,
  onSwitchFlash,
  onSwitchCamera,
  onShutterPointerDown,
  onShutterPointerMove,
  onShutterPointerUp,
  onShutterPointerCancel,
  videoRef,
  onVideoCanPlay,
}: CameraModalProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  const showFlashButton = flashAvailable ?? flashSupported ?? false;
  const showZoomChips = zoomSupported && zoomPresets.length > 1;
  const activePreset = showZoomChips
    ? nearestPreset(zoom, zoomPresets)
    : null;
  const isPreviewMode = !!capturedPreview;
  const secondsLeft = Math.max(
    0,
    Math.ceil(maxVideoSeconds * (1 - recordProgress))
  );

  const title = isPreviewMode
    ? capturedKind === "video"
      ? "Confirmar vídeo"
      : "Confirmar foto"
    : isRecording
      ? `Gravando · ${secondsLeft}s`
      : "Foto ou vídeo";

  const hint = showZoomChips
    ? isRecording
      ? "Arraste para cima/baixo para zoom · solte para encerrar"
      : `Toque = foto · Segure = vídeo · arraste para zoom`
    : flashEnabled
      ? effectiveFacingMode === "user"
        ? "Flash ligado · tela clara na captura"
        : "Flash ligado"
      : `Toque = foto · Segure = vídeo até ${maxVideoSeconds}s`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[95dvh] w-full max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90dvh] sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-olive/10 px-4 py-3 pb-safe">
          <DialogTitle className="font-heading text-base font-medium text-brown">
            {title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 shrink-0 rounded-full"
            aria-label="Fechar"
            disabled={isRecording}
          >
            <X className="size-5" />
          </Button>
        </DialogHeader>

        <div
          className="relative flex min-h-[50dvh] flex-1 items-center justify-center overflow-hidden bg-black"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {/* Barra estilo story */}
          {!isPreviewMode && (
            <div
              className="pointer-events-none absolute inset-x-3 top-3 z-20"
              aria-hidden={!isRecording}
            >
              <div className="h-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className={cn(
                    "h-full rounded-full origin-left transition-[width] duration-75 ease-linear",
                    isRecording ? "bg-white" : "bg-white/40"
                  )}
                  style={{
                    width: isRecording
                      ? `${Math.min(100, recordProgress * 100)}%`
                      : "100%",
                    opacity: isRecording ? 1 : 0.35,
                  }}
                />
              </div>
              {isRecording && (
                <p className="mt-2 text-center text-xs font-medium text-white drop-shadow">
                  {secondsLeft}s · solte para encerrar
                </p>
              )}
            </div>
          )}

          {isPreviewMode ? (
            capturedKind === "video" ? (
              <video
                src={capturedPreview!}
                controls
                playsInline
                className="h-full w-full object-contain"
                aria-label="Preview do vídeo gravado"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capturedPreview!}
                alt="Preview da foto capturada"
                className="h-full w-full object-contain"
              />
            )
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
                  className={cn(
                    "h-full w-full object-cover",
                    effectiveFacingMode === "user" && "-scale-x-100"
                  )}
                  aria-label="Visualização da câmera"
                />
              )}
              {isRecording && (
                <div className="pointer-events-none absolute left-4 top-10 z-30 flex items-center gap-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                  <span className="size-2 animate-pulse rounded-full bg-white" />
                  REC
                </div>
              )}
              {/* Flash frontal: tela branca (não bloqueia o shutter) */}
              {screenFlashActive && (
                <div
                  className="pointer-events-none absolute inset-0 z-40 bg-white"
                  aria-hidden
                />
              )}
              {showZoomChips && (
                <div className="absolute inset-x-0 bottom-3 z-30 flex justify-center gap-2 px-3">
                  {zoomPresets.map((preset) => {
                    const active = activePreset === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onZoomPreset?.(preset)}
                        disabled={isLoading}
                        className={cn(
                          "min-h-9 min-w-9 rounded-full px-2.5 text-xs font-semibold transition-colors",
                          active
                            ? "bg-white text-brown shadow-sm"
                            : "bg-black/45 text-white backdrop-blur-sm"
                        )}
                        aria-label={`Zoom ${formatZoomLabel(preset)}`}
                        aria-pressed={active}
                      >
                        {formatZoomLabel(preset)}
                      </button>
                    );
                  })}
                </div>
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
                className="min-h-12 flex-1 py-3"
              >
                {capturedKind === "video" ? "Gravar outro" : "Tirar outra"}
              </Button>
              <Button onClick={onConfirm} className="min-h-12 flex-1 py-3">
                Confirmar
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex size-12 min-w-12 items-center justify-center">
                  {showFlashButton ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onSwitchFlash}
                      disabled={isLoading || isRecording}
                      className={cn(
                        "size-12 min-h-12 min-w-12 rounded-full transition-colors",
                        flashEnabled
                          ? "bg-amber-300 text-amber-900 ring-2 ring-amber-500/60"
                          : "bg-white/80 text-brown"
                      )}
                      aria-pressed={flashEnabled}
                      aria-label={
                        flashEnabled ? "Desligar flash" : "Ligar flash"
                      }
                    >
                      {flashEnabled ? (
                        <Zap className="size-6 fill-amber-700" />
                      ) : (
                        <ZapOff className="size-6" />
                      )}
                    </Button>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled={!isReady || isLoading}
                  onPointerDown={onShutterPointerDown}
                  onPointerMove={onShutterPointerMove}
                  onPointerUp={onShutterPointerUp}
                  onPointerCancel={onShutterPointerCancel}
                  onContextMenu={(e) => e.preventDefault()}
                  className={cn(
                    "relative flex size-16 min-h-16 min-w-16 shrink-0 touch-none items-center justify-center rounded-full p-0 transition-transform select-none",
                    "bg-sage hover:bg-sage/90 disabled:opacity-50",
                    isRecording && "scale-110 bg-red-600 hover:bg-red-600"
                  )}
                  aria-label={
                    isRecording
                      ? showZoomChips
                        ? "Arraste para zoom, solte para parar"
                        : "Solte para parar a gravação"
                      : "Toque para foto, segure para vídeo de até 15 segundos"
                  }
                >
                  <span
                    className={cn(
                      "rounded-full border-4 border-white transition-all",
                      isRecording ? "size-6 rounded-md" : "size-12"
                    )}
                  />
                </button>

                <div className="flex size-12 min-w-12 items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSwitchCamera}
                    disabled={isLoading || isRecording}
                    className="size-12 min-h-12 min-w-12 rounded-full bg-white/80"
                    aria-label="Trocar câmera frontal/traseira"
                  >
                    <SwitchCamera className="size-6" />
                  </Button>
                </div>
              </div>

              <p className="text-center text-xs text-olive/80">{hint}</p>

              <Button
                variant="outline"
                onClick={onClose}
                disabled={isRecording}
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
