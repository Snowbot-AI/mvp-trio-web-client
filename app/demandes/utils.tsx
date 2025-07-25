import React from "react"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

export const getIconeStatut = (statut: string): React.ReactNode => {
  switch (statut) {
    case "approuve":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "rejete":
      return <XCircle className="h-5 w-5 text-red-600" />
    case "en-cours-examen":
      return <Clock className="h-5 w-5 text-blue-600" />
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }
}

export const getCouleurStatut = (statut: string) => {
  switch (statut) {
    case "approuve":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejete":
      return "bg-red-100 text-red-800 border-red-200"
    case "en-cours-examen":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }
}

export const getCouleurPriorite = (priorite: string) => {
  switch (priorite) {
    case "urgente":
      return "bg-red-100 text-red-800 border-red-200"
    case "elevee":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "moyenne":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const getLibelleStatut = (statut: string) => {
  switch (statut) {
    case "en-attente":
      return "En attente"
    case "approuve":
      return "Approuvé"
    case "rejete":
      return "Rejeté"
    case "en-cours-examen":
      return "En cours d'examen"
    default:
      return statut
  }
}

export const getLibellePriorite = (priorite: string) => {
  switch (priorite) {
    case "faible":
      return "Faible"
    case "moyenne":
      return "Moyenne"
    case "elevee":
      return "Élevée"
    case "urgente":
      return "Urgente"
    default:
      return priorite
  }
}

export const formatTailleFichier = (taille: number) => {
  if (taille < 1024) return `${taille} B`
  if (taille < 1024 * 1024) return `${(taille / 1024).toFixed(1)} KB`
  return `${(taille / (1024 * 1024)).toFixed(1)} MB`
}

export function setNestedField(obj: any, path: string, value: any) {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const deep = keys.reduce((acc: any, key) => acc[key], obj)
  deep[lastKey] = value
  return { ...obj }
} 