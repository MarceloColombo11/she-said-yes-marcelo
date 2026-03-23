"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

export function useCameraCapture(onCapture: (file: File) => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const close = useCallback(() => {
    stopStream();
    setIsReady(false);
    setIsLoading(false);
    setIsOpen(false);
  }, [stopStream]);

  const open = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Câmera não suportada neste navegador.");
      return false;
    }

    setIsLoading(true);
    setIsOpen(true);
    setIsReady(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
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
  }, [close]);

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
        close();
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture, close]);

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    return stopStream;
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
    open,
    close,
    capture,
    setVideoRef,
    handleVideoCanPlay,
    streamRef,
  };
}
