"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return
      }
      if (menuOpen && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [menuOpen])

  return (
    <header className="bg-gray-100 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Section gauche vide pour équilibrer */}
          <div className="w-16"></div>

          {/* Logo centré */}
          <Link href="/" className="flex items-center">
            <div className="relative w-16 h-16">
              <Image
                src="/logoTrioBlanc.png"
                alt="Logo Trio"
                fill
                className="object-contain brightness-0"
                priority
              />
            </div>
          </Link>

          {/* Actions côté droit */}
          <div className="flex items-center space-x-4" ref={menuRef}>
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
                  className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg focus:outline-hidden z-50"
                >
                  <div className="py-1" role="none">
                    <Link
                      href="/auth/qr"
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      Afficher le QR code
                    </Link>
                    <Link
                      href="/api/auth/logout?redirect=/"
                      prefetch={false}
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      Se déconnecter
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}