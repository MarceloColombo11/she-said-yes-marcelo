import { NextResponse } from "next/server";

const RSVP_URL = process.env.GOOGLE_APPS_SCRIPT_RSVP_URL ?? "";

function parseGasResponse(text: string) {
  try {
    return JSON.parse(text) as { success?: boolean; error?: string; message?: string };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!RSVP_URL) {
    return NextResponse.json(
      { success: false, error: "Confirmação de presença em breve. Volte em alguns dias!" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { nome, email, acompanhantes, restricoes } = body;

    const trimmedNome = typeof nome === "string" ? nome.trim() : "";
    if (!trimmedNome) {
      return NextResponse.json(
        { success: false, error: "Por favor, informe seu nome completo." },
        { status: 400 }
      );
    }

    const parts = trimmedNome.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return NextResponse.json(
        { success: false, error: "Por favor, informe nome e sobrenome." },
        { status: 400 }
      );
    }

    const trimmedEmail = typeof email === "string" ? email.trim() : null;
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { success: false, error: "Informe um e-mail válido." },
          { status: 400 }
        );
      }
    }

    const payload = {
      nome: trimmedNome,
      email: trimmedEmail || null,
      acompanhantes: typeof acompanhantes === "string" ? acompanhantes : "0",
      restricoes:
        typeof restricoes === "string" && restricoes.trim()
          ? restricoes.trim()
          : null,
    };

    const response = await fetch(RSVP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
        ? "Acesso negado. Verifique a configuração do script."
        : response.status >= 500
          ? "O serviço está temporariamente indisponível. Tente novamente em alguns minutos."
          : "Erro ao confirmar. Tente novamente.");

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: response.status >= 400 ? response.status : 502 }
    );
  } catch (err) {
    console.error("[rsvp]", err);
    return NextResponse.json(
      { success: false, error: "Erro de conexão. Verifique sua internet e tente novamente." },
      { status: 500 }
    );
  }
}
