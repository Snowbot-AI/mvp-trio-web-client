// Type issu du contrat d'interface fourni

/**
 * Enum des services Trio
 */
export enum TrioService {
  /**
   * ACC for 'Accueil'.
   */
  ACC = "ACC",

  /**
   * ADM for 'Admin'.
   */
  ADM = "ADM",

  /**
   * BAT for 'Bâtiment'.
   */
  BAT = "BAT",

  /**
   * BIL for 'Billetterie'.
   */
  BIL = "BIL",

  /**
   * COM for 'Communication commerciale'.
   */
  COM = "COM",

  /**
   * DAM for 'Dammage'.
   */
  DAM = "DAM",

  /**
   * PAR for 'Parc de roulage'.
   */
  PAR = "PAR",

  /**
   * PIS for 'Pistes'.
   */
  PIS = "PIS",

  /**
   * REST for 'Restaurant'.
   */
  REST = "REST",

  /**
   * RM for 'Remontée mécanique'.
   */
  RM = "RM",

  /**
   * USI for 'Snowmaker' (Usine à neige).
   */
  USI = "USI",

  /**
   * AUT for 'Autre'.
   */
  AUT = "AUT"
}

/**
 * Enum des codes de station Trio
 */
export enum CodeResort {
  /**
   * 00 for 'Siège'.
   */
  CODE_00 = "00",

  /**
   * 06 for 'Cambre'.
   */
  CODE_06 = "06",

  /**
   * 07 for 'Porté-Puymorens'.
   */
  CODE_07 = "07",

  /**
   * 08 for 'Formiguères'.
   */
  CODE_08 = "08",

  /**
   * 999 for 'Restauration' - to be determined
   */
  CODE_999 = "999"
}

/**
 * Convertit un code de station en nom de station
 * @param code - Le code de la station (ex: "00", "06", etc.)
 * @returns Le nom de la station correspondante
 */
export function getStationName(code: string): string {
  switch (code) {
    case CodeResort.CODE_00:
      return "Siège"
    case CodeResort.CODE_06:
      return "Cambre d'Az"
    case CodeResort.CODE_07:
      return "Porté-Puymorens"
    case CodeResort.CODE_08:
      return "Formiguères"
    case CodeResort.CODE_999:
      return "Restauration"
    default:
      return "Station inconnue"
  }
}



/**
 * Enum des statuts de demande d'achat
 */
export enum PurchaseRequestStatus {
  /** The request is in a draft state. No validation has been applied yet. */
  BROUILLON = "BROUILLON",

  /** The request has been submitted and is pending review by the director. */
  A_VERIFIER = "A_VERIFIER",

  /** The request was reviewed and returned for modification by the director. The station manager must revise it. */
  A_MODIFIER = "A_MODIFIER",

  /** The request has been approved and validated. */
  VALIDEE = "VALIDEE",

  /** The request has been rejected following a review. */
  REJETEE = "REJETEE",

  /** The request has been exported for accounting, and relevant documents have been archived. */
  EXPORTEE = "EXPORTEE"
}

export type StatusDemande = PurchaseRequestStatus

export interface Demande {
  id: string;
  name: string | null;
  date: string;
  deliveryDate: string | null;
  description: string | null;
  code: string;
  from: string;
  billing: {
    name: string;
    address: string;
    emails: string[];
    siret: string;
  };
  delivery: {
    address: string;
    tel: string;
  };
  priority: "HIGH" | "LOW";
  provider: {
    name: string;
    address: string;
    tel: string | null;
    email: string | null;
  };
  items: Array<{
    description: string;
    service: string;
    budgetType: string;
    itemType?: string | null;
    referenceDevis?: string;
    quantity: number;
    unitPrice: number;
    price: number;
    totalPriceConsistent?: boolean;
  }>;
  total: {
    orderTotal: number;
    deliveryTotal?: number;
    billingFees?: number;
    participationLivraison?: number;
    fraisFacturation?: number;
    other?: number;
    total: number;
    totalCorrect?: boolean;
  };
  status: StatusDemande;
  comment?: string;
  signatureDemandeur?: boolean;
  validationResponsable?: boolean;
  files: Array<{
    id: string;
    name: string;
    category: string;
    uploadInstant: string;
    file?: File; // Fichier réel pour l'upload
  }>;
} 