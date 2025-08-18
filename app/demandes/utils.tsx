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

// Traduction des chemins de champs (ex: items.0.description -> articles > [1] > désignation)
export const translateFieldPath = (segments: Array<string | number>): string => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return "champ"
  }

  const rootTranslations: Record<string, string> = {
    from: "demandeur",
    description: "description",
    date: "date",
    deliveryDate: "date de livraison",
    priority: "priorité",
    status: "statut",
    codeStation: "station",
    comment: "commentaire",
    files: "fichiers",
    items: "articles",
    billing: "facturation",
    provider: "fournisseur",
    delivery: "livraison",
    total: "totaux",
    signatureDemandeur: "signature du demandeur",
    validationResponsable: "validation du responsable",
  }

  const nestedTranslations: Record<string, Record<string, string>> = {
    items: {
      description: "désignation",
      service: "service",
      budgetType: "type de budget",
      itemType: "type d'article",
      referenceDevis: "référence devis",
      quantity: "quantité",
      unitPrice: "prix unitaire",
      price: "montant",
    },
    billing: {
      name: "nom de facturation",
      siret: "SIRET",
      address: "adresse de facturation",
      emails: "email de facturation",
      comment: "commentaire de facturation",
    },
    provider: {
      name: "nom du fournisseur",
      address: "adresse du fournisseur",
      email: "email du fournisseur",
      tel: "téléphone du fournisseur",
    },
    delivery: {
      address: "adresse de livraison",
      tel: "téléphone de livraison",
      comment: "commentaire de livraison",
    },
    total: {
      orderTotal: "total commande HT",
      deliveryTotal: "participation livraison",
      billingFees: "frais de facturation",
      participationLivraison: "participation livraison",
      fraisFacturation: "frais de facturation",
      other: "autres frais",
      total: "total HT",
    },
  }

  const parts: string[] = []
  let lastContainer: string | null = null

  for (let i = 0; i < segments.length; i += 1) {
    const raw = segments[i]
    const seg = typeof raw === 'number' || /^\d+$/.test(String(raw)) ? Number(raw) : String(raw)

    if (typeof seg === 'number') {
      // Indice de tableau -> format [n] en 1-based
      parts.push(`[${seg + 1}]`)
      continue
    }

    const isContainer = ["items", "billing", "provider", "delivery", "total"].includes(seg)
    const translatedRoot = rootTranslations[seg] || seg

    if (isContainer) {
      parts.push(translatedRoot)
      lastContainer = seg
      continue
    }

    if (lastContainer && nestedTranslations[lastContainer] && nestedTranslations[lastContainer][seg]) {
      parts.push(nestedTranslations[lastContainer][seg])
    } else if (rootTranslations[seg]) {
      parts.push(rootTranslations[seg])
    } else {
      // fallback: remplacer camelCase par mots séparés
      parts.push(seg.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase())
    }
  }

  return parts.join(' > ')
}