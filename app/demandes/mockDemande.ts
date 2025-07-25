import type { Demande } from "./types";

export const mockDemande: Demande = {
  id: "64e8f31d1234567890abcdef",
  name: "2025-04-29-06-PISTES-POINTP",
  date: "2025-04-29",
  deliveryDate: null,
  from: "DUPONT",
  billing: {
    name: "SPL Trio-Pyrénées",
    address: "Site Cambre d’Aze, 66210 Saint-Pierre des Forcats",
    emails: [
      "cambre-d-aze@trio-pyrenees.fr",
      "contact@trio-pyrenees.fr"
    ],
    siret: "91372787100034"
  },
  delivery: {
    address: "Station de ski de Saint-Pierre, 66210 Saint-Pierre des Forcats",
    tel: "06 11 22 33 44"
  },
  priority: "HIGH",
  provider: {
    name: "POINT P",
    address: "Route de Bourg Madame 66800 Saillagouse",
    tel: null,
    email: null
  },
  items: [
    {
      description: "Terrasse planche 100m2",
      service: "PISTES",
      budgetType: "B29",
      isBudgeted: true,
      budgetIds: "B29-B36",
      gi: false,
      ger: false,
      invest: false,
      funct: true,
      referenceDevis: "1078898542",
      quantity: 1,
      unitPrice: 1794.36,
      price: 1794.36
    }
  ],
  total: {
    orderTotal: 1794.36,
    participationLivraison: 0,
    fraisFacturation: 0,
    other: 0,
    total: 1794.36
  },
  status: "EN_ATTENTE_VALIDATION",
  comment: "Ceci est un commentaire unique pour la demande.",
  signatureDemandeur: true,
  validationResponsable: true,
  files: {
    quotations: [
      {
        id: "file_123abc",
        name: "devis-pointp.pdf",
        timestamp: "2025-04-29T10:30:00Z"
      }
    ],
    bills: [
      {
        id: "file_123abc",
        name: "devis-pointp.pdf",
        timestamp: "2025-04-29T10:30:00Z"
      }
    ]
  }
}; 