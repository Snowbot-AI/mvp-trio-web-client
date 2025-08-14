import { z } from 'zod'

// Schéma pour les articles
const itemSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  service: z.string().min(1, "Le service est requis"),
  budgetType: z.string().regex(/^(?:[Bb]\d{1,4}|[Hh])$/, "Le type de budget doit être 'H' ou correspondre au format 'B29', 'B105', etc."),
  itemType: z.string().nullable().optional(),
  referenceDevis: z.string().optional(),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  price: z.number().min(0, "Le prix doit être positif"),
  totalPriceConsistent: z.boolean().optional()
})

// Schéma pour les fichiers
const fileSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  uploadInstant: z.string(),
  file: z.instanceof(File).optional()
})

// Schéma pour les totaux
const totalSchema = z.object({
  orderTotal: z.number().min(0, "Le total de commande doit être positif"),
  deliveryTotal: z.number().min(0).optional(),
  billingFees: z.number().min(0).optional(),
  participationLivraison: z.number().min(0).optional(),
  fraisFacturation: z.number().min(0).optional(),
  other: z.number().min(0).optional(),
  total: z.number().min(0, "Le total doit être positif"),
  totalCorrect: z.boolean().optional()
})

// Schéma pour la facturation
const billingSchema = z.object({
  name: z.string().min(1, "Le nom de facturation est requis"),
  address: z.string().min(1, "L'adresse de facturation est requise"),
  emails: z.array(
    z.email("Format d'email invalide")
  ).min(1, "Au moins un email est requis"),
  siret: z.string().regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres")
})

// Schéma pour la livraison
const deliverySchema = z.object({
  address: z.string().min(1, "L'adresse de livraison est requise"),
  tel: z.string().regex(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    "Format de téléphone invalide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78)"
  )
})

// Schéma pour le fournisseur
const providerSchema = z.object({
  name: z.string().min(1, "Le nom du fournisseur est requis"),
  address: z.string().min(1, "L'adresse du fournisseur est requise"),
  tel: z.string().regex(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    "Format de téléphone invalide"
  ).nullable().optional(),
  email: z.email("Format d'email invalide").nullable().optional()
})

// Schéma principal pour la demande (plus permissif pour la compatibilité)
export const demandeSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  date: z.string().min(1, "La date est requise"),
  deliveryDate: z.string().nullable().optional(),
  from: z.string().min(1, "Le demandeur est requis"),
  billing: billingSchema,
  delivery: deliverySchema,
  priority: z.string().refine((val) => val === "HIGH" || val === "LOW", {
    message: "La priorité doit être HIGH ou LOW"
  }),
  provider: providerSchema,
  items: z.array(itemSchema).min(1, "Au moins un article est requis"),
  total: totalSchema,
  status: z.string().refine((val) => [
    "EN_ATTENTE_VALIDATION",
    "VALIDE",
    "VALIDEE",
    "REJETE",
    "EN_ATTENTE_DE_PLUS_D_INFO",
    "BROUILLON"
  ].includes(val), {
    message: "Statut invalide"
  }),
  comment: z.string().optional(),
  signatureDemandeur: z.boolean().optional(),
  validationResponsable: z.boolean().optional(),
  files: z.array(fileSchema).optional()
})

// Type généré automatiquement à partir du schéma
export type DemandeSchema = z.infer<typeof demandeSchema>

// Schéma pour la validation en temps réel (plus permissif)
export const demandePartialSchema = demandeSchema.partial()

// Fonction utilitaire pour valider un téléphone français
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return phoneRegex.test(phone)
}

// Fonction utilitaire pour valider un email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Messages d'erreur personnalisés en français
export const errorMessages = {
  required: "Ce champ est requis",
  invalidEmail: "Format d'email invalide",
  invalidPhone: "Format de téléphone invalide (ex: 06 12 34 56 78)",
  invalidSiret: "Le SIRET doit contenir 14 chiffres",
  minQuantity: "La quantité doit être supérieure à 0",
  minPrice: "Le prix doit être positif",
  minTotal: "Le total doit être positif"
} 