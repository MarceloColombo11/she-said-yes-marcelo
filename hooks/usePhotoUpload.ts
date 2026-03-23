"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  compressImage,
  fileToBase64,
  validateImageFile,
} from "@/lib/image-utils";

const UPLOAD_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_UPLOAD_URL
  ? "/api/upload-photo"
  : "";

export type UploadErrorType =
  | "no_file"
  | "not_configured"
  | "validation"
  | "network"
  | "server";

function getErrorMessage(type: UploadErrorType): string {
  switch (type) {
    case "no_file":
      return "Selecione uma imagem primeiro.";
    case "not_configured":
      return "Envio de fotos em breve. Volte em alguns dias!";
    case "validation":
      return "Imagem inválida. Tente outra.";
    case "network":
      return "Erro de conexão. Tente novamente.";
    case "server":
      return "Erro ao enviar. Tente novamente.";
    default:
      return "Ocorreu um erro. Tente novamente.";
  }
}

export function usePhotoUpload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<"idle" | "compressing" | "uploading">(
    "idle"
  );

  const upload = useCallback(
    async (file: File, onSuccess?: () => void) => {
      if (!file) {
        toast.error(getErrorMessage("no_file"));
        return false;
      }

      if (!UPLOAD_URL) {
        toast.error(getErrorMessage("not_configured"));
        return false;
      }

      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return false;
      }

      setLoading(true);
      setProgress("compressing");

      try {
        const compressed = await compressImage(file);
        setProgress("uploading");

        const base64 = await fileToBase64(compressed);

        const response = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: base64,
            filename: compressed.name,
          }),
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result?.success !== false) {
          toast.success("Foto enviada com sucesso! Obrigado por compartilhar.");
          onSuccess?.();
          return true;
        }

        toast.error(result?.error || getErrorMessage("server"));
        return false;
      } catch (err) {
        const isNetwork =
          err instanceof TypeError ||
          (err instanceof Error && err.message?.toLowerCase().includes("fetch"));
        toast.error(
          isNetwork ? getErrorMessage("network") : getErrorMessage("validation")
        );
        return false;
      } finally {
        setLoading(false);
        setProgress("idle");
      }
    },
    []
  );

  return { upload, loading, progress };
}
