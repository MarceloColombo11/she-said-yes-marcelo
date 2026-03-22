"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UPLOAD_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_UPLOAD_URL || "";

export function PhotoUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const resetForm = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const handleFile = useCallback((f: File | null) => {
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem.");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Selecione uma imagem primeiro.");
      return;
    }

    if (!UPLOAD_URL) {
      toast.error("Envio de fotos em breve. Volte em alguns dias!");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] || "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok && result?.success !== false) {
        toast.success("Foto enviada com sucesso! Obrigado por compartilhar.");
        resetForm();
      } else {
        toast.error("Erro ao enviar. Tente novamente.");
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-4xl font-semibold text-brown">
          Suba sua Foto
        </h2>
        <p className="mt-4 text-olive">
          Compartilhe seus momentos conosco! Envie suas fotos do casamento.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-olive/20 bg-white p-6 shadow-sm">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            dragActive ? "border-sage bg-sage/10" : "border-olive/30 bg-cream/50"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            id="photo-upload"
            disabled={loading}
          />
          {preview ? (
            <div className="relative p-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2 rounded-full bg-white shadow"
                onClick={resetForm}
                disabled={loading}
                aria-label="Remover imagem"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="photo-upload"
              className="flex cursor-pointer flex-col items-center gap-2 p-6"
            >
              <Upload className="size-12 text-olive/60" />
              <span className="text-sm font-medium text-olive">
                Arraste uma imagem ou clique para selecionar
              </span>
            </label>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Foto"
          )}
        </Button>
      </div>
    </div>
  );
}
