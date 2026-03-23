import { NextResponse } from "next/server";

const UPLOAD_URL =
  process.env.GOOGLE_APPS_SCRIPT_UPLOAD_URL ||
  process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_UPLOAD_URL ||
  "";

function parseGasResponse(text: string) {
  try {
    return JSON.parse(text) as { success?: boolean; error?: string; message?: string };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!UPLOAD_URL) {
    return NextResponse.json(
      { success: false, error: "Upload não configurado" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { file: base64, filename } = body;

    if (!base64) {
      return NextResponse.json(
        { success: false, error: "Arquivo não enviado" },
        { status: 400 }
      );
    }

    const fileName = filename || `foto-${Date.now()}.jpg`;

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: base64,
        fileName,
        mimeType: "image/jpeg",
      }),
      redirect: "follow",
    });

    const text = await response.text();
    const result = parseGasResponse(text);

    if (response.ok && result?.success !== false) {
      return NextResponse.json(result ?? { success: true });
    }

    const errorMessage =
      result?.error ??
      result?.message ??
      (response.status === 403
        ? "Acesso negado. Verifique se o script está implantado como 'Qualquer pessoa'."
        : response.status === 404
          ? "URL do script inválida. Verifique a implantação."
          : response.status >= 500
            ? "O script do Google está indisponível. Tente novamente em alguns minutos."
            : !result && text.trim().startsWith("<")
              ? "Resposta inválida do Google. Verifique a URL e a implantação do script."
              : "Erro no servidor. Tente novamente.");

    console.error("[upload-photo]", {
      status: response.status,
      error: errorMessage,
      bodyPreview: text.slice(0, 200),
    });

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: response.status >= 400 ? response.status : 502 }
    );
  } catch (err) {
    console.error("[upload-photo]", err);
    return NextResponse.json(
      { success: false, error: "Erro de conexão. Tente novamente." },
      { status: 500 }
    );
  }
}
