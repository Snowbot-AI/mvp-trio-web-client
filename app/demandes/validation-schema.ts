import { z } from "zod";
import { ItemType, PurchaseRequestStatus, CodeStation } from "./types";

// Schéma pour un article
const ItemSchema = z.object({
  description: z.string().min(1, "La désignation est requise"),
  service: z.string().min(1, "Le service est requis"),
  budgetType: z.string().regex(/^(?:[Bb]\d{1,4}|[Hh])$/, "Le type de budget doit être 'H' ou correspondre au format 'B29', 'B105', etc."),
  itemType: z.enum(ItemType).optional().nullable(),
  // Autoriser chaîne vide -> undefined sans passer l'input en unknown
  referenceDevis: z
    .union([z.string().trim(), z.undefined(), z.null()])
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  price: z.number().min(0, "Le prix doit être positif"),
  totalPriceConsistent: z.boolean().optional(),
});

// Schéma pour les informations de facturation
const BillingSchema = z.object({
  name: z.string().min(1, "Le nom de facturation est requis"),
  siret: z.string().regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres"),
  address: z.string().min(1, "L'adresse de facturation est requise"),
  // Autoriser chaînes vides dans les emails optionnels -> null sans unknown
  emails: z
    .array(
      z
        .string()
        .trim()
        .transform((s) => (s === "" ? null : s))
        .pipe(z.string().email("Format d'email invalide"))
    )
    .refine((arr) => arr.some((v) => typeof v === "string" && v.length > 0), {
      message: "Au moins un email est requis",
    }),
  // Commentaire de facturation optionnel
  comment: z.string().optional().nullable(),
});

// Schéma pour les informations du fournisseur
const ProviderSchema = z.object({
  name: z.string().min(1, "Le nom du fournisseur est requis"),
  address: z.string().min(1, "L'adresse du fournisseur est requise"),
  // Autoriser chaîne vide -> undefined et valider sinon
  email: z
    .union([z.string().trim().email("Format d'email invalide"), z.literal(""), z.null()])
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  // Autoriser chaîne vide -> undefined et valider sinon
  tel: z
    .union([
      z
        .string()
        .trim()
        .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide"),
      z.literal(""),
      z.null(),
    ])
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
});

// Schéma pour les informations de livraison
const DeliverySchema = z.object({
  address: z.string().min(1, "L'adresse de livraison est requise"),
  // Autoriser chaîne vide -> invalide? Ici tel est requis côté livraison, donc on garde requis
  tel: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide"),
  // Champ commentaire optionnel
  comment: z.string().optional().nullable(),
});

// Schéma pour les fichiers
const FileSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  category: z.string(),
  uploadInstant: z.string(),
});

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
});

const CommentSchema = z.object({
  userId: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

// Schéma principal pour une demande
export const DemandeSchema = z.object({
  id: z.string().optional(),
  from: z.string().min(1, "Le demandeur est requis"),
  description: z.string().min(1, "La description est requise"),
  date: z.string(),
  // Accepter "", null, undefined → convertir "" en null pour rester optionnel/nullable
  deliveryDate: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v === "" ? null : v))
    .optional()
    .nullable(),
  priority: z.enum(["LOW", "HIGH"]),
  status: z.enum(PurchaseRequestStatus),
  codeStation: z.enum(CodeStation),
  // Les articles doivent être valides; on évite preprocess pour conserver des types d'entrée précis
  items: z.array(ItemSchema).min(1, "Au moins un article est requis"),
  billing: BillingSchema,
  provider: ProviderSchema,
  delivery: DeliverySchema,
  total: TotalSchema,
  files: z.array(FileSchema).optional(),
  comment: z.string().optional().nullable(),
  comments: z.array(CommentSchema).optional(),
  signatureDemandeur: z.boolean().optional(),
  validationResponsable: z.boolean().optional(),
});

// Type TypeScript dérivé du schéma
export type DemandeFormData = z.infer<typeof DemandeSchema>;

// Fonction utilitaire pour valider une demande
export const validateDemande = (data: unknown) => {
  return DemandeSchema.safeParse(data);
};
