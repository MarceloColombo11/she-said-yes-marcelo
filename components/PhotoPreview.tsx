"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PhotoPreviewProps = {
  preview: string;
  fileName: string;
  fileSize: number;
  onRemove: () => void;
  disabled?: boolean;
};

export function PhotoPreview({
  preview,
  fileName,
  fileSize,
  onRemove,
  disabled = false,
}: PhotoPreviewProps) {
  return (
    <div className="relative p-4">
      <img
        src={preview}
        alt="Preview da foto"
        className="max-h-48 rounded-lg object-contain"
      />
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-olive/70">
        <span className="truncate" title={fileName}>
          {fileName}
        </span>
        <span className="shrink-0">{formatFileSize(fileSize)}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-2 -top-2 rounded-full bg-white shadow"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remover imagem"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
