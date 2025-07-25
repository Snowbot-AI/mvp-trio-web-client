// Type issu du contrat d'interface fourni
export type StatusDemande =
  | "EN_ATTENTE_VALIDATION"
  | "VALIDE"
  | "REJETE"
  | "EN_ATTENTE_DE_PLUS_D_INFO"

export interface Demande {
  id: string;
  name: string;
  date: string;
  deliveryDate: string | null;
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
    isBudgeted: boolean;
    budgetIds?: string;
    gi: boolean;
    ger: boolean;
    invest: boolean;
    funct: boolean;
    referenceDevis?: string;
    quantity: number;
    unitPrice: number;
    price: number;
  }>;
  total: {
    orderTotal: number;
    participationLivraison?: number;
    fraisFacturation?: number;
    other?: number;
    total: number;
  };
  status: StatusDemande;
  comment: string;
  signatureDemandeur: boolean;
  validationResponsable: boolean;
  files: {
    quotations: Array<{
      id: string;
      name: string;
      timestamp: string;
    }>;
    bills: Array<{
      id: string;
      name: string;
      timestamp: string;
    }>;
  };
} 