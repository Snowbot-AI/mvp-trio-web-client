// lib/backend-client.ts
import https from "node:https";
import http from "node:http";
import fs from "node:fs";

/**
 * Configuration et utilitaires pour communiquer avec le backend Spring
 */

function normalizePem(value: string | undefined): string {
  return (value ?? "").replace(/\\n/g, "\n");
}

function readTextFileSafe(path: string): string {
  return fs.readFileSync(path, "utf8");
}

function readPemFromEnv(contentEnv: string | undefined, fileEnv: string | undefined): string | undefined {
  if (fileEnv && fileEnv.trim().length > 0) {
    const parts = fileEnv
      .split(/[,;]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const contents = parts.map((p) => readTextFileSafe(p));
    return contents.join("\n");
  }
  const norm = normalizePem(contentEnv);
  return norm.trim().length > 0 ? norm : undefined;
}

function getTlsOptions(hostname: string): https.AgentOptions {
  const env = process.env.ENV || "production";

  // En développement, désactiver la vérification des certificats
  if (env === "development") {
    console.log("[Backend Client] Mode développement - certificats TLS désactivés");
    return {
      rejectUnauthorized: false,
    };
  }

  // En production, utiliser mTLS
  const cert = readPemFromEnv(process.env.BACKEND_CLIENT_CERT, process.env.BACKEND_CLIENT_CERT_FILE);
  const key = readPemFromEnv(process.env.BACKEND_CLIENT_KEY, process.env.BACKEND_CLIENT_KEY_FILE);
  const ca = readPemFromEnv(process.env.BACKEND_CA_CERT, process.env.BACKEND_CA_CERT_FILE);
  const insecure = (process.env.BACKEND_TLS_INSECURE ?? "").toLowerCase() === "true";

  if (!cert || !key) {
    throw new Error("Missing mTLS client material in production: provide BACKEND_CLIENT_CERT & BACKEND_CLIENT_KEY");
  }

  const tls: https.AgentOptions = {
    cert,
    key,
    servername: hostname,
    rejectUnauthorized: !insecure,
  };

  if (ca) {
    tls.ca = ca;
  }

  return tls;
}

function getBackendBase(): URL {
  const base = process.env.BACK_URL;
  const env = process.env.ENV || "production";

  if (!base) {
    throw new Error("Missing BACK_URL environment variable");
  }

  const url = new URL(base);

  // En production, forcer HTTPS
  if (url.protocol !== "https:" && env === "production") {
    throw new Error("BACK_URL must start with https:// in production");
  }

  return url;
}

/**
 * Options pour une requête HTTP
 */
export interface BackendRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: Buffer | string | null;
  token?: string; // Bearer token optionnel
}

/**
 * Réponse HTTP texte
 */
export interface BackendTextResponse {
  status: number;
  bodyText: string;
  headers?: Record<string, string>;
}

/**
 * Réponse HTTP binaire
 */
export interface BackendBinaryResponse {
  status: number;
  bodyBuffer: Buffer;
  headers: Record<string, string>;
}

/**
 * Effectue une requête HTTP vers le backend avec support mTLS
 * Retourne une réponse texte
 */
export async function backendRequest(pathname: string, options: BackendRequestOptions): Promise<BackendTextResponse> {
  const base = getBackendBase();
  const hostname = base.hostname;
  const port = Number(base.port || (base.protocol === "https:" ? 443 : 80));
  const fullPath = `${base.pathname.replace(/\/?$/, "")}${pathname}`;
  const isHttps = base.protocol === "https:";

  // Préparer les headers
  const headers: Record<string, string> = { ...options.headers };

  // Ajouter le Bearer token si présent
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  // Choisir le module HTTP approprié
  const requestModule = isHttps ? https : http;
  const tlsOptions = isHttps ? getTlsOptions(hostname) : {};

  return new Promise((resolve, reject) => {
    const requestOptions = {
      host: hostname,
      port,
      method: options.method,
      path: fullPath,
      headers,
      ...(isHttps ? tlsOptions : {}),
    };

    const req = requestModule.request(requestOptions, (res) => {
      const chunks: Buffer[] = [];

      res.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      res.on("end", () => {
        const bodyText = Buffer.concat(chunks).toString("utf8");

        // Extraire les headers de réponse
        const responseHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(res.headers)) {
          if (key && value) {
            if (typeof value === "string") {
              responseHeaders[key.toLowerCase()] = value;
            } else if (Array.isArray(value) && value.length > 0) {
              responseHeaders[key.toLowerCase()] = value[0];
            }
          }
        }

        resolve({
          status: res.statusCode || 0,
          bodyText,
          headers: responseHeaders,
        });
      });
    });

    req.on("error", (err) => reject(err));

    // Écrire le body si présent
    if (options.body) {
      if (typeof options.body === "string") {
        req.write(options.body);
      } else {
        req.write(options.body);
      }
    }

    req.end();
  });
}

/**
 * Effectue une requête HTTP vers le backend avec support mTLS
 * Retourne une réponse binaire (pour les fichiers)
 */
export async function backendRequestBinary(pathname: string, options: BackendRequestOptions): Promise<BackendBinaryResponse> {
  const base = getBackendBase();
  const hostname = base.hostname;
  const port = Number(base.port || (base.protocol === "https:" ? 443 : 80));
  const fullPath = `${base.pathname.replace(/\/?$/, "")}${pathname}`;
  const isHttps = base.protocol === "https:";

  // Préparer les headers
  const headers: Record<string, string> = { ...options.headers };

  // Ajouter le Bearer token si présent
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  // Choisir le module HTTP approprié
  const requestModule = isHttps ? https : http;
  const tlsOptions = isHttps ? getTlsOptions(hostname) : {};

  return new Promise((resolve, reject) => {
    const requestOptions = {
      host: hostname,
      port,
      method: options.method,
      path: fullPath,
      headers,
      ...(isHttps ? tlsOptions : {}),
    };

    const req = requestModule.request(requestOptions, (res) => {
      const chunks: Buffer[] = [];

      res.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      res.on("end", () => {
        const bodyBuffer = Buffer.concat(chunks);

        // Extraire les headers de réponse
        const responseHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(res.headers)) {
          if (key && value) {
            if (typeof value === "string") {
              responseHeaders[key.toLowerCase()] = value;
            } else if (Array.isArray(value) && value.length > 0) {
              responseHeaders[key.toLowerCase()] = value[0];
            }
          }
        }

        resolve({
          status: res.statusCode || 0,
          bodyBuffer,
          headers: responseHeaders,
        });
      });
    });

    req.on("error", (err) => reject(err));

    // Écrire le body si présent
    if (options.body) {
      if (typeof options.body === "string") {
        req.write(options.body);
      } else {
        req.write(options.body);
      }
    }

    req.end();
  });
}

/**
 * Helper pour extraire le token d'authentification des cookies Next.js
 */
export function getAuthTokenFromRequest(req: Request): string | undefined {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith("trio_auth_token="));

  if (!authCookie) return undefined;

  return authCookie.split("=")[1];
}
