import { z } from "zod"
import { ItemType, PurchaseRequestStatus, CodeStation } from "./types"

// Schéma pour un article
const ItemSchema = z.object({
  description: z.string().min(1, "La désignation est requise"),
  service: z.string().min(1, "Le service est requis"),
  budgetType: z.string().regex(/^(B\d{1,4}|H)$/, "Le type de budget doit être 'H' ou correspondre au format 'B29', 'B105', etc."),
  itemType: z.nativeEnum(ItemType).optional().nullable(),
  referenceDevis: z.string().optional(),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  price: z.number().min(0, "Le prix doit être positif"),
  totalPriceConsistent: z.boolean().optional(),
})

// Schéma pour les informations de facturation
const BillingSchema = z.object({
  name: z.string().min(1, "Le nom de facturation est requis").nullable(),
  siret: z.string().regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres"),
  address: z.string().min(1, "L'adresse de facturation est requise"),
  emails: z.array(z.string().email("Format d'email invalide")).min(1, "Au moins un email est requis"),
})

// Schéma pour les informations du fournisseur
const ProviderSchema = z.object({
  name: z.string().min(1, "Le nom du fournisseur est requis"),
  address: z.string().min(1, "L'adresse du fournisseur est requise"),
  email: z.string().email("Format d'email invalide").nullable(),
  tel: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide").nullable(),
})

// Schéma pour les informations de livraison
const DeliverySchema = z.object({
  address: z.string().min(1, "L'adresse de livraison est requise"),
  tel: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide"),
})

// Schéma pour les fichiers
const FileSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  category: z.string(),
  uploadInstant: z.string(),
})

// Schéma pour les totaux
const TotalSchema = z.object({
  orderTotal: z.number(),
  deliveryTotal: z.number().optional(),
  billingFees: z.number().optional(),
  participationLivraison: z.number().optional(),
  fraisFacturation: z.number().optional(),
  other: z.number().optional(),
  total: z.number(),
  totalCorrect: z.boolean().optional(),
})

// Schéma principal pour une demande
export const DemandeSchema = z.object({
  id: z.string().optional(),
  from: z.string().min(1, "Le demandeur est requis"),
  description: z.string().optional().nullable(),
  date: z.string(),
  deliveryDate: z.string().optional().nullable(),
  priority: z.enum(["LOW", "HIGH"]),
  status: z.enum(PurchaseRequestStatus),
  codeStation: z.enum(CodeStation),
  items: z.array(ItemSchema).min(1, "Au moins un article est requis"),
  billing: BillingSchema,
  provider: ProviderSchema,
  delivery: DeliverySchema,
  total: TotalSchema,
  files: z.array(FileSchema).optional(),
  comment: z.string().optional(),
  signatureDemandeur: z.boolean().optional(),
  validationResponsable: z.boolean().optional(),
})

// Type TypeScript dérivé du schéma
export type DemandeFormData = z.infer<typeof DemandeSchema>

// Fonction utilitaire pour valider une demande
export const validateDemande = (data: unknown) => {
  return DemandeSchema.safeParse(data)
} 