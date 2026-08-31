import { JWT, OAuth2Client } from "google-auth-library";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

/** Mensagem estável exposta ao cliente quando OAuth/SA falha. */
export const DRIVE_AUTH_UNAVAILABLE_MESSAGE =
  "Envio temporariamente indisponível. Tente mais tarde.";

export const DRIVE_AUTH_ERROR_CODE = "AUTH_UNAVAILABLE" as const;

export class DriveAuthError extends Error {
  readonly code = DRIVE_AUTH_ERROR_CODE;

  constructor(message = DRIVE_AUTH_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "DriveAuthError";
  }
}

/** Detecta invalid_grant e falhas de renovação de token sem vazar detalhes. */
export function isDriveAuthFailure(err: unknown): boolean {
  if (err instanceof DriveAuthError) return true;

  if (!err || typeof err !== "object") return false;

  const record = err as {
    message?: string;
    code?: string | number;
    response?: { data?: { error?: string } };
    cause?: { message?: string; code?: string | number };
  };

  const candidates = [
    record.message,
    record.cause?.message,
    typeof record.response?.data?.error === "string"
      ? record.response.data.error
      : undefined,
    typeof record.code === "string" ? record.code : undefined,
    typeof record.cause?.code === "string" ? record.cause.code : undefined,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    candidates.includes("invalid_grant") ||
    candidates.includes("invalid_client") ||
    candidates.includes("unauthorized_client") ||
    candidates.includes("token has been expired or revoked")
  );
}

/** Log seguro — nunca inclui refresh_token / client_secret. */
export function getSafeDriveErrorLog(err: unknown): {
  name?: string;
  message: string;
  status?: number;
  googleError?: string;
} {
  if (!(err instanceof Error) && (!err || typeof err !== "object")) {
    return { message: "Unknown error" };
  }

  const record = err as {
    name?: string;
    message?: string;
    status?: number;
    response?: { status?: number; data?: { error?: string } };
  };

  return {
    name: record.name ?? (err instanceof Error ? err.name : undefined),
    message:
      err instanceof DriveAuthError
        ? DRIVE_AUTH_UNAVAILABLE_MESSAGE
        : isDriveAuthFailure(err)
          ? "OAuth token refresh failed"
          : (record.message ?? (err instanceof Error ? err.message : "Error")).slice(
              0,
              200
            ),
    status: record.status ?? record.response?.status,
    googleError:
      typeof record.response?.data?.error === "string"
        ? record.response.data.error
        : undefined,
  };
}

/**
 * Preferência: OAuth da conta dona da pasta (Gmail pessoal).
 * Alternativa: Service Account só funciona em Shared Drive (Workspace),
 * pois SA não tem cota em My Drive.
 */
export function getDriveFolderId(): string | null {
  return process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || null;
}

export function hasOAuthConfig(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim() &&
      getDriveFolderId()
  );
}

export function hasServiceAccountConfig(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim() &&
      getDriveFolderId()
  );
}

export function isDriveUploadConfigured(): boolean {
  return hasOAuthConfig() || hasServiceAccountConfig();
}

export function getDriveAuthMode(): "oauth" | "service_account" | null {
  if (hasOAuthConfig()) return "oauth";
  if (hasServiceAccountConfig()) return "service_account";
  return null;
}

let cachedOAuth: OAuth2Client | null = null;
let cachedJwt: JWT | null = null;

function getOAuthClient(): OAuth2Client {
  if (cachedOAuth) return cachedOAuth;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!.trim();
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN!.trim();

  cachedOAuth = new OAuth2Client(clientId, clientSecret);
  cachedOAuth.setCredentials({ refresh_token: refreshToken });
  return cachedOAuth;
}

function getJwtClient(): JWT {
  if (cachedJwt) return cachedJwt;

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(
    /\\n/g,
    "\n"
  );

  cachedJwt = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [DRIVE_SCOPE],
  });
  return cachedJwt;
}

export async function getDriveAccessToken(): Promise<string> {
  const mode = getDriveAuthMode();
  if (!mode) {
    throw new Error("Drive upload não configurado");
  }

  try {
    if (mode === "oauth") {
      const client = getOAuthClient();
      const tokenResponse = await client.getAccessToken();
      const token =
        typeof tokenResponse === "string"
          ? tokenResponse
          : tokenResponse?.token;
      if (!token) {
        throw new DriveAuthError();
      }
      return token;
    }

    const client = getJwtClient();
    const tokenResponse = await client.getAccessToken();
    const token =
      typeof tokenResponse === "string"
        ? tokenResponse
        : tokenResponse?.token;

    if (!token) {
      throw new DriveAuthError();
    }

    return token;
  } catch (err) {
    if (err instanceof DriveAuthError) throw err;
    if (isDriveAuthFailure(err)) {
      throw new DriveAuthError();
    }
    throw err;
  }
}
