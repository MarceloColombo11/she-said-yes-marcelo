export type Presenca = "vou" | "nao_vou";

export type RsvpForm = {
  nome: string;
  guestId: string | null;
  presenca: Presenca;
  email: string;
  nomeAcompanhante: string;
  microonibus: "" | "sim" | "nao";
  mensagem: string;
};

export function validateRsvpName(nome: string): string | null {
  const trimmed = nome.trim();
  if (!trimmed) return "Por favor, informe seu nome completo.";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "Por favor, informe nome e sobrenome.";
  return null;
}

export function validateRsvpEmail(email: string): string | null {
  if (!email.trim()) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? null
    : "Informe um e-mail válido.";
}

export async function submitRsvp(
  form: RsvpForm,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const vai = form.presenca === "vou";
  try {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome.trim(),
        guestId: form.guestId,
        presenca: form.presenca,
        email: form.email.trim() || null,
        nomeAcompanhante: vai ? form.nomeAcompanhante.trim() || null : null,
        microonibus: vai ? form.microonibus || null : null,
        mensagem: form.mensagem.trim() || null,
      }),
    });
    const result = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
    };
    if (response.ok && result.success !== false) return { ok: true };
    return { ok: false, error: result.error ?? "Erro ao confirmar. Tente novamente." };
  } catch {
    return {
      ok: false,
      error: "Erro de conexão. Verifique sua internet e tente novamente.",
    };
  }
}
