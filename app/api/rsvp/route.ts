import { NextResponse } from "next/server";
import { getClientIp, isAllowedOrigin } from "@/lib/request-origin";
import { isRsvpRateLimited } from "@/lib/rsvp-rate-limit";
import { applyPublicRsvp } from "@/lib/content/guests";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const COMPANION_MAX = 120;
const MESSAGE_MAX = 1000;
const RETRY_LATER = "Tente de novo em instantes.";

class InputError extends Error {}

function optionalText(value: unknown, label: string, max: number): string | null {
  if (value == null) return null;
  if (typeof value !== "string") throw new InputError(`${label} inválido.`);
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  if (trimmed.length > max) {
    throw new InputError(`${label} pode ter no máximo ${max} caracteres.`);
  }
  return trimmed;
}

function parseBody(body: Record<string, unknown>) {
  if (body.presenca !== "vou" && body.presenca !== "nao_vou") {
    throw new InputError("Escolha se você vai ou não vai.");
  }
  const attending = body.presenca === "vou";

  let microonibus: boolean | null = null;
  if (attending) {
    if (body.microonibus !== "sim" && body.microonibus !== "nao") {
      throw new InputError("Por favor, informe se deseja microônibus.");
    }
    microonibus = body.microonibus === "sim";
  }

  return {
    name: typeof body.nome === "string" ? body.nome : "",
    guestId: typeof body.guestId === "string" ? body.guestId : null,
    attending,
    companionName: attending
      ? optionalText(body.nomeAcompanhante, "Nome do acompanhante", COMPANION_MAX)
      : null,
    microonibus,
    message: optionalText(body.mensagem, "Recado", MESSAGE_MAX),
  };
}

function isNameError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.message.startsWith("Informe") ||
      error.message.startsWith("Preencha") ||
      error.message.includes("máximo"))
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRsvpRateLimited(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: "Muitas tentativas. Aguarde um minuto e tente novamente.",
      },
      { status: 429 },
    );
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { success: false, error: "Origem não permitida." },
      { status: 403 },
    );
  }

  if (!getDb()) {
    return NextResponse.json(
      { success: false, error: RETRY_LATER },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    await applyPublicRsvp(parseBody(body ?? {}));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof InputError || isNameError(error)) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    console.error("[rsvp]", error);
    return NextResponse.json(
      { success: false, error: RETRY_LATER },
      { status: 503 },
    );
  }
}
