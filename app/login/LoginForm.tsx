// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { useQueryClient } from "@/app/providers";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryClient = useQueryClient();
  const redirect = searchParams.get("redirect") || "/demandes";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // IMPORTANT: Invalider tout le cache TanStack Query avant de naviguer
        queryClient.clear();

        toast.success(`Bienvenue ${data.user.email}`);

        // Navigation puis refresh pour forcer le rechargement
        router.push(redirect);

        // Petit délai pour s'assurer que la navigation est faite avant le refresh
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        const error = await response.json();
        toast.error(error.error || "Identifiants invalides");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <Image src="/logoTrioBlanc.png" alt="Logo Trio" fill className="object-contain brightness-0" priority />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center mb-6">Connexion</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@site.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
