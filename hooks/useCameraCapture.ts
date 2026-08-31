"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

export type FacingMode = "user" | "environment";
export type CapturedKind = "photo" | "video";

/** Limite estilo story (Instagram/Snap). */
export const MAX_VIDEO_SECONDS = 15;
const HOLD_TO_RECORD_MS = 220;
/** Tempo da tela branca antes de capturar na frontal. */
const SCREEN_FLASH_PHOTO_MS = 150;
/** Bitrate de áudio (~voz/ambiente nítidos em mobile). */
const AUDIO_BITS_PER_SECOND = 192_000;
const VIDEO_BITS_PER_SECOND = 8_000_000;
const PHOTO_JPEG_QUALITY = 0.95;

/** Constraints de mic otimizadas para voz (casamento / ambiente). */
const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: { ideal: 1 },
  sampleRate: { ideal: 48_000 },
};

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  // Preferir Opus (melhor áudio) quando disponível
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4;codecs=avc1,mp4a.40.2",
    "video/mp4",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

function createRecorder(stream: MediaStream, mimeType?: string): MediaRecorder {
  const options: MediaRecorderOptions = {
    videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
    audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
  };
  if (mimeType) options.mimeType = mimeType;

  try {
    return new MediaRecorder(stream, options);
  } catch {
    // Alguns browsers rejeitam bitrate/mime — tenta só com mime
    try {
      return mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch {
      return new MediaRecorder(stream);
    }
  }
}

function extensionForMime(mime: string): string {
  if (mime.includes("mp4")) return "mp4";
  return "webm";
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function applyTorch(track: MediaStreamTrack, on: boolean) {
  await track.applyConstraints({
    advanced: [{ torch: on } as MediaTrackConstraintSet],
  });
}

async function applyZoom(track: MediaStreamTrack, zoom: number) {
  await track.applyConstraints({
    advanced: [{ zoom } as MediaTrackConstraintSet],
  });
}

type ZoomRange = { min: number; max: number; step: number };

function readZoomCapability(caps: MediaTrackCapabilities): ZoomRange | null {
  const zoom = (
    caps as MediaTrackCapabilities & {
      zoom?: { min: number; max: number; step?: number };
    }
  ).zoom;
  if (
    !zoom ||
    typeof zoom.min !== "number" ||
    typeof zoom.max !== "number" ||
    !(zoom.max > zoom.min)
  ) {
    return null;
  }
  return {
    min: zoom.min,
    max: zoom.max,
    step: typeof zoom.step === "number" && zoom.step > 0 ? zoom.step : 0.1,
  };
}

function buildZoomPresets(min: number, max: number): number[] {
  const candidates = [0.5, 1, 2, 3];
  if (max >= 5) candidates.push(5);
  if (max >= 8 && max < 12) candidates.push(Math.floor(max));
  else if (max >= 12) candidates.push(10);

  const presets = candidates.filter((v) => v >= min - 0.05 && v <= max + 0.05);
  return [...new Set(presets.map((v) => Math.round(v * 100) / 100))].sort(
    (a, b) => a - b
  );
}

function defaultZoomInRange(min: number, max: number): number {
  if (1 >= min && 1 <= max) return 1;
  return min;
}

function clampZoom(
  value: number,
  min: number,
  max: number,
  step: number
): number {
  const clamped = Math.min(max, Math.max(min, value));
  if (step <= 0) return clamped;
  const steps = Math.round((clamped - min) / step);
  return Math.min(max, Math.max(min, min + steps * step));
}

/** Pixels de arraste vertical ≈ range completo de zoom (gesto Instagram). */
const ZOOM_DRAG_PX = 260;

export function useCameraCapture(onCapture: (file: File) => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] =
    useState<FacingMode>("environment");
  const [effectiveFacingMode, setEffectiveFacingMode] =
    useState<FacingMode>("environment");
  /** Preferência do usuário (persiste ao trocar câmera). */
  const [flashEnabled, setFlashEnabled] = useState(false);
  /** Torch hardware disponível no track atual. */
  const [torchSupported, setTorchSupported] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedKind, setCapturedKind] = useState<CapturedKind>("photo");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  /** Overlay branco ativo (foto breve ou vídeo contínuo). */
  const [screenFlashActive, setScreenFlashActive] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomMin, setZoomMin] = useState(1);
  const [zoomMax, setZoomMax] = useState(1);
  const [zoomStep, setZoomStep] = useState(0.1);
  const [zoomPresets, setZoomPresets] = useState<number[]>([]);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartedAtRef = useRef(0);
  const progressRafRef = useRef<number | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingActiveRef = useRef(false);
  const pointerDownRef = useRef(false);
  const flashEnabledRef = useRef(false);
  const effectiveFacingRef = useRef<FacingMode>("environment");
  const torchSupportedRef = useRef(false);
  const zoomSupportedRef = useRef(false);
  const zoomRef = useRef(1);
  const zoomMinRef = useRef(1);
  const zoomMaxRef = useRef(1);
  const zoomStepRef = useRef(0.1);
  const pointerStartYRef = useRef(0);
  const lastClientYRef = useRef(0);
  const zoomAtPointerStartRef = useRef(1);
  const zoomApplyInFlightRef = useRef(false);
  const pendingZoomRef = useRef<number | null>(null);

  useEffect(() => {
    flashEnabledRef.current = flashEnabled;
  }, [flashEnabled]);

  useEffect(() => {
    effectiveFacingRef.current = effectiveFacingMode;
  }, [effectiveFacingMode]);

  useEffect(() => {
    torchSupportedRef.current = torchSupported;
  }, [torchSupported]);

  useEffect(() => {
    zoomSupportedRef.current = zoomSupported;
  }, [zoomSupported]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  /** Flash na UI: frontal sempre; traseira só com torch. */
  const flashAvailable =
    effectiveFacingMode === "user" || torchSupported;

  const clearRecordTimers = useCallback(() => {
    if (progressRafRef.current != null) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }
    if (maxTimerRef.current != null) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (holdTimerRef.current != null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const clearZoomState = useCallback(() => {
    setZoomSupported(false);
    zoomSupportedRef.current = false;
    setZoomPresets([]);
    setZoom(1);
    zoomRef.current = 1;
    setZoomMin(1);
    setZoomMax(1);
    setZoomStep(0.1);
    zoomMinRef.current = 1;
    zoomMaxRef.current = 1;
    zoomStepRef.current = 0.1;
  }, []);

  const applyZoomValue = useCallback(async (raw: number) => {
    const stream = streamRef.current;
    if (!stream || !zoomSupportedRef.current) return;

    const next = clampZoom(
      raw,
      zoomMinRef.current,
      zoomMaxRef.current,
      zoomStepRef.current
    );

    if (zoomApplyInFlightRef.current) {
      pendingZoomRef.current = next;
      return;
    }

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    zoomApplyInFlightRef.current = true;
    try {
      let value = next;
      for (;;) {
        await applyZoom(track, value);
        zoomRef.current = value;
        setZoom(value);
        if (pendingZoomRef.current == null) break;
        value = pendingZoomRef.current;
        pendingZoomRef.current = null;
      }
    } catch {
      /* device pode rejeitar zoom intermediário */
    } finally {
      zoomApplyInFlightRef.current = false;
    }
  }, []);

  const setZoomPreset = useCallback(
    (preset: number) => {
      void applyZoomValue(preset);
    },
    [applyZoomValue]
  );

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setTorchSupported(false);
    setScreenFlashActive(false);
    clearZoomState();
  }, [clearZoomState]);

  const close = useCallback(() => {
    if (recorderRef.current && recordingActiveRef.current) {
      try {
        recorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    clearRecordTimers();
    recordingActiveRef.current = false;
    setIsRecording(false);
    setRecordProgress(0);
    setScreenFlashActive(false);
    stopStream();
    setIsReady(false);
    setIsLoading(false);
    setIsOpen(false);
    setCapturedPreview(null);
    setCapturedFile(null);
    setCapturedKind("photo");
    setFlashEnabled(false);
  }, [clearRecordTimers, stopStream]);

  const checkMultipleCameras = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === "videoinput");
    setHasMultipleCameras(videoDevices.length > 1);
    return videoDevices.length > 1;
  }, []);

  const startStream = useCallback(
    async (facingMode: FacingMode) => {
      // Áudio para gravação de vídeo; se negar, segue só com vídeo
      const videoConstraints: MediaTrackConstraints = {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      };
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: AUDIO_CONSTRAINTS,
          video: videoConstraints,
        });
      } catch {
        try {
          // Fallback: áudio sem constraints detalhadas
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: videoConstraints,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
          });
        }
      }

      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const caps = videoTrack.getCapabilities();
        const settingsFacing = videoTrack.getSettings().facingMode;
        const capsFacing = caps.facingMode;
        let effective: FacingMode = facingMode;
        if (settingsFacing === "user" || settingsFacing === "environment") {
          effective = settingsFacing;
        } else if (
          Array.isArray(capsFacing) &&
          capsFacing.length === 1 &&
          (capsFacing[0] === "user" || capsFacing[0] === "environment")
        ) {
          effective = capsFacing[0];
        }
        setEffectiveFacingMode(effective);
        effectiveFacingRef.current = effective;

        const torchOk =
          "torch" in caps &&
          typeof (caps as { torch?: boolean }).torch === "boolean";
        setTorchSupported(torchOk);
        torchSupportedRef.current = torchOk;

        // Reaplica torch se a preferência estiver ligada e a traseira suportar
        if (torchOk && flashEnabledRef.current && effective === "environment") {
          try {
            await applyTorch(videoTrack, true);
          } catch {
            /* ignore */
          }
        }

        const zoomRange = readZoomCapability(caps);
        if (zoomRange) {
          const presets = buildZoomPresets(zoomRange.min, zoomRange.max);
          const initial = defaultZoomInRange(zoomRange.min, zoomRange.max);
          setZoomSupported(true);
          zoomSupportedRef.current = true;
          setZoomMin(zoomRange.min);
          setZoomMax(zoomRange.max);
          setZoomStep(zoomRange.step);
          zoomMinRef.current = zoomRange.min;
          zoomMaxRef.current = zoomRange.max;
          zoomStepRef.current = zoomRange.step;
          setZoomPresets(presets);
          setZoom(initial);
          zoomRef.current = initial;
          try {
            await applyZoom(videoTrack, initial);
          } catch {
            /* ignore */
          }
        } else {
          clearZoomState();
        }
      }

      await checkMultipleCameras();

      return stream;
    },
    [checkMultipleCameras, clearZoomState]
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
      setCapturedPreview(null);
      setCapturedFile(null);
      setRecordProgress(0);
      setIsRecording(false);
      setScreenFlashActive(false);
      setFlashEnabled(false);

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
    if (!streamRef.current || isLoading || recordingActiveRef.current) return;

    const nextMode: FacingMode =
      currentFacingMode === "environment" ? "user" : "environment";

    setIsLoading(true);
    setIsReady(false);
    setScreenFlashActive(false);
    stopStream();

    try {
      await startStream(nextMode);
      setCurrentFacingMode(nextMode);
      setIsLoading(false);
    } catch {
      toast.error("Não foi possível trocar a câmera.");
      setIsLoading(false);
    }
  }, [currentFacingMode, isLoading, startStream, stopStream]);

  const switchFlash = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream || recordingActiveRef.current) return;

    const facing = effectiveFacingRef.current;
    const canUse =
      facing === "user" || torchSupportedRef.current;
    if (!canUse) return;

    const nextState = !flashEnabledRef.current;

    if (facing === "environment" && torchSupportedRef.current) {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;
      try {
        await applyTorch(videoTrack, nextState);
        setFlashEnabled(nextState);
      } catch {
        setFlashEnabled(false);
      }
      return;
    }

    // Frontal: só preferência (tela branca na captura/gravação)
    setFlashEnabled(nextState);
  }, []);

  const closeWithFlashOff = useCallback(() => {
    const stream = streamRef.current;
    if (stream && flashEnabledRef.current && torchSupportedRef.current) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack?.applyConstraints({
        advanced: [{ torch: false } as MediaTrackConstraintSet],
      }).catch(() => {});
    }
    close();
  }, [close]);

  const capturePhotoNow = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream || video.readyState < 2) {
      toast.error("Aguarde a câmera carregar.");
      setScreenFlashActive(false);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      toast.error("Erro ao capturar a foto.");
      setScreenFlashActive(false);
      return;
    }

    if (effectiveFacingRef.current === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        setScreenFlashActive(false);
        if (!blob) {
          toast.error("Erro ao capturar a foto.");
          return;
        }
        const file = new File([blob], `foto-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedKind("photo");
        setCapturedPreview(previewUrl);
        setCapturedFile(file);
      },
      "image/jpeg",
      PHOTO_JPEG_QUALITY
    );
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream || video.readyState < 2) {
      toast.error("Aguarde a câmera carregar.");
      return;
    }

    const useScreenFlash =
      flashEnabledRef.current && effectiveFacingRef.current === "user";

    if (useScreenFlash) {
      setScreenFlashActive(true);
      await sleep(SCREEN_FLASH_PHOTO_MS);
    }

    capturePhotoNow();
  }, [capturePhotoNow]);

  const finishRecording = useCallback((blob: Blob, mimeType: string) => {
    clearRecordTimers();
    recordingActiveRef.current = false;
    setIsRecording(false);
    setRecordProgress(1);
    setScreenFlashActive(false);

    if (blob.size < 1000) {
      toast.error("Vídeo muito curto. Segure o botão para gravar.");
      setRecordProgress(0);
      return;
    }

    const ext = extensionForMime(mimeType);
    const file = new File([blob], `video-${Date.now()}.${ext}`, {
      type: mimeType.split(";")[0] || "video/webm",
    });
    const previewUrl = URL.createObjectURL(blob);
    setCapturedKind("video");
    setCapturedPreview(previewUrl);
    setCapturedFile(file);
  }, [clearRecordTimers]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || !recordingActiveRef.current) return;
    if (recorder.state === "recording" || recorder.state === "paused") {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || recordingActiveRef.current) return;

    if (typeof MediaRecorder === "undefined") {
      toast.error("Gravação de vídeo não suportada neste navegador.");
      return;
    }

    if (stream.getAudioTracks().length === 0) {
      toast.message("Gravando sem áudio — microfone indisponível.");
    }

    const mimeType = pickRecorderMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = createRecorder(stream, mimeType);
    } catch {
      toast.error("Não foi possível iniciar a gravação.");
      return;
    }

    chunksRef.current = [];
    recorderRef.current = recorder;
    recordingActiveRef.current = true;
    recordStartedAtRef.current = performance.now();
    setIsRecording(true);
    setRecordProgress(0);

    if (
      flashEnabledRef.current &&
      effectiveFacingRef.current === "user"
    ) {
      setScreenFlashActive(true);
    }

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const type = recorder.mimeType || mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type });
      chunksRef.current = [];
      finishRecording(blob, type);
    };

    recorder.onerror = () => {
      clearRecordTimers();
      recordingActiveRef.current = false;
      setIsRecording(false);
      setRecordProgress(0);
      setScreenFlashActive(false);
      toast.error("Erro ao gravar o vídeo.");
    };

    try {
      recorder.start(250);
    } catch {
      recordingActiveRef.current = false;
      setIsRecording(false);
      setScreenFlashActive(false);
      toast.error("Não foi possível iniciar a gravação.");
      return;
    }

    const tick = () => {
      if (!recordingActiveRef.current) return;
      const elapsed =
        (performance.now() - recordStartedAtRef.current) / 1000;
      const progress = Math.min(1, elapsed / MAX_VIDEO_SECONDS);
      setRecordProgress(progress);
      if (progress < 1) {
        progressRafRef.current = requestAnimationFrame(tick);
      }
    };
    progressRafRef.current = requestAnimationFrame(tick);

    maxTimerRef.current = setTimeout(() => {
      stopRecording();
    }, MAX_VIDEO_SECONDS * 1000);
  }, [clearRecordTimers, finishRecording, stopRecording]);

  const onShutterPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (!isReady || isLoading || capturedPreview) return;
      pointerDownRef.current = true;
      pointerStartYRef.current = e.clientY;
      lastClientYRef.current = e.clientY;
      zoomAtPointerStartRef.current = zoomRef.current;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

      holdTimerRef.current = setTimeout(() => {
        if (!pointerDownRef.current) return;
        // Rebase zoom gesture when REC starts
        zoomAtPointerStartRef.current = zoomRef.current;
        pointerStartYRef.current = lastClientYRef.current;
        startRecording();
      }, HOLD_TO_RECORD_MS);
    },
    [capturedPreview, isLoading, isReady, startRecording]
  );

  const onShutterPointerMove = useCallback(
    (e: React.PointerEvent) => {
      lastClientYRef.current = e.clientY;
      if (!pointerDownRef.current || !recordingActiveRef.current) return;
      if (!zoomSupportedRef.current) return;

      const deltaY = pointerStartYRef.current - e.clientY;
      const range = zoomMaxRef.current - zoomMinRef.current;
      const next =
        zoomAtPointerStartRef.current + (deltaY / ZOOM_DRAG_PX) * range;
      void applyZoomValue(next);
    },
    [applyZoomValue]
  );

  const onShutterPointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      pointerDownRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }

      if (holdTimerRef.current != null) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      if (recordingActiveRef.current) {
        stopRecording();
        return;
      }

      // Toque curto → foto
      if (isReady && !isLoading && !capturedPreview) {
        void capturePhoto();
      }
    },
    [capturePhoto, capturedPreview, isLoading, isReady, stopRecording]
  );

  const onShutterPointerCancel = useCallback(() => {
    pointerDownRef.current = false;
    if (holdTimerRef.current != null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (recordingActiveRef.current) {
      stopRecording();
    }
  }, [stopRecording]);

  const confirmCapture = useCallback(() => {
    if (capturedFile) {
      if (capturedPreview) URL.revokeObjectURL(capturedPreview);
      onCapture(capturedFile);
      setCapturedPreview(null);
      setCapturedFile(null);
      setCapturedKind("photo");
      setRecordProgress(0);
      closeWithFlashOff();
    }
  }, [capturedFile, capturedPreview, onCapture, closeWithFlashOff]);

  const retake = useCallback(() => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedPreview(null);
    setCapturedFile(null);
    setCapturedKind("photo");
    setRecordProgress(0);
  }, [capturedPreview]);

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    return () => {
      clearRecordTimers();
      stopStream();
    };
  }, [clearRecordTimers, stopStream]);

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
    effectiveFacingMode,
    flashEnabled,
    /** @deprecated use flashAvailable — mantido: torch no track */
    flashSupported: flashAvailable,
    flashAvailable,
    torchSupported,
    screenFlashActive,
    zoomSupported,
    zoom,
    zoomPresets,
    hasMultipleCameras,
    capturedPreview,
    capturedKind,
    capturedFile,
    isRecording,
    recordProgress,
    maxVideoSeconds: MAX_VIDEO_SECONDS,
    open,
    close: closeWithFlashOff,
    /** @deprecated use onShutter* — mantido para compat */
    capture: capturePhoto,
    confirmCapture,
    retake,
    switchCamera,
    switchFlash,
    setZoomPreset,
    setVideoRef,
    handleVideoCanPlay,
    onShutterPointerDown,
    onShutterPointerMove,
    onShutterPointerUp,
    onShutterPointerCancel,
    streamRef,
  };
}
