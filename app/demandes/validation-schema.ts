import { z } from 'zod'

// Schéma de validation partiel pour les champs critiques (compatible avec le type Demande)
export const demandeValidationSchema = z.object({
  // Champs obligatoires
  from: z.string().min(1, "Le demandeur est requis").optional(),
  date: z.string().min(1, "La date est requise").optional(),
  description: z.string().optional(),
  // Facturation
  billing: z.object({
    name: z.string().min(1, "Le nom de facturation est requis").optional(),
    address: z.string().min(1, "L'adresse de facturation est requise").optional(),
    emails: z.array(z.string().email("Format d'email invalide")).min(1, "Au moins un email est requis").optional(),
    siret: z.string().regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres").optional()
  }).optional(),

  // Livraison
  delivery: z.object({
    address: z.string().min(1, "L'adresse de livraison est requise").optional(),
    tel: z.string().regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      "Format de téléphone invalide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78)"
    ).optional()
  }).optional(),

  // Fournisseur
  provider: z.object({
    name: z.string().min(1, "Le nom du fournisseur est requis").optional(),
    address: z.string().min(1, "L'adresse du fournisseur est requise").optional(),
    tel: z.string().regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      "Format de téléphone invalide"
    ).nullable().optional(),
    email: z.string().email("Format d'email invalide").nullable().optional()
  }).optional(),

  // Articles
  items: z.array(z.object({
    description: z.string().min(1, "La description est requise").optional(),
    service: z.string().min(1, "Le service est requis"),
    quantity: z.number().min(1, "La quantité doit être supérieure à 0").optional(),
    unitPrice: z.number().min(0, "Le prix unitaire doit être positif").optional(),
    price: z.number().min(0, "Le prix doit être positif").optional()
  })).min(1, "Au moins un article est requis").optional(),

  // Totaux
  total: z.object({
    orderTotal: z.number().min(0, "Le total de commande doit être positif").optional(),
    total: z.number().min(0, "Le total doit être positif").optional()
  }).optional()
})

// Type pour la validation partielle
export type DemandeValidation = z.infer<typeof demandeValidationSchema>

// Fonction utilitaire pour valider une demande
export const validateDemande = (data: any) => {
  return demandeValidationSchema.safeParse(data)
}

// Messages d'erreur personnalisés
export const errorMessages = {
  required: "Ce champ est requis",
  invalidEmail: "Format d'email invalide",
  invalidPhone: "Format de téléphone invalide (ex: 06 12 34 56 78)",
  invalidSiret: "Le SIRET doit contenir 14 chiffres",
  minQuantity: "La quantité doit être supérieure à 0",
  minPrice: "Le prix doit être positif",
  minTotal: "Le total doit être positif"
} 