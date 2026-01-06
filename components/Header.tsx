// components/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@/app/providers"; // Importer le hook

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient(); // Accéder au QueryClient
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fonction pour charger les infos utilisateur
  const loadUserFromCookie = () => {
    const userCookie = document.cookie.split("; ").find((row) => row.startsWith("trio_user="));

    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user cookie", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // Charger les infos utilisateur au montage et lors des changements de route
  useEffect(() => {
    loadUserFromCookie();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (menuOpen && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setMenuOpen(false);
        setUser(null);

        // IMPORTANT: Invalider tout le cache TanStack Query
        queryClient.clear();

        toast.success("Déconnexion réussie");
        router.push("/login");
      } else {
        toast.error("Erreur lors de la déconnexion");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  // Fonction pour obtenir le variant du badge selon le rôle
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "VALIDEUR":
        return "default";
      case "DEMANDEUR":
        return "secondary";
      case "ADMIN":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <header className="bg-gray-100 border-b border-gray-200 shadow-sm relative z-[1000]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Section gauche - Affichage du rôle */}
          <div className="w-48 pl-4">
            {user && (
              <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium">
                {user.role}
              </Badge>
            )}
          </div>

          {/* Logo centré */}
          <Link href="/" className="flex items-center">
            <div className="relative w-16 h-16">
              <Image src="/logoTrioBlanc.png" alt="Logo Trio" fill className="object-contain brightness-0" priority />
            </div>
          </Link>

          {/* Actions côté droit */}
          <div className="flex items-center space-x-4 w-48 justify-end pr-4" ref={menuRef}>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:bg-gray-200"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls="account-menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <User className="h-4 w-4" />
                <span className="sr-only">Ouvrir le menu compte</span>
              </Button>

              {menuOpen && (
                <div
                  id="account-menu"
                  role="menu"
                  aria-label="Menu compte"
                  className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg focus:outline-hidden z-[9999]"
                >
                  <div className="py-1" role="none">
                    {user && (
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="mt-2 text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      role="menuitem"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
