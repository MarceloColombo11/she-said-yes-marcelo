"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/lib/image-utils";
import { toast } from "sonner";

type PhotoUploadZoneProps = {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
};

export function PhotoUploadZone({
  onFileSelect,
  disabled = false,
}: PhotoUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
    e.target.value = "";
  };

  return (
    <div
      className="flex min-h-[160px] flex-col items-center justify-center"
      role="region"
      aria-label="Área de upload de fotos da galeria"
    >
      <div className="flex flex-col items-center gap-4 p-6">
        <Upload className="size-10 text-olive/60" aria-hidden />
        <span className="text-center text-sm font-medium text-olive">
          Arraste uma imagem ou clique para selecionar
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
          aria-label="Selecionar foto da galeria"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="mr-2 size-4" />
          Escolher da galeria
        </Button>
      </div>
    </div>
  );
}
