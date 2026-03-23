"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

export type FacingMode = "user" | "environment";

export function useCameraCapture(onCapture: (file: File) => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] =
    useState<FacingMode>("environment");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setFlashEnabled(false);
  }, []);

  const close = useCallback(() => {
    stopStream();
    setIsReady(false);
    setIsLoading(false);
    setIsOpen(false);
  }, [stopStream]);

  const checkMultipleCameras = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === "videoinput");
    setHasMultipleCameras(videoDevices.length > 1);
    return videoDevices.length > 1;
  }, []);

  const startStream = useCallback(
    async (facingMode: FacingMode) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const caps = videoTrack.getCapabilities();
        const torchSupported =
          "torch" in caps && typeof (caps as { torch?: boolean }).torch === "boolean";
        setFlashSupported(torchSupported);
        if (!torchSupported) {
          setFlashEnabled(false);
        }
      }

      await checkMultipleCameras();

      return stream;
    },
    [checkMultipleCameras]
  );

  const open = useCallback(
    async (facingMode: FacingMode = "environment") => {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Câmera não suportada neste navegador.");
        return false;
      }

      setIsLoading(true);
      setIsOpen(true);
      setIsReady(false);
      setCurrentFacingMode(facingMode);

      try {
        await startStream(facingMode);
        setIsLoading(false);
        return true;
      } catch (err) {
        close();
        toast.error(
          err instanceof Error && err.name === "NotAllowedError"
            ? "Permissão de câmera negada."
            : "Não foi possível acessar a câmera. Tente novamente."
        );
        return false;
      }
    },
    [close, startStream]
  );

  const switchCamera = useCallback(async () => {
    if (!streamRef.current || isLoading) return;

    const nextMode: FacingMode =
      currentFacingMode === "environment" ? "user" : "environment";

    setIsLoading(true);
    setIsReady(false);
    stopStream();

    try {
      await startStream(nextMode);
      setCurrentFacingMode(nextMode);
      setIsLoading(false);
    } catch (err) {
      toast.error("Não foi possível trocar a câmera.");
      setIsLoading(false);
    }
  }, [currentFacingMode, isLoading, startStream, stopStream]);

  const switchFlash = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream || !flashSupported) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    const nextState = !flashEnabled;

    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: nextState } as MediaTrackConstraintSet],
      });
      setFlashEnabled(nextState);
    } catch {
      setFlashEnabled(false);
    }
  }, [flashEnabled, flashSupported]);

  const closeWithFlashOff = useCallback(() => {
    const stream = streamRef.current;
    if (stream && flashEnabled) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack?.applyConstraints({
        advanced: [{ torch: false } as MediaTrackConstraintSet],
      }).catch(() => {});
    }
    close();
  }, [close, flashEnabled]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream || video.readyState < 2) {
      toast.error("Aguarde a câmera carregar.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      toast.error("Erro ao capturar a foto.");
      return;
    }

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Erro ao capturar a foto.");
          return;
        }
        const file = new File([blob], `foto-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        closeWithFlashOff();
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture, closeWithFlashOff]);

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    if (isOpen && !isLoading && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isOpen, isLoading]);

  return {
    isOpen,
    isReady,
    isLoading,
    currentFacingMode,
    flashEnabled,
    flashSupported,
    hasMultipleCameras,
    open,
    close: closeWithFlashOff,
    capture,
    switchCamera,
    switchFlash,
    setVideoRef,
    handleVideoCanPlay,
    streamRef,
  };
}
