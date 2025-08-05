"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, FileText, User } from "lucide-react"

export default function Header() {
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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-200">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 