"use client";

import { useState, useCallback } from "react";
import { Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoUploadZone } from "@/components/PhotoUploadZone";
import { PhotoPreview } from "@/components/PhotoPreview";
import { PhotoQRCode } from "@/components/PhotoQRCode";
import { CameraModal } from "@/components/CameraModal";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import { validateImageFile } from "@/lib/image-utils";
import { toast } from "sonner";

export function PhotoUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const resetForm = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const { upload, loading, progress } = usePhotoUpload();

  const handleCameraCapture = useCallback(
    (capturedFile: File) => {
      upload(capturedFile, () => {});
    },
    [upload]
  );

  const camera = useCameraCapture(handleCameraCapture);

  const handleFile = useCallback((f: File | null) => {
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    const validation = validateImageFile(f);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFile(e.dataTransfer.files?.[0] ?? null);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    await upload(file, resetForm);
  };

  const handleCameraOpen = useCallback(async () => {
    await camera.open();
  }, [camera.open]);

  const progressMessage =
    progress === "compressing"
      ? "Comprimindo..."
      : progress === "uploading"
        ? "Enviando..."
        : null;

  const isUploadingFromGallery = loading && !!file;
  const isUploadingFromCamera = loading && !file;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h2 className="font-heading text-4xl font-semibold text-brown">
          Suba sua Foto
        </h2>
        <p className="mt-4 text-olive">
          Compartilhe seus momentos conosco! Envie suas fotos do casamento.
        </p>
      </div>

      <div className="space-y-6" aria-live="polite" aria-busy={loading}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col gap-6">
            <div className="rounded-2xl border border-amber-200/60 bg-linear-to-b from-white to-cream/80 p-6 shadow-sm">
              <Button
                type="button"
                onClick={handleCameraOpen}
                disabled={loading}
                className="h-16 w-full min-h-[64px] gap-4 rounded-xl bg-sage py-4 text-lg font-medium text-white transition-colors hover:bg-sage/90 disabled:opacity-70"
              >
                <Camera className="size-8" aria-hidden />
                <span>Tirar foto</span>
                {(isUploadingFromCamera || camera.isOpen) && (
                  <Loader2 className="size-6 animate-spin" aria-hidden />
                )}
              </Button>
              <p className="mt-2 text-center text-sm text-olive/80">
                Capture o momento e envie direto
              </p>
            </div>

            <div
              className={`flex flex-col rounded-2xl border-2 border-dashed transition-colors ${
                dragActive ? "border-sage bg-sage/5" : "border-olive/20 bg-white"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <p className="border-b border-olive/10 px-4 py-3 text-sm font-medium text-brown">
                Ou envie da sua galeria
              </p>
              {preview && file ? (
                <div className="p-4">
                  <PhotoPreview
                    preview={preview}
                    fileName={file.name}
                    fileSize={file.size}
                    onRemove={resetForm}
                    disabled={loading}
                  />
                </div>
              ) : (
                <PhotoUploadZone onFileSelect={handleFile} disabled={loading} />
              )}
            </div>

            {preview && file && (
              <div className="space-y-2">
                {loading && (
                  <div
                    className="h-1 w-full overflow-hidden rounded-full bg-olive/10"
                    role="progressbar"
                    aria-valuetext={progressMessage ?? undefined}
                    aria-busy
                  >
                    <div className="h-full w-1/3 animate-pulse rounded-full bg-sage" />
                  </div>
                )}
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="mr-2 size-4 animate-spin"
                        aria-hidden
                      />
                      <span>{progressMessage ?? "Enviando..."}</span>
                    </>
                  ) : (
                    "Enviar Foto"
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col self-center lg:w-72 lg:self-start">
            <PhotoQRCode />
          </div>
        </div>

        <CameraModal
          open={camera.isOpen}
          isReady={camera.isReady}
          isLoading={camera.isLoading}
          flashEnabled={camera.flashEnabled}
          flashSupported={camera.flashSupported}
          capturedPreview={camera.capturedPreview}
          onClose={camera.close}
          onCapture={camera.capture}
          onConfirm={camera.confirmCapture}
          onRetake={camera.retake}
          onSwitchFlash={camera.switchFlash}
          onSwitchCamera={camera.switchCamera}
          videoRef={camera.setVideoRef}
          onVideoCanPlay={camera.handleVideoCanPlay}
        />
      </div>
    </div>
  );
}
