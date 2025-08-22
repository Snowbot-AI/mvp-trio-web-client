import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un nombre en prix français avec des espaces tous les 3 chiffres
 * @param amount - Le montant à formater
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns Le prix formaté en français (ex: "1 234,56 €")
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formate un nombre avec des espaces tous les 3 chiffres (sans symbole monétaire)
 * @param amount - Le montant à formater
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns Le nombre formaté en français (ex: "1 234,56")
 */
export function formatNumber(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}
