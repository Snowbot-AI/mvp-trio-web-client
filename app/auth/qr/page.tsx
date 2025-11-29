// app/auth/qr/page.tsx
import { headers } from "next/headers";
import QrDisplay from "@/app/auth/qr/QrDisplay";

async function buildAbsoluteUrl(pathWithQuery: string): Promise<string> {
  const hdrs = await headers();
  const forwardedProto = hdrs.get("x-forwarded-proto");
  const forwardedHost = hdrs.get("x-forwarded-host");
  const host = hdrs.get("host");

  const protocol = forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  const hostname = forwardedHost ?? host ?? "localhost:3000";

  const origin = `${protocol}://${hostname}`;
  const url = new URL(pathWithQuery, origin);
  return url.toString();
}

export default async function AuthQrPage() {
  const expected = process.env.AUTH_TOKEN;

  if (!expected || expected.length < 16) {
    return (
      <main className="mx-auto my-16 w-full max-w-2xl px-4">
        <h1 className="mb-2 text-2xl font-semibold">QR de connexion</h1>
        <p className="text-destructive">Configuration manquante: AUTH_TOKEN invalide.</p>
      </main>
    );
  }

  const loginUrl = await buildAbsoluteUrl(`/api/auth/login?token=${encodeURIComponent(expected)}&redirect=/`);

  return (
    <main className="mx-auto my-16 w-full max-w-2xl px-4">
      <h1 className="mb-6 text-2xl font-semibold">Lien de connexion</h1>
      <p className="mb-6 text-muted-foreground">Scanner ce QR code avec votre téléphone pour se connecter automatiquement.</p>
      <QrDisplay loginUrl={loginUrl} />
    </main>
  );
}
