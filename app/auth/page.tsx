// app/auth/page.tsx
"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [token, setToken] = useState<string>("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = `/api/auth/login?token=${encodeURIComponent(token)}&redirect=/`;
    window.location.href = url;
  };

  return (
    <main className="mx-auto my-16 w-full max-w-md px-4">
      <h1 className="mb-6 text-2xl font-semibold">Connexion</h1>
      <form onSubmit={onSubmit} className="grid gap-4" aria-label="Connexion">
        <div className="grid gap-2">
          <Label htmlFor="token">Token</Label>
          <Input
            id="token"
            name="token"
            placeholder="Entrez votre token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            aria-required="true"
            autoComplete="off"
          />
        </div>
        <Button type="submit" className="w-full">
          Se connecter
        </Button>
      </form>
    </main>
  );
}
