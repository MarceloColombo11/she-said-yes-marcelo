/**
 * Utilitários para processamento de imagens no cliente.
 * Usa Canvas API nativa - sem dependências externas.
 */

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Valida se o arquivo é uma imagem aceita e não excede o tamanho máximo.
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Por favor, selecione apenas arquivos de imagem." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Arquivo muito grande. O máximo é ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Comprime e redimensiona a imagem para caber no limite da Vercel (4.5 MB).
 * Usa canvas para redimensionar e re-comprimir como JPEG.
 */
export async function compressImage(file: File): Promise<File> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas não disponível."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
      const outputFilename = `${baseName}-${Date.now()}.jpg`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Erro ao comprimir a imagem."));
            return;
          }
          resolve(new File([blob], outputFilename, { type: "image/jpeg" }));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível carregar a imagem."));
    };

    img.src = url;
  });
}

/**
 * Converte um File para base64 (apenas a parte dos dados, sem o prefixo data:).
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
